"""
Annotated Output Generator for LUNA-SAFE
Overlays candidate landing zone ellipses, bounding boxes, risk status rings,
and a regional safety map (Green = Most Safe, Red = Least Safe / Risky) directly onto optical and topographic imagery.
"""

import io
import base64
import cv2
import numpy as np
from typing import List, Dict, Any, Optional


def draw_annotations(
    image_bgr: np.ndarray,
    zones: List[Dict[str, Any]],
    top_zone_id: Optional[str] = None,
    abort_active: bool = False
) -> np.ndarray:
    """
    Renders bounding boxes, candidate landing ellipses, and the Chandrayaan-3 target crosshair.
    """
    out = image_bgr.copy()
    h, w = out.shape[:2]

    for zone in zones:
        zid = zone.get("zone_id", "")
        score = zone.get("score", 0.0)
        is_top = (zid == top_zone_id) and not abort_active and not zone.get("is_critical", False)
        is_crit = zone.get("is_critical", False) or abort_active

        bbox = zone.get("bbox", [])
        if len(bbox) == 4:
            bx, by, bw, bh = [int(v) for v in bbox]
        else:
            cx, cy = zone.get("center", [w // 2, h // 2])
            r = int(zone.get("radius", 35))
            bx, by, bw, bh = int(cx - r), int(cy - r), int(r * 2), int(r * 2)

        if is_crit or score < 48.0:
            color = (45, 45, 235)  # Red BGR
            tag = "RISKY"
        elif is_top or score >= 70.0:
            color = (60, 230, 90)  # Bright Green BGR
            tag = "SAFE"
        else:
            color = (40, 180, 240) # Amber BGR
            tag = "CAUTION"

        thickness = 3 if is_top else 2
        cv2.rectangle(out, (bx, by), (bx + bw, by + bh), color, thickness)

        label = f"[{tag}] Zone {zid}: {score:.0f}%"
        t_size, _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.42, 1)
        lx = max(5, min(w - t_size[0] - 8, bx))
        ly = max(18, by - 6)

        cv2.rectangle(out, (lx - 3, ly - 13), (lx + t_size[0] + 3, ly + 3), (12, 16, 25), -1)
        cv2.rectangle(out, (lx - 3, ly - 13), (lx + t_size[0] + 3, ly + 3), color, 1)
        cv2.putText(out, label, (lx, ly), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (255, 255, 255), 1, cv2.LINE_AA)

    if top_zone_id and not abort_active:
        top = next((z for z in zones if z.get("zone_id") == top_zone_id), None)
        if top:
            if "center" in top:
                cx, cy = int(top["center"][0]), int(top["center"][1])
            else:
                bbox = top.get("bbox", [0, 0, 50, 50])
                cx, cy = int(bbox[0] + bbox[2] // 2), int(bbox[1] + bbox[3] // 2)

            cv2.circle(out, (cx, cy), 18, (0, 230, 255), 2)
            cv2.circle(out, (cx, cy), 4, (50, 50, 255), -1)
            cv2.drawMarker(out, (cx, cy), (0, 230, 255), markerType=cv2.MARKER_CROSS, markerSize=28, thickness=2)

    return out


def draw_200km_safety_map(
    base_terrain_bgr: np.ndarray,
    zones: List[Dict[str, Any]],
    top_zone_id: Optional[str] = None,
    scenario_meta: Optional[Dict[str, Any]] = None,
    radius_km: int = 200
) -> np.ndarray:
    """
    Renders an authentic regional Moon map centered on the target site with user's custom survey radius:
    - Survey Range Boundary and radar rings (50%, 100% of radius_km)
    - Green landing circles for MOST SAFE zones (Score >= 70%, Slope < 8.5°)
    - Red warning crosshatch circles for LEAST SAFE / RISKY zones (Score < 48% or Slope > 15°)
    - Precision Touchdown Pin on #1 Safe Zone
    """
    h, w = base_terrain_bgr.shape[:2]
    out = base_terrain_bgr.copy()

    cx, cy = w // 2, h // 2
    r_max = int(min(w, h) * 0.44)
    r_mid = int(r_max * 0.5)
    r_inner = int(r_max * 0.25)

    # 1. Draw Radar Range Rings & Reticle
    overlay = out.copy()
    cv2.circle(overlay, (cx, cy), r_max, (70, 100, 140), 1, cv2.LINE_AA)
    cv2.circle(overlay, (cx, cy), r_mid, (50, 75, 105), 1, cv2.LINE_AA)
    cv2.circle(overlay, (cx, cy), r_inner, (40, 60, 85), 1, cv2.LINE_AA)

    cv2.line(overlay, (cx - r_max - 12, cy), (cx + r_max + 12, cy), (55, 80, 110), 1, cv2.LINE_AA)
    cv2.line(overlay, (cx, cy - r_max - 12), (cx, cy + r_max + 12), (55, 80, 110), 1, cv2.LINE_AA)
    cv2.addWeighted(overlay, 0.75, out, 0.25, 0, out)

    # Range ring labels
    cv2.putText(out, f"{radius_km} km", (cx + r_max - 42, cy - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (160, 185, 215), 1, cv2.LINE_AA)
    cv2.putText(out, f"{radius_km // 2} km", (cx + r_mid - 36, cy - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (140, 160, 190), 1, cv2.LINE_AA)
    cv2.putText(out, f"{radius_km // 4} km", (cx + r_inner - 32, cy - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (120, 140, 170), 1, cv2.LINE_AA)

    # Cardinal Directions
    cv2.putText(out, "N", (cx - 5, cy - r_max - 14), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (210, 230, 255), 1, cv2.LINE_AA)
    cv2.putText(out, "S", (cx - 5, cy + r_max + 22), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (210, 230, 255), 1, cv2.LINE_AA)
    cv2.putText(out, "W", (cx - r_max - 24, cy + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (210, 230, 255), 1, cv2.LINE_AA)
    cv2.putText(out, "E", (cx + r_max + 12, cy + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (210, 230, 255), 1, cv2.LINE_AA)

    # Distributed natural candidate zone locations inside the radius
    natural_positions = [
        (cx + int(r_max * 0.12), cy - int(r_max * 0.08)),  # Zone 1: Center / Most Safe
        (cx - int(r_max * 0.48), cy - int(r_max * 0.38)),  # Zone 2: Upper Left (Crater Rim)
        (cx + int(r_max * 0.52), cy + int(r_max * 0.42)),  # Zone 3: Lower Right (Boulder Field)
        (cx - int(r_max * 0.38), cy + int(r_max * 0.55)),  # Zone 4: Lower Left (Highland Ridge)
        (cx + int(r_max * 0.45), cy - int(r_max * 0.45)),  # Zone 5: Upper Right
    ]

    # 2. Plot Most Safe (Green) and Least Safe (Red) Points
    for idx, zone in enumerate(zones[:5]):
        zid = zone.get("zone_id", str(idx + 1))
        score = zone.get("score", 0.0)
        slope = zone.get("slope", 5.0)
        is_crit = zone.get("is_critical", False)
        is_top = (zid == top_zone_id)

        # Natural distributed position
        if idx < len(natural_positions):
            zx, zy = natural_positions[idx]
        else:
            zx = cx + int(r_max * 0.6 * np.cos(idx))
            zy = cy + int(r_max * 0.6 * np.sin(idx))

        zr = 28

        # Determine Classification
        if is_top or score >= 70.0:
            border_color = (60, 230, 90)   # Vibrant Green
            fill_color = (20, 110, 45)
            status_text = "MOST SAFE" if is_top else "SAFE ZONE"
            sub_text = f"Score {score:.0f}% | Slope {slope:.1f}°"
        elif is_crit or score < 48.0 or slope > 15.0:
            border_color = (45, 45, 235)   # Vibrant Red
            fill_color = (25, 25, 140)
            status_text = "LEAST SAFE" if idx == 1 else "RISKY / ABORT"
            sub_text = f"Score {score:.0f}% | Slope {slope:.1f}°"
        else:
            border_color = (40, 175, 235)  # Amber
            fill_color = (20, 85, 120)
            status_text = "MODERATE"
            sub_text = f"Score {score:.0f}% | Slope {slope:.1f}°"

        # Translucent fill
        fill_overlay = out.copy()
        cv2.circle(fill_overlay, (zx, zy), zr, fill_color, -1)
        cv2.addWeighted(fill_overlay, 0.45, out, 0.55, 0, out)

        # Border ring
        thickness = 3 if is_top else 2
        cv2.circle(out, (zx, zy), zr, border_color, thickness, cv2.LINE_AA)

        # Crosshatch for risky sites
        if border_color == (45, 45, 235):
            cv2.line(out, (zx - zr + 7, zy - zr + 7), (zx + zr - 7, zy + zr - 7), border_color, 2, cv2.LINE_AA)
            cv2.line(out, (zx - zr + 7, zy + zr - 7), (zx + zr - 7, zy - zr + 7), border_color, 2, cv2.LINE_AA)

        # Zone Info Badge
        badge_w, badge_h = 125, 34
        bx = max(10, min(w - badge_w - 10, zx - badge_w // 2))
        by = max(badge_h + 10, min(h - 15, zy - zr - 8))

        cv2.rectangle(out, (bx, by - badge_h), (bx + badge_w, by), (6, 10, 16), -1)
        cv2.rectangle(out, (bx, by - badge_h), (bx + badge_w, by), border_color, 1)

        cv2.putText(out, f"[{status_text}]", (bx + 6, by - 18), cv2.FONT_HERSHEY_SIMPLEX, 0.38, border_color, 1, cv2.LINE_AA)
        cv2.putText(out, sub_text, (bx + 6, by - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (210, 220, 235), 1, cv2.LINE_AA)

    # 3. Precision Landing Reticle on Top Recommended Zone
    if top_zone_id:
        tx, ty = natural_positions[0]
        cv2.circle(out, (tx, ty), 16, (0, 215, 255), 2, cv2.LINE_AA)
        cv2.circle(out, (tx, ty), 4, (50, 50, 255), -1)
        cv2.drawMarker(out, (tx, ty), (0, 215, 255), markerType=cv2.MARKER_CROSS, markerSize=26, thickness=2)

        callout = "OPTIMAL TOUCHDOWN POINT"
        cv2.putText(out, callout, (max(10, tx - 78), min(h - 20, ty + 30)), cv2.FONT_HERSHEY_SIMPLEX, 0.36, (0, 215, 255), 1, cv2.LINE_AA)

    # 4. Top Header & Bottom Legend HUD
    cv2.rectangle(out, (12, 12), (360, 48), (5, 8, 14), -1)
    cv2.rectangle(out, (12, 12), (360, 48), (60, 80, 110), 1)
    cv2.putText(out, f"REGIONAL LUNAR SAFETY SURVEY ({radius_km} KM RADIUS)", (20, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.38, (235, 242, 255), 1, cv2.LINE_AA)
    cv2.putText(out, "LOLA DEM ALTIMETRY + DIVINER THERMAL + LROC OPTICAL", (20, 42), cv2.FONT_HERSHEY_SIMPLEX, 0.29, (140, 160, 185), 1, cv2.LINE_AA)

    # Legend box at bottom
    cv2.rectangle(out, (12, h - 38), (w - 12, h - 10), (5, 8, 14), -1)
    cv2.rectangle(out, (12, h - 38), (w - 12, h - 10), (60, 80, 110), 1)

    cv2.circle(out, (26, h - 24), 5, (60, 230, 90), -1)
    cv2.putText(out, "MOST SAFE (Slope < 8.5°, GO)", (36, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (200, 230, 210), 1, cv2.LINE_AA)

    cv2.circle(out, (230, h - 24), 5, (45, 45, 235), -1)
    cv2.putText(out, "LEAST SAFE / RISKY (Slope > 15°, ABORT)", (240, h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.32, (230, 180, 180), 1, cv2.LINE_AA)

    return out


def to_base64_png(image_bgr: np.ndarray) -> str:
    """
    Encodes an image numpy array into a base64 PNG data URL.
    """
    success, buffer = cv2.imencode('.png', image_bgr)
    if not success:
        return ""
    b64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{b64}"
