import React from 'react';
import { DashboardStats, UserRole } from '../../types';
import { TiltCard } from '../common/TiltCard';
import { formatInr } from '../../utils/formatCurrency';
import { 
  Activity, 
  ShieldAlert, 
  TrendingDown, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight,
  Sparkles,
  Layers
} from 'lucide-react';

interface KpiCardsProps {
  stats: DashboardStats;
  currentRole: UserRole;
  onNavigateToMap: () => void;
  onNavigateToPredictions: () => void;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  stats,
  currentRole,
  onNavigateToMap,
  onNavigateToPredictions
}) => {
  const { totalAssetsMonitored, citywideHealthIndex, predictedFailures30d, predictedFailures60d, predictedFailures90d, financials, categoryBreakdown } = stats;

  const getHealthBadge = (score: number) => {
    if (score >= 80) return { label: 'OPTIMAL', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' };
    if (score >= 55) return { label: 'MODERATE RISK', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' };
    return { label: 'CRITICAL ACTION NEEDED', color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' };
  };

  const healthBadge = getHealthBadge(citywideHealthIndex);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
      {/* KPI 1: Citywide Health Index */}
      <TiltCard glowColor={citywideHealthIndex >= 70 ? 'cyan' : 'rose'} onClick={onNavigateToMap}>
        <div className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              City Health Score
            </span>
            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${healthBadge.color}`}>
              {healthBadge.label}
            </span>
          </div>

          <div className="my-4 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
                {citywideHealthIndex}
              </span>
              <span className="text-slate-500 font-mono text-sm font-semibold">/ 100</span>
            </div>

            {/* Circular Mini Gauge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="4" className="text-slate-800" fill="transparent" />
                <circle
                  cx="24"
                  cy="24"
                  r="18"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * citywideHealthIndex) / 100}
                  className="text-cyan-400 transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <Sparkles className="w-4 h-4 text-cyan-400 absolute" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px]">15 Pune Municipal Zones</span>
            <span className="text-cyan-400 font-semibold flex items-center gap-0.5 text-[11px] group-hover:translate-x-0.5 transition-transform">
              View GIS Map <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </TiltCard>

      {/* KPI 2: Total Assets Monitored */}
      <TiltCard glowColor="emerald" onClick={onNavigateToMap}>
        <div className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Monitored Assets
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
              {totalAssetsMonitored} Active Nodes
            </span>
          </div>

          <div className="my-4">
            <div className="text-4xl lg:text-5xl font-black font-display tracking-tight text-white">
              {totalAssetsMonitored}
              <span className="text-emerald-400 text-2xl font-light ml-1">+</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Bridges • Storm Drains • Arterial Roads
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 grid grid-cols-3 gap-1 text-[11px] text-center font-mono">
            <div className="bg-slate-950/60 p-1 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Bridges</div>
              <div className="font-bold text-slate-200">{categoryBreakdown.bridge.total} Nodes</div>
            </div>
            <div className="bg-slate-950/60 p-1 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Drainage</div>
              <div className="font-bold text-slate-200">{categoryBreakdown.drainage.total} Hotspots</div>
            </div>
            <div className="bg-slate-950/60 p-1 rounded border border-slate-800/80">
              <div className="text-slate-400 text-[10px]">Roads</div>
              <div className="font-bold text-slate-200">{categoryBreakdown.road.total} Corridors</div>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* KPI 3: Predicted Failures (30/60/90 Days) */}
      <TiltCard glowColor="rose" onClick={onNavigateToPredictions}>
        <div className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              Predicted Failures
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border text-rose-400 border-rose-500/30 bg-rose-500/10">
              AI Risk Horizon
            </span>
          </div>

          <div className="my-3 grid grid-cols-3 gap-2 text-center font-mono">
            <div className="p-2 rounded-xl bg-rose-950/30 border border-rose-800/40">
              <div className="text-[10px] text-rose-300 font-semibold">&lt;30 Days</div>
              <div className="text-2xl font-black font-display text-rose-400">{predictedFailures30d}</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-800/40">
              <div className="text-[10px] text-amber-300 font-semibold">&lt;60 Days</div>
              <div className="text-2xl font-black font-display text-amber-400">{predictedFailures60d}</div>
            </div>
            <div className="p-2 rounded-xl bg-blue-950/30 border border-blue-800/40">
              <div className="text-[10px] text-blue-300 font-semibold">&lt;90 Days</div>
              <div className="text-2xl font-black font-display text-blue-400">{predictedFailures90d}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="text-[11px] text-rose-400 font-semibold">Immediate Triage Ready</span>
            <span className="text-rose-400 font-semibold flex items-center gap-0.5 text-[11px]">
              AI Queue <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </TiltCard>

      {/* KPI 4: Proactive vs Reactive Savings in INR */}
      <TiltCard glowColor="amber">
        <div className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
              <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
              Cost Avoidance ROI
            </span>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border text-amber-400 border-amber-500/30 bg-amber-500/10">
              {financials.savingsPercentage}% Budget Saved
            </span>
          </div>

          <div className="my-4 flex items-baseline justify-between">
            <div>
              <div className="text-3xl lg:text-4xl font-black font-display tracking-tight text-white flex items-baseline gap-1">
                {formatInr(financials.netSaved)}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 font-mono">
                <span className="text-cyan-400 font-semibold">{formatInr(financials.proactiveTotal)} Proactive</span>
                <span className="text-slate-600">vs</span>
                <span className="text-rose-400 font-semibold line-through">{formatInr(financials.reactiveTotal)} Reactive</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" /> 8.5x Municipal ROI
            </span>
            <span className="text-slate-500">PMC Annualized</span>
          </div>
        </div>
      </TiltCard>
    </div>
  );
};
