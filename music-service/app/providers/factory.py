from __future__ import annotations

import os
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("gullygang.factory")

def create_ytmusic_instance():
    """
    Safely instantiates the official sigma67/ytmusicapi client.
    Supports optional language, location, and optional authentication file.
    Does NOT require authentication for public discovery and metadata endpoints.
    """
    try:
        from ytmusicapi import YTMusic

        auth_file = None
        if settings.AUTH_FILEPATH and os.path.isfile(settings.AUTH_FILEPATH):
            auth_file = settings.AUTH_FILEPATH
            logger.info("Initializing YTMusic with server-side authentication file.")

        client = YTMusic(
            auth=auth_file,
            language=settings.LANGUAGE,
            location=settings.LOCATION,
        )
        logger.info("Successfully initialized ytmusicapi metadata client (language=%s, location=%s)", settings.LANGUAGE, settings.LOCATION)
        return client
    except Exception as e:
        logger.error("Failed to initialize ytmusicapi instance: %s", str(e))
        return None
