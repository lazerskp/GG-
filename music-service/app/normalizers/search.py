from __future__ import annotations

from typing import Dict, Any, List
from app.models.schemas import SearchResponse, ArtistBase, SongBase, AlbumBase
from app.normalizers.artist import normalize_artist
from app.normalizers.song import normalize_song
from app.normalizers.album import normalize_album

def normalize_search_results(query: str, raw_results: List[Dict[str, Any]]) -> SearchResponse:
    """
    Categorizes, normalizes, and deduplicates raw search items from ytmusicapi.
    Computes topResult and preserves videos vs songs.
    """
    artists: List[ArtistBase] = []
    songs: List[SongBase] = []
    albums: List[AlbumBase] = []
    videos: List[SongBase] = []

    seen_artist_ids = set()
    seen_song_ids = set()
    seen_album_ids = set()
    seen_video_ids = set()

    for item in raw_results:
        if not isinstance(item, dict):
            continue

        category = (item.get("category") or item.get("resultType") or "").lower()

        if category in ["artists", "artist"]:
            norm_a = normalize_artist(item)
            if norm_a.id not in seen_artist_ids:
                seen_artist_ids.add(norm_a.id)
                artists.append(norm_a)

        elif category in ["songs", "song"]:
            norm_s = normalize_song(item)
            if norm_s.id not in seen_song_ids:
                seen_song_ids.add(norm_s.id)
                songs.append(norm_s)

        elif category in ["videos", "video"]:
            norm_v = normalize_song(item)
            if norm_v.id not in seen_video_ids and norm_v.id not in seen_song_ids:
                seen_video_ids.add(norm_v.id)
                videos.append(norm_v)

        elif category in ["albums", "album", "singles", "eps"]:
            norm_al = normalize_album(item)
            if norm_al.id not in seen_album_ids:
                seen_album_ids.add(norm_al.id)
                albums.append(norm_al)

    # Compute top result match
    q_clean = (query or "").lower().strip()
    top_result = None

    if artists:
        first_a = artists[0]
        if first_a.name.lower() in q_clean or q_clean in first_a.name.lower():
            top_result = {"type": "artist", "item": first_a.model_dump()}

    if not top_result and songs:
        first_s = songs[0]
        if first_s.title.lower() in q_clean or q_clean in first_s.title.lower():
            top_result = {"type": "song", "item": first_s.model_dump()}

    if not top_result and albums:
        first_al = albums[0]
        if first_al.title.lower() in q_clean or q_clean in first_al.title.lower():
            top_result = {"type": "album", "item": first_al.model_dump()}

    # Fallback top result to highest ranked artist or song if none directly matched substring
    if not top_result:
        if artists:
            top_result = {"type": "artist", "item": artists[0].model_dump()}
        elif songs:
            top_result = {"type": "song", "item": songs[0].model_dump()}
        elif albums:
            top_result = {"type": "album", "item": albums[0].model_dump()}

    return SearchResponse(
        query=query,
        topResult=top_result,
        artists=artists,
        songs=songs,
        albums=albums,
        videos=videos,
    )

