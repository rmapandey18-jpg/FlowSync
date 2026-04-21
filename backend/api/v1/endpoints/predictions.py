"""
Prediction and optimization endpoints.
"""

from datetime import datetime, timedelta
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.endpoints.auth import get_current_user
from core.database import Intersection, Prediction, TrafficData, User, get_db
from schemas.prediction import PredictionCreate
from services.ai_service import AIService

router = APIRouter()
ai_service = AIService()


def _serialize_prediction(prediction: Prediction, intersection_name: str | None = None) -> dict:
    return {
        "id": prediction.id,
        "intersection_id": prediction.intersection_id,
        "prediction_type": prediction.prediction_type,
        "predicted_density": prediction.predicted_density,
        "predicted_speed": prediction.predicted_speed,
        "confidence_score": prediction.confidence_score,
        "prediction_window_minutes": prediction.prediction_window_minutes,
        "model_version": prediction.model_version,
        "features_used": prediction.features_used,
        "timestamp": prediction.timestamp,
        "intersection_name": intersection_name,
    }


@router.get("/", response_model=list[dict])
async def read_predictions(
    intersection_id: Optional[int] = None,
    prediction_type: Optional[str] = None,
    limit: int = Query(100, le=1000),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List prediction records."""
    query = select(Prediction).order_by(desc(Prediction.timestamp)).limit(limit)
    if intersection_id is not None:
        query = query.where(Prediction.intersection_id == intersection_id)
    if prediction_type is not None:
        query = query.where(Prediction.prediction_type == prediction_type)

    result = await db.execute(query)
    return [_serialize_prediction(item) for item in result.scalars().all()]


@router.post("/", response_model=dict)
async def create_prediction(
    prediction: PredictionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Create a prediction record manually."""
    intersection = await db.get(Intersection, prediction.intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    new_prediction = Prediction(**prediction.model_dump())
    db.add(new_prediction)
    await db.commit()
    await db.refresh(new_prediction)
    return _serialize_prediction(new_prediction, intersection.name)


@router.post("/generate/{intersection_id}", response_model=dict)
async def generate_prediction(
    intersection_id: int,
    prediction_type: str = Query("traffic_flow", description="Type of prediction"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Generate a prediction from recent traffic history."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    prediction = await ai_service.generate_prediction(intersection_id, prediction_type, db)
    if prediction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not enough traffic history to generate a prediction",
        )

    return _serialize_prediction(prediction, intersection.name)


@router.get("/latest/{intersection_id}", response_model=dict)
async def get_latest_prediction(
    intersection_id: int,
    prediction_type: str = Query("traffic_flow", description="Type of prediction"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return the most recent prediction for one intersection."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    latest = await db.scalar(
        select(Prediction)
        .where(Prediction.intersection_id == intersection_id)
        .where(Prediction.prediction_type == prediction_type)
        .order_by(desc(Prediction.timestamp))
        .limit(1)
    )
    if latest is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No prediction found for this intersection and type",
        )

    return _serialize_prediction(latest, intersection.name)


@router.get("/forecast/{intersection_id}")
async def get_traffic_forecast(
    intersection_id: int,
    hours_ahead: int = Query(24, le=168, description="Hours to forecast ahead"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return a simple forward forecast using recent predictions or traffic history."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    recent_predictions = (
        await db.execute(
            select(Prediction)
            .where(Prediction.intersection_id == intersection_id)
            .where(Prediction.timestamp >= datetime.utcnow() - timedelta(hours=24))
            .order_by(desc(Prediction.timestamp))
            .limit(12)
        )
    ).scalars().all()

    if not recent_predictions:
        generated = await ai_service.generate_prediction(intersection_id, "traffic_flow", db)
        if generated:
            recent_predictions = [generated]

    if not recent_predictions:
        return {
            "intersection_id": intersection_id,
            "forecast_hours": hours_ahead,
            "message": "No recent predictions available",
            "forecast_data": [],
        }

    baseline_density = sum(item.predicted_density for item in recent_predictions) / len(recent_predictions)
    speed_values = [item.predicted_speed for item in recent_predictions if item.predicted_speed is not None]
    baseline_speed = sum(speed_values) / len(speed_values) if speed_values else None

    forecast_data = []
    for hour in range(hours_ahead):
        drift = (hour % 6) * 0.02
        forecast_data.append(
            {
                "timestamp": (datetime.utcnow() + timedelta(hours=hour)).isoformat(),
                "predicted_density": round(baseline_density * (1 + drift), 2),
                "predicted_speed": round((baseline_speed or 0) * (1 - drift / 2), 2)
                if baseline_speed is not None
                else None,
                "confidence": round(max(0.55, 0.88 - (hour * 0.01)), 2),
            }
        )

    return {
        "intersection_id": intersection_id,
        "intersection_name": intersection.name,
        "forecast_hours": hours_ahead,
        "forecast_data": forecast_data,
        "model_version": "heuristic-v1",
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.get("/optimize/{intersection_id}")
async def get_signal_optimization(
    intersection_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return a green-time recommendation from recent traffic load."""
    intersection = await db.get(Intersection, intersection_id)
    if intersection is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Intersection not found",
        )

    recent_traffic = (
        await db.execute(
            select(TrafficData)
            .where(TrafficData.intersection_id == intersection_id)
            .order_by(desc(TrafficData.timestamp))
            .limit(5)
        )
    ).scalars().all()

    if not recent_traffic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No recent traffic data available for optimization",
        )

    avg_density = sum(data.vehicle_density for data in recent_traffic) / len(recent_traffic)
    optimization = ai_service.optimize_signal_timing(avg_density)
    return {
        "intersection_id": intersection_id,
        "intersection_name": intersection.name,
        **optimization,
    }


@router.delete("/{prediction_id}")
async def delete_prediction(
    prediction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete a prediction record."""
    prediction = await db.get(Prediction, prediction_id)
    if prediction is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction not found",
        )

    await db.delete(prediction)
    await db.commit()
    return {"message": "Prediction deleted successfully"}
