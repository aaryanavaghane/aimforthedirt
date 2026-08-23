import React from 'react';
import { Crosshair, Navigation, Compass, Zap, Shield, Radio, Flame, Sparkles, Check, CheckCircle2, ChevronRight } from 'lucide-react';

interface CockpitPOVProps {
  scrollProgress: number; // 0.0 to 1.0 from GSAP ScrollTrigger
  selectedRegion: any;
  onSelectRegion: (id: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  loadingText: string;
  surveyRadiusKm: number;
  setSurveyRadiusKm: (r: number) => void;
  regions: Record<string, any>;
  zoomLayerMode: 'leaflet' | 'quickmap_embed' | 'raster';
  setZoomLayerMode: (mode: 'leaflet' | 'quickmap_embed' | 'raster') => void;
}

export const CockpitPOV: React.FC<CockpitPOVProps> = ({
  scrollProgress,
  selectedRegion,
  onSelectRegion,
  onAnalyze,
  isAnalyzing,
  loadingText,
  surveyRadiusKm,
  setSurveyRadiusKm,
  regions,
  zoomLayerMode,
  setZoomLayerMode,
}) => {
  const p = Math.max(0, Math.min(1, scrollProgress));

  // Cockpit Entrance Animation: Begins entering at p = 0.60, fully settled by p = 0.86
  const cockpitProgress = Math.max(0, Math.min(1, (p - 0.60) / 0.26));
  if (cockpitProgress <= 0.01) return null;

  // Parallax / Scale transform: slides in from camera edges
  const scale = 1.08 - cockpitProgress * 0.08;
  const translateY = (1 - cockpitProgress) * 60; // Dashboard slides up from bottom
  const opacity = Math.min(1, cockpitProgress * 1.3);

  // Dynamic Telemetry
  const altitudeKm = Math.round(p * 384400);
  const velocityMach = p < 0.65 ? (1.2 + p * 42).toFixed(1) : Math.max(0, 28.5 * (1 - (p - 0.65) / 0.35)).toFixed(1);

  return (
    <div
      className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between overflow-hidden transition-opacity duration-300"
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
      }}
    >
      {/* 1. OVERHEAD ROOF CONSOLE & OBSERVATION SKYLIGHT BEAMS */}
      <div className="relative w-full z-30 pointer-events-none">
        <svg
          viewBox="0 0 1920 160"
          className="w-full h-auto max-h-[14vh] object-cover drop-shadow-[0_15px_30px_rgba(0,0,0,0.95)]"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#060a14" />
              <stop offset="60%" stopColor="#0b1324" />
              <stop offset="100%" stopColor="#040710" />
            </linearGradient>
            <linearGradient id="metalBevel" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
          </defs>

          {/* Roof Structure */}
          <path
            d="M 0,0 L 1920,0 L 1920,50 L 1480,75 L 1400,120 L 520,120 L 440,75 L 0,50 Z"
            fill="url(#roofGrad)"
            stroke="#1e293b"
            strokeWidth="2"
          />

          {/* Overhead Switch Panels & Circuit Breakers */}
          <rect x="580" y="20" width="760" height="75" rx="6" fill="#03060c" stroke="#334155" strokeWidth="1.5" />
          
          {/* Overhead Toggles */}
          {[620, 680, 740, 800, 860, 920, 980, 1040, 1100, 1160, 1220, 1280].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy="45" r="5" fill="#1e293b" stroke="#64748b" strokeWidth="1.5" />
              <line x1={x} y1="45" x2={x} y2={i % 3 === 0 ? "35" : "55"} stroke={i % 4 === 0 ? "#00F5FF" : "#94a3b8"} strokeWidth="3" strokeLinecap="round" />
              <circle cx={x} cy="75" r="2.5" fill={i % 2 === 0 ? "#00F5FF" : "#10B981"} />
            </g>
          ))}

          {/* Center Overhead Mission Status Label */}
          <rect x="880" y="8" width="160" height="18" rx="3" fill="#0b1324" stroke="#00F5FF" strokeWidth="0.8" />
          <text x="960" y="21" fill="#00F5FF" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold" letterSpacing="1.5">
            LUNAR GNC · DUAL FCS
          </text>
        </svg>
      </div>

      {/* 2. LATERAL WINDSHIELD PILLARS & SIDE VIEWPORTS (Left & Right Window Framing) */}
      <div className="absolute inset-0 flex justify-between pointer-events-none z-20">
        {/* Left A-Pillar Structure */}
        <div className="w-[12vw] max-w-[190px] h-full bg-gradient-to-r from-[#03060f] via-[#081022] to-transparent relative flex flex-col justify-center">
          <div className="w-full h-[60%] border-r-4 border-[#1e293b] shadow-[10px_0_30px_rgba(0,0,0,0.85)] flex flex-col justify-around py-12 px-2">
            {/* Left Pillar Grab Handle */}
            <div className="w-3 h-32 bg-[#0284c7] rounded-full border border-[#38bdf8] shadow-[0_0_10px_#0284c7] mx-auto opacity-75" />
            {/* Status Beacon */}
            <div className="flex flex-col items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981] animate-pulse" />
              <span className="font-mono text-[8px] text-[#94a3b8] uppercase rotate-90">CABIN PRESS</span>
            </div>
          </div>
        </div>

        {/* Right A-Pillar Structure */}
        <div className="w-[12vw] max-w-[190px] h-full bg-gradient-to-l from-[#03060f] via-[#081022] to-transparent relative flex flex-col justify-center items-end">
          <div className="w-full h-[60%] border-l-4 border-[#1e293b] shadow-[-10px_0_30px_rgba(0,0,0,0.85)] flex flex-col justify-around py-12 px-2">
            {/* Right Pillar Grab Handle */}
            <div className="w-3 h-32 bg-[#0284c7] rounded-full border border-[#38bdf8] shadow-[0_0_10px_#0284c7] mx-auto opacity-75" />
            {/* Status Beacon */}
            <div className="flex flex-col items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00F5FF] shadow-[0_0_8px_#00F5FF] animate-pulse" />
              <span className="font-mono text-[8px] text-[#94a3b8] uppercase -rotate-90">DSN COMM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN DASHBOARD CONSOLE & AVIONICS MFD SCREENS (Cockpit Lower Deck) */}
      <div className="relative w-full z-30 pointer-events-auto mt-auto">
        <div className="w-full bg-gradient-to-t from-[#020408] via-[#050b18] to-[#0a1428] border-t-2 border-[#334155] pt-3 pb-5 px-4 sm:px-8 shadow-[0_-25px_60px_rgba(0,0,0,0.95)]">
          
          {/* Top Console Rail / Annunciator Strip */}
          <div className="max-w-7xl mx-auto flex items-center justify-between border-b border-[#1e293b] pb-2.5 mb-3 font-mono text-[10px]">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-[#00F5FF]/10 text-[#00F5FF] border border-[#00F5FF]/30 rounded font-bold">
                MISSION STATUS: ACTIVE
              </span>
              <span className="text-[#94a3b8] hidden sm:inline">| ORBITAL VELOCITY: MACH {velocityMach}</span>
              <span className="text-[#94a3b8] hidden md:inline">| ALT: {altitudeKm.toLocaleString()} KM</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[#E2E8F0] font-bold">LUNAR DESCENT AUTOPILOT [ENGAGED]</span>
            </div>
          </div>

          {/* 3 Interactive Avionics Screens in Cockpit Dashboard */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
            
            {/* Screen 1: Primary Flight Display (PFD) / Artificial Horizon (Cols: 3) */}
            <div className="lg:col-span-3 bg-[#03060d] border border-[#1e293b] rounded-xl p-3.5 flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between font-mono text-[9px] text-[#94a3b8] border-b border-[#1e293b] pb-1.5 mb-2">
                <span className="text-[#00F5FF] font-bold">PRIMARY FLIGHT DISPLAY</span>
                <span>ATTITUDE / GNC</span>
              </div>

              {/* Artificial Horizon Gyro */}
              <div className="relative h-28 bg-[#040814] rounded-lg overflow-hidden border border-[#00F5FF]/20 flex items-center justify-center my-1">
                {/* Sky / Ground Split */}
                <div className="absolute inset-0 flex flex-col">
                  <div className="h-1/2 bg-[#0c1f48]/70" />
                  <div className="h-1/2 bg-[#1b150c]/80 border-t border-[#00F5FF]" />
                </div>
                {/* Pitch Ladder */}
                <div className="absolute inset-0 flex flex-col justify-around items-center py-2 pointer-events-none">
                  <div className="w-16 h-[1px] bg-[#38bdf8]/60" />
                  <div className="w-24 h-[1.5px] bg-[#00F5FF]" />
                  <div className="w-16 h-[1px] bg-[#38bdf8]/60" />
                </div>
                {/* Crosshair Center Reticle */}
                <div className="relative z-10 w-8 h-8 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-[#00F5FF]" />
                  <div className="absolute w-7 h-[2px] bg-[#00F5FF]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 font-mono text-[9px] text-center mt-1">
                <div className="bg-[#0b1324] p-1 rounded">
                  <span className="text-[#64748b] block text-[8px]">PITCH</span>
                  <span className="text-white font-bold">+2.4°</span>
                </div>
                <div className="bg-[#0b1324] p-1 rounded">
                  <span className="text-[#64748b] block text-[8px]">ROLL</span>
                  <span className="text-white font-bold">0.0°</span>
                </div>
                <div className="bg-[#0b1324] p-1 rounded">
                  <span className="text-[#64748b] block text-[8px]">RADAR</span>
                  <span className="text-[#10B981] font-bold">LOCK</span>
                </div>
              </div>
            </div>

            {/* Screen 2: Central Mission Console (MFD) (Cols: 5) */}
            <div className="lg:col-span-5 bg-[#03060d] border border-[#00F5FF]/40 rounded-xl p-3.5 flex flex-col justify-between shadow-[0_0_25px_rgba(0,245,255,0.12)]">
              <div>
                <div className="flex items-center justify-between font-mono text-[9px] text-[#38bdf8] border-b border-[#1e293b] pb-1.5 mb-2">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#00F5FF]" />
                    <span>LUNAR APPROACH COCKPIT CONSOLE</span>
                  </span>
                  <span className="text-[#10B981]">GNC V4.2</span>
                </div>

                <div className="bg-black/70 p-2.5 rounded-lg border border-[#00F5FF]/20 space-y-1.5 font-mono text-xs">
                  <div className="text-[11px] font-bold text-white flex items-center justify-between">
                    <span>TARGET SITE:</span>
                    <span className="text-[#00F5FF]">{selectedRegion?.name}</span>
                  </div>
                  <div className="text-[10px] text-[#94a3b8] flex items-center justify-between">
                    <span>COORDINATES:</span>
                    <span className="text-slate-200">{selectedRegion?.coords}</span>
                  </div>
                  <div className="text-[10px] text-[#94a3b8] flex items-center justify-between">
                    <span>SAFETY SCORE:</span>
                    <span className="text-[#10B981] font-bold">{selectedRegion?.mostSafeDetails?.score}</span>
                  </div>
                </div>

                {/* Interactive Target Vector Selection in Cockpit */}
                <div className="grid grid-cols-4 gap-1.5 mt-2.5">
                  {Object.values(regions).map((reg: any) => {
                    const isSelected = selectedRegion?.id === reg.id;
                    return (
                      <button
                        key={reg.id}
                        onClick={() => onSelectRegion(reg.id)}
                        className={`p-1.5 rounded-lg font-mono text-[9px] text-center border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#081B4B] border-[#00F5FF] text-white font-bold shadow-[0_0_12px_rgba(0,245,255,0.4)]'
                            : 'bg-[#050c1e]/60 border-[#1e293b] text-[#94a3b8] hover:border-[#38bdf8] hover:text-white'
                        }`}
                      >
                        <span className="block truncate">{reg.id.toUpperCase()}</span>
                        <span className="text-[8px] text-[#38bdf8]">{reg.mostSafeDetails.score}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Scan Trigger Button on Cockpit Console */}
              <div className="mt-3">
                <button
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#0D38E8] to-[#00F5FF] text-black font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(0,245,255,0.5)] hover:shadow-[0_0_30px_rgba(0,245,255,0.8)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>{isAnalyzing ? (loadingText || 'Fusing Sensors…') : `Execute ${surveyRadiusKm}km Multi-Sensor Scan`}</span>
                </button>
              </div>
            </div>

            {/* Screen 3: Integrated Cockpit Tactical Lunar Map / LROC QuickMap (Cols: 4) */}
            <div className="lg:col-span-4 bg-[#03060d] border border-[#1e293b] rounded-xl p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between font-mono text-[9px] text-[#94a3b8] border-b border-[#1e293b] pb-1.5 mb-2">
                <span className="text-[#00F5FF] font-bold flex items-center gap-1">
                  <Compass className="w-3 h-3 text-[#00F5FF]" />
                  <span>NAV DISPLAY · LROC QUICKMAP</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setZoomLayerMode('leaflet')}
                    className={`px-1.5 py-0.5 rounded text-[8px] ${zoomLayerMode === 'leaflet' ? 'bg-[#00F5FF] text-black font-bold' : 'text-[#64748b]'}`}
                  >
                    RADAR
                  </button>
                  <button
                    onClick={() => setZoomLayerMode('quickmap_embed')}
                    className={`px-1.5 py-0.5 rounded text-[8px] ${zoomLayerMode === 'quickmap_embed' ? 'bg-[#00F5FF] text-black font-bold' : 'text-[#64748b]'}`}
                  >
                    LROC
                  </button>
                </div>
              </div>

              {/* Integrated Screen Viewport */}
              <div className="relative h-32 w-full rounded-lg overflow-hidden border border-[#00F5FF]/25 bg-[#020408]">
                {zoomLayerMode === 'leaflet' ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Concentric Cockpit Radar Rings */}
                    <div className="w-24 h-24 rounded-full border border-[#00F5FF]/40 border-dashed animate-[spin_60s_linear_infinite]" />
                    <div className="absolute w-14 h-14 rounded-full border border-[#38bdf8]/30" />
                    <div className="absolute w-full h-[1px] bg-[#00F5FF]/20" />
                    <div className="absolute h-full w-[1px] bg-[#00F5FF]/20" />
                    
                    {/* Target Pin in Cockpit Screen */}
                    <div className="absolute flex flex-col items-center">
                      <span className="w-3 h-3 rounded-full bg-[#10B981] border-2 border-white shadow-[0_0_8px_#10B981] animate-ping" />
                      <span className="font-mono text-[8px] text-[#00F5FF] font-bold mt-1 bg-black/80 px-1 rounded">
                        {selectedRegion?.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <iframe
                    src={`https://quickmap.lroc.im-ldi.com/?${selectedRegion?.quickmapExtent || ''}`}
                    title="Cockpit Lunar Map"
                    className="w-full h-full border-none pointer-events-auto"
                  />
                )}
              </div>

              <div className="flex items-center justify-between font-mono text-[9px] text-[#94a3b8] mt-2">
                <span>RAD: {surveyRadiusKm} KM</span>
                <span className="text-[#38bdf8]">LUNAR SOUTH POLE</span>
              </div>
            </div>

          </div>

          {/* Lower Yoke / Control Grip Silhouettes in Foreground */}
          <div className="max-w-6xl mx-auto flex justify-between items-end pt-2 px-12 pointer-events-none opacity-90 hidden sm:flex">
            {/* Left Pilot Yoke */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-10 border-t-8 border-x-8 border-[#1e293b] rounded-t-xl shadow-2xl bg-gradient-to-t from-black to-[#0a1224]" />
              <div className="w-6 h-6 bg-[#0f172a] border border-[#334155] rounded-b" />
            </div>

            {/* Center Throttle Lever Pedestal */}
            <div className="flex items-center gap-3 bg-[#03060c] px-4 py-1.5 rounded-t-lg border-t border-x border-[#1e293b]">
              <div className="w-2.5 h-7 bg-[#475569] rounded-t border-t-2 border-[#00F5FF]" />
              <div className="w-2.5 h-9 bg-[#38bdf8] rounded-t border-t-2 border-white" />
              <div className="w-2.5 h-6 bg-[#475569] rounded-t" />
            </div>

            {/* Right Co-Pilot Yoke */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-10 border-t-8 border-x-8 border-[#1e293b] rounded-t-xl shadow-2xl bg-gradient-to-t from-black to-[#0a1224]" />
              <div className="w-6 h-6 bg-[#0f172a] border border-[#334155] rounded-b" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
