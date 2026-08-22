import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  UserCheck,
  Info,
  ChevronRight,
  TrendingUp,
  Sparkles,
  RefreshCw,
  FileCheck
} from 'lucide-react';
import { CandidateZone, AIRationale } from '../types/landing';

interface ExplainabilityPanelProps {
  selectedZone: CandidateZone | null;
  recommendedZone: CandidateZone | null;
  rationale: AIRationale;
  abortRecommended: boolean;
  degradationFlags: string[];
  onApprove: () => void;
  onOverride: (zoneId: string, rationale: string) => void;
  onRequestAlternate: () => void;
  onTriggerAbort: () => void;
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({
  selectedZone,
  recommendedZone,
  rationale,
  abortRecommended,
  degradationFlags,
  onApprove,
  onOverride,
  onRequestAlternate,
  onTriggerAbort,
}) => {
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [approvedNotification, setApprovedNotification] = useState(false);

  const currentZone = selectedZone || recommendedZone;
  const isOverridden = selectedZone && recommendedZone && selectedZone.zone_id !== recommendedZone.zone_id;

  const handleApproveClick = () => {
    onApprove();
    setApprovedNotification(true);
    setTimeout(() => setApprovedNotification(false), 4000);
  };

  const handleOverrideSubmit = () => {
    if (currentZone) {
      onOverride(currentZone.zone_id, overrideReason || 'Pilot commanded alternate landing site.');
      setOverrideModalOpen(false);
      setOverrideReason('');
    }
  };

  return (
    <div className="flex flex-col gap-4 text-slate-100">
      {/* Primary Mission Decision Header */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          abortRecommended
            ? 'bg-rose-950/40 border-rose-500/50 shadow-lg shadow-rose-950/50'
            : isOverridden
            ? 'bg-amber-950/40 border-amber-500/50 shadow-lg shadow-amber-950/50'
            : 'bg-emerald-950/30 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                abortRecommended
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : isOverridden
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {abortRecommended ? (
                <ShieldAlert className="w-6 h-6" />
              ) : isOverridden ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                AI Flight Computer Decision
              </div>
              <div className="text-base font-bold text-slate-50 tracking-tight">
                {isOverridden
                  ? `PILOT OVERRIDE ACTIVE: ${currentZone?.name} SELECTED`
                  : rationale.decision}
              </div>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">SAFETY SCORE</div>
            <div
              className={`text-2xl font-black ${
                abortRecommended ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {currentZone ? `${currentZone.safety_score}%` : '0%'}
            </div>
          </div>
        </div>

        {/* Confidence Interval Band Callout */}
        {currentZone && !abortRecommended && (
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-cyan-400">Confidence Band:</span>
              <span className="font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {currentZone.safety_score} ± {currentZone.confidence_interval}%
              </span>
              <span className="text-[11px] text-slate-400">
                (Range: {currentZone.score_lower}% – {currentZone.score_upper}%)
              </span>
            </div>
            <div className="text-emerald-400 flex items-center gap-1 font-sans">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{currentZone.confidence_pct}% AI Confidence</span>
            </div>
          </div>
        )}
      </div>

      {/* Sensor Degradation Warning (if applicable) */}
      {degradationFlags && degradationFlags.length > 0 && (
        <div className="p-3 bg-amber-950/30 border border-amber-500/40 rounded-xl text-xs font-mono text-amber-300 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold mb-0.5">GRACEFUL SENSOR DEGRADATION ACTIVE</div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90 font-sans">
              {degradationFlags.map((flag, idx) => (
                <li key={idx}>{flag}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Selected Landing Zone Detailed Breakdown */}
      {currentZone && (
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>{currentZone.name} — Sensor Telemetry Breakdown</span>
            </h3>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                currentZone.status === 'Recommended'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : currentZone.status === 'Safe'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : currentZone.status === 'Moderate'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {currentZone.status}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-mono mb-4">
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">MEAN SLOPE</span>
              <span className="text-sm font-bold text-slate-100">{currentZone.metrics.mean_slope_deg}°</span>
              <span className="text-[10px] text-slate-500 block">Limit: 8.5°</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">PEAK SLOPE (95th%)</span>
              <span className="text-sm font-bold text-slate-100">{currentZone.metrics.max_slope_deg}°</span>
              <span className="text-[10px] text-slate-500 block">Lander stability</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">YOLO BOULDERS</span>
              <span className="text-sm font-bold text-slate-100">{currentZone.metrics.boulder_count}</span>
              <span className="text-[10px] text-slate-500 block">Obstacle count</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">YOLO CRATERS</span>
              <span className="text-sm font-bold text-slate-100">{currentZone.metrics.crater_count}</span>
              <span className="text-[10px] text-slate-500 block">Depressions</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">SHADOW RATIO</span>
              <span className="text-sm font-bold text-slate-100">{currentZone.metrics.shadow_fraction_pct}%</span>
              <span className="text-[10px] text-slate-500 block">Optical occlusion</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-slate-400 block text-[10px]">ROUGHNESS (TRI)</span>
              <span className="text-sm font-bold text-slate-100">{currentZone.metrics.roughness_tri}</span>
              <span className="text-[10px] text-slate-500 block">Micro-relief index</span>
            </div>
          </div>

          {/* Risk Factors Bar Chart */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 mb-1">MULTI-CRITERIA HAZARD CONTRIBUTIONS</div>
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Slope Gradient Risk</span>
                <span>{currentZone.breakdown.slope_risk_pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${currentZone.breakdown.slope_risk_pct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Optical Obstacle Risk (YOLO)</span>
                <span>{currentZone.breakdown.optical_risk_pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${currentZone.breakdown.optical_risk_pct}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                <span>Thermal & Subsurface Anomaly</span>
                <span>{currentZone.breakdown.thermal_risk_pct}%</span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{ width: `${currentZone.breakdown.thermal_risk_pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plain-Language AI Engineering Rationale */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400">
            Explainable AI Rationale & Synthesis
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans mb-3">
          {rationale.detailed_rationale}
        </p>

        <div className="space-y-1.5">
          {rationale.key_factors.map((factor, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Point 2: Human-in-the-Loop Action Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>Human-in-the-Loop Decision Gate</span>
          </span>
          <span className="text-[10px] text-slate-500 font-sans">Pilot authority active</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleApproveClick}
            disabled={abortRecommended}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs font-mono transition-all shadow-md shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>APPROVE AI PICK</span>
          </button>

          <button
            onClick={() => setOverrideModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs font-mono border border-cyan-500/30 transition-all"
          >
            <Sliders className="w-4 h-4" />
            <span>MANUAL OVERRIDE</span>
          </button>

          <button
            onClick={onRequestAlternate}
            disabled={abortRecommended}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-800 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Request Alternate</span>
          </button>

          <button
            onClick={onTriggerAbort}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-mono border border-rose-500/40 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>TRIGGER ABORT</span>
          </button>
        </div>

        {approvedNotification && (
          <div className="mt-3 p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-mono text-center animate-fade-in">
            ✓ Landing Site Approved by Mission Commander — Trajectory Locked to Flight Computer
          </div>
        )}
      </div>

      {/* Manual Override Dialog */}
      {overrideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm">Human Pilot Landing Override</h3>
              </div>
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 font-sans">
              You are manually overriding the AI flight computer recommendation for{' '}
              <strong className="text-cyan-400">{currentZone?.name}</strong>. Space agency protocols
              require human justification for audit logging.
            </p>

            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Pilot Justification / Operational Rationale
              </label>
              <textarea
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g., Pilot preference due to improved terminal descent radar line-of-sight and propellant reserve margin."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOverrideModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleOverrideSubmit}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono"
              >
                Commit Override
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
