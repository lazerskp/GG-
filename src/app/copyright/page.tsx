import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Copyright',
  description:
    'Copyright notice and intellectual property information for GULLYGANG. Music, lyrics, and artwork belong to their respective rights holders.',
  openGraph: {
    title: 'Copyright — GULLYGANG',
    description:
      'Copyright and intellectual property information for GULLYGANG.',
    type: 'website',
  },
};

export default function CopyrightPage() {
  return (
    <article className="max-w-2xl mx-auto space-y-12 py-8 sm:py-12">
      {/* Header */}
      <header className="space-y-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
          Copyright
        </h1>
      </header>

      {/* Copyright Notice */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Copyright Notice
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          © {new Date().getFullYear()} GULLYGANG. All rights reserved for the
          GULLYGANG software, interface design, and original editorial content.
        </p>
      </section>

      {/* Music and Content Ownership */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Music &amp; Content Ownership
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG does not own, host, or distribute any music, audio
          recordings, music videos, album artwork, artist photographs, or
          lyrics displayed on this platform.
        </p>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          All music and audio playback is delivered through the{' '}
          <strong className="text-white/90">YouTube IFrame Player API</strong>.
          The music remains hosted on YouTube&apos;s servers and is subject to
          YouTube&apos;s Terms of Service. All rights to the music, recordings,
          and associated media belong to their respective artists, labels,
          publishers, and rights holders.
        </p>
      </section>

      {/* Third-Party Content */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Third-Party Content
        </h2>
        <ul className="space-y-3 text-sm text-[#A1A1A1]">
          <li>
            <strong className="text-white/90">Album Artwork &amp; Artist Images</strong> —
            Sourced from YouTube Music and Google APIs. All rights belong to the
            original artists, labels, and photographers.
          </li>
          <li>
            <strong className="text-white/90">Song Lyrics</strong> — Sourced
            from LRCLIB, a community-maintained lyrics database. Lyrics are the
            intellectual property of the respective songwriters and publishers.
          </li>
          <li>
            <strong className="text-white/90">Music Metadata</strong> — Song
            titles, artist names, album titles, and release information are
            sourced from YouTube Music&apos;s catalog via the ytmusicapi library.
          </li>
        </ul>
      </section>

      {/* GULLYGANG Interface & Software */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          GULLYGANG Interface &amp; Software
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          The GULLYGANG web application — including the user interface design,
          fullscreen player experience, dynamic ambient background engine,
          editorial curation system, and all original source code — is the
          intellectual property of GULLYGANG.
        </p>
      </section>

      {/* Copyright Concerns */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Copyright Concerns
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG respects the intellectual property rights of others. If
          you believe that content accessible through GULLYGANG infringes on
          your copyright, please contact us with the following information:
        </p>
        <ul className="space-y-1.5 text-sm text-[#A1A1A1] list-disc list-inside">
          <li>A description of the copyrighted work you believe is being infringed</li>
          <li>The specific URL or location of the content on GULLYGANG</li>
          <li>Your contact information</li>
          <li>A statement that you have a good-faith belief the use is not authorized</li>
        </ul>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          Since GULLYGANG does not host music or media files directly (audio
          is streamed via YouTube), copyright concerns about specific songs
          or recordings should typically be directed to YouTube through their{' '}
          <a
            href="https://support.google.com/youtube/answer/2807622"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 underline underline-offset-2 hover:text-white transition-colors"
          >
            copyright complaint process
          </a>.
        </p>
      </section>

      {/* Contact */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          Contact
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          For copyright-related inquiries, please contact{' '}
          <a
            href="mailto:contact@gullygang.com"
            className="text-white/80 underline underline-offset-2 hover:text-white transition-colors"
          >
            contact@gullygang.com
          </a>.
        </p>
      </section>
    </article>
  );
}
