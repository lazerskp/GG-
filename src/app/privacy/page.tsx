import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Read the GULLYGANG privacy policy to understand how we handle your data, local storage, and third-party services.',
  openGraph: {
    title: 'Privacy Policy — GULLYGANG',
    description:
      'How GULLYGANG handles your data, local storage, and third-party services.',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-2xl mx-auto space-y-12 py-8 sm:py-12">
      {/* Header */}
      <header className="space-y-4">
        <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#8F8F8F]">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
          Privacy Policy
        </h1>
        <p className="text-xs text-[#8F8F8F]">
          Last updated: September 2026
        </p>
      </header>

      {/* Table of Contents */}
      <nav aria-label="Table of contents" className="space-y-2">
        <p className="text-xs font-bold text-[#A1A1A1] uppercase tracking-wider">
          Contents
        </p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-[#8F8F8F]">
          <li><a href="#overview" className="hover:text-white transition-colors">Overview</a></li>
          <li><a href="#information-we-collect" className="hover:text-white transition-colors">Information We Collect</a></li>
          <li><a href="#local-storage" className="hover:text-white transition-colors">Local Storage</a></li>
          <li><a href="#cookies" className="hover:text-white transition-colors">Cookies</a></li>
          <li><a href="#third-party-services" className="hover:text-white transition-colors">Third-Party Services</a></li>
          <li><a href="#data-security" className="hover:text-white transition-colors">Data Security</a></li>
          <li><a href="#childrens-privacy" className="hover:text-white transition-colors">Children&apos;s Privacy</a></li>
          <li><a href="#changes" className="hover:text-white transition-colors">Changes to This Policy</a></li>
          <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
        </ol>
      </nav>

      {/* Sections */}
      <section id="overview" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          1. Overview
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG is a music discovery and listening platform. This privacy
          policy explains how we handle information when you use our service.
          We are committed to respecting your privacy and being transparent
          about our data practices.
        </p>
      </section>

      <section id="information-we-collect" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          2. Information We Collect
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG does not require user accounts, registration, or login.
          We do not collect personal information such as names, email
          addresses, phone numbers, or payment details.
        </p>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          We do not use analytics, advertising, or tracking scripts. No
          personally identifiable information is transmitted to our servers.
        </p>
      </section>

      <section id="local-storage" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          3. Local Storage
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG uses your browser&apos;s <code className="text-white/80 bg-white/5 px-1.5 py-0.5 rounded text-xs">localStorage</code> to
          persist your playback preferences locally on your device. This data
          never leaves your browser. The following keys are stored:
        </p>
        <ul className="space-y-2 text-sm text-[#A1A1A1]">
          <li className="flex items-start gap-2">
            <code className="text-white/70 bg-white/5 px-1.5 py-0.5 rounded text-xs shrink-0">gullygang_volume</code>
            <span>Your preferred volume level</span>
          </li>
          <li className="flex items-start gap-2">
            <code className="text-white/70 bg-white/5 px-1.5 py-0.5 rounded text-xs shrink-0">gullygang_shuffle</code>
            <span>Whether shuffle mode is enabled</span>
          </li>
          <li className="flex items-start gap-2">
            <code className="text-white/70 bg-white/5 px-1.5 py-0.5 rounded text-xs shrink-0">gullygang_repeat</code>
            <span>Your repeat mode preference (off, all, or one)</span>
          </li>
          <li className="flex items-start gap-2">
            <code className="text-white/70 bg-white/5 px-1.5 py-0.5 rounded text-xs shrink-0">gullygang_queue</code>
            <span>Your current playback queue (restored on revisit)</span>
          </li>
          <li className="flex items-start gap-2">
            <code className="text-white/70 bg-white/5 px-1.5 py-0.5 rounded text-xs shrink-0">gullygang_current_index</code>
            <span>The position of the currently playing track in the queue</span>
          </li>
        </ul>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          You can clear this data at any time by clearing your browser&apos;s
          local storage or site data.
        </p>
      </section>

      <section id="cookies" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          4. Cookies
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG does not set cookies directly. However, the embedded
          YouTube IFrame Player (used for audio playback) may set cookies as
          part of YouTube&apos;s own privacy and service policies. These cookies
          are controlled by Google and are subject to{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/80 underline underline-offset-2 hover:text-white transition-colors"
          >
            Google&apos;s Privacy Policy
          </a>.
        </p>
      </section>

      <section id="third-party-services" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          5. Third-Party Services
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG integrates with the following third-party services:
        </p>
        <ul className="space-y-3 text-sm text-[#A1A1A1]">
          <li>
            <strong className="text-white/90">YouTube IFrame Player API</strong> — Used
            for audio playback. Subject to{' '}
            <a
              href="https://www.youtube.com/t/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 underline underline-offset-2 hover:text-white transition-colors"
            >
              YouTube Terms of Service
            </a>{' '}
            and Google&apos;s Privacy Policy.
          </li>
          <li>
            <strong className="text-white/90">LRCLIB</strong> — Used
            to retrieve song lyrics. Lyrics are fetched server-side and no
            user data is sent to LRCLIB.
          </li>
          <li>
            <strong className="text-white/90">InsForge</strong> — Used
            as a server-side backend for caching, catalog management, and
            daily feature generation. No personal user data is stored in
            InsForge.
          </li>
        </ul>
      </section>

      <section id="data-security" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          6. Data Security
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          Since GULLYGANG does not collect personal information, there is
          minimal data security risk to users. All communication between your
          browser and our servers uses HTTPS encryption. Playback preferences
          are stored locally in your browser and are not transmitted to us.
        </p>
      </section>

      <section id="childrens-privacy" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          7. Children&apos;s Privacy
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          GULLYGANG does not knowingly collect information from children under
          13. Since we do not require accounts or collect personal data, we do
          not process children&apos;s information. Music content is sourced from
          YouTube and is subject to YouTube&apos;s content policies.
        </p>
      </section>

      <section id="changes" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          8. Changes to This Policy
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          We may update this privacy policy from time to time. Changes will
          be reflected on this page with an updated date. We encourage you to
          review this page periodically.
        </p>
      </section>

      <section id="contact" className="space-y-3">
        <h2 className="text-lg font-bold text-white tracking-tight">
          9. Contact
        </h2>
        <p className="text-sm text-[#A1A1A1] leading-relaxed">
          If you have questions about this privacy policy, please contact us
          at{' '}
          <a
            href="mailto:contact@gullygang.com"
            className="text-white/80 underline underline-offset-2 hover:text-white transition-colors"
          >
            contact@gullygang.com
          </a>.
        </p>
      </section>
    </article>
  );
}
