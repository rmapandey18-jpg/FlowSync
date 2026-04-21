"""
Traffic telemetry endpoints.
"""

from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.endpoints.auth import get_current_user
from core.database import Intersection, TrafficData, User, get_db
from core.websocket import websocket_manager
from schemas.traffic_data import TrafficDataCreate
from services.traffic_service import TrafficService

router = APIRouter()
traffic_service = TrafficService(websocket_manager)


def _serialize_traffic_data(data: TrafficData, intersection_name: str | None = None) -> dict:
    return {
        "id": data.id,
        "intersection_id": data.intersection_id,
        "vehicle_count": data.vehicle_count,
        "vehicle_density": data.vehicle_density,
        "average_speed": data.average_speed,
        "congestion_level": data.congestion_level,
        "weather_condition": data.weather_condition,
        "temperature": data.temperature,
        "timestamp": data.timestamp,
        "intersection_name": intersection_name,
    }


@router.get("/", response_model=list[dict])
async def read_traffic_data(
    intersection_id: Optional[int] = None,
    start_time: Optional[datetime] = None,
    end_time: Optional[datetime] = None,
    limit: int = Query(100, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return traffic samples, optionally filtered by intersection or time range."""
    query = select(TrafficData).order_by(desc(TrafficData.timestamp)).limit(limit)

    if intersection_id is not None:
        query = query.where(TrafficData.intersection_id == intersection_id)
    if start_time is not None:
        query = query.where(TrafficData.timestamp >= start_time)
    if end_time is not None:
        query = query.where(TrafficData.timestamp <= end_time)

    result = await db.execute(query)
    records = result.scalars().all()
    return [_serialize_traffic_data(record) for record in records]


@router.post("/", response_model=dict)
async def create_traffic_data(
    traffic_data: TrafficDataCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a traffic sample and broadcast it to websocket subscribers."""
    intersection = await db.get(Intersection, traffic_data.intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    new_data = await traffic_service.process_traffic_data(traffic_data, db)
    return _serialize_traffic_data(new_data, intersection.name)


@router.post("/bulk", response_model=list[dict])
async def create_bulk_traffic_data(
    traffic_data_list: list[TrafficDataCreate],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create multiple traffic samples."""
    if not traffic_data_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No traffic data provided",
        )

    created_items: list[dict] = []
    for item in traffic_data_list:
        created_items.append(await create_traffic_data(item, current_user, db))
    return created_items


@router.get("/latest/{intersection_id}", response_model=dict)
async def get_latest_traffic_data(
    intersection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return the most recent traffic sample for one intersection."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    latest = await db.scalar(
        select(TrafficData)
        .where(TrafficData.intersection_id == intersection_id)
        .order_by(desc(TrafficData.timestamp))
        .limit(1)
    )
    if latest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No traffic data found for this intersection",
        )

    return _serialize_traffic_data(latest, intersection.name)


@router.get("/summary/{intersection_id}")
async def get_traffic_summary(
    intersection_id: int,
    hours: int = Query(24, description="Number of hours to look back"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return a compact summary of traffic conditions for an intersection."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    summary = await traffic_service.get_traffic_summary(intersection_id, hours, db)
    return {
        **summary,
        "intersection_name": intersection.name,
    }


@router.delete("/{traffic_data_id}")
async def delete_traffic_data(
    traffic_data_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete a traffic sample."""
    traffic_data = await db.get(TrafficData, traffic_data_id)
    if traffic_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Traffic data not found",
        )

    await db.delete(traffic_data)
    await db.commit()
    return {"message": "Traffic data deleted successfully"}
