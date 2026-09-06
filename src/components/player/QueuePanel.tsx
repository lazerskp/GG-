'use client';

import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { X, Trash2, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Song } from '@/types/music';
import { usePlayerStore } from '@/store/usePlayerStore';
import { extractCleanYouTubeId } from '@/services/youtubePlayerService';

export function QueuePanel() {
  const {
    currentTrack,
    queue,
    queueIndex,
    relatedQueue,
    isLoadingRelated,
    hasMoreRelated,
    isPlaying,
    playbackStatus,
    playTrack,
    addToQueue,
    removeFromQueue,
    removeFromRelatedQueue,
    clearQueue,
    fetchMoreRelated,
  } = usePlayerStore();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingMoreRef = useRef(false);

  // Infinite scroll trigger when reaching ~75% of container height
  const rafScrollRef = useRef<number | null>(null);

  const handleScroll = useCallback(() => {
    if (rafScrollRef.current) return;
    rafScrollRef.current = requestAnimationFrame(() => {
      rafScrollRef.current = null;
      const el = scrollContainerRef.current;
      if (!el) return;

      const scrollBottom = el.scrollTop + el.clientHeight;
      const threshold = el.scrollHeight * 0.75;

      if (scrollBottom >= threshold && !isLoadingRelated && hasMoreRelated && !isFetchingMoreRef.current) {
        isFetchingMoreRef.current = true;
        fetchMoreRelated().finally(() => {
          isFetchingMoreRef.current = false;
        });
      }
    });
  }, [isLoadingRelated, hasMoreRelated, fetchMoreRelated]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', handleScroll);
      if (rafScrollRef.current) {
        cancelAnimationFrame(rafScrollRef.current);
        rafScrollRef.current = null;
      }
    };
  }, [handleScroll]);

  // Client-side duplicate prevention against currentTrack and manual user queue
  const uniqueRelated = useMemo(() => {
    const seen = new Set<string>();
    if (currentTrack?.id) {
      const cId = extractCleanYouTubeId(currentTrack.id);
      if (cId) seen.add(cId);
    }
    queue.forEach((t) => {
      const qId = extractCleanYouTubeId(t.id);
      if (qId) seen.add(qId);
    });

    return relatedQueue.filter((track) => {
      const rId = extractCleanYouTubeId(track.id);
      if (!rId || seen.has(rId)) return false;
      seen.add(rId);
      return true;
    });
  }, [relatedQueue, currentTrack, queue]);

  if (!currentTrack) return null;

  const isActualPlaying = isPlaying && playbackStatus === 'playing';
  const upNext = queue.slice(queueIndex + 1);

  return (
    <div className="h-full flex flex-col">
      {/* 1. NOW PLAYING */}
      <div className="px-4 py-3.5 border-b border-white/[0.06] shrink-0 bg-white/[0.01]">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1A1] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse motion-reduce:animate-none" />
            <span>Now Playing</span>
          </p>
          <span className="text-[10px] font-mono text-[#8F8F8F]">01</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#171717] shrink-0 border border-white/10">
            <Image
              src={currentTrack.artworkUrl?.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
              alt={currentTrack.title}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-white truncate leading-tight">
              {currentTrack.title}
            </p>
            <p className="text-[11px] text-[#A1A1A1] truncate mt-0.5">{currentTrack.artist}</p>
          </div>
          {/* Live equalizer */}
          <div className="flex items-end gap-[2px] h-3.5 shrink-0" aria-hidden="true">
            <span
              className={`w-[2px] bg-white rounded-full ${
                isActualPlaying ? 'animate-eq-1' : 'h-1 opacity-30'
              }`}
            />
            <span
              className={`w-[2px] bg-white rounded-full ${
                isActualPlaying ? 'animate-eq-2' : 'h-2 opacity-30'
              }`}
            />
            <span
              className={`w-[2px] bg-white rounded-full ${
                isActualPlaying ? 'animate-eq-3' : 'h-[5px] opacity-30'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Container for UP NEXT + RELATED */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-3 pt-3 pb-24 space-y-4">
        {/* 2. UP NEXT (User-Selected Tracks) */}
        <div>
          <div className="flex items-center justify-between px-2 pb-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8F8F8F]">
              Up Next {upNext.length > 0 && `(${upNext.length})`}
            </p>
            {upNext.length > 0 && (
              <button
                onClick={clearQueue}
                className="p-1 text-[#8F8F8F] hover:text-red-400 transition-colors"
                title="Clear user queue"
                aria-label="Clear user queue"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {upNext.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[#8F8F8F] italic">
              No manual tracks queued. Next up from related discovery below.
            </p>
          ) : (
            <div className="space-y-0.5">
              {upNext.map((track, offset) => {
                const absoluteIndex = queueIndex + 1 + offset;
                const posStr = String(absoluteIndex + 1).padStart(2, '0');
                return (
                  <QueueRow
                    key={`${track.id}-${absoluteIndex}`}
                    track={track}
                    position={posStr}
                    isManual
                    onPlay={() => playTrack(track, queue, true)}
                    onRemove={() => removeFromQueue(absoluteIndex)}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* 3. RELATED (YouTube-Style Contextual Recommendations) */}
        <div>
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3 h-3 text-[#A1A1A1]" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#A1A1A1]">
                Related Discovery
              </p>
            </div>
            <span className="text-[9px] font-mono text-[#8F8F8F] uppercase tracking-wider">
              Autoplay &bull; 20 per batch
            </span>
          </div>

          {uniqueRelated.length === 0 && isLoadingRelated ? (
            /* Exactly 20-item visual batch skeleton placeholders */
            <div className="space-y-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <QueueSkeletonRow key={`skeleton-initial-${i}`} index={i + 1} />
              ))}
            </div>
          ) : uniqueRelated.length === 0 ? (
            <p className="px-3 py-3 text-xs text-[#8F8F8F] italic">
              No additional recommendations found.
            </p>
          ) : (
            <div className="space-y-0.5">
              {uniqueRelated.map((track, rIdx) => {
                const globalPos = String(queue.length + rIdx + 1).padStart(2, '0');
                return (
                  <QueueRow
                    key={`related-${track.id}-${rIdx}`}
                    track={track}
                    position={globalPos}
                    isManual={false}
                    onPlay={() => playTrack(track, undefined, false)}
                    onAdd={() => addToQueue(track)}
                    onRemove={() => removeFromRelatedQueue(rIdx)}
                  />
                );
              })}

              {/* Incremental batch loading indicator */}
              {isLoadingRelated && (
                <div className="pt-2 space-y-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <QueueSkeletonRow
                      key={`skeleton-batch-${i}`}
                      index={queue.length + uniqueRelated.length + i + 1}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Infinite Scroll Loader / Status Indicator */}
          {hasMoreRelated && uniqueRelated.length > 0 && (
            <div className="py-4 text-center">
              {isLoadingRelated ? (
                <div className="flex items-center justify-center space-x-2 text-[11px] font-mono text-[#8F8F8F]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" />
                  <span>Loading next 20 recommendations...</span>
                </div>
              ) : (
                <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
                  Scroll for next batch
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QueueSkeletonRow({ index }: { index: number }) {
  const posStr = String(index).padStart(2, '0');
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.01] animate-pulse motion-reduce:animate-none">
      <span className="w-5 text-center text-[10px] font-mono text-[#404040] shrink-0 tabular-nums">
        {posStr}
      </span>
      <div className="w-9 h-9 rounded bg-white/[0.05] shrink-0 border border-white/[0.04]" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="h-3 w-3/4 rounded bg-white/[0.07]" />
        <div className="h-2.5 w-1/2 rounded bg-white/[0.03]" />
      </div>
    </div>
  );
}

function QueueRow({
  track,
  position,
  isManual,
  onPlay,
  onAdd,
  onRemove,
}: {
  track: Song;
  position: string;
  isManual: boolean;
  onPlay: () => void;
  onAdd?: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      onClick={onPlay}
      className="group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors duration-150 hover:bg-white/[0.05] active:bg-white/[0.08] animate-in fade-in slide-in-from-bottom-1 duration-200 motion-reduce:animate-none"
    >
      <span className="w-5 text-center text-[10px] font-mono text-[#8F8F8F] group-hover:text-white shrink-0 tabular-nums">
        {position}
      </span>
      <div className="relative w-9 h-9 rounded overflow-hidden bg-[#171717] shrink-0 border border-white/[0.06]">
        <Image
          src={track.artworkUrl?.trim() || 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=800&auto=format&fit=crop'}
          alt={track.title}
          fill
          sizes="36px"
          className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transform-none"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-neutral-200 group-hover:text-white truncate">
          {track.title}
        </p>
        <p className="text-[10px] text-[#8F8F8F] truncate mt-0.5">{track.artist}</p>
      </div>

      <div className="flex items-center space-x-1 shrink-0">
        {/* If related track, option to promote it to user queue */}
        {!isManual && onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-[#8F8F8F] hover:text-white transition-opacity focus:opacity-100"
            title="Add to Up Next"
            aria-label={`Add ${track.title} to user queue`}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-[#8F8F8F] hover:text-white transition-opacity focus:opacity-100"
          aria-label={`Remove ${track.title}`}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

