"""
Traffic Data Pydantic Schemas
Data validation models for traffic data operations.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class TrafficDataBase(BaseModel):
    """Base traffic data schema."""
    intersection_id: int
    vehicle_count: int
    vehicle_density: float
    average_speed: Optional[float] = None
    congestion_level: str = "low"  # low, medium, high, severe
    weather_condition: Optional[str] = None
    temperature: Optional[float] = None
    timestamp: datetime


class TrafficDataCreate(TrafficDataBase):
    """Schema for traffic data creation."""
    pass


class TrafficDataUpdate(BaseModel):
    """Schema for traffic data updates."""
    vehicle_count: Optional[int] = None
    vehicle_density: Optional[float] = None
    average_speed: Optional[float] = None
    congestion_level: Optional[str] = None
    weather_condition: Optional[str] = None
    temperature: Optional[float] = None


class TrafficData(TrafficDataBase):
    """Complete traffic data schema with ID."""
    id: int

    class Config:
        from_attributes = True


class TrafficDataResponse(TrafficData):
    """Traffic data response schema with additional computed fields."""
    intersection_name: Optional[str] = None

    class Config:
        from_attributes = True