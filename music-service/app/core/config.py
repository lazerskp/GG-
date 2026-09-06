from __future__ import annotations

import os
from typing import List, Optional
from dotenv import load_dotenv

# Load local environment files
load_dotenv()
env_local_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env.local"))
if os.path.exists(env_local_path):
    load_dotenv(env_local_path)

class Settings:
    PROJECT_NAME: str = "GULLYGANG Music Metadata Service"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Internal secret key required in X-API-Key header
    API_KEY: str = os.getenv("MUSIC_SERVICE_API_KEY", os.getenv("API_KEY", "gg_internal_secret_key_2026"))
    
    # Allowed CORS origins - restrict strictly to Next.js BFF server/client
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://gullygang.in",
        "https://www.gullygang.in",
        "https://6h8b6mie.insforge.site",
    ]
    
    # Language and territory configuration for ytmusicapi
    LANGUAGE: str = os.getenv("YTMUSIC_LANGUAGE", "en")
    LOCATION: str = os.getenv("YTMUSIC_LOCATION", "IN")
    
    # Optional server-side authentication file (e.g. oauth.json or browser.json)
    # Strictly optional: public metadata discovery does NOT require authentication.
    AUTH_FILEPATH: Optional[str] = os.getenv("YTMUSIC_AUTH_FILEPATH", None)
    
    # Provider options
    PROVIDER_TIMEOUT_SECONDS: float = float(os.getenv("PROVIDER_TIMEOUT_SECONDS", "8.0"))

settings = Settings()

# Add NEXT_PUBLIC_APP_URL if specified
extra_origin = os.getenv("NEXT_PUBLIC_APP_URL")
if extra_origin and extra_origin not in settings.CORS_ORIGINS:
    settings.CORS_ORIGINS.append(extra_origin)
