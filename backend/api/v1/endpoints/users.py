"""
User management endpoints.
"""

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.v1.endpoints.auth import get_current_active_admin, get_current_user
from core.database import User, get_db
from core.security import get_password_hash
from schemas.user import UserUpdate

router = APIRouter()


def _apply_user_update(user: User, update_data: dict) -> None:
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    for field, value in update_data.items():
        setattr(user, field, value)


def _serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "is_active": user.is_active,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
    }


@router.get("/me", response_model=dict)
async def read_users_me(
    current_user: User = Depends(get_current_user),
) -> Any:
    """Return the authenticated user profile."""
    return _serialize_user(current_user)


@router.put("/me", response_model=dict)
async def update_user_me(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update the current user without allowing self-role changes."""
    update_data = user_update.model_dump(exclude_unset=True)
    update_data.pop("role", None)
    _apply_user_update(current_user, update_data)
    await db.commit()
    await db.refresh(current_user)
    return _serialize_user(current_user)


@router.get("/", response_model=list[dict])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """List users for admins."""
    result = await db.execute(select(User).offset(skip).limit(limit))
    return [_serialize_user(user) for user in result.scalars().all()]


@router.get("/{user_id}", response_model=dict)
async def read_user(
    user_id: int,
    current_user: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Return a single user by ID."""
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return _serialize_user(user)


@router.put("/{user_id}", response_model=dict)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Update a user by ID."""
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    _apply_user_update(user, user_update.model_dump(exclude_unset=True))
    await db.commit()
    await db.refresh(user)
    return _serialize_user(user)


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Delete a user by ID."""
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted successfully"}
