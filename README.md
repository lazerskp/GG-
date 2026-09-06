# GULLYGANG

> **Music first. Content second. Interface last.**

GULLYGANG is a premium, editorial rap discovery and music player platform spotlighting **Indian Rap** (Desi Hip-Hop) and **Global Hip-Hop**. The platform combines magazine-style editorial curation with automated daily rapper spotlights, trending charts, new drops, live metadata discovery via [sigma67/ytmusicapi](https://github.com/sigma67/ytmusicapi), and a persistent cross-route audio player.

---

## Security & Architecture Overview

```
                      USER / BROWSER
                            │
                            ▼
                   GULLYGANG Next.js APP
                (App Router, React 19, TS)
                            │
          ┌─────────────────┴─────────────────┐
          ▼                                   ▼
   Next.js API / BFF                  Persistent Player
 (/api/search, /api/daily-feature)      (Decoupled Playback)
          │
    Layered Cache
 (Memory + InsForge)
          │
          ├───────────────────────────────────┐
          ▼                                   ▼
  InsForge Database                  Python Metadata Service
(PostgreSQL Schema)                 (FastAPI Microservice)
          │                                   │
          │                              ytmusicapi
          │                       (sigma67/ytmusicapi)
          │                       Public Metadata Only
          └─────────────────┬─────────────────┘
                            ▼
                    NORMALIZED CATALOG
```

### Critical Security Policies & Secret Rotation Notice

> [!CAUTION]
> **COMPROMISED CREDENTIAL ROTATION REQUIREMENT:**
> Any previously exposed credentials (including InsForge user API keys or admin service keys) must be rotated by the project owner in the InsForge dashboard outside this repository. Never commit real keys or reuse exposed credentials.

1. **Client vs Server Variables**:
   - Variables prefixed with `NEXT_PUBLIC_` are bundled into browser client code.
   - All other variables (`INSFORGE_API_KEY`, `MUSIC_SERVICE_API_KEY`) are strictly **SERVER-ONLY** and protected by `import 'server-only'`.
   - The browser never receives database admin keys or provider credentials.
2. **Exclusion from Git**:
   - `.env*` (except `.env.example`), `oauth.json`, `browser.json`, `*.pem`, `*.key`, `service-account*.json`, and `.insforge/` are strictly ignored in `.gitignore`.
3. **HTTP Security Headers**:
   - Production responses enforce strict Content-Security-Policy (CSP), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and `Permissions-Policy`.
4. **Structured Logging Sanitization**:
   - `serverLogger` automatically redacts Bearer tokens, cookies, authorization headers, and API keys matching credential patterns.
5. **Zero Audio Stream Extraction Compliance**:
   - GULLYGANG strictly uses `ytmusicapi` for public discovery and metadata (artist profiles, tracklists, release dates, durations, and charts).
   - Strictly **zero** audio downloading, stream ripping, decryption, or YouTube access bypass is implemented.

---

## Production Data Flow & Mock Data Elimination

- **Production Mode (`USE_DEV_FIXTURES=false`)**:
  - The application queries the live InsForge database and Python `ytmusicapi` metadata microservice.
  - Fake mock data is **strictly eliminated** from the production data path.
  - If upstream services or the database are unavailable, the UI presents clean, premium empty/retry states rather than fabricating synthetic data.
- **Development Fixtures Mode (`USE_DEV_FIXTURES=true`)**:
  - Gated exclusively for isolated local development without internet connectivity or before database seeding.

---

## Core Systems & Features

1. **Editorial Homepage**
   - **Indian Rap Hero**: Cinematic banner spotlighting marquee records with 1-click play and live artist metadata.
   - **Featured Indian Artists**: Minimal circular artist cards with responsive desktop grid and mobile horizontal scroll snap.
   - **Trending Indian Rap**: Clean library-style tracklist with rank numbers that swap with play controls on hover.
   - **The Daily Feature**: Signature daily magazine spread with featured rapper of the day, editorial quote, and today's essential track backed by InsForge database persistence and a 30-day anti-repeat guarantee.
   - **Global Rap Section**: Dedicated chapter featuring international heavyweights (Kendrick Lamar, Travis Scott, Central Cee, J. Cole).
   - **New Releases**: Album and single artwork cards with quick-play hover action.
   - **Explore Styles**: Minimal typography-led subgenre pills (Desi Hip-Hop, Drill, Trap, Underground, Boom Bap).
   - **Instant Search**: Debounced search with `⌘K` shortcut, live Python `ytmusicapi` query pipeline, request cancellation (`AbortController`), and 15-minute caching.

2. **Persistent Audio Player**
   - **Desktop Player**: Docked bottom bar with custom scrubber, timestamps, play/pause, shuffle, repeat modes, volume slider, and queue view.
   - **Mobile Mini-Player**: Floats above bottom navigation with top progress indicator.
   - **Fullscreen Mobile Player**: Slide-up full-screen sheet with album artwork and complete playback controls.

---

## Environment Configuration

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

### Environment Variables

| Variable | Scope | Description | Default / Example |
|---|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Public Client | Base application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_INSFORGE_URL` | Public Client | InsForge public project URL | `https://your-project.region.insforge.app` |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Public Client | Public client anonymous key | `anon_placeholder_key` |
| `INSFORGE_URL` | Server Only | InsForge database REST URL | `https://your-project.region.insforge.app` |
| `INSFORGE_API_KEY` | Server Only | Secret admin service key | `ik_placeholder_secret` |
| `MUSIC_SERVICE_URL` | Server Only | Python metadata service endpoint | `http://localhost:8001` |
| `MUSIC_SERVICE_API_KEY` | Server Only | Internal shared service key | `your_shared_secret` |
| `USE_DEV_FIXTURES` | Server Only | Development fixtures gate (`true`/`false`) | `false` |
| `CACHE_ENABLED` | Server Only | Enable/disable server-side caching | `true` |
| `RATE_LIMIT_ENABLED` | Server Only | Enable/disable API rate limiting | `true` |

---

## Setup & Running Locally

### 1. Python Metadata Microservice (`music-service/`)
Uses the official [sigma67/ytmusicapi](https://github.com/sigma67/ytmusicapi) package:

```bash
cd music-service
# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start metadata microservice on port 8001
uvicorn app.main:app --host 127.0.0.1 --port 8001
```

Verify health:
```bash
curl -s http://127.0.0.1:8001/health
```

### 2. Next.js Frontend & BFF
```bash
# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Run production build
npm run build

# Run linting check
npm run lint

# Run type check
npx tsc --noEmit
```

### 3. Live Catalog Synchronization
Sync live metadata from the Python `ytmusicapi` service into InsForge:

```bash
node scripts/syncCatalog.mjs
```

---

## Next.js API Routes

- `GET /api/search?q={query}` — Debounced live `ytmusicapi` discovery with 15m caching, rate limiting, and InsForge persistence
- `GET /api/artists?region=india|global` — Query artists from InsForge database
- `GET /api/artists/[id]` — Artist profile with 24h caching
- `GET /api/songs/[id]` — Song metadata with 24h caching
- `GET /api/albums/[id]` — Album tracklist with 24h caching
- `GET /api/charts?region=india|global` — Regional charts with 6h caching
- `GET /api/daily-feature` — Atomic database-backed daily feature with 30-day anti-repeat guarantee

---

## Verification & Validation Summary

- **Production Build**: Clean pass with 0 errors (`npm run build`)
- **TypeScript**: Strict compilation with 0 errors (`npx tsc --noEmit`)
- **ESLint**: Clean pass with 0 errors and 0 warnings (`npm run lint`)
- **Python Compilation**: All 11 Python microservice modules compile with 0 syntax errors
- **Security Audit**: All credentials segregated into untracked `.env.local`; secrets redacted in logs; CSP and security headers active.
