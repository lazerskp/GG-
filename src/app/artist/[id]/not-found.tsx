import React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserX } from 'lucide-react';

export default function ArtistNotFound() {
  return (
    <div className="py-24 text-center space-y-6 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mx-auto text-[#8F8F8F]">
        <UserX className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">
          Artist Not Found
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          The requested artist profile could not be located in the catalog. The artist may not yet be indexed or may have moved.
        </p>
      </div>

      <Link
        href="/"
        className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all active:scale-95 shadow-md"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog</span>
      </Link>
    </div>
  );
}
