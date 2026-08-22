import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { 
  ShieldAlert, 
  Activity, 
  UserCheck, 
  Sliders, 
  Clock, 
  Wifi, 
  ChevronDown,
  Building2,
  Waves,
  Navigation
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  criticalCount: number;
  onOpenSimulator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  criticalCount,
  onOpenSimulator
}) => {
  const [time, setTime] = useState<string>('');
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roles = [
    {
      id: 'pmc_commissioner' as UserRole,
      title: 'PMC Commissioner',
      dept: 'Executive & Fiscal Command',
      icon: Building2,
      color: 'text-cyan-400',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
    },
    {
      id: 'drainage_engineer' as UserRole,
      title: 'Drainage Engineer',
      dept: 'Stormwater & Feeder Nala',
      icon: Waves,
      color: 'text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    },
    {
      id: 'traffic_police' as UserRole,
      title: 'Traffic & Roads Lead',
      dept: 'Pavement & Bridge Transit',
      icon: Navigation,
      color: 'text-rose-400',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    }
  ];

  const activeRoleObj = roles.find(r => r.id === currentRole) || roles[0];
  const ActiveIcon = activeRoleObj.icon;

  return (
    <header className="sticky top-0 z-40 bg-[#050811]/95 backdrop-blur-2xl border-b border-slate-800/80 px-4 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
      {/* Left branding */}
      <div className="flex items-center gap-3.5">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[1px] shadow-glow-cyan">
          <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black tracking-tight text-white font-display flex items-center gap-1.5">
              InfraPulse <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">AI</span>
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-300 rounded border border-cyan-500/30 font-mono">
              PMC Smart City
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <span>Pune Grid 18.5204° N, 73.8567° E</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 font-semibold">Live Telemetry Synchronized</span>
          </p>
        </div>
      </div>

      {/* Center / Right controls */}
      <div className="flex items-center gap-3 lg:gap-4 flex-wrap">
        {/* Real-time Clock & Network Health */}
        <div className="hidden xl:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span>{time || '10:25:00 AM'} IST</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-emerald-400">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>428 IoT Telemetry Nodes Online</span>
          </div>
        </div>

        {/* Urgent Critical Alerts Pill */}
        {criticalCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold animate-pulse shadow-glow-rose font-mono">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>{criticalCount} Critical Hotspots</span>
          </div>
        )}

        {/* What-If Simulator Quick Button */}
        <button
          onClick={onOpenSimulator}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-500/40 text-purple-200 text-xs font-semibold hover:from-purple-600/50 hover:to-indigo-600/50 hover:border-purple-400 transition-all shadow-glow-violet active:scale-95 font-mono"
        >
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Scenario</span> Simulator
        </button>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${activeRoleObj.badge} hover:brightness-110 active:scale-95`}
          >
            <ActiveIcon className="w-4 h-4" />
            <div className="text-left hidden md:block">
              <div className="leading-tight font-display">{activeRoleObj.title}</div>
              <div className="text-[10px] opacity-70 font-mono">{activeRoleObj.dept}</div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 mb-1 font-mono">
                Select Persona View
              </div>
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = role.id === currentRole;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      onRoleChange(role.id);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 text-white border border-slate-700'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg bg-slate-950 border border-slate-800 ${role.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-1.5 font-display">
                        {role.title}
                        {isSelected && <UserCheck className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">{role.dept}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
