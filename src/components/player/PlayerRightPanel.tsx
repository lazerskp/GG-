'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AppleLyricsIcon, AppleQueueIcon } from '@/components/icons/ApplePlayerIcons';
import { usePlayerStore } from '@/store/usePlayerStore';
import { LyricsPanel } from './LyricsPanel';
import { QueuePanel } from './QueuePanel';

/**
 * Unified right-side player panel.
 *
 * - Desktop: slides in from the right as a glass drawer (340px).
 * - Mobile: slides up as a full-height sheet above the mini player.
 * - Lyrics and Queue share this single panel and animate between contents.
 * - Playback is never interrupted (the global YouTube player keeps running).
 * - Closes with X or Escape.
 */
export function PlayerRightPanel() {
  const { rightPanelMode, setRightPanelMode, closeRightPanel } = usePlayerStore();

  // Escape closes the panel
  useEffect(() => {
    if (!rightPanelMode) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRightPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [rightPanelMode, closeRightPanel]);

  const isLyrics = rightPanelMode === 'lyrics';

  return (
    <>
      {/* Scrim — mobile only (desktop panel smoothly shifts page content and player) */}
      <div
        onClick={closeRightPanel}
        className={`md:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40 transition-opacity duration-300 ${
          rightPanelMode ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Edge-Attached Full-Height Side Drawer (340px standard on desktop) */}
      <aside
        aria-label={isLyrics ? 'Lyrics Panel' : 'Queue Panel'}
        className={`
          fixed z-50 flex flex-col
          bg-[#0E0E10]/98 backdrop-blur-3xl border-l border-white/[0.08]
          shadow-[-16px_0_48px_rgba(0,0,0,0.85)]
          top-0 right-0 bottom-0
          w-full sm:w-[320px] md:w-[340px] max-w-[340px]
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${rightPanelMode ? 'translate-x-0' : 'translate-x-full pointer-events-none'}
        `}
      >
        {/* Mode switcher header — compact typography, no boxes */}
        <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center space-x-5">
            <button
              onClick={() => setRightPanelMode('lyrics')}
              className={`relative text-[11px] font-mono uppercase tracking-wider transition-all py-1 ${
                isLyrics ? 'text-white font-bold' : 'text-[#8F8F8F] hover:text-[#D4D4D4]'
              }`}
              aria-pressed={isLyrics}
            >
              <span className="flex items-center gap-1.5">
                <AppleLyricsIcon className="w-3.5 h-3.5" />
                <span>LYRICS</span>
              </span>
              {isLyrics && (
                <span className="absolute -bottom-[11px] left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>

            <button
              onClick={() => setRightPanelMode('queue')}
              className={`relative text-[11px] font-mono uppercase tracking-wider transition-all py-1 ${
                !isLyrics ? 'text-white font-bold' : 'text-[#8F8F8F] hover:text-[#D4D4D4]'
              }`}
              aria-pressed={!isLyrics}
            >
              <span className="flex items-center gap-1.5">
                <AppleQueueIcon className="w-3.5 h-3.5" />
                <span>QUEUE</span>
              </span>
              {!isLyrics && (
                <span className="absolute -bottom-[11px] left-0 right-0 h-[2px] bg-white rounded-full" />
              )}
            </button>
          </div>

          <button
            onClick={closeRightPanel}
            className="p-1 rounded-full text-[#8F8F8F] hover:text-white hover:bg-white/[0.06] transition-colors"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        <div key={rightPanelMode} className="flex-1 min-h-0 overflow-hidden">
          {isLyrics ? <LyricsPanel /> : <QueuePanel />}
        </div>
      </aside>
    </>
  );
}
