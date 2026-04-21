"""
WebSocket connection manager for real-time dashboard streams.
"""

from __future__ import annotations

from datetime import datetime
import logging

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class TrafficWebSocketManager:
    """Track connected clients by stream type and intersection."""

    def __init__(self) -> None:
        self.intersection_connections: dict[int, list[WebSocket]] = {}
        self.alert_connections: list[WebSocket] = []
        self.control_connections: list[WebSocket] = []

    async def connect_to_intersection(self, websocket: WebSocket, intersection_id: int) -> None:
        await websocket.accept()
        self.intersection_connections.setdefault(intersection_id, []).append(websocket)

    async def disconnect_from_intersection(self, websocket: WebSocket, intersection_id: int) -> None:
        connections = self.intersection_connections.get(intersection_id, [])
        if websocket in connections:
            connections.remove(websocket)
        if not connections and intersection_id in self.intersection_connections:
            del self.intersection_connections[intersection_id]

    async def connect_to_alerts(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.alert_connections.append(websocket)

    async def disconnect_from_alerts(self, websocket: WebSocket) -> None:
        if websocket in self.alert_connections:
            self.alert_connections.remove(websocket)

    async def connect_to_control(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.control_connections.append(websocket)

    async def disconnect_from_control(self, websocket: WebSocket) -> None:
        if websocket in self.control_connections:
            self.control_connections.remove(websocket)

    async def subscribe_to_channel(self, websocket: WebSocket, channel: str) -> None:
        await websocket.send_json(
            {
                "type": "subscription_ack",
                "channel": channel,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    async def unsubscribe_from_channel(self, websocket: WebSocket, channel: str) -> None:
        await websocket.send_json(
            {
                "type": "unsubscription_ack",
                "channel": channel,
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    async def broadcast_to_intersection(self, intersection_id: int, message: dict) -> None:
        payload = {"timestamp": datetime.utcnow().isoformat(), **message}
        await self._broadcast(self.intersection_connections.get(intersection_id, []), payload)

    async def broadcast_alert(self, message: dict) -> None:
        payload = {"timestamp": datetime.utcnow().isoformat(), **message}
        await self._broadcast(self.alert_connections, payload)

    async def broadcast_control(self, message: dict) -> None:
        payload = {"timestamp": datetime.utcnow().isoformat(), **message}
        await self._broadcast(self.control_connections, payload)

    async def disconnect_all(self) -> None:
        for connections in [
            *self.intersection_connections.values(),
            self.alert_connections,
            self.control_connections,
        ]:
            for websocket in list(connections):
                try:
                    await websocket.close()
                except Exception as exc:  # pragma: no cover
                    logger.warning("WebSocket cleanup failed: %s", exc)

        self.intersection_connections.clear()
        self.alert_connections.clear()
        self.control_connections.clear()

    async def _broadcast(self, sockets: list[WebSocket], payload: dict) -> None:
        disconnected: list[WebSocket] = []
        for websocket in list(sockets):
            try:
                await websocket.send_json(payload)
            except Exception:
                disconnected.append(websocket)

        for websocket in disconnected:
            if websocket in sockets:
                sockets.remove(websocket)

    def get_total_connections(self) -> int:
        return (
            sum(len(connections) for connections in self.intersection_connections.values())
            + len(self.alert_connections)
            + len(self.control_connections)
        )

    def get_intersection_connection_counts(self) -> dict[int, int]:
        return {
            intersection_id: len(connections)
            for intersection_id, connections in self.intersection_connections.items()
        }

    def get_intersection_connection_count(self, intersection_id: int) -> int:
        return len(self.intersection_connections.get(intersection_id, []))

    def get_alert_connection_count(self) -> int:
        return len(self.alert_connections)

    def get_control_connection_count(self) -> int:
        return len(self.control_connections)


websocket_manager = TrafficWebSocketManager()
