import React from 'react';
import { Activity, Compass, Radio, Shield, Sparkles, Navigation, Flame } from 'lucide-react';

interface AtmosHUDProps {
  scrollProgress: number; // 0.0 to 1.0
  currentPhase: number;
}

const PHASES = [
  { id: 1, name: 'Phase 1: Tropospheric Ascent', tag: 'DENSE CLOUDS' },
  { id: 2, name: 'Phase 2: Atmospheric Breakout', tag: 'MACH 12.4' },
  { id: 3, name: 'Phase 3: Trans-Lunar Injection', tag: 'DEEP SPACE VOID' },
  { id: 4, name: 'Phase 4: Lunar Orbit Insertion', tag: 'DECELERATION' },
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
      <div className="fixed top-6 left-6 z-30 flex items-center gap-3 bg-[#0a0206]/85 backdrop-blur-xl px-4 py-2 rounded-full border border-[#FF1493]/30 shadow-[0_0_20px_rgba(255,20,147,0.2)]">
        <span className="w-2 h-2 rounded-full bg-[#FF1493] shadow-[0_0_10px_#FF1493] animate-pulse" />
        <div className="font-mono text-xs text-white uppercase tracking-wider flex items-center gap-2">
          <span className="text-[#FFB6C1] font-bold">ATMOS · GNC V4.2</span>
          <span className="text-white/40">|</span>
          <span className="text-white font-medium">{PHASES[currentPhase - 1]?.name || PHASES[0].name}</span>
        </div>
      </div>

      {/* Top Right: Live Telemetry Matrix */}
      <div className="fixed top-6 right-6 z-30 hidden md:flex items-center gap-4 bg-[#0a0206]/85 backdrop-blur-xl px-5 py-2 rounded-full border border-[#FF1493]/30 shadow-[0_0_20px_rgba(255,20,147,0.2)] font-mono text-xs">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-[#FF1493]" />
          <span className="text-[#FFB6C1]/70">ALT:</span>
          <span className="text-white font-bold">{altitudeKm.toLocaleString()} KM</span>
        </div>
        <span className="text-white/20">/</span>
        <div className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#FF69B4]" />
          <span className="text-[#FFB6C1]/70">VEL:</span>
          <span className="text-white font-bold">MACH {velocityMach}</span>
        </div>
        <span className="text-white/20">/</span>
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#FF1493]" />
          <span className="text-[#FFB6C1]/70">MAX-Q:</span>
          <span className="text-[#FF69B4] font-bold">{dynPressureKPa} kPa</span>
        </div>
      </div>

      {/* Left Progress Ribbon Tracker */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-4">
        <div className="w-[2px] h-48 bg-[#1a040f] relative rounded-full overflow-hidden border border-[#FF1493]/20">
          <div
            className="w-full bg-gradient-to-b from-[#FF1493] to-[#FF69B4] transition-all duration-75 shadow-[0_0_12px_#FF1493]"
            style={{ height: `${p * 100}%` }}
          />
        </div>
        <span className="font-mono text-[10px] text-[#FFB6C1]/60 tracking-widest uppercase rotate-90 origin-center mt-3">
          {Math.round(p * 100)}% ORBIT
        </span>
      </div>
    </>
  );
};
