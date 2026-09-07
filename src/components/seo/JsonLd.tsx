import React from 'react';
import type { Artist, Album } from '@/types/music';

const SITE_URL = 'https://gullygang.in';

export function OrganizationJsonLd() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'GULLYGANG',
    alternateName: 'GullyGang',
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/icon.svg`,
      width: 512,
      height: 512,
    },
    description:
      'A modern music discovery and listening platform for Indian rap, Desi Hip-Hop, and global sounds.',
    sameAs: [
      'https://gullygang.in/about',
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export function WebSiteJsonLd() {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'GULLYGANG',
    description:
      'Music discovery and listening platform for Indian rap, Desi Hip-Hop, and global sounds.',
    publisher: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: 'en',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export function WebPageJsonLd({
  url,
  name,
  description,
}: {
  url: string;
  name: string;
  description: string;
}) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE_URL}${url}#webpage`,
    url: `${SITE_URL}${url}`,
    name,
    description,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
    },
    inLanguage: 'en',
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export function ArtistJsonLd({ artist }: { artist: Artist }) {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MusicGroup',
    '@id': `${SITE_URL}/artist/${artist.id}#artist`,
    name: artist.name,
    url: `${SITE_URL}/artist/${artist.id}`,
  };
  if (artist.imageUrl) {
    ld.image = artist.imageUrl;
  }
  if (artist.bio) {
    ld.description = artist.bio;
  }
  if (Array.isArray(artist.genres) && artist.genres.length > 0) {
    ld.genre = artist.genres;
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export function AlbumJsonLd({ album }: { album: Album }) {
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    '@id': `${SITE_URL}/album/${album.id}#album`,
    name: album.title,
    url: `${SITE_URL}/album/${album.id}`,
    byArtist: {
      '@type': 'MusicGroup',
      name: album.artist,
      url: `${SITE_URL}/artist/${encodeURIComponent(album.artistId)}`,
    },
  };
  if (album.artworkUrl) {
    ld.image = album.artworkUrl;
  }
  if (album.releaseYear && album.releaseYear > 0) {
    ld.datePublished = `${album.releaseYear}`;
  }
  if (album.trackCount && album.trackCount > 0) {
    ld.numTracks = album.trackCount;
  }
  if (album.type) {
    ld.albumProductionType = album.type;
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export function ItemListJsonLd({
  url,
  name,
  items,
}: {
  url: string;
  name: string;
  items: { name: string; url: string; position: number }[];
}) {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}${url}#itemlist`,
    url: `${SITE_URL}${url}`,
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}
