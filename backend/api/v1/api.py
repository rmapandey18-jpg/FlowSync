"""
Version 1 API Router
Combines all v1 API endpoints for the FlowSync AI traffic management system.
"""

from fastapi import APIRouter

from .endpoints import (
    auth,
    intersections,
    traffic_data,
    predictions,
    signals,
    users,
    websocket
)

# Version 1 API router
api_router = APIRouter()

# Include endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(intersections.router, prefix="/intersections", tags=["Intersections"])
api_router.include_router(traffic_data.router, prefix="/traffic", tags=["Traffic Data"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["AI Predictions"])
api_router.include_router(signals.router, prefix="/signals", tags=["Traffic Signals"])
api_router.include_router(websocket.router, prefix="/ws", tags=["WebSocket"])