import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CostDataPoint } from '../../types';
import { formatInr, formatInrFull } from '../../utils/formatCurrency';
import { TrendingUp, ShieldCheck, IndianRupee } from 'lucide-react';

interface CostSavingsChartProps {
  data: CostDataPoint[];
}

export const CostSavingsChart: React.FC<CostSavingsChartProps> = ({ data }) => {
  const formatYAxis = (val: number) => formatInr(val, { compact: true, precision: 1 });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const reactive = payload.find((p: any) => p.dataKey === 'reactive')?.value || 0;
      const proactive = payload.find((p: any) => p.dataKey === 'proactive')?.value || 0;
      const saved = reactive - proactive;

      return (
        <div className="rounded-xl bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 p-3.5 shadow-2xl font-mono text-xs z-50">
          <div className="text-slate-300 font-bold mb-2 pb-1 border-b border-slate-800 text-sm font-display">
            {label} 2026 Telemetry
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4 text-rose-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span> Catastrophic Failure Cost:
              </span>
              <span className="font-bold">{formatInr(reactive)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-cyan-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500"></span> Proactive AI Repair Cost:
              </span>
              <span className="font-bold">{formatInr(proactive)}</span>
            </div>
            <div className="pt-1.5 mt-1 border-t border-slate-800 flex items-center justify-between gap-4 text-emerald-400 font-bold">
              <span>Net Municipal Savings:</span>
              <span>+{formatInr(saved)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-slate-800/80 p-5 lg:p-6 shadow-xl backdrop-blur-xl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <IndianRupee className="w-4 h-4" />
            </span>
            <h2 className="text-lg lg:text-xl font-black text-white font-display">
              Municipal Cost Avoidance Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Proactive AI Early Intervention (Low) vs Catastrophic Emergency Rebuild Costs (High)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Avg Municipal ROI: 850%</span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="reactiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="proactiveGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} vertical={false} />
            
            <XAxis 
              dataKey="month" 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#334155' }}
              tickFormatter={formatYAxis}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ paddingBottom: '16px', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
              formatter={(value) => (
                <span className="text-slate-300 font-medium">
                  {value === 'reactive' ? 'Catastrophic Failure Cost (Reactive)' : 'Proactive AI Maintenance Cost'}
                </span>
              )}
            />

            {/* Reactive high cost curve */}
            <Area
              type="monotone"
              dataKey="reactive"
              name="reactive"
              stroke="#f43f5e"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#reactiveGradient)"
              activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
            />

            {/* Proactive low cost curve */}
            <Area
              type="monotone"
              dataKey="proactive"
              name="proactive"
              stroke="#06b6d4"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#proactiveGradient)"
              activeDot={{ r: 6, fill: '#06b6d4', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Highlights Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Peak Avoided Cost (July Monsoon)</span>
          <span className="text-rose-400 font-bold text-sm">₹21.4 Cr Avoided</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Proactive Inspection Budget</span>
          <span className="text-cyan-400 font-bold text-sm">₹3.10 Cr Invested</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-400 block text-[10px]">Net Municipal Efficiency</span>
          <span className="text-emerald-400 font-bold text-sm">+₹18.3 Cr Surplus</span>
        </div>
      </div>
    </div>
  );
};
