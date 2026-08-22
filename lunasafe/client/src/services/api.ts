import axios from 'axios';
import {
  AnalysisResponse,
  DegradationComparison,
  HumanOverrideRecord,
  MissionWeights,
  ScenarioMeta,
  SensorHealth
} from '../types/landing';

const API_BASE = typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:5000/api' : '/api';

export const apiClient = {
  getScenarios: async (): Promise<{ scenarios: ScenarioMeta[]; default_weights: MissionWeights }> => {
    const res = await axios.get(`${API_BASE}/scenarios`);
    return res.data;
  },

  analyzeLandingSite: async (params: {
    scenario_id: string;
    sensor_health?: SensorHealth;
    weights?: MissionWeights;
    max_safe_slope_deg?: number;
    selected_zone_id?: string | null;
  }): Promise<AnalysisResponse> => {
    const res = await axios.post(`${API_BASE}/analyze`, params);
    return res.data;
  },

  simulateDegradation: async (params: {
    scenario_id: string;
    dropped_sensor: string;
    weights?: MissionWeights;
  }): Promise<DegradationComparison> => {
    const res = await axios.post(`${API_BASE}/simulate-degradation`, params);
    return res.data;
  },

  submitOverride: async (params: {
    zone_id: string | null;
    action: string;
    rationale: string;
    scenario_id: string;
  }): Promise<{ success: boolean; message: string; record: HumanOverrideRecord; override_log: HumanOverrideRecord[] }> => {
    const res = await axios.post(`${API_BASE}/override`, params);
    return res.data;
  },

  getBenchmarks: async (): Promise<{
    baseline_comparison: Array<{
      method: string;
      false_safe_rate: string;
      flaw: string;
      recommendation_score: string;
    }>;
    latency_profile: {
      total_latency_ms: number;
      optical_yolo_ms: number;
      dem_slope_roughness_ms: number;
      thermal_processing_ms: number;
      coarse_to_fine_fusion_ms: number;
      memory_usage_mb: number;
      fps_equivalent: number;
      onboard_readiness: string;
    };
  }> => {
    const res = await axios.get(`${API_BASE}/benchmarks`);
    return res.data;
  }
};
