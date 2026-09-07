import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import {
  getAllTags,
  getTagSummary,
  isTagIndexable,
} from '@/data/editorial/articles';

interface TagPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllTags().map((slug) => ({ slug }));
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gullygang.in').replace(/\/$/, '');

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const { slug } = await params;
  const summary = getTagSummary(slug);
  if (!summary) {
    return {
      title: 'Tag Not Found | GULLYGANG',
      description: 'The requested topic archive could not be found on GULLYGANG.',
      robots: {
        index: false,
        follow: true,
        googleBot: { index: false, follow: true },
      },
    };
  }

  const tagName = summary.slug.replace(/-/g, ' ');
  const formattedTagName = tagName.charAt(0).toUpperCase() + tagName.slice(1);
  const canonicalUrl = `${SITE_URL}/blog/tag/${summary.slug}`;

  // Thin taxonomy archives must not bloat indexation, but links must remain followable
  return {
    title: {
      absolute: `${formattedTagName} — Topic Archive | GULLYGANG`,
    },
    description: summary.description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    openGraph: {
      type: 'website',
      title: `${formattedTagName} — GULLYGANG Editorial Topic`,
      description: summary.description,
      url: canonicalUrl,
      siteName: 'GULLYGANG',
    },
    twitter: {
      card: 'summary',
      title: `${formattedTagName} — GULLYGANG Editorial Topic`,
      description: summary.description,
    },
    other: {
      'x-robots-tag': 'noindex, follow',
    },
  };
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = await params;
  const summary = getTagSummary(slug);
  if (!summary) {
    notFound();
  }

  const indexable = isTagIndexable(summary);

  return (
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
          <li className="text-[#8F8F8F]">Topics</li>
          <li aria-hidden="true">/</li>
          <li className="text-white">{summary.slug}</li>
        </ol>
      </nav>

      <header className="space-y-4 max-w-3xl">
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
          Tag · {summary.count} {summary.count === 1 ? 'article' : 'articles'}
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white capitalize leading-[1.05]">
          {summary.slug.replace(/-/g, ' ')}
        </h1>
        <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed">
          {summary.description}
        </p>
        {!indexable && (
          <p className="text-xs font-mono text-[#636366] pt-2">
            This tag archive is currently a low-value page and is excluded from search indexing.
          </p>
        )}
      </header>

      <section aria-label={`Articles tagged ${summary.slug}`} className="space-y-4">
        <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
            Articles
          </span>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {summary.articles.map((article) => (
            <li key={article.slug}>
              <Link
                href={`/blog/${article.slug}`}
                className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-5"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8F8F8F]">
                    {article.heroEyebrow}
                  </p>
                  <h2 className="text-base sm:text-xl font-bold text-white group-hover:underline">
                    {article.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed line-clamp-2 max-w-2xl">
                    {article.description}
                  </p>
                </div>
                <div className="flex items-center space-x-3 text-[11px] font-mono text-[#8F8F8F] shrink-0">
                  <span>{formatDate(article.publishedAt)}</span>
                  <span>·</span>
                  <span>{article.readingMinutes} min</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="pt-2">
        <Link
          href="/blog"
          className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Editorial</span>
        </Link>
        {indexable && (
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors ml-6"
          >
            <span>Browse Topics</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </article>
  );
}
