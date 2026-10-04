import json
from pathlib import Path

import pytest
from pydantic import ValidationError

from schemas import FEATURE_COLUMNS, VitalsInput, to_feature_row
from tests.conftest import DEMO_PATIENTS


def test_all_demo_patients_are_valid():
    for patient in DEMO_PATIENTS:
        VitalsInput(**patient)


def test_feature_columns_match_the_model_feature_file():
    path = Path(__file__).resolve().parent.parent / "models" / "feature_cols.json"
    assert json.loads(path.read_text(encoding="utf-8")) == FEATURE_COLUMNS


def test_to_feature_row_maps_names_and_values(valid_payload):
    row = to_feature_row(VitalsInput(**valid_payload))
    assert list(row) == FEATURE_COLUMNS
    assert row["Heart Rate_mean"] == valid_payload["heart_rate_mean"]
    assert row["SpO2_max"] == valid_payload["spo2_max"]
    assert row["BP Diastolic_min"] == valid_payload["bp_diastolic_min"]
    assert row["Respiratory Rate_std"] == valid_payload["respiratory_rate_std"]


def test_missing_field_is_rejected(valid_payload):
    del valid_payload["spo2_mean"]
    with pytest.raises(ValidationError):
        VitalsInput(**valid_payload)


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("heart_rate_mean", -1),
        ("heart_rate_max", 301),
        ("spo2_mean", 100.5),
        ("spo2_max", 150),
        ("bp_systolic_mean", 351),
        ("bp_diastolic_mean", 260),
        ("respiratory_rate_mean", 101),
        ("heart_rate_std", -0.1),
        ("spo2_std", 51),
    ],
)
def test_out_of_range_values_are_rejected(valid_payload, field, value):
    valid_payload[field] = value
    with pytest.raises(ValidationError):
        VitalsInput(**valid_payload)


@pytest.mark.parametrize("bad", [float("nan"), float("inf"), float("-inf")])
def test_non_finite_values_are_rejected(valid_payload, bad):
    valid_payload["heart_rate_mean"] = bad
    with pytest.raises(ValidationError):
        VitalsInput(**valid_payload)


def test_non_numeric_value_is_rejected(valid_payload):
    valid_payload["heart_rate_mean"] = "fast"
    with pytest.raises(ValidationError):
        VitalsInput(**valid_payload)


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("heart_rate_min", 200),  # min above mean
        ("heart_rate_max", 10),  # max below mean
        ("spo2_min", 99),
        ("respiratory_rate_max", 1),
    ],
)
def test_min_mean_max_must_be_ordered(valid_payload, field, value):
    valid_payload[field] = value
    with pytest.raises(ValidationError, match="min <= mean <= max"):
        VitalsInput(**valid_payload)


def test_min_equal_mean_equal_max_is_allowed(valid_payload):
    for stat in ("min", "max"):
        valid_payload[f"heart_rate_{stat}"] = valid_payload["heart_rate_mean"]
    VitalsInput(**valid_payload)
