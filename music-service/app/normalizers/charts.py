from __future__ import annotations

from typing import Dict, Any, List
from app.models.schemas import ChartResponse, SongBase, ArtistBase
from app.normalizers.song import normalize_song
from app.normalizers.artist import normalize_artist

def normalize_charts(country: str, raw_charts: Dict[str, Any]) -> ChartResponse:
    """
    Safely parses ytmusicapi charts dictionary into normalized ChartResponse.
    """
    tracks: List[SongBase] = []
    artists: List[ArtistBase] = []
    region = "india" if country.upper() == "IN" else "global"

    if isinstance(raw_charts, dict):
        # 1. Videos / Songs in chart
        items = (
            raw_charts.get("videos", {}).get("items", [])
            or raw_charts.get("tracks", {}).get("items", [])
            or raw_charts.get("songs", {}).get("items", [])
        )
        if isinstance(items, list):
            for trk in items:
                if isinstance(trk, dict):
                    tracks.append(normalize_song(trk))

        # 2. Artists in chart
        artist_items = raw_charts.get("artists", {}).get("items", [])
        if isinstance(artist_items, list):
            for art in artist_items:
                if isinstance(art, dict):
                    artists.append(normalize_artist(art))

    return ChartResponse(
        country=country,
        region=region,
        tracks=tracks,
        artists=artists,
    )
