"""
Sensor Manager & Graceful Degradation State Machine for LUNA-SAFE
Simulates sensor dropouts, dynamically re-normalizes weights,
and flags confidence reductions without silent failures.
"""

from typing import Dict, List, Tuple


class SensorManager:
    """
    Manages operational status of multi-modal sensors and handles dynamic weight redistribution.
    """

    def __init__(self):
        self.status = {
            "optical": "healthy",
            "dem": "healthy",
            "thermal": "healthy"
        }

    def simulate_dropout(self, sensor: str, level: str = "offline"):
        """
        Simulate sensor failure or degraded data feed.
        """
        if sensor in self.status:
            self.status[sensor] = level

    def reset(self):
        """
        Reset all sensors to healthy state.
        """
        self.status = {
            "optical": "healthy",
            "dem": "healthy",
            "thermal": "healthy"
        }

    def get_active_weights(self, base_weights: Dict[str, float]) -> Tuple[Dict[str, float], List[str]]:
        """
        Redistributes weights proportionally away from degraded/offline sensors.
        Returns: (active_weights, degradation_flags)
        """
        flags = []
        weights = base_weights.copy()

        # Check health states and scale/remove weights
        if self.status["optical"] == "degraded":
            flags.append("optical_degraded")
            weights["hazard"] = weights.get("hazard", 0.30) * 0.45
            weights["lighting"] = weights.get("lighting", 0.15) * 0.50
        elif self.status["optical"] == "offline":
            flags.append("optical_dropout")
            weights["hazard"] = 0.0
            weights["lighting"] = 0.0

        if self.status["dem"] == "degraded":
            flags.append("dem_degraded")
            weights["slope"] = weights.get("slope", 0.30) * 0.45
            weights["roughness"] = weights.get("roughness", 0.15) * 0.45
        elif self.status["dem"] == "offline":
            flags.append("dem_dropout")
            weights["slope"] = 0.05
            weights["roughness"] = 0.05

        if self.status["thermal"] == "offline":
            flags.append("thermal_dropout")
            weights["thermal"] = 0.0

        # Renormalize active weights to sum to 1.0
        total = sum(weights.values())
        if total <= 0:
            active_weights = {k: 1.0 / len(weights) for k in weights}
        else:
            active_weights = {k: round(v / total, 4) for k, v in weights.items()}

        return active_weights, flags
