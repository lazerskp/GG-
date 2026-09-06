'use client';

import React from 'react';
import { TopNavigation } from './TopNavigation';
import { Footer } from './Footer';
import { PersistentPlayer } from '@/components/player/PersistentPlayer';
import { usePlayerStore } from '@/store/usePlayerStore';

export function AppShell({ children }: { children: React.ReactNode }) {
  const { rightPanelMode } = usePlayerStore();
  const isRightPanelOpen = Boolean(rightPanelMode);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col relative overflow-x-hidden">
      {/* Primary Top Navigation */}
      <TopNavigation />

      {/* Main Content Area with fluid shift when right sheet is active */}
      <main
        className={`flex-1 pb-36 sm:pb-36 md:pb-36 lg:pb-40 overflow-x-hidden transition-[padding] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isRightPanelOpen ? 'xl:pr-[440px] 2xl:pr-[480px]' : ''
        }`}
      >
        <div className="w-full max-w-[1600px] 2xl:max-w-[1800px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6">
          {children}
        </div>

        {/* Site-wide Footer */}
        <Footer />
      </main>

      {/* Persistent Audio Player */}
      <PersistentPlayer />
    </div>
  );
}
