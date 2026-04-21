"""
Intersection Pydantic Schemas
Data validation models for intersection operations.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class IntersectionBase(BaseModel):
    """Base intersection schema."""
    name: str
    location: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    is_active: bool = True


class IntersectionCreate(IntersectionBase):
    """Schema for intersection creation."""
    pass


class IntersectionUpdate(BaseModel):
    """Schema for intersection updates."""
    name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class Intersection(IntersectionBase):
    """Complete intersection schema with ID and timestamps."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True