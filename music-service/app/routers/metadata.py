from __future__ import annotations

import secrets
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query, Header, Depends, status
from app.core.config import settings
from app.models.schemas import (
    ArtistBase,
    ArtistDetailResponse,
    SongBase,
    AlbumBase,
    ChartResponse,
    SearchResponse,
    RelatedSongsResponse,
    ArtistSongsResponse,
    LyricsResponse,
)
from app.services.metadata_service import metadata_service

router = APIRouter(prefix="/metadata", tags=["Metadata Discovery"])

async def verify_api_key(x_api_key: Optional[str] = Header(None)):
    """
    Internal service-to-service authentication using constant-time comparison.
    If settings.API_KEY is configured, requests without a matching key are rejected.
    """
    if settings.API_KEY:
        if not x_api_key or not secrets.compare_digest(x_api_key, settings.API_KEY):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized internal service request",
            )
    return True

@router.get("/search", response_model=SearchResponse, dependencies=[Depends(verify_api_key)])
async def search(
    q: str = Query(..., min_length=1, max_length=200, description="Search term"),
    filter_type: Optional[str] = Query(None, description="Optional filter (artists, songs, albums)"),
):
    try:
        return await metadata_service.search(query=q, filter_type=filter_type)
    except Exception:
        raise HTTPException(status_code=500, detail="Search discovery temporarily unavailable")

@router.get("/artists/{artist_id}", response_model=ArtistBase, dependencies=[Depends(verify_api_key)])
async def get_artist(artist_id: str):
    try:
        artist = await metadata_service.get_artist(artist_id)
        if not artist:
            raise HTTPException(status_code=404, detail="Artist metadata not found")
        return artist
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve artist profile")

@router.get("/artists/{artist_id}/details", response_model=ArtistDetailResponse, dependencies=[Depends(verify_api_key)])
async def get_artist_details(artist_id: str):
    try:
        details = await metadata_service.get_artist_details(artist_id)
        if not details:
            raise HTTPException(status_code=404, detail="Artist details not found")
        return details
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve complete artist bundle")

@router.get("/artists/{artist_id}/releases", response_model=List[AlbumBase], dependencies=[Depends(verify_api_key)])
async def get_artist_releases(artist_id: str):
    try:
        return await metadata_service.get_artist_releases(artist_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve artist releases")

@router.get("/artists/{artist_id}/related", response_model=List[ArtistBase], dependencies=[Depends(verify_api_key)])
async def get_related_artists(artist_id: str):
    try:
        return await metadata_service.get_related_artists(artist_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve related artists")

@router.get("/songs/{song_id}", response_model=SongBase, dependencies=[Depends(verify_api_key)])
async def get_song(song_id: str):
    try:
        song = await metadata_service.get_song(song_id)
        if not song:
            raise HTTPException(status_code=404, detail="Song metadata not found")
        return song
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve song metadata")

@router.get("/albums/{album_id}", response_model=AlbumBase, dependencies=[Depends(verify_api_key)])
async def get_album(album_id: str):
    try:
        album = await metadata_service.get_album(album_id)
        if not album:
            raise HTTPException(status_code=404, detail="Album metadata not found")
        return album
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve album metadata")

@router.get("/charts", response_model=ChartResponse, dependencies=[Depends(verify_api_key)])
async def get_charts(country: str = Query("IN", max_length=5)):
    try:
        return await metadata_service.get_charts(country=country)
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve charts")

@router.get("/related/{video_id}", response_model=RelatedSongsResponse, dependencies=[Depends(verify_api_key)])
async def get_related_songs(
    video_id: str,
    limit: int = Query(20, ge=1, le=50),
    continuation: Optional[str] = Query(None),
):
    try:
        return await metadata_service.get_related_songs(video_id=video_id, limit=limit, continuation=continuation)
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve related songs")

@router.get("/artists/{artist_id}/songs", response_model=ArtistSongsResponse, dependencies=[Depends(verify_api_key)])
async def get_artist_songs(
    artist_id: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    try:
        return await metadata_service.get_artist_songs(artist_id=artist_id, limit=limit, offset=offset)
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve artist songs")

@router.get("/lyrics/{video_id}", response_model=LyricsResponse, dependencies=[Depends(verify_api_key)])
async def get_lyrics(video_id: str):
    try:
        return await metadata_service.get_lyrics(video_id=video_id)
    except Exception:
        raise HTTPException(status_code=500, detail="Unable to retrieve lyrics")


