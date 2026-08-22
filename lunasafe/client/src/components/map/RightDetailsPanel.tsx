import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfrastructureAsset } from '../../types';
import { formatInr } from '../../utils/formatCurrency';
import { 
  X, 
  Building2, 
  Waves, 
  Navigation, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Wrench, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  MapPin,
  ShieldAlert,
  Flame,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import confetti from 'canvas-confetti';

interface RightDetailsPanelProps {
  asset: InfrastructureAsset | null;
  allAssets: InfrastructureAsset[];
  onSelectAsset: (asset: InfrastructureAsset | null) => void;
  onDispatchWorkOrder: (assetId: string, actionType: string) => Promise<void>;
  isDispatching?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const RightDetailsPanel: React.FC<RightDetailsPanelProps> = ({
  asset,
  allAssets,
  onSelectAsset,
  onDispatchWorkOrder,
  isDispatching = false,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const [step, setStep] = useState<'overview' | 'plan_ready' | 'success'>('overview');

  // Filter urgent / critical assets for default overview view
  const criticalAssets = allAssets.filter(a => a.status === 'critical');
  const warningAssets = allAssets.filter(a => a.status === 'warning');

  const handleGeneratePlan = () => {
    setStep('plan_ready');
  };

  const handleExecuteDispatch = async () => {
    if (!asset) return;
    try {
      await onDispatchWorkOrder(asset.id, asset.recommendedAction);
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
      setStep('success');
    } catch (e) {
      console.error(e);
    }
  };

  if (isCollapsed) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-between p-3 w-14 bg-[#070b17]/98 border-l border-slate-800/80 shrink-0 h-full">
        <button
          onClick={onToggleCollapse}
          title="Expand Right Details Panel"
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-cyan-400 transition-all"
        >
          <PanelRightOpen className="w-4 h-4" />
        </button>
        <div className="[writing-mode:vertical-lr] text-xs font-mono font-bold tracking-wider text-slate-400 rotate-180 flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>PMC Telemetry Panel</span>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>
    );
  }

  return (
    <aside className="w-full lg:w-96 xl:w-[410px] bg-[#070b17]/98 backdrop-blur-2xl border-t lg:border-t-0 lg:border-l border-slate-800/80 p-4 lg:p-5 flex flex-col justify-between shrink-0 h-full overflow-y-auto z-20 shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-white font-display">
              {asset ? 'Asset Telemetry & Diagnostics' : 'PMC Critical Hotspots'}
            </h3>
            <span className="text-[10px] font-mono text-slate-400">
              {asset ? `Node ID: ${asset.id}` : `${criticalAssets.length} Critical / ${warningAssets.length} Warning Nodes`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {asset && (
            <button
              onClick={() => {
                onSelectAsset(null);
                setStep('overview');
              }}
              title="Return to Hotspot List"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Collapse Panel"
              className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white hidden lg:flex"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* VIEW A: Single Selected Asset Deep Inspection */}
      {asset ? (
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            {/* Title & Status Badge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border font-mono ${
                  asset.status === 'critical'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : asset.status === 'warning'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}>
                  {asset.status === 'critical' ? 'CRITICAL HOTSPOT' : asset.status === 'warning' ? 'WARNING ACTIVE' : 'HEALTHY NORMAL'}
                </span>
                <span className="text-[10px] font-mono text-slate-400 uppercase">
                  {asset.category}
                </span>
              </div>
              <h2 className="text-base lg:text-lg font-black text-white font-display">
                {asset.name}
              </h2>
              <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">{asset.location.address}</span>
              </div>
            </div>

            {/* Health Score & RUL Counter */}
            <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 my-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Health Index
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-2xl font-black font-display ${
                    asset.status === 'critical' ? 'text-rose-400' : asset.status === 'warning' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {asset.healthScore}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">/ 100</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Failure: <span className="text-rose-400 font-bold">{asset.failureProbability}%</span>
                </div>
              </div>

              <div className="border-l border-slate-800 pl-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  RUL Countdown
                </span>
                <div className="text-2xl font-black font-display text-white mt-0.5 flex items-baseline gap-1">
                  {asset.daysToFailure}
                  <span className="text-xs font-mono font-normal text-slate-400">Days</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>{asset.lastInspected}</span>
                </div>
              </div>
            </div>

            {/* AI Root Cause Diagnostics */}
            <div className="p-3 rounded-xl bg-slate-950/90 border border-cyan-500/20 mb-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-1 font-display">
                <Cpu className="w-3.5 h-3.5 animate-pulse" />
                <span className="uppercase tracking-wider">AI Root Cause</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {asset.rootCause}
              </p>
              {asset.issue && (
                <div className="mt-2 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>{asset.issue}</span>
                </div>
              )}
            </div>

            {/* Telemetry Sparklines */}
            <div className="space-y-2.5 mb-3">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-300 font-bold flex items-center gap-1">
                  <Activity className="w-3 h-3 text-cyan-400" /> Live Sensor Polling
                </span>
                <span className="text-emerald-400 text-[10px]">200Hz Realtime</span>
              </div>

              {/* Vibration Chart */}
              {asset.telemetry.vibration && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Micro-Vibration</span>
                    <span className="text-cyan-400 font-bold">
                      {asset.telemetry.vibration[asset.telemetry.vibration.length - 1]} mm/s
                    </span>
                  </div>
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={asset.telemetry.timestamps.map((t, idx) => ({ time: t, v: asset.telemetry.vibration![idx] }))}>
                        <Area type="monotone" dataKey="v" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Strain Chart */}
              {asset.telemetry.strain && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Dynamic Piezo-Strain</span>
                    <span className="text-amber-400 font-bold">
                      {asset.telemetry.strain[asset.telemetry.strain.length - 1]} με
                    </span>
                  </div>
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={asset.telemetry.timestamps.map((t, idx) => ({ time: t, s: asset.telemetry.strain![idx] }))}>
                        <Line type="monotone" dataKey="s" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Silt Blockage & Culvert Flow */}
              {asset.telemetry.flowRate && (
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="text-slate-400">Canal Flow Capacity</span>
                    <span className="text-rose-400 font-bold">{asset.telemetry.siltBlockage}% Silt Blocked</span>
                  </div>
                  <div className="h-16 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={asset.telemetry.timestamps.map((t, idx) => ({ time: t, f: asset.telemetry.flowRate![idx] }))}>
                        <Area type="monotone" dataKey="f" stroke="#f43f5e" strokeWidth={2} fill="#f43f5e" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Financial ROI Avoidance */}
            <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-[11px] font-mono mb-3">
              <div>
                <span className="text-slate-400 text-[10px] block">Proactive Repair</span>
                <span className="text-cyan-400 font-bold">{formatInr(asset.proactiveCost)}</span>
              </div>
              <div className="text-slate-500 font-sans">vs</div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Emergency Failure</span>
                <span className="text-rose-400 font-bold">{formatInr(asset.reactiveCost)}</span>
              </div>
            </div>
          </div>

          {/* Action Dispatch Workflow */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            {step === 'overview' && (
              <button
                onClick={handleGeneratePlan}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold font-display text-xs shadow-glow-cyan transition-all flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate AI Engineering Plan</span>
              </button>
            )}

            {step === 'plan_ready' && (
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs">
                  <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1 text-[11px]">
                    <Wrench className="w-3 h-3 text-cyan-400" />
                    Recommended PMC Action Plan
                  </div>
                  <p className="text-slate-200 text-[11px] leading-relaxed font-sans">
                    {asset.recommendedAction}
                  </p>
                </div>

                <button
                  onClick={handleExecuteDispatch}
                  disabled={isDispatching}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold font-display text-xs shadow-glow-emerald transition-all flex items-center justify-center gap-1.5 active:scale-98 disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isDispatching ? 'Dispatching...' : 'Confirm & Dispatch Crew'}</span>
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <div className="text-emerald-300 font-bold font-display text-xs">
                  PMC Crew Dispatched!
                </div>
                <p className="text-[10px] text-slate-300">
                  Health restored to 95. Sensor baseline reset.
                </p>
                <button
                  onClick={() => {
                    setStep('overview');
                    onSelectAsset(null);
                  }}
                  className="mt-2 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold font-mono"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VIEW B: List of Top Urgent Critical Hotspots */
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
              <span>Immediate Attention Required</span>
              <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/30">
                {criticalAssets.length} Critical
              </span>
            </div>

            {/* List of critical assets */}
            <div className="space-y-2.5 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {allAssets
                .filter(a => a.status !== 'healthy')
                .map((item) => {
                  const isCrit = item.status === 'critical';
                  return (
                    <div
                      key={item.id}
                      onClick={() => onSelectAsset(item)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 group ${
                        isCrit
                          ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-500 hover:bg-rose-950/30'
                          : 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500 hover:bg-amber-950/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors font-display">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {item.location.ward.replace(' Ward Office', '')} • {item.category}
                          </div>
                        </div>

                        <span className={`text-[10px] font-black font-display px-2 py-0.5 rounded ${
                          isCrit ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}>
                          {item.healthScore}/100
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight font-sans">
                        {item.issue || item.rootCause}
                      </p>

                      <div className="flex items-center justify-between text-[10px] font-mono pt-2 border-t border-slate-800/80">
                        <span className="text-rose-400 font-bold">Failure in ~{item.daysToFailure} Days</span>
                        <span className="text-cyan-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                          <span>Inspect Telemetry</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>PMC Realtime Calibration</span>
            <span className="text-emerald-400 font-bold">Active Polling</span>
          </div>
        </div>
      )}
    </aside>
  );
};
