"""
Simple prediction service built on recent traffic history.
"""

from datetime import datetime, timedelta
import logging

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import Prediction, TrafficData

logger = logging.getLogger(__name__)


class AIService:
    """Use lightweight heuristics so the backend stays easy to run locally."""

    async def generate_prediction(
        self,
        intersection_id: int,
        prediction_type: str,
        db: AsyncSession,
    ) -> Prediction | None:
        """Create a prediction from recent traffic history."""
        historical_data = await self._get_historical_data(intersection_id, db)
        if len(historical_data) < 3:
            return None

        recent = historical_data[-6:]
        weighted_densities = self._weighted_average([item.vehicle_density for item in recent])
        speed_values = [item.average_speed for item in recent if item.average_speed is not None]
        weighted_speed = self._weighted_average(speed_values) if speed_values else None

        prediction = Prediction(
            intersection_id=intersection_id,
            prediction_type=prediction_type,
            predicted_density=round(weighted_densities, 2),
            predicted_speed=round(weighted_speed, 2) if weighted_speed is not None else None,
            confidence_score=round(min(0.95, 0.6 + len(recent) * 0.04), 2),
            prediction_window_minutes=60,
            model_version="heuristic-v1",
            features_used={
                "sample_count": len(recent),
                "latest_density": recent[-1].vehicle_density,
                "latest_speed": recent[-1].average_speed,
            },
            timestamp=datetime.utcnow(),
        )
        db.add(prediction)
        await db.commit()
        await db.refresh(prediction)
        logger.info("Generated %s prediction for intersection %s", prediction_type, intersection_id)
        return prediction

    async def _get_historical_data(
        self,
        intersection_id: int,
        db: AsyncSession,
        hours: int = 24,
    ) -> list[TrafficData]:
        """Load recent traffic data for one intersection."""
        result = await db.execute(
            select(TrafficData)
            .where(TrafficData.intersection_id == intersection_id)
            .where(TrafficData.timestamp >= datetime.utcnow() - timedelta(hours=hours))
            .order_by(TrafficData.timestamp)
        )
        return result.scalars().all()

    def _weighted_average(self, values: list[float]) -> float:
        """Bias toward recent samples."""
        if not values:
            return 0.0
        weights = list(range(1, len(values) + 1))
        return sum(value * weight for value, weight in zip(values, weights)) / sum(weights)

    def optimize_signal_timing(self, density: float) -> dict:
        """Return a simple green-time recommendation from density."""
        if density < 20:
            green_time = 25
            reason = "Low traffic density detected"
        elif density < 45:
            green_time = 40
            reason = "Moderate traffic density detected"
        else:
            green_time = 55
            reason = "Heavy traffic density detected"

        return {
            "recommended_green_time": green_time,
            "current_density": round(density, 2),
            "optimization_reason": reason,
            "confidence_score": 0.84,
            "estimated_wait_time_reduction": f"{round(green_time * 0.12, 1)} seconds",
            "generated_at": datetime.utcnow().isoformat(),
        }
