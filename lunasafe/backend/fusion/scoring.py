"""
Transparent Multi-Criteria Scoring Engine for LUNA-SAFE
Computes deterministic, inspectable safety scores combining
Optical hazards, DEM slope & roughness, and thermal radiometry.
"""

from typing import Dict, Any, Tuple
from schemas import ZoneCandidate


def score_zone(zone: ZoneCandidate, weights: Dict[str, float]) -> Tuple[float, Dict[str, float]]:
    """
    Transparent weighted sum scoring formula.
    Higher score is better (1.0 = optimal safe touchdown, 0.0 = extreme hazard).
    """
    # Invert hazards so 1.0 is safest
    h_term = weights.get("hazard", 0.30) * (1.0 - zone.hazard_density)
    s_term = weights.get("slope", 0.30) * (1.0 - min(zone.slope_deg / 25.0, 1.0))
    r_term = weights.get("roughness", 0.15) * (1.0 - min(zone.roughness, 1.0))
    t_term = weights.get("thermal", 0.15) * (1.0 - min(zone.thermal_anomaly, 1.0))
    l_term = weights.get("lighting", 0.10) * zone.lighting_score
    f_term = weights.get("fuel", 0.00) * (1.0 - min(zone.fuel_cost, 1.0))
    sci_term = weights.get("science", 0.00) * min(zone.science_value, 1.0)

    raw_score = h_term + s_term + r_term + t_term + l_term + f_term + sci_term
    final_score = max(0.0, min(1.0, raw_score))

    breakdown = {
        "hazard_contrib_pct": round(h_term * 100.0, 1),
        "slope_contrib_pct": round(s_term * 100.0, 1),
        "roughness_contrib_pct": round(r_term * 100.0, 1),
        "thermal_contrib_pct": round(t_term * 100.0, 1),
        "lighting_contrib_pct": round(l_term * 100.0, 1),
    }

    return final_score, breakdown
