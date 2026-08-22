import React, { useEffect, useState } from 'react';
import { Cpu, Zap, ShieldCheck, AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../services/api';

interface BenchmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BenchmarksModal: React.FC<BenchmarksModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<{
    baseline_comparison: Array<{
      method: string;
      false_safe_rate: string;
      flaw: string;
      recommendation_score: string;
    }>;
    latency_profile: {
      total_latency_ms: number;
      optical_yolo_ms: number;
      dem_slope_roughness_ms: number;
      thermal_processing_ms: number;
      coarse_to_fine_fusion_ms: number;
      memory_usage_mb: number;
      fps_equivalent: number;
      onboard_readiness: string;
    };
  } | null>(null);

  useEffect(() => {
    if (isOpen && !data) {
      apiClient.getBenchmarks().then(setData).catch(console.error);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="max-w-3xl w-full max-h-[85vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100 font-sans">
        {/* Header */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <Cpu className="w-5 h-5" />
            <h2 className="text-sm font-bold font-mono uppercase tracking-wider">
              Engineering Benchmarks & Baseline Comparison
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Fusion vs Baseline Comparison */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 mb-2">
              Value of Multi-Sensor Fusion vs Single-Hazard Baselines
            </h3>
            <div className="space-y-2">
              {data?.baseline_comparison.map((item, idx) => {
                const isFusion = item.method.includes('LUNA-SAFE');
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${
                      isFusion
                        ? 'bg-emerald-950/30 border-emerald-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        {isFusion ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                        )}
                        <span>{item.method}</span>
                      </div>
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          isFusion
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}
                      >
                        False Safe Rate: {item.false_safe_rate}
                      </span>
                    </div>
                    <div className="text-slate-300 text-xs font-sans mt-1">
                      <strong>Failure Mode:</strong> {item.flaw}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Onboard Latency & Compute Profiling */}
          {data?.latency_profile && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 font-mono space-y-3">
              <div className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                <span>REAL-TIME ONBOARD COMPUTE PROFILING (2.56 km² Scan)</span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">TOTAL PIPELINE</span>
                  <span className="text-emerald-400 font-bold text-sm">{data.latency_profile.total_latency_ms} ms</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">YOLO OPTICAL</span>
                  <span className="text-slate-200 font-bold text-sm">{data.latency_profile.optical_yolo_ms} ms</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">DEM GRADIENTS</span>
                  <span className="text-slate-200 font-bold text-sm">{data.latency_profile.dem_slope_roughness_ms} ms</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">MEMORY FOOTPRINT</span>
                  <span className="text-cyan-400 font-bold text-sm">{data.latency_profile.memory_usage_mb} MB</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs font-sans">
                ✓ <strong>Spaceflight Qualification:</strong> {data.latency_profile.onboard_readiness} ({data.latency_profile.fps_equivalent} FPS throughput).
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
