import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getAllArticles } from '@/data/editorial/articles';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function EditorialSpotlight() {
  const articles = getAllArticles().slice(0, 3);
  if (articles.length === 0) return null;

  return (
    <section id="editorial" className="mb-14 sm:mb-20" aria-label="Editorial & Scene Reports">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[11px] font-mono tracking-[0.2em] text-[#8F8F8F] uppercase font-semibold mb-1">
            SCENE REPORTS & EDITORIAL
          </p>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-white">
            Culture & Craft
          </h2>
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#A1A1A6] hover:text-white transition-colors uppercase tracking-wider group"
        >
          <span>All Editorial</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3-Column Story Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="group block rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
          >
            {article.image && (
              <div className="relative w-full aspect-[16/9] overflow-hidden bg-white/[0.02]">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-50" />
              </div>
            )}
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#8F8F8F]">
                <span>{article.heroEyebrow}</span>
                <span>{article.readingMinutes} min read</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white group-hover:underline line-clamp-2 leading-snug">
                {article.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#A1A1A1] line-clamp-2 leading-relaxed">
                {article.description}
              </p>
              <div className="pt-2 flex items-center justify-between text-[11px] font-mono text-[#636366]">
                <span>{formatDate(article.publishedAt)}</span>
                <span className="text-white group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
