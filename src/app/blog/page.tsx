import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getAllArticles, getAllTagSummaries } from '@/data/editorial/articles';
import { WebPageJsonLd, ItemListJsonLd } from '@/components/seo/JsonLd';

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://gullygang.in').replace(/\/$/, '');

export const metadata: Metadata = {
  title: {
    absolute: 'Blog & Editorial — Indian Hip-Hop, Desi Rap Culture & Scene Reports | GULLYGANG',
  },
  description:
    'In-depth essays, scene reports, producer notes, and industry analysis covering Indian Hip-Hop, Desi rap production, underground rap movements, and independent music culture.',
  alternates: {
    canonical: `${SITE_URL}/blog`,
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
    type: 'website',
    title: 'Blog & Editorial — Indian Hip-Hop, Desi Rap Culture & Scene Reports | GULLYGANG',
    description:
      'Long-form essays, scene reports, and craft notes covering Desi Hip-Hop, underground rap artists, 808 sound design, and indie record economics.',
    url: `${SITE_URL}/blog`,
    siteName: 'GULLYGANG',
    images: [
      {
        url: `${SITE_URL}/icon.svg`,
        width: 512,
        height: 512,
        alt: 'GULLYGANG Editorial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Editorial — Indian Hip-Hop, Desi Rap Culture & Scene Reports | GULLYGANG',
    description:
      'Long-form essays and scene reports covering Indian hip-hop, underground rap, beat architecture, and indie music business.',
  },
};

export default function EditorialHubPage() {
  const articles = getAllArticles();
  const featured = articles.find((a) => a.featured) ?? articles[0];
  const rest = articles.filter((a) => a.slug !== featured.slug);
  // Show top topics with multiple stories for navigation
  const tags = getAllTagSummaries().filter((t) => t.count >= 2).slice(0, 6);

  return (
    <>
      <WebPageJsonLd
        url="/blog"
        name="Blog & Editorial — Indian Hip-Hop, Desi Rap Culture & Scene Reports | GULLYGANG"
        description="In-depth essays, scene reports, producer notes, and industry analysis covering Indian Hip-Hop, Desi rap production, underground rap movements, and independent music culture."
      />
      <ItemListJsonLd
        url="/blog"
        name="Editorial Articles on Indian Hip-Hop"
        items={articles.map((article, idx) => ({
          name: article.title,
          url: `${SITE_URL}/blog/${article.slug}`,
          position: idx + 1,
        }))}
      />

      <article className="space-y-12 sm:space-y-16 py-6 sm:py-10">
        {/* Main Header */}
        <header className="space-y-4 max-w-3xl">
          <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
            Editorial & Scene Reports
          </p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-[1.05]">
            Writing on Indian hip-hop, from the studio to the scene.
          </h1>
          <p className="text-base sm:text-lg text-[#A1A1A1] leading-relaxed">
            Essays, craft notes, and scene reports covering Desi rap production,
            the independent label ecosystem, underground MCs, and the cities driving
            the sound forward. No listicles, no fake statistics — just the work.
          </p>
        </header>

        {/* Editorial Mission & Coverage Overview */}
        <section aria-label="Coverage and Perspectives" className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-[#A1A1A1]">
              Coverage & Perspectives
            </h2>
            <p className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Documenting the cultural and sonic architecture of Desi Rap.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-white/[0.06]">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-[13px]">
                Indian Hip-Hop & Street Origins
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed">
                From Mumbai chawls to Delhi neighborhoods and Bengaluru cyphers, we trace how vernacular rhyme, regional identity, and grassroots energy established Desi Hip-Hop as a dominant cultural force.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-[13px]">
                Production & Sound Design
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed">
                Inside the studio: analyzing sliding 808 sub-bass engineering, localized drill syncopations, bilingual cadence modulation, and how producers tailor electronic beat craft to Indian languages.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-[13px]">
                Underground & Music Business
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A1A1] leading-relaxed">
                Investigating master rights ownership, self-run indie imprints, touring economics, and the sustainable underground movements operating with integrity outside the algorithmic playlist machinery.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Story */}
        {featured && (
          <section aria-label="Featured Story" className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
                Featured Story
              </span>
            </div>
            <Link
              href={`/blog/${featured.slug}`}
              className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-10 transition-colors hover:bg-white/[0.04]"
            >
              <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#A1A1A1]">
                {featured.heroEyebrow}
              </p>
              <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight group-hover:underline">
                {featured.title}
              </h2>
              <p className="mt-4 text-sm sm:text-base text-[#A1A1A1] leading-relaxed max-w-3xl">
                {featured.description}
              </p>
              <div className="mt-6 flex items-center justify-between text-xs font-mono text-[#8F8F8F]">
                <span>{formatDate(featured.publishedAt)} · {featured.readingMinutes} min read</span>
                <span className="inline-flex items-center space-x-1.5 text-white">
                  <span>Read Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </section>
        )}

        {/* Latest Stories List */}
        {rest.length > 0 && (
          <section aria-label="Latest Stories" className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
                Latest Stories
              </span>
            </div>
            <ul className="divide-y divide-white/[0.06]">
              {rest.map((article) => (
                <li key={article.slug}>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-5 transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8F8F8F]">
                        {article.heroEyebrow}
                      </p>
                      <h3 className="text-base sm:text-xl font-bold text-white tracking-tight group-hover:underline">
                        {article.title}
                      </h3>
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
        )}

        {/* Topics Section */}
        {tags.length > 0 && (
          <section aria-label="Topics" className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
                Topics & Categories
              </span>
            </div>
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li key={tag.slug}>
                  <Link
                    href={`/blog/tag/${tag.slug}`}
                    className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-medium text-[#A1A1A1] hover:text-white hover:border-white/20 transition-colors"
                  >
                    <span>{tag.slug}</span>
                    <span className="text-[#8F8F8F] font-mono">· {tag.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
