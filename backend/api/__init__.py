"""
API Router Configuration
Combines all API endpoints into a single router for the FastAPI application.
"""

from fastapi import APIRouter

from .v1.api import api_router as v1_api_router

# Main API router
api_router = APIRouter()

# Include versioned API routers
api_router.include_router(v1_api_router, prefix="/v1")

# Health check endpoint
@api_router.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {"status": "healthy", "service": "FlowSync AI Backend"}