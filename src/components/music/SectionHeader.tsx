import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actionText,
  onAction,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between mb-6 sm:mb-8 ${className}`}>
      <div className="space-y-1.5">
        {eyebrow && (
          <p className="text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.2em] text-[#A1A1A1] uppercase">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white uppercase">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-[#A1A1A1] max-w-2xl leading-relaxed font-normal">
            {description}
          </p>
        )}
      </div>

      {actionText && (
        <button
          onClick={onAction}
          className="text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-all duration-150 pb-1 flex items-center space-x-1 group shrink-0 ml-4"
        >
          <span>{actionText}</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </button>
      )}
    </div>
  );
}
