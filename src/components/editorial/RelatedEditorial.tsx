import React from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { EditorialArticle } from '@/data/editorial/articles';

interface RelatedEditorialProps {
  articles: EditorialArticle[];
  heading?: string;
  variant?: 'default' | 'compact';
  showIcon?: boolean;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function RelatedEditorial({
  articles,
  heading = 'Related Editorial',
  variant = 'default',
  showIcon = true,
}: RelatedEditorialProps) {
  if (articles.length === 0) return null;

  if (variant === 'compact') {
    return (
      <section aria-label={heading} className="space-y-4 pt-8 border-t border-white/[0.06]">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center space-x-2">
            {showIcon && <BookOpen className="w-4 h-4 text-white" />}
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
              {heading}
            </span>
          </div>
          <Link
            href="/blog"
            className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors flex items-center space-x-1.5 group"
          >
            <span>All Editorial</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <ul className="divide-y divide-white/[0.06]">
          {articles.slice(0, 3).map((article) => (
            <li key={article.slug}>
              <Link
                href={`/blog/${article.slug}`}
                className="group flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 py-4"
              >
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#8F8F8F]">
                    {article.heroEyebrow}
                  </p>
                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:underline">
                    {article.title}
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-[#8F8F8F] shrink-0">
                  {formatDate(article.publishedAt)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section aria-label={heading} className="space-y-4 pt-8 border-t border-white/[0.06]">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
        <div className="flex items-center space-x-2">
          {showIcon && <BookOpen className="w-4 h-4 text-white" />}
          <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white">
            {heading}
          </span>
        </div>
        <Link
          href="/blog"
          className="text-[11px] font-mono uppercase tracking-wider text-[#A1A1A1] hover:text-white transition-colors flex items-center space-x-1.5 group"
        >
          <span>Editorial Hub</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {articles.slice(0, 3).map((article) => (
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
  );
}
