import React from 'react';
import { UrgentAlert } from '../../types';
import { AlertTriangle, AlertCircle, BellRing, ArrowRight } from 'lucide-react';

interface TickerProps {
  alerts: UrgentAlert[];
  onSelectAlert?: (assetId: string) => void;
}

export const Ticker: React.FC<TickerProps> = ({ alerts, onSelectAlert }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="w-full bg-[#0d1322] border-y border-slate-800/80 px-4 py-2 flex items-center overflow-hidden relative">
      {/* Ticker Lead Label */}
      <div className="flex items-center gap-2 bg-rose-500/15 border border-rose-500/30 px-3 py-1 rounded-lg text-rose-400 text-xs font-bold shrink-0 z-10 shadow-glow-rose mr-4">
        <BellRing className="w-3.5 h-3.5 animate-bounce" />
        <span className="tracking-wide uppercase font-display">Pune Urgent Ticker</span>
      </div>

      {/* Marquee Container */}
      <div className="flex-1 overflow-hidden relative flex items-center whitespace-nowrap">
        <div className="flex gap-8 animate-marquee hover:[animation-play-state:paused]">
          {[...alerts, ...alerts].map((alert, idx) => {
            const isCritical = alert.severity === 'critical';
            return (
              <button
                key={`${alert.id}-${idx}`}
                onClick={() => onSelectAlert && onSelectAlert(alert.assetId)}
                className={`inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-lg transition-all ${
                  isCritical
                    ? 'text-rose-300 hover:bg-rose-950/40 border border-rose-900/40'
                    : 'text-amber-300 hover:bg-amber-950/40 border border-amber-900/40'
                }`}
              >
                {isCritical ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 animate-pulse" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span className="font-semibold text-slate-100">{alert.assetName}:</span>
                <span className="opacity-90">{alert.message}</span>
                <span className="text-[10px] text-slate-400 font-mono">[{alert.ward}]</span>
                <span className="text-[10px] text-slate-500 font-mono">• {alert.timestamp}</span>
                <ArrowRight className="w-3 h-3 text-cyan-400 opacity-60 ml-1" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
