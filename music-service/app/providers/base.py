from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional, List
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

class MusicMetadataProvider(ABC):
    """
    Abstract interface for music discovery and metadata providers.
    
    IMPORTANT ARCHITECTURAL RULE:
    This interface strictly retrieves public metadata (names, tracklists, release dates, artwork).
    It does NOT handle audio stream extraction, downloading, decryption, or playback streaming.
    """

    @abstractmethod
    async def search(self, query: str, filter_type: Optional[str] = None) -> SearchResponse:
        """Search music catalog for artists, songs, and albums."""
        pass

    @abstractmethod
    async def search_artists(self, query: str) -> List[ArtistBase]:
        """Search specifically for artists."""
        pass

    @abstractmethod
    async def search_songs(self, query: str) -> List[SongBase]:
        """Search specifically for tracks/songs."""
        pass

    @abstractmethod
    async def search_albums(self, query: str) -> List[AlbumBase]:
        """Search specifically for albums."""
        pass

    @abstractmethod
    async def get_artist(self, artist_id: str) -> Optional[ArtistBase]:
        """Retrieve detailed artist profile and metadata."""
        pass

    @abstractmethod
    async def get_artist_details(self, artist_id: str) -> Optional[ArtistDetailResponse]:
        """Retrieve complete artist bundle: profile, top songs, releases, albums, and related."""
        pass

    @abstractmethod
    async def get_artist_releases(self, artist_id: str) -> List[AlbumBase]:
        """Retrieve releases/albums for an artist."""
        pass

    @abstractmethod
    async def get_related_artists(self, artist_id: str) -> List[ArtistBase]:
        """Retrieve related artists where supported."""
        pass

    @abstractmethod
    async def get_album(self, album_id: str) -> Optional[AlbumBase]:
        """Retrieve album tracklist and metadata."""
        pass

    @abstractmethod
    async def get_song_metadata(self, song_id: str) -> Optional[SongBase]:
        """Retrieve individual song metadata."""
        pass

    @abstractmethod
    async def get_charts(self, country: str = "IN") -> ChartResponse:
        """Retrieve top trending charts for a given territory."""
        pass

    @abstractmethod
    async def get_related_songs(self, video_id: str, limit: int = 20, continuation: Optional[str] = None) -> RelatedSongsResponse:
        """Retrieve authentic related/recommended songs for a given track."""
        pass

    @abstractmethod
    async def get_artist_songs(self, artist_id: str, limit: int = 50, offset: int = 0) -> ArtistSongsResponse:
        """Retrieve complete catalog of songs for an artist."""
        pass

    @abstractmethod
    async def get_lyrics(self, video_id: str) -> LyricsResponse:
        """Retrieve synchronized or plain lyrics from YouTube Music for a track."""
        pass


