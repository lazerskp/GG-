from __future__ import annotations

import datetime
import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.models.schemas import HealthResponse
from app.routers.metadata import router as metadata_router
from app.services.metadata_service import metadata_service

logger = logging.getLogger("gullygang.api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Dedicated server-side music metadata and discovery microservice for GULLYGANG using ytmusicapi. Public discovery only. Zero audio stream ripping or downloading.",
)

# CORS configuration strictly restricted to configured origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(metadata_router, prefix=settings.API_V1_STR)

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    provider_status = "ready" if metadata_service.is_ready else "degraded"
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        provider=f"ytmusicapi ({provider_status})",
        timestamp=datetime.datetime.utcnow().isoformat() + "Z",
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception in music-service: %s", str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal metadata discovery service error occurred."},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=False)
