'use client';

import React from 'react';
import Image from 'next/image';
import { Play, Pause, ArrowDown } from 'lucide-react';
import { Artist, Song } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getHighResArtwork } from '@/utils/artworkQuality';

interface IndianRapHeroProps {
  artist?: Artist | null;
  track?: Song | null;
  playlistContext?: Song[];
}

export function IndianRapHero({ artist, track, playlistContext }: IndianRapHeroProps) {
  const { currentTrack, isPlaying, playbackStatus, playTrack, togglePlay } = usePlayerStore();

  // Fallback real artist & song to guarantee data integrity if upstream passes null
  const heroArtist: Artist = artist || {
    id: 'kr-na',
    name: 'KR$NA',
    bio: 'One of the sharpest pen games in Desi Hip-Hop, renowned for intricate rhyme schemes and pioneering Hindi rap lyricism.',
    imageUrl: 'https://yt3.ggpht.com/ytc/AIdro_n00p_ZePoxDQQ9m1fOAv5f6CPy-GyG97eU5hKHI3wX5cM=w2880-h1200-l90-rj-dcIXaUDKoH',
    region: 'india',
    monthlyListeners: '',
    genres: ['Desi Hip-Hop', 'Indian Rap'],
    verified: true,
  };

  const heroTrack: Song = track || {
    id: 'fSwe7XoAi2g',
    title: 'Makasam',
    artist: 'KR$NA',
    artistId: 'kr-na',
    artworkUrl: 'https://i.ytimg.com/vi/fSwe7XoAi2g/maxresdefault.jpg',
    duration: 236,
    releaseYear: 2020,
    region: 'india',
    genre: 'Indian Rap',
  };

  const isCurrentTrack = currentTrack?.id === heroTrack.id;
  const isCurrentlyPlaying = isCurrentTrack && isPlaying && playbackStatus === 'playing';

  const handlePlayHeroTrack = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(heroTrack, playlistContext || [heroTrack]);
    }
  };

  const handleScrollExplore = () => {
    const el = document.getElementById('artists') || document.getElementById('trending');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const rawHeroSrc = heroArtist.imageUrl?.trim() || heroTrack.artworkUrl?.trim();
  const heroImageSrc = getHighResArtwork(rawHeroSrc);

  // Concise one-sentence editorial summary without long paragraphs
  const shortDescription = heroArtist.bio
    ? heroArtist.bio.split('. ')[0].replace(/\.$/, '') + '.'
    : 'Pioneering the raw lyrical vanguard and defining modern Indian Hip-Hop.';

  return (
    <section
      id="hero"
      aria-label="Editorial Artist Spotlight"
      className="relative w-full pt-6 sm:pt-10 pb-12 sm:pb-16 select-none overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Side: Editorial Typography & Actions (occupies 58% on desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center z-10">
          {/* 1. Small eyebrow */}
          <div className="flex items-center space-x-2.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F8F8F] uppercase font-semibold">
              EDITORIAL SPOTLIGHT
            </span>
          </div>

          {/* 2. Large primary heading: ARTIST NAME */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white uppercase leading-[0.92] mb-6">
            {heroArtist.name}
          </h1>

          {/* 3. Small label & 4. Song title: TOP SONG */}
          <div className="mb-4">
            <p className="text-[10px] font-mono tracking-[0.2em] text-[#71717A] uppercase font-semibold mb-1">
              TOP SONG
            </p>
            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
              {heroTrack.title}
            </p>
          </div>

          {/* 5. One short description only */}
          <p className="text-sm sm:text-base text-[#A1A1A6] max-w-xl leading-relaxed mb-8">
            {shortDescription}
          </p>

          {/* 6. Actions: Play & Explore Music */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Primary Action: Play */}
            <button
              type="button"
              onClick={handlePlayHeroTrack}
              aria-label={isCurrentlyPlaying ? 'Pause' : `Play ${heroTrack.title}`}
              className="inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(255,255,255,0.18)]"
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

            {/* Secondary Action: Explore Music */}
            <button
              type="button"
              onClick={handleScrollExplore}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium tracking-wide border border-white/[0.08] hover:border-white/20 transition-all active:scale-[0.98]"
            >
              <span>Explore Music</span>
              <ArrowDown className="w-3.5 h-3.5 text-[#8F8F8F]" />
            </button>
          </div>
        </div>

        {/* Right Side: Clearly visible Artist Image (occupies ~42% on desktop) */}
        <div className="order-1 lg:order-2 lg:col-span-5 relative w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[460px] h-[340px] sm:h-[420px] lg:h-[480px] rounded-2xl overflow-hidden bg-[#121214] border border-white/[0.08] shadow-2xl group">
            <Image
              src={heroImageSrc}
              alt={heroArtist.name}
              fill
              priority
              quality={85}
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />

            {/* Subtle LEFT-side black gradient to blend the image into the page */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent pointer-events-none"
            />

            {/* Subtle bottom gradient to blend bottom edge into dark surface */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#0A0A0A] to-transparent pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
