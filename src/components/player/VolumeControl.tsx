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
      return <VolumeX className="w-4 h-4 text-[#8F8F8F]" />;
    }
    if (currentVolume < 0.5) {
      return <Volume1 className="w-4 h-4 text-[#A1A1A1]" />;
    }
    return <Volume2 className="w-4 h-4 text-[#A1A1A1] group-hover:text-white" />;
  };

  return (
    <div className={`flex items-center space-x-2 group ${className}`}>
      <button
        onClick={onToggleMute}
        className="p-1 rounded text-[#A1A1A1] hover:text-white transition-colors focus:outline-hidden"
        aria-label={isMuted ? 'Unmute' : 'Mute'}
      >
        {renderIcon()}
      </button>

      <div className="w-14 md:w-16 lg:w-24 relative flex items-center h-4">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={currentVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 bg-[#262626] rounded-full appearance-none cursor-pointer"
          aria-label="Adjust volume"
        />
      </div>
    </div>
  );
}
