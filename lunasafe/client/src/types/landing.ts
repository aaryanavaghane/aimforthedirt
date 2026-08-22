export interface ScenarioMeta {
  id: string;
  name: string;
  body: string;
  location: string;
  elevation_range: string;
  lighting_desc: string;
  mission_type: string;
  default_target: [number, number];
  description: string;
}

export interface CandidateZone {
  zone_id: string;
  name: string;
  rank: number;
  center: [number, number];
  center_norm: [number, number];
  radius: number;
  safety_score: number;
  risk_score: number;
  confidence_interval: number;
  confidence_pct: number;
  score_lower: number;
  score_upper: number;
  status: "Recommended" | "Safe" | "Moderate" | "Hazardous";
  is_critical: boolean;
  violations: string[];
  metrics: {
    mean_slope_deg: number;
    max_slope_deg: number;
    roughness_tri: number;
    boulder_count: number;
    crater_count: number;
    shadow_fraction_pct: number;
    thermal_risk: number;
    fuel_cost_norm: number;
    science_value: number;
    spatial_uncertainty: number;
  };
  breakdown: {
    optical_risk_pct: number;
    slope_risk_pct: number;
    roughness_risk_pct: number;
    thermal_risk_pct: number;
    fuel_penalty_pct: number;
  };
}

export interface AIRationale {
  decision: string;
  summary: string;
  key_factors: string[];
  detailed_rationale: string;
  sensor_flags: string[];
}

export interface TelemetryData {
  total_latency_ms: number;
  optical_latency_ms: number;
  dem_latency_ms: number;
  thermal_latency_ms: number;
  coarse_sweep_latency_ms: number;
  fine_scoring_latency_ms: number;
  scanned_area_km2: number;
  throughput_km2_per_sec: number;
  boulder_count_total: number;
  crater_count_total: number;
  mean_slope_deg: number;
  max_slope_deg: number;
  mean_temp_k: number;
}

export interface SensorHealth {
  optical: "healthy" | "degraded" | "offline";
  dem: "healthy" | "degraded" | "offline";
  thermal: "healthy" | "offline";
}

export interface MissionWeights {
  boulder_crater: number;
  slope: number;
  roughness: number;
  thermal: number;
  fuel_distance: number;
  science_value: number;
}

export interface AnalysisResponse {
  success: boolean;
  scenario: ScenarioMeta;
  recommended_zone: CandidateZone | null;
  abort_recommended: boolean;
  candidate_zones: CandidateZone[];
  coarse_count: number;
  fine_count: number;
  rationale: AIRationale;
  weights_applied: Record<string, number>;
  sensor_health: SensorHealth;
  degradation_flags: string[];
  telemetry: TelemetryData;
  layers: Record<string, string> & {
    optical: string;
    annotated: string;
    elevation_dem: string;
    slope: string;
    roughness: string;
    thermal: string;
    uncertainty: string;
    hazard_density: string;
  };
  selected_zone_id: string | null;
  human_override_active: boolean;
  audit_log_tail: Array<{
    timestamp: string;
    sensor_health: SensorHealth;
    applied_weights: Record<string, number>;
    top_zone: string;
    safety_score: number;
    confidence_band: string;
    decision: string;
    total_latency_ms: number;
  }>;
}

export interface DegradationComparison {
  dropped_sensor: string;
  healthy_state: {
    top_zone: string;
    safety_score: number;
    confidence_band: string;
    confidence_pct: number;
    weights: Record<string, number>;
    zones: Array<{
      name: string;
      score: number;
      ci: number;
      lower: number;
      upper: number;
    }>;
  };
  degraded_state: {
    top_zone: string;
    safety_score: number;
    confidence_band: string;
    confidence_pct: number;
    weights: Record<string, number>;
    degradation_flags: string[];
    zones: Array<{
      name: string;
      score: number;
      ci: number;
      lower: number;
      upper: number;
    }>;
  };
  confidence_widening_pts: number;
  impact_summary: string;
}

export interface HumanOverrideRecord {
  id: string;
  timestamp: string;
  scenario_id: string;
  action: string;
  selected_zone: string;
  pilot_rationale: string;
  status: string;
}
