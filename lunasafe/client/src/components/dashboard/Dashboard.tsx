import React from 'react';
import { motion } from 'framer-motion';
import { DashboardStats, InfrastructureAsset, UserRole } from '../../types';
import { KpiCards } from './KpiCards';
import { CostSavingsChart } from './CostSavingsChart';
import { RiskMatrix } from './RiskMatrix';
import { Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface DashboardProps {
  stats: DashboardStats;
  assets: InfrastructureAsset[];
  currentRole: UserRole;
  onNavigateToMap: () => void;
  onNavigateToPredictions: () => void;
  onSelectAsset: (asset: InfrastructureAsset) => void;
  onOpenSimulator: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  stats,
  assets,
  currentRole,
  onNavigateToMap,
  onNavigateToPredictions,
  onSelectAsset,
  onOpenSimulator,
  onRefresh,
  isRefreshing = false
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto"
    >
      {/* Sub-header Banner */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-white font-display">
              PMC Executive Command Overview
            </h2>
            <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            Real-time multi-modal AI infrastructure health index across 15 Pune Municipal Corporation wards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold font-mono transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Telemetry'}</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold font-display shadow-glow-cyan transition-all active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Launch Crisis Simulator</span>
          </button>
        </div>
      </motion.div>

      {/* 3D Tilt KPI Cards */}
      <motion.div variants={itemVariants}>
        <KpiCards
          stats={stats}
          currentRole={currentRole}
          onNavigateToMap={onNavigateToMap}
          onNavigateToPredictions={onNavigateToPredictions}
        />
      </motion.div>

      {/* Recharts Area Chart: Proactive vs Reactive Cost Savings */}
      <motion.div variants={itemVariants}>
        <CostSavingsChart data={stats.costTrend} />
      </motion.div>

      {/* Pune Critical Triage & Ward Risk Matrix */}
      <motion.div variants={itemVariants}>
        <RiskMatrix
          assets={assets}
          currentRole={currentRole}
          onSelectAsset={onSelectAsset}
        />
      </motion.div>
    </motion.div>
  );
};
