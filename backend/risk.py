"""Risk level thresholds - single source of truth for the API."""

HIGH_THRESHOLD = 0.7
MEDIUM_THRESHOLD = 0.4


def risk_level_for(probability: float) -> str:
    """Map a deterioration probability to LOW / MEDIUM / HIGH (lower bounds are inclusive)."""
    if probability >= HIGH_THRESHOLD:
        return "HIGH"
    if probability >= MEDIUM_THRESHOLD:
        return "MEDIUM"
    return "LOW"
