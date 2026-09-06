# GULLYGANG Music Metadata Microservice

Standalone Python 3.10+ microservice providing public music metadata, artist discovery, albums, and charts for GULLYGANG.

> [!IMPORTANT]
> **Strict Discovery/Metadata Only**: This microservice strictly communicates with `ytmusicapi` for public catalog metadata (titles, artists, genres, durations, artwork). It does **NOT** download, decrypt, rip, or extract audio streams. Audio playback remains fully decoupled on the frontend.

---

## Getting Started

### 1. Create Virtual Environment & Install Dependencies
```bash
cd music-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` in `music-service/`:
```env
MUSIC_SERVICE_API_KEY=your_internal_python_service_api_key_here
PROVIDER_TIMEOUT_SECONDS=8.0
```

### 3. Run the Microservice
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Interactive API documentation will be available at:
`http://localhost:8001/docs`

---

## Endpoints

- `GET /health` — Health check and provider status
- `GET /api/v1/metadata/search?q={query}` — Search artists, tracks, and albums
- `GET /api/v1/metadata/artists/{artist_id}` — Get artist profile & discography
- `GET /api/v1/metadata/songs/{song_id}` — Get song details
- `GET /api/v1/metadata/albums/{album_id}` — Get album tracklist & metadata
- `GET /api/v1/metadata/charts?country=IN` — Get regional trending charts
