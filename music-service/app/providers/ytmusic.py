import asyncio
import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.providers.base import MusicMetadataProvider
from app.providers.factory import create_ytmusic_instance
from app.models.schemas import (
    ArtistBase,
    ArtistDetailResponse,
    SongBase,
    AlbumBase,
    ChartResponse,
    SearchResponse,
    RelatedSongsResponse,
    ArtistSongsResponse,
    LyricLineSchema,
    LyricsResponse,
)
from app.normalizers.artist import normalize_artist
from app.normalizers.song import normalize_song
from app.normalizers.album import normalize_album
from app.normalizers.search import normalize_search_results
from app.normalizers.charts import normalize_charts

logger = logging.getLogger("gullygang.ytmusic")

class YouTubeMusicMetadataProvider(MusicMetadataProvider):
    """
    Live YouTube Music metadata provider using official sigma67/ytmusicapi.
    Strictly metadata discovery (artists, albums, songs, charts, search).
    Does NOT extract, bypass, or stream audio.
    """

    def __init__(self):
        self._ytmusic = create_ytmusic_instance()

    @property
    def is_available(self) -> bool:
        return self._ytmusic is not None

    async def search(self, query: str, filter_type: Optional[str] = None) -> SearchResponse:
        q = (query or "").strip()
        if not q:
            return SearchResponse(query=query, artists=[], songs=[], albums=[], videos=[])

        if not self._ytmusic:
            logger.warning("ytmusicapi not initialized during search('%s')", q)
            return SearchResponse(query=q, artists=[], songs=[], albums=[], videos=[])

        try:
            # ytmusicapi search filter can be: 'songs', 'videos', 'albums', 'artists', 'playlists'
            if filter_type:
                raw = self._ytmusic.search(q, filter=filter_type)
                if not isinstance(raw, list):
                    raw = []
                return normalize_search_results(q, raw)

            # Concurrent multi-filter search: songs (20+), artists (20+), albums (20+), videos (15+)
            loop = asyncio.get_running_loop()
            t_songs = loop.run_in_executor(None, lambda: self._ytmusic.search(q, filter="songs"))
            t_artists = loop.run_in_executor(None, lambda: self._ytmusic.search(q, filter="artists"))
            t_albums = loop.run_in_executor(None, lambda: self._ytmusic.search(q, filter="albums"))
            t_videos = loop.run_in_executor(None, lambda: self._ytmusic.search(q, filter="videos"))

            res_songs, res_artists, res_albums, res_videos = await asyncio.gather(
                t_songs, t_artists, t_albums, t_videos, return_exceptions=True
            )

            raw_items = []
            if isinstance(res_artists, list):
                raw_items.extend(res_artists[:20])
            if isinstance(res_songs, list):
                raw_items.extend(res_songs[:25])
            if isinstance(res_albums, list):
                raw_items.extend(res_albums[:20])
            if isinstance(res_videos, list):
                raw_items.extend(res_videos[:15])

            return normalize_search_results(q, raw_items)
        except Exception as e:
            logger.error("ytmusicapi search error for query '%s': %s", q, str(e))
            return SearchResponse(query=q, artists=[], songs=[], albums=[], videos=[])

    async def search_artists(self, query: str) -> List[ArtistBase]:
        res = await self.search(query, filter_type="artists")
        return res.artists

    async def search_songs(self, query: str) -> List[SongBase]:
        res = await self.search(query, filter_type="songs")
        return res.songs

    async def search_albums(self, query: str) -> List[AlbumBase]:
        res = await self.search(query, filter_type="albums")
        return res.albums

    async def get_artist(self, artist_id: str) -> Optional[ArtistBase]:
        if not self._ytmusic or not artist_id:
            return None

        clean_id = artist_id.strip()
        try:
            raw = self._ytmusic.get_artist(clean_id)
            if isinstance(raw, dict):
                return normalize_artist(raw, artist_id=clean_id)
        except Exception as e:
            logger.warning("ytmusicapi get_artist error for '%s': %s", clean_id, str(e))
            # If browseId lookup failed, try searching for the artist
            try:
                search_res = self._ytmusic.search(clean_id, filter="artists")
                if search_res and isinstance(search_res, list) and len(search_res) > 0:
                    return normalize_artist(search_res[0], artist_id=clean_id)
            except Exception:
                pass
        return None

    async def get_artist_details(self, artist_id: str) -> Optional[ArtistDetailResponse]:
        if not self._ytmusic or not artist_id:
            return None

        clean_id = artist_id.strip()
        raw = None
        browse_id = clean_id

        try:
            raw = self._ytmusic.get_artist(clean_id)
        except Exception:
            try:
                search_res = self._ytmusic.search(clean_id.replace('-', ' '), filter="artists")
                if search_res and isinstance(search_res, list) and len(search_res) > 0:
                    found_bid = search_res[0].get("browseId")
                    if found_bid:
                        browse_id = found_bid
                        raw = self._ytmusic.get_artist(found_bid)
            except Exception as search_err:
                logger.warning("Artist fallback search failed: %s", str(search_err))

        if not raw or not isinstance(raw, dict):
            return None

        artist = normalize_artist(raw, artist_id=clean_id)

        # 1. Top Songs
        top_songs: List[SongBase] = []
        raw_songs = raw.get("songs", {}).get("results", [])
        if isinstance(raw_songs, list):
            for s in raw_songs:
                if isinstance(s, dict):
                    song_obj = normalize_song(s)
                    top_songs.append(song_obj)

        # If fewer than 5 songs, supplement from search
        if len(top_songs) < 5:
            try:
                sup_songs = self._ytmusic.search(f"{artist.name}", filter="songs")
                if isinstance(sup_songs, list):
                    for s in sup_songs:
                        if isinstance(s, dict):
                            song_obj = normalize_song(s)
                            if not any(existing.id == song_obj.id for existing in top_songs):
                                top_songs.append(song_obj)
                        if len(top_songs) >= 10:
                            break
            except Exception:
                pass

        # 2. New Releases (Singles)
        new_releases: List[AlbumBase] = []
        raw_singles = raw.get("singles", {}).get("results", [])
        if isinstance(raw_singles, list):
            for item in raw_singles[:10]:
                if isinstance(item, dict):
                    new_releases.append(normalize_album(item))

        # 3. Top Albums
        top_albums: List[AlbumBase] = []
        raw_albums = raw.get("albums", {}).get("results", [])
        if isinstance(raw_albums, list):
            for item in raw_albums[:10]:
                if isinstance(item, dict):
                    top_albums.append(normalize_album(item))

        # 4. Related Artists
        related_artists: List[ArtistBase] = []
        raw_related = raw.get("related", {}).get("results", [])
        if isinstance(raw_related, list):
            for item in raw_related[:8]:
                if isinstance(item, dict):
                    related_artists.append(normalize_artist(item))

        now_iso = datetime.now(timezone.utc).isoformat()

        return ArtistDetailResponse(
            artist=artist,
            topSongs=top_songs[:10],
            newReleases=new_releases[:10],
            topAlbums=top_albums[:10],
            relatedArtists=related_artists[:8],
            updatedAt=now_iso,
            source="ytmusic_live",
        )

    async def get_artist_releases(self, artist_id: str) -> List[AlbumBase]:
        if not self._ytmusic or not artist_id:
            return []

        clean_id = artist_id.strip()
        albums: List[AlbumBase] = []
        try:
            raw = self._ytmusic.get_artist(clean_id)
            if isinstance(raw, dict):
                releases_raw = []
                if "albums" in raw and isinstance(raw["albums"], dict):
                    releases_raw.extend(raw["albums"].get("results", []))
                if "singles" in raw and isinstance(raw["singles"], dict):
                    releases_raw.extend(raw["singles"].get("results", []))

                for item in releases_raw:
                    if isinstance(item, dict):
                        albums.append(normalize_album(item))
        except Exception as e:
            logger.warning("ytmusicapi get_artist_releases error for '%s': %s", clean_id, str(e))
        return albums

    async def get_related_artists(self, artist_id: str) -> List[ArtistBase]:
        if not self._ytmusic or not artist_id:
            return []

        clean_id = artist_id.strip()
        artists: List[ArtistBase] = []
        try:
            raw = self._ytmusic.get_artist(clean_id)
            if isinstance(raw, dict) and "related" in raw and isinstance(raw["related"], dict):
                for item in raw["related"].get("results", []):
                    if isinstance(item, dict):
                        artists.append(normalize_artist(item))
        except Exception as e:
            logger.warning("ytmusicapi get_related_artists error for '%s': %s", clean_id, str(e))
        return artists

    async def get_album(self, album_id: str) -> Optional[AlbumBase]:
        if not self._ytmusic or not album_id:
            return None

        clean_id = album_id.strip()
        try:
            raw = self._ytmusic.get_album(clean_id)
            if isinstance(raw, dict):
                return normalize_album(raw, album_id=clean_id)
        except Exception as e:
            logger.warning("ytmusicapi get_album error for '%s': %s", clean_id, str(e))
        return None

    async def get_song_metadata(self, song_id: str) -> Optional[SongBase]:
        if not self._ytmusic or not song_id:
            return None

        clean_id = song_id.strip()
        try:
            raw = self._ytmusic.get_song(clean_id)
            if isinstance(raw, dict):
                # ytmusic.get_song returns {'videoDetails': {...}}
                video_details = raw.get("videoDetails", {})
                if video_details:
                    return normalize_song(video_details, song_id=clean_id)
                return normalize_song(raw, song_id=clean_id)
        except Exception as e:
            logger.warning("ytmusicapi get_song_metadata error for '%s': %s", clean_id, str(e))
            # Try song search as fallback
            try:
                search_res = self._ytmusic.search(clean_id, filter="songs")
                if search_res and isinstance(search_res, list) and len(search_res) > 0:
                    return normalize_song(search_res[0], song_id=clean_id)
            except Exception:
                pass
        return None

    async def get_charts(self, country: str = "IN") -> ChartResponse:
        c = (country or "IN").upper()
        region = "india" if c == "IN" else "global"
        now_iso = datetime.now(timezone.utc).isoformat()

        if self._ytmusic:
            tracks: List[SongBase] = []
            artists: List[ArtistBase] = []

            # 1. Try official get_charts
            try:
                raw = self._ytmusic.get_charts(country=c)
                if isinstance(raw, dict):
                    normalized = normalize_charts(c, raw)
                    if normalized.tracks:
                        tracks.extend(normalized.tracks)
                    if normalized.artists:
                        artists.extend(normalized.artists)
            except Exception as e:
                logger.info("ytmusicapi get_charts unauthenticated response parsing note: %s. Using live trending rap discovery.", str(e))

            # 2. Ensure exactly 10 live tracks for region
            if len(tracks) < 10:
                try:
                    search_query = "Indian Hip Hop Top Tracks" if region == "india" else "Global Rap Top Tracks"
                    live_tracks_raw = self._ytmusic.search(search_query, filter="songs")
                    if isinstance(live_tracks_raw, list):
                        for item in live_tracks_raw:
                            if isinstance(item, dict):
                                trk = normalize_song(item)
                                trk.region = region
                                if not any(t.id == trk.id for t in tracks):
                                    tracks.append(trk)
                            if len(tracks) >= 10:
                                break
                except Exception as search_err:
                    logger.error("Live trending tracks query failed: %s", str(search_err))

            # 3. Ensure exactly 10 live trending artists for region
            if len(artists) < 10:
                try:
                    artist_query = "Desi Hip Hop" if region == "india" else "US Hip Hop"
                    live_artists_raw = self._ytmusic.search(artist_query, filter="artists")
                    if isinstance(live_artists_raw, list):
                        for item in live_artists_raw:
                            if isinstance(item, dict):
                                art = normalize_artist(item)
                                art.region = region
                                if not any(a.name.lower() == art.name.lower() for a in artists):
                                    artists.append(art)
                            if len(artists) >= 10:
                                break
                except Exception as art_err:
                    logger.error("Live trending artists query failed: %s", str(art_err))

            # 4. If still under 10 artists, derive from track artist credits
            if len(artists) < 10:
                for t in tracks:
                    for a_meta in t.artists:
                        a_name = a_meta.get("name")
                        a_id = a_meta.get("id") or (a_name.lower().replace(" ", "-") if a_name else None)
                        if a_name and a_id and not any(existing.name.lower() == a_name.lower() for existing in artists):
                            artists.append(
                                ArtistBase(
                                    id=a_id,
                                    providerId=a_id,
                                    name=a_name,
                                    description=None,
                                    image=t.artwork,
                                    region=region,
                                    genres=[],
                                    verified=False,
                                )
                            )
                    if len(artists) >= 10:
                        break

            final_tracks = tracks[:10]
            final_artists = artists[:10]

            return ChartResponse(
                country=c,
                region=region,
                tracks=final_tracks,
                artists=final_artists,
                updatedAt=now_iso,
                source="ytmusic_live",
            )

        return ChartResponse(country=c, region=region, tracks=[], artists=[], updatedAt=now_iso, source="ytmusic_unavailable")

    async def get_related_songs(self, video_id: str, limit: int = 20, continuation: Optional[str] = None) -> RelatedSongsResponse:
        if not self._ytmusic or not video_id:
            return RelatedSongsResponse(videoId=video_id or "", tracks=[])

        clean_id = video_id.strip()
        tracks: List[SongBase] = []
        next_continuation = None

        def _fetch_radio():
            endpoint = "next"
            body = {
                "videoId": clean_id,
                "playlistId": f"RDAMVM{clean_id}",
            }
            if continuation:
                body["continuation"] = continuation
            return self._ytmusic._send_request(endpoint, body)

        try:
            loop = asyncio.get_running_loop()
            resp = await loop.run_in_executor(None, _fetch_radio)
            sc = resp.get("contents", {}).get("singleColumnMusicWatchNextResultsRenderer", {})
            tabs = sc.get("tabbedRenderer", {}).get("watchNextTabbedResultsRenderer", {}).get("tabs", [])
            if tabs:
                tab0 = tabs[0].get("tabRenderer", {})
                ppr = tab0.get("content", {}).get("musicQueueRenderer", {}).get("content", {}).get("playlistPanelRenderer", {})
                items = ppr.get("contents", [])

                # Extract continuation token for infinite scroll
                continuations = ppr.get("continuations", [])
                if continuations and isinstance(continuations, list):
                    next_continuation = continuations[0].get("nextRadioContinuationData", {}).get("continuation")

                for item in items:
                    ppvr = item.get("playlistPanelVideoRenderer")
                    if not ppvr:
                        continue
                    v_id = ppvr.get("videoId")
                    if not v_id or v_id == clean_id:
                        continue

                    title = ""
                    if "title" in ppvr:
                        t = ppvr["title"]
                        if isinstance(t, dict):
                            title = "".join([r.get("text", "") for r in t.get("runs", [])]) or t.get("simpleText", "")
                        elif isinstance(t, str):
                            title = t

                    artists = []
                    for run in ppvr.get("longBylineText", {}).get("runs", []) or ppvr.get("shortBylineText", {}).get("runs", []):
                        text = run.get("text", "")
                        nav = run.get("navigationEndpoint", {})
                        if "browseEndpoint" in nav:
                            artists.append({"name": text, "id": nav["browseEndpoint"].get("browseId")})

                    dur_text = ppvr.get("lengthText", {}).get("runs", [{}])[0].get("text", "")
                    raw_dict = {
                        "videoId": v_id,
                        "title": title or "Track",
                        "artists": artists,
                        "thumbnail": ppvr.get("thumbnail", {}),
                        "duration": dur_text,
                    }
                    song = normalize_song(raw_dict, song_id=v_id)
                    tracks.append(song)
                    if len(tracks) >= limit:
                        break
        except Exception as radio_err:
            logger.warning("Radio queue fetch failed for %s: %s", clean_id, str(radio_err))

        # Fallback: if radio returned fewer than desired tracks, supplement with song search
        if len(tracks) < limit:
            try:
                loop = asyncio.get_running_loop()
                song_meta = await loop.run_in_executor(None, lambda: self._ytmusic.get_song(clean_id))
                author = song_meta.get("videoDetails", {}).get("author")
                title = song_meta.get("videoDetails", {}).get("title")
                if author or title:
                    sup_search = await loop.run_in_executor(
                        None,
                        lambda: self._ytmusic.search(f"{author or ''} {title or ''}".strip(), filter="songs")
                    )
                    if isinstance(sup_search, list):
                        for s in sup_search:
                            if isinstance(s, dict):
                                s_id = s.get("videoId")
                                if s_id and s_id != clean_id and not any(t.id == s_id for t in tracks):
                                    tracks.append(normalize_song(s, song_id=s_id))
                            if len(tracks) >= limit:
                                break
            except Exception as sup_err:
                logger.debug("Related supplement search fallback failed: %s", str(sup_err))

        return RelatedSongsResponse(
            videoId=clean_id,
            tracks=tracks[:limit],
            continuation=next_continuation,
        )

    async def get_artist_songs(self, artist_id: str, limit: int = 50, offset: int = 0) -> ArtistSongsResponse:
        if not self._ytmusic or not artist_id:
            return ArtistSongsResponse(artistId=artist_id or "", tracks=[])

        clean_id = artist_id.strip()
        tracks: List[SongBase] = []

        try:
            loop = asyncio.get_running_loop()
            raw = await loop.run_in_executor(None, lambda: self._ytmusic.get_artist(clean_id))
            artist_name = raw.get("name") or clean_id

            # Check if artist profile provides dedicated songs browseId / playlist
            songs_data = raw.get("songs", {})
            browse_id = songs_data.get("browseId")

            if browse_id:
                try:
                    pl = await loop.run_in_executor(
                        None, lambda: self._ytmusic.get_playlist(browse_id, limit=limit + offset)
                    )
                    pl_tracks = pl.get("tracks", [])
                    for item in pl_tracks:
                        if isinstance(item, dict):
                            song_obj = normalize_song(item)
                            tracks.append(song_obj)
                except Exception as pl_err:
                    logger.warning("Artist songs playlist retrieval failed for %s: %s", browse_id, str(pl_err))

            # If playlist didn't yield enough tracks, supplement via artist song search
            if len(tracks) < (limit + offset):
                search_results = await loop.run_in_executor(
                    None,
                    lambda: self._ytmusic.search(f"{artist_name}", filter="songs")
                )
                if isinstance(search_results, list):
                    for s in search_results:
                        if isinstance(s, dict):
                            song_obj = normalize_song(s)
                            if not any(t.id == song_obj.id for t in tracks):
                                tracks.append(song_obj)

            total = len(tracks)
            sliced = tracks[offset : offset + limit]
            return ArtistSongsResponse(
                artistId=clean_id,
                tracks=sliced,
                total=total,
            )
        except Exception as e:
            logger.error("get_artist_songs error for %s: %s", clean_id, str(e))
            return ArtistSongsResponse(artistId=clean_id, tracks=[])

    async def get_lyrics(self, video_id: str) -> LyricsResponse:
        if not self._ytmusic or not video_id:
            return LyricsResponse(status="unavailable", videoId=video_id or "")

        clean_id = video_id.strip()

        def _fetch_lyrics_data() -> Dict[str, Any]:
            browse_id = None

            # 1. Try standard get_watch_playlist first
            try:
                watch = self._ytmusic.get_watch_playlist(videoId=clean_id)
                if watch and isinstance(watch, dict) and watch.get("lyrics"):
                    browse_id = watch["lyrics"]
            except Exception:
                pass

            # 2. Fallback to direct 'next' request to handle Comments tab / tab changes
            if not browse_id:
                try:
                    body = {"videoId": clean_id, "playlistId": f"RDAMVM{clean_id}"}
                    resp = self._ytmusic._send_request("next", body)
                    sc = resp.get("contents", {}).get("singleColumnMusicWatchNextResultsRenderer", {})
                    tabs = sc.get("tabbedRenderer", {}).get("watchNextTabbedResultsRenderer", {}).get("tabs", [])
                    for tab in tabs:
                        tr = tab.get("tabRenderer", {})
                        title = tr.get("title")
                        ep = tr.get("endpoint", {}).get("browseEndpoint", {})
                        b_id = ep.get("browseId")
                        if b_id and (str(b_id).startswith("MPLY") or (isinstance(title, str) and "lyric" in title.lower())):
                            browse_id = b_id
                            break
                except Exception as next_err:
                    logger.warning("Lyrics tab traversal failed for %s: %s", clean_id, str(next_err))

            if not browse_id:
                return {"status": "unavailable", "videoId": clean_id, "provider": "ytmusic"}

            # 3. Fetch lyrics with timestamps first
            try:
                raw_synced = self._ytmusic.get_lyrics(browse_id, timestamps=True)
                has_timestamps = raw_synced.get("hasTimestamps", False) if isinstance(raw_synced, dict) else False
                lyrics_list = raw_synced.get("lyrics", []) if isinstance(raw_synced, dict) else []

                if has_timestamps and isinstance(lyrics_list, list) and len(lyrics_list) > 0:
                    lines = []
                    for item in lyrics_list:
                        text = getattr(item, "text", None) or (item.get("text") if isinstance(item, dict) else "")
                        st = getattr(item, "start_time", None) or (item.get("start_time") if isinstance(item, dict) else 0)
                        et = getattr(item, "end_time", None) or (item.get("end_time") if isinstance(item, dict) else None)

                        st_sec = round(float(st) / 1000.0, 3) if st is not None else 0.0
                        et_sec = round(float(et) / 1000.0, 3) if et is not None and et > 0 else None

                        lines.append({"startTime": st_sec, "endTime": et_sec, "text": str(text).strip()})

                    lines.sort(key=lambda x: x["startTime"])

                    # Derive endTime from next line when missing or non-positive duration
                    for idx in range(len(lines)):
                        if lines[idx]["endTime"] is None or lines[idx]["endTime"] <= lines[idx]["startTime"]:
                            if idx + 1 < len(lines):
                                lines[idx]["endTime"] = lines[idx + 1]["startTime"]

                    return {
                        "status": "synced",
                        "videoId": clean_id,
                        "lines": lines,
                        "source": raw_synced.get("source") if isinstance(raw_synced, dict) else None,
                        "provider": "ytmusic",
                    }
            except Exception as synced_err:
                logger.debug("Synced lyrics error for %s: %s, trying plain lyrics fallback", clean_id, str(synced_err))

            # 4. Fallback to plain lyrics (without timestamps=True)
            try:
                raw_plain = self._ytmusic.get_lyrics(browse_id)
                lyrics_str = raw_plain.get("lyrics", "") if isinstance(raw_plain, dict) else ""
                if isinstance(lyrics_str, str) and lyrics_str.strip():
                    plain_lines = [l.strip() for l in lyrics_str.splitlines() if l.strip()]
                    if len(plain_lines) > 0:
                        return {
                            "status": "plain",
                            "videoId": clean_id,
                            "text": plain_lines,
                            "source": raw_plain.get("source") if isinstance(raw_plain, dict) else None,
                            "provider": "ytmusic",
                        }
            except Exception as plain_err:
                logger.warning("Plain lyrics fallback failed for %s: %s", clean_id, str(plain_err))

            return {"status": "unavailable", "videoId": clean_id, "provider": "ytmusic"}

        try:
            loop = asyncio.get_running_loop()
            res = await loop.run_in_executor(None, _fetch_lyrics_data)
            return LyricsResponse(**res)
        except Exception as e:
            logger.error("get_lyrics unexpected error for %s: %s", clean_id, str(e))
            return LyricsResponse(status="unavailable", videoId=clean_id, provider="ytmusic")


