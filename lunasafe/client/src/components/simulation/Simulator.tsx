import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ScenarioType, SimulationResult, InfrastructureAsset, DashboardStats } from '../../types';
import { TiltCard } from '../common/TiltCard';
import { formatInr } from '../../utils/formatCurrency';
import { 
  CloudRain, 
  Waves, 
  Car, 
  TrendingDown, 
  RotateCcw, 
  Sparkles, 
  ShieldAlert, 
  Cpu, 
  IndianRupee, 
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  Zap
} from 'lucide-react';

interface SimulatorProps {
  onRunSimulation: (scenario: ScenarioType, params?: any) => Promise<SimulationResult>;
  isSimulating?: boolean;
  onNavigateToMap: () => void;
  onNavigateToPredictions: () => void;
}

export const Simulator: React.FC<SimulatorProps> = ({
  onRunSimulation,
  isSimulating = false,
  onNavigateToMap,
  onNavigateToPredictions
}) => {
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('reset');
  const [lastResult, setLastResult] = useState<SimulationResult | null>(null);

  // Custom simulation slider states
  const [rainfall, setRainfall] = useState(150);
  const [riverDischarge, setRiverDischarge] = useState(45000);
  const [trafficSurge, setTrafficSurge] = useState(2.8);

  const scenarios = [
    {
      id: 'monsoon_100yr' as ScenarioType,
      title: 'July Monsoon Cloudburst',
      tagline: '150mm Torrential Rain / 4 hrs',
      description: 'Simulates flash stormwater runoff overload across Ramnadi, Bhairoba, and Nagzari canal networks.',
      icon: CloudRain,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Hydrological Stress',
      borderGlow: 'rose' as const
    },
    {
      id: 'mutha_flood' as ScenarioType,
      title: 'Mutha River Flood Crest',
      tagline: 'Khadakwasla Dam > 45,000 cusecs',
      description: 'Tests hydrodynamic scour velocity and pier acoustic shear on Bund Garden, Rajaram, and Sangam bridges.',
      icon: Waves,
      color: 'from-cyan-500 to-teal-500',
      badge: 'Structural Pier Scour',
      borderGlow: 'rose' as const
    },
    {
      id: 'traffic_surge' as ScenarioType,
      title: 'Wakad IT Corridor Gridlock',
      tagline: '3x Axle Volume (Hinjawadi / Karve)',
      description: 'Models dynamic pavement strain, sub-base shear fatigue, and pothole cluster acceleration.',
      icon: Car,
      color: 'from-amber-500 to-rose-500',
      badge: 'Dynamic Pavement Load',
      borderGlow: 'amber' as const
    },
    {
      id: 'budget_cut' as ScenarioType,
      title: '25% Budget Reduction',
      tagline: 'Deferred Preventative Maintenance',
      description: 'Demonstrates how delaying ₹1.2 Cr in proactive repairs snowballs into ₹18.5 Cr catastrophic emergency rebuild losses.',
      icon: TrendingDown,
      color: 'from-purple-500 to-rose-500',
      badge: 'Fiscal Risk Multiplier',
      borderGlow: 'violet' as const
    }
  ];

  const handleTriggerScenario = async (scenario: ScenarioType) => {
    setActiveScenario(scenario);
    const result = await onRunSimulation(scenario, {
      rainfallMm: rainfall,
      riverDischargeCusecs: riverDischarge,
      trafficIncreasePct: Math.round((trafficSurge - 1) * 100)
    });
    setLastResult(result);
  };

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Simulator Hero Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 text-purple-400 border border-purple-500/30 shadow-glow-violet">
              <SlidersHorizontal className="w-5 h-5" />
            </span>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white font-display">
              PMC Crisis "What-If" Command Center
            </h2>
          </div>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Simulate extreme climate disruptions, peak transit surges, and fiscal shocks on Pune's real infrastructure grid.
          </p>
        </div>

        <button
          onClick={() => handleTriggerScenario('reset')}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
          <span>Restore Normal Baseline</span>
        </button>
      </div>

      {/* Scenario Trigger Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isCurrent = activeScenario === sc.id;

          return (
            <TiltCard
              key={sc.id}
              glowColor={sc.borderGlow}
              onClick={() => handleTriggerScenario(sc.id)}
              className={`flex flex-col justify-between ${
                isCurrent ? 'ring-2 ring-cyan-400 shadow-glow-cyan' : ''
              }`}
            >
              <div className="p-5 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-tr ${sc.color} text-white shadow-md`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {sc.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white font-display">
                    {sc.title}
                  </h3>
                  <div className="text-xs font-semibold text-cyan-400 font-mono mt-0.5">
                    {sc.tagline}
                  </div>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {sc.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    {isCurrent ? '● ACTIVE RUN' : 'Click to execute'}
                  </span>
                  <button className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-400 flex items-center gap-1 font-mono">
                    <span>Simulate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>

      {/* Interactive Parameter Tuner Controls */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-lg font-bold text-white font-display">
            Interactive Climate & Transit Simulation Sliders
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
          {/* Slider 1: Rainfall */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <CloudRain className="w-4 h-4 text-blue-400" /> Cloudburst Intensity
              </span>
              <span className="text-blue-400 font-bold text-sm">{rainfall} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0mm (Dry)</span>
              <span>100mm (Heavy)</span>
              <span>250mm (Severe)</span>
            </div>
          </div>

          {/* Slider 2: Khadakwasla Dam Discharge */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Waves className="w-4 h-4 text-cyan-400" /> Dam Discharge (Cusecs)
              </span>
              <span className="text-cyan-400 font-bold text-sm">{riverDischarge.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="65000"
              step="5000"
              value={riverDischarge}
              onChange={(e) => setRiverDischarge(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>5k (Normal)</span>
              <span>35k (Warning)</span>
              <span>65k (Severe Flood)</span>
            </div>
          </div>

          {/* Slider 3: Traffic Peak Surge */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <Car className="w-4 h-4 text-amber-400" /> Transit Peak Multiplier
              </span>
              <span className="text-amber-400 font-bold text-sm">{trafficSurge}x Load</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="3.5"
              step="0.1"
              value={trafficSurge}
              onChange={(e) => setTrafficSurge(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1.0x (Regular)</span>
              <span>2.0x (Rush Hour)</span>
              <span>3.5x (Gridlock)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Impact Assessment Box */}
      {lastResult && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/40 shadow-glow-cyan/20 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                  <Zap className="w-4 h-4" />
                </span>
                <h3 className="text-xl font-bold text-white font-display">
                  {lastResult.scenarioName}
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-sans">
                {lastResult.impactSummary}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToMap}
                className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-display shadow-glow-cyan transition-all flex items-center gap-1.5"
              >
                <span>Inspect on Map</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Key Metrics Grid in INR */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40">
              <span className="text-rose-300 text-[11px] block font-semibold">Critical Hotspots Surge</span>
              <span className="text-2xl font-black text-rose-400 font-display">
                +{lastResult.newCriticalAssets} Critical Zones
              </span>
            </div>

            <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40">
              <span className="text-amber-300 text-[11px] block font-semibold">Affected Municipal Nodes</span>
              <span className="text-2xl font-black text-amber-400 font-display">
                {lastResult.affectedAssetCount} Nodes Compromised
              </span>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40">
              <span className="text-purple-300 text-[11px] block font-semibold">Catastrophic Risk Exposure</span>
              <span className="text-2xl font-black text-purple-400 font-display">
                {formatInr(lastResult.projectedFinancialDamage)} At Risk
              </span>
            </div>
          </div>

          {/* AI Recommended Mitigation Action Plan */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-cyan-400 font-mono tracking-wider">
                PMC AI Emergency Directive
              </div>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed font-sans">
                {lastResult.aiRecommendation}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
