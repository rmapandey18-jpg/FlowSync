"""
WebSocket streams and websocket management endpoints.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from jose import JWTError

from api.v1.endpoints.auth import get_current_user
from core.database import User
from core.security import verify_token
from core.websocket import websocket_manager

router = APIRouter()


def _extract_ws_token(token: str | None) -> str:
    if token is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    if token.lower().startswith("bearer "):
        return token.split(" ", 1)[1]
    return token


async def _validate_websocket_token(token: str | None) -> None:
    try:
        verify_token(_extract_ws_token(token), token_type="access")
    except (HTTPException, JWTError) as exc:
        raise HTTPException(status_code=401, detail="Invalid websocket token") from exc


@router.websocket("/traffic/{intersection_id}")
async def traffic_websocket(
    websocket: WebSocket,
    intersection_id: int,
    token: str | None = None,
) -> Any:
    """Stream traffic updates for one intersection."""
    try:
        await _validate_websocket_token(token)
    except HTTPException:
        await websocket.close(code=1008, reason="Authentication required")
        return

    await websocket_manager.connect_to_intersection(websocket, intersection_id)
    try:
        while True:
            data = await websocket.receive_text()
            if data.startswith("subscribe:"):
                await websocket_manager.subscribe_to_channel(websocket, data.split(":", 1)[1])
            elif data.startswith("unsubscribe:"):
                await websocket_manager.unsubscribe_from_channel(websocket, data.split(":", 1)[1])
    except WebSocketDisconnect:
        await websocket_manager.disconnect_from_intersection(websocket, intersection_id)


@router.websocket("/alerts")
async def alerts_websocket(
    websocket: WebSocket,
    token: str | None = None,
) -> Any:
    """Stream system alerts."""
    try:
        await _validate_websocket_token(token)
    except HTTPException:
        await websocket.close(code=1008, reason="Authentication required")
        return

    await websocket_manager.connect_to_alerts(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await websocket_manager.disconnect_from_alerts(websocket)


@router.websocket("/control")
async def control_websocket(
    websocket: WebSocket,
    token: str | None = None,
) -> Any:
    """Receive and rebroadcast control room events."""
    try:
        await _validate_websocket_token(token)
    except HTTPException:
        await websocket.close(code=1008, reason="Authentication required")
        return

    await websocket_manager.connect_to_control(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            command_type = data.get("type", "control_event")
            intersection_id = data.get("intersection_id")
            payload = {
                "type": command_type,
                "payload": data,
            }
            if intersection_id is not None:
                await websocket_manager.broadcast_to_intersection(intersection_id, payload)
            await websocket_manager.broadcast_control(payload)
    except WebSocketDisconnect:
        await websocket_manager.disconnect_from_control(websocket)


@router.get("/connections")
async def get_connection_stats(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Return websocket connection counts."""
    return {
        "total_connections": websocket_manager.get_total_connections(),
        "intersection_connections": websocket_manager.get_intersection_connection_counts(),
        "alert_connections": websocket_manager.get_alert_connection_count(),
        "control_connections": websocket_manager.get_control_connection_count(),
    }


@router.post("/broadcast/{intersection_id}")
async def broadcast_to_intersection(
    intersection_id: int,
    message: dict,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Broadcast a message to one intersection stream."""
    await websocket_manager.broadcast_to_intersection(intersection_id, message)
    return {
        "message": "Broadcast sent successfully",
        "intersection_id": intersection_id,
        "recipients": websocket_manager.get_intersection_connection_count(intersection_id),
    }


@router.post("/broadcast/alerts")
async def broadcast_alert(
    message: dict,
    current_user: User = Depends(get_current_user),
) -> Any:
    """Broadcast an alert to all alert subscribers."""
    await websocket_manager.broadcast_alert(message)
    return {
        "message": "Alert broadcast sent successfully",
        "recipients": websocket_manager.get_alert_connection_count(),
    }
