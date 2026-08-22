import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfrastructureAsset } from '../../types';
import { formatInr, formatInrFull } from '../../utils/formatCurrency';
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
  MapPin
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

interface AssetDrawerProps {
  asset: InfrastructureAsset | null;
  onClose: () => void;
  onDispatchWorkOrder: (assetId: string, actionType: string) => Promise<void>;
  isDispatching?: boolean;
}

export const AssetDrawer: React.FC<AssetDrawerProps> = ({
  asset,
  onClose,
  onDispatchWorkOrder,
  isDispatching = false
}) => {
  const [step, setStep] = useState<'overview' | 'plan_ready' | 'success'>('overview');

  if (!asset) return null;

  const isHealthy = asset.status === 'healthy';
  const isWarning = asset.status === 'warning';
  const isCritical = asset.status === 'critical';

  const getStatusBadge = () => {
    if (isHealthy) return { label: 'HEALTHY', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    if (isWarning) return { label: 'WARNING DETECTED', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    return { label: 'CRITICAL HOTSPOT', bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
  };

  const statusBadge = getStatusBadge();

  // Prepare telemetry data for sparklines
  const telemetryData = asset.telemetry.timestamps.map((t, idx) => ({
    time: t,
    vibration: asset.telemetry.vibration ? asset.telemetry.vibration[idx] : null,
    strain: asset.telemetry.strain ? asset.telemetry.strain[idx] : null,
    acousticStress: asset.telemetry.acousticStress ? asset.telemetry.acousticStress[idx] : null,
    flowRate: asset.telemetry.flowRate ? asset.telemetry.flowRate[idx] : null,
    waterLevel: asset.telemetry.waterLevel ? asset.telemetry.waterLevel[idx] : null,
    traffic: asset.telemetry.trafficDensity ? asset.telemetry.trafficDensity[idx] : null,
  }));

  const handleGeneratePlan = () => {
    setStep('plan_ready');
  };

  const handleExecuteDispatch = async () => {
    try {
      await onDispatchWorkOrder(asset.id, asset.recommendedAction);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setStep('success');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex justify-end">
        {/* Backdrop for mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto lg:hidden"
        />

        {/* Slide-out Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative w-full max-w-lg lg:max-w-xl h-full bg-[#070b17]/98 backdrop-blur-2xl border-l border-slate-700/80 shadow-2xl p-6 overflow-y-auto pointer-events-auto flex flex-col justify-between"
        >
          <div>
            {/* Top Close & Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                    {statusBadge.label}
                  </span>
                  <span className="text-xs uppercase font-mono text-slate-400">
                    ID: {asset.id}
                  </span>
                </div>
                <h2 className="text-xl lg:text-2xl font-black text-white font-display">
                  {asset.name}
                </h2>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{asset.location.address}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Health Score & Failure Countdown Banner */}
            <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Structural Health Index
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className={`text-3xl lg:text-4xl font-black font-display ${
                    isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {asset.healthScore}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">/ 100</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Failure Probability: <span className="text-rose-400 font-bold font-mono">{asset.failureProbability}%</span>
                </div>
              </div>

              <div className="border-l border-slate-800 pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                  Remaining Useful Life (RUL)
                </span>
                <div className="text-3xl lg:text-4xl font-black font-display text-white mt-1 flex items-baseline gap-1">
                  {asset.daysToFailure}
                  <span className="text-xs font-mono font-normal text-slate-400">Days</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span>Inspected: {asset.lastInspected}</span>
                </div>
              </div>
            </div>

            {/* AI Root Cause Diagnostics */}
            <div className="mb-5 p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20 shadow-glow-cyan/10">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-2">
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span className="font-display uppercase tracking-wider">AI Root Cause Diagnostics</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {asset.rootCause}
              </p>
              {asset.issue && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{asset.issue}</span>
                </div>
              )}
            </div>

            {/* Live Simulated Telemetry Sparklines */}
            <div className="space-y-4 mb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  Live Sensor Telemetry Sparklines
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Polling 200Hz
                </span>
              </div>

              {/* Telemetry Chart 1: Vibration / Acoustic Stress */}
              {asset.telemetry.vibration && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">Micro-Vibration Velocity (mm/s)</span>
                    <span className="text-cyan-400 font-bold">
                      {asset.telemetry.vibration[asset.telemetry.vibration.length - 1]} mm/s
                    </span>
                  </div>
                  <div className="h-20 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetryData}>
                        <defs>
                          <linearGradient id="vibGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="vibration" stroke="#06b6d4" strokeWidth={2} fill="url(#vibGrad)" />
                        <Tooltip contentStyle={{ backgroundColor: '#090d19', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Telemetry Chart 2: Strain / Acoustic Stress */}
              {asset.telemetry.strain && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">Structural Dynamic Piezo-Strain (με)</span>
                    <span className="text-amber-400 font-bold">
                      {asset.telemetry.strain[asset.telemetry.strain.length - 1]} με
                    </span>
                  </div>
                  <div className="h-20 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={telemetryData}>
                        <Line type="monotone" dataKey="strain" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#090d19', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Telemetry Chart 3: Drainage Flow & Water Level */}
              {asset.telemetry.flowRate && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="text-slate-400">Culvert Flow Capacity (%)</span>
                    <span className="text-rose-400 font-bold">
                      {asset.telemetry.siltBlockage}% Silt Blocked
                    </span>
                  </div>
                  <div className="h-20 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={telemetryData}>
                        <defs>
                          <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="flowRate" stroke="#f43f5e" strokeWidth={2} fill="url(#flowGrad)" />
                        <Tooltip contentStyle={{ backgroundColor: '#090d19', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Financial ROI Avoidance in INR */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between mb-6 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">Proactive Repair Cost</span>
                <span className="text-cyan-400 font-bold text-sm">{formatInr(asset.proactiveCost)}</span>
              </div>
              <div className="text-center text-slate-500 font-sans">vs</div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block">Emergency Failure Cost</span>
                <span className="text-rose-400 font-bold text-sm">{formatInr(asset.reactiveCost)}</span>
              </div>
            </div>
          </div>

          {/* Action Button Workflow */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            {step === 'overview' && (
              <button
                onClick={handleGeneratePlan}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold font-display text-sm shadow-glow-cyan transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Engineering Plan</span>
              </button>
            )}

            {step === 'plan_ready' && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/40 text-xs">
                  <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                    Recommended PMC Action Plan
                  </div>
                  <p className="text-slate-200 mb-2 leading-relaxed font-sans">
                    {asset.recommendedAction}
                  </p>
                  <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-cyan-800/40">
                    <span>Est. Shift: Night 01:00-05:00</span>
                    <span className="text-emerald-400 font-bold">Target Score: 95/100</span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteDispatch}
                  disabled={isDispatching}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold font-display text-sm shadow-glow-emerald transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isDispatching ? 'Dispatching Strike Crew...' : 'Schedule & Dispatch PMC Crew'}</span>
                </button>
              </div>
            )}

            {step === 'success' && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-center animate-in zoom-in-95 duration-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <div className="text-emerald-300 font-bold font-display text-base">
                  PMC Crew Dispatched & Health Restored!
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Health score updated to 95. Sensor baseline reset to optimal limits.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-mono transition-all"
                >
                  Close Drawer
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
