"""
Thermal & Subsurface Hazard Processor for LUNA-SAFE
Models thermal inertia anomalies, subsurface fracture risks,
and cold-trap volatile hazards for planetary landers.
"""

import numpy as np
from scipy import ndimage


class ThermalProcessor:
    """
    Analyzes brightness temperature (Kelvin) and thermal inertia
    to identify subsurface boulders, fissures, and cold-trap hazards.
    """

    def __init__(self, baseline_temp_k: float = 220.0, nominal_range_k: tuple = (140.0, 320.0)):
        self.baseline_temp_k = float(baseline_temp_k)
        self.nominal_min_k, self.nominal_max_k = nominal_range_k

    def compute_thermal_gradient(self, thermal_map_k: np.ndarray, resolution_m: float = 5.0) -> np.ndarray:
        """
        Calculates horizontal thermal gradient |grad(T)| in K/m.
        Sharp gradients indicate subsurface density boundaries or buried rocks.
        """
        dT_dy, dT_dx = np.gradient(thermal_map_k, resolution_m, resolution_m)
        grad_mag = np.sqrt(dT_dx**2 + dT_dy**2)
        return grad_mag

    def compute_thermal_inertia_anomaly(self, thermal_map_k: np.ndarray) -> np.ndarray:
        """
        Measures deviation from local surrounding background temperature.
        High positive/negative deviation indicates non-regolith inclusions (rocks/voids/ice).
        """
        smoothed = ndimage.gaussian_filter(thermal_map_k, sigma=3.0)
        anomaly = np.abs(thermal_map_k - smoothed)
        return anomaly

    def compute_cold_trap_risk(self, thermal_map_k: np.ndarray) -> np.ndarray:
        """
        Permanently Shadowed Region (PSR) cold-trap risk:
        Extremely low temperatures (< 100K) create cryogenic embrittlement risk
        for landing thrusters and struts.
        """
        # Risk starts rising sharply below 120 K
        cold_risk = np.clip((120.0 - thermal_map_k) / 80.0, 0.0, 1.0)
        return cold_risk

    def analyze_region(self, thermal_map_k: np.ndarray, resolution_m: float = 5.0) -> dict:
        """
        Processes thermal field and computes normalized hazard score (0 to 1).
        """
        grad = self.compute_thermal_gradient(thermal_map_k, resolution_m)
        anomaly = self.compute_thermal_inertia_anomaly(thermal_map_k)
        cold_risk = self.compute_cold_trap_risk(thermal_map_k)

        # Normalized gradient hazard (slopes > 2.0 K/m are risky)
        grad_hazard = np.clip(grad / 2.5, 0.0, 1.0)

        # Normalized anomaly hazard (deviations > 15K)
        anomaly_hazard = np.clip(anomaly / 15.0, 0.0, 1.0)

        # Composite thermal/subsurface risk
        thermal_risk = np.clip(0.4 * grad_hazard + 0.4 * anomaly_hazard + 0.2 * cold_risk, 0.0, 1.0)

        return {
            "thermal_map": thermal_map_k,
            "gradient_map": grad,
            "anomaly_map": anomaly,
            "cold_risk_map": cold_risk,
            "thermal_risk": thermal_risk,
            "mean_temp_k": float(np.mean(thermal_map_k)),
            "min_temp_k": float(np.min(thermal_map_k)),
            "max_temp_k": float(np.max(thermal_map_k)),
            "mean_gradient": float(np.mean(grad)),
        }
