from __future__ import annotations

import re
from typing import Dict, Any, Optional, List
from app.models.schemas import SongBase
from app.normalizers.artist import detect_region, extract_thumbnail_url

DEFAULT_SONG_ARTWORK = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop"

def parse_duration_seconds(duration_raw: Any) -> int:
    if duration_raw is None:
        return 0
    if isinstance(duration_raw, (int, float)):
        return max(0, int(duration_raw))
    
    if isinstance(duration_raw, str):
        cleaned = duration_raw.strip()
        if cleaned.isdigit():
            return int(cleaned)
        if ":" in cleaned:
            parts = cleaned.split(":")
            try:
                if len(parts) == 2:
                    return int(parts[0]) * 60 + int(parts[1])
                elif len(parts) == 3:
                    return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
            except (ValueError, TypeError):
                return 0
    return 0

def normalize_song(raw: Dict[str, Any], song_id: Optional[str] = None) -> SongBase:
    """
    Safely normalizes raw ytmusicapi song, video, or track object into SongBase.
    Handles null values, missing artists, and varied duration formats.
    """
    if not isinstance(raw, dict):
        raw = {}

    provider_id = (
        song_id
        or raw.get("videoId")
        or raw.get("id")
        or "unknown_song"
    )

    title = raw.get("title") or "Untitled Track"

    # Extract primary artist name and artists list
    artists_raw = raw.get("artists", [])
    artist_name = "Various Artists"
    artist_id = None
    normalized_artists: List[Dict[str, str]] = []

    if isinstance(artists_raw, list) and len(artists_raw) > 0:
        first = artists_raw[0]
        if isinstance(first, dict):
            artist_name = first.get("name") or artist_name
            artist_id = first.get("id")
        for item in artists_raw:
            if isinstance(item, dict) and item.get("name"):
                normalized_artists.append({
                    "name": str(item.get("name")),
                    "id": str(item.get("id") or ""),
                })
    elif isinstance(raw.get("author"), str):
        artist_name = raw.get("author")
    elif isinstance(raw.get("artist"), str):
        artist_name = raw.get("artist")

    # Extract album info
    album_name = None
    album_id = None
    album_raw = raw.get("album")
    if isinstance(album_raw, dict):
        album_name = album_raw.get("name")
        album_id = album_raw.get("id")
    elif isinstance(album_raw, str):
        album_name = album_raw

    # Extract duration
    duration_val = raw.get("duration") or raw.get("duration_seconds") or raw.get("lengthSeconds")
    duration_sec = parse_duration_seconds(duration_val)

    # Extract artwork
    thumbnails = raw.get("thumbnails", [])
    # In get_song videoDetails, thumbnails might be in raw["thumbnail"]["thumbnails"]
    if not thumbnails and isinstance(raw.get("thumbnail"), dict):
        thumbnails = raw["thumbnail"].get("thumbnails", [])
    artwork = extract_thumbnail_url(thumbnails, DEFAULT_SONG_ARTWORK)

    # Detect region
    region = detect_region(artist_name, title)

    # Release year / date
    release_year = None
    year_raw = raw.get("year")
    if year_raw and str(year_raw).isdigit():
        release_year = int(year_raw)

    metadata: Dict[str, Any] = {
        "videoId": provider_id,
        "views": raw.get("views") or raw.get("viewCount"),
        "isExplicit": bool(raw.get("isExplicit", False)),
    }

    return SongBase(
        id=provider_id,
        provider="ytmusic",
        providerId=provider_id,
        title=title,
        artist=artist_name,
        artist_id=artist_id,
        artists=normalized_artists,
        album=album_name,
        album_id=album_id,
        artwork=artwork,
        duration=duration_sec,
        durationSeconds=duration_sec,
        release_year=release_year,
        region=region,
        # Genre tags and play counts are only surfaced when the provider
        # actually returns them. Never fabricate catalog metadata.
        genre=raw.get("genre") or None,
        plays=str(raw.get("views")) if raw.get("views") else None,
        metadata=metadata,
    )
