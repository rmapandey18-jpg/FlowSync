"""
Traffic processing service.
"""

from datetime import datetime, timedelta
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Intersection, TrafficData
from core.websocket import TrafficWebSocketManager
from schemas.traffic_data import TrafficDataCreate

logger = logging.getLogger(__name__)


class TrafficService:
    """Persist traffic samples and emit websocket updates."""

    def __init__(self, websocket_manager: TrafficWebSocketManager):
        self.websocket_manager = websocket_manager

    async def process_traffic_data(
        self,
        traffic_data: TrafficDataCreate,
        db: AsyncSession,
    ) -> TrafficData:
        """Store a traffic sample and notify subscribers."""
        new_data = TrafficData(**traffic_data.model_dump())
        db.add(new_data)
        await db.commit()
        await db.refresh(new_data)

        intersection = await db.get(Intersection, traffic_data.intersection_id)
        intersection_name = intersection.name if intersection else "Unknown intersection"

        await self.websocket_manager.broadcast_to_intersection(
            traffic_data.intersection_id,
            {
                "type": "traffic_update",
                "intersection_id": traffic_data.intersection_id,
                "intersection_name": intersection_name,
                "data": {
                    "vehicle_count": new_data.vehicle_count,
                    "vehicle_density": new_data.vehicle_density,
                    "average_speed": new_data.average_speed,
                    "congestion_level": new_data.congestion_level,
                    "timestamp": new_data.timestamp.isoformat(),
                },
            },
        )

        if new_data.congestion_level in {"high", "severe"}:
            await self.websocket_manager.broadcast_alert(
                {
                    "type": "congestion_alert",
                    "intersection_id": traffic_data.intersection_id,
                    "intersection_name": intersection_name,
                    "message": f"High congestion detected at {intersection_name}",
                    "severity": "warning",
                }
            )

        logger.info("Processed traffic sample for intersection %s", traffic_data.intersection_id)
        return new_data

    async def get_traffic_summary(
        self,
        intersection_id: int,
        hours: int,
        db: AsyncSession,
    ) -> dict:
        """Compute a basic summary for a time window."""
        start_time = datetime.utcnow() - timedelta(hours=hours)
        result = await db.execute(
            select(TrafficData)
            .where(TrafficData.intersection_id == intersection_id)
            .where(TrafficData.timestamp >= start_time)
        )
        traffic_data = result.scalars().all()

        if not traffic_data:
            return {
                "intersection_id": intersection_id,
                "period_hours": hours,
                "total_records": 0,
                "average_density": 0,
                "peak_density": 0,
                "average_speed": 0,
            }

        densities = [item.vehicle_density for item in traffic_data]
        speeds = [item.average_speed for item in traffic_data if item.average_speed is not None]

        return {
            "intersection_id": intersection_id,
            "period_hours": hours,
            "total_records": len(traffic_data),
            "average_density": round(sum(densities) / len(densities), 2),
            "peak_density": round(max(densities), 2),
            "average_speed": round(sum(speeds) / len(speeds), 2) if speeds else 0,
            "data_points": len(traffic_data),
        }
