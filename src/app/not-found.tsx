import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you requested could not be found on GULLYGANG.',
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
};

export default function GlobalNotFound() {
  return (
    <div className="py-24 text-center space-y-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#8F8F8F]">
        <Compass className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">
          Page Not Found
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          The page you are looking for could not be found. It may have been
          moved, renamed, or never existed in the first place.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-95 shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/blog"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-white/[0.1] text-[#A1A1A1] hover:text-white hover:border-white/30 transition-colors"
        >
          <span>Editorial</span>
        </Link>
        <Link
          href="/artists"
          className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full border border-white/[0.1] text-[#A1A1A1] hover:text-white hover:border-white/30 transition-colors"
        >
          <span>Artists</span>
        </Link>
      </div>
    </div>
  );
}
