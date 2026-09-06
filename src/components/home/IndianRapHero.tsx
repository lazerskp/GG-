'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
import { Artist, Song } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';

import { getMediumArtwork, getThumbnailArtwork } from '@/utils/artworkQuality';

interface IndianRapHeroProps {
  artist?: Artist | null;
  track?: Song | null;
  playlistContext?: Song[];
}

export function IndianRapHero({ artist, track, playlistContext }: IndianRapHeroProps) {
  const { currentTrack, isPlaying, playbackStatus, playTrack, togglePlay } = usePlayerStore();

  if (!artist || !track) {
    return (
      <section
        id="indian-rap"
        aria-label="Indian Rap Spotlight"
        className="relative w-full overflow-hidden mb-12 sm:mb-16 py-12 text-center"
      >
        <p className="text-xs font-mono uppercase tracking-widest text-[#A1A1A1] mb-2">SPOTLIGHT</p>
        <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">Desi Hip-Hop Catalog Synchronizing</h2>
        <p className="text-sm text-[#A1A1A1] mt-2 max-w-md mx-auto">Live metadata is syncing from the network. Check back in a moment or search below.</p>
      </section>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying && playbackStatus === 'playing';

  const handlePlayHeroTrack = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track, playlistContext);
    }
  };

  const rawHeroSrc =
    artist.imageUrl?.trim() ||
    track.artworkUrl?.trim() ||
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop';
  const heroImageSrc = getMediumArtwork(rawHeroSrc);

  return (
    <section
      id="indian-rap"
      aria-label="Indian Rap Spotlight"
      className="relative w-full overflow-hidden mb-16 sm:mb-20 rounded-3xl"
    >
      {/* Background Cinematic Visual & Ambient Color Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Ambient Blur Layer derived from active artwork */}
        <div
          className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 rounded-full blur-[120px] opacity-25"
          style={{
            background: 'radial-gradient(circle, var(--artwork-dominant, rgba(255,255,255,0.15)) 0%, transparent 70%)',
          }}
        />

        <Image
          src={heroImageSrc}
          alt={artist.name}
          fill
          priority
          loading="eager"
          quality={70}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1200px"
          className="object-cover object-top opacity-30 sm:opacity-45 filter contrast-110 saturate-95 scale-100 hover:scale-102 transition-transform duration-1000 ease-out"
        />
        {/* Soft edge-blending gradient vignettes into canvas */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
      </div>

      {/* Hero Content Surface */}
      <div className="relative z-10 px-4 sm:px-8 md:px-12 py-12 sm:py-16 lg:py-20 flex flex-col justify-end min-h-[440px] sm:min-h-[500px] lg:min-h-[560px]">
        {/* Eyebrow */}
        <div className="flex items-center space-x-2.5 mb-3.5">
          <span className="inline-block w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.2em] text-white/90 uppercase font-semibold">
            INDIAN RAP • EDITORIAL SPOTLIGHT
          </span>
        </div>

        {/* Major Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-white uppercase max-w-4xl leading-[0.98] mb-5">
          The sound shaping a generation.
        </h1>

        {/* Short Editorial Context */}
        <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl leading-relaxed mb-8 font-normal">
          From Mumbai gullies and West Delhi streets to stadium anthems worldwide. Explore the lyrical force, raw 808s, and groundbreaking records defining Desi Hip-Hop.
        </p>

        {/* Clean Inline Featured Track Treatment (Unboxed, Hairline divider, Apple Music-style) */}
        <div className="pt-6 border-t border-white/[0.08] max-w-2xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center space-x-4 min-w-0">
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#171717] shrink-0 border border-white/[0.08] shadow-2xl group">
                <Image
                  src={getThumbnailArtwork(track.artworkUrl?.trim() || heroImageSrc, 160)}
                  alt={track.title}
                  fill
                  sizes="56px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1A1]">
                    FEATURED ANTHEM
                  </span>
                  {track.genre && (
                    <span className="text-[10px] font-mono text-[#A1A1A1]">
                      • {track.genre}
                    </span>
                  )}
                </div>
                <p className="text-base sm:text-lg font-bold text-white truncate leading-tight tracking-tight mt-0.5">
                  {track.title}
                </p>
                <p className="text-xs sm:text-sm text-[#A1A1A1] truncate mt-0.5">
                  <Link
                    href={`/artist/${encodeURIComponent(artist.id)}`}
                    className="hover:text-white hover:underline transition-colors"
                    aria-label={`Open ${artist.name} artist page`}
                  >
                    {artist.name}
                  </Link>
                  {track.album ? ` — ${track.album}` : ''}
                </p>
              </div>
            </div>

            {/* Prominent Play Button */}
            <button
              onClick={handlePlayHeroTrack}
              className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_4px_24px_rgba(255,255,255,0.25)] shrink-0 group"
              aria-label={isCurrentlyPlaying ? 'Pause featured track' : 'Play featured track'}
            >
              {isCurrentlyPlaying ? (
                <Pause className="w-5 h-5 fill-black text-black" />
              ) : (
                <Play className="w-5 h-5 fill-black text-black ml-0.5 group-hover:scale-110 transition-transform" />
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
