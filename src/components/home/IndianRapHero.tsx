'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause, ArrowDown } from 'lucide-react';
import { Artist, Song } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getMediumArtwork } from '@/utils/artworkQuality';

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
        id="hero"
        aria-label="Hero"
        className="w-full pt-12 sm:pt-20 pb-12 sm:pb-16"
      >
        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
          THE SOUND OF INDIAN HIP-HOP.
        </h1>
        <p className="text-sm text-[#A1A1A6] mt-3 max-w-lg">
          Synchronizing Desi Hip-Hop catalog. Real-time tracks and artist drops loading shortly.
        </p>
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

  const handleScrollExplore = () => {
    const el = document.getElementById('artists') || document.getElementById('trending');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      aria-label="Editorial Hero"
      className="relative w-full overflow-hidden pt-8 sm:pt-14 pb-14 sm:pb-20 select-none"
    >
      {/* Subtle Atmospheric Background Artwork — supports typography without dominating */}
      <div className="absolute top-0 right-0 w-full sm:w-2/3 h-full overflow-hidden pointer-events-none z-0">
        <Image
          src={heroImageSrc}
          alt=""
          fill
          priority
          loading="eager"
          quality={70}
          sizes="(max-width: 640px) 100vw, 800px"
          className="object-cover object-top opacity-20 sm:opacity-25 filter contrast-125 saturate-75 scale-100"
        />
        {/* Editorial radial and directional fade into #080808 background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
      </div>

      {/* Hero Typography & Actions */}
      <div className="relative z-10 max-w-4xl">
        {/* Minimal Editorial Eyebrow */}
        <div className="flex items-center space-x-2.5 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F8F8F] uppercase font-semibold">
            EDITORIAL SPOTLIGHT
          </span>
        </div>

        {/* Master Display Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.95] mb-5 sm:mb-6">
          THE SOUND OF INDIAN HIP-HOP.
        </h1>

        {/* Supporting Narrative */}
        <p className="text-sm sm:text-base lg:text-lg text-[#A1A1A6] max-w-2xl leading-relaxed font-normal mb-8 sm:mb-10">
          From underground cyphers to stadium anthems. Discover the defining voices, latest releases, and raw energy shaping the new vanguard of Desi Hip-Hop.
        </p>

        {/* Subtle, Premium Interactive Actions */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-5">
          {/* Primary Action: Listen Now (triggers featured track directly) */}
          <button
            type="button"
            onClick={handlePlayHeroTrack}
            aria-label={isCurrentlyPlaying ? 'Pause featured track' : `Listen to ${track.title} by ${artist.name}`}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 active:scale-[0.98] transition-all"
          >
            {isCurrentlyPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-black text-black" />
                <span>Pause Featured Track</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                <span>Listen Now · {track.title}</span>
              </>
            )}
          </button>

          {/* Secondary Action: Explore Music */}
          <button
            type="button"
            onClick={handleScrollExplore}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium tracking-wide border border-white/[0.08] hover:border-white/20 transition-all"
          >
            <span>Explore Music</span>
            <ArrowDown className="w-3.5 h-3.5 text-[#8F8F8F]" />
          </button>
        </div>

        {/* Subtle Current Track Attribution */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center gap-3 text-xs text-[#8F8F8F]">
          <span className="font-mono text-[10px] tracking-wider uppercase text-[#636366]">Current Drop</span>
          <span className="text-white font-medium">{track.title}</span>
          <span>—</span>
          <Link
            href={`/artist/${encodeURIComponent(artist.id)}`}
            className="hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            {artist.name}
          </Link>
        </div>
      </div>
    </section>
  );
}
