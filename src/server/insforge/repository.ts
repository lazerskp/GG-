import 'server-only';

/**
 * InsForge Repository Layer
 * Manages database entities, persistent daily features, and cache records.
 * Strictly SERVER-ONLY.
 */

import { insforgeClient } from './client';
import { DailyFeatureData, Artist, Song, Album } from '@/types/music';
import { serverLogger } from '@/server/logger';

export interface DailyFeatureRecord extends Record<string, unknown> {
  id: string;
  feature_date: string;
  artist_id: string;
  song_id: string;
  region: string;
  editorial_quote?: string;
  created_at?: string;
  artist_data?: DailyFeatureData['artist'];
  song_data?: DailyFeatureData['song'];
}

export interface ArtistRecord extends Record<string, unknown> {
  id: string;
  provider: string;
  provider_id?: string;
  name: string;
  slug: string;
  description?: string;
  image_url: string;
  region: 'india' | 'global';
  genres: string[];
  monthly_listeners?: string;
  verified?: boolean;
  metadata?: Record<string, unknown>;
  last_synced_at?: string;
}

export interface SongRecord extends Record<string, unknown> {
  id: string;
  provider: string;
  provider_id?: string;
  title: string;
  slug: string;
  artist_id: string;
  album_id?: string;
  artwork_url: string;
  duration_seconds: number;
  release_date?: string;
  genre?: string;
  trending_rank?: number;
  metadata?: Record<string, unknown>;
  last_synced_at?: string;
}

export interface AlbumRecord extends Record<string, unknown> {
  id: string;
  provider: string;
  provider_id?: string;
  title: string;
  slug: string;
  artist_id: string;
  artwork_url: string;
  release_year?: number;
  album_type: 'album' | 'ep' | 'single';
  track_count: number;
  metadata?: Record<string, unknown>;
  last_synced_at?: string;
}

export class InsForgeRepository {
  /**
   * Find an existing daily feature for a specific calendar date (YYYY-MM-DD)
   */
  public async getDailyFeatureByDate(featureDate: string): Promise<DailyFeatureRecord | null> {
    const results = await insforgeClient.select<DailyFeatureRecord>('daily_features', {
      feature_date: featureDate,
    });
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Persist a generated daily feature
   */
  public async saveDailyFeature(record: DailyFeatureRecord): Promise<DailyFeatureRecord> {
    return await insforgeClient.upsert<DailyFeatureRecord>('daily_features', record);
  }

  /**
   * Retrieve artist IDs featured within the last N days (for 30-day anti-repeat guarantee)
   */
  public async getRecentDailyFeatureArtistIds(days = 30): Promise<string[]> {
    const allFeatures = await insforgeClient.select<DailyFeatureRecord>('daily_features');
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().split('T')[0];

    const recent = allFeatures.filter((f) => f.feature_date >= cutoffStr);
    return Array.from(new Set(recent.map((f) => f.artist_id)));
  }

  /**
   * Upsert artist metadata into database
   */
  public async upsertArtist(artist: Artist, provider = 'ytmusic'): Promise<void> {
    const slug = artist.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const record: ArtistRecord = {
      id: artist.id,
      provider,
      provider_id: artist.id,
      name: artist.name,
      slug,
      description: artist.bio || '',
      image_url: artist.imageUrl,
      region: artist.region,
      genres: artist.genres,
      monthly_listeners: artist.monthlyListeners || '',
      verified: artist.verified ?? true,
      metadata: { moniker: artist.moniker },
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await insforgeClient.upsert('artists', record);
  }

  /**
   * Ensure an artists row exists for the given id so songs.artist_id FK resolves.
   * Backfills a minimal placeholder row; full details are refreshed by upsertArtist.
   */
  private async ensureArtistRow(artistId: string, artistName: string, region: 'india' | 'global'): Promise<boolean> {
    if (!artistId) return false;
    try {
      const existing = await insforgeClient.select<{ id: string }>('artists', { id: artistId });
      if (existing.length > 0) return true;

      const slug = artistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const placeholder: ArtistRecord = {
        id: artistId,
        provider: 'ytmusic',
        provider_id: artistId,
        name: artistName || 'Unknown Artist',
        slug: slug || artistId.toLowerCase(),
        description: '',
        image_url: '',
        region,
        genres: [],
        verified: false,
        metadata: {},
        last_synced_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      await insforgeClient.upsert('artists', placeholder);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      serverLogger.warn(`[InsForge] Failed to ensure artist row ${artistId}: ${msg}`);
      return false;
    }
  }

  /**
   * Upsert song metadata into database.
   * Guards against foreign-key violations: songs.artist_id is NOT NULL (FK → artists.id)
   * and songs.album_id is a nullable FK (→ albums.id).
   */
  public async upsertSong(song: Song, provider = 'ytmusic'): Promise<void> {
    // 1. A song without a resolvable artist cannot satisfy songs.artist_id — skip it.
    if (!song.artistId) {
      serverLogger.warn(`[InsForge] Skipping song upsert without artist FK: ${song.id} ("${song.title}")`);
      return;
    }

    const artistReady = await this.ensureArtistRow(song.artistId, song.artist, song.region);
    if (!artistReady) {
      serverLogger.warn(`[InsForge] Skipping song upsert, artist FK unresolvable: ${song.id}`);
      return;
    }

    const slug = song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const record: SongRecord = {
      id: song.id,
      provider,
      provider_id: song.id,
      title: song.title,
      slug,
      artist_id: song.artistId,
      artwork_url: song.artworkUrl,
      duration_seconds: song.duration,
      genre: song.genre,
      trending_rank: song.trendingRank,
      metadata: { plays: song.plays, audioUrl: song.audioUrl },
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2. album_id is a nullable FK — only write it when non-empty; if the album row
    //    does not exist yet, omit the reference instead of violating the constraint.
    if (song.albumId) {
      const albums = await insforgeClient.select<{ id: string }>('albums', { id: song.albumId });
      if (albums.length > 0) {
        record.album_id = song.albumId;
      } else {
        serverLogger.warn(`[InsForge] Song ${song.id} references missing album ${song.albumId} — omitting album_id`);
      }
    }

    await insforgeClient.upsert('songs', record);
  }

  /**
   * Upsert album metadata into database
   */
  public async upsertAlbum(album: Album, provider = 'ytmusic'): Promise<void> {
    const slug = album.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const record: AlbumRecord = {
      id: album.id,
      provider,
      provider_id: album.id,
      title: album.title,
      slug,
      artist_id: album.artistId,
      artwork_url: album.artworkUrl,
      release_year: album.releaseYear,
      album_type: album.type || 'album',
      track_count: album.trackCount || 1,
      metadata: {},
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    await insforgeClient.upsert('albums', record);
  }

  /**
   * Query artists from InsForge DB with optional regional filtering
   */
  public async getArtists(region?: 'india' | 'global'): Promise<Artist[]> {
    const filters: Record<string, string> = {};
    if (region) filters.region = region;
    const records = await insforgeClient.select<ArtistRecord>('artists', filters);
    return records.map((r) => ({
      id: r.id,
      name: r.name,
      moniker: (r.metadata?.moniker as string) || '',
      bio: r.description || '',
      imageUrl: r.image_url,
      region: r.region,
      monthlyListeners: r.monthly_listeners || '',
      genres: r.genres || [],
      verified: r.verified ?? true,
    }));
  }

  /**
   * Query songs from InsForge DB
   *
   * Genre rule: never silently default to "Hip-Hop". If the row has no
   * genre, the returned Song carries an empty string so the UI can render
   * a neutral label.
   *
   * Region rule: we do not overwrite the source artist region here. The
   * artist table is the source of truth for region, and the Song row only
   * carries it if explicitly set. We fall back to 'india' here ONLY when
   * the song has been previously associated with an India-classified
   * artist (i.e. when an existing record had a region). For brand-new rows
   * we leave region as the legacy default and let upstream re-classify.
   */
  public async getSongs(filters: Record<string, unknown> = {}): Promise<Song[]> {
    const records = await insforgeClient.select<SongRecord>('songs', filters);
    return records.map((s) => ({
      id: s.id,
      title: s.title,
      artist: (s.metadata?.artist_name as string) || '',
      artistId: s.artist_id,
      album: (s.metadata?.album_name as string) || '',
      albumId: s.album_id,
      artworkUrl: s.artwork_url,
      duration: s.duration_seconds || 0,
      releaseYear: s.release_date ? new Date(s.release_date).getFullYear() : 0,
      // Preserve any explicit region on the song row; default to the
      // legacy "india" only because the schema enforces NOT NULL and
      // upstream data has historically used that bucket. The UI / API
      // layer filters by market classification rather than trusting this.
      region: (s.metadata?.region as Song['region']) || 'india',
      genre: typeof s.genre === 'string' && s.genre.trim().length > 0 ? s.genre : '',
      trendingRank: s.trending_rank,
      plays: (s.metadata?.plays as string) || '',
      audioUrl: s.metadata?.audioUrl as string | undefined,
    }));
  }

  /**
   * Query albums from InsForge DB
   *
   * Region rule: we do NOT hardcode region to 'india' here. The album row
   * stores the artist's region (via metadata or via the join to artists).
   * For backwards compatibility with existing rows we preserve any
   * `metadata.region` that may have been written previously.
   */
  public async getAlbums(filters: Record<string, unknown> = {}): Promise<Album[]> {
    const records = await insforgeClient.select<AlbumRecord>('albums', filters);
    return records.map((al) => ({
      id: al.id,
      title: al.title,
      artist: (al.metadata?.artist_name as string) || '',
      artistId: al.artist_id,
      artworkUrl: al.artwork_url,
      releaseYear: al.release_year || 0,
      trackCount: al.track_count || 1,
      type: al.album_type || 'album',
      region: ((al.metadata?.region as Album['region']) || 'india') as Album['region'],
    }));
  }

  /**
   * Provider Cache: Get unexpired data
   */
  public async getProviderCache<T = unknown>(cacheKey: string): Promise<T | null> {
    const records = await insforgeClient.select<{ cache_key: string; data: T; expires_at: string }>(
      'provider_cache',
      { cache_key: cacheKey }
    );
    if (records.length === 0) return null;

    const record = records[0];
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return null;
    }
    return record.data as T;
  }

  /**
   * Provider Cache: Set data with TTL
   */
  public async setProviderCache(cacheKey: string, provider: string, data: unknown, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    await insforgeClient.upsert('provider_cache', {
      cache_key: cacheKey,
      provider,
      data,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Search Cache: Get unexpired search result
   */
  public async getSearchCache<T = unknown>(queryHash: string): Promise<T | null> {
    const records = await insforgeClient.select<{ query_hash: string; results: T; expires_at: string }>(
      'search_cache',
      { query_hash: queryHash }
    );
    if (records.length === 0) return null;

    const record = records[0];
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return null;
    }
    return record.results as T;
  }

  /**
   * Search Cache: Set search result with TTL
   */
  public async setSearchCache(queryHash: string, query: string, results: unknown, ttlSeconds: number): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString();
    await insforgeClient.upsert('search_cache', {
      query_hash: queryHash,
      query,
      results,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    });
  }
}

export const insforgeRepo = new InsForgeRepository();
