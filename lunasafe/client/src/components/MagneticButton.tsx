import React, { useRef } from 'react';

interface MagneticButtonProps {
  onClick?: () => void;
  className?: string;
  childrenPrimary: string;
  childrenSecondary?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'glass' | 'pill';
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  onClick,
  className = '',
  childrenPrimary,
  childrenSecondary,
  icon,
  disabled = false,
  variant = 'pill',
}) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    btnRef.current.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) scale(1.04)`;
  };

  const handleMouseLeave = () => {
    if (!btnRef.current) return;
    btnRef.current.style.transform = `translate(0px, 0px) scale(1)`;
  };

  const variantStyles = {
    pill:
      'bg-white hover:bg-[#00F5FF] text-[#081B4B] hover:text-[#020408] border border-white/90 shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_45px_rgba(0,245,255,0.8)]',
    primary:
      'bg-gradient-to-r from-[#0D38E8] to-[#00F5FF] text-white shadow-[0_0_25px_rgba(0,245,255,0.45)] hover:shadow-[0_0_40px_rgba(0,245,255,0.8)] border border-[#38BDF8]/40',
    secondary:
      'bg-[#081B4B]/80 text-[#F1F5F9] border border-[#00F5FF]/40 hover:border-[#00F5FF] shadow-[0_0_20px_rgba(0,245,255,0.2)]',
    glass:
      'bg-[#050D24]/80 backdrop-blur-xl text-white border border-[#00F5FF]/30 hover:border-[#00F5FF] hover:bg-[#0A2396]/90',
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group overflow-hidden px-8 py-3.5 rounded-full font-mono text-xs font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex items-center transition-transform group-hover:rotate-12 duration-200">{icon}</span>}
      <div className="relative overflow-hidden h-[18px]">
        <div className="flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[18px]">
          <span className="h-[18px] flex items-center justify-center whitespace-nowrap">
            {childrenPrimary}
          </span>
          <span className="h-[18px] flex items-center justify-center whitespace-nowrap font-extrabold">
            {childrenSecondary || childrenPrimary}
          </span>
        </div>
      </div>
    </button>
  );
};
