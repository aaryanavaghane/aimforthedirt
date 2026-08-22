import { Router, Request, Response } from 'express';
import {
  INITIAL_PUNE_ASSETS,
  calculateDashboardStats
} from './data/seedData.js';
import {
  InfrastructureAsset,
  WorkOrder,
  SimulationRequest,
  SimulationResult,
  ScenarioType
} from './types/index.js';

const router = Router();

// In-Memory Mutable State with authentic Pune landmarks
let currentAssets: InfrastructureAsset[] = JSON.parse(JSON.stringify(INITIAL_PUNE_ASSETS));

// Realistic PMC Scheduled Maintenance Shifts for Pune Infrastructure
let workOrders: WorkOrder[] = [
  {
    id: 'wo-801',
    assetId: 'pune-drn-003',
    assetName: 'Bhairobanala Trunk Outfall',
    zoneArea: 'Hadapsar - Mundhwa',
    category: 'drainage',
    type: 'Robotic Hydro-Suction & Silt Deep Extraction',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    assignedCrew: 'PMC Quick Response Drainage Strike Team 1',
    shift: 'NIGHT_WINDOW',
    estimatedHours: 6,
    scheduledDate: '2026-08-21',
    scheduledTime: '01:30 AM',
    estimatedCost: 520000,
    createdAt: '2026-08-20T18:00:00Z',
    notes: 'Emergency 91% silt blockage clearance ahead of monsoon surge.'
  },
  {
    id: 'wo-802',
    assetId: 'pune-brg-003',
    assetName: 'Bund Garden Bridge (Fitzgerald Bridge)',
    zoneArea: 'Dhole Patil Road',
    category: 'bridge',
    type: 'CFRP Pier Footing Wrap & Masonry Arch Retrofitting',
    priority: 'CRITICAL',
    status: 'DISPATCHED',
    assignedCrew: 'PMC Specialized Bridge Engineering Unit',
    shift: 'NIGHT_WINDOW',
    estimatedHours: 8,
    scheduledDate: '2026-08-22',
    scheduledTime: '02:00 AM',
    estimatedCost: 1100000,
    createdAt: '2026-08-21T08:30:00Z',
    notes: 'High-tensile tie-bar installation and 12T freight load mitigation.'
  },
  {
    id: 'wo-803',
    assetId: 'pune-drn-005',
    assetName: 'Ambil Odha Stormwater Channel (Parvati)',
    zoneArea: 'Sahakarnagar',
    category: 'drainage',
    type: 'Retaining Wall Reinforcement & Siphon Dredging',
    priority: 'CRITICAL',
    status: 'PENDING',
    assignedCrew: 'PMC Stormwater Heavy Excavation Unit 2',
    shift: 'MORNING_PEAK',
    estimatedHours: 10,
    scheduledDate: '2026-08-23',
    scheduledTime: '06:00 AM',
    estimatedCost: 950000,
    createdAt: '2026-08-21T09:00:00Z',
    notes: 'Mitigate Parvati Paytha flash-flood bottleneck before heavy rains.'
  },
  {
    id: 'wo-804',
    assetId: 'pune-rd-002',
    assetName: 'North Main Road, Mundhwa',
    zoneArea: 'Hadapsar - Mundhwa',
    category: 'road',
    type: 'Full-Depth Cementitious Reclamation & Perforated Drains',
    priority: 'HIGH',
    status: 'PENDING',
    assignedCrew: 'PMC Heavy Road Construction Fleet 2',
    shift: 'AFTERNOON_OFFPEAK',
    estimatedHours: 8,
    scheduledDate: '2026-08-24',
    scheduledTime: '01:00 PM',
    estimatedCost: 650000,
    createdAt: '2026-08-21T10:00:00Z',
    notes: 'Eliminate 47 pothole cluster along industrial heavy transport corridor.'
  },
  {
    id: 'wo-805',
    assetId: 'pune-brg-002',
    assetName: 'Rajaram Bridge (Sinhagad Road)',
    zoneArea: 'Sinhagad Road',
    category: 'bridge',
    type: 'Pier 4 Scour Polymer Wrapping & Piezoelectric Gauges',
    priority: 'HIGH',
    status: 'DISPATCHED',
    assignedCrew: 'PMC Specialized Bridge Engineering Unit',
    shift: 'NIGHT_WINDOW',
    estimatedHours: 5,
    scheduledDate: '2026-08-25',
    scheduledTime: '01:00 AM',
    estimatedCost: 450000,
    createdAt: '2026-08-21T10:30:00Z',
    notes: 'Stabilize Pier 4 against Mutha river hydraulic shear stress.'
  },
  {
    id: 'wo-806',
    assetId: 'pune-rd-001',
    assetName: 'Karve Road Arterial (Nal Stop to Garware)',
    zoneArea: 'Kothrud - Bavdhan',
    category: 'road',
    type: 'Infrared Asphalt Thermal Micro-Surfacing',
    priority: 'HIGH',
    status: 'PENDING',
    assignedCrew: 'PMC Thermal Pavement Maintenance Crew 4',
    shift: 'NIGHT_WINDOW',
    estimatedHours: 4,
    scheduledDate: '2026-08-27',
    scheduledTime: '01:30 AM',
    estimatedCost: 380000,
    createdAt: '2026-08-21T11:00:00Z',
    notes: 'Smooth pavement restoration under Nal Stop Metro flyover corridor.'
  }
];

// GET /api/dashboard
router.get('/dashboard', (req: Request, res: Response) => {
  const stats = calculateDashboardStats(currentAssets);
  res.json({
    success: true,
    data: stats
  });
});

// GET /api/assets
router.get('/assets', (req: Request, res: Response) => {
  const { category, status, ward, limit } = req.query;
  let filtered = [...currentAssets];

  if (category && typeof category === 'string' && category !== 'all') {
    filtered = filtered.filter(a => a.category === category);
  }
  if (status && typeof status === 'string' && status !== 'all') {
    filtered = filtered.filter(a => a.status === status);
  }
  if (ward && typeof ward === 'string') {
    filtered = filtered.filter(a => a.location.ward.toLowerCase().includes(ward.toLowerCase()));
  }

  if (limit && typeof limit === 'string') {
    const lim = parseInt(limit, 10);
    if (!isNaN(lim)) filtered = filtered.slice(0, lim);
  }

  res.json({
    success: true,
    count: filtered.length,
    total: currentAssets.length,
    data: filtered
  });
});

// GET /api/assets/:id
router.get('/assets/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const asset = currentAssets.find(a => a.id === id);

  if (!asset) {
    return res.status(404).json({ success: false, error: 'Asset not found in Pune database' });
  }

  res.json({
    success: true,
    data: asset
  });
});

// POST /api/work-orders
router.post('/work-orders', (req: Request, res: Response) => {
  const { 
    assetId, 
    assignedCrew, 
    actionType, 
    scheduledDate, 
    scheduledTime, 
    shift, 
    priority, 
    status: reqStatus, 
    notes 
  } = req.body;

  const assetIndex = currentAssets.findIndex(a => a.id === assetId);
  if (assetIndex === -1) {
    return res.status(404).json({ success: false, error: 'Target asset not found' });
  }

  const asset = currentAssets[assetIndex];
  const targetDate = scheduledDate || new Date().toISOString().split('T')[0];
  const targetStatus = reqStatus || 'DISPATCHED';

  const newWorkOrder: WorkOrder = {
    id: `wo-${Date.now().toString().slice(-4)}`,
    assetId: asset.id,
    assetName: asset.name,
    zoneArea: asset.location.ward.replace(' Ward Office', ''),
    category: asset.category,
    type: actionType || asset.recommendedAction,
    priority: priority || (asset.status === 'critical' ? 'CRITICAL' : 'HIGH'),
    status: targetStatus,
    assignedCrew: assignedCrew || 'PMC Quick Response Division 1',
    shift: shift || 'NIGHT_WINDOW',
    estimatedHours: 6,
    scheduledDate: targetDate,
    scheduledTime: scheduledTime || '01:00 AM',
    estimatedCost: asset.proactiveCost,
    createdAt: new Date().toISOString(),
    notes: notes || `AI Repair Plan scheduled for ${asset.name}. Assigned to ${assignedCrew || 'PMC Rapid Crew'}.`
  };

  workOrders.unshift(newWorkOrder);

  // If completed or dispatched, update asset health and restore baseline
  if (targetStatus === 'COMPLETED' || targetStatus === 'DISPATCHED') {
    currentAssets[assetIndex] = {
      ...asset,
      status: 'healthy',
      healthScore: 94,
      issue: null,
      daysToFailure: 365,
      criticality: 'LOW',
      failureProbability: 2.5,
      lastInspected: new Date().toISOString().split('T')[0],
      recommendedAction: 'Post-repair baseline validated. Routine sensor polling active.',
      activeWorkOrder: newWorkOrder,
      telemetry: {
        ...asset.telemetry,
        siltBlockage: 8,
        potholeCount: 0,
        vibration: [0.18, 0.19, 0.20, 0.21, 0.20, 0.19, 0.20],
        waterLevel: [22, 24, 26, 28, 25, 23, 22]
      }
    };
  } else {
    currentAssets[assetIndex] = {
      ...asset,
      activeWorkOrder: newWorkOrder
    };
  }

  const updatedStats = calculateDashboardStats(currentAssets);

  res.json({
    success: true,
    message: `PMC Work Order scheduled for ${asset.name}.`,
    workOrder: newWorkOrder,
    asset: currentAssets[assetIndex],
    updatedStats
  });
});

// GET /api/work-orders
router.get('/work-orders', (req: Request, res: Response) => {
  const { date, status, zone } = req.query;
  let list = [...workOrders];

  if (date && typeof date === 'string') {
    list = list.filter(w => w.scheduledDate === date);
  }
  if (status && typeof status === 'string') {
    list = list.filter(w => w.status === status);
  }
  if (zone && typeof zone === 'string') {
    list = list.filter(w => w.zoneArea?.toLowerCase().includes(zone.toLowerCase()));
  }

  res.json({
    success: true,
    count: list.length,
    data: list
  });
});

// POST /api/simulate
router.post('/simulate', (req: Request, res: Response) => {
  const { scenario } = req.body as SimulationRequest;

  let impactSummary = '';
  let scenarioName = '';
  let projectedDamage = 0;
  let recommendation = '';

  switch (scenario) {
    case 'monsoon_100yr':
      scenarioName = 'Pune 100-Year Monsoon (150mm Cloudburst)';
      impactSummary = 'Severe hydraulic shock load on Mula-Mutha drainage basins. Baner, Bhairobanala, and Nagzari canal water levels surge to 98% capacity with severe backflow risk.';
      projectedDamage = 142000000;
      recommendation = 'Activate flood sluice emergency diversions and deploy all 16 PMC high-volume dewatering pumps across river junctions.';
      
      currentAssets = currentAssets.map(a => {
        if (a.category === 'drainage') {
          return {
            ...a,
            status: 'critical',
            healthScore: Math.max(12, a.healthScore - 35),
            failureProbability: 98.4,
            daysToFailure: 2,
            issue: 'High flood risk: Hydraulic capacity exceeded by 210%'
          };
        }
        if (a.category === 'road') {
          return {
            ...a,
            status: a.status === 'healthy' ? 'warning' : 'critical',
            healthScore: Math.max(25, a.healthScore - 25),
            daysToFailure: Math.min(a.daysToFailure, 7),
            issue: 'Waterlogged sub-base saturation with rapid surface pitting'
          };
        }
        return a;
      });
      break;

    case 'mutha_flood':
      scenarioName = 'Khadakwasla Dam Peak Discharge & Mutha River Flood';
      impactSummary = 'Discharge elevated to 45,000 cusecs. Hydrodynamic scouring detected on Bund Garden, Rajaram, and Sangam bridge pier footings.';
      projectedDamage = 98000000;
      recommendation = 'Close Bund Garden and Rajaram lower causeways; reroute commercial traffic to DP Road flyover.';

      currentAssets = currentAssets.map(a => {
        if (a.category === 'bridge') {
          return {
            ...a,
            status: 'critical',
            healthScore: Math.max(18, a.healthScore - 30),
            daysToFailure: Math.min(a.daysToFailure, 5),
            issue: 'Hydrodynamic shear stress on bridge piers exceeds critical safety factor'
          };
        }
        return a;
      });
      break;

    case 'traffic_surge':
      scenarioName = 'Wakad IT Park & Hinjawadi Shift Traffic Surge (3x Volume)';
      impactSummary = 'Peak vehicular PCU exceeds 4,200/hr across Karve Road, Wakad Flyover, and Chandani Chowk. Dynamic pavement strain spikes by 85%.';
      projectedDamage = 34000000;
      recommendation = 'Synchronize smart traffic signaling with ATCS, enforce heavy axle restrictions between 17:00-21:00.';

      currentAssets = currentAssets.map(a => {
        if (a.category === 'road' || a.category === 'bridge') {
          return {
            ...a,
            status: a.status === 'healthy' ? 'warning' : a.status,
            healthScore: Math.max(30, a.healthScore - 18),
            daysToFailure: Math.max(4, a.daysToFailure - 14),
            issue: 'Pavement micro-fracture propagation from persistent overloaded axle loads'
          };
        }
        return a;
      });
      break;

    case 'budget_cut':
      scenarioName = '25% Municipal Infrastructure Budget Reduction';
      impactSummary = 'Proactive preventative cycles deferred. Unaddressed micro-stress triggers 4.8x cost multiplier over 90 days.';
      projectedDamage = 185000000;
      recommendation = 'Prioritize top critical life-safety assets across Bund Garden, Bhairobanala, and Sinhagad Road.';

      currentAssets = currentAssets.map(a => ({
        ...a,
        daysToFailure: Math.max(3, Math.round(a.daysToFailure * 0.5)),
        healthScore: Math.max(20, a.healthScore - 12)
      }));
      break;

    case 'reset':
    default:
      scenarioName = 'Baseline City Infrastructure Normal State';
      impactSummary = 'Baseline live IoT telemetry restored for all Pune infrastructure nodes.';
      projectedDamage = 0;
      recommendation = 'Continue continuous sensor monitoring and AI predictive dispatch schedule.';
      currentAssets = JSON.parse(JSON.stringify(INITIAL_PUNE_ASSETS));
      break;
  }

  const updatedStats = calculateDashboardStats(currentAssets);
  const affectedCount = currentAssets.filter(a => a.status !== 'healthy').length;
  const criticalCount = currentAssets.filter(a => a.status === 'critical').length;

  const result: SimulationResult = {
    scenario,
    scenarioName,
    impactSummary,
    affectedAssetCount: affectedCount,
    newCriticalAssets: criticalCount,
    projectedFinancialDamage: projectedDamage,
    aiRecommendation: recommendation,
    updatedAssets: currentAssets,
    updatedStats
  };

  res.json({
    success: true,
    data: result
  });
});

export default router;
