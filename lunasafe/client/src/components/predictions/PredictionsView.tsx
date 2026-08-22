import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { InfrastructureAsset, AssetCategory } from '../../types';
import { formatInr } from '../../utils/formatCurrency';
import { 
  BrainCircuit, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Wrench, 
  IndianRupee, 
  Building2, 
  Waves, 
  Navigation,
  ArrowRight,
  Filter,
  Sparkles,
  TrendingDown,
  Search
} from 'lucide-react';
import { TiltCard } from '../common/TiltCard';

interface PredictionsViewProps {
  assets: InfrastructureAsset[];
  onSelectAsset: (asset: InfrastructureAsset) => void;
  onDispatchWorkOrder: (assetId: string, actionType: string) => Promise<void>;
  isDispatching?: boolean;
}

export const PredictionsView: React.FC<PredictionsViewProps> = ({
  assets,
  onSelectAsset,
  onDispatchWorkOrder,
  isDispatching = false
}) => {
  const [filterHorizon, setFilterHorizon] = useState<'all' | '30' | '60' | '90'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | AssetCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort assets by shortest daysToFailure first (highest risk)
  const sortedAssets = [...assets].sort((a, b) => a.daysToFailure - b.daysToFailure);

  const filteredAssets = sortedAssets.filter((asset) => {
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
    if (filterHorizon === '30' && asset.daysToFailure > 30) return false;
    if (filterHorizon === '60' && asset.daysToFailure > 60) return false;
    if (filterHorizon === '90' && asset.daysToFailure > 90) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = asset.name.toLowerCase().includes(q);
      const matchWard = asset.location.ward.toLowerCase().includes(q);
      if (!matchName && !matchWard) return false;
    }
    return true;
  });

  const getCategoryIcon = (category: AssetCategory) => {
    switch (category) {
      case 'bridge': return Building2;
      case 'drainage': return Waves;
      case 'road': return Navigation;
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-rose-500/20 to-amber-500/20 text-rose-400 border border-rose-500/30 shadow-glow-rose">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white font-display">
              AI Predictive Failure Queue
            </h2>
          </div>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Machine learning anomaly detection estimating Remaining Useful Life (RUL) and catastrophic failure horizons across Pune municipal infrastructure.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-1 px-2 text-xs font-mono text-slate-400">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="text"
              placeholder="Search Prabhag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white focus:outline-none w-28 lg:w-36 text-xs font-mono placeholder:text-slate-500"
            />
          </div>

          <div className="h-4 w-[1px] bg-slate-800" />

          <span className="text-xs font-mono text-slate-400 px-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-cyan-400" /> Horizon:
          </span>
          {(['all', '30', '60', '90'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setFilterHorizon(h)}
              className={`px-3 py-1 rounded-xl text-xs font-bold font-mono transition-all ${
                filterHorizon === h
                  ? 'bg-rose-500 text-white shadow-glow-rose'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {h === 'all' ? 'All Horizons' : `< ${h} Days`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 3D Tilt Risk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => {
          const Icon = getCategoryIcon(asset.category);
          const isCritical = asset.status === 'critical';
          const isWarning = asset.status === 'warning';

          return (
            <TiltCard
              key={asset.id}
              glowColor={isCritical ? 'rose' : isWarning ? 'amber' : 'emerald'}
              className="flex flex-col justify-between"
            >
              <div className="p-5 flex flex-col justify-between h-full">
                <div>
                  {/* Top Bar: Category & Failure Countdown */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        isCritical ? 'bg-rose-500/15 text-rose-400' : isWarning ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-mono uppercase text-slate-400 font-bold">
                        {asset.category}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Remaining Life</div>
                      <div className={`text-sm font-black font-mono flex items-center gap-1 ${
                        asset.daysToFailure <= 15 ? 'text-rose-400 animate-pulse' : asset.daysToFailure <= 45 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{asset.daysToFailure} Days</span>
                      </div>
                    </div>
                  </div>

                  {/* Asset Title & Ward */}
                  <div className="mt-3">
                    <h3 className="text-lg font-bold text-white font-display leading-snug">
                      {asset.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      {asset.location.ward}
                    </p>
                  </div>

                  {/* Health Score & Probability */}
                  <div className="my-3.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Health Score</span>
                      <span className={`text-base font-black ${
                        isCritical ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {asset.healthScore}/100
                      </span>
                    </div>
                    <div className="border-l border-slate-800 pl-2">
                      <span className="text-slate-400 text-[10px] block">Failure Probability</span>
                      <span className="text-rose-400 font-bold text-base">
                        {asset.failureProbability}%
                      </span>
                    </div>
                  </div>

                  {/* AI Root Cause */}
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-4">
                    <div className="text-[10px] uppercase font-bold text-cyan-400 font-mono flex items-center gap-1 mb-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      AI Root Cause
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed font-sans">
                      {asset.rootCause}
                    </p>
                  </div>
                </div>

                {/* Bottom Actions & Financials in INR */}
                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                    <span>Proactive: <strong className="text-cyan-400">{formatInr(asset.proactiveCost)}</strong></span>
                    <span>Failure: <strong className="text-rose-400">{formatInr(asset.reactiveCost)}</strong></span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectAsset(asset)}
                      className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1 font-mono"
                    >
                      <span>Telemetry</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </button>

                    <button
                      onClick={() => onDispatchWorkOrder(asset.id, asset.recommendedAction)}
                      disabled={isDispatching}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white transition-all shadow-glow-emerald flex items-center justify-center gap-1 font-display disabled:opacity-50"
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Dispatch</span>
                    </button>
                  </div>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
};
