"""
Signal Pydantic Schemas
Data validation models for traffic signal operations.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class SignalBase(BaseModel):
    """Base signal schema."""
    intersection_id: int
    direction: str  # north, south, east, west, etc.
    current_state: str = "red"  # red, yellow, green
    is_manual_override: bool = False
    override_duration: Optional[int] = None  # seconds
    cycle_time: int = 120  # seconds for full cycle
    green_time: int = 30  # seconds
    yellow_time: int = 5  # seconds


class SignalCreate(SignalBase):
    """Schema for signal creation."""
    pass


class SignalUpdate(BaseModel):
    """Schema for signal updates."""
    direction: Optional[str] = None
    current_state: Optional[str] = None
    is_manual_override: Optional[bool] = None
    override_duration: Optional[int] = None
    cycle_time: Optional[int] = None
    green_time: Optional[int] = None
    yellow_time: Optional[int] = None


class Signal(SignalBase):
    """Complete signal schema with ID and timestamps."""
    id: int
    last_updated: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SignalControl(BaseModel):
    """Schema for signal control operations."""
    state: str  # red, yellow, green
    manual_override: bool = True
    duration_seconds: Optional[int] = None