"""
DEM Processor Module for LUNA-SAFE
Deterministic, auditable elevation analysis computing slope, roughness (TRI, VRM),
and landing gear slope safety limits using standard geospatial mathematics.
"""

import numpy as np
from scipy import ndimage


class DEMProcessor:
    """
    Processes Digital Elevation Model (DEM) grids to calculate slope,
    roughness indices, and terrain hazard scores.
    """

    def __init__(self, resolution_meters: float = 5.0, max_safe_slope_deg: float = 8.5):
        """
        :param resolution_meters: Ground sampling distance (GSD) per pixel in meters.
        :param max_safe_slope_deg: Maximum slope tolerated by landing gear before tipping.
        """
        self.resolution = float(resolution_meters)
        self.max_safe_slope_deg = float(max_safe_slope_deg)

    def compute_slope(self, dem: np.ndarray, smooth_sigma: float = 1.0) -> np.ndarray:
        """
        Compute topographic slope in degrees using 2D finite-difference gradient.
        Slope = arctan( sqrt( (dz/dx)^2 + (dz/dy)^2 ) )
        Pre-smoothed to suppress high-frequency sensor noise spikes.
        """
        smoothed_dem = ndimage.gaussian_filter(dem, sigma=smooth_sigma) if smooth_sigma > 0 else dem
        dz_dy, dz_dx = np.gradient(smoothed_dem, self.resolution, self.resolution)
        gradient_magnitude = np.sqrt(dz_dx**2 + dz_dy**2)
        slope_rad = np.arctan(gradient_magnitude)
        slope_deg = np.degrees(slope_rad)
        return slope_deg

    def compute_roughness_tri(self, dem: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """
        Terrain Ruggedness Index (TRI):
        Mean absolute difference between central cell and surrounding neighbors.
        """
        mean_local = ndimage.uniform_filter(dem, size=kernel_size, mode='reflect')
        tri = np.abs(dem - mean_local)
        return tri

    def compute_elevation_std(self, dem: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """
        Compute standard deviation of elevation in a moving window.
        """
        mean = ndimage.uniform_filter(dem, size=kernel_size, mode='reflect')
        mean_sq = ndimage.uniform_filter(dem**2, size=kernel_size, mode='reflect')
        variance = np.maximum(mean_sq - mean**2, 0)
        return np.sqrt(variance)

    def compute_vrm(self, dem: np.ndarray, kernel_size: int = 5) -> np.ndarray:
        """
        Vector Ruggedness Measure (VRM):
        Quantifies terrain roughness independent of overall slope by measuring
        dispersion of unit surface normal vectors.
        """
        dz_dy, dz_dx = np.gradient(dem, self.resolution, self.resolution)
        nx = -dz_dx
        ny = -dz_dy
        nz = np.ones_like(dem)
        mag = np.sqrt(nx**2 + ny**2 + nz**2)
        nx /= mag
        ny /= mag
        nz /= mag

        sx = ndimage.uniform_filter(nx, size=kernel_size, mode='reflect')
        sy = ndimage.uniform_filter(ny, size=kernel_size, mode='reflect')
        sz = ndimage.uniform_filter(nz, size=kernel_size, mode='reflect')

        r_mag = np.sqrt(sx**2 + sy**2 + sz**2)
        vrm = 1.0 - r_mag
        return np.clip(vrm * 10.0, 0.0, 1.0)

    def analyze_region(self, dem: np.ndarray) -> dict:
        """
        Perform complete elevation analysis on a DEM grid.
        Returns metrics and normalized difficulty maps.
        """
        slope_map = self.compute_slope(dem, smooth_sigma=1.0)
        tri_map = self.compute_roughness_tri(dem)
        elev_std_map = self.compute_elevation_std(dem)
        vrm_map = self.compute_vrm(dem)

        slope_hazard = np.clip(slope_map / self.max_safe_slope_deg, 0.0, 1.5)
        slope_hazard = np.minimum(1.0, slope_hazard**1.3)

        roughness_hazard = np.clip(tri_map / 2.5, 0.0, 1.0)
        terrain_difficulty = 0.65 * slope_hazard + 0.35 * roughness_hazard

        return {
            "slope_map": slope_map,
            "tri_map": tri_map,
            "elevation_std": elev_std_map,
            "vrm_map": vrm_map,
            "slope_hazard": slope_hazard,
            "roughness_hazard": roughness_hazard,
            "terrain_difficulty": terrain_difficulty,
            "mean_slope": float(np.mean(slope_map)),
            "max_slope": float(np.percentile(slope_map, 98)),
            "mean_tri": float(np.mean(tri_map)),
            "elevation_min": float(np.min(dem)),
            "elevation_max": float(np.max(dem)),
        }
