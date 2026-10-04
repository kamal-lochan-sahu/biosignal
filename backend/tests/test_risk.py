import pytest

from risk import HIGH_THRESHOLD, MEDIUM_THRESHOLD, risk_level_for


def test_thresholds_are_the_documented_values():
    assert HIGH_THRESHOLD == 0.7
    assert MEDIUM_THRESHOLD == 0.4


@pytest.mark.parametrize(
    ("probability", "expected"),
    [
        (0.0, "LOW"),
        (0.399, "LOW"),
        (0.4, "MEDIUM"),
        (0.5, "MEDIUM"),
        (0.699, "MEDIUM"),
        (0.7, "HIGH"),  # lower bounds are inclusive, matching the frontend
        (0.95, "HIGH"),
        (1.0, "HIGH"),
    ],
)
def test_risk_level_boundaries(probability, expected):
    assert risk_level_for(probability) == expected
