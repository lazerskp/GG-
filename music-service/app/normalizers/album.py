from __future__ import annotations

from typing import Dict, Any, Optional, List
from app.models.schemas import AlbumBase, SongBase
from app.normalizers.artist import extract_thumbnail_url
from app.normalizers.song import normalize_song

DEFAULT_ALBUM_ARTWORK = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop"

def normalize_album(raw: Dict[str, Any], album_id: Optional[str] = None) -> AlbumBase:
    """
    Safely normalizes raw ytmusicapi album data into AlbumBase.
    Handles null values, tracks list normalization, and track count inference.
    """
    if not isinstance(raw, dict):
        raw = {}

    provider_id = (
        album_id
        or raw.get("browseId")
        or raw.get("id")
        or "unknown_album"
    )

    title = raw.get("title") or "Untitled Album"

    # Extract artist
    artist_name = "Various Artists"
    artist_id = None
    artists_raw = raw.get("artists", [])
    if isinstance(artists_raw, list) and len(artists_raw) > 0:
        first = artists_raw[0]
        if isinstance(first, dict):
            artist_name = first.get("name") or artist_name
            artist_id = first.get("id")
        elif isinstance(first, str):
            artist_name = first
    elif isinstance(raw.get("artist"), str):
        artist_name = raw.get("artist")

    # Extract artwork
    thumbnails = raw.get("thumbnails", [])
    artwork = extract_thumbnail_url(thumbnails, DEFAULT_ALBUM_ARTWORK)

    # Year
    release_year = None
    year_raw = raw.get("year")
    if year_raw and str(year_raw).isdigit():
        release_year = int(year_raw)

    # Album type
    album_type = str(raw.get("type") or "album").lower()
    if album_type not in ["album", "ep", "single"]:
        album_type = "album"

    # Normalize tracks
    tracks: List[SongBase] = []
    tracks_raw = raw.get("tracks", [])
    if isinstance(tracks_raw, list):
        for trk in tracks_raw:
            if isinstance(trk, dict):
                # Ensure album artwork and artist propagate if track lacks it
                if not trk.get("thumbnails"):
                    trk["thumbnails"] = thumbnails
                if not trk.get("artists") and artist_name:
                    trk["artists"] = [{"name": artist_name, "id": artist_id}]
                tracks.append(normalize_song(trk))

    track_count = raw.get("trackCount") or len(tracks) or 0
    if isinstance(track_count, str) and track_count.isdigit():
        track_count = int(track_count)

    metadata: Dict[str, Any] = {
        "browseId": provider_id,
        "audioPlaylistId": raw.get("audioPlaylistId"),
        "description": raw.get("description"),
    }

    return AlbumBase(
        id=provider_id,
        provider="ytmusic",
        providerId=provider_id,
        title=title,
        artist=artist_name,
        artist_id=artist_id,
        artwork=artwork,
        release_year=release_year,
        releaseDate=str(release_year) if release_year else None,
        track_count=int(track_count),
        album_type=album_type,
        tracks=tracks,
        metadata=metadata,
    )
