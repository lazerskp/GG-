import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-white/[0.06] bg-[#0A0A0A]">
      <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Main footer content */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 py-10">
          {/* Branding */}
          <div className="space-y-1.5">
            <Link href="/" className="group inline-flex items-center min-h-[44px] py-1">
              <span className="text-lg font-black tracking-tighter text-white uppercase group-hover:opacity-80 transition-opacity">
                GULLYGANG
              </span>
            </Link>
            <p className="text-[11px] text-[#A1A1A1] leading-relaxed max-w-xs">
              A modern music experience focused on discovery, playback, lyrics, and immersive listening.
            </p>
          </div>

          {/* Navigation links */}
          <nav aria-label="Footer navigation" className="flex items-center gap-8">
            <Link
              href="/about"
              className="text-[12px] font-medium tracking-wide text-[#A1A1A1] hover:text-white transition-colors duration-200"
            >
              About
            </Link>
            <Link
              href="/privacy"
              className="text-[12px] font-medium tracking-wide text-[#A1A1A1] hover:text-white transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/copyright"
              className="text-[12px] font-medium tracking-wide text-[#A1A1A1] hover:text-white transition-colors duration-200"
            >
              Copyright
            </Link>
          </nav>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-white/[0.04] py-5">
          <p className="text-[11px] text-[#A1A1A1] tracking-wide">
            © {new Date().getFullYear()} GULLYGANG. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
