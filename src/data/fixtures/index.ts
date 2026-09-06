import { Artist, Song, Album, DailyFeatureData } from '@/types/music';
import { INDIAN_ARTISTS, INDIAN_TRACKS, INDIAN_ALBUMS } from './indianRap';
import { GLOBAL_ARTISTS, GLOBAL_TRACKS, GLOBAL_ALBUMS } from './globalRap';
import { DAILY_FEATURE_POOL } from './dailyArchive';

/**
 * Development-only fixtures gatekeeper.
 * Ensures fake mock data CANNOT silently leak into production.
 * Only returns data when process.env.USE_DEV_FIXTURES === 'true'.
 */
export function isDevFixturesEnabled(): boolean {
  return process.env.USE_DEV_FIXTURES === 'true';
}

export function getDevIndianArtists(): Artist[] {
  return isDevFixturesEnabled() ? INDIAN_ARTISTS : [];
}

export function getDevIndianTracks(): Song[] {
  return isDevFixturesEnabled() ? INDIAN_TRACKS : [];
}

export function getDevIndianAlbums(): Album[] {
  return isDevFixturesEnabled() ? INDIAN_ALBUMS : [];
}

export function getDevGlobalArtists(): Artist[] {
  return isDevFixturesEnabled() ? GLOBAL_ARTISTS : [];
}

export function getDevGlobalTracks(): Song[] {
  return isDevFixturesEnabled() ? GLOBAL_TRACKS : [];
}

export function getDevGlobalAlbums(): Album[] {
  return isDevFixturesEnabled() ? GLOBAL_ALBUMS : [];
}

export function getDevDailyFeaturePool(): { artist: DailyFeatureData['artist']; song: DailyFeatureData['song'] }[] {
  return isDevFixturesEnabled() ? DAILY_FEATURE_POOL : [];
}
