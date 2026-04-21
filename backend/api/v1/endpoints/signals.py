"""
Signal control endpoints.
"""

from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.endpoints.auth import get_current_user
from core.database import Intersection, Signal, User, get_db
from schemas.signal import SignalControl, SignalCreate, SignalUpdate

router = APIRouter()


def _serialize_signal(signal: Signal) -> dict:
    return {
        "id": signal.id,
        "intersection_id": signal.intersection_id,
        "direction": signal.direction,
        "current_state": signal.current_state,
        "is_manual_override": signal.is_manual_override,
        "override_duration": signal.override_duration,
        "cycle_time": signal.cycle_time,
        "green_time": signal.green_time,
        "yellow_time": signal.yellow_time,
        "last_updated": signal.last_updated,
        "created_at": signal.created_at,
        "updated_at": signal.updated_at,
    }


@router.get("/", response_model=list[dict])
async def read_signals(
    intersection_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List signals, optionally for a single intersection."""
    query = select(Signal)
    if intersection_id is not None:
        query = query.where(Signal.intersection_id == intersection_id)

    result = await db.execute(query)
    return [_serialize_signal(signal) for signal in result.scalars().all()]


@router.post("/", response_model=dict)
async def create_signal(
    signal: SignalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a signal configuration."""
    intersection = await db.get(Intersection, signal.intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    new_signal = Signal(**signal.model_dump(), last_updated=datetime.utcnow())
    db.add(new_signal)
    await db.commit()
    await db.refresh(new_signal)
    return _serialize_signal(new_signal)


@router.get("/{signal_id}", response_model=dict)
async def read_signal(
    signal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return one signal by ID."""
    signal = await db.get(Signal, signal_id)
    if signal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found",
        )
    return _serialize_signal(signal)


@router.put("/{signal_id}", response_model=dict)
async def update_signal(
    signal_id: int,
    signal_update: SignalUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update a signal definition."""
    signal = await db.get(Signal, signal_id)
    if signal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found",
        )

    for field, value in signal_update.model_dump(exclude_unset=True).items():
        setattr(signal, field, value)
    signal.last_updated = datetime.utcnow()

    await db.commit()
    await db.refresh(signal)
    return _serialize_signal(signal)


@router.post("/{signal_id}/control")
async def control_signal(
    signal_id: int,
    control: SignalControl,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Apply a manual override to a signal."""
    signal = await db.get(Signal, signal_id)
    if signal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found",
        )

    signal.current_state = control.state
    signal.is_manual_override = control.manual_override
    signal.override_duration = control.duration_seconds
    signal.last_updated = datetime.utcnow()

    await db.commit()
    await db.refresh(signal)
    return {
        "signal_id": signal.id,
        "new_state": signal.current_state,
        "manual_override": signal.is_manual_override,
        "duration_seconds": signal.override_duration,
        "updated_at": signal.last_updated.isoformat(),
    }


@router.post("/{signal_id}/reset")
async def reset_signal(
    signal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Clear manual override settings for a signal."""
    signal = await db.get(Signal, signal_id)
    if signal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found",
        )

    signal.is_manual_override = False
    signal.override_duration = None
    signal.last_updated = datetime.utcnow()

    await db.commit()
    await db.refresh(signal)
    return {
        "signal_id": signal.id,
        "message": "Signal reset to automatic control",
        "updated_at": signal.last_updated.isoformat(),
    }


@router.get("/intersection/{intersection_id}/status")
async def get_intersection_signals_status(
    intersection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return all signals attached to an intersection."""
    signals = (
        await db.execute(select(Signal).where(Signal.intersection_id == intersection_id))
    ).scalars().all()

    if not signals:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No signals found for this intersection",
        )

    return {
        "intersection_id": intersection_id,
        "signals": [
            {
                "signal_id": signal.id,
                "direction": signal.direction,
                "current_state": signal.current_state,
                "is_manual_override": signal.is_manual_override,
                "last_updated": signal.last_updated.isoformat(),
            }
            for signal in signals
        ],
        "total_signals": len(signals),
        "manual_overrides": sum(1 for signal in signals if signal.is_manual_override),
    }


@router.delete("/{signal_id}")
async def delete_signal(
    signal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete a signal."""
    signal = await db.get(Signal, signal_id)
    if signal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signal not found",
        )

    await db.delete(signal)
    await db.commit()
    return {"message": "Signal deleted successfully"}
