import { DailyFeatureData } from '@/types/music';
import { getDevDailyFeaturePool } from '@/data/fixtures';

/**
 * Service to retrieve the Daily Featured Rapper & Song.
 * Integrates with server-side Daily Feature Engine and InsForge database.
 * Strictly database-backed in production.
 */
export async function getDailyFeature(targetDate?: Date): Promise<DailyFeatureData | null> {
  // If running in Node.js server context, call the DailyFeatureEngine directly
  if (typeof window === 'undefined') {
    try {
      const { dailyFeatureEngine } = await import('@/server/dailyFeature/dailyFeatureEngine');
      return await dailyFeatureEngine.getFeatureForDate(targetDate);
    } catch (err) {
      console.warn('[DailyFeature] Failed retrieving daily feature from engine:', err);
    }
  } else {
    // If running in browser, call the /api/daily-feature endpoint
    try {
      const res = await fetch('/api/daily-feature');
      if (res.ok) {
        return (await res.json()) as DailyFeatureData;
      }
    } catch (err) {
      console.warn('[DailyFeature] Failed fetching daily feature from API:', err);
    }
  }

  // Development fixtures fallback ONLY if explicitly toggled on
  const pool = getDevDailyFeaturePool();
  if (pool.length > 0) {
    const d = targetDate || new Date();
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const day = d.getUTCDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const seed = (year * 372) + (month * 31) + day;
    const poolIndex = Math.abs(seed) % pool.length;
    const selected = pool[poolIndex];

    return {
      date: dateStr,
      artist: selected.artist,
      song: selected.song,
    };
  }

  return null;
}

/**
 * Format a YYYY-MM-DD date into an editorial publication string
 * e.g. "SATURDAY, SEPTEMBER 5, 2026"
 */
export function formatEditorialDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dateObj = new Date(Date.UTC(year, month, day));
      return dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      }).toUpperCase();
    }
  } catch {
    // Fallback if parsing fails
  }
  return dateStr.toUpperCase();
}
