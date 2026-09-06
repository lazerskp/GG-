from __future__ import annotations

from typing import Optional, List
from app.providers.base import MusicMetadataProvider
from app.providers.ytmusic import YouTubeMusicMetadataProvider
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

class MetadataService:
    def __init__(self, provider: Optional[MusicMetadataProvider] = None):
        self.provider = provider or YouTubeMusicMetadataProvider()

    @property
    def is_ready(self) -> bool:
        if isinstance(self.provider, YouTubeMusicMetadataProvider):
            return self.provider.is_available
        return self.provider is not None

    async def search(self, query: str, filter_type: Optional[str] = None) -> SearchResponse:
        return await self.provider.search(query=query, filter_type=filter_type)

    async def search_artists(self, query: str) -> List[ArtistBase]:
        return await self.provider.search_artists(query=query)

    async def search_songs(self, query: str) -> List[SongBase]:
        return await self.provider.search_songs(query=query)

    async def search_albums(self, query: str) -> List[AlbumBase]:
        return await self.provider.search_albums(query=query)

    async def get_artist(self, artist_id: str) -> Optional[ArtistBase]:
        return await self.provider.get_artist(artist_id=artist_id)

    async def get_artist_details(self, artist_id: str) -> Optional[ArtistDetailResponse]:
        return await self.provider.get_artist_details(artist_id=artist_id)

    async def get_artist_releases(self, artist_id: str) -> List[AlbumBase]:
        return await self.provider.get_artist_releases(artist_id=artist_id)

    async def get_related_artists(self, artist_id: str) -> List[ArtistBase]:
        return await self.provider.get_related_artists(artist_id=artist_id)

    async def get_album(self, album_id: str) -> Optional[AlbumBase]:
        return await self.provider.get_album(album_id=album_id)

    async def get_song(self, song_id: str) -> Optional[SongBase]:
        return await self.provider.get_song_metadata(song_id=song_id)

    async def get_charts(self, country: str = "IN") -> ChartResponse:
        return await self.provider.get_charts(country=country)

    async def get_related_songs(self, video_id: str, limit: int = 20, continuation: Optional[str] = None) -> RelatedSongsResponse:
        return await self.provider.get_related_songs(video_id=video_id, limit=limit, continuation=continuation)

    async def get_artist_songs(self, artist_id: str, limit: int = 50, offset: int = 0) -> ArtistSongsResponse:
        return await self.provider.get_artist_songs(artist_id=artist_id, limit=limit, offset=offset)

    async def get_lyrics(self, video_id: str) -> LyricsResponse:
        return await self.provider.get_lyrics(video_id=video_id)

metadata_service = MetadataService()

