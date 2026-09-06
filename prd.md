# GULLYGANG — Product Requirements Document (PRD)

**Product:** GULLYGANG
**Category:** Premium Music Discovery & Player
**Platform:** Web (Desktop + Mobile Responsive)
**Primary focus:** Indian Rap + International Rap
**Frontend:** Next.js + TypeScript
**Backend/Data:** InsForge
**Music metadata/discovery:** `ytmusicapi` via a server-side Python service
**Development environment:** Antigravity IDE
**Authentication:** None for V1
**Business goal:** High-quality music discovery experience with SEO-driven traffic and carefully integrated advertising.

---

# 1. Product Vision

GULLYGANG is a **premium, music-first web platform focused on rap and hip-hop discovery**.

The product should feel like a professionally designed music application—not a generic website, AI-generated interface, template, dashboard, or clone of another service.

The platform focuses on:

* Indian Rap 🇮🇳
* International Rap 🌍
* Artist discovery
* Song discovery
* Albums and releases
* Daily featured rapper
* Daily featured song
* Trending music
* Charts
* Persistent music player

The design philosophy is:

> **Music first. Content second. Interface last.**

The interface should disappear into the experience and allow artwork, artists and music to be the primary focus.

---

# 2. Product Goals

## Primary Goals

### G1 — Premium Experience

Create an interface that feels:

* Intentional
* Editorial
* Premium
* Minimal
* Fast
* Original
* Professionally designed

---

### G2 — Music Discovery

Help visitors discover:

* New rappers
* Popular rappers
* Songs
* Albums
* Singles
* Trending music
* Indian hip-hop
* International hip-hop

---

### G3 — Daily Engagement

Encourage visitors to return through:

**Daily Featured Rapper**

and

**Daily Featured Song**

These must automatically change every day.

---

### G4 — SEO Traffic

Generate organic traffic through indexable pages for:

* Artists
* Songs
* Albums
* Playlists
* Charts
* Genres

---

### G5 — Monetization

Support advertising without damaging the premium experience.

Ads must:

* Be clearly separated from player controls
* Not interrupt playback controls
* Avoid excessive layout shifts
* Remain responsive
* Be placed strategically

---

# 3. Non-Goals (V1)

The first version will NOT include:

* User login
* User registration
* Passwords
* User profiles
* Social networking
* Comments
* Messaging
* AI chatbot
* AI music generation
* Complex recommendation ML
* Native mobile apps

Future versions can add these if required.

---

# 4. Target Audience

## Primary Audience

People interested in:

* Indian Hip-Hop
* Desi Hip-Hop
* Rap
* Trap
* Drill
* Underground music
* International Hip-Hop

---

## User Types

### Casual Listener

Visits GULLYGANG to:

* Find songs
* Play music
* Discover artists
* Browse trending releases

### Hip-Hop Fan

Visits frequently to:

* Follow new releases
* Discover underground artists
* Explore artist profiles
* Check daily features

### Search Visitor

Arrives from search engines directly on:

* Artist pages
* Song pages
* Album pages
* Lyrics pages
* Charts

The page should encourage them to explore more of GULLYGANG.

---

# 5. Brand

## Brand Name

# GULLYGANG

The name should be visually strong.

Example typography treatment:

```text
GULLYGANG
```

The logo should work in:

* Desktop navigation
* Mobile navigation
* Browser favicon
* Social previews

---

## Brand Personality

GULLYGANG is:

* Confident
* Cultural
* Modern
* Premium
* Editorial
* Music-focused
* Minimal

GULLYGANG is not:

* Corporate
* Generic
* Overly playful
* AI-themed
* Over-designed
* Neon gaming-themed

---

# 6. Design Principles

## Principle 1 — Content Is the Interface

Artist photography and album artwork should do most of the visual work.

Avoid unnecessary decorative elements.

---

## Principle 2 — Space Creates Premium Feel

Use generous whitespace.

Do not fill every area with cards.

---

## Principle 3 — Typography Before Decoration

Strong typography should establish hierarchy.

Use:

```text
Large
Medium
Small
Metadata
```

instead of multiple unnecessary font styles.

---

## Principle 4 — Minimal Controls

Controls should only appear when useful.

---

## Principle 5 — Motion Should Feel Physical

Animations should:

* Be short
* Be smooth
* Support interaction

Avoid decorative animations.

---

# 7. Visual Design

## Primary Mode

Dark mode should be the main GULLYGANG experience.

```text
Background
#0A0A0A

Surface
#121212

Secondary Surface
#1A1A1A

Primary Text
#FFFFFF

Secondary Text
#A1A1A1

Border
rgba(255,255,255,0.08)
```

Colors should primarily come from:

* Album artwork
* Artist artwork

Optional dynamic accent extraction can be added later.

---

# 8. Responsive Breakpoints

```text
Mobile
0–767px

Tablet
768–1023px

Desktop
1024–1439px

Large Desktop
1440px+
```

The interface must be designed individually for mobile.

**Mobile must not be a squeezed desktop layout.**

---

# 9. Application Architecture

```text
                    USER
                      │
                      ▼
              GULLYGANG WEBSITE
                      │
                NEXT.JS APP
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
       INSFORGE              MUSIC SERVICE
          │                       │
          │                    PYTHON
          │                       │
          │                  ytmusicapi
          │                       │
          └───────────────┬───────┘
                          │
                    MUSIC DATA SOURCE
```

---

# 10. Frontend Stack

```text
Next.js
TypeScript
React
Tailwind CSS
```

Recommended additional tools:

```text
Framer Motion
TanStack Query
Zod
Lucide Icons
```

---

# 11. Backend Stack

## InsForge

Used for:

* Database
* Cached metadata
* Daily features
* Analytics data
* Content configuration

Authentication is not required for V1.

---

## Python Music Service

A separate service handles:

```text
Search
Artist information
Album information
Song metadata
Playlists
Charts
Lyrics
Recommendations
```

The browser must not communicate directly with the third-party music integration.

---

# 12. Music Provider Layer

Create a provider abstraction.

```text
MusicProvider

search()

getSong()

getArtist()

getAlbum()

getPlaylist()

getCharts()

getLyrics()

getArtistSongs()
```

Implementation:

```text
YouTubeMusicProvider
```

This ensures GULLYGANG is not tightly coupled to one integration.

---

# 13. Core Pages

## 13.1 Home

Route:

```text
/
```

Purpose:

Introduce users to:

* Indian Rap
* International Rap
* Daily artist
* Daily song
* Trending content

---

# 14. Homepage Layout

```text
HEADER

INDIAN RAP HERO

FEATURED INDIAN ARTISTS

TRENDING INDIAN RAP

DAILY FEATURE

FEATURED SONG OF THE DAY

INTERNATIONAL RAP

FEATURED INTERNATIONAL ARTISTS

GLOBAL TRENDING

NEW RELEASES

EXPLORE RAP STYLES

SEO CONTENT

FOOTER

PERSISTENT PLAYER
```

---

# 15. Header

## Desktop

```text
GULLYGANG

Home
Indian Rap
Global Rap
Charts

                         Search
```

Sticky behavior:

* Transparent at top
* Subtle background when scrolling

---

## Mobile

```text
GULLYGANG        Search
```

Bottom navigation:

```text
Home
India
Global
Search
Charts
```

---

# 16. Indian Rap Hero

The first major visual section.

Purpose:

Immediately establish GULLYGANG's identity.

Structure:

```text
INDIAN RAP

The sound shaping a generation.

FEATURED ARTIST

Artist Name

Featured Track
Song Name

[ PLAY ]
```

Visual requirements:

* Large artist image
* Editorial composition
* No generic gradient background
* Responsive cropping
* Text remains readable

---

# 17. Featured Indian Artists

Horizontal layout.

Desktop:

```text
Artist  Artist  Artist  Artist  Artist
```

Mobile:

Horizontal scroll.

Artist card:

```text
Image

Artist Name

Artist
```

Hover:

* Subtle image zoom
* No dramatic movement

---

# 18. Trending Indian Rap

Song list format.

```text
01

Artwork

Song Name

Artist

Duration

Play
```

Desktop supports:

```text
Hover
Play button appears
```

Mobile supports:

```text
Tap to play
```

---

# 19. Daily Featured Rapper

This is a flagship GULLYGANG feature.

Label:

```text
THE DAILY FEATURE
```

Structure:

```text
Date

Artist Image

Artist Name

Short Description

TODAY'S TRACK

Artwork

Song Name

Play Track
```

---

# 20. Automatic Daily Rotation

The featured content changes once per calendar day.

## Requirements

The system automatically determines:

```text
Artist of the Day
Song of the Day
Artist Image
Song Artwork
Artist Description
```

---

## Selection Logic

Initial algorithm:

```text
currentDate
      ↓
Generate deterministic daily seed
      ↓
Select artist
      ↓
Select song
      ↓
Check recent selections
      ↓
Return daily feature
```

The same feature should be displayed to all users on the same day.

---

## Anti-Repetition

An artist should not repeat within:

```text
30 days
```

unless the artist pool is too small.

---

# 21. International Rap

Separate from Indian Rap.

Title:

```text
GLOBAL RAP
```

Sections:

* Featured artists
* Trending songs
* New releases

Possible categories:

```text
US Hip-Hop

UK Rap

Drill

Trap

Alternative Hip-Hop
```

---

# 22. Artist Page

Route:

```text
/artist/[id]
```

Layout:

```text
ARTIST IMAGE

ARTIST NAME

Genre

Description

[ PLAY ]

POPULAR

SONGS

ALBUMS

SINGLES

RELATED ARTISTS
```

---

## Artist Metadata

Store/cache:

```text
artist_id

name

description

image_url

genres

subscriber_count

top_songs

albums

singles
```

---

# 23. Song Page

Route:

```text
/song/[id]
```

Layout:

```text
LARGE ARTWORK

SONG NAME

ARTIST

ALBUM

PLAY

SONG INFORMATION

LYRICS

MORE FROM ARTIST

RELATED SONGS
```

---

# 24. Album Page

Route:

```text
/album/[id]
```

Layout:

```text
ALBUM ARTWORK

ALBUM NAME

ARTIST

YEAR

TRACK COUNT

PLAY

TRACK LIST
```

Track:

```text
Number

Song Name

Duration

Play
```

---

# 25. Search

Route:

```text
/search
```

Search categories:

```text
All

Songs

Artists

Albums

Playlists
```

Search behavior:

```text
User types
      ↓
Debounce
      ↓
Next.js API
      ↓
Music Service
      ↓
Results
```

---

# 26. Charts

Route:

```text
/charts
```

Charts include:

```text
Indian Rap

Global Rap

Trending

New Releases
```

Each chart:

```text
01 Song
02 Song
03 Song
04 Song
```

---

# 27. Persistent Music Player

The player must remain available throughout the website.

State should survive:

```text
Route changes
```

---

## Desktop Player

```text
Artwork

Song Name
Artist

Previous
Play/Pause
Next

Progress Bar

Volume

Queue
```

---

## Mobile Mini Player

```text
Artwork

Song Name

Play

Progress
```

Clicking expands the full player.

---

# 28. Full Mobile Player

```text
Artwork


Song Name

Artist


Progress


Previous

Play/Pause

Next


Shuffle

Repeat

Queue
```

---

# 29. Player Requirements

The player should support:

```text
Play

Pause

Next

Previous

Seek

Volume

Shuffle

Repeat

Queue
```

Optional future:

```text
Lyrics Sync
```

---

# 30. Player State

Global state:

```text
currentTrack

queue

isPlaying

currentTime

duration

volume

shuffle

repeat
```

Recommended:

```text
Zustand
```

---

# 31. API Structure

```text
/api/search

/api/song/[id]

/api/artist/[id]

/api/album/[id]

/api/playlist/[id]

/api/charts

/api/lyrics/[id]

/api/daily-feature
```

---

# 32. Daily Feature API

Response:

```json
{
  "date": "2026-09-05",
  "artist": {
    "id": "artist_id",
    "name": "Artist Name",
    "image": "image_url",
    "description": "Artist description"
  },
  "song": {
    "id": "song_id",
    "title": "Song Name",
    "artist": "Artist Name",
    "artwork": "artwork_url"
  }
}
```

---

# 33. Database Schema

## artists

```text
id
provider_id
name
description
image_url
region
created_at
updated_at
```

---

## songs

```text
id
provider_id
title
artist_id
album_id
artwork_url
duration
created_at
updated_at
```

---

## albums

```text
id
provider_id
title
artist_id
artwork_url
year
created_at
updated_at
```

---

## daily_features

```text
id

feature_date

artist_id

song_id

region

created_at
```

---

# 34. Caching

Music metadata should not always hit the third-party service.

Use:

```text
Request
   ↓
Check Cache
   ↓
Cache Hit → Return
   ↓
Cache Miss
   ↓
Music Provider
   ↓
Store Result
```

Recommended TTL:

```text
Search
15 minutes

Artist
24 hours

Album
24 hours

Song metadata
24 hours

Charts
6 hours

Daily Feature
24 hours
```

---

# 35. Performance Requirements

Target:

```text
Fast first load

Minimal JavaScript

Optimized images

Lazy loading

Cached APIs

Server rendering

Responsive UI
```

Important:

Do not load all homepage content at once.

Sections should use:

```text
Lazy images

Intersection Observer

Pagination where needed
```

---

# 36. SEO

GULLYGANG should be SEO-friendly.

Every indexable page needs:

```text
Title

Description

Open Graph image

Canonical URL
```

---

## Sitemap

Automatically include:

```text
Artists

Songs

Albums

Playlists

Charts
```

---

# 37. Structured Data

Where appropriate, support:

```text
MusicGroup

MusicRecording

MusicAlbum
```

Use JSON-LD generated server-side.

---

# 38. Advertising

Advertising must not interfere with:

```text
Music Player

Search

Navigation
```

Potential locations:

```text
Between homepage sections

Below search results

Within article/editorial content
```

Avoid:

```text
Ads directly beside play controls

Popups blocking playback

Automatic full-screen ads
```

---

# 39. Analytics

Track anonymous product events.

```text
Page view

Artist page view

Song play

Search

Daily feature interaction

Chart interaction
```

No authentication is required.

---

# 40. Error Handling

Every API request needs:

```text
Loading state

Empty state

Error state

Retry mechanism
```

Example:

```text
Unable to load music.

[ Try Again ]
```

---

# 41. Accessibility

Support:

```text
Keyboard navigation

ARIA labels

Visible focus states

Screen readers

Reduced motion

High contrast
```

Player controls must be keyboard accessible.

---

# 42. Security

The frontend must never expose:

```text
Provider credentials

Cookies

Internal service URLs

Secrets
```

All sensitive integrations remain server-side.

---

# 43. Folder Structure

```text
gullygang/

apps/
│
├── web/
│   │
│   ├── app/
│   │   ├── page.tsx
│   │   ├── search/
│   │   ├── artist/
│   │   ├── song/
│   │   ├── album/
│   │   ├── charts/
│   │   └── api/
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── player/
│   │   ├── music/
│   │   └── home/
│   │
│   ├── features/
│   │   ├── player/
│   │   ├── search/
│   │   └── daily-feature/
│   │
│   ├── lib/
│   │
│   └── store/
│
└── music-service/
    │
    ├── app/
    │
    ├── providers/
    │   └── youtube_music.py
    │
    ├── services/
    │
    ├── models/
    │
    └── requirements.txt
```

---

# 44. Development Phases

## Phase 1 — Foundation

Build:

```text
Next.js

TypeScript

Tailwind

Design System

Responsive Layout
```

---

## Phase 2 — Homepage

Build:

```text
Header

Indian Rap Hero

Indian Artists

Trending

Daily Feature

Global Rap

Footer
```

---

## Phase 3 — Player

Build:

```text
Global Player

Mini Player

Full Player

Queue

Progress

Volume
```

---

## Phase 4 — Music Integration

Build:

```text
Python API

ytmusicapi Provider

Search

Artist

Song

Album

Charts
```

---

## Phase 5 — InsForge

Build:

```text
Cached Music Data

Daily Feature

Content Tables

Analytics
```

---

## Phase 6 — SEO

Build:

```text
Metadata

Sitemap

Robots

Structured Data

Canonical URLs
```

---

## Phase 7 — Monetization

Add:

```text
Responsive Ad Slots

Analytics

Performance Monitoring
```

---

# 45. MVP Success Criteria

GULLYGANG V1 is complete when:

### Homepage

* Indian Rap section works
* Global Rap section works
* Artists load correctly
* Songs load correctly

### Daily Feature

* Artist automatically changes daily
* Song automatically changes daily
* Same content appears for all visitors that day
* Recent artists do not repeat unnecessarily

### Music

* Search works
* Artist pages work
* Album pages work
* Song pages work
* Player remains persistent

### Responsive

* Desktop polished
* Mobile polished
* Tablet supported

### Performance

* Images optimized
* API caching implemented
* No major layout shifts
* Player responsive

---

# Final Product Definition

**GULLYGANG is a premium, editorial-style rap music discovery and playback platform centered around Indian and international hip-hop.**

Its strongest differentiators are:

**🇮🇳 Indian Rap Discovery**
**🌍 Global Rap Discovery**
**⭐ A new featured rapper every day**
**🎵 A new featured song every day**
**🎧 A premium persistent music player**
**⚡ Fast, clean and responsive design**
**🔎 SEO-focused public music pages**

The key implementation principle is to keep the **music provider integration server-side and compliant with the applicable platform terms and content/licensing requirements**, while GULLYGANG's frontend, editorial curation, caching, discovery experience, and original UI remain fully under your control.

**Next step:** turn this PRD into the actual **GULLYGANG technical implementation plan**, starting with the exact Next.js project setup, InsForge schema, API contract, component tree, and page-by-page build order.
