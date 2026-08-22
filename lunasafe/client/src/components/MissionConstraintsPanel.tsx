import React from 'react';
import { Sliders, Compass, Rocket, Shield, Fuel, Microscope, RefreshCw } from 'lucide-react';
import { MissionWeights } from '../types/landing';

interface MissionConstraintsPanelProps {
  weights: MissionWeights;
  onUpdateWeights: (newWeights: MissionWeights) => void;
  maxSlope: number;
  onUpdateMaxSlope: (slope: number) => void;
  onReanalyze: () => void;
  loading: boolean;
}

export const MissionConstraintsPanel: React.FC<MissionConstraintsPanelProps> = ({
  weights,
  onUpdateWeights,
  maxSlope,
  onUpdateMaxSlope,
  onReanalyze,
  loading,
}) => {
  const handleWeightChange = (key: keyof MissionWeights, val: number) => {
    onUpdateWeights({
      ...weights,
      [key]: val,
    });
  };

  const applyPreset = (preset: 'standard' | 'fuel' | 'science' | 'rough') => {
    if (preset === 'standard') {
      onUpdateWeights({
        boulder_crater: 0.30,
        slope: 0.30,
        roughness: 0.15,
        thermal: 0.15,
        fuel_distance: 0.10,
        science_value: 0.00,
      });
      onUpdateMaxSlope(8.5);
    } else if (preset === 'fuel') {
      onUpdateWeights({
        boulder_crater: 0.25,
        slope: 0.25,
        roughness: 0.10,
        thermal: 0.05,
        fuel_distance: 0.35,
        science_value: 0.00,
      });
      onUpdateMaxSlope(9.0);
    } else if (preset === 'science') {
      onUpdateWeights({
        boulder_crater: 0.25,
        slope: 0.25,
        roughness: 0.10,
        thermal: 0.15,
        fuel_distance: 0.05,
        science_value: 0.20,
      });
      onUpdateMaxSlope(8.0);
    } else if (preset === 'rough') {
      onUpdateWeights({
        boulder_crater: 0.35,
        slope: 0.20,
        roughness: 0.25,
        thermal: 0.10,
        fuel_distance: 0.10,
        science_value: 0.00,
      });
      onUpdateMaxSlope(12.0);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-4 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">
              Decision Point 1
            </div>
            <h2 className="text-sm font-bold text-slate-100">Mission Constraints & Trade-off Reweighting</h2>
          </div>
        </div>

        <button
          onClick={onReanalyze}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-mono font-bold text-xs shadow-md shadow-cyan-500/20 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Update Model</span>
        </button>
      </div>

      {/* Mission Profile Presets */}
      <div>
        <div className="text-[11px] font-mono text-slate-400 mb-2">QUICK MISSION PROFILE PRESETS:</div>
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <button
            onClick={() => applyPreset('standard')}
            className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-left text-slate-200 transition-colors"
          >
            🛡️ Standard Safe Landing
          </button>
          <button
            onClick={() => applyPreset('science')}
            className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-left text-cyan-300 transition-colors"
          >
            🔬 Polar Volatiles Prospecting
          </button>
          <button
            onClick={() => applyPreset('fuel')}
            className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-left text-amber-300 transition-colors"
          >
            ⛽ Pinpoint / Fuel-Constrained
          </button>
          <button
            onClick={() => applyPreset('rough')}
            className="p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-700/80 text-left text-emerald-300 transition-colors"
          >
            🦿 Heavy Rough-Terrain Lander
          </button>
        </div>
      </div>

      {/* Interactive Sliders */}
      <div className="space-y-3 pt-2 border-t border-slate-800">
        {/* Optical Boulders/Craters */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>Obstacle Density Weight (YOLO)</span>
            <span className="text-cyan-400 font-bold">{Math.round(weights.boulder_crater * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.05"
            value={weights.boulder_crater}
            onChange={(e) => handleWeightChange('boulder_crater', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Slope Gradient */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>Terrain Slope Weight (DEM)</span>
            <span className="text-cyan-400 font-bold">{Math.round(weights.slope * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.6"
            step="0.05"
            value={weights.slope}
            onChange={(e) => handleWeightChange('slope', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Roughness */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>Roughness / Ruggedness Index</span>
            <span className="text-cyan-400 font-bold">{Math.round(weights.roughness * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.05"
            value={weights.roughness}
            onChange={(e) => handleWeightChange('roughness', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Thermal / Subsurface */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>Thermal Anomaly & Cold-Trap Risk</span>
            <span className="text-cyan-400 font-bold">{Math.round(weights.thermal * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.05"
            value={weights.thermal}
            onChange={(e) => handleWeightChange('thermal', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Fuel Distance */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>Fuel Margin / Target Proximity Penalty</span>
            <span className="text-cyan-400 font-bold">{Math.round(weights.fuel_distance * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.05"
            value={weights.fuel_distance}
            onChange={(e) => handleWeightChange('fuel_distance', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Science Value */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>Scientific Exploration Priority</span>
            <span className="text-cyan-400 font-bold">{Math.round(weights.science_value * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="0.4"
            step="0.05"
            value={weights.science_value}
            onChange={(e) => handleWeightChange('science_value', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Maximum Safe Slope Limit */}
        <div className="pt-2 border-t border-slate-800">
          <div className="flex justify-between text-xs font-mono mb-1 text-slate-300">
            <span>Lander Tilt Stability Limit</span>
            <span className="text-amber-400 font-bold">{maxSlope.toFixed(1)}°</span>
          </div>
          <input
            type="range"
            min="5.0"
            max="15.0"
            step="0.5"
            value={maxSlope}
            onChange={(e) => onUpdateMaxSlope(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="text-[10px] text-slate-500 font-mono mt-1">
            Zones exceeding this slope trigger hard safety violations.
          </div>
        </div>
      </div>
    </div>
  );
};
