-- ==============================================================================
-- GULLYGANG Database Schema for InsForge (PostgreSQL compatible)
-- Version: 1.0.0
-- Description: Core metadata, persistent daily features, and layered cache tables
-- ==============================================================================

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. ARTISTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS artists (
    id VARCHAR(64) PRIMARY KEY,
    provider VARCHAR(32) NOT NULL DEFAULT 'custom',
    provider_id VARCHAR(128),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    region VARCHAR(16) NOT NULL CHECK (region IN ('india', 'global')),
    genres TEXT[] DEFAULT '{}',
    monthly_listeners VARCHAR(64),
    verified BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_artists_region ON artists(region);
CREATE INDEX IF NOT EXISTS idx_artists_provider ON artists(provider, provider_id);

-- ------------------------------------------------------------------------------
-- 2. ALBUMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS albums (
    id VARCHAR(64) PRIMARY KEY,
    provider VARCHAR(32) NOT NULL DEFAULT 'custom',
    provider_id VARCHAR(128),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    artist_id VARCHAR(64) NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    artwork_url TEXT NOT NULL,
    release_date DATE,
    release_year INT,
    album_type VARCHAR(16) NOT NULL DEFAULT 'album' CHECK (album_type IN ('album', 'ep', 'single')),
    track_count INT NOT NULL DEFAULT 1,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_albums_artist_id ON albums(artist_id);
CREATE INDEX IF NOT EXISTS idx_albums_release_year ON albums(release_year DESC);

-- ------------------------------------------------------------------------------
-- 3. SONGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS songs (
    id VARCHAR(64) PRIMARY KEY,
    provider VARCHAR(32) NOT NULL DEFAULT 'custom',
    provider_id VARCHAR(128),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    artist_id VARCHAR(64) NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    album_id VARCHAR(64) REFERENCES albums(id) ON DELETE SET NULL,
    artwork_url TEXT NOT NULL,
    duration_seconds INT NOT NULL DEFAULT 0,
    release_date DATE,
    genre VARCHAR(64),
    trending_rank INT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_songs_artist_id ON songs(artist_id);
CREATE INDEX IF NOT EXISTS idx_songs_album_id ON songs(album_id);
CREATE INDEX IF NOT EXISTS idx_songs_trending_rank ON songs(trending_rank ASC) WHERE trending_rank IS NOT NULL;

-- ------------------------------------------------------------------------------
-- 4. DAILY FEATURES TABLE (Flags duplicate dates & maintains 30-day rotation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS daily_features (
    id VARCHAR(64) PRIMARY KEY,
    feature_date DATE NOT NULL UNIQUE,
    artist_id VARCHAR(64) NOT NULL,
    song_id VARCHAR(64) NOT NULL,
    region VARCHAR(16) NOT NULL DEFAULT 'india',
    editorial_quote TEXT,
    artist_data JSONB,
    song_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_features_date ON daily_features(feature_date);
CREATE INDEX IF NOT EXISTS idx_daily_features_artist_id ON daily_features(artist_id);
CREATE INDEX IF NOT EXISTS idx_daily_features_region ON daily_features(region);

-- ------------------------------------------------------------------------------
-- 5. PROVIDER CACHE TABLE (Stores raw/normalized responses with TTL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS provider_cache (
    cache_key VARCHAR(255) PRIMARY KEY,
    provider VARCHAR(64) NOT NULL,
    data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_cache_expires ON provider_cache(expires_at);

-- ------------------------------------------------------------------------------
-- 6. SEARCH CACHE TABLE (Stores debounced search result payloads with TTL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS search_cache (
    query_hash VARCHAR(64) PRIMARY KEY,
    query VARCHAR(255) NOT NULL,
    results JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_search_cache_expires ON search_cache(expires_at);
