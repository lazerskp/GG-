'use client';

import React from 'react';
import { Song, Artist } from '@/types/music';
import { ChartsView } from './ChartsView';

interface ChartsOverlayProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialTracks?: Song[];
  initialArtists?: Artist[];
}

export function ChartsOverlay({
  isOpen = false,
  onClose,
}: ChartsOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0A0A]/95 backdrop-blur-2xl overflow-y-auto p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-end">
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs font-mono uppercase tracking-widest text-[#A1A1A1] hover:text-white"
            >
              Close ✕
            </button>
          )}
        </div>
        <ChartsView />
      </div>
    </div>
  );
}
