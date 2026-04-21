"""
Security helpers for passwords and JWT tokens.
"""

from datetime import datetime, timedelta, timezone
from typing import Union

from jose import JWTError, jwt
from passlib.context import CryptContext

from core.config import settings
from schemas.auth import TokenData

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Compare a plain password against a stored hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    expires_delta: Union[timedelta, None] = None,
) -> str:
    """Create a signed access token."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    payload = {**data, "exp": expire, "type": "access"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict) -> str:
    """Create a signed refresh token."""
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {**data, "exp": expire, "type": "refresh"}
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def verify_token(token: str, token_type: str = "access") -> TokenData:
    """Validate a token and return its typed payload."""
    payload = jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )

    if payload.get("type") != token_type:
        raise JWTError("Invalid token type")

    user_id = payload.get("user_id")
    email = payload.get("sub")

    if user_id is None or email is None:
        raise JWTError("Token missing required fields")

    return TokenData(
        user_id=user_id,
        email=email,
        role=payload.get("role"),
    )


def decode_token(token: str) -> dict:
    """Decode a token without checking expiration. Handy for debugging."""
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": False},
        )
    except JWTError:
        return {}
