import type { MetadataRoute } from 'next';
import { ARTICLES } from '@/data/editorial/articles';

export const dynamic = 'force-dynamic';

const CORE_ARTIST_IDS = [
  'divine',
  'seedhe-maut',
  'krsna',
  'hanumankind',
  'prabh-deep',
  'mc-stan',
  'chaar-diwaari',
  'brodha-v',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gullygang.in').replace(/\/$/, '');
  const now = new Date();

  // 1. High-priority core platform & destination routes
  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/charts`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/artists`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/albums`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${siteUrl}/copyright`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Canonical artist profiles
  for (const artistId of CORE_ARTIST_IDS) {
    entries.push({
      url: `${siteUrl}/artist/${encodeURIComponent(artistId)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    });
  }

  // 3. Canonical published editorial articles
  for (const article of ARTICLES) {
    entries.push({
      url: `${siteUrl}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  }

  // Note: /blog/tag/[slug] archives are thin taxonomy grids and are intentionally
  // excluded from sitemap.xml to protect domain crawl budget and avoid duplication penalties.

  return entries;
}
