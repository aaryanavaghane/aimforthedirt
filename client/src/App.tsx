import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Camera,
  Radio,
  Thermometer,
  Sliders,
  RotateCcw,
  Upload,
  CheckCircle2,
  Zap,
  Info,
  ChevronDown,
  Layers
} from 'lucide-react';
import {
  AnalysisResponse,
  CandidateZone,
  MissionWeights,
  ScenarioMeta,
  SensorHealth
} from './types/landing';
import { apiClient } from './services/api';

export const App: React.FC = () => {
  const [scenarios, setScenarios] = useState<ScenarioMeta[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string>('chandrayaan3');
  const [activeLayer, setActiveLayer] = useState<string>('annotated');
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Sensor state
  const [sensorHealth, setSensorHealth] = useState<SensorHealth>({
    optical: 'healthy',
    dem: 'healthy',
    thermal: 'healthy',
  });

  // Weights
  const [weights, setWeights] = useState<MissionWeights>({
    boulder_crater: 0.30,
    slope: 0.30,
    roughness: 0.15,
    thermal: 0.15,
    fuel_distance: 0.10,
    science_value: 0.00,
  });

  const [maxSlope, setMaxSlope] = useState<number>(8.5);
  const [decisionConfirmed, setDecisionConfirmed] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Load scenarios on mount
  useEffect(() => {
    apiClient.getScenarios().then((data) => {
      setScenarios(data.scenarios);
    }).catch(console.error);
  }, []);

  // Run analysis
  const runAnalysis = async (zoneOverride?: string | null) => {
    setLoading(true);
    try {
      const res = await apiClient.analyzeLandingSite({
        scenario_id: selectedScenario,
        sensor_health: sensorHealth,
        weights: weights,
        max_safe_slope_deg: maxSlope,
        selected_zone_id: zoneOverride !== undefined ? zoneOverride : selectedZoneId,
      });
      setAnalysis(res);
      if (zoneOverride === undefined && !selectedZoneId && res.recommended_zone) {
        setSelectedZoneId(res.recommended_zone.zone_id);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis();
  }, [selectedScenario, sensorHealth]);

  // Handle sensor degradation presets
  const handleDropSensor = (sensor: 'thermal' | 'optical' | 'dem') => {
    if (sensor === 'thermal') {
      setSensorHealth((prev) => ({ ...prev, thermal: prev.thermal === 'offline' ? 'healthy' : 'offline' }));
    } else if (sensor === 'optical') {
      setSensorHealth((prev) => ({ ...prev, optical: prev.optical === 'degraded' ? 'healthy' : 'degraded' }));
    } else if (sensor === 'dem') {
      setSensorHealth((prev) => ({ ...prev, dem: prev.dem === 'degraded' ? 'healthy' : 'degraded' }));
    }
  };

  const handleResetSensors = () => {
    setSensorHealth({ optical: 'healthy', dem: 'healthy', thermal: 'healthy' });
  };

  const handleZoneClick = (zid: string) => {
    setSelectedZoneId(zid);
    runAnalysis(zid);
  };

  const handleConfirmDecision = async () => {
    const zid = selectedZoneId || analysis?.recommended_zone?.zone_id;
    if (zid) {
      await apiClient.submitOverride({
        zone_id: zid,
        action: 'accept',
        rationale: 'Pilot confirmed landing zone selection.',
        scenario_id: selectedScenario,
      });
      setDecisionConfirmed(zid);
      setTimeout(() => setDecisionConfirmed(null), 3500);
      runAnalysis();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setUploadSuccess(null);

    // Verify first
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/verify', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        setUploadError(data.detail?.message || 'Verification failed: Not a lunar surface image.');
      } else {
        setUploadSuccess(`Valid Lunar Terrain (${Math.round(data.confidence * 100)}% confidence). Processing scene...`);
        setTimeout(() => {
          setShowUploadModal(false);
          runAnalysis();
        }, 1200);
      }
    } catch (err) {
      setUploadError('Failed to upload image.');
    }
  };

  const currentZone =
    analysis?.candidate_zones.find((z) => z.zone_id === selectedZoneId) ||
    analysis?.recommended_zone ||
    null;

  const isAbort = analysis?.abort_recommended;

  const layerList = [
    { id: 'annotated', name: 'Annotated Map' },
    { id: 'uncertainty', name: 'Uncertainty Heatmap' },
    { id: 'slope', name: 'Slope (DEM)' },
    { id: 'thermal', name: 'Thermal Risk' },
    { id: 'hazard_density', name: 'YOLO Hazards' },
    { id: 'elevation_dem', name: 'Elevation' },
    { id: 'optical', name: 'Raw Optical' },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <header className="h-14 bg-[#0c1220] border-b border-slate-800 px-5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xs text-white tracking-wider">
            LS
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>LUNA-SAFE</span>
              <span className="text-[10px] font-mono font-normal text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                Decision Support System
              </span>
            </div>
          </div>
        </div>

        {/* Center: Mission Scenario Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Scenario:</span>
          <div className="relative">
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="bg-[#131b2e] border border-slate-700 text-xs text-slate-100 font-medium py-1.5 pl-3 pr-8 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.body})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#131b2e] hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
            title="Upload Custom Lunar Image"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden md:inline">Upload Image</span>
          </button>
        </div>

        {/* Right: Live Telemetry */}
        <div className="flex items-center gap-3">
          {analysis && (
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-[#131b2e] px-2.5 py-1 rounded-md border border-slate-800">
              <span className="text-emerald-400 font-bold">{analysis.telemetry.total_latency_ms}ms</span>
              <span>•</span>
              <span>{analysis.telemetry.scanned_area_km2} km²</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ready</span>
          </div>
        </div>
      </header>

      {/* Main Content: 2-Column Clean Workspace */}
      <main className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-[1600px] w-full mx-auto">
        {/* Left Column: Interactive Map Viewport (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col rounded-xl bg-[#0c1220] border border-slate-800 overflow-hidden shadow-lg">
          {/* Layer Selector Bar */}
          <div className="p-2.5 bg-[#101728] border-b border-slate-800 flex items-center justify-between overflow-x-auto gap-1.5 scrollbar-none">
            <div className="flex items-center gap-1.5">
              {layerList.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeLayer === layer.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {layer.name}
                </button>
              ))}
            </div>
            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              Click zone to inspect
            </span>
          </div>

          {/* Map Canvas */}
          <div className="relative flex-1 bg-[#050811] flex items-center justify-center p-3 overflow-hidden min-h-[460px]">
            {isAbort && (
              <div className="absolute top-4 z-20 bg-rose-900/90 border border-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
                <ShieldAlert className="w-4 h-4" />
                <span>MISSION ABORT: NO SAFE TOUCHDOWN ZONE FOUND</span>
              </div>
            )}

            {analysis?.layers && (
              <div className="relative max-w-full max-h-full aspect-square rounded-lg overflow-hidden border border-slate-800">
                <img
                  src={analysis.layers[activeLayer] || analysis.layers.annotated}
                  alt="Terrain Raster"
                  className="w-full h-full object-contain select-none"
                />

                {/* Clickable zone markers */}
                {analysis.candidate_zones.map((zone) => {
                  const isSel = currentZone?.zone_id === zone.zone_id;
                  const isTop = zone.rank === 1 && !isAbort && !zone.is_critical;
                  const left = `${zone.center_norm[0] * 100}%`;
                  const top = `${zone.center_norm[1] * 100}%`;
                  const size = `${(zone.radius / 512) * 200}%`;

                  return (
                    <div
                      key={zone.zone_id}
                      onClick={() => handleZoneClick(zone.zone_id)}
                      style={{ left, top, width: size, height: size, transform: 'translate(-50%, -50%)' }}
                      className={`absolute rounded-full cursor-pointer flex items-center justify-center transition-all ${
                        isSel
                          ? 'ring-4 ring-blue-400 bg-blue-500/20 z-10'
                          : isTop
                          ? 'ring-2 ring-emerald-400 bg-emerald-500/10 hover:ring-emerald-300'
                          : zone.is_critical
                          ? 'ring-2 ring-rose-500/80 bg-rose-500/10 hover:ring-rose-400'
                          : 'ring-2 ring-amber-400/80 bg-amber-500/10 hover:ring-amber-300'
                      }`}
                      title={`${zone.name}: ${zone.safety_score}%`}
                    >
                      <span
                        className={`text-[10px] font-bold px-1 py-0.5 rounded shadow ${
                          isSel
                            ? 'bg-blue-600 text-white'
                            : isTop
                            ? 'bg-emerald-600 text-white'
                            : zone.is_critical
                            ? 'bg-rose-700 text-white'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {zone.zone_id}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom HUD Legend */}
            <div className="absolute bottom-3 left-3 bg-[#0c1220]/90 backdrop-blur border border-slate-800 px-2.5 py-1.5 rounded-md text-[11px] text-slate-300 flex items-center gap-3 font-mono">
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Safe</span>
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Moderate</span>
              <span className="flex items-center gap-1"><i className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Critical</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Decision & Controls Card (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3.5">
          {/* Decision Summary Card */}
          <div className="p-4 rounded-xl bg-[#0c1220] border border-slate-800 space-y-3 shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  AI Recommendation
                </span>
                <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                  {isAbort ? 'ABORT LANDING' : currentZone ? currentZone.name : 'Analyzing...'}
                </h2>
              </div>

              {currentZone && !isAbort && (
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Safety Score</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {currentZone.safety_score}%
                  </div>
                </div>
              )}
            </div>

            {/* Confidence Band (Differentiator 1) */}
            {currentZone && !isAbort && (
              <div className="p-2.5 rounded-lg bg-[#12192c] border border-slate-700/80 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-medium">Confidence Band:</span>
                  <span className="text-blue-400 font-bold bg-slate-900 px-2 py-0.5 rounded">
                    {currentZone.safety_score}% ± {currentZone.confidence_interval}%
                  </span>
                </div>
                {/* Visual confidence range bar */}
                <div className="relative w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-blue-500 rounded-full"
                    style={{
                      left: `${Math.max(0, currentZone.score_lower)}%`,
                      width: `${Math.min(100, currentZone.score_upper) - Math.max(0, currentZone.score_lower)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Lower: {currentZone.score_lower}%</span>
                  <span>Range: {currentZone.confidence_pct}% AI Confidence</span>
                  <span>Upper: {currentZone.score_upper}%</span>
                </div>
              </div>
            )}

            {/* Plain-Language Rationale */}
            {analysis && (
              <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed bg-[#101728] p-3 rounded-lg border border-slate-800">
                <div className="font-semibold text-slate-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-slate-400">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>Engineering Assessment</span>
                </div>
                <p className="pt-0.5">{analysis.rationale.summary || analysis.rationale.detailed_rationale}</p>
              </div>
            )}

            {/* Zone Telemetry Metrics */}
            {currentZone && (
              <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                <div className="p-2 rounded-lg bg-[#12192c] border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SLOPE</span>
                  <span className="font-bold text-slate-200">{currentZone.metrics.mean_slope_deg}°</span>
                  <span className="text-[10px] text-slate-500 block">&lt; 8.5° limit</span>
                </div>
                <div className="p-2 rounded-lg bg-[#12192c] border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">BOULDERS</span>
                  <span className="font-bold text-slate-200">{currentZone.metrics.boulder_count}</span>
                  <span className="text-[10px] text-slate-500 block">obstacles</span>
                </div>
                <div className="p-2 rounded-lg bg-[#12192c] border border-slate-800">
                  <span className="text-slate-500 text-[10px] block">SHADOW</span>
                  <span className="font-bold text-slate-200">{currentZone.metrics.shadow_fraction_pct}%</span>
                  <span className="text-[10px] text-slate-500 block">occlusion</span>
                </div>
              </div>
            )}

            {/* Human Pilot Actions (Decision Point 2) */}
            <div className="pt-1 flex gap-2">
              <button
                onClick={handleConfirmDecision}
                disabled={isAbort}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Landing</span>
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-3 py-2 bg-[#141d33] hover:bg-slate-800 text-slate-300 text-xs font-medium rounded-lg border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>{showSettings ? 'Hide Weights' : 'Adjust Weights'}</span>
              </button>
            </div>

            {decisionConfirmed && (
              <div className="p-2 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono text-center rounded-lg animate-fade-in">
                ✓ Zone {decisionConfirmed} Confirmed & Logged to Flight Computer
              </div>
            )}
          </div>

          {/* Sensor Degradation Sandbox (Differentiator 2) */}
          <div className="p-3.5 rounded-xl bg-[#0c1220] border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                <Radio className="w-3.5 h-3.5 text-blue-400" />
                <span>Sensor Dropout Simulator</span>
              </div>
              <button
                onClick={handleResetSensors}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              Test how the AI dynamically reweights remaining sensors and expands the confidence band when a sensor drops:
            </p>

            <div className="grid grid-cols-3 gap-2 text-xs font-mono">
              <button
                onClick={() => handleDropSensor('thermal')}
                className={`p-2 rounded-lg border transition-colors flex flex-col items-center gap-1 text-center ${
                  sensorHealth.thermal === 'offline'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                    : 'bg-[#12192c] border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[10px]">Drop Thermal</span>
                <span className="text-[9px] text-slate-500">{sensorHealth.thermal === 'offline' ? 'OFFLINE' : 'Healthy'}</span>
              </button>

              <button
                onClick={() => handleDropSensor('optical')}
                className={`p-2 rounded-lg border transition-colors flex flex-col items-center gap-1 text-center ${
                  sensorHealth.optical === 'degraded'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#12192c] border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px]">Optical Dust</span>
                <span className="text-[9px] text-slate-500">{sensorHealth.optical === 'degraded' ? 'DEGRADED' : 'Healthy'}</span>
              </button>

              <button
                onClick={() => handleDropSensor('dem')}
                className={`p-2 rounded-lg border transition-colors flex flex-col items-center gap-1 text-center ${
                  sensorHealth.dem === 'degraded'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                    : 'bg-[#12192c] border-slate-700 hover:border-slate-600 text-slate-300'
                }`}
              >
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px]">Radar Glitch</span>
                <span className="text-[9px] text-slate-500">{sensorHealth.dem === 'degraded' ? 'DEGRADED' : 'Healthy'}</span>
              </button>
            </div>

            {analysis?.degradation_flags && analysis.degradation_flags.length > 0 && (
              <div className="p-2 bg-amber-950/40 border border-amber-600/50 rounded-lg text-[11px] text-amber-300 font-mono">
                ⚠️ Sensor fault active: Weights re-normalized; confidence band widened by +10–14%.
              </div>
            )}
          </div>

          {/* Mission Priorities Sliders (Collapsible / Clean) */}
          {showSettings && (
            <div className="p-3.5 rounded-xl bg-[#0c1220] border border-slate-800 space-y-2.5 text-xs">
              <div className="font-bold text-slate-200 text-xs">Mission Trade-Off Weights</div>
              <div className="space-y-2 font-mono">
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5 text-[11px]">
                    <span>Obstacle Weight (YOLO)</span>
                    <span className="text-blue-400 font-bold">{Math.round(weights.boulder_crater * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.05"
                    value={weights.boulder_crater}
                    onChange={(e) => setWeights({ ...weights, boulder_crater: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5 text-[11px]">
                    <span>Slope Gradient Weight</span>
                    <span className="text-blue-400 font-bold">{Math.round(weights.slope * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="0.6"
                    step="0.05"
                    value={weights.slope}
                    onChange={(e) => setWeights({ ...weights, slope: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-slate-400 mb-0.5 text-[11px]">
                    <span>Max Tilt Stability Limit</span>
                    <span className="text-amber-400 font-bold">{maxSlope}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="15"
                    step="0.5"
                    value={maxSlope}
                    onChange={(e) => setMaxSlope(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
              <button
                onClick={() => runAnalysis()}
                className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors mt-2"
              >
                Re-Calculate Ranking
              </button>
            </div>
          )}

          {/* Candidate Zones List */}
          {analysis && (
            <div className="p-3.5 rounded-xl bg-[#0c1220] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Landing Zone Comparison</span>
                <span className="text-[11px] font-mono text-slate-500">{analysis.candidate_zones.length} candidate sites</span>
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {analysis.candidate_zones.map((zone) => {
                  const isSel = currentZone?.zone_id === zone.zone_id;
                  return (
                    <div
                      key={zone.zone_id}
                      onClick={() => handleZoneClick(zone.zone_id)}
                      className={`p-2 rounded-lg border text-xs font-mono cursor-pointer transition-colors flex items-center justify-between ${
                        isSel
                          ? 'bg-blue-950/40 border-blue-500/80 text-white font-bold'
                          : 'bg-[#12192c] border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 text-center text-slate-400">#{zone.rank}</span>
                        <span>{zone.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 text-[11px]">Slope: {zone.metrics.mean_slope_deg}°</span>
                        <span
                          className={`font-bold ${
                            zone.is_critical ? 'text-rose-400' : zone.safety_score >= 70 ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {zone.safety_score}% (±{zone.confidence_interval}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Image Upload Modal (Moon-Image Verification Gate) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-sm text-white">Upload Lunar Imagery</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The <strong>Moon-Image Verification Gate</strong> checks regolith spectral reflectance and morphology. Non-lunar images (e.g. earth photos) will be rejected early.
            </p>

            <label className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#080d1a]">
              <Upload className="w-6 h-6 text-blue-400 mb-2" />
              <span className="text-xs text-slate-200 font-medium">Click to select image file</span>
              <span className="text-[10px] text-slate-500 mt-1">PNG, JPG, GeoTIFF up to 20MB</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            {uploadError && (
              <div className="p-2.5 bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs rounded-lg">
                ✕ {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="p-2.5 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-lg">
                ✓ {uploadSuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
