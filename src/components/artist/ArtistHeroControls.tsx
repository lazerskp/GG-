'use client';

import React from 'react';
import { Play, Pause, Shuffle } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';

interface ArtistHeroControlsProps {
  songs: Song[];
  artistName: string;
}

export function ArtistHeroControls({ songs }: ArtistHeroControlsProps) {
  const { currentTrack, isPlaying, playbackStatus, playTrack, togglePlay } = usePlayerStore();

  if (!songs || songs.length === 0) return null;

  const firstTrack = songs[0];
  const isPlayingArtist = songs.some((s) => s.id === currentTrack?.id);
  const isCurrentlyPlaying = isPlayingArtist && isPlaying && playbackStatus === 'playing';

  const handlePlay = () => {
    if (isPlayingArtist) {
      togglePlay();
    } else {
      playTrack(firstTrack, songs);
    }
  };

  const handleShuffle = () => {
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
  };

  return (
    <div className="flex items-center space-x-3 pt-2">
      <button
        onClick={handlePlay}
        className="px-6 py-3 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider flex items-center space-x-2 hover:bg-neutral-200 transition-all active:scale-95 shadow-xl"
        aria-label={isCurrentlyPlaying ? 'Pause' : 'Play'}
      >
        {isCurrentlyPlaying ? (
          <>
            <Pause className="w-4 h-4 fill-black text-black" />
            <span>Pause</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            <span>Play</span>
          </>
        )}
      </button>

      <button
        onClick={handleShuffle}
        className="p-3 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white transition-all active:scale-95 border border-white/[0.08]"
        aria-label="Shuffle artist songs"
        title="Shuffle"
      >
        <Shuffle className="w-4 h-4" />
      </button>
    </div>
  );
}
