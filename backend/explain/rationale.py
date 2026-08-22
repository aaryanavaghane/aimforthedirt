"""
Natural-Language Rationale Generator for LUNA-SAFE
Generates human-readable engineering explanations for flight crew and mission operations.
"""

from typing import List, Dict, Any
from schemas import ZoneCandidate, ZoneScore


def generate_rationale(
    zone: ZoneCandidate,
    score: float,
    flags: List[str],
    is_critical: bool = False,
    violations: List[str] = None
) -> str:
    """
    Synthesizes natural-language plain English engineering rationale for a candidate zone.
    """
    if is_critical or (violations and len(violations) > 0):
        v_text = ", ".join(violations) if violations else "Safety limits violated"
        return f"Zone {zone.zone_id} — CRITICAL RISK: {v_text} (Touchdown prohibited)."

    reasons = []

    if zone.hazard_density < 0.12 and zone.boulder_count == 0:
        reasons.append("pristine boulder-free terrain")
    elif zone.boulder_count > 0:
        reasons.append(f"{zone.boulder_count} surface boulder(s) detected")
    else:
        reasons.append("low crater density")

    if zone.slope_deg < 5.0:
        reasons.append(f"gentle {zone.slope_deg}° slope well within landing gear tipping limit")
    elif zone.slope_deg <= 8.5:
        reasons.append(f"moderate {zone.slope_deg}° slope within structural tolerance")
    else:
        reasons.append(f"elevated {zone.slope_deg}° slope")

    if zone.shadow_fraction > 0.15:
        reasons.append(f"{int(zone.shadow_fraction * 100)}% partial shadow occlusion expands confidence band")
    else:
        reasons.append("optimal solar illumination")

    if zone.thermal_anomaly > 0.35:
        reasons.append("subsurface thermal anomaly / cold-trap detected")

    if flags:
        reasons.append(f"degraded sensor mode active: {', '.join(flags)}")

    return f"Zone {zone.zone_id} — " + "; ".join(reasons) + "."
