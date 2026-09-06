/**
 * Decoupled Provider Interfaces for GULLYGANG
 * 
 * ARCHITECTURAL PRINCIPLE:
 * Music metadata discovery (names, credits, cover art, track counts) and
 * audio playback streaming are fundamentally separate systems.
 * 
 * 1. MusicMetadataProvider: Handles catalog search, artist profiles, tracklists,
 *    and chart discovery via compliant public metadata APIs (e.g. ytmusicapi).
 * 
 * 2. PlaybackProvider: Handles authorized audio playback streams, audio tokens,
 *    licensing, or embedded player controls.
 * 
 * They MUST NOT be assumed to originate from the same vendor or service.
 */

import { Artist, Song, Album } from '@/types/music';

export interface SearchFilterOptions {
  type?: 'all' | 'artists' | 'songs' | 'albums';
  limit?: number;
}

export interface TopResultItem {
  type: 'artist' | 'song' | 'album';
  item: Artist | Song | Album;
}

export interface SearchResultPayload {
  query: string;
  topResult?: TopResultItem | null;
  artists: Artist[];
  songs: Song[];
  albums: Album[];
  videos?: Song[];
  serviceStatus?: 'ok' | 'upstream_error' | 'timeout' | 'network_error';
  errorMessage?: string;
}

export interface RelatedSongsPayload {
  videoId: string;
  tracks: Song[];
  continuation?: string | null;
}

export interface ArtistSongsPayload {
  artistId: string;
  tracks: Song[];
  total?: number | null;
  totalCount?: number;
  hasMore?: boolean;
  continuation?: string | null;
}

export interface ChartPayload {
  region: 'india' | 'global';
  tracks: Song[];
  artists: Artist[];
  updatedAt?: string;
  source?: string;
}

export interface ArtistDetailPayload {
  artist: Artist;
  topSongs: Song[];
  newReleases: Album[];
  topAlbums: Album[];
  relatedArtists: Artist[];
  updatedAt: string;
  source: string;
}

/**
 * Metadata Discovery Interface
 */
export interface MusicMetadataProvider {
  search(query: string, options?: SearchFilterOptions): Promise<SearchResultPayload>;
  getArtist(id: string): Promise<Artist | null>;
  getAlbum(id: string): Promise<Album | null>;
  getSongMetadata(id: string): Promise<Song | null>;
  getCharts(region: 'india' | 'global'): Promise<ChartPayload>;
}

/**
 * Playback Provider Interface (Future Compliant Audio Delivery)
 */
export interface PlaybackStreamResult {
  trackId: string;
  streamUrl?: string;
  format?: 'mp3' | 'aac' | 'hls' | 'dash';
  bitrateKbps?: number;
  expiresAt?: string;
  licenseType: 'licensed_stream' | 'preview_clip' | 'interactive_synth';
}

export interface PlaybackProvider {
  resolveStream(trackId: string): Promise<PlaybackStreamResult>;
  verifyPlaybackEligibility(trackId: string): Promise<boolean>;
}
