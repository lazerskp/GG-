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
      className="relative w-full pt-4 sm:pt-8 pb-12 sm:pb-16 select-none overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center min-h-[460px] sm:min-h-[520px]">
        {/* Left Side: Editorial Typography & Actions (occupies 58% on desktop) */}
        <div className="order-2 lg:order-1 lg:col-span-7 flex flex-col justify-center z-10">
          {/* 1. Small eyebrow: Horizontal line + EDITORIAL SPOTLIGHT */}
          <div className="flex items-center space-x-3 mb-5">
            <span className="w-6 h-[1.5px] bg-[#71717A] shrink-0" />
            <span className="text-[11px] font-mono tracking-[0.25em] text-[#8F8F8F] uppercase font-semibold">
              EDITORIAL SPOTLIGHT
            </span>
          </div>

          {/* 2. Large primary heading: ARTIST NAME */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight text-white uppercase leading-[0.88] mb-7">
            {displayName}
          </h1>

          {/* 3. Small label & 4. Song title: TOP SONG */}
          <div className="mb-4">
            <p className="text-[10px] font-mono tracking-[0.22em] text-[#71717A] uppercase font-semibold mb-1.5">
              TOP SONG
            </p>
            <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
              {heroTrack.title}
            </p>
          </div>

          {/* 5. One short description only */}
          <p className="text-sm sm:text-base text-[#A1A1A6] max-w-md leading-relaxed mb-8">
            {shortDescription}
          </p>

          {/* 6. Actions: Play & Explore Artist */}
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

          {/* 7. Subtle scroll to explore prompt */}
          <button
            type="button"
            onClick={handleScrollExplore}
            className="mt-12 sm:mt-16 flex items-center gap-2.5 text-[10px] font-mono tracking-[0.2em] text-[#71717A] hover:text-white uppercase transition-colors select-none group w-fit"
          >
            <span className="text-xs transition-transform group-hover:translate-y-0.5">↓</span>
            <span>SCROLL TO EXPLORE</span>
          </button>
        </div>

        {/* Right Side: Clearly visible Artist Image & Street Graphic Overlay */}
        <div className="order-1 lg:order-2 lg:col-span-5 relative w-full flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[480px] h-[360px] sm:h-[440px] lg:h-[500px] rounded-2xl overflow-hidden bg-[#101012] border border-white/[0.08] shadow-2xl group">
            <Image
              src={heroImageSrc}
              alt={heroArtist.name}
              fill
              priority
              quality={88}
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

            {/* Street Art Graffiti Overlay on Right: Crown + MUMBAI STILL RAPS */}
            <div
              aria-hidden="true"
              className="absolute top-8 right-6 z-10 text-right pointer-events-none select-none opacity-80 group-hover:opacity-100 transition-opacity duration-500"
            >
              {/* Stylized 3-point street crown */}
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

            {/* Signature Street Quote at Bottom Right */}
            <div
              aria-hidden="true"
              className="absolute bottom-6 right-6 z-10 text-right pointer-events-none select-none"
            >
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
