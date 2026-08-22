"""
Optical Perception & YOLO Hazard Detector for LUNA-SAFE
Performs crater and boulder detection, shadow/glare occlusion mapping,
and model detection confidence analysis.
"""

import os
import cv2
import numpy as np


class YOLOHazardDetector:
    """
    Optical sensor processing layer detecting lunar/Martian craters and boulders,
    evaluating shadow/glare occlusions, and quantifying perception uncertainty.
    """

    CLASS_NAMES = {0: "crater", 1: "boulder"}

    def __init__(self, model_path: str = None, conf_threshold: float = 0.25):
        self.conf_threshold = conf_threshold
        self.model = None
        self.model_loaded = False

        if model_path and os.path.exists(model_path):
            try:
                from ultralytics import YOLO
                self.model = YOLO(model_path)
                self.model_loaded = True
                print(f"[YOLO] Loaded model weights from {model_path}")
            except Exception as e:
                print(f"[YOLO] Warning: could not load model from {model_path}: {e}")

    def detect_shadow_and_glare(self, image_bgr: np.ndarray) -> dict:
        """
        Analyze lighting conditions:
        - Deep shadows (PSR or terrain occlusions: pixel brightness < 25)
        - Solar specular glare (saturation: pixel brightness > 245)
        """
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
        total_pixels = float(gray.size)

        shadow_mask = (gray < 28).astype(np.uint8)
        glare_mask = (gray > 240).astype(np.uint8)

        shadow_ratio = float(np.sum(shadow_mask) / total_pixels)
        glare_ratio = float(np.sum(glare_mask) / total_pixels)
        occlusion_ratio = min(1.0, shadow_ratio + glare_ratio)

        return {
            "shadow_mask": shadow_mask,
            "glare_mask": glare_mask,
            "shadow_ratio": shadow_ratio,
            "glare_ratio": glare_ratio,
            "occlusion_ratio": occlusion_ratio,
            "mean_brightness": float(np.mean(gray)),
        }

    def detect_hazards(self, image_bgr: np.ndarray, optical_health: str = "healthy") -> dict:
        """
        Detect craters and boulders in optical imagery.
        optical_health can be 'healthy', 'degraded' (dust/glare), or 'offline'.
        """
        h, w = image_bgr.shape[:2]
        lighting = self.detect_shadow_and_glare(image_bgr)

        if optical_health == "offline":
            return {
                "detections": [],
                "crater_count": 0,
                "boulder_count": 0,
                "total_hazard_count": 0,
                "hazard_density_map": np.zeros((h, w), dtype=float),
                "hazard_coverage_ratio": 0.0,
                "mean_confidence": 0.0,
                "confidence_entropy": 1.0,
                "lighting": lighting,
                "sensor_status": "offline",
            }

        detections = []
        confidences = []

        # If YOLO model is loaded, run inference
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
                print(f"[YOLO] Inference error: {e}, falling back to computer vision detector")

        # Fallback / heuristic multi-scale feature detector if YOLO had 0 detections or wasn't loaded
        if len(detections) == 0:
            detections, confidences = self._heuristic_lunar_detector(image_bgr, lighting)

        # If optical sensor is degraded (e.g. dust or sensor noise), reduce confidence and add noise
        if optical_health == "degraded":
            for d in detections:
                d["confidence"] = max(0.15, round(d["confidence"] * 0.65, 3))
            confidences = [c * 0.65 for c in confidences]

        # Calculate hazard density map
        hazard_mask = np.zeros((h, w), dtype=np.float32)
        crater_count = 0
        boulder_count = 0

        for d in detections:
            x1, y1, x2, y2 = [int(v) for v in d["bbox"]]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            weight = 1.0 if d["class_name"] == "boulder" else 0.85
            hazard_mask[y1:y2, x1:x2] += weight * d["confidence"]

            if d["class_name"] == "crater":
                crater_count += 1
            else:
                boulder_count += 1

        # Smooth hazard density
        hazard_density_map = cv2.GaussianBlur(hazard_mask, (21, 21), 0)
        max_density = np.max(hazard_density_map) if np.max(hazard_density_map) > 0 else 1.0
        hazard_density_map = np.clip(hazard_density_map / max_density, 0.0, 1.0)

        total_area = h * w
        hazard_pixels = np.count_nonzero(hazard_mask > 0.1)
        hazard_coverage_ratio = float(hazard_pixels / total_area)

        mean_conf = float(np.mean(confidences)) if confidences else 0.5
        # Confidence entropy (uncertainty in detection confidence)
        conf_entropy = float(np.std(confidences)) if len(confidences) > 1 else 0.2

        return {
            "detections": detections,
            "crater_count": crater_count,
            "boulder_count": boulder_count,
            "total_hazard_count": len(detections),
            "hazard_density_map": hazard_density_map,
            "hazard_coverage_ratio": hazard_coverage_ratio,
            "mean_confidence": mean_conf,
            "confidence_entropy": conf_entropy,
            "lighting": lighting,
            "sensor_status": optical_health,
        }

    def _heuristic_lunar_detector(self, image_bgr: np.ndarray, lighting: dict) -> tuple:
        """
        Heuristic planetary surface feature detector using circular Hough transforms
        and morphological edge segmentation for craters and high-contrast rocks.
        """
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY) if len(image_bgr.shape) == 3 else image_bgr
        h, w = gray.shape
        detections = []
        confidences = []

        # 1. Crater detection via circular Hough Transform
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)
        circles = cv2.HoughCircles(
            blurred, cv2.HOUGH_GRADIENT, dp=1.2, minDist=30,
            param1=60, param2=30, minRadius=10, maxRadius=int(min(h, w) * 0.4)
        )

        if circles is not None:
            circles = np.uint16(np.around(circles))
            for c in circles[0, :]:
                cx, cy, r = int(c[0]), int(c[1]), int(c[2])
                x1, y1 = max(0, cx - r), max(0, cy - r)
                x2, y2 = min(w, cx + r), min(h, cy + r)
                conf = min(0.95, max(0.45, 0.75 - (r / max(h, w)) * 0.2))
                detections.append({
                    "bbox": [float(x1), float(y1), float(x2), float(y2)],
                    "confidence": round(conf, 3),
                    "class_id": 0,
                    "class_name": "crater",
                    "area_px": round(np.pi * (r**2), 1)
                })
                confidences.append(conf)

        # 2. Boulder detection via high-gradient blob segmentation
        # Boulders show strong cast shadows adjacent to high specular rims
        edges = cv2.Canny(gray, 70, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            if 40 < area < 4000:
                x, y, bw, bh = cv2.boundingRect(cnt)
                aspect = bw / float(bh)
                if 0.4 < aspect < 2.5:
                    conf = min(0.92, max(0.40, 0.65 + (area / 4000.0) * 0.25))
                    detections.append({
                        "bbox": [float(x), float(y), float(x + bw), float(y + bh)],
                        "confidence": round(conf, 3),
                        "class_id": 1,
                        "class_name": "boulder",
                        "area_px": round(area, 1)
                    })
                    confidences.append(conf)

        return detections[:50], confidences[:50]
