"""
Moon-Image Verification Gate for LUNA-SAFE
Validates uploaded imagery to ensure it represents authentic lunar/Martian planetary terrain.
Rejects non-planetary images (e.g. parking lots, urban scenes, faces) before running perception models.
"""

import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any


class MoonVerifier:
    """
    Combines spectral chroma analysis, regolith texture entropy,
    and morphological crater heuristics to gate non-lunar image uploads.
    """

    def __init__(self, threshold: float = 0.70):
        self.threshold = threshold

    def verify_image(self, image_input: Any) -> Dict[str, Any]:
        """
        Verify if image is lunar/planetary surface terrain.
        Accepts PIL.Image, numpy BGR/RGB array, or file path.
        """
        if isinstance(image_input, str):
            img_bgr = cv2.imread(image_input)
            if img_bgr is None:
                return {
                    "is_moon_surface": False,
                    "confidence": 0.0,
                    "reason": "Invalid or corrupt image file.",
                    "metrics": {}
                }
        elif isinstance(image_input, Image.Image):
            img_rgb = np.array(image_input)
            img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR) if len(img_rgb.shape) == 3 else cv2.cvtColor(img_rgb, cv2.COLOR_GRAY2BGR)
        elif isinstance(image_input, np.ndarray):
            img_bgr = image_input
            if len(img_bgr.shape) == 2:
                img_bgr = cv2.cvtColor(img_bgr, cv2.COLOR_GRAY2BGR)
        else:
            return {
                "is_moon_surface": False,
                "confidence": 0.0,
                "reason": "Unsupported image format.",
                "metrics": {}
            }

        h, w = img_bgr.shape[:2]
        hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

        # 1. Color Saturation / Chroma Check
        # Lunar regolith is achromat (near-zero color saturation). Earth scenes have high saturation.
        saturation = hsv[:, :, 1].astype(float)
        mean_saturation = float(np.mean(saturation))
        high_saturation_fraction = float(np.sum(saturation > 65) / saturation.size)

        # 2. Vegetation Greenery Check (Excess Green Index)
        # ExG = 2*G - R - B. Highly positive in earth photos with grass/trees.
        b, g, r = cv2.split(img_bgr.astype(float))
        exg = 2.0 * g - r - b
        mean_exg = float(np.mean(exg))
        vegetation_present = mean_exg > 15.0

        # 3. Celestial Contrast & Shadow Ratio
        # Lunar surface has deep cast shadows and no atmospheric diffuse fill
        shadow_pixels = np.sum(gray < 30) / float(gray.size)
        midtones = np.sum((gray >= 30) & (gray <= 210)) / float(gray.size)

        # 4. Circular Crater / Ridge Morphology Heuristic
        blurred = cv2.GaussianBlur(gray, (9, 9), 2)
        circles = cv2.HoughCircles(
            blurred, cv2.HOUGH_GRADIENT, dp=1.2, minDist=30,
            param1=60, param2=30, minRadius=8, maxRadius=int(min(h, w) * 0.4)
        )
        crater_hits = len(circles[0]) if circles is not None else 0

        # 5. Texture Roughness / Laplacians
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        # Scoring Confidence
        confidence = 0.50

        # Penalize Earth-like saturation
        if high_saturation_fraction > 0.15:
            confidence -= 0.40
        elif mean_saturation < 25.0:
            confidence += 0.25

        # Penalize vegetation
        if vegetation_present:
            confidence -= 0.35

        # Reward crater morphology
        if crater_hits >= 1:
            confidence += min(0.20, 0.05 * crater_hits)

        # Check texture contrast
        if 20.0 < laplacian_var < 5000.0:
            confidence += 0.10

        confidence = max(0.01, min(0.99, round(confidence, 3)))
        is_moon = bool(confidence >= self.threshold)

        reason = (
            "Valid lunar/planetary terrain verified (low spectral chroma, typical regolith texture)."
            if is_moon
            else "REJECTED: Non-lunar image detected. High color saturation or terrestrial features present."
        )

        if vegetation_present:
            reason = "REJECTED: Terrestrial vegetation / photosynthetic signature detected."
        elif high_saturation_fraction > 0.20:
            reason = "REJECTED: High color saturation inconsistent with lunar regolith reflectance."

        return {
            "is_moon_surface": is_moon,
            "confidence": confidence,
            "reason": reason,
            "metrics": {
                "mean_saturation": round(mean_saturation, 1),
                "high_saturation_fraction": round(high_saturation_fraction, 3),
                "mean_exg_vegetation": round(mean_exg, 1),
                "shadow_ratio": round(shadow_pixels, 3),
                "crater_candidates": crater_hits,
                "texture_variance": round(laplacian_var, 1)
            }
        }
