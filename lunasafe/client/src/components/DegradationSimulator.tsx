import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Camera,
  Cpu,
  Radio,
  Thermometer,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { SensorHealth, DegradationComparison } from '../types/landing';
import { apiClient } from '../services/api';

interface DegradationSimulatorProps {
  sensorHealth: SensorHealth;
  onUpdateSensorHealth: (health: SensorHealth) => void;
  scenarioId: string;
}

export const DegradationSimulator: React.FC<DegradationSimulatorProps> = ({
  sensorHealth,
  onUpdateSensorHealth,
  scenarioId,
}) => {
  const [comparison, setComparison] = useState<DegradationComparison | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const runDegradationSimulation = async (sensor: string) => {
    setLoading(true);
    try {
      const res = await apiClient.simulateDegradation({
        scenario_id: scenarioId,
        dropped_sensor: sensor,
      });
      setComparison(res);

      if (sensor === 'thermal') {
        onUpdateSensorHealth({ ...sensorHealth, thermal: 'offline' });
      } else if (sensor === 'optical') {
        onUpdateSensorHealth({ ...sensorHealth, optical: 'degraded' });
      } else if (sensor === 'dem') {
        onUpdateSensorHealth({ ...sensorHealth, dem: 'degraded' });
      }
    } catch (e) {
      console.error('Failed to simulate sensor degradation', e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    onUpdateSensorHealth({
      optical: 'healthy',
      dem: 'healthy',
      thermal: 'healthy',
    });
    setComparison(null);
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Required Differentiator 2
            </div>
            <h2 className="text-sm font-bold text-slate-100">Graceful Sensor Degradation & Dynamic Reweighting</h2>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="px-2.5 py-1 text-xs font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
        >
          Reset All Sensors
        </button>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed font-sans">
        In real spaceflight, sensors degrade due to thruster plume dust, thermal shock, or hardware faults.
        LUNA-SAFE dynamically re-normalizes remaining sensor weights and explicitly flags confidence downgrades
        instead of failing silently.
      </p>

      {/* Live Sensor Health Toggles */}
      <div className="grid grid-cols-3 gap-2.5 text-xs font-mono">
        {/* Optical Sensor */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Camera className="w-3.5 h-3.5 text-amber-400" />
              <span>Optical / YOLO</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                sensorHealth.optical === 'healthy'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : sensorHealth.optical === 'degraded'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {sensorHealth.optical.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={() => onUpdateSensorHealth({ ...sensorHealth, optical: 'healthy' })}
              className={`py-1 rounded text-[10px] ${
                sensorHealth.optical === 'healthy'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              OK
            </button>
            <button
              onClick={() => onUpdateSensorHealth({ ...sensorHealth, optical: 'degraded' })}
              className={`py-1 rounded text-[10px] ${
                sensorHealth.optical === 'degraded'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Dust
            </button>
            <button
              onClick={() => onUpdateSensorHealth({ ...sensorHealth, optical: 'offline' })}
              className={`py-1 rounded text-[10px] ${
                sensorHealth.optical === 'offline'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Off
            </button>
          </div>
        </div>

        {/* DEM Radar Sensor */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>DEM Radar</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                sensorHealth.dem === 'healthy'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : sensorHealth.dem === 'degraded'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {sensorHealth.dem.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              onClick={() => onUpdateSensorHealth({ ...sensorHealth, dem: 'healthy' })}
              className={`py-1 rounded text-[10px] ${
                sensorHealth.dem === 'healthy'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              OK
            </button>
            <button
              onClick={() => onUpdateSensorHealth({ ...sensorHealth, dem: 'degraded' })}
              className={`py-1 rounded text-[10px] ${
                sensorHealth.dem === 'degraded'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Noisy
            </button>
            <button
              onClick={() => onUpdateSensorHealth({ ...sensorHealth, dem: 'offline' })}
              className={`py-1 rounded text-[10px] ${
                sensorHealth.dem === 'offline'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Off
            </button>
          </div>
        </div>

        {/* Thermal Radiometer Sensor */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5 font-bold">
              <Thermometer className="w-3.5 h-3.5 text-rose-400" />
              <span>Thermal Sensor</span>
            </span>
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] ${
                sensorHealth.thermal === 'healthy'
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/20 text-rose-300'
              }`}
            >
              {sensorHealth.thermal.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1">
            <button
              onClick={() => onUpdateSensorHealth({ ...sensorHealth, thermal: 'healthy' })}
              className={`py-1 rounded text-[10px] ${
                sensorHealth.thermal === 'healthy'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => onUpdateSensorHealth({ ...sensorHealth, thermal: 'offline' })}
              className={`py-1 rounded text-[10px] ${
                sensorHealth.thermal === 'offline'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* One-Click Degradation Scenarios */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-mono text-slate-400">QUICK DEMONSTRATION FAULT INJECTIONS:</div>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => runDegradationSimulation('thermal')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-rose-300 transition-all text-left"
          >
            🔥 Drop Thermal Sensor
          </button>
          <button
            onClick={() => runDegradationSimulation('optical')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 transition-all text-left"
          >
            💨 Optical Dust Storm
          </button>
          <button
            onClick={() => runDegradationSimulation('dem')}
            disabled={loading}
            className="px-3 py-2 rounded-xl bg-slate-950/90 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-300 transition-all text-left"
          >
            📡 Degrade DEM Radar
          </button>
        </div>
      </div>

      {/* Before / After Comparison Display */}
      {comparison && (
        <div className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-amber-300">
            <span className="font-bold flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" />
              <span>SENSOR FAULT IMPACT ANALYSIS</span>
            </span>
            <span className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
              +{comparison.confidence_widening_pts}% Uncertainty Expansion
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {comparison.impact_summary}
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Healthy State Box */}
            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30 font-mono text-xs space-y-1.5">
              <div className="text-emerald-400 font-bold flex items-center justify-between">
                <span>BEFORE (Nominal)</span>
                <span>{comparison.healthy_state.top_zone}</span>
              </div>
              <div className="text-slate-300">
                Score: <strong className="text-white">{comparison.healthy_state.safety_score}%</strong>
              </div>
              <div className="text-slate-300">
                Confidence Band:{' '}
                <strong className="text-cyan-400">{comparison.healthy_state.confidence_band}</strong>
              </div>
            </div>

            {/* Degraded State Box */}
            <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 font-mono text-xs space-y-1.5">
              <div className="text-amber-400 font-bold flex items-center justify-between">
                <span>AFTER (Fault Injected)</span>
                <span>{comparison.degraded_state.top_zone}</span>
              </div>
              <div className="text-slate-300">
                Score: <strong className="text-white">{comparison.degraded_state.safety_score}%</strong>
              </div>
              <div className="text-slate-300">
                Confidence Band:{' '}
                <strong className="text-amber-400">{comparison.degraded_state.confidence_band}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
