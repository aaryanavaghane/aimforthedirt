import { InfrastructureAsset, CostDataPoint, UrgentAlert, DashboardStats } from '../types';

export const INITIAL_PUNE_ASSETS: InfrastructureAsset[] = [
  // ==========================================
  // BRIDGES & FLYOVERS
  // ==========================================
  {
    id: 'pune-brg-001',
    name: 'Chandani Chowk Multi-Tier Flyover',
    category: 'bridge',
    status: 'healthy',
    healthScore: 92,
    location: {
      lat: 18.5023,
      lng: 73.7749,
      address: 'Chandani Chowk Junction, Bavdhan / Kothrud Gateway',
      ward: 'Kothrud - Bavdhan Ward Office'
    },
    issue: null,
    rootCause: 'Normal wear-and-tear within ISO-10816 vibration tolerance tolerances. Regular multi-tier deck resonance nominal.',
    daysToFailure: 365,
    criticality: 'LOW',
    failureProbability: 3.2,
    proactiveCost: 150000,
    reactiveCost: 3200000,
    telemetry: {
      vibration: [0.18, 0.22, 0.19, 0.24, 0.21, 0.20, 0.22],
      strain: [120, 135, 128, 140, 132, 129, 134],
      acousticStress: [14, 16, 15, 18, 16, 15, 16],
      trafficDensity: [78, 85, 92, 88, 70, 65, 82],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-10',
    recommendedAction: 'Automated optical expansion joint monitoring every 30 days. No immediate physical intervention required.'
  },
  {
    id: 'pune-brg-002',
    name: 'Rajaram Bridge (Sinhagad Road)',
    category: 'bridge',
    status: 'warning',
    healthScore: 65,
    location: {
      lat: 18.4900,
      lng: 73.8340,
      address: 'Sinhagad Road - Karve Nagar Connector, Mutha River',
      ward: 'Sinhagad Road Ward Office'
    },
    issue: 'Micro-acoustic shear stress on Pier 4',
    rootCause: 'Sub-surface scour fatigue coupled with cyclical dynamic loads from peak Sinhagad Road transit corridor.',
    daysToFailure: 42,
    criticality: 'MEDIUM',
    failureProbability: 48.7,
    proactiveCost: 450000,
    reactiveCost: 8500000,
    telemetry: {
      vibration: [0.45, 0.52, 0.68, 0.74, 0.62, 0.58, 0.64],
      strain: [280, 310, 395, 420, 380, 360, 390],
      acousticStress: [48, 54, 72, 78, 69, 62, 71],
      trafficDensity: [60, 40, 95, 88, 92, 85, 60],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-16',
    recommendedAction: 'Deploy carbon-fiber polymer (CFRP) wrapping on Pier 4 footing and install piezoelectric strain gauges.'
  },
  {
    id: 'pune-brg-003',
    name: 'Bund Garden Bridge (Fitzgerald Bridge)',
    category: 'bridge',
    status: 'critical',
    healthScore: 42,
    location: {
      lat: 18.5361,
      lng: 73.8824,
      address: 'Bund Garden Rd, Sangamvadi / Yerawada, Mula-Mutha River',
      ward: 'Dhole Patil Road Ward Office'
    },
    issue: 'Age degradation & heavy traffic load',
    rootCause: 'Spalling of masonry arches, chloride penetration in mortar binders, and unrated commercial freight loads.',
    daysToFailure: 18,
    criticality: 'CRITICAL',
    failureProbability: 82.4,
    proactiveCost: 1100000,
    reactiveCost: 24000000,
    telemetry: {
      vibration: [0.72, 0.68, 1.15, 1.34, 1.22, 1.05, 0.98],
      strain: [410, 430, 580, 640, 610, 560, 530],
      acousticStress: [82, 78, 96, 104, 98, 90, 88],
      trafficDensity: [45, 30, 98, 95, 99, 90, 65],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-19',
    recommendedAction: 'Emergency hydro-demolition of degraded mortar, high-tensile steel tie-bar retrofitting, and 12T load diversion.'
  },
  {
    id: 'pune-brg-004',
    name: 'Sangam Bridge (R.T.O. Confluence)',
    category: 'bridge',
    status: 'healthy',
    healthScore: 84,
    location: {
      lat: 18.5289,
      lng: 73.8611,
      address: 'Near Pune RTO, Confluence of Mula and Mutha Rivers',
      ward: 'Shivajinagar - Ghole Road Ward Office'
    },
    issue: null,
    rootCause: 'Structural bearings inspected post-monsoon. Minor elastomeric pad deflection within normal limits.',
    daysToFailure: 290,
    criticality: 'LOW',
    failureProbability: 11.5,
    proactiveCost: 220000,
    reactiveCost: 4500000,
    telemetry: {
      vibration: [0.24, 0.20, 0.35, 0.38, 0.36, 0.31, 0.28],
      strain: [160, 150, 210, 230, 220, 195, 180],
      acousticStress: [20, 18, 28, 32, 30, 26, 22],
      trafficDensity: [50, 30, 90, 85, 94, 80, 55],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-12',
    recommendedAction: 'Re-grease rocker-roller bearings and calibrate seismic dampers before Q4 heavy transit audit.'
  },
  {
    id: 'pune-brg-005',
    name: 'Holkar Bridge (Khadki - Yerawada)',
    category: 'bridge',
    status: 'warning',
    healthScore: 58,
    location: {
      lat: 18.5583,
      lng: 73.8722,
      address: 'Mula River Crossing, Near Khadki War Cemetery & Yerawada',
      ward: 'Yerawada - Kalas Ward Office'
    },
    issue: 'Sub-structure scouring & deck expansion joint displacement',
    rootCause: 'Cyclic high-velocity river current scour combined with heavy military & municipal freight movement.',
    daysToFailure: 35,
    criticality: 'HIGH',
    failureProbability: 55.4,
    proactiveCost: 550000,
    reactiveCost: 9000000,
    telemetry: {
      vibration: [0.38, 0.45, 0.72, 0.79, 0.65, 0.54, 0.48],
      strain: [220, 260, 380, 410, 360, 320, 290],
      acousticStress: [35, 42, 68, 75, 62, 55, 48],
      trafficDensity: [45, 25, 92, 88, 90, 84, 58],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-18',
    recommendedAction: 'Underwater sonar scour inspection, riprap rock armoring around piers 2 & 3, and expansion joint elastomeric sealant injection.'
  },
  {
    id: 'pune-brg-006',
    name: 'Harris Bridge (Dapodi / Old Mumbai Highway)',
    category: 'bridge',
    status: 'warning',
    healthScore: 62,
    location: {
      lat: 18.5779,
      lng: 73.8058,
      address: 'Pavana River Crossing, Old Mumbai-Pune Highway',
      ward: 'Aundh - Baner Ward Office'
    },
    issue: 'Pier cap concrete micro-fissuring',
    rootCause: 'Heavy multi-axle freight transit exceeding design load capacity during peak logistics hours.',
    daysToFailure: 48,
    criticality: 'MEDIUM',
    failureProbability: 42.1,
    proactiveCost: 600000,
    reactiveCost: 11000000,
    telemetry: {
      vibration: [0.32, 0.36, 0.62, 0.68, 0.58, 0.49, 0.40],
      strain: [210, 240, 340, 370, 330, 290, 260],
      acousticStress: [28, 35, 58, 64, 54, 46, 38],
      trafficDensity: [70, 40, 96, 92, 98, 90, 72],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-15',
    recommendedAction: 'Epoxy resin pressure injection for pier cap fissures; enforce dynamic weigh-in-motion sensor monitoring.'
  },
  {
    id: 'pune-brg-007',
    name: 'Kharadi-Mundhwa Riverside Bridge',
    category: 'bridge',
    status: 'critical',
    healthScore: 38,
    location: {
      lat: 18.5412,
      lng: 73.9315,
      address: 'Mula-Mutha River, Connecting Kharadi IT Corridor to Mundhwa Industrial Zone',
      ward: 'Nagar Road - Kharadi Ward Office'
    },
    issue: 'Severe shear fatigue & pier settlement from IT Park transit rush',
    rootCause: 'Continuous 3.5x peak traffic overload coupled with riverbed sand mining erosion destabilizing pier 2 foundation.',
    daysToFailure: 14,
    criticality: 'CRITICAL',
    failureProbability: 86.2,
    proactiveCost: 1450000,
    reactiveCost: 28000000,
    telemetry: {
      vibration: [0.65, 0.70, 1.25, 1.45, 1.30, 1.10, 0.95],
      strain: [390, 420, 610, 680, 630, 580, 510],
      acousticStress: [78, 85, 105, 115, 102, 94, 86],
      trafficDensity: [60, 35, 100, 98, 100, 96, 75],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-20',
    recommendedAction: 'Emergency micro-piling underpinning for pier 2, CFRP composite wrapping, and heavy commercial vehicle ban.'
  },

  // ==========================================
  // DRAINAGE & STORMWATER HOTSPOTS
  // ==========================================
  {
    id: 'pune-drn-001',
    name: 'Shahir Amar Shaikh Chowk Drainage',
    category: 'drainage',
    status: 'critical',
    healthScore: 30,
    location: {
      lat: 18.5204,
      lng: 73.8732,
      address: 'Near Pune Railway Station & Juna Bazaar Approach',
      ward: 'Bhavani Peth Ward Office'
    },
    issue: '85% Silt blockage, imminent flood risk',
    rootCause: 'Accumulation of dense construction runoff aggregate and plastic debris obstructing the primary 1800mm box culvert.',
    daysToFailure: 9,
    criticality: 'CRITICAL',
    failureProbability: 91.0,
    proactiveCost: 280000,
    reactiveCost: 6500000,
    telemetry: {
      flowRate: [12, 10, 8, 5, 6, 7, 5],
      siltBlockage: 85,
      waterLevel: [68, 72, 84, 92, 94, 88, 86],
      trafficDensity: [40, 20, 90, 95, 92, 85, 60],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-20',
    recommendedAction: 'Immediate deployment of PMC high-velocity robotic suction super-sucker units; establish secondary bypass sluice.'
  },
  {
    id: 'pune-drn-002',
    name: 'Radha Hotel Chowk Stormwater Sluice (Baner)',
    category: 'drainage',
    status: 'warning',
    healthScore: 55,
    location: {
      lat: 18.5590,
      lng: 73.7868,
      address: 'Baner-Balewadi Main Arterial Rd, Near Mumbai-Bangalore Highway',
      ward: 'Aundh - Baner Ward Office'
    },
    issue: 'Natural stream overflow capacity bottleneck',
    rootCause: 'Reduced canal cross-section due to lateral retaining wall encroachment and elevated stormwater backpressure.',
    daysToFailure: 31,
    criticality: 'HIGH',
    failureProbability: 58.2,
    proactiveCost: 350000,
    reactiveCost: 4800000,
    telemetry: {
      flowRate: [45, 42, 38, 32, 30, 35, 36],
      siltBlockage: 58,
      waterLevel: [42, 45, 62, 74, 76, 68, 58],
      trafficDensity: [55, 30, 94, 91, 98, 92, 60],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-15',
    recommendedAction: 'Desilt downstream nala channels to confluence with Ramnadi; install trash racks with automated rakes.'
  },
  {
    id: 'pune-drn-003',
    name: 'Bhairobanala Trunk Outfall (Wanowrie)',
    category: 'drainage',
    status: 'critical',
    healthScore: 25,
    location: {
      lat: 18.4960,
      lng: 73.9050,
      address: 'Wanowrie - Hadapsar Link Rd, Bhairoba Stream Crossing',
      ward: 'Hadapsar - Mundhwa Ward Office'
    },
    issue: 'Severe bottleneck & culvert structural cracking',
    rootCause: 'Macro-debris entrapment under multi-cell culvert; upstream flash-inflow exceeds hydraulic gradient by 180%.',
    daysToFailure: 6,
    criticality: 'CRITICAL',
    failureProbability: 95.8,
    proactiveCost: 520000,
    reactiveCost: 9200000,
    telemetry: {
      flowRate: [15, 12, 9, 4, 3, 5, 4],
      siltBlockage: 91,
      waterLevel: [75, 78, 89, 97, 98, 94, 92],
      trafficDensity: [35, 15, 88, 82, 85, 78, 50],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-21',
    recommendedAction: 'Mobilize emergency PMC drainage strike team with excavator shears; clear 400m downstream bottleneck immediately.'
  },
  {
    id: 'pune-drn-004',
    name: 'Deccan Gymkhana Riverside Conduit',
    category: 'drainage',
    status: 'healthy',
    healthScore: 89,
    location: {
      lat: 18.5173,
      lng: 73.8415,
      address: 'Z-Bridge Underpass & Pulachi Wadi Drainage Outfall',
      ward: 'Kasba - Vishrambaug Wada Ward Office'
    },
    issue: null,
    rootCause: 'Smart flap gates and IoT-enabled non-return backflow valves functioning at 98% hydraulic efficiency.',
    daysToFailure: 270,
    criticality: 'LOW',
    failureProbability: 6.4,
    proactiveCost: 120000,
    reactiveCost: 1900000,
    telemetry: {
      flowRate: [85, 82, 79, 88, 86, 84, 82],
      siltBlockage: 12,
      waterLevel: [20, 22, 28, 35, 34, 30, 25],
      trafficDensity: [60, 30, 92, 88, 96, 85, 62],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-14',
    recommendedAction: 'Routine telemetry ping verification and ultrasonic level sensor battery health check.'
  },
  {
    id: 'pune-drn-005',
    name: 'Ambil Odha Stormwater Channel (Parvati)',
    category: 'drainage',
    status: 'critical',
    healthScore: 28,
    location: {
      lat: 18.4891,
      lng: 73.8519,
      address: 'Near Parvati Paytha / Mitra Mandal Chowk, Sahakar Nagar Canal Network',
      ward: 'Sahakarnagar Ward Office'
    },
    issue: 'High flood hazard: Retaining wall breach & bed siltation',
    rootCause: 'Pre-monsoon boulder sedimentation restricting cross-sectional hydraulic discharge by 75%.',
    daysToFailure: 8,
    criticality: 'CRITICAL',
    failureProbability: 93.4,
    proactiveCost: 950000,
    reactiveCost: 18000000,
    telemetry: {
      flowRate: [20, 18, 14, 8, 7, 9, 8],
      siltBlockage: 88,
      waterLevel: [70, 75, 88, 96, 95, 90, 85],
      trafficDensity: [50, 25, 92, 89, 94, 86, 60],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-21',
    recommendedAction: 'Execute reinforced concrete retaining wall repairs and clear 1.2km channel stretch with long-boom excavators.'
  },
  {
    id: 'pune-drn-006',
    name: 'Nagzari Nala Central Siphon (Bhavani Peth)',
    category: 'drainage',
    status: 'critical',
    healthScore: 33,
    location: {
      lat: 18.5186,
      lng: 73.8643,
      address: 'Central Old Pune Canal, Bhavani Peth / Nana Peth Junction',
      ward: 'Bhavani Peth Ward Office'
    },
    issue: 'Dense urban runoff clogging & micro-fractures in brick masonry canal',
    rootCause: 'Overloaded legacy British-era brick conduit experiencing structural surcharge and silt sedimentation.',
    daysToFailure: 12,
    criticality: 'CRITICAL',
    failureProbability: 87.5,
    proactiveCost: 680000,
    reactiveCost: 12000000,
    telemetry: {
      flowRate: [25, 22, 18, 12, 10, 14, 11],
      siltBlockage: 82,
      waterLevel: [65, 68, 80, 90, 92, 85, 80],
      trafficDensity: [70, 35, 95, 92, 98, 90, 70],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-19',
    recommendedAction: 'Cured-in-place pipe (CIPP) trenchless relining and deployment of robotic continuous silt extraction dredgers.'
  },

  // ==========================================
  // ARTERIAL ROADS & EXPRESSWAYS
  // ==========================================
  {
    id: 'pune-rd-001',
    name: 'Karve Road Arterial (Nal Stop to Garware)',
    category: 'road',
    status: 'warning',
    healthScore: 60,
    location: {
      lat: 18.5098,
      lng: 73.8315,
      address: 'Karve Road Metro Corridor, Nal Stop Flyover Underdeck to Garware College',
      ward: 'Kothrud - Bavdhan Ward Office'
    },
    issue: 'Pothole formation due to recent stormwater trenching',
    rootCause: 'Inadequate sub-base compaction following utility duct excavation; water ingress causing bitumen layer delamination.',
    daysToFailure: 24,
    criticality: 'HIGH',
    failureProbability: 62.0,
    proactiveCost: 380000,
    reactiveCost: 4200000,
    telemetry: {
      potholeCount: 19,
      trafficDensity: [65, 35, 98, 94, 99, 92, 70],
      vibration: [0.38, 0.42, 0.65, 0.72, 0.68, 0.59, 0.48],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-18',
    recommendedAction: 'Deploy cold-mix asphalt micro-surfacing and infra-red asphalt thermal patchers during night-shift 01:00-05:00.'
  },
  {
    id: 'pune-rd-002',
    name: 'North Main Road, Mundhwa',
    category: 'road',
    status: 'critical',
    healthScore: 35,
    location: {
      lat: 18.5385,
      lng: 73.9212,
      address: 'Koregaon Park Ext to Mundhwa Bridge Industrial Corridor',
      ward: 'Hadapsar - Mundhwa Ward Office'
    },
    issue: 'Asphalt deterioration & heavy waterlogging',
    rootCause: 'Complete loss of pavement subgrade shear strength due to persistent standing runoff and 40T multi-axle dumper movements.',
    daysToFailure: 11,
    criticality: 'CRITICAL',
    failureProbability: 88.6,
    proactiveCost: 650000,
    reactiveCost: 8900000,
    telemetry: {
      potholeCount: 47,
      trafficDensity: [50, 40, 92, 89, 96, 91, 65],
      vibration: [0.55, 0.60, 0.92, 1.05, 0.98, 0.88, 0.72],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-20',
    recommendedAction: 'Full-depth reclamation with cementitious binder stabilization; install edge perforated drain pipes.'
  },
  {
    id: 'pune-rd-003',
    name: 'Pune-Satara Road (Swargate to Katraj BRT)',
    category: 'road',
    status: 'healthy',
    healthScore: 88,
    location: {
      lat: 18.4721,
      lng: 73.8580,
      address: 'Swargate to Katraj BRT Corridor (Dhankawadi / Padmawati)',
      ward: 'Dhanakawadi - Sahakarnagar Ward Office'
    },
    issue: null,
    rootCause: 'High-grade mastic asphalt layer intact. Lane markings, reflective studs, and stormwater drains clear.',
    daysToFailure: 310,
    criticality: 'LOW',
    failureProbability: 7.8,
    proactiveCost: 180000,
    reactiveCost: 2600000,
    telemetry: {
      potholeCount: 2,
      trafficDensity: [70, 45, 96, 91, 95, 88, 68],
      vibration: [0.20, 0.18, 0.29, 0.32, 0.30, 0.27, 0.22],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-11',
    recommendedAction: 'Quarterly skid resistance LiDAR assessment and scheduled thermic paint restriping.'
  },
  {
    id: 'pune-rd-004',
    name: 'Wakad - Hinjawadi IT Corridor Highway',
    category: 'road',
    status: 'healthy',
    healthScore: 86,
    location: {
      lat: 18.5987,
      lng: 73.7629,
      address: 'Wakad Bridge connecting Mumbai Highway & Rajiv Gandhi Infotech Park',
      ward: 'Aundh - Baner Ward Office'
    },
    issue: null,
    rootCause: 'Sensor array reports optimal pavement stress dissipation across peak IT shift corridors.',
    daysToFailure: 280,
    criticality: 'LOW',
    failureProbability: 8.9,
    proactiveCost: 240000,
    reactiveCost: 3800000,
    telemetry: {
      potholeCount: 3,
      trafficDensity: [80, 50, 99, 94, 100, 95, 78],
      vibration: [0.22, 0.19, 0.34, 0.38, 0.35, 0.31, 0.25],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-17',
    recommendedAction: 'Real-time weight-in-motion (WIM) sensor recalibration ahead of smart signal coordination trial.'
  },
  {
    id: 'pune-rd-005',
    name: 'Nagar Road IT Corridor (Viman Nagar - Kharadi)',
    category: 'road',
    status: 'warning',
    healthScore: 58,
    location: {
      lat: 18.5562,
      lng: 73.9112,
      address: 'Nagar Road Arterial Corridor from Kalyani Nagar to Kharadi Bypass',
      ward: 'Nagar Road - Kharadi Ward Office'
    },
    issue: 'Bitumen bleeding and rutting along heavy bus lanes',
    rootCause: 'High ambient pavement temperatures combined with continuous decelerating BRTS bus axle loads.',
    daysToFailure: 36,
    criticality: 'HIGH',
    failureProbability: 52.6,
    proactiveCost: 800000,
    reactiveCost: 13000000,
    telemetry: {
      potholeCount: 22,
      trafficDensity: [75, 45, 98, 96, 100, 92, 70],
      vibration: [0.42, 0.48, 0.76, 0.84, 0.78, 0.65, 0.52],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-19',
    recommendedAction: 'Mill and overlay with stone matrix asphalt (SMA) and polymer-modified bitumen (PMB-40).'
  },
  {
    id: 'pune-rd-006',
    name: 'Sinhagad Road Expressway (Dhayari to Rajaram)',
    category: 'road',
    status: 'critical',
    healthScore: 39,
    location: {
      lat: 18.4682,
      lng: 73.8184,
      address: 'Sinhagad Road Arterial Corridor, Dhayari Phata to Manikbaug',
      ward: 'Sinhagad Road Ward Office'
    },
    issue: 'Severe pavement cracking and subgrade waterlogging',
    rootCause: 'Inadequate stormwater cross-drainage causing recurrent monsoon sub-base saturation and extensive fatigue cracking.',
    daysToFailure: 16,
    criticality: 'CRITICAL',
    failureProbability: 84.0,
    proactiveCost: 1050000,
    reactiveCost: 17000000,
    telemetry: {
      potholeCount: 38,
      trafficDensity: [65, 40, 99, 95, 100, 94, 72],
      vibration: [0.58, 0.64, 0.98, 1.12, 1.02, 0.90, 0.75],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-20',
    recommendedAction: 'Full-depth cement stabilized base reconstruction and construction of continuous concrete roadside drains.'
  },
  {
    id: 'pune-rd-007',
    name: 'Pune-Solapur Arterial Highway (Hadapsar)',
    category: 'road',
    status: 'warning',
    healthScore: 54,
    location: {
      lat: 18.5028,
      lng: 73.9312,
      address: 'Hadapsar Gadital Chowk & Magarpatta Flyover Approach',
      ward: 'Hadapsar - Mundhwa Ward Office'
    },
    issue: 'Surface rutting and edge raveling near market zone',
    rootCause: 'High stationary axle loading from heavy goods carriers and agricultural freight near vegetable market.',
    daysToFailure: 29,
    criticality: 'HIGH',
    failureProbability: 61.2,
    proactiveCost: 720000,
    reactiveCost: 11000000,
    telemetry: {
      potholeCount: 26,
      trafficDensity: [70, 40, 97, 94, 99, 93, 75],
      vibration: [0.45, 0.50, 0.78, 0.86, 0.80, 0.68, 0.55],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-17',
    recommendedAction: 'High-modulus asphalt concrete (HMAC) resurfacing and dedicated freight lane enforcement.'
  },
  {
    id: 'pune-rd-008',
    name: 'Aundh-Ravet BRTS Road (Bremen Chowk)',
    category: 'road',
    status: 'healthy',
    healthScore: 92,
    location: {
      lat: 18.5621,
      lng: 73.8012,
      address: 'Bremen Chowk to University Circle Corridor, Aundh',
      ward: 'Aundh - Baner Ward Office'
    },
    issue: null,
    rootCause: 'High-durability mastic asphalt wearing course in excellent condition. Regular street sweeper cleaning active.',
    daysToFailure: 340,
    criticality: 'LOW',
    failureProbability: 4.5,
    proactiveCost: 190000,
    reactiveCost: 3200000,
    telemetry: {
      potholeCount: 1,
      trafficDensity: [75, 45, 94, 90, 95, 88, 65],
      vibration: [0.19, 0.17, 0.28, 0.30, 0.27, 0.24, 0.20],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-13',
    recommendedAction: 'Routine laser profilometer ride-quality assessment and quarterly drainage pit clearance.'
  },
  {
    id: 'pune-rd-009',
    name: 'Koregaon Park North Main Road',
    category: 'road',
    status: 'warning',
    healthScore: 63,
    location: {
      lat: 18.5368,
      lng: 73.8962,
      address: 'North Main Road Corridor, Burning Ghat Road to Lane 7',
      ward: 'Dhole Patil Road Ward Office'
    },
    issue: 'Tree root upheaval and surface pitting',
    rootCause: 'Heritage banyan tree root systems intruding under asphalt wearing course causing pavement upheaval.',
    daysToFailure: 45,
    criticality: 'MEDIUM',
    failureProbability: 44.8,
    proactiveCost: 410000,
    reactiveCost: 6800000,
    telemetry: {
      potholeCount: 14,
      trafficDensity: [55, 30, 90, 86, 92, 88, 62],
      vibration: [0.35, 0.38, 0.58, 0.64, 0.60, 0.52, 0.42],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-16',
    recommendedAction: 'Install root barrier deflectors, mill surface upheaval, and lay flexible porous asphalt layer.'
  },
  {
    id: 'pune-rd-010',
    name: 'Katraj Ghat Bypass Section',
    category: 'road',
    status: 'critical',
    healthScore: 36,
    location: {
      lat: 18.4421,
      lng: 73.8562,
      address: 'Old Katraj Tunnel Approach & Ghat Section, NH-4 Bypass',
      ward: 'Dhanakawadi - Sahakarnagar Ward Office'
    },
    issue: 'Slope instability, rockfall hazard & severe pavement rutting',
    rootCause: 'Monsoon hillside seepage saturating road embankment; heavy overloaded inter-state trucks causing deep rutting.',
    daysToFailure: 13,
    criticality: 'CRITICAL',
    failureProbability: 89.2,
    proactiveCost: 900000,
    reactiveCost: 15000000,
    telemetry: {
      potholeCount: 34,
      trafficDensity: [60, 45, 96, 92, 98, 94, 78],
      vibration: [0.60, 0.68, 1.05, 1.20, 1.10, 0.95, 0.80],
      timestamps: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    lastInspected: '2026-08-20',
    recommendedAction: 'Install high-tensile rockfall protection netting, soil nailing along slope, and heavy-duty concrete pavement overlay.'
  }
];

export const INITIAL_COST_TREND: CostDataPoint[] = [
  { month: 'Jan', proactive: 950000, reactive: 6200000, saved: 5250000 },
  { month: 'Feb', proactive: 1100000, reactive: 6800000, saved: 5700000 },
  { month: 'Mar', proactive: 1300000, reactive: 8400000, saved: 7100000 },
  { month: 'Apr', proactive: 1450000, reactive: 9800000, saved: 8350000 },
  { month: 'May', proactive: 1800000, reactive: 12500000, saved: 10700000 },
  { month: 'Jun', proactive: 2100000, reactive: 15200000, saved: 13100000 },
  { month: 'Jul (Monsoon)', proactive: 2400000, reactive: 18900000, saved: 16500000 },
  { month: 'Aug (Current)', proactive: 1950000, reactive: 14200000, saved: 12250000 }
];

export const INITIAL_URGENT_ALERTS: UrgentAlert[] = [
  {
    id: 'alt-001',
    assetId: 'pune-drn-003',
    assetName: 'Bhairobanala Trunk Outfall',
    category: 'drainage',
    message: 'URGENT: Bhairobanala Silt Blockage at 91% — 6 Days to Catastrophic Overflow',
    severity: 'critical',
    timestamp: '12 mins ago',
    ward: 'Hadapsar - Mundhwa'
  },
  {
    id: 'alt-002',
    assetId: 'pune-drn-001',
    assetName: 'Shahir Amar Shaikh Chowk Drainage',
    category: 'drainage',
    message: 'CRITICAL: Silt blockage > 85% near Pune Station; flood risk elevated',
    severity: 'critical',
    timestamp: '28 mins ago',
    ward: 'Bhavani Peth'
  },
  {
    id: 'alt-003',
    assetId: 'pune-brg-003',
    assetName: 'Bund Garden Bridge',
    category: 'bridge',
    message: 'ALERT: Masonry arch shear stress spike detected on Mula-Mutha span',
    severity: 'critical',
    timestamp: '1 hour ago',
    ward: 'Dhole Patil Road'
  },
  {
    id: 'alt-004',
    assetId: 'pune-drn-005',
    assetName: 'Ambil Odha Stormwater Channel',
    category: 'drainage',
    message: 'ALERT: Parvati Paytha culvert bed sedimentation exceeding 88%',
    severity: 'critical',
    timestamp: '1.5 hours ago',
    ward: 'Sahakarnagar'
  },
  {
    id: 'alt-005',
    assetId: 'pune-rd-002',
    assetName: 'North Main Road, Mundhwa',
    category: 'road',
    message: 'WARNING: Rapid pothole clustering (47 count) causing 4.2km traffic tailback',
    severity: 'critical',
    timestamp: '2 hours ago',
    ward: 'Hadapsar - Mundhwa'
  },
  {
    id: 'alt-006',
    assetId: 'pune-brg-002',
    assetName: 'Rajaram Bridge',
    category: 'bridge',
    message: 'WARNING: Micro-acoustic shear stress detected on Pier 4 footing',
    severity: 'warning',
    timestamp: '3 hours ago',
    ward: 'Sinhagad Road'
  }
];

export function calculateDashboardStats(assets: InfrastructureAsset[]): DashboardStats {
  const totalAssetsMonitored = 428; // Total Pune sensor nodes monitored across city telemetry network
  
  // Calculate average health of active tracked nodes
  const avgHealth = Math.round(
    assets.reduce((sum, a) => sum + a.healthScore, 0) / assets.length
  );

  const criticalCount = assets.filter(a => a.status === 'critical').length;
  const warningCount = assets.filter(a => a.status === 'warning').length;
  const healthyCount = assets.filter(a => a.status === 'healthy').length;

  const bridgeList = assets.filter(a => a.category === 'bridge');
  const drainageList = assets.filter(a => a.category === 'drainage');
  const roadList = assets.filter(a => a.category === 'road');

  // Predictive failure counts
  const failures30 = assets.filter(a => a.daysToFailure <= 30).length;
  const failures60 = assets.filter(a => a.daysToFailure <= 60).length;
  const failures90 = assets.filter(a => a.daysToFailure <= 90).length;

  // Financial calculations in INR: Total proactive cost vs catastrophic reactive rebuild cost
  const proactiveTotal = assets.reduce((sum, a) => sum + a.proactiveCost, 0);
  const reactiveTotal = assets.reduce((sum, a) => sum + a.reactiveCost, 0);
  const netSaved = reactiveTotal - proactiveTotal;
  const savingsPercentage = Math.round((netSaved / reactiveTotal) * 100);

  return {
    totalAssetsMonitored,
    citywideHealthIndex: avgHealth,
    predictedFailures30d: failures30,
    predictedFailures60d: failures60,
    predictedFailures90d: failures90,
    financials: {
      proactiveTotal,
      reactiveTotal,
      netSaved,
      savingsPercentage
    },
    categoryBreakdown: {
      bridge: {
        total: bridgeList.length,
        healthy: bridgeList.filter(a => a.status === 'healthy').length,
        warning: bridgeList.filter(a => a.status === 'warning').length,
        critical: bridgeList.filter(a => a.status === 'critical').length
      },
      drainage: {
        total: drainageList.length,
        healthy: drainageList.filter(a => a.status === 'healthy').length,
        warning: drainageList.filter(a => a.status === 'warning').length,
        critical: drainageList.filter(a => a.status === 'critical').length
      },
      road: {
        total: roadList.length,
        healthy: roadList.filter(a => a.status === 'healthy').length,
        warning: roadList.filter(a => a.status === 'warning').length,
        critical: roadList.filter(a => a.status === 'critical').length
      }
    },
    costTrend: INITIAL_COST_TREND,
    urgentAlerts: INITIAL_URGENT_ALERTS,
    lastUpdated: new Date().toISOString()
  };
}
