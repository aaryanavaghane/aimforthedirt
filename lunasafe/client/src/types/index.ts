export type AssetCategory = 'bridge' | 'drainage' | 'road';
export type HealthStatus = 'healthy' | 'warning' | 'critical';
export type UserRole = 'pmc_commissioner' | 'drainage_engineer' | 'traffic_police';
export type ShiftType = 'NIGHT_WINDOW' | 'MORNING_PEAK' | 'AFTERNOON_OFFPEAK' | 'EMERGENCY_24X7';

export interface TelemetryData {
  vibration?: number[];
  strain?: number[];
  acousticStress?: number[];
  flowRate?: number[];
  siltBlockage?: number;
  waterLevel?: number[];
  trafficDensity?: number[];
  potholeCount?: number;
  timestamps: string[];
}

export interface WorkOrder {
  id: string;
  assetId: string;
  assetName: string;
  zoneArea?: string;
  category?: AssetCategory;
  type: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'DISPATCHED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedCrew: string;
  shift?: ShiftType;
  estimatedHours: number;
  scheduledDate: string; // ISO date string "YYYY-MM-DD"
  scheduledTime?: string;
  estimatedCost: number;
  createdAt: string;
  notes: string;
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  category: AssetCategory;
  status: HealthStatus;
  healthScore: number;
  location: {
    lat: number;
    lng: number;
    address: string;
    ward: string;
  };
  issue: string | null;
  rootCause: string;
  daysToFailure: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  failureProbability: number;
  proactiveCost: number;
  reactiveCost: number;
  telemetry: TelemetryData;
  lastInspected: string;
  recommendedAction: string;
  activeWorkOrder?: WorkOrder | null;
}

export interface CostDataPoint {
  month: string;
  proactive: number;
  reactive: number;
  saved: number;
}

export interface UrgentAlert {
  id: string;
  assetId: string;
  assetName: string;
  category: AssetCategory;
  message: string;
  severity: HealthStatus;
  timestamp: string;
  ward: string;
}

export interface DashboardStats {
  totalAssetsMonitored: number;
  citywideHealthIndex: number;
  predictedFailures30d: number;
  predictedFailures60d: number;
  predictedFailures90d: number;
  financials: {
    proactiveTotal: number;
    reactiveTotal: number;
    netSaved: number;
    savingsPercentage: number;
  };
  categoryBreakdown: {
    bridge: { total: number; healthy: number; warning: number; critical: number };
    drainage: { total: number; healthy: number; warning: number; critical: number };
    road: { total: number; healthy: number; warning: number; critical: number };
  };
  costTrend: CostDataPoint[];
  urgentAlerts: UrgentAlert[];
  lastUpdated: string;
}

export type ScenarioType = 'monsoon_100yr' | 'mutha_flood' | 'traffic_surge' | 'budget_cut' | 'reset';

export interface SimulationResult {
  scenario: ScenarioType;
  scenarioName: string;
  impactSummary: string;
  affectedAssetCount: number;
  newCriticalAssets: number;
  projectedFinancialDamage: number;
  aiRecommendation: string;
  updatedAssets: InfrastructureAsset[];
  updatedStats: DashboardStats;
}
