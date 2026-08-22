"""
Uncertainty Quantification Engine for LUNA-SAFE
Computes confidence intervals and error spreads driven by shadow occlusion,
model entropy, and sensor dropouts.
"""

from typing import List, Tuple
from schemas import ZoneCandidate


def confidence_interval(
    base_score: float,
    zone: ZoneCandidate,
    degraded_flags: List[str]
) -> Tuple[float, float, float, float]:
    """
    Computes confidence band spread and bounds.
    Returns: (confidence_low, confidence_high, spread_pct, confidence_pct)
    """
    spread = 0.04  # Baseline sensor precision uncertainty (4%)

    # Shadow occlusion widens the confidence band
    spread += zone.shadow_fraction * 0.16

    # Each degraded sensor expands the uncertainty interval
    spread += 0.10 * len(degraded_flags)

    # Local slope uncertainty if near limits
    if zone.slope_deg > 6.0:
        spread += 0.03

    spread = min(0.40, max(0.02, spread))

    low = max(0.0, base_score - spread)
    high = min(1.0, base_score + spread)
    spread_pct = round(spread * 100.0, 1)
    confidence_pct = round(max(10.0, min(98.0, (1.0 - spread) * 100.0)), 1)

    return round(low * 100.0, 1), round(high * 100.0, 1), spread_pct, confidence_pct
