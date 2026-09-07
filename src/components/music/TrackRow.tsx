'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';

import { getThumbnailArtwork } from '@/utils/artworkQuality';
import { formatArtistLabel, formatArtistFullCredit } from '@/utils/musicClassification';

interface TrackRowProps {
  track: Song;
  index: number;
  playlistContext?: Song[];
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function TrackRow({ track, index, playlistContext }: TrackRowProps) {
  const { currentTrack, isPlaying, playbackStatus, playTrack, togglePlay } = usePlayerStore();

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying && playbackStatus === 'playing';

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track, playlistContext);
    }
  };

  const formattedRank = String(index + 1).padStart(2, '0');
  const thumbnailSrc = getThumbnailArtwork(track.artworkUrl, 160) || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop';

  // Multi-artist display: prefer the full credits list, fall back to
  // the primary artist string. The full credit string is preserved in
  // the title attribute for tooltips / detail pages.
  const allCreditNames = (track.artistCredits && track.artistCredits.length > 0)
    ? track.artistCredits
    : (track.artist ? [track.artist] : []);
  const displayLabel = formatArtistLabel({
    artists: allCreditNames,
    primaryIsVarious: track.isVariousArtists,
  });
  const fullCreditTitle = formatArtistFullCredit({
    artists: allCreditNames,
    primaryIsVarious: track.isVariousArtists,
  });

  // Only link the primary credit when the track has a real upstream ID
  // and is not a "Various Artists" compilation.
  const canLinkPrimary = Boolean(track.artistId) && !track.isVariousArtists;

  return (
    <div
      onClick={handlePlayClick}
      className={`group relative flex items-center justify-between px-3 sm:px-4 py-3 rounded-lg transition-colors duration-150 cursor-pointer select-none ${isCurrentTrack
          ? 'bg-white/[0.07] text-white'
          : 'hover:bg-white/[0.04] text-[#A1A1A1]'
        }`}
    >
      {/* Left: Index / Play Control + Artwork + Title & Artist */}
      <div className="flex items-center space-x-3.5 sm:space-x-4 min-w-0 pr-4">
        {/* Track number & Play Button / Equalizer swap */}
        <div className="w-6 flex items-center justify-center text-xs font-mono text-[#A1A1A1] group-hover:text-white shrink-0">
          {isCurrentlyPlaying ? (
            <div className="flex items-center justify-center">
              <span className="hidden group-hover:block">
                <Pause className="w-3.5 h-3.5 fill-white text-white" />
              </span>
              {/* 3-bar Animated Equalizer (animates ONLY while active playback is occurring) */}
              <div className="flex items-end space-x-[2px] h-3.5 group-hover:hidden">
                <span className="w-[2.5px] bg-white rounded-full animate-eq-1" />
                <span className="w-[2.5px] bg-white rounded-full animate-eq-2" />
                <span className="w-[2.5px] bg-white rounded-full animate-eq-3" />
              </div>
            </div>
          ) : isCurrentTrack ? (
            <div className="flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-white text-white" />
            </div>
          ) : (
            <>
              <span className="block group-hover:hidden font-mono text-[13px] text-[#A1A1A1]">
                {formattedRank}
              </span>
              <button
                onClick={handlePlayClick}
                aria-label={`Play ${track.title}`}
                className="hidden group-hover:block transition-transform hover:scale-110 text-white"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnail Artwork */}
        <div className="relative w-11 h-11 rounded-md overflow-hidden bg-[#171717] shrink-0 border border-white/[0.06] group-hover:scale-105 transition-transform duration-300">
          <Image
            src={thumbnailSrc}
            alt={track.title}
            fill
            sizes="44px"
            className="object-cover"
          />
        </div>

        {/* Title & Artist Link */}
        <div className="min-w-0 truncate">
          <p
            className={`text-sm truncate leading-tight transition-colors ${isCurrentTrack ? 'text-white font-bold' : 'text-neutral-200 group-hover:text-white font-medium'
              }`}
          >
            {track.title}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            {canLinkPrimary ? (
              <Link
                href={`/artist/${encodeURIComponent(track.artistId)}`}
                onClick={(e) => e.stopPropagation()}
                aria-label={`Open ${track.artist} artist page (${track.title})`}
                className="text-xs text-[#A1A1A1] truncate hover:text-white hover:underline transition-colors"
                title={fullCreditTitle}
              >
                {displayLabel}
              </Link>
            ) : (
              <span
                className="text-xs text-[#A1A1A1] truncate"
                title={fullCreditTitle}
              >
                {displayLabel}
              </span>
            )}
            {track.album && (
              <>
                <span className="text-[10px] text-[#A1A1A1]">•</span>
                <span className="text-xs text-[#A1A1A1] truncate hidden sm:inline">
                  {track.album}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Genre + Duration */}
      <div className="flex items-center space-x-4 shrink-0 text-xs text-[#A1A1A1]">
        {track.genre && (
          <span className="hidden md:inline-block px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase rounded bg-white/[0.03] text-[#A1A1A1]">
            {track.genre}
          </span>
        )}

        <span className="font-mono text-xs tabular-nums text-[#A1A1A1] group-hover:text-white">
          {formatDuration(track.duration)}
        </span>
      </div>
    </div>
  );
}
