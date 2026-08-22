import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'cyan' | 'rose' | 'amber' | 'emerald' | 'violet' | 'none';
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  glowColor = 'cyan',
  onClick
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const glowStyles = {
    cyan: 'hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.35)] hover:border-cyan-500/40',
    rose: 'hover:shadow-[0_0_30px_-5px_rgba(244,63,94,0.35)] hover:border-rose-500/40',
    amber: 'hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.35)] hover:border-amber-500/40',
    emerald: 'hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.35)] hover:border-emerald-500/40',
    violet: 'hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.35)] hover:border-violet-500/40',
    none: 'hover:border-slate-700'
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 backdrop-blur-xl border border-slate-800/80 transition-all duration-200 cursor-pointer ${glowStyles[glowColor]} ${className}`}
    >
      <div style={{ transform: 'translateZ(20px)' }} className="h-full">
        {children}
      </div>
    </motion.div>
  );
};
