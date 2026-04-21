"""
Main FastAPI application for the FlowSync backend.
"""

from contextlib import asynccontextmanager
from datetime import datetime
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import uvicorn

from api.v1.api import api_router
from core.config import settings
from core.database import create_tables
from core.websocket import websocket_manager

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the database and clean up websockets on shutdown."""
    logger.info("Starting FlowSync backend")
    await create_tables()
    yield
    await websocket_manager.disconnect_all()
    logger.info("FlowSync backend stopped")


app = FastAPI(
    title=settings.APP_NAME,
    description="Traffic command backend with auth, signals, telemetry, and live websocket streams.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS,
)


@app.get("/")
async def root():
    """Simple service metadata endpoint."""
    return {
        "message": "FlowSync backend is online",
        "version": settings.VERSION,
        "timestamp": datetime.utcnow().isoformat(),
        "docs": "/docs",
        "api_base": "/api/v1",
        "websocket_base": "/api/v1/ws",
    }


@app.get("/health")
async def health_check():
    """Operational health endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "connections": websocket_manager.get_total_connections(),
        "database_url": settings.DATABASE_URL,
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Return consistent API error envelopes for HTTP errors."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Catch unexpected failures and return a stable JSON response."""
    logger.exception("Unhandled backend exception", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


app.include_router(api_router, prefix="/api/v1")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
