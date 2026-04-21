"""
Core configuration for the FlowSync backend.
"""

from typing import Any, List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )

    APP_NAME: str = "FlowSync AI Backend"
    VERSION: str = "2.0.0"
    DEBUG: bool = False

    HOST: str = "0.0.0.0"
    PORT: int = 8000
    ALLOWED_HOSTS: List[str] = ["*"]
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:5173",
    ]

    # SQLite keeps local development simple. Override this with Postgres in production.
    DATABASE_URL: str = "sqlite+aiosqlite:///./flowsync.db"
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    JWT_SECRET_KEY: str = Field(
        default="change-this-secret-before-production",
        description="Signing key for access and refresh tokens.",
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    TRAFFIC_UPDATE_INTERVAL: int = 5
    PREDICTION_INTERVAL: int = 60
    LOG_LEVEL: str = "INFO"

    @field_validator("ALLOWED_HOSTS", "ALLOWED_ORIGINS", mode="before")
    @classmethod
    def split_comma_lists(cls, value: Any) -> Any:
        """Accept comma-separated values from .env files."""
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


settings = Settings()


def get_settings() -> Settings:
    """Return the cached settings instance."""
    return settings
