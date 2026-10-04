"""Request / response schemas for the BioSignal API.

Each vital sign is described by four window statistics (mean, std, min, max). Inputs are
validated against wide physiological bounds so that obvious garbage (negative heart rate,
SpO2 above 100, NaN, ...) is rejected with HTTP 422 instead of reaching the model.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field, model_validator

# Order matters: it matches backend/models/feature_cols.json.
FEATURE_NAMES: dict[str, str] = {
    "heart_rate": "Heart Rate",
    "spo2": "SpO2",
    "bp_systolic": "BP Systolic",
    "bp_diastolic": "BP Diastolic",
    "respiratory_rate": "Respiratory Rate",
}
STATS: tuple[str, ...] = ("mean", "std", "min", "max")

FEATURE_COLUMNS: list[str] = [
    f"{FEATURE_NAMES[signal]}_{stat}" for signal in FEATURE_NAMES for stat in STATS
]

_ORDER_TOLERANCE = 1e-6


def _bounded(low: float, high: float):
    """A required finite float within [low, high]."""
    return Field(..., ge=low, le=high, allow_inf_nan=False)


class VitalsInput(BaseModel):
    # Heart rate (beats/min)
    heart_rate_mean: float = _bounded(0, 300)
    heart_rate_std: float = _bounded(0, 150)
    heart_rate_min: float = _bounded(0, 300)
    heart_rate_max: float = _bounded(0, 300)
    # Oxygen saturation (%)
    spo2_mean: float = _bounded(0, 100)
    spo2_std: float = _bounded(0, 50)
    spo2_min: float = _bounded(0, 100)
    spo2_max: float = _bounded(0, 100)
    # Systolic blood pressure (mmHg)
    bp_systolic_mean: float = _bounded(0, 350)
    bp_systolic_std: float = _bounded(0, 150)
    bp_systolic_min: float = _bounded(0, 350)
    bp_systolic_max: float = _bounded(0, 350)
    # Diastolic blood pressure (mmHg)
    bp_diastolic_mean: float = _bounded(0, 250)
    bp_diastolic_std: float = _bounded(0, 150)
    bp_diastolic_min: float = _bounded(0, 250)
    bp_diastolic_max: float = _bounded(0, 250)
    # Respiratory rate (breaths/min)
    respiratory_rate_mean: float = _bounded(0, 100)
    respiratory_rate_std: float = _bounded(0, 50)
    respiratory_rate_min: float = _bounded(0, 100)
    respiratory_rate_max: float = _bounded(0, 100)

    @model_validator(mode="after")
    def _min_mean_max_are_ordered(self) -> "VitalsInput":
        for signal in FEATURE_NAMES:
            low = getattr(self, f"{signal}_min")
            mean = getattr(self, f"{signal}_mean")
            high = getattr(self, f"{signal}_max")
            if low > mean + _ORDER_TOLERANCE or mean > high + _ORDER_TOLERANCE:
                raise ValueError(
                    f"{signal}: expected min <= mean <= max (got min={low}, mean={mean}, max={high})"
                )
        return self


class TopFactor(BaseModel):
    feature: str
    impact: float


class PredictionResponse(BaseModel):
    risk_score: float
    risk_level: Literal["LOW", "MEDIUM", "HIGH"]
    top_factors: list[TopFactor]


def to_feature_row(vitals: VitalsInput) -> dict[str, float]:
    """Map API field names (heart_rate_mean) to the model's feature names (Heart Rate_mean)."""
    return {
        f"{FEATURE_NAMES[signal]}_{stat}": getattr(vitals, f"{signal}_{stat}")
        for signal in FEATURE_NAMES
        for stat in STATS
    }
