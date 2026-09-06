import 'server-only';

/**
 * Python Music Metadata Microservice Client
 * Communicates with the internal Python metadata service (port 8001).
 * Strictly server-only. No silent mock fallbacks in production.
 */

import { serverConfig } from '@/server/config';
import { serverLogger } from '@/server/logger';
import { Artist, Song, Album } from '@/types/music';
import {
  SearchResultPayload,
  ChartPayload,
  ArtistDetailPayload,
  RelatedSongsPayload,
  ArtistSongsPayload,
} from './providerTypes';
import {
  getDevIndianArtists,
  getDevIndianTracks,
  getDevIndianAlbums,
  getDevGlobalArtists,
  getDevGlobalTracks,
  getDevGlobalAlbums,
} from '@/data/fixtures';

interface PythonArtist {
  id: string;
  name: string;
  description?: string;
  image: string;
  region?: 'india' | 'global';
  monthly_listeners?: string;
  genres?: string[];
  verified?: boolean;
}

interface PythonSong {
  id: string;
  title: string;
  artist: string;
  artist_id?: string;
  album?: string;
  album_id?: string;
  artwork: string;
  duration?: number;
  release_year?: number;
  region?: 'india' | 'global';
  genre?: string;
}

interface PythonAlbum {
  id: string;
  title: string;
  artist: string;
  artist_id?: string;
  artwork: string;
  release_year?: number;
  track_count?: number;
  album_type?: 'album' | 'ep' | 'single';
  tracks?: PythonSong[];
}

interface PythonSearchResponse {
  query: string;
  topResult?: {
    type: 'artist' | 'song' | 'album';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: any;
  } | null;
  artists: PythonArtist[];
  songs: PythonSong[];
  albums: PythonAlbum[];
  videos?: PythonSong[];
}

interface PythonRelatedSongsResponse {
  videoId: string;
  tracks: PythonSong[];
  continuation?: string | null;
}

interface PythonArtistSongsResponse {
  artistId: string;
  tracks: PythonSong[];
  total?: number | null;
  has_more?: boolean;
  continuation?: string | null;
}

interface PythonChartResponse {
  country: string;
  region: string;
  tracks: PythonSong[];
  artists: PythonArtist[];
  updatedAt?: string;
  source?: string;
}

interface PythonArtistDetailResponse {
  artist: PythonArtist;
  topSongs: PythonSong[];
  newReleases: PythonAlbum[];
  topAlbums: PythonAlbum[];
  relatedArtists: PythonArtist[];
  updatedAt?: string;
  source?: string;
}

export interface PythonLyricLine {
  startTime: number;
  endTime?: number | null;
  text: string;
}

export interface PythonLyricsResponse {
  status: 'synced' | 'plain' | 'instrumental' | 'unavailable';
  videoId: string;
  lines?: PythonLyricLine[] | null;
  text?: string[] | null;
  source?: string | null;
  provider: string;
}

export class PythonMetadataClient {
  private get baseUrl(): string {
    return serverConfig.musicServiceUrl.replace(/\/$/, '');
  }

  private async fetchFromServiceWithResult<T>(endpoint: string): Promise<{
    data: T | null;
    error?: string;
    errorType?: 'upstream_error' | 'timeout' | 'network_error';
    status?: number;
  }> {
    const url = `${this.baseUrl}${endpoint}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), serverConfig.requestTimeoutMs);

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (serverConfig.musicServiceApiKey) {
        headers['X-API-Key'] = serverConfig.musicServiceApiKey;
      }

      const res = await fetch(url, {
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        const statusMsg = `Python service returned HTTP ${res.status}`;
        serverLogger.warn(statusMsg, { endpoint, status: res.status });
        return { data: null, error: statusMsg, errorType: 'upstream_error', status: res.status };
      }

      const data = (await res.json()) as T;
      return { data, status: res.status };
    } catch (err: unknown) {
      clearTimeout(timeout);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const msg = err instanceof Error ? err.message : String(err);
      const errorType = isAbort ? 'timeout' : 'network_error';
      serverLogger.warn(`Python metadata service error (${errorType}): ${msg}`, { endpoint, errorType });
      return { data: null, error: msg, errorType };
    }
  }

  private async fetchFromService<T>(endpoint: string): Promise<T | null> {
    const res = await this.fetchFromServiceWithResult<T>(endpoint);
    return res.data;
  }

  /**
   * Search for artists, songs, and albums
   */
  public async search(query: string): Promise<SearchResultPayload> {
    const res = await this.fetchFromServiceWithResult<PythonSearchResponse>(
      `/api/v1/metadata/search?q=${encodeURIComponent(query)}`
    );
    const data = res.data;

    if (data && (data.artists?.length > 0 || data.songs?.length > 0 || data.albums?.length > 0 || (data.videos && data.videos.length > 0))) {
      let mappedTopResult: SearchResultPayload['topResult'] = null;
      if (data.topResult && data.topResult.item) {
        const item = data.topResult.item;
        if (data.topResult.type === 'artist') {
          mappedTopResult = {
            type: 'artist',
            item: {
              id: item.id,
              name: item.name,
              bio: item.description || '',
              imageUrl: item.image,
              region: item.region || 'india',
              monthlyListeners: item.monthly_listeners || '',
              genres: item.genres || [],
              verified: item.verified ?? false,
            },
          };
        } else if (data.topResult.type === 'song') {
          mappedTopResult = {
            type: 'song',
            item: {
              id: item.id,
              title: item.title,
              artist: item.artist,
              artistId: item.artist_id || '',
              artworkUrl: item.artwork,
              duration: item.duration || 0,
              releaseYear: item.release_year || 0,
              region: item.region || 'india',
              genre: item.genre || '',
            },
          };
        } else if (data.topResult.type === 'album') {
          mappedTopResult = {
            type: 'album',
            item: {
              id: item.id,
              title: item.title,
              artist: item.artist,
              artistId: item.artist_id || '',
              artworkUrl: item.artwork,
              releaseYear: item.release_year || 0,
              trackCount: item.track_count || 0,
              type: item.album_type || 'album',
              region: 'india',
            },
          };
        }
      }

      return {
        query,
        topResult: mappedTopResult,
        artists: (data.artists || []).map((a) => ({
          id: a.id,
          name: a.name,
          bio: a.description || '',
          imageUrl: a.image,
          region: a.region || 'india',
          monthlyListeners: a.monthly_listeners || '',
          genres: a.genres || [],
          verified: a.verified ?? false,
        })),
        songs: (data.songs || []).map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          artistId: s.artist_id || '',
          artworkUrl: s.artwork,
          duration: s.duration || 0,
          releaseYear: s.release_year || 0,
          region: s.region || 'india',
          genre: s.genre || '',
        })),
        albums: (data.albums || []).map((al) => ({
          id: al.id,
          title: al.title,
          artist: al.artist,
          artistId: al.artist_id || '',
          artworkUrl: al.artwork,
          releaseYear: al.release_year || 0,
          trackCount: al.track_count || 0,
          type: al.album_type || 'album',
          region: 'india',
        })),
        videos: (data.videos || []).map((v) => ({
          id: v.id,
          title: v.title,
          artist: v.artist,
          artistId: v.artist_id || '',
          artworkUrl: v.artwork,
          duration: v.duration || 0,
          releaseYear: v.release_year || 0,
          region: v.region || 'india',
          genre: v.genre || '',
        })),
        serviceStatus: 'ok',
      };
    }

    // If live service returned 200 with genuinely 0 results
    if (res.status === 200 && data) {
      return { query, artists: [], songs: [], albums: [], serviceStatus: 'ok' };
    }

    // Database fallback if live service was unavailable or errored
    try {
      const { insforgeRepo } = await import('@/server/insforge/repository');
      const allSongs = await insforgeRepo.getSongs();
      const q = query.toLowerCase().trim();
      const matchedSongs = allSongs.filter(
        (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      );
      if (matchedSongs.length > 0) {
        serverLogger.info('Search matched database fallback', { query, matchCount: matchedSongs.length });
        return {
          query,
          artists: [],
          songs: matchedSongs,
          albums: [],
          serviceStatus: 'ok',
        };
      }
    } catch {
      // Ignore database fallback errors
    }

    // Only use development fixtures if explicitly toggled on
    if (serverConfig.useDevFixtures) {
      const q = query.toLowerCase().trim();
      const allArtists = [...getDevIndianArtists(), ...getDevGlobalArtists()];
      const allTracks = [...getDevIndianTracks(), ...getDevGlobalTracks()];
      const allAlbums = [...getDevIndianAlbums(), ...getDevGlobalAlbums()];

      const artists = allArtists.filter(
        (a) => a.name.toLowerCase().includes(q) || a.genres.some((g) => g.toLowerCase().includes(q))
      );
      const songs = allTracks.filter(
        (s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q)
      );
      const albums = allAlbums.filter(
        (al) => al.title.toLowerCase().includes(q) || al.artist.toLowerCase().includes(q)
      );

      return { query, artists, songs, albums, serviceStatus: 'ok' };
    }

    // If upstream service actually failed / timed out and no fallback was found, propagate error
    if (res.errorType) {
      return {
        query,
        artists: [],
        songs: [],
        albums: [],
        serviceStatus: res.errorType,
        errorMessage: res.error || 'Music metadata service unavailable',
      };
    }

    // Normal empty result
    return { query, artists: [], songs: [], albums: [], serviceStatus: 'ok' };
  }


  /**
   * Get artist by ID
   */
  public async getArtist(id: string): Promise<Artist | null> {
    const data = await this.fetchFromService<PythonArtist>(`/api/v1/metadata/artists/${id}`);
    if (data) {
      return {
        id: data.id,
        name: data.name,
        bio: data.description || '',
        imageUrl: data.image,
        region: data.region || 'india',
        monthlyListeners: data.monthly_listeners || '',
        genres: data.genres || [],
        verified: data.verified ?? false,
      };
    }

    if (serverConfig.useDevFixtures) {
      const all = [...getDevIndianArtists(), ...getDevGlobalArtists()];
      return all.find((a) => a.id === id) || null;
    }

    return null;
  }

  /**
   * Get full artist details (profile, top songs, new releases, top albums, related artists)
   */
  public async getArtistDetails(id: string): Promise<ArtistDetailPayload | null> {
    const data = await this.fetchFromService<PythonArtistDetailResponse>(
      `/api/v1/metadata/artists/${encodeURIComponent(id)}/details`
    );

    if (data && data.artist) {
      const artistRegion = data.artist.region || 'india';
      return {
        artist: {
          id: data.artist.id,
          name: data.artist.name,
          bio: data.artist.description || '',
          imageUrl: data.artist.image,
          region: artistRegion,
          monthlyListeners: data.artist.monthly_listeners || '',
          genres: data.artist.genres || [],
          verified: data.artist.verified ?? false,
        },
        topSongs: (data.topSongs || []).map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          artistId: s.artist_id || '',
          album: s.album || undefined,
          albumId: s.album_id || undefined,
          artworkUrl: s.artwork,
          duration: s.duration || 0,
          releaseYear: s.release_year || 0,
          region: s.region || artistRegion,
          genre: s.genre || '',
        })),
        newReleases: (data.newReleases || []).map((al) => ({
          id: al.id,
          title: al.title,
          artist: al.artist,
          artistId: al.artist_id || '',
          artworkUrl: al.artwork,
          releaseYear: al.release_year || 0,
          trackCount: al.track_count || 0,
          type: (al.album_type || 'single') as Album['type'],
          region: artistRegion,
        })),
        topAlbums: (data.topAlbums || []).map((al) => ({
          id: al.id,
          title: al.title,
          artist: al.artist,
          artistId: al.artist_id || '',
          artworkUrl: al.artwork,
          releaseYear: al.release_year || 0,
          trackCount: al.track_count || 0,
          type: (al.album_type || 'album') as Album['type'],
          region: artistRegion,
        })),
        relatedArtists: (data.relatedArtists || []).map((a) => ({
          id: a.id,
          name: a.name,
          bio: a.description || '',
          imageUrl: a.image,
          region: a.region || 'india',
          monthlyListeners: a.monthly_listeners || '',
          genres: a.genres || [],
          verified: a.verified ?? false,
        })),
        updatedAt: data.updatedAt || new Date().toISOString(),
        source: data.source || 'ytmusic_live',
      };
    }

    if (serverConfig.useDevFixtures) {
      const all = [...getDevIndianArtists(), ...getDevGlobalArtists()];
      const artist = all.find((a) => a.id === id);
      if (artist) {
        const allSongs = [...getDevIndianTracks(), ...getDevGlobalTracks()];
        const allAlbums = [...getDevIndianAlbums(), ...getDevGlobalAlbums()];
        const topSongs = allSongs.filter((s) => s.artistId === id || s.artist.toLowerCase() === artist.name.toLowerCase());
        const artistAlbums = allAlbums.filter((a) => a.artistId === id || a.artist.toLowerCase() === artist.name.toLowerCase());
        return {
          artist,
          topSongs: topSongs.slice(0, 10),
          newReleases: artistAlbums.slice(0, 5),
          topAlbums: artistAlbums.slice(0, 5),
          relatedArtists: all.filter((a) => a.id !== id && a.region === artist.region).slice(0, 6),
          updatedAt: new Date().toISOString(),
          source: 'dev_fixtures',
        };
      }
    }

    return null;
  }

  /**
   * Get album by ID
   */
  public async getAlbum(id: string): Promise<Album | null> {
    const data = await this.fetchFromService<PythonAlbum>(`/api/v1/metadata/albums/${id}`);
    if (data) {
      return {
        id: data.id,
        title: data.title,
        artist: data.artist,
        artistId: data.artist_id || '',
        artworkUrl: data.artwork,
        releaseYear: data.release_year || 0,
        trackCount: data.track_count || 0,
        type: (data.album_type || 'album') as Album['type'],
        region: 'india',
        tracks: (data.tracks || []).map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          artistId: s.artist_id || '',
          artworkUrl: s.artwork,
          duration: s.duration || 0,
          releaseYear: s.release_year || 0,
          region: 'india',
          genre: s.genre || '',
        })),
      };
    }

    if (serverConfig.useDevFixtures) {
      const all = [...getDevIndianAlbums(), ...getDevGlobalAlbums()];
      return all.find((a) => a.id === id) || null;
    }

    return null;
  }

  /**
   * Get song metadata by ID
   */
  public async getSong(id: string): Promise<Song | null> {
    const data = await this.fetchFromService<PythonSong>(`/api/v1/metadata/songs/${id}`);
    if (data) {
      return {
        id: data.id,
        title: data.title,
        artist: data.artist,
        artistId: data.artist_id || '',
        artworkUrl: data.artwork,
        duration: data.duration || 0,
        releaseYear: data.release_year || 0,
        region: data.region || 'india',
        genre: data.genre || '',
      };
    }

    if (serverConfig.useDevFixtures) {
      const all = [...getDevIndianTracks(), ...getDevGlobalTracks()];
      return all.find((s) => s.id === id) || null;
    }

    return null;
  }

  /**
   * Get charts
   */
  public async getCharts(region: 'india' | 'global' = 'india'): Promise<ChartPayload> {
    const country = region === 'india' ? 'IN' : 'US';
    const data = await this.fetchFromService<PythonChartResponse>(
      `/api/v1/metadata/charts?country=${country}`
    );

    if (data && data.tracks?.length > 0) {
      return {
        region,
        updatedAt: data.updatedAt || new Date().toISOString(),
        source: data.source || 'ytmusic_live',
        tracks: data.tracks.slice(0, 10).map((t) => ({
          id: t.id,
          title: t.title,
          artist: t.artist,
          artistId: t.artist_id || '',
          artworkUrl: t.artwork,
          duration: t.duration || 0,
          releaseYear: t.release_year || 0,
          region,
          genre: t.genre || '',
        })),
        artists: (data.artists || []).slice(0, 10).map((a) => ({
          id: a.id,
          name: a.name,
          bio: a.description || '',
          imageUrl: a.image,
          region,
          monthlyListeners: a.monthly_listeners || '',
          genres: a.genres || [],
          verified: a.verified ?? false,
        })),
      };
    }

    if (serverConfig.useDevFixtures) {
      const tracks = region === 'india' ? getDevIndianTracks().slice(0, 10) : getDevGlobalTracks().slice(0, 10);
      const artists = region === 'india' ? getDevIndianArtists().slice(0, 10) : getDevGlobalArtists().slice(0, 10);
      return { region, tracks, artists, updatedAt: new Date().toISOString(), source: 'dev_fixtures' };
    }

    return { region, tracks: [], artists: [], updatedAt: new Date().toISOString(), source: 'empty' };
  }

  /**
   * Get related / recommended songs for a video ID
   */
  public async getRelatedSongs(
    videoId: string,
    limit: number = 20,
    continuation?: string | null
  ): Promise<RelatedSongsPayload> {
    const params = new URLSearchParams({ limit: String(limit) });
    if (continuation) {
      params.set('continuation', continuation);
    }

    const data = await this.fetchFromService<PythonRelatedSongsResponse>(
      `/api/v1/metadata/related/${encodeURIComponent(videoId)}?${params.toString()}`
    );

    if (data && data.tracks && data.tracks.length > 0) {
      return {
        videoId,
        tracks: data.tracks.map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          artistId: s.artist_id || '',
          artworkUrl: s.artwork,
          duration: s.duration || 0,
          releaseYear: s.release_year || 0,
          region: s.region || 'india',
          genre: s.genre || '',
        })),
        continuation: data.continuation || null,
      };
    }

    return { videoId, tracks: [], continuation: null };
  }

  /**
   * Get all songs for an artist (paginated / infinite catalog)
   */
  public async getArtistSongs(
    artistId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ArtistSongsPayload> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    const data = await this.fetchFromService<PythonArtistSongsResponse>(
      `/api/v1/metadata/artists/${encodeURIComponent(artistId)}/songs?${params.toString()}`
    );
    if (data && data.tracks && data.tracks.length > 0) {
      const total = data.total ?? data.tracks.length;
      return {
        artistId,
        tracks: data.tracks.map((s) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          artistId: s.artist_id || artistId,
          artworkUrl: s.artwork,
          duration: s.duration || 0,
          releaseYear: s.release_year || 0,
          region: s.region || 'india',
          genre: s.genre || '',
        })),
        total,
        totalCount: total,
        hasMore: data.has_more ?? (total > offset + data.tracks.length),
        continuation: data.continuation || null,
      };
    }

    return { artistId, tracks: [], total: 0, totalCount: 0, hasMore: false, continuation: null };
  }

  /**
   * Get lyrics (synced or plain) for a YouTube video ID
   */
  public async getLyrics(videoId: string): Promise<PythonLyricsResponse | null> {
    const cleanId = videoId.trim();
    if (!cleanId || cleanId.length < 3) return null;

    return await this.fetchFromService<PythonLyricsResponse>(
      `/api/v1/metadata/lyrics/${encodeURIComponent(cleanId)}`
    );
  }
}

export const pythonClient = new PythonMetadataClient();

