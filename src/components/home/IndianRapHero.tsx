'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Pause } from 'lucide-react';
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

  // Canonical Desi Hip-Hop spotlight: DIVINE — 3:59 AM
  const heroArtist: Artist = artist || {
    id: 'divine',
    name: 'DIVINE',
    bio: 'Pioneered the Mumbai gully rap revolution.',
    imageUrl: 'https://lh3.googleusercontent.com/RaYF_XJtrT829WF9RNApYYC6Pd9plxjNHwvUVQoGZDFLNe9bixlQdlmHSIy0CT-S96JAC4ARXgm5nsz5=w1200-h1200-l90-rj',
    region: 'india',
    monthlyListeners: '7.8M',
    genres: ['Desi Hip-Hop', 'Gully Rap', 'Boom Bap'],
    verified: true,
  };

  const heroTrack: Song = track || {
    id: 'HmW1wIhyCng',
    title: '3:59 AM',
    artist: 'DIVINE',
    artistId: 'divine',
    artworkUrl: 'https://yt3.googleusercontent.com/ql-hSv7Guf2Be88QxjFdu_dAwPwbNuRPrTMeBV6_fgjBvj79-bwi_fpd57mB1HsxGiIB9Ln5j_zp2KdyOQ=w1200-h1200-l90-rj',
    duration: 273,
    releaseYear: 2020,
    region: 'india',
    genre: 'Gully Rap',
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

  // Concise one-sentence editorial summary
  const shortDescription = heroArtist.bio
    ? heroArtist.bio.split('. ')[0].replace(/\.$/, '') + '.'
    : 'Pioneered the Mumbai gully rap revolution.';

  const displayName = heroArtist.name.toLowerCase() === 'krsna' ? 'KR$NA' : heroArtist.name;

  return (
    <section
      id="hero"
      aria-label="Editorial Artist Spotlight"
      className="relative w-[calc(100%+2rem)] sm:w-[calc(100%+3rem)] md:w-[calc(100%+4rem)] lg:w-[calc(100%+6rem)] -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12 -mt-4 sm:-mt-6 mb-12 sm:mb-16 min-h-[580px] sm:min-h-[640px] lg:min-h-[720px] flex flex-col justify-center select-none overflow-hidden bg-[#0A0A0A]"
    >
      {/* 1. Full-bleed Background Artist Image (occupies right side, edge-to-edge, zero boxes) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 bottom-0 w-full lg:w-[62%] xl:w-[58%] h-full">
          <Image
            src={heroImageSrc}
            alt={heroArtist.name}
            fill
            priority
            quality={90}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-top lg:object-center"
          />

          {/* Smooth left gradient: blends seamless solid black into artist photography */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 lg:via-[#0A0A0A]/40 to-transparent" />

          {/* Subtle bottom fade into the page background */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />

          {/* Subtle top fade under the navbar */}
          <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#0A0A0A]/90 to-transparent" />
        </div>
      </div>

      {/* 2. Foreground Editorial Surface (Constrained to max-width grid) */}
      <div className="relative z-10 w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-12 sm:py-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Side: Editorial Typography & Actions */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            {/* Eyebrow: Horizontal Dash + EDITORIAL SPOTLIGHT */}
            <div className="flex items-center space-x-3 mb-5">
              <span className="w-6 h-[1.5px] bg-[#71717A] shrink-0" />
              <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F8F8F] uppercase font-semibold">
                EDITORIAL SPOTLIGHT
              </span>
            </div>

            {/* Primary Heading: ARTIST NAME */}
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white uppercase leading-[0.88] mb-7">
              {displayName}
            </h1>

            {/* Label & Song title: TOP SONG */}
            <div className="mb-4">
              <p className="text-[10px] font-mono tracking-[0.22em] text-[#71717A] uppercase font-semibold mb-1.5">
                TOP SONG
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
                {heroTrack.title}
              </p>
            </div>

            {/* One short description only */}
            <p className="text-sm sm:text-base text-[#A1A1A6] max-w-md leading-relaxed mb-8">
              {shortDescription}
            </p>

            {/* Actions: Play & Explore Artist */}
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Primary Action: Play */}
              <button
                type="button"
                onClick={handlePlayHeroTrack}
                aria-label={isCurrentlyPlaying ? 'Pause' : `Play ${heroTrack.title}`}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 active:scale-[0.98] transition-all shadow-[0_4px_24px_rgba(255,255,255,0.22)]"
              >
                {isCurrentlyPlaying ? (
                  <>
                    <Pause className="w-4 h-4 fill-black text-black" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                    <span>PLAY</span>
                  </>
                )}
              </button>

              {/* Secondary Action: Explore Artist */}
              <Link
                href={`/artist/${encodeURIComponent(heroArtist.id)}`}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-semibold tracking-wide border border-white/[0.1] hover:border-white/20 transition-all active:scale-[0.98]"
              >
                <span>Explore Artist</span>
                <span className="text-[#A1A1A6] text-sm">→</span>
              </Link>
            </div>

            {/* Scroll Indicator */}
            <button
              type="button"
              onClick={handleScrollExplore}
              className="mt-12 sm:mt-16 flex items-center gap-2.5 text-[10px] font-mono tracking-[0.2em] text-[#71717A] hover:text-white uppercase transition-colors select-none group w-fit"
            >
              <span className="text-xs transition-transform group-hover:translate-y-0.5">↓</span>
              <span>SCROLL TO EXPLORE</span>
            </button>
          </div>

          {/* Right Side: Street Art Graffiti & Signature Quote Overlay */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between h-[420px] xl:h-[480px] pointer-events-none select-none text-right pr-2">
            {/* Top Right: Stylized Street Crown + MUMBAI STILL RAPS */}
            <div className="opacity-80 transition-opacity duration-500">
              <svg
                className="w-10 h-7 ml-auto text-white/70 mb-1"
                viewBox="0 0 40 28"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 24L7 8L16 16L20 4L24 16L33 8L36 24H4Z" />
              </svg>
              <p className="text-xl sm:text-2xl font-black italic tracking-tighter text-white/85 uppercase leading-none font-mono">
                MUMBAI
              </p>
              <p className="text-xl sm:text-2xl font-black italic tracking-tighter text-white/85 uppercase leading-none font-mono">
                STILL
              </p>
              <p className="text-xl sm:text-2xl font-black italic tracking-tighter text-white/85 uppercase leading-none font-mono">
                RAPS
              </p>
            </div>

            {/* Bottom Right: Signature Quote */}
            <div className="text-right">
              <p className="text-[10px] font-mono tracking-[0.2em] text-white/70 uppercase">
                &ldquo;REAL STORIES.
              </p>
              <p className="text-[10px] font-mono tracking-[0.2em] text-white/70 uppercase">
                REAL STREETS.&rdquo;
              </p>
              <div className="flex items-center justify-end gap-1.5 mt-1 text-[9px] font-mono tracking-widest text-[#8F8F8F]">
                <span>—</span>
                <span>DIVINE</span>
                <span>—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
