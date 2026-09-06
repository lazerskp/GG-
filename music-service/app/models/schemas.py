from __future__ import annotations

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class ArtistBase(BaseModel):
    id: str
    provider: str = "ytmusic"
    providerId: Optional[str] = None
    name: str
    description: Optional[str] = None
    image: str
    region: str = "india"
    genres: List[str] = Field(default_factory=list)
    monthly_listeners: Optional[str] = None
    verified: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SongBase(BaseModel):
    id: str
    provider: str = "ytmusic"
    providerId: Optional[str] = None
    title: str
    artist: str
    artist_id: Optional[str] = None
    artists: List[Dict[str, str]] = Field(default_factory=list)
    album: Optional[str] = None
    album_id: Optional[str] = None
    artwork: str
    duration: int = 0  # in seconds
    durationSeconds: int = 0
    release_year: Optional[int] = None
    releaseDate: Optional[str] = None
    region: str = "india"
    genre: Optional[str] = None
    plays: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AlbumBase(BaseModel):
    id: str
    provider: str = "ytmusic"
    providerId: Optional[str] = None
    title: str
    artist: str
    artist_id: Optional[str] = None
    artwork: str
    release_year: Optional[int] = None
    releaseDate: Optional[str] = None
    track_count: int = 1
    album_type: str = "album"  # album, ep, single
    tracks: List[SongBase] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class SearchResponse(BaseModel):
    query: str
    topResult: Optional[Dict[str, Any]] = None
    artists: List[ArtistBase] = Field(default_factory=list)
    songs: List[SongBase] = Field(default_factory=list)
    albums: List[AlbumBase] = Field(default_factory=list)
    videos: List[SongBase] = Field(default_factory=list)

class RelatedSongsResponse(BaseModel):
    videoId: str
    tracks: List[SongBase] = Field(default_factory=list)
    continuation: Optional[str] = None

class ArtistSongsResponse(BaseModel):
    artistId: str
    tracks: List[SongBase] = Field(default_factory=list)
    total: Optional[int] = None
    continuation: Optional[str] = None

class ChartResponse(BaseModel):
    country: str
    region: str
    tracks: List[SongBase] = Field(default_factory=list)
    artists: List[ArtistBase] = Field(default_factory=list)
    updatedAt: Optional[str] = None
    source: Optional[str] = "ytmusic"

class ArtistDetailResponse(BaseModel):
    artist: ArtistBase
    topSongs: List[SongBase] = Field(default_factory=list)
    newReleases: List[AlbumBase] = Field(default_factory=list)
    topAlbums: List[AlbumBase] = Field(default_factory=list)
    relatedArtists: List[ArtistBase] = Field(default_factory=list)
    updatedAt: Optional[str] = None
    source: Optional[str] = "ytmusic_live"

class HealthResponse(BaseModel):
    status: str
    version: str
    provider: str
    timestamp: str

class LyricLineSchema(BaseModel):
    startTime: float  # in seconds
    endTime: Optional[float] = None  # in seconds
    text: str

class LyricsResponse(BaseModel):
    status: str  # "synced" | "plain" | "instrumental" | "unavailable"
    videoId: str
    lines: Optional[List[LyricLineSchema]] = None
    text: Optional[List[str]] = None
    source: Optional[str] = None
    provider: str = "ytmusic"

