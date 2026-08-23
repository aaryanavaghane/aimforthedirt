import React, { useRef } from 'react';

interface MagneticButtonProps {
  onClick?: () => void;
  className?: string;
  childrenPrimary: string;
  childrenSecondary?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'glass';
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  onClick,
  className = '',
  childrenPrimary,
  childrenSecondary,
  icon,
  disabled = false,
  variant = 'primary',
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
    primary:
      'bg-gradient-to-r from-[#FF1493] to-[#FF69B4] text-white shadow-[0_0_25px_rgba(255,20,147,0.5)] hover:shadow-[0_0_40px_rgba(255,20,147,0.85)] border border-[#FFB6C1]/40',
    secondary:
      'bg-[#1a030f]/80 text-[#FFF0F5] border border-[#FF1493]/40 hover:border-[#FF1493] shadow-[0_0_20px_rgba(255,20,147,0.2)]',
    glass:
      'bg-[#0a0206]/70 backdrop-blur-xl text-white border border-[#FF1493]/30 hover:border-[#FF1493]/70 hover:bg-[#1a030f]/90',
  };

  return (
    <button
      ref={btnRef}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative group overflow-hidden px-7 py-3.5 rounded-full font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex items-center transition-transform group-hover:rotate-12 duration-200">{icon}</span>}
      <div className="relative overflow-hidden h-[18px]">
        <div className="flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-[18px]">
          <span className="h-[18px] flex items-center justify-center whitespace-nowrap">
            {childrenPrimary}
          </span>
          <span className="h-[18px] flex items-center justify-center text-[#FFD1DC] whitespace-nowrap">
            {childrenSecondary || childrenPrimary}
          </span>
        </div>
      </div>
    </button>
  );
};
