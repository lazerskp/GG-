import React from 'react';
import type { Metadata } from 'next';
import { ChartsView } from '@/components/charts/ChartsView';
import { WebPageJsonLd } from '@/components/seo/JsonLd';

export const metadata: Metadata = {
  title: 'Charts',
  description:
    'Live trending hip-hop charts for India and Global — discover the hottest tracks in Indian rap, Desi Hip-Hop, and international hip-hop.',
  alternates: {
    canonical: '/charts',
  },
  openGraph: {
    title: 'Charts — GULLYGANG',
    description: 'Live trending hip-hop charts for India and Global.',
    type: 'website',
    url: '/charts',
  },
  twitter: {
    card: 'summary',
    title: 'Charts — GULLYGANG',
    description: 'Live trending hip-hop charts for India and Global.',
  },
};

export default function ChartsPage() {
  return (
    <>
      <WebPageJsonLd
        url="/charts"
        name="Charts — GULLYGANG"
        description="Live trending hip-hop charts for India and Global."
      />
      <ChartsView />
    </>
  );
}
