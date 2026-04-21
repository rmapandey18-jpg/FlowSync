"""
Database configuration, ORM models, and session helpers.
"""

from __future__ import annotations

from datetime import datetime
from typing import AsyncGenerator
import logging

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from .config import settings

logger = logging.getLogger(__name__)


def _build_engine_kwargs(database_url: str) -> dict:
    kwargs = {"echo": settings.DEBUG}
    if database_url.startswith("sqlite+aiosqlite"):
        kwargs["connect_args"] = {"check_same_thread": False}
    else:
        kwargs["pool_size"] = settings.DB_POOL_SIZE
        kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    return kwargs


engine = create_async_engine(
    settings.DATABASE_URL,
    **_build_engine_kwargs(settings.DATABASE_URL),
)
async_session = async_sessionmaker(engine, expire_on_commit=False)


class Base(DeclarativeBase):
    """Base class for ORM models."""


class TimestampMixin:
    """Created and updated timestamps shared across models."""

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class User(Base, TimestampMixin):
    """Authenticated dashboard user."""

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    role: Mapped[str] = mapped_column(String(20), default="viewer")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_superuser: Mapped[bool] = mapped_column(Boolean, default=False)


class Intersection(Base, TimestampMixin):
    """Physical traffic intersection monitored by the system."""

    __tablename__ = "intersections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    location: Mapped[str] = mapped_column(String(120))
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    traffic_data: Mapped[list["TrafficData"]] = relationship(
        back_populates="intersection",
        cascade="all, delete-orphan",
    )
    predictions: Mapped[list["Prediction"]] = relationship(
        back_populates="intersection",
        cascade="all, delete-orphan",
    )
    signals: Mapped[list["Signal"]] = relationship(
        back_populates="intersection",
        cascade="all, delete-orphan",
    )


class TrafficData(Base):
    """Observed traffic sample for an intersection."""

    __tablename__ = "traffic_data"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    intersection_id: Mapped[int] = mapped_column(ForeignKey("intersections.id"), index=True)
    vehicle_count: Mapped[int] = mapped_column(Integer, default=0)
    vehicle_density: Mapped[float] = mapped_column(Float, default=0.0)
    average_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    congestion_level: Mapped[str] = mapped_column(String(20), default="low")
    weather_condition: Mapped[str | None] = mapped_column(String(40), nullable=True)
    temperature: Mapped[float | None] = mapped_column(Float, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    intersection: Mapped["Intersection"] = relationship(back_populates="traffic_data")


class Prediction(Base):
    """Generated forecast for an intersection."""

    __tablename__ = "predictions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    intersection_id: Mapped[int] = mapped_column(ForeignKey("intersections.id"), index=True)
    prediction_type: Mapped[str] = mapped_column(String(40), default="traffic_flow")
    predicted_density: Mapped[float] = mapped_column(Float)
    predicted_speed: Mapped[float | None] = mapped_column(Float, nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, default=0.0)
    prediction_window_minutes: Mapped[int] = mapped_column(Integer, default=60)
    model_version: Mapped[str] = mapped_column(String(20), default="heuristic-v1")
    features_used: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    intersection: Mapped["Intersection"] = relationship(back_populates="predictions")


class Signal(Base, TimestampMixin):
    """Signal control configuration per direction."""

    __tablename__ = "signals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    intersection_id: Mapped[int] = mapped_column(ForeignKey("intersections.id"), index=True)
    direction: Mapped[str] = mapped_column(String(30))
    current_state: Mapped[str] = mapped_column(String(10), default="red")
    is_manual_override: Mapped[bool] = mapped_column(Boolean, default=False)
    override_duration: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cycle_time: Mapped[int] = mapped_column(Integer, default=120)
    green_time: Mapped[int] = mapped_column(Integer, default=30)
    yellow_time: Mapped[int] = mapped_column(Integer, default=5)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    intersection: Mapped["Intersection"] = relationship(back_populates="signals")


class TrafficEvent(Base):
    """Operational incident or notable network event."""

    __tablename__ = "traffic_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    intersection_id: Mapped[int | None] = mapped_column(
        ForeignKey("intersections.id"),
        nullable=True,
    )
    event_type: Mapped[str] = mapped_column(String(40))
    severity: Mapped[str] = mapped_column(String(20), default="low")
    description: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class AIModel(Base):
    """Metadata about prediction strategies in use."""

    __tablename__ = "ai_models"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    version: Mapped[str] = mapped_column(String(20))
    model_type: Mapped[str] = mapped_column(String(50))
    framework: Mapped[str] = mapped_column(String(50))
    accuracy_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    last_trained: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    hyperparameters: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    training_data_info: Mapped[dict | None] = mapped_column(JSON, nullable=True)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield a database session for request handling."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables() -> None:
    """Create all tables if they do not already exist."""
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    logger.info("Database tables are ready")


async def drop_tables() -> None:
    """Drop all tables. Useful in tests or local resets."""
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.drop_all)
    logger.info("Database tables dropped")
