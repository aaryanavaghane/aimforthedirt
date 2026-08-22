import React from 'react';
import { Target, AlertCircle, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';
import { CandidateZone } from '../types/landing';

interface CandidateZonesListProps {
  zones: CandidateZone[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  abortRecommended: boolean;
}

export const CandidateZonesList: React.FC<CandidateZonesListProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  abortRecommended,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-3 text-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2">
          <Target className="w-4 h-4" />
          <span>Ranked Candidate Landing Zones ({zones.length})</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-400">Coarse-to-Fine Sweep</span>
      </div>

      <div className="space-y-2">
        {zones.map((zone) => {
          const isSelected = selectedZoneId === zone.zone_id;
          const isTop = zone.rank === 1 && !abortRecommended && !zone.is_critical;

          return (
            <div
              key={zone.zone_id}
              onClick={() => onSelectZone(zone.zone_id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : isTop
                  ? 'bg-emerald-950/25 border-emerald-500/40 hover:border-emerald-500/60'
                  : zone.is_critical
                  ? 'bg-rose-950/15 border-rose-800/40 hover:border-rose-700/60'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold ${
                      isTop
                        ? 'bg-emerald-500 text-slate-950'
                        : isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    #{zone.rank}
                  </span>
                  <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <span>{zone.name}</span>
                    {isTop && <span className="text-emerald-400 text-xs font-mono">★ Primary Pick</span>}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-mono font-bold ${
                      zone.is_critical
                        ? 'text-rose-400'
                        : zone.safety_score >= 70
                        ? 'text-emerald-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {zone.safety_score}%
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">±{zone.confidence_interval}%</span>
                </div>
              </div>

              {/* Confidence Band Bar */}
              <div className="relative w-full h-1.5 bg-slate-800 rounded-full my-2 overflow-hidden">
                <div
                  className={`absolute top-0 bottom-0 rounded-full transition-all ${
                    zone.is_critical
                      ? 'bg-rose-500'
                      : zone.safety_score >= 70
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                  style={{
                    left: `${Math.max(0, zone.score_lower)}%`,
                    width: `${Math.min(100, zone.score_upper) - Math.max(0, zone.score_lower)}%`,
                  }}
                />
              </div>

              {/* Metric Highlights */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>Slope: {zone.metrics.mean_slope_deg}°</span>
                <span>Boulders: {zone.metrics.boulder_count}</span>
                <span>Shadow: {zone.metrics.shadow_fraction_pct}%</span>
                <span
                  className={`text-[10px] font-bold ${
                    zone.status === 'Recommended'
                      ? 'text-emerald-400'
                      : zone.status === 'Safe'
                      ? 'text-cyan-400'
                      : zone.status === 'Moderate'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {zone.status.toUpperCase()}
                </span>
              </div>

              {zone.violations.length > 0 && (
                <div className="mt-1.5 text-[10px] text-rose-300 font-mono flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{zone.violations[0]}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
