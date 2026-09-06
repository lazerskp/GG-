'use client';

import React from 'react';
import { Music4 } from 'lucide-react';
import { AppleLyricsIcon } from '@/components/icons/ApplePlayerIcons';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useLyrics } from '@/hooks/useLyrics';
import { SyncedLyrics } from './SyncedLyrics';

export function LyricsPanel() {
  const { currentTrack, currentTime, seek } = usePlayerStore();
  const { lyrics, isLoading, error } = useLyrics(currentTrack);

  if (!currentTrack) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Track context header */}
      <div className="px-4 pt-3 pb-2.5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-1.5 text-[#8F8F8F]">
          <AppleLyricsIcon className="w-3.5 h-3.5" />
          <p className="text-[10px] font-mono uppercase tracking-widest">Lyrics</p>
        </div>
        <p className="text-xs sm:text-sm font-semibold text-white truncate mt-1">{currentTrack.title}</p>
        <p className="text-[11px] text-[#A1A1A1] truncate">{currentTrack.artist}</p>
      </div>

      {/* Content area */}
      <div className="flex-1 min-h-0">
        {isLoading && (
          <div className="h-full flex flex-col justify-center px-8 space-y-4 animate-pulse select-none">
            {[70, 90, 55, 80, 40, 65].map((w, i) => (
              <div key={i} className="h-4 rounded-full bg-white/[0.05]" style={{ width: `${w}%` }} />
            ))}
          </div>
        )}

        {!isLoading && error && (
          <EmptyLyrics
            message="Lyrics could not be loaded right now. Please try again shortly."
          />
        )}

        {!isLoading && !error && lyrics && (
          <div key={lyrics.status} className="h-full animate-panel-content">
            {lyrics.status === 'synced' && lyrics.lines && (
              <SyncedLyrics lines={lyrics.lines} currentTime={currentTime} onSeek={seek} />
            )}

            {lyrics.status === 'plain' && lyrics.text && (
              <div className="h-full overflow-y-auto px-6 py-8 space-y-1">
                {lyrics.text.map((line, idx) => (
                  <p key={idx} className="text-base text-[#D4D4D4] leading-relaxed">
                    {line || '\u00A0'}
                  </p>
                ))}
              </div>
            )}

            {lyrics.status === 'instrumental' && (
              <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-3">
                <Music4 className="w-6 h-6 text-[#8F8F8F]" />
                <p className="text-sm text-white font-medium">Instrumental track</p>
                <p className="text-xs text-[#8F8F8F] leading-relaxed">
                  This recording has no lyrics.
                </p>
              </div>
            )}

            {lyrics.status === 'unavailable' && (
              <EmptyLyrics message="Lyrics unavailable for this track" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyLyrics({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-3">
      <AppleLyricsIcon className="w-6 h-6 text-[#8F8F8F]" />
      <p className="text-sm text-[#A1A1A1] font-medium leading-relaxed">{message}</p>
    </div>
  );
}
