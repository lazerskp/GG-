import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, Disc3, Radio, Users } from 'lucide-react';
import {
  EDITORIAL_AUTHOR,
  getAllArticleSlugs,
  getAllArticles,
  getArticleBySlug,
} from '@/data/editorial/articles';
import { getDevIndianArtists } from '@/data/fixtures';
import type { Artist } from '@/types/music';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllArticleSlugs().map((slug) => ({ slug }));
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gullygang.in').replace(/\/$/, '');

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    return {
      title: {
        absolute: 'Article Not Found | GULLYGANG',
      },
      description: 'The requested article could not be found on GULLYGANG.',
      robots: {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      },
    };
  }

  const title = `${article.title} | GULLYGANG`;
  const canonicalUrl = `${SITE_URL}/blog/${article.slug}`;
  const imageUrl = article.image || `${SITE_URL}/icon.svg`;

  return {
    title: {
      absolute: title,
    },
    description: article.description,
    authors: [{ name: EDITORIAL_AUTHOR.name, url: `${SITE_URL}/about` }],
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      title,
      description: article.description,
      url: canonicalUrl,
      siteName: 'GULLYGANG',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [EDITORIAL_AUTHOR.name],
      tags: article.tags,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: article.description,
      images: [imageUrl],
    },
  };
}

function resolveRelatedArtists(artistIds: string[]): Artist[] {
  if (artistIds.length === 0) return [];
  const all = getDevIndianArtists();
  return artistIds
    .map((id) => all.find((a) => a.id === id))
    .filter((a): a is Artist => Boolean(a));
}

function renderBodyParagraphs(body: string) {
  return body
    .split(/\n\n+/)
    .filter((p) => p.trim().length > 0)
    .map((p, idx) => (
      <p
        key={idx}
        className="text-base sm:text-lg text-[#D4D4D4] leading-[1.75] tracking-[-0.005em]"
      >
        {p}
      </p>
    ));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function ArticleJsonLd({ article }: { article: NonNullable<ReturnType<typeof getArticleBySlug>> }) {
  const canonicalUrl = `${SITE_URL}/blog/${article.slug}`;
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': 'Organization',
      name: EDITORIAL_AUTHOR.name,
      url: `${SITE_URL}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GULLYGANG',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    keywords: article.tags.join(', '),
    articleSection: article.category,
  };

  if (article.image) {
    ld.image = [article.image];
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

function BreadcrumbJsonLd({ article }: { article: NonNullable<ReturnType<typeof getArticleBySlug>> }) {
  const canonicalUrl = `${SITE_URL}/blog/${article.slug}`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: article.title,
        item: canonicalUrl,
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) {
    notFound();
  }

  const allArticles = getAllArticles();
  const currentIndex = allArticles.findIndex((a) => a.slug === article.slug);
  const nextArticle = allArticles[currentIndex + 1] ?? allArticles[0];
  const relatedByTag = allArticles
    .filter((a) => a.slug !== article.slug && a.tags.some((t) => article.tags.includes(t)))
    .slice(0, 3);
  const relatedArtists = resolveRelatedArtists(article.relatedArtistIds ?? []);

  return (
    <>
      <ArticleJsonLd article={article} />
      <BreadcrumbJsonLd article={article} />

      <article className="space-y-10 sm:space-y-14 py-6 sm:py-10">
        <nav aria-label="Breadcrumb" className="text-xs font-mono text-[#8F8F8F]">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/blog" className="hover:text-white transition-colors">
                Blog
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-white truncate max-w-[60ch]">{article.title}</li>
          </ol>
        </nav>

        <header className="space-y-5 max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#A1A1A1]">
            {article.heroEyebrow}
          </p>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
            {article.title}
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed">
            {article.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-mono text-[#8F8F8F] pt-2">
            <span>By {EDITORIAL_AUTHOR.name}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.readingMinutes} min read</span>
            </span>
          </div>
        </header>

        {article.image && (
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[460px] rounded-2xl overflow-hidden border border-white/[0.08] bg-white/[0.02]">
            <Image
              src={article.image}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />
          </div>
        )}

        <div className="max-w-2xl space-y-6">
          {renderBodyParagraphs(article.body)}
        </div>

        {article.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-white/[0.06]">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
              Tagged
            </span>
            {article.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="inline-flex items-center px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-[11px] font-mono text-[#A1A1A1] hover:text-white hover:border-white/20 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}

        {/* Explore Music Destinations Cross-Links */}
        <section aria-label="Explore Music on GULLYGANG" className="space-y-4 pt-8 border-t border-white/[0.06]">
          <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
              Explore The Sound
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/artists"
              className="group flex items-center space-x-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <Users className="w-4 h-4 text-[#A1A1A1] group-hover:text-white transition-colors" />
              <div>
                <p className="text-sm font-bold text-white group-hover:underline">Artist Directory</p>
                <p className="text-xs text-[#8F8F8F]">Profiles & discographies</p>
              </div>
            </Link>
            <Link
              href="/charts"
              className="group flex items-center space-x-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <Radio className="w-4 h-4 text-[#A1A1A1] group-hover:text-white transition-colors" />
              <div>
                <p className="text-sm font-bold text-white group-hover:underline">Trending Charts</p>
                <p className="text-xs text-[#8F8F8F]">Top Indian & global rap</p>
              </div>
            </Link>
            <Link
              href="/albums"
              className="group flex items-center space-x-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <Disc3 className="w-4 h-4 text-[#A1A1A1] group-hover:text-white transition-colors" />
              <div>
                <p className="text-sm font-bold text-white group-hover:underline">New Releases</p>
                <p className="text-xs text-[#8F8F8F]">Latest albums & EPs</p>
              </div>
            </Link>
          </div>
        </section>

        {relatedArtists.length > 0 && (
          <section aria-label="Related Artists" className="space-y-4 pt-8 border-t border-white/[0.06]">
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
                Related Artists
              </span>
            </div>
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedArtists.map((artist) => (
                <li key={artist.id}>
                  <Link
                    href={`/artist/${encodeURIComponent(artist.id)}`}
                    className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.05] transition-colors"
                  >
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8F8F8F]">
                      {artist.region === 'india' ? 'Desi Hip-Hop' : 'Global Rap'}
                    </p>
                    <p className="mt-2 text-sm font-bold text-white group-hover:underline">
                      {artist.name}
                    </p>
                    {artist.moniker && (
                      <p className="mt-1 text-xs text-[#A1A1A1] line-clamp-1">{artist.moniker}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {relatedByTag.length > 0 && (
          <section aria-label="Related Articles" className="space-y-4 pt-8 border-t border-white/[0.06]">
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
                Related Articles
              </span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {relatedByTag.map((rel) => (
                <li key={rel.slug}>
                  <Link
                    href={`/blog/${rel.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8F8F8F]">
                        {rel.heroEyebrow}
                      </p>
                      <h3 className="text-base sm:text-lg font-bold text-white group-hover:underline">
                        {rel.title}
                      </h3>
                    </div>
                    <span className="text-[11px] font-mono text-[#8F8F8F] shrink-0">
                      {formatDate(rel.publishedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {nextArticle && nextArticle.slug !== article.slug && (
          <nav aria-label="More from Editorial" className="pt-8 border-t border-white/[0.06]">
            <Link
              href={`/blog/${nextArticle.slug}`}
              className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.05] transition-colors"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
                  Next in Editorial
                </p>
                <p className="text-base sm:text-lg font-bold text-white group-hover:underline truncate">
                  {nextArticle.title}
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-white shrink-0" />
            </Link>
          </nav>
        )}

        <div className="pt-2">
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>All Editorial</span>
          </Link>
        </div>
      </article>
    </>
  );
}
