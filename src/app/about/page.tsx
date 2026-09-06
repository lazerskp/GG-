import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description:
    'GULLYGANG is a modern music discovery and listening platform focused on Indian rap, Desi Hip-Hop, and global sounds with immersive playback and real-time lyrics.',
  openGraph: {
    title: 'About GULLYGANG',
    description:
      'A modern music experience focused on discovery, playback, lyrics, and immersive listening.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <article className="max-w-2xl mx-auto space-y-16 py-8 sm:py-12">
      {/* Hero */}
      <header className="space-y-5">
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
          About
        </p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
          Music should feel personal.
        </h1>
        <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed max-w-xl">
          GULLYGANG is a modern music experience focused on discovery, playback,
          lyrics, and an immersive listening interface.
        </p>
      </header>

      {/* Sections */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Music Discovery
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG surfaces trending tracks, curated artist spotlights, daily
          featured drops, and chart movements across Indian rap, Desi Hip-Hop,
          Hindi, Odia, and global music — all sourced from live catalog data
          rather than static playlists.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Immersive Playback
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          The fullscreen player transforms your screen into a dynamic ambient
          environment. Album artwork colors are extracted in real time to create
          a fluid, living background that responds to each song. Playback
          controls are designed to feel minimal and tactile — inspired by the
          best native music players.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Lyrics &amp; Listening
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          Synced lyrics scroll alongside the music in real time, automatically
          sourced from community-maintained databases. When timed lyrics are not
          available, plain lyrics are displayed as a fallback — so you always
          have the words in front of you.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Our Approach
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG is built as an independent editorial discovery platform. We
          do not host music files. Audio playback is powered through the YouTube
          IFrame Player API, and all music, lyrics, artwork, and artist
          information belong to their respective rights holders. Our focus is on
          providing a premium listening interface and thoughtful curation.
        </p>
      </section>
    </article>
  );
}
