"""
Prediction Pydantic Schemas
Data validation models for AI prediction operations.
"""

from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class PredictionBase(BaseModel):
    """Base prediction schema."""
    intersection_id: int
    prediction_type: str  # traffic_flow, congestion, speed, etc.
    predicted_density: float
    predicted_speed: Optional[float] = None
    confidence_score: float = 0.0
    prediction_window_minutes: int = 60
    model_version: str = "v1.0"
    features_used: Optional[Dict[str, Any]] = None
    timestamp: datetime


class PredictionCreate(PredictionBase):
    """Schema for prediction creation."""
    pass


class PredictionUpdate(BaseModel):
    """Schema for prediction updates."""
    predicted_density: Optional[float] = None
    predicted_speed: Optional[float] = None
    confidence_score: Optional[float] = None
    features_used: Optional[Dict[str, Any]] = None


class Prediction(PredictionBase):
    """Complete prediction schema with ID."""
    id: int

    class Config:
        from_attributes = True


class PredictionResponse(Prediction):
    """Prediction response schema with additional computed fields."""
    intersection_name: Optional[str] = None

    class Config:
        from_attributes = True