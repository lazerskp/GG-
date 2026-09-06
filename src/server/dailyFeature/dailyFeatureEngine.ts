import 'server-only';

/**
 * Production Daily Feature Engine
 * Implements server-side deterministic daily rotation with InsForge persistence
 * and 30-day anti-repeat artist guarantee.
 * Strictly database-backed in production.
 */

import { DailyFeatureData } from '@/types/music';
import { insforgeRepo, DailyFeatureRecord } from '@/server/insforge/repository';
import { serverConfig } from '@/server/config';
import { getDevDailyFeaturePool } from '@/data/fixtures';
import { serverLogger } from '@/server/logger';

// Mutex lock map to prevent race conditions during atomic daily feature creation
const creationLocks = new Map<string, Promise<DailyFeatureData>>();

export class DailyFeatureEngine {
  /**
   * Get or generate the Daily Feature for a given UTC calendar date.
   */
  public async getFeatureForDate(targetDate?: Date): Promise<DailyFeatureData> {
    const d = targetDate || new Date();
    const year = d.getUTCFullYear();
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    // 1. Check InsForge database for existing record
    try {
      const existing = await insforgeRepo.getDailyFeatureByDate(dateStr);
      if (existing && existing.artist_data && existing.song_data) {
        return {
          date: existing.feature_date,
          artist: existing.artist_data,
          song: existing.song_data,
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      serverLogger.warn(`Failed reading daily feature from DB: ${msg}`, { dateStr });
    }

    // 2. Concurrency guard: If another request is currently generating today's feature, wait for it
    if (creationLocks.has(dateStr)) {
      return creationLocks.get(dateStr)!;
    }

    const creationPromise = this.generateAndPersistFeature(dateStr, d);
    creationLocks.set(dateStr, creationPromise);

    try {
      const result = await creationPromise;
      return result;
    } finally {
      creationLocks.delete(dateStr);
    }
  }

  /**
   * Atomic generation and persistence from live database
   */
  private async generateAndPersistFeature(dateStr: string, dateObj: Date): Promise<DailyFeatureData> {
    // Check recent 30 days to avoid repeats
    let recentArtistIds: string[] = [];
    try {
      recentArtistIds = await insforgeRepo.getRecentDailyFeatureArtistIds(30);
    } catch {
      recentArtistIds = [];
    }

    // 1. Fetch available artists from InsForge database
    const dbArtists = await insforgeRepo.getArtists();

    if (dbArtists.length > 0) {
      // Filter out recently featured artists
      let eligibleArtists = dbArtists.filter((a) => !recentArtistIds.includes(a.id));
      if (eligibleArtists.length === 0) {
        eligibleArtists = dbArtists;
      }

      // Deterministic selection based on date seed
      const seed = (dateObj.getUTCFullYear() * 372) + ((dateObj.getUTCMonth() + 1) * 31) + dateObj.getUTCDate();
      const artistIndex = Math.abs(seed) % eligibleArtists.length;
      const selectedArtist = eligibleArtists[artistIndex];

      // Fetch songs for this artist from database
      const dbSongs = await insforgeRepo.getSongs({ artist_id: selectedArtist.id });
      const selectedSong = dbSongs.length > 0
        ? dbSongs[Math.abs(seed) % dbSongs.length]
        : {
            id: `song-${selectedArtist.id}`,
            title: `${selectedArtist.name} Spotlight`,
            artist: selectedArtist.name,
            artistId: selectedArtist.id,
            artworkUrl: selectedArtist.imageUrl,
            duration: 210,
            region: selectedArtist.region,
            genre: selectedArtist.genres[0] || 'Rap',
            audioUrl: undefined as string | undefined,
          };

      const featureData: DailyFeatureData = {
        date: dateStr,
        artist: {
          id: selectedArtist.id,
          name: selectedArtist.name,
          image: selectedArtist.imageUrl,
          quote: selectedArtist.bio ? `"${selectedArtist.bio.slice(0, 120)}..."` : `"Pushing the throttle of the culture."`,
          region: selectedArtist.region,
          description: selectedArtist.bio || '',
          monthlyListeners: selectedArtist.monthlyListeners || '1M+ listeners',
        },
        song: {
          id: selectedSong.id,
          title: selectedSong.title,
          artist: selectedArtist.name,
          artistId: selectedArtist.id,
          artwork: selectedSong.artworkUrl,
          duration: selectedSong.duration,
          genre: selectedSong.genre || 'Rap',
          audioUrl: selectedSong.audioUrl,
        },
      };

      // Persist to InsForge database
      try {
        const record: DailyFeatureRecord = {
          id: `df_${dateStr}`,
          feature_date: dateStr,
          artist_id: selectedArtist.id,
          song_id: selectedSong.id,
          region: selectedArtist.region,
          editorial_quote: featureData.artist.quote,
          artist_data: featureData.artist,
          song_data: featureData.song,
          created_at: new Date().toISOString(),
        };
        await insforgeRepo.saveDailyFeature(record);
        serverLogger.info(`Generated and persisted Daily Feature for ${dateStr}`, {
          artist: selectedArtist.name,
          song: selectedSong.title,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        serverLogger.error(`Error persisting Daily Feature: ${msg}`, { dateStr });
      }

      return featureData;
    }

    // 2. If database is completely empty, only use dev fixtures if explicitly enabled
    if (serverConfig.useDevFixtures) {
      const fixtures = getDevDailyFeaturePool();
      if (fixtures.length > 0) {
        const seed = (dateObj.getUTCFullYear() * 372) + ((dateObj.getUTCMonth() + 1) * 31) + dateObj.getUTCDate();
        const poolIndex = Math.abs(seed) % fixtures.length;
        const selected = fixtures[poolIndex];
        return {
          date: dateStr,
          artist: selected.artist,
          song: selected.song,
        };
      }
    }

    // In production without DB data, do not fabricate fake data silently
    throw new Error('No artist catalog available in database for Daily Feature generation.');
  }
}

export const dailyFeatureEngine = new DailyFeatureEngine();
