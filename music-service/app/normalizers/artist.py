from __future__ import annotations

import re
from typing import Dict, Any, Optional, List
from app.models.schemas import ArtistBase

DEFAULT_ARTIST_IMAGE = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop"

DESI_RAP_KEYWORDS = [
    "divine", "seedhe maut", "krsna", "kr$na", "hanumankind", "mc stan",
    "emiway", "raftaar", "badshah", "ikka", "fotty seven", "rawal", "bharg",
    "prabh deep", "chaar diwaari", "talha anjum", "young stunners", "gully gang",
    "sambata", "ahmer", "faris shafi", "naezy", "brodha v", "yashraj", "dino james"
]

def extract_thumbnail_url(thumbnails: Optional[List[Dict[str, Any]]], fallback: str = DEFAULT_ARTIST_IMAGE) -> str:
    if not thumbnails or not isinstance(thumbnails, list):
        return fallback
    try:
        # Pick the largest thumbnail (typically the last item)
        url = thumbnails[-1].get("url")
        if url and isinstance(url, str) and url.startswith("http"):
            if "googleusercontent.com" in url:
                return re.sub(r'=[ws]\d+.*$', '=w1200-h1200-l90-rj', url)
            elif "ytimg.com/vi/" in url:
                return re.sub(r'/(?:default|mqdefault|hqdefault|sddefault)\.jpg', '/maxresdefault.jpg', url)
            return url
    except Exception:
        pass
    return fallback

def detect_region(name: str, description: Optional[str] = None) -> str:
    combined = f"{name or ''} {description or ''}".lower()
    for kw in DESI_RAP_KEYWORDS:
        if kw in combined:
            return "india"
    return "global"

def normalize_artist(raw: Dict[str, Any], artist_id: Optional[str] = None) -> ArtistBase:
    """
    Safely normalizes raw ytmusicapi artist data or search result into ArtistBase.
    Handles null values, missing fields, and unexpected structures.
    """
    if not isinstance(raw, dict):
        raw = {}

    provider_id = (
        artist_id
        or raw.get("browseId")
        or raw.get("channelId")
        or raw.get("id")
        or "unknown_artist"
    )

    name = raw.get("name") or raw.get("artist") or raw.get("title") or "Unknown Artist"
    description = raw.get("description") or None
    thumbnails = raw.get("thumbnails", [])
    image = extract_thumbnail_url(thumbnails, DEFAULT_ARTIST_IMAGE)
    
    subscribers = raw.get("subscribers") or raw.get("subtitle") or raw.get("views") or None
    region = detect_region(name, description)
    
    # Genres are only reported when the source data actually provides them.
    # Do not fabricate genre tags that the provider did not return.
    raw_genres = raw.get("genre") or raw.get("genres")
    if isinstance(raw_genres, str) and raw_genres.strip():
        genres = [raw_genres.strip()]
    elif isinstance(raw_genres, list):
        genres = [str(g).strip() for g in raw_genres if isinstance(g, str) and g.strip()]
    else:
        genres = []

    metadata: Dict[str, Any] = {
        "channelId": raw.get("channelId"),
        "subscribers": subscribers,
    }

    return ArtistBase(
        id=provider_id,
        provider="ytmusic",
        providerId=provider_id,
        name=name,
        description=description,
        image=image,
        region=region,
        genres=genres,
        # Audience size is only surfaced when the provider exposes it.
        monthly_listeners=subscribers or None,
        # Verification is only claimed when the source data supports it.
        verified=bool(raw.get("verified") or raw.get("isVerified")),
        metadata=metadata,
    )
