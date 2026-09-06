'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { LyricLine } from '@/types/lyrics';

interface SyncedLyricsProps {
  lines: LyricLine[];
  /** Real playback time from the YouTube IFrame player (via usePlayerStore) */
  currentTime: number;
  onSeek: (time: number) => void;
  className?: string;
  isMobileCard?: boolean;
}

/**
 * Synced lyrics engine UI with alive line transitions.
 *
 * Active line scales to 1.03 with glow and full opacity.
 * Preceding lines fade and drift upward.
 * Upcoming lines maintain soft hierarchy.
 * Distant lines receive subtle blur and reduced opacity.
 * Manual user scrolling pauses auto-centering for 4 seconds.
 */
export function SyncedLyrics({
  lines,
  currentTime,
  onSeek,
  className = '',
  isMobileCard = false,
}: SyncedLyricsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);
  const userScrollingRef = useRef(false);
  const userScrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Resolve the active line index from real playback time (binary search)
  const activeIndex = useMemo(() => {
    let lo = 0;
    let hi = lines.length - 1;
    let found = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lines[mid].startTime <= currentTime) {
        found = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return found;
  }, [lines, currentTime]);

  // Smooth auto-scroll: keep the active line centered unless the user is scrolling
  useEffect(() => {
    if (activeIndex < 0) return;
    if (userScrollingRef.current) return;
    const el = activeRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const rafId = requestAnimationFrame(() => {
      if (!el || !container) return;
      const elTop = el.offsetTop;
      const target = elTop - container.clientHeight / 2 + el.clientHeight / 2;
      container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    });

    return () => cancelAnimationFrame(rafId);
  }, [activeIndex]);

  // Detect manual scroll so auto-scroll yields to user for 4s
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const markUserScroll = () => {
      userScrollingRef.current = true;
      if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
      userScrollTimerRef.current = setTimeout(() => {
        userScrollingRef.current = false;
      }, 4000);
    };

    container.addEventListener('wheel', markUserScroll, { passive: true });
    container.addEventListener('touchmove', markUserScroll, { passive: true });
    return () => {
      container.removeEventListener('wheel', markUserScroll);
      container.removeEventListener('touchmove', markUserScroll);
      if (userScrollTimerRef.current) clearTimeout(userScrollTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto px-4 py-[35%] scroll-smooth no-scrollbar select-none relative ${className}`}
      role="list"
      aria-label="Synced lyrics"
    >


      {lines.map((line, idx) => {
        const distance = idx - activeIndex;
        const isActive = distance === 0;
        const isPast = distance < 0;

        let styleClasses = '';
        if (isActive) {
          styleClasses = isMobileCard
            ? 'text-white text-lg sm:text-xl font-black opacity-100 scale-[1.03] translate-x-1 filter-none drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]'
            : 'text-white text-2xl sm:text-3xl font-black opacity-100 scale-[1.03] translate-x-1.5 filter-none drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]';
        } else if (distance === -1) {
          // Immediately preceding
          styleClasses = isMobileCard
            ? 'text-[#D4D4D4] text-base sm:text-lg font-semibold opacity-50 -translate-y-0.5 filter-none'
            : 'text-[#D4D4D4] text-lg sm:text-xl font-bold opacity-50 -translate-y-0.5 filter-none';
        } else if (isPast) {
          // Farther past
          styleClasses = isMobileCard
            ? 'text-[#8F8F8F] text-sm sm:text-base font-medium opacity-25 blur-[0.6px]'
            : 'text-[#8F8F8F] text-base sm:text-lg font-medium opacity-25 blur-[0.6px]';
        } else if (distance === 1) {
          // Immediately next
          styleClasses = isMobileCard
            ? 'text-[#E5E5E5] text-base sm:text-lg font-bold opacity-60 filter-none'
            : 'text-[#E5E5E5] text-xl sm:text-2xl font-bold opacity-60 filter-none';
        } else if (distance === 2) {
          // Next + 1
          styleClasses = isMobileCard
            ? 'text-[#A1A1A1] text-sm sm:text-base font-medium opacity-40 filter-none'
            : 'text-[#A1A1A1] text-base sm:text-lg font-medium opacity-40 filter-none';
        } else {
          // Distant future
          styleClasses = isMobileCard
            ? 'text-[#8C8C8C] text-sm sm:text-base font-normal opacity-20 blur-[0.6px]'
            : 'text-[#8C8C8C] text-base sm:text-lg font-normal opacity-20 blur-[0.6px]';
        }

        return (
          <button
            key={`${line.startTime}-${idx}`}
            ref={isActive ? activeRef : undefined}
            role="listitem"
            onClick={() => onSeek(line.startTime)}
            className={`lyric-line block w-full text-left tracking-tight leading-snug py-2.5 sm:py-3 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:opacity-90 motion-reduce:transition-none motion-reduce:transform-none ${
              line.text ? 'cursor-pointer' : 'cursor-default'
            } ${styleClasses}`}
            style={{ transformOrigin: 'left center' }}
            aria-current={isActive ? 'true' : undefined}
          >
            {line.text || <span className="opacity-30">♪</span>}
          </button>
        );
      })}
    </div>
  );
}

