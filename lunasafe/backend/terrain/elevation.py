"""
Elevation and Terrain Analysis for LUNA-SAFE
Deterministic geospatial processing computing slope gradients and roughness
from Lunar LOLA / Martian DEMs without ML.
"""

import numpy as np
from scipy import ndimage
from typing import Tuple, Dict, Any, List


class ElevationProcessor:
    """
    Deterministic terrain analysis computing slope, roughness (TRI, variance),
    and landing gear tilt limits.
    """

    def __init__(self, resolution_meters: float = 5.0, max_safe_slope_deg: float = 8.5):
        self.resolution = float(resolution_meters)
        self.max_safe_slope_deg = float(max_safe_slope_deg)

    def compute_slope(self, dem: np.ndarray, smooth_sigma: float = 1.0) -> np.ndarray:
        """
        Compute topographic slope in degrees using 2D finite differences.
        Slope = arctan( sqrt( (dz/dx)^2 + (dz/dy)^2 ) )
        """
        smoothed = ndimage.gaussian_filter(dem, sigma=smooth_sigma) if smooth_sigma > 0 else dem
        dz_dy, dz_dx = np.gradient(smoothed, self.resolution, self.resolution)
        gradient_magnitude = np.sqrt(dz_dx**2 + dz_dy**2)
        slope_rad = np.arctan(gradient_magnitude)
        return np.degrees(slope_rad)

    def compute_roughness_tri(self, dem: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """
        Terrain Ruggedness Index (TRI): Mean absolute difference from local neighborhood mean.
        """
        mean_local = ndimage.uniform_filter(dem, size=kernel_size, mode='reflect')
        return np.abs(dem - mean_local)

    def compute_elevation_variance(self, dem: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """
        Local elevation standard deviation / variance as roughness proxy.
        """
        mean = ndimage.uniform_filter(dem, size=kernel_size, mode='reflect')
        mean_sq = ndimage.uniform_filter(dem**2, size=kernel_size, mode='reflect')
        variance = np.maximum(mean_sq - mean**2, 0.0)
        return np.sqrt(variance)

    def analyze_dem(self, dem: np.ndarray) -> Dict[str, Any]:
        """
        Computes complete elevation rasters for a DEM tile.
        """
        slope_map = self.compute_slope(dem, smooth_sigma=1.0)
        tri_map = self.compute_roughness_tri(dem, kernel_size=5)
        var_map = self.compute_elevation_variance(dem, kernel_size=5)

        slope_hazard = np.clip(slope_map / self.max_safe_slope_deg, 0.0, 1.5)
        slope_hazard = np.minimum(1.0, slope_hazard**1.3)

        roughness_hazard = np.clip(tri_map / 2.5, 0.0, 1.0)

        return {
            "dem": dem,
            "slope_map": slope_map,
            "tri_map": tri_map,
            "var_map": var_map,
            "slope_hazard": slope_hazard,
            "roughness_hazard": roughness_hazard,
            "mean_slope": float(np.mean(slope_map)),
            "max_slope": float(np.percentile(slope_map, 98)),
            "mean_tri": float(np.mean(tri_map)),
            "elevation_min": float(np.min(dem)),
            "elevation_max": float(np.max(dem)),
        }

    def populate_zone_elevation(
        self,
        candidates: List[Dict[str, Any]],
        dem_analysis: Dict[str, Any],
        dem_health: str = "healthy"
    ) -> List[Dict[str, Any]]:
        """
        Extracts slope and roughness specifically for each candidate zone.
        """
        slope_map = dem_analysis["slope_map"]
        tri_map = dem_analysis["tri_map"]
        h, w = slope_map.shape

        for cand in candidates:
            cx, cy = cand["center"]
            radius = cand["radius"]

            x_min, x_max = max(0, int(cx - radius)), min(w, int(cx + radius))
            y_min, y_max = max(0, int(cy - radius)), min(h, int(cy + radius))

            yy, xx = np.ogrid[y_min:y_max, x_min:x_max]
            mask = np.sqrt((xx - (cx - x_min))**2 + (yy - (cy - y_min))**2) <= radius

            z_slopes = slope_map[y_min:y_max, x_min:x_max]
            z_slopes_vals = z_slopes[mask] if np.any(mask) else z_slopes.flatten()

            z_tri = tri_map[y_min:y_max, x_min:x_max]
            z_tri_vals = z_tri[mask] if np.any(mask) else z_tri.flatten()

            mean_s = float(np.mean(z_slopes_vals)) if len(z_slopes_vals) > 0 else 5.0
            peak_s = float(np.percentile(z_slopes_vals, 95)) if len(z_slopes_vals) > 0 else mean_s
            mean_tri = float(np.mean(z_tri_vals)) if len(z_tri_vals) > 0 else 0.5

            if dem_health == "degraded":
                mean_s += np.random.uniform(-0.5, 0.8)

            cand["slope_deg"] = round(mean_s, 1)
            cand["max_slope_deg"] = round(peak_s, 1)
            cand["roughness"] = round(min(1.0, mean_tri / 2.5), 3)

        return candidates
