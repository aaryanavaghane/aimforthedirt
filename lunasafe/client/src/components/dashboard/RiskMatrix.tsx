import React from 'react';
import { InfrastructureAsset, UserRole } from '../../types';
import { 
  Building2, 
  Waves, 
  Navigation, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Shield,
  Gauge
} from 'lucide-react';

interface RiskMatrixProps {
  assets: InfrastructureAsset[];
  currentRole: UserRole;
  onSelectAsset: (asset: InfrastructureAsset) => void;
}

export const RiskMatrix: React.FC<RiskMatrixProps> = ({
  assets,
  currentRole,
  onSelectAsset
}) => {
  const criticalAssets = assets.filter(a => a.status === 'critical');
  const warningAssets = assets.filter(a => a.status === 'warning');

  const wardsSummary = [
    { ward: 'Bhavani Peth / Juna Bazaar', criticalCount: 1, avgScore: 30, risk: 'High' },
    { ward: 'Hadapsar - Mundhwa', criticalCount: 2, avgScore: 30, risk: 'Critical' },
    { ward: 'Dhole Patil (Sangamvadi)', criticalCount: 1, avgScore: 42, risk: 'High' },
    { ward: 'Sinhagad Road (Rajaram)', criticalCount: 0, avgScore: 65, risk: 'Medium' },
    { ward: 'Kothrud - Bavdhan', criticalCount: 0, avgScore: 76, risk: 'Low' },
    { ward: 'Aundh - Baner', criticalCount: 0, avgScore: 70, risk: 'Moderate' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bridge': return Building2;
      case 'drainage': return Waves;
      case 'road': return Navigation;
      default: return Shield;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* High-Risk Hotspots Action List */}
      <div className="lg:col-span-2 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base lg:text-lg font-bold text-white font-display">
                Pune Critical Infrastructure Triage
              </h3>
              <p className="text-xs text-slate-400">
                Nodes requiring immediate PMC preventative intervention
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[11px] font-mono font-bold bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-lg">
            {criticalAssets.length} Critical / {warningAssets.length} Warning
          </span>
        </div>

        <div className="space-y-2.5">
          {assets
            .filter(a => a.status !== 'healthy')
            .slice(0, 4)
            .map((asset) => {
              const Icon = getCategoryIcon(asset.category);
              const isCritical = asset.status === 'critical';

              return (
                <div
                  key={asset.id}
                  onClick={() => onSelectAsset(asset)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCritical
                      ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-500/60 hover:bg-rose-950/30'
                      : 'bg-amber-950/20 border-amber-800/40 hover:border-amber-500/60 hover:bg-amber-950/30'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isCritical
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-display">{asset.name}</span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-slate-900 text-slate-400 rounded border border-slate-700">
                          {asset.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                        {asset.issue || asset.rootCause}
                      </p>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-3">
                        <span>Ward: {asset.location.ward}</span>
                        <span>•</span>
                        <span className="text-rose-400 font-bold">Failure in ~{asset.daysToFailure} Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 font-mono">Health Score</div>
                      <div className={`text-lg font-black font-display ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                        {asset.healthScore}/100
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-cyan-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                      <span>Triage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Ward Vulnerability Distribution */}
      <div className="rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <Gauge className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-base lg:text-lg font-bold text-white font-display">
                Ward Vulnerability Index
              </h3>
              <p className="text-xs text-slate-400">
                PMC regional zone stress ranking
              </p>
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {wardsSummary.map((item) => {
              const barColor =
                item.risk === 'Critical'
                  ? 'bg-rose-500'
                  : item.risk === 'High'
                  ? 'bg-amber-500'
                  : 'bg-cyan-500';

              return (
                <div key={item.ward} className="space-y-1">
                  <div className="flex items-center justify-between text-slate-300 text-[11px]">
                    <span className="truncate pr-2">{item.ward}</span>
                    <span className={`font-bold ${item.risk === 'Critical' ? 'text-rose-400' : item.risk === 'High' ? 'text-amber-400' : 'text-cyan-400'}`}>
                      {item.avgScore}% Health
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${item.avgScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>PMC Real-Time Model Sync</span>
          <span className="text-emerald-400 font-bold">100% Calibrated</span>
        </div>
      </div>
    </div>
  );
};
