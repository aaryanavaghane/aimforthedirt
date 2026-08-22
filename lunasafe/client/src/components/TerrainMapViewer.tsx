import React, { useState } from 'react';
import { Layers, Eye, Zap, ShieldAlert, Crosshair, ZoomIn, ZoomOut, RotateCcw, Compass } from 'lucide-react';
import { CandidateZone } from '../types/landing';

interface TerrainMapViewerProps {
  layers: Record<string, string>;
  candidateZones: CandidateZone[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
  scenarioName: string;
  location: string;
  resolutionM: number;
  abortRecommended: boolean;
}

export const TerrainMapViewer: React.FC<TerrainMapViewerProps> = ({
  layers,
  candidateZones,
  selectedZoneId,
  onSelectZone,
  scenarioName,
  location,
  resolutionM,
  abortRecommended,
}) => {
  const [activeLayer, setActiveLayer] = useState<string>('annotated');
  const [zoom, setZoom] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showEllipses, setShowEllipses] = useState<boolean>(true);

  const layerOptions = [
    { id: 'annotated', label: 'AI Annotated Landing Map', icon: '🎯', desc: 'Optical + YOLO Detections + Landing Zones' },
    { id: 'uncertainty', label: 'Spatial Uncertainty Heatmap', icon: '🔮', desc: 'Confidence bands & shadow/glare occlusion' },
    { id: 'slope', label: 'Slope Gradient (Degrees)', icon: '📐', desc: 'Topographic gradient via finite differences' },
    { id: 'elevation_dem', label: 'Elevation DEM (LOLA)', icon: '🏔️', desc: 'Gridded lunar digital elevation model' },
    { id: 'thermal', label: 'Thermal / Subsurface Risk', icon: '🌡️', desc: 'Brightness temperature & cold-trap anomalies' },
    { id: 'hazard_density', label: 'YOLO Hazard Density', icon: '⚠️', desc: 'Crater and boulder spatial concentration' },
    { id: 'roughness', label: 'Terrain Roughness (TRI)', icon: '⚡', desc: 'Ruggedness index & micro-relief variation' },
    { id: 'optical', label: 'Raw Optical Image', icon: '📷', desc: 'Visible spectrum satellite imagery' },
  ];

  const currentImageSrc = layers[activeLayer] || layers['annotated'] || '';

  return (
    <div className="flex flex-col h-full rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-xl overflow-hidden shadow-2xl">
      {/* Top Map Toolbar */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">Multi-Modal Terrain Canvas</div>
            <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>{scenarioName}</span>
              <span className="text-[11px] font-normal text-slate-400 font-mono">({location})</span>
            </div>
          </div>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Coarse Sweep Grid"
            className={`px-2 py-1 text-xs rounded font-mono transition-all ${
              showGrid ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setShowEllipses(!showEllipses)}
            title="Toggle Landing Ellipses"
            className={`px-2 py-1 text-xs rounded font-mono transition-all ${
              showEllipses ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Ellipses
          </button>
          <div className="h-4 w-[1px] bg-slate-800 mx-1" />
          <button
            onClick={() => setZoom((z) => Math.min(2.2, z + 0.2))}
            className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.8, z - 0.2))}
            className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 text-slate-400 hover:text-cyan-300 transition-colors"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Layer Switcher Pills */}
      <div className="px-3 py-2 bg-slate-900/50 border-b border-slate-800/60 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        {layerOptions.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
              activeLayer === layer.id
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'bg-slate-950/40 text-slate-400 border border-slate-800 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <span>{layer.icon}</span>
            <span>{layer.label}</span>
          </button>
        ))}
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden p-4">
        {/* Abort Overlay Banner */}
        {abortRecommended && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-rose-500/90 text-white font-mono px-4 py-2 rounded-xl shadow-2xl border border-rose-400 flex items-center gap-2.5 backdrop-blur-md animate-pulse">
            <ShieldAlert className="w-5 h-5 text-white" />
            <span className="font-bold text-sm">CRITICAL: AUTONOMOUS ABORT TRIGGERED — ALL ZONES EXCEED SAFETY THRESHOLD</span>
          </div>
        )}

        {/* Viewport Image Container */}
        <div
          className="relative max-w-full max-h-full aspect-square rounded-xl overflow-hidden border border-slate-800/90 shadow-2xl transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoom})` }}
        >
          {currentImageSrc ? (
            <img
              src={currentImageSrc}
              alt="Planetary Terrain Canvas"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          ) : (
            <div className="w-[512px] h-[512px] flex items-center justify-center text-slate-500 font-mono text-xs">
              Loading sensor raster...
            </div>
          )}

          {/* Coarse Sweep Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none grid grid-cols-8 grid-rows-8 border border-cyan-500/15">
              {Array.from({ length: 64 }).map((_, i) => (
                <div key={i} className="border border-cyan-500/10" />
              ))}
            </div>
          )}

          {/* Interactive Candidate Zone Overlays */}
          {showEllipses &&
            candidateZones.map((zone) => {
              const isSelected = selectedZoneId === zone.zone_id;
              const isTop = zone.rank === 1 && !abortRecommended && !zone.is_critical;
              const leftPct = zone.center_norm[0] * 100;
              const topPct = zone.center_norm[1] * 100;
              const radiusPct = (zone.radius / 512) * 100;

              return (
                <div
                  key={zone.zone_id}
                  onClick={() => onSelectZone(zone.zone_id)}
                  style={{
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${radiusPct * 2}%`,
                    height: `${radiusPct * 2}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`absolute rounded-full cursor-pointer transition-all flex items-center justify-center group ${
                    isSelected
                      ? 'ring-4 ring-cyan-400 bg-cyan-500/20 z-20'
                      : isTop
                      ? 'ring-2 ring-emerald-400 bg-emerald-500/15 z-10 hover:ring-emerald-300'
                      : zone.is_critical
                      ? 'ring-2 ring-rose-500/70 bg-rose-500/10 hover:ring-rose-400'
                      : 'ring-2 ring-amber-400/70 bg-amber-500/10 hover:ring-amber-300'
                  }`}
                  title={`${zone.name} (Safety: ${zone.safety_score}%, Slope: ${zone.metrics.mean_slope_deg}°)`}
                >
                  <div
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 scale-110'
                        : isTop
                        ? 'bg-emerald-500 text-slate-950 scale-105'
                        : zone.is_critical
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-900/90 text-slate-200 border border-slate-700'
                    }`}
                  >
                    {isTop ? `★ ${zone.name}` : zone.name}
                  </div>
                </div>
              );
            })}
        </div>

        {/* HUD Compass & Resolution Box */}
        <div className="absolute bottom-5 left-5 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 flex items-center gap-3">
          <div className="flex items-center gap-1 text-cyan-400">
            <Compass className="w-3.5 h-3.5" />
            <span>NORTH UP</span>
          </div>
          <div className="w-[1px] h-3 bg-slate-700" />
          <div>GSD: {resolutionM}m / pixel</div>
          <div className="w-[1px] h-3 bg-slate-700" />
          <div className="text-slate-400">FOV: 2.56 × 2.56 km</div>
        </div>

        {/* Active Layer Legend Indicator */}
        <div className="absolute bottom-5 right-5 z-10 bg-slate-900/85 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
          <div className="text-xs font-bold text-slate-100 mb-1">
            {layerOptions.find((l) => l.id === activeLayer)?.label}
          </div>
          <div className="text-[10px] text-slate-400">
            {layerOptions.find((l) => l.id === activeLayer)?.desc}
          </div>
        </div>
      </div>
    </div>
  );
};
