
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
import {
  classifyMarket,
  legacyRegionToMarket,
  marketToLegacyRegion,
  normalizeGenres,
  type Market,
} from '@/utils/musicClassification';

interface PythonArtist {
  id: string;
  name: string;
  description?: string;
  image: string;
  region?: 'india' | 'global' | string;
  monthly_listeners?: string;
  genres?: string[];
  verified?: boolean;
}

interface PythonSong {
  id: string;
  title: string;
  artist: string;
  artist_id?: string;
  artists?: Array<{ name?: string; id?: string }>;
  album?: string;
  album_id?: string;
  artwork: string;
  duration?: number;
  release_year?: number;
  region?: 'india' | 'global' | string;
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

/**
 * Classify an artist payload from the upstream Python service into the
 * internal Market taxonomy. Falls back to keyword + name heuristics when
 * the upstream region is missing or untrusted.
 */
function classifyPythonArtist(raw: {
  name?: string;
  description?: string;
  region?: string | null;
}): Market {
  return classifyMarket({
    name: raw.name,
    description: raw.description,
    providerRegion: raw.region,
  });
}

/**
 * Map a Market value to the legacy 'india' | 'global' Region enum.
 * Returns 'india' for INDIAN and DESI, 'global' for everything else.
 */
function marketForLegacyEnum(market: Market): 'india' | 'global' {
  return marketToLegacyRegion(market);
}

/**
 * Map a Market to the strict 'INDIAN' | 'DESI' | 'GLOBAL' | 'UNKNOWN' taxonomy.
 * Unknown artists get an empty region string so downstream code never
 * silently buckets them into India.
 */
function marketLabel(market: Market): 'INDIAN' | 'DESI' | 'GLOBAL' | 'UNKNOWN' {
  return market;
}

function mapArtist(raw: PythonArtist): Artist {
  const market = classifyPythonArtist(raw);
  const genres = normalizeGenres(raw.genres);
  return {
    id: raw.id,
    name: raw.name,
    moniker: '',
    bio: raw.description || '',
    imageUrl: raw.image,
    region: marketForLegacyEnum(market),
    monthlyListeners: raw.monthly_listeners || '',
    genres,
    verified: raw.verified ?? false,
  };
}

function mapSong(raw: PythonSong, fallbackArtistMarket: Market | null = null): Song {
  // Classify the song's market: prefer the song's own region, then the
  // artist market, then the song's artist name, then UNKNOWN.
  let market: Market;
  if (raw.region) {
    market = legacyRegionToMarket(raw.region);
  } else if (fallbackArtistMarket) {
    market = fallbackArtistMarket;
  } else if (raw.artist) {
    market = classifyMarket({ name: raw.artist });
  } else {
    market = 'UNKNOWN';
  }
  const genres = normalizeGenres(raw.genre);
  const artistCredits = Array.isArray(raw.artists)
    ? raw.artists
      .map((a) => (a && typeof a.name === 'string' ? a.name.trim() : ''))
      .filter((n) => n.length > 0)
    : [];
  const isVariousArtists = /^various\s*artists?$/i.test(raw.artist?.trim() || '');
  return {
    id: raw.id,
    title: raw.title,
    artist: raw.artist,
    artistId: raw.artist_id || '',
    artistCredits: artistCredits.length > 0 ? artistCredits : undefined,
    isVariousArtists,
    album: raw.album,
    albumId: raw.album_id,
    artworkUrl: raw.artwork,
    duration: raw.duration || 0,
    releaseYear: raw.release_year || 0,
    region: marketForLegacyEnum(market),
    genre: genres[0] || '',
  };
}

function mapAlbum(raw: PythonAlbum, fallbackArtistMarket: Market | null = null): Album {
  let market: Market;
  if (raw.artist_id) {
    market = fallbackArtistMarket || classifyMarket({ name: raw.artist });
  } else {
    market = classifyMarket({ name: raw.artist });
  }
  return {
    id: raw.id,
    title: raw.title,
    artist: raw.artist,
    artistId: raw.artist_id || '',
    artworkUrl: raw.artwork,
    releaseYear: raw.release_year || 0,
    trackCount: raw.track_count || 0,
    type: (raw.album_type || 'album') as Album['type'],
    region: marketForLegacyEnum(market),
    tracks: (raw.tracks || []).map((t) => mapSong(t, market)),
  };
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
            item: mapArtist(item as PythonArtist),
          };
        } else if (data.topResult.type === 'song') {
          mappedTopResult = {
            type: 'song',
            item: mapSong(item as PythonSong),
          };
        } else if (data.topResult.type === 'album') {
          mappedTopResult = {
            type: 'album',
            item: mapAlbum(item as PythonAlbum),
          };
        }
      }

      return {
        query,
        topResult: mappedTopResult,
        artists: (data.artists || []).map(mapArtist),
        songs: (data.songs || []).map((s) => mapSong(s)),
        albums: (data.albums || []).map((al) => mapAlbum(al)),
        videos: (data.videos || []).map((v) => mapSong(v)),
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
      return mapArtist(data);
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
      const artist = mapArtist(data.artist);
      const artistMarket = classifyPythonArtist(data.artist);
      return {
        artist,
        topSongs: (data.topSongs || []).map((s) => mapSong(s, artistMarket)),
        newReleases: (data.newReleases || []).map((al) => mapAlbum(al, artistMarket)),
        topAlbums: (data.topAlbums || []).map((al) => mapAlbum(al, artistMarket)),
        relatedArtists: (data.relatedArtists || []).map(mapArtist),
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
      return mapAlbum(data);
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
      return mapSong(data);
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
      // When charts come from a regional upstream bucket, every entry is
      // presumed to be that bucket. But the classification utilities still
      // double-check the artist name when region is missing.
      const bucketMarket: Market = region === 'india' ? 'INDIAN' : 'GLOBAL';
      return {
        region,
        updatedAt: data.updatedAt || new Date().toISOString(),
        source: data.source || 'ytmusic_live',
        tracks: data.tracks.slice(0, 10).map((t) => mapSong(t, bucketMarket)),
        artists: (data.artists || []).slice(0, 10).map(mapArtist),
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
        tracks: data.tracks.map((s) => mapSong(s)),
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
        tracks: data.tracks.map((s) => mapSong(s)),
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
export { marketLabel };
