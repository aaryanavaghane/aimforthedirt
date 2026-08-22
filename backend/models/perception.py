"""
Perception Layer for LUNA-SAFE
Performs coarse-to-fine optical analysis, YOLO crater/boulder detection,
and shadow/glare occlusion quantification.
"""

import os
import cv2
import numpy as np
from typing import List, Dict, Any, Tuple


class PerceptionModel:
    """
    Perception engine wrapping YOLO and multi-scale computer vision
    for lunar landing hazard detection.
    """

    CLASS_NAMES = {0: "crater", 1: "boulder"}

    def __init__(self, model_path: str = "yolov8n.pt", conf_threshold: float = 0.25):
        self.conf_threshold = conf_threshold
        self.model = None
        self.model_loaded = False

        if model_path and os.path.exists(model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(model_path)
                self.model_loaded = True
            except Exception as e:
                print(f"[Perception] Warning: could not load YOLO model: {e}")

    def detect_shadow_and_lighting(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """
        Detects optical occlusions:
        - Deep shadows (PSR / cast shadows: brightness < 28)
        - Solar specular glare (saturation: brightness > 240)
        """
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
        total_pixels = float(gray.size)

        shadow_mask = (gray < 28).astype(np.uint8)
        glare_mask = (gray > 240).astype(np.uint8)

        shadow_ratio = float(np.sum(shadow_mask) / total_pixels)
        glare_ratio = float(np.sum(glare_mask) / total_pixels)
        mean_brightness = float(np.mean(gray))

        # Lighting score: optimal between 80 and 180 brightness with low shadow/glare
        lighting_score = max(0.1, min(1.0, 1.0 - (shadow_ratio * 0.8 + glare_ratio * 0.6)))

        return {
            "shadow_mask": shadow_mask,
            "glare_mask": glare_mask,
            "shadow_ratio": round(shadow_ratio, 3),
            "glare_ratio": round(glare_ratio, 3),
            "lighting_score": round(lighting_score, 3),
            "mean_brightness": round(mean_brightness, 1),
        }

    def run_coarse_pass(self, image_bgr: np.ndarray, grid_divisions: int = 8) -> List[Dict[str, Any]]:
        """
        Coarse Pass: Rapid low-res scan across the entire scene to shortlist top candidate zones.
        """
        h, w = image_bgr.shape[:2]
        block_h = h // grid_divisions
        block_w = w // grid_divisions
        candidates = []

        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
        edges = cv2.Canny(gray, 60, 140)

        for row in range(grid_divisions):
            for col in range(grid_divisions):
                y1 = row * block_h
                y2 = min(h, (row + 1) * block_h)
                x1 = col * block_w
                x2 = min(w, (col + 1) * block_w)

                cx = (x1 + x2) / 2.0
                cy = (y1 + y2) / 2.0

                block_gray = gray[y1:y2, x1:x2]
                block_edges = edges[y1:y2, x1:x2]

                edge_density = float(np.mean(block_edges > 0)) if block_edges.size > 0 else 0.5
                shadow_frac = float(np.mean(block_gray < 28)) if block_gray.size > 0 else 0.0

                coarse_hazard = edge_density * 0.7 + shadow_frac * 0.3

                candidates.append({
                    "zone_id": f"Z_{row}_{col}",
                    "grid_pos": (row, col),
                    "bbox": [x1, y1, x2 - x1, y2 - y1],
                    "center": [cx, cy],
                    "center_norm": [round(cx / w, 3), round(cy / h, 3)],
                    "radius": min(block_w, block_h) * 0.42,
                    "coarse_hazard": round(coarse_hazard, 3),
                    "shadow_fraction": round(shadow_frac, 3),
                })

        # Sort ascending by coarse hazard (lower hazard is better)
        candidates.sort(key=lambda c: c["coarse_hazard"])
        # Return top 8 candidate zones
        return candidates[:8]

    def run_fine_pass(
        self,
        image_bgr: np.ndarray,
        candidates: List[Dict[str, Any]],
        optical_health: str = "healthy"
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], np.ndarray]:
        """
        Fine Pass: Executes high-resolution YOLO detection on shortlisted candidate regions,
        extracting crater/boulder density, shadow fractions, and detection confidences.
        """
        h, w = image_bgr.shape[:2]
        lighting = self.detect_shadow_and_lighting(image_bgr)
        detections = []
        confidences = []

        if optical_health == "offline":
            for idx, cand in enumerate(candidates):
                cand["hazard_density"] = 0.0
                cand["boulder_count"] = 0
                cand["crater_count"] = 0
                cand["shadow_fraction"] = lighting["shadow_ratio"]
                cand["lighting_score"] = lighting["lighting_score"]
            return candidates, [], np.zeros((h, w), dtype=float)

        # Run YOLO inference
        if self.model_loaded and self.model is not None:
            try:
                results = self.model(image_bgr, conf=self.conf_threshold, verbose=False)
                for r in results:
                    for box in r.boxes:
                        xyxy = box.xyxy[0].cpu().numpy().tolist()
                        conf = float(box.conf[0].cpu().numpy())
                        cls_id = int(box.cls[0].cpu().numpy())
                        cls_name = self.CLASS_NAMES.get(cls_id, "hazard")

                        detections.append({
                            "bbox": [round(x, 1) for x in xyxy],
                            "confidence": round(conf, 3),
                            "class_id": cls_id,
                            "class_name": cls_name,
                            "area_px": round((xyxy[2] - xyxy[0]) * (xyxy[3] - xyxy[1]), 1)
                        })
                        confidences.append(conf)
            except Exception as e:
                print(f"[Perception] YOLO inference failed: {e}")

        # Fallback CV feature detector if needed
        if len(detections) == 0:
            detections, confidences = self._heuristic_detector(image_bgr)

        # Degraded optical noise
        if optical_health == "degraded":
            for d in detections:
                d["confidence"] = max(0.15, round(d["confidence"] * 0.65, 3))
            confidences = [c * 0.65 for c in confidences]

        # Build full hazard density map
        hazard_mask = np.zeros((h, w), dtype=np.float32)
        for d in detections:
            x1, y1, x2, y2 = [int(v) for v in d["bbox"]]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            wgt = 1.0 if d["class_name"] == "boulder" else 0.85
            hazard_mask[y1:y2, x1:x2] += wgt * d["confidence"]

        hazard_density_map = cv2.GaussianBlur(hazard_mask, (21, 21), 0)
        max_d = np.max(hazard_density_map) if np.max(hazard_density_map) > 0 else 1.0
        hazard_density_map = np.clip(hazard_density_map / max_d, 0.0, 1.0)

        # Compute per-zone fine metrics
        zone_letters = ["A", "B", "C", "D", "E", "F", "G", "H"]
        for idx, cand in enumerate(candidates):
            letter = zone_letters[idx] if idx < len(zone_letters) else f"Z{idx+1}"
            cand["zone_id"] = letter
            cand["name"] = f"Zone {letter}"

            cx, cy = cand["center"]
            radius = cand["radius"]

            # Count obstacles in this zone
            z_boulders = 0
            z_craters = 0
            for det in detections:
                bx1, by1, bx2, by2 = det["bbox"]
                bcx, bcy = (bx1 + bx2) / 2.0, (by1 + by2) / 2.0
                if np.sqrt((bcx - cx)**2 + (bcy - cy)**2) <= radius * 1.15:
                    if det["class_name"] == "boulder":
                        z_boulders += 1
                    else:
                        z_craters += 1

            # Extract local hazard density
            x_min, x_max = max(0, int(cx - radius)), min(w, int(cx + radius))
            y_min, y_max = max(0, int(cy - radius)), min(h, int(cy + radius))
            z_hden = hazard_density_map[y_min:y_max, x_min:x_max]
            mean_hden = float(np.mean(z_hden)) if z_hden.size > 0 else 0.2

            # Extract local shadow
            z_shadow = lighting["shadow_mask"][y_min:y_max, x_min:x_max]
            z_shadow_frac = float(np.mean(z_shadow)) if z_shadow.size > 0 else 0.0

            cand["hazard_density"] = round(min(1.0, mean_hden * 0.7 + (z_boulders * 0.08 + z_craters * 0.05)), 3)
            cand["boulder_count"] = z_boulders
            cand["crater_count"] = z_craters
            cand["shadow_fraction"] = round(z_shadow_frac, 3)
            cand["lighting_score"] = lighting["lighting_score"]

        return candidates, detections, hazard_density_map

    def _heuristic_detector(self, image_bgr: np.ndarray) -> Tuple[List[dict], List[float]]:
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
        h, w = gray.shape
        detections = []
        confidences = []

        # Circular Hough for craters
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)
        circles = cv2.HoughCircles(
            blurred, cv2.HOUGH_GRADIENT, dp=1.2, minDist=30,
            param1=60, param2=30, minRadius=10, maxRadius=int(min(h, w) * 0.4)
        )
        if circles is not None:
            for c in circles[0, :]:
                cx, cy, r = int(c[0]), int(c[1]), int(c[2])
                conf = min(0.92, max(0.45, 0.75 - (r / max(h, w)) * 0.2))
                detections.append({
                    "bbox": [float(max(0, cx - r)), float(max(0, cy - r)), float(min(w, cx + r)), float(min(h, cy + r))],
                    "confidence": round(conf, 3),
                    "class_id": 0,
                    "class_name": "crater",
                    "area_px": round(np.pi * (r**2), 1)
                })
                confidences.append(conf)

        # Canny + Contours for boulders
        edges = cv2.Canny(gray, 70, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 40 < area < 4000:
                x, y, bw, bh = cv2.boundingRect(cnt)
                aspect = bw / float(bh)
                if 0.4 < aspect < 2.5:
                    conf = min(0.90, max(0.40, 0.65 + (area / 4000.0) * 0.25))
                    detections.append({
                        "bbox": [float(x), float(y), float(x + bw), float(y + bh)],
                        "confidence": round(conf, 3),
                        "class_id": 1,
                        "class_name": "boulder",
                        "area_px": round(area, 1)
                    })
                    confidences.append(conf)

        return detections[:40], confidences[:40]
