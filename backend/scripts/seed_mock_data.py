"""
Seed local development data for the FlowSync backend.
"""

import asyncio
from datetime import datetime, timedelta
import random

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import AIModel, Intersection, Signal, TrafficData, User, async_session, create_tables
from core.security import get_password_hash


async def create_mock_users(session: AsyncSession) -> None:
    """Create sample users."""
    users_data = [
        {
            "email": "admin@flowsync.ai",
            "username": "admin",
            "hashed_password": get_password_hash("admin123"),
            "full_name": "System Administrator",
            "is_active": True,
            "is_superuser": True,
            "role": "admin",
        },
        {
            "email": "operator@flowsync.ai",
            "username": "operator",
            "hashed_password": get_password_hash("operator123"),
            "full_name": "Traffic Operator",
            "is_active": True,
            "is_superuser": False,
            "role": "operator",
        },
        {
            "email": "viewer@flowsync.ai",
            "username": "viewer",
            "hashed_password": get_password_hash("viewer123"),
            "full_name": "Traffic Viewer",
            "is_active": True,
            "is_superuser": False,
            "role": "viewer",
        },
    ]

    for user_data in users_data:
        existing = await session.scalar(select(User).where(User.username == user_data["username"]))
        if not existing:
            session.add(User(**user_data))

    await session.commit()
    print("✓ Created mock users")


async def create_mock_intersections(session: AsyncSession) -> None:
    """Create sample intersections."""
    intersections_data = [
        {
            "name": "Main St & 1st Ave",
            "location": "Downtown Grid A",
            "latitude": 40.7589,
            "longitude": -73.9851,
            "description": "High-throughput commuter corridor",
            "is_active": True,
        },
        {
            "name": "Broadway & 42nd St",
            "location": "Theater District",
            "latitude": 40.7580,
            "longitude": -73.9855,
            "description": "Tourist-heavy pedestrian crossing",
            "is_active": True,
        },
        {
            "name": "5th Ave & 59th St",
            "location": "Midtown North",
            "latitude": 40.7644,
            "longitude": -73.9735,
            "description": "Retail and curbside loading pressure",
            "is_active": True,
        },
        {
            "name": "Park Ave & 34th St",
            "location": "Business Loop",
            "latitude": 40.7505,
            "longitude": -73.9934,
            "description": "Office exit traffic peak in the evening",
            "is_active": True,
        },
        {
            "name": "Lexington Ave & 53rd St",
            "location": "East Connector",
            "latitude": 40.7577,
            "longitude": -73.9692,
            "description": "Maintenance corridor with adaptive fallback timing",
            "is_active": False,
        },
    ]

    for intersection_data in intersections_data:
        existing = await session.scalar(
            select(Intersection).where(Intersection.name == intersection_data["name"])
        )
        if not existing:
            session.add(Intersection(**intersection_data))

    await session.commit()
    print("✓ Created mock intersections")


async def create_mock_signals(session: AsyncSession) -> None:
    """Create a four-way signal set for each intersection."""
    intersections = (await session.execute(select(Intersection))).scalars().all()

    for intersection in intersections:
        existing = await session.scalar(
            select(Signal).where(Signal.intersection_id == intersection.id)
        )
        if existing:
            continue

        for direction in ["north", "south", "east", "west"]:
            session.add(
                Signal(
                    intersection_id=intersection.id,
                    direction=direction,
                    current_state="green" if direction in {"north", "south"} else "red",
                    cycle_time=120,
                    green_time=35,
                    yellow_time=5,
                    is_manual_override=False,
                )
            )

    await session.commit()
    print("✓ Created mock signals")


async def create_mock_traffic_data(session: AsyncSession) -> None:
    """Create sample traffic data for the last 24 hours."""
    intersections = (await session.execute(select(Intersection))).scalars().all()
    if not intersections:
        print("No intersections found, skipping traffic data creation")
        return

    base_time = datetime.utcnow() - timedelta(hours=24)
    weather_conditions = ["clear", "cloudy", "rainy", "foggy"]
    congestion_levels = ["low", "medium", "high"]

    for intersection in intersections:
        for hour in range(24):
            for minute in range(0, 60, 5):
                timestamp = base_time + timedelta(hours=hour, minutes=minute)
                hour_of_day = timestamp.hour

                if 7 <= hour_of_day <= 9 or 17 <= hour_of_day <= 19:
                    vehicle_count = random.randint(50, 150)
                    avg_speed = random.uniform(15, 35)
                    congestion = random.choice(
                        ["medium", "high"] if vehicle_count > 100 else ["low", "medium"]
                    )
                else:
                    vehicle_count = random.randint(10, 80)
                    avg_speed = random.uniform(25, 50)
                    congestion = random.choice(congestion_levels)

                session.add(
                    TrafficData(
                        intersection_id=intersection.id,
                        timestamp=timestamp,
                        vehicle_count=vehicle_count,
                        vehicle_density=round(vehicle_count / random.uniform(2.2, 3.6), 2),
                        average_speed=round(avg_speed, 1),
                        congestion_level=congestion,
                        weather_condition=random.choice(weather_conditions),
                        temperature=round(random.uniform(10, 30), 1),
                    )
                )

    await session.commit()
    print("✓ Created mock traffic data")


async def create_mock_ai_models(session: AsyncSession) -> None:
    """Create sample AI model metadata."""
    models_data = [
        {
            "name": "Traffic Flow Predictor",
            "version": "2.1.0",
            "model_type": "prediction",
            "framework": "heuristic",
            "accuracy_score": 0.87,
            "last_trained": datetime.utcnow() - timedelta(days=7),
            "is_active": True,
        },
        {
            "name": "Signal Optimization Model",
            "version": "1.3.2",
            "model_type": "optimization",
            "framework": "heuristic",
            "accuracy_score": 0.92,
            "last_trained": datetime.utcnow() - timedelta(days=3),
            "is_active": True,
        },
        {
            "name": "Congestion Classifier",
            "version": "1.0.5",
            "model_type": "classification",
            "framework": "heuristic",
            "accuracy_score": 0.89,
            "last_trained": datetime.utcnow() - timedelta(days=14),
            "is_active": True,
        },
    ]

    existing_names = {
        item.name for item in (await session.execute(select(AIModel))).scalars().all()
    }
    for model_data in models_data:
        if model_data["name"] not in existing_names:
            session.add(AIModel(**model_data))

    await session.commit()
    print("✓ Created mock AI models")


async def seed_database() -> None:
    """Main function to seed the database with mock data."""
    await create_tables()
    async with async_session() as session:
        try:
            print("🌱 Starting database seeding...")
            await create_mock_users(session)
            await create_mock_intersections(session)
            await create_mock_signals(session)
            await create_mock_traffic_data(session)
            await create_mock_ai_models(session)
            print("✅ Database seeding completed successfully!")
        except Exception as exc:
            print(f"❌ Error during seeding: {exc}")
            await session.rollback()
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())
