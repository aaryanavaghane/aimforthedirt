import React from 'react';
import { Activity, Compass, Radio, Shield, Sparkles, Navigation, Flame } from 'lucide-react';

interface AtmosHUDProps {
  scrollProgress: number; // 0.0 to 1.0
  currentPhase: number;
}

const PHASES = [
  { id: 1, name: 'Phase 1: Atmospheric Ascent', tag: 'DENSE STRATOSPHERE' },
  { id: 2, name: 'Phase 2: Atmospheric Breakout', tag: 'MACH 12.4' },
  { id: 3, name: 'Phase 3: Trans-Lunar Traversal', tag: 'MIDNIGHT VOID' },
  { id: 4, name: 'Phase 4: Lunar Orbit Insertion', tag: 'DECELERATION BURN' },
  { id: 5, name: 'Phase 5: Landing Zone Acquisition', tag: 'HOVER LOCK' },
];

export const AtmosHUD: React.FC<AtmosHUDProps> = ({ scrollProgress, currentPhase }) => {
  const p = Math.max(0, Math.min(1, scrollProgress));

  // Dynamic Telemetry Calculations based on scroll scrub
  const altitudeKm = Math.round(p * 384400);
  const velocityMach = p < 0.65 
    ? (1.2 + p * 42).toFixed(1) 
    : Math.max(0, 28.5 * (1 - (p - 0.65) / 0.35)).toFixed(1);
  const dynPressureKPa = p < 0.35 
    ? (35 * Math.sin((p / 0.35) * Math.PI)).toFixed(1) 
    : '0.0';

  return (
    <>
      {/* Top Left: Flight Mission Phase */}
      <div className="fixed top-6 left-6 z-30 flex items-center gap-3 bg-[#050d24]/90 backdrop-blur-xl px-4 py-2 rounded-full border border-[#00F5FF]/30 shadow-[0_0_20px_rgba(0,245,255,0.25)]">
        <span className="w-2 h-2 rounded-full bg-[#00F5FF] shadow-[0_0_10px_#00F5FF] animate-pulse" />
        <div className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2">
          <span className="text-[#38BDF8] font-bold">ATMOS · GNC V4.2</span>
          <span className="text-white/40">|</span>
          <span className="text-white font-medium">{PHASES[currentPhase - 1]?.name || PHASES[0].name}</span>
        </div>
      </div>

      {/* Top Right: Live Telemetry Matrix */}
      <div className="fixed top-6 right-6 z-30 hidden md:flex items-center gap-4 bg-[#050d24]/90 backdrop-blur-xl px-5 py-2 rounded-full border border-[#00F5FF]/30 shadow-[0_0_20px_rgba(0,245,255,0.25)] font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#00F5FF]" />
          <span className="text-[#94A3B8]">ALT:</span>
          <span className="text-white font-bold">{altitudeKm.toLocaleString()} KM</span>
        </div>
        <span className="text-white/20">/</span>
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#38BDF8]" />
          <span className="text-[#94A3B8]">VEL:</span>
          <span className="text-white font-bold">MACH {velocityMach}</span>
        </div>
        <span className="text-white/20">/</span>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#00F5FF]" />
          <span className="text-[#94A3B8]">MAX-Q:</span>
          <span className="text-[#38BDF8] font-bold">{dynPressureKPa} kPa</span>
        </div>
      </div>

      {/* Left Progress Ribbon Tracker */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-4">
        <div className="w-[2px] h-48 bg-[#081b4b] relative rounded-full overflow-hidden border border-[#00F5FF]/30">
          <div
            className="w-full bg-gradient-to-b from-[#0D38E8] to-[#00F5FF] transition-all duration-75 shadow-[0_0_12px_#00F5FF]"
            style={{ height: `${p * 100}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-[#38BDF8]/80 tracking-widest uppercase rotate-90 origin-center mt-3">
          {Math.round(p * 100)}% ORBIT
        </span>
      </div>
    </>
  );
};
