import React from 'react';
import { History, CheckCircle2, Shield, Download, X } from 'lucide-react';
import { AnalysisResponse } from '../types/landing';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysisData: AnalysisResponse | null;
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  analysisData,
}) => {
  if (!isOpen || !analysisData) return null;

  const exportAuditLog = () => {
    const jsonStr = JSON.stringify(analysisData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `luna-safe-audit-${analysisData.scenario.id}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="max-w-3xl w-full max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <History className="w-5 h-5" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
              Autonomous Landing Decision Audit Trail
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportAuditLog}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-xs font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Log</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
          {/* Mission Meta */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1">
            <div className="text-cyan-400 font-bold text-[11px]">MISSION CONTEXT</div>
            <div className="text-slate-300">Target Scenario: {analysisData.scenario.name}</div>
            <div className="text-slate-300">Coordinates: {analysisData.scenario.location}</div>
            <div className="text-slate-300">Total Scanned Area: {analysisData.telemetry.scanned_area_km2} km²</div>
          </div>

          {/* Applied Weights Formula */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="text-cyan-400 font-bold text-[11px]">FUSION EQUATION & APPLIED SENSOR WEIGHTS</div>
            <div className="text-[11px] text-slate-400 font-mono bg-slate-900 p-2 rounded border border-slate-800">
              Risk = (w_opt · ObstacleDensity) + (w_slope · Slope) + (w_rough · TRI) + (w_therm · ThermalAnomaly) + (w_fuel · Distance) - (w_sci · Science)
            </div>
            <div className="grid grid-cols-3 gap-2 text-slate-300">
              {Object.entries(analysisData.weights_applied).map(([k, v]) => (
                <div key={k} className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase">{k}</span>
                  <span className="text-cyan-300 font-bold">{(v * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Timeline */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
            <div className="text-cyan-400 font-bold text-[11px]">EVENT LOG & FLIGHT COMPUTER COMMIT STREAM</div>
            <div className="space-y-1.5">
              {analysisData.audit_log_tail.map((entry, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-3 text-[11px]"
                >
                  <div>
                    <span className="text-slate-500 block text-[10px]">{entry.timestamp}</span>
                    <span className="text-slate-200 font-bold">{entry.decision}</span>
                    <div className="text-slate-400 text-[10px]">
                      Selected: {entry.top_zone} (Score: {entry.safety_score}%, Band: {entry.confidence_band})
                    </div>
                  </div>
                  <span className="text-emerald-400 text-[10px] shrink-0 font-bold">✓ VERIFIED</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
