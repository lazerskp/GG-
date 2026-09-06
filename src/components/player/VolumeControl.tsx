'use client';

import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  className?: string;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = '',
}: VolumeControlProps) {
  const currentVolume = isMuted ? 0 : volume;

  const renderIcon = () => {
    if (isMuted || currentVolume === 0) {
      return <VolumeX className="w-3.5 h-3.5 text-[#8F8F8F]" />;
    }
    if (currentVolume < 0.5) {
      return <Volume1 className="w-3.5 h-3.5 text-[#A1A1A6]" />;
    }
    return <Volume2 className="w-3.5 h-3.5 text-[#A1A1A6] group-hover:text-white" />;
  };

  return (
    <div className={`flex items-center gap-1 group ${className}`}>
      <button
        onClick={onToggleMute}
        className="p-1.5 rounded-full text-[#A1A1A6] hover:text-white hover:bg-white/[0.06] transition-colors focus:outline-hidden"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {renderIcon()}
      </button>

      <div className="w-12 sm:w-14 lg:w-18 relative flex items-center h-4">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-[#27272A] rounded-full appearance-none cursor-pointer accent-white hover:accent-white"
          aria-label="Adjust volume"
        />
      </div>
    </div>
  );
}
