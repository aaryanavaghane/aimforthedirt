"""
Pydantic Schemas for LUNA-SAFE Decision-Support System
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ZoneCandidate(BaseModel):
    zone_id: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    bbox: List[int] = Field(default_factory=list, description="[x, y, w, h] pixel bounding box")
    center: List[float] = Field(default_factory=list, description="[cx, cy]")
    center_norm: List[float] = Field(default_factory=list, description="[cx_norm, cy_norm]")
    radius: float = 35.0
    hazard_density: float = Field(default=0.0, description="Optical crater/boulder density (0 to 1)")
    boulder_count: int = 0
    crater_count: int = 0
    slope_deg: float = Field(default=0.0, description="Mean slope in degrees")
    max_slope_deg: float = Field(default=0.0, description="95th percentile peak slope")
    roughness: float = Field(default=0.0, description="Terrain Ruggedness Index (TRI)")
    thermal_anomaly: float = Field(default=0.0, description="Thermal gradient / cold trap risk (0 to 1)")
    shadow_fraction: float = Field(default=0.0, description="Shadow/PSR coverage (0 to 1)")
    lighting_score: float = Field(default=0.8, description="Derived from sun elevation angle")
    fuel_cost: float = Field(default=0.0, description="Distance penalty from target")
    science_value: float = Field(default=0.0, description="Proximity to scientific interest areas")


class MissionPriorities(BaseModel):
    fuel_margin: float = Field(default=0.10, description="Weight for fuel/distance to target (0-1)")
    descent_time_window_s: Optional[float] = 300.0
    hazard_weight: float = Field(default=0.30, description="Weight for boulder/crater hazard (0-1)")
    slope_weight: float = Field(default=0.30, description="Weight for terrain slope (0-1)")
    roughness_weight: float = Field(default=0.15, description="Weight for roughness (0-1)")
    thermal_weight: float = Field(default=0.15, description="Weight for thermal anomaly (0-1)")
    science_weight: float = Field(default=0.0, description="Weight for science priority (0-1)")
    safety_weight: Optional[float] = 0.85
    abort_capability: bool = True
    max_safe_slope_deg: float = 8.5


class ZoneScore(BaseModel):
    zone_id: str
    name: str
    rank: int = 1
    score: float = Field(description="Safety score 0 to 100")
    risk_score: float = Field(description="Hazard risk score 0 to 100")
    confidence_low: float = Field(description="Lower bound of confidence interval")
    confidence_high: float = Field(description="Upper bound of confidence interval")
    confidence_band_spread: float = Field(description="± spread percentage")
    confidence_pct: float = Field(description="Overall AI confidence percentage")
    status: str = Field(description="Recommended | Safe | Moderate | Hazardous")
    flags: List[str] = Field(default_factory=list)
    is_critical: bool = False
    violations: List[str] = Field(default_factory=list)
    rationale: str = ""
    metrics: Dict[str, Any] = Field(default_factory=dict)
    breakdown: Dict[str, float] = Field(default_factory=dict)
    bbox: List[int] = Field(default_factory=list)
    center: List[float] = Field(default_factory=list)
    center_norm: List[float] = Field(default_factory=list)
    radius: float = 35.0


class RankRequest(BaseModel):
    zones: List[ZoneCandidate]
    priorities: Optional[MissionPriorities] = None
    scenario_id: str = "chandrayaan3"


class RankingResponse(BaseModel):
    ranked_zones: List[ZoneScore]
    recommended_zone: Optional[ZoneScore] = None
    abort_recommended: bool = False
    mission_profile: str = "nominal"
    degraded_mode: bool = False
    degradation_flags: List[str] = Field(default_factory=list)
    active_weights: Dict[str, float] = Field(default_factory=dict)
    rationale_summary: str = ""
    detailed_rationale: str = ""
    key_factors: List[str] = Field(default_factory=list)
    audit_id: Optional[str] = None
    telemetry: Dict[str, Any] = Field(default_factory=dict)


class MoonVerificationResult(BaseModel):
    is_moon_surface: bool
    confidence: float
    reason: str
    metrics: Dict[str, Any] = Field(default_factory=dict)


class SensorDegradeRequest(BaseModel):
    scenario_id: str = "chandrayaan3"
    dropped_sensor: str = "thermal"  # 'thermal', 'optical', 'dem'
    priorities: Optional[MissionPriorities] = None


class OverrideRequest(BaseModel):
    zone_id: Optional[str] = None
    action: str = "override"  # 'accept', 'override', 'request_alternate', 'abort'
    rationale: str = "Human pilot preferred alternate site."
    scenario_id: str = "chandrayaan3"
