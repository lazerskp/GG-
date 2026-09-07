import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-[#080808] select-none">
      <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Main footer content */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 py-12">
          {/* Left: Branding & Mission */}
          <div className="space-y-2 max-w-sm">
            <Link href="/" className="inline-block group">
              <span className="text-xl font-black tracking-tighter text-white uppercase group-hover:opacity-80 transition-opacity">
                GULLYGANG
              </span>
            </Link>
            <p className="text-xs text-[#8F8F8F] leading-relaxed">
              The premier platform for Indian Hip-Hop, Desi rap originators, new releases, and live music discovery.
            </p>
          </div>

          {/* Right: Editorial & Platform Navigation */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-xs font-medium text-[#A1A1A6]">
            <Link href="/" className="hover:text-white transition-colors">
              Discover
            </Link>
            <Link href="/artists" className="hover:text-white transition-colors">
              Artists
            </Link>
            <Link href="/albums" className="hover:text-white transition-colors">
              Albums
            </Link>
            <Link href="/charts" className="hover:text-white transition-colors font-semibold text-white">
              Charts
            </Link>
            <Link href="/blog" className="hover:text-white transition-colors">
              Blog & Editorial
            </Link>
            <span className="text-[#333] hidden sm:inline">|</span>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/copyright" className="hover:text-white transition-colors">
              Copyright
            </Link>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="border-t border-white/[0.04] py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono text-[#636366]">
          <p>© {new Date().getFullYear()} GULLYGANG. All rights reserved.</p>
          <p className="uppercase tracking-widest text-[10px]">Underground × Premium × Editorial</p>
        </div>
      </div>
    </footer>
  );
}
