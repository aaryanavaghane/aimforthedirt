import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  BrainCircuit, 
  SlidersHorizontal,
  CalendarDays,
  Zap,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export type NavTab = 'dashboard' | 'map' | 'predictions' | 'calendar' | 'simulation';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRepairsCount: number;
  scheduledOrdersCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingRepairsCount,
  scheduledOrdersCount = 6,
  isCollapsed = false,
  onToggleCollapse
}) => {
  const navItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      subtitle: 'Executive AI Overview',
      icon: LayoutDashboard,
      color: 'from-cyan-500 to-blue-500',
      activeColor: 'text-cyan-400',
      glow: 'shadow-glow-cyan'
    },
    {
      id: 'map' as const,
      label: 'Pune GIS Map',
      subtitle: 'Real Landmark Grid',
      icon: MapPin,
      color: 'from-emerald-500 to-teal-500',
      activeColor: 'text-emerald-400',
      glow: 'shadow-glow-emerald'
    },
    {
      id: 'predictions' as const,
      label: 'AI Predictions',
      subtitle: 'Risk Failure Queue',
      icon: BrainCircuit,
      color: 'from-rose-500 to-amber-500',
      activeColor: 'text-rose-400',
      glow: 'shadow-glow-rose',
      badge: pendingRepairsCount > 0 ? `${pendingRepairsCount}` : undefined
    },
    {
      id: 'calendar' as const,
      label: 'Maintenance Calendar',
      subtitle: 'Crew Shifts & Planning',
      icon: CalendarDays,
      color: 'from-blue-500 to-indigo-500',
      activeColor: 'text-blue-400',
      glow: 'shadow-glow-cyan',
      badge: scheduledOrdersCount > 0 ? `${scheduledOrdersCount}` : undefined
    },
    {
      id: 'simulation' as const,
      label: 'What-If Simulator',
      subtitle: 'Crisis Command Center',
      icon: SlidersHorizontal,
      color: 'from-purple-500 to-indigo-500',
      activeColor: 'text-purple-400',
      glow: 'shadow-glow-violet'
    }
  ];

  return (
    <aside 
      className={`bg-[#070b17]/98 backdrop-blur-2xl border-b lg:border-b-0 lg:border-r border-slate-800/80 p-3 flex lg:flex-col justify-between shrink-0 transition-all duration-300 ${
        isCollapsed ? 'w-full lg:w-20' : 'w-full lg:w-64'
      }`}
    >
      <div className="w-full">
        {/* Sidebar Header & Collapse Toggle */}
        <div className="flex items-center justify-between px-2 mb-3 pb-2 border-b border-slate-800/80">
          {!isCollapsed && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono hidden lg:block">
              Operations
            </div>
          )}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              className={`p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-all hidden lg:flex items-center justify-center ${
                isCollapsed ? 'mx-auto' : ''
              }`}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
              ) : (
                <PanelLeftClose className="w-4 h-4 text-slate-400" />
              )}
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? `${item.label} (${item.subtitle})` : undefined}
                className={`group relative flex items-center ${
                  isCollapsed ? 'lg:justify-center px-2 py-3' : 'gap-3 px-3.5 py-3'
                } rounded-xl transition-all text-left w-full shrink-0 lg:shrink ${
                  isActive
                    ? 'bg-slate-800/90 text-white border border-slate-700/80 shadow-lg'
                    : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-gradient-to-b ${item.color} hidden lg:block`} />
                )}

                <div className="relative">
                  <div
                    className={`p-2 rounded-lg transition-all ${
                      isActive
                        ? `bg-slate-950 border border-slate-700 ${item.activeColor} ${item.glow}`
                        : 'bg-slate-900/80 text-slate-400 group-hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Badge on collapsed mode */}
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1.5 px-1 py-0.2 text-[9px] font-extrabold rounded-full bg-rose-500 text-white animate-pulse font-mono">
                      {item.badge}
                    </span>
                  )}
                </div>

                {/* Expanded text */}
                {!isCollapsed && (
                  <div className="hidden sm:block overflow-hidden">
                    <div className="text-xs font-bold flex items-center gap-2 font-display">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className={`px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                          item.id === 'calendar' ? 'bg-indigo-500 text-white' : 'bg-rose-500 text-white animate-pulse'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors truncate font-sans">
                      {item.subtitle}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Pune Municipal Corporation System Health Card */}
      {!isCollapsed && (
        <div className="hidden lg:block mt-6 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/90 shadow-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 mb-1.5 font-display">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>PMC Digital Twin AI</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3 font-sans">
            Predictive neural network calibrated on Pune municipal infrastructure.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> Latency
            </span>
            <span className="text-emerald-400 font-bold">14ms Live</span>
          </div>
        </div>
      )}
    </aside>
  );
};
