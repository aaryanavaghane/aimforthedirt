import React from 'react';
import {
  Rocket,
  Compass,
  Cpu,
  History,
  Activity,
  ChevronDown,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { ScenarioMeta, TelemetryData } from '../types/landing';

interface HeaderProps {
  scenarios: ScenarioMeta[];
  currentScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  telemetry: TelemetryData | null;
  onOpenAudit: () => void;
  onOpenBenchmarks: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  currentScenarioId,
  onSelectScenario,
  telemetry,
  onOpenAudit,
  onOpenBenchmarks,
}) => {
  return (
    <header className="h-16 px-4 bg-slate-950/90 border-b border-slate-800/80 backdrop-blur-xl flex items-center justify-between gap-4 z-40">
      {/* Brand / Title */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
          <Rocket className="w-5 h-5 text-slate-950 transform -rotate-45" />
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-wider text-slate-50 font-display">
              LUNA<span className="text-cyan-400">SAFE</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              v2.4 DECISION SUPPORT
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-sans hidden sm:block">
            Explainable Multi-Sensor Autonomous Planetary Landing Engine
          </p>
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={currentScenarioId}
            onChange={(e) => onSelectScenario(e.target.value)}
            className="appearance-none bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 text-slate-100 text-xs font-mono font-bold py-2 pl-3 pr-8 rounded-xl focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer shadow-md transition-all"
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id} className="bg-slate-900 text-slate-200">
                {sc.body === 'Mars' ? '🔴' : '🌕'} {sc.name} ({sc.location})
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Right Telemetry & Actions */}
      <div className="flex items-center gap-2.5">
        {telemetry && (
          <div className="hidden lg:flex items-center gap-3 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-slate-300">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Zap className="w-3.5 h-3.5" />
              <span>{telemetry.total_latency_ms} ms</span>
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div className="text-slate-400">
              {telemetry.scanned_area_km2} km²
            </div>
            <div className="w-[1px] h-3 bg-slate-700" />
            <div className="text-cyan-400">
              {telemetry.throughput_km2_per_sec} km²/s
            </div>
          </div>
        )}

        <button
          onClick={onOpenBenchmarks}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-mono transition-colors shadow-sm"
        >
          <Cpu className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Benchmarks</span>
        </button>

        <button
          onClick={onOpenAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono transition-colors shadow-sm"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Audit Trail</span>
        </button>
      </div>
    </header>
  );
};
