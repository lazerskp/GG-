import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gullygang.in';

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  // Accessibility: maximum-scale/user-scalable intentionally omitted so users can zoom.
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "GULLYGANG — Music Discovery & Immersive Listening",
    template: "%s | GULLYGANG",
  },
  description:
    "A modern music discovery and listening platform for Indian rap, Desi Hip-Hop, and global sounds. Featuring immersive playback, real-time synced lyrics, and editorial curation.",
  applicationName: "GULLYGANG",
  keywords: [
    "Music Discovery",
    "Indian Rap",
    "Desi Hip-Hop",
    "Music Player",
    "Immersive Playback",
    "Synced Lyrics",
    "GULLYGANG",
    "Hindi Music",
    "Global Rap",
  ],
  authors: [{ name: "GULLYGANG" }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    siteName: "GULLYGANG",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0A0A] text-white antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
