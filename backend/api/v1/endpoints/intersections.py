"""
Intersection management endpoints.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.endpoints.auth import get_current_user
from core.database import Intersection, Signal, TrafficData, User, get_db
from schemas.intersection import IntersectionCreate, IntersectionUpdate

router = APIRouter()


def _serialize_intersection(intersection: Intersection) -> dict:
    return {
        "id": intersection.id,
        "name": intersection.name,
        "location": intersection.location,
        "latitude": intersection.latitude,
        "longitude": intersection.longitude,
        "description": intersection.description,
        "is_active": intersection.is_active,
        "created_at": intersection.created_at,
        "updated_at": intersection.updated_at,
    }


@router.get("/", response_model=list[dict])
async def read_intersections(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List intersections."""
    result = await db.execute(select(Intersection).offset(skip).limit(limit))
    return [_serialize_intersection(item) for item in result.scalars().all()]


@router.post("/", response_model=dict)
async def create_intersection(
    intersection: IntersectionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a new intersection."""
    existing = await db.scalar(select(Intersection).where(Intersection.name == intersection.name))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Intersection with this name already exists",
        )

    new_intersection = Intersection(**intersection.model_dump())
    db.add(new_intersection)
    await db.commit()
    await db.refresh(new_intersection)
    return _serialize_intersection(new_intersection)


@router.get("/{intersection_id}", response_model=dict)
async def read_intersection(
    intersection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return one intersection by ID."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )
    return _serialize_intersection(intersection)


@router.put("/{intersection_id}", response_model=dict)
async def update_intersection(
    intersection_id: int,
    intersection_update: IntersectionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update an existing intersection."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    for field, value in intersection_update.model_dump(exclude_unset=True).items():
        setattr(intersection, field, value)

    await db.commit()
    await db.refresh(intersection)
    return _serialize_intersection(intersection)


@router.delete("/{intersection_id}")
async def delete_intersection(
    intersection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete an intersection."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    await db.delete(intersection)
    await db.commit()
    return {"message": "Intersection deleted successfully"}


@router.get("/{intersection_id}/status")
async def get_intersection_status(
    intersection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return a compact operational snapshot for one intersection."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    latest_traffic = await db.scalar(
        select(TrafficData)
        .where(TrafficData.intersection_id == intersection_id)
        .order_by(desc(TrafficData.timestamp))
        .limit(1)
    )
    latest_signal = await db.scalar(
        select(Signal)
        .where(Signal.intersection_id == intersection_id)
        .order_by(desc(Signal.last_updated))
        .limit(1)
    )

    return {
        "intersection_id": intersection.id,
        "name": intersection.name,
        "location": intersection.location,
        "status": "active" if intersection.is_active else "inactive",
        "current_signal_phase": latest_signal.current_state if latest_signal else "unknown",
        "traffic_density": latest_traffic.congestion_level if latest_traffic else "unknown",
        "last_seen": latest_traffic.timestamp if latest_traffic else None,
    }
