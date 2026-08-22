import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Cpu, Zap, Activity, AlertTriangle } from 'lucide-react';

interface SimulationOverlayProps {
  isVisible: boolean;
  scenarioName: string;
  onComplete?: () => void;
}

export const SimulationOverlay: React.FC<SimulationOverlayProps> = ({
  isVisible,
  scenarioName,
  onComplete
}) => {
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState('Initializing Pune GIS Neural Grid...');

  useEffect(() => {
    if (!isVisible) {
      setProgress(0);
      return;
    }

    const logs = [
      'Ingesting Mula-Mutha hydrological flux models...',
      'Simulating piezoelectric pier stress on Bund Garden & Rajaram bridges...',
      'Calculating stormwater backpressure across Shahir Amar Shaikh culverts...',
      'Recalculating 15 Pune Municipal Corporation ward risk vectors...',
      'Synthesizing predictive failure matrix & emergency mitigation directives...'
    ];

    let currentLogIndex = 0;
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          if (onComplete) setTimeout(onComplete, 400);
          return 100;
        }
        const next = prev + 10;
        const logIndex = Math.min(Math.floor(next / 22), logs.length - 1);
        if (logIndex !== currentLogIndex) {
          currentLogIndex = logIndex;
          setStatusLog(logs[logIndex]);
        }
        return next;
      });
    }, 120);

    return () => clearInterval(progressInterval);
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] bg-[#050811]/90 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
      >
        {/* Animated Cyber Hologram Ring */}
        <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
          {/* Pulsing Outer Rings */}
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-ping opacity-50" />
          <div className="absolute -inset-4 rounded-full border border-purple-500/20 animate-spin" style={{ animationDuration: '8s' }} />
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-400/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '6s' }} />

          {/* Central AI Core */}
          <div className="w-24 h-24 rounded-2xl bg-slate-950 border border-cyan-500 shadow-glow-cyan flex items-center justify-center relative overflow-hidden">
            {/* Laser scanning beam */}
            <motion.div
              animate={{ y: [-48, 48] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
            />
            <BrainCircuit className="w-12 h-12 text-cyan-400 animate-pulse" />
          </div>
        </div>

        {/* Text Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 max-w-lg"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold tracking-widest uppercase">
            <Zap className="w-3.5 h-3.5" />
            Neural Crisis Matrix
          </div>

          <h2 className="text-2xl lg:text-3xl font-black text-white font-display tracking-tight">
            AI Recalculating City Risk Matrix...
          </h2>

          <p className="text-sm font-semibold text-cyan-300 font-mono">
            Active Scenario: {scenarioName}
          </p>

          {/* Progress Bar & Status Text */}
          <div className="mt-6 space-y-2">
            <div className="w-72 sm:w-96 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto border border-slate-700">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400 w-72 sm:w-96 mx-auto px-1">
              <span>{progress}% Loaded</span>
              <span className="text-emerald-400 font-bold">14ms Latency</span>
            </div>

            <p className="text-xs text-slate-400 font-mono h-6 transition-all duration-200">
              {statusLog}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
