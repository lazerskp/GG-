import type { Artist, Song, Album } from '@/types/music';
import { classifyMarket, legacyRegionToMarket, type Market } from '@/utils/musicClassification';

export function marketOfArtist(artist: Pick<Artist, 'name' | 'bio' | 'region'>): Market {
  // Prefer the existing region bucket if it is unambiguous, then fall
  // through to the keyword classifier using name + bio.
  const fromRegion = legacyRegionToMarket(artist.region);
  if (fromRegion !== 'UNKNOWN') return fromRegion;
  return classifyMarket({ name: artist.name, description: artist.bio });
}

export function isIndianOrDesiMarket(market: Market): boolean {
  return market === 'INDIAN' || market === 'DESI';
}

export function isGlobalMarket(market: Market): boolean {
  return market === 'GLOBAL';
}

export function filterArtistsByMarket(artists: Artist[], market: Market): Artist[] {
  return artists.filter((a) => marketOfArtist(a) === market);
}

export function filterSongsByMarket(songs: Song[], market: Market): Song[] {
  return songs.filter((s) => {
    const fromSong = legacyRegionToMarket(s.region);
    if (fromSong !== 'UNKNOWN') return fromSong === market;
    return classifyMarket({ name: s.artist }) === market;
  });
}

export function filterAlbumsByMarket(albums: Album[], market: Market): Album[] {
  return albums.filter((al) => {
    const fromAlbum = legacyRegionToMarket(al.region);
    if (fromAlbum !== 'UNKNOWN') return fromAlbum === market;
    return classifyMarket({ name: al.artist }) === market;
  });
}

export function dedupeAndClassifyIndian(artists: Artist[]): Artist[] {
  // Re-classify unknown-market artists conservatively — if we cannot
  // determine market from name/bio, exclude them from the curated Indian
  // section rather than guessing.
  return artists.filter((a) => isIndianOrDesiMarket(marketOfArtist(a)));
}

export function dedupeAndClassifyGlobal(artists: Artist[]): Artist[] {
  return artists.filter((a) => {
    const m = marketOfArtist(a);
    return m === 'GLOBAL' || m === 'UNKNOWN';
  });
}
