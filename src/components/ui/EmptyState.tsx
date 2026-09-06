import React from 'react';
import { Disc3 } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = 'No music found',
  description = 'Try adjusting your search or exploring our featured categories.',
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-white/[0.06] bg-[#111111]/30">
      <div className="p-3 mb-4 rounded-full bg-white/[0.04] text-[#A1A1A1]">
        {icon || <Disc3 className="w-8 h-8 stroke-[1.5]" />}
      </div>
      <h3 className="text-lg font-medium text-white tracking-tight">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[#8F8F8F] leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-black bg-white rounded-full hover:bg-neutral-200 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
