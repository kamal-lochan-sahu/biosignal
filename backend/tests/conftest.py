"""Shared test fixtures."""
import copy

import pytest

# The four demo patients shown in the dashboard (frontend/app/page.tsx).
DEMO_PATIENTS = [
    # P001 Rajesh Kumar
    {
        "heart_rate_mean": 112,
        "heart_rate_std": 6,
        "heart_rate_min": 100,
        "heart_rate_max": 128,
        "spo2_mean": 88,
        "spo2_std": 2,
        "spo2_min": 84,
        "spo2_max": 92,
        "bp_systolic_mean": 84,
        "bp_systolic_std": 4,
        "bp_systolic_min": 78,
        "bp_systolic_max": 92,
        "bp_diastolic_mean": 54,
        "bp_diastolic_std": 3,
        "bp_diastolic_min": 48,
        "bp_diastolic_max": 62,
        "respiratory_rate_mean": 29,
        "respiratory_rate_std": 4,
        "respiratory_rate_min": 24,
        "respiratory_rate_max": 36,
    },
    # P002 Priya Sharma
    {
        "heart_rate_mean": 88,
        "heart_rate_std": 4,
        "heart_rate_min": 80,
        "heart_rate_max": 96,
        "spo2_mean": 96,
        "spo2_std": 1,
        "spo2_min": 94,
        "spo2_max": 99,
        "bp_systolic_mean": 118,
        "bp_systolic_std": 5,
        "bp_systolic_min": 110,
        "bp_systolic_max": 128,
        "bp_diastolic_mean": 72,
        "bp_diastolic_std": 3,
        "bp_diastolic_min": 66,
        "bp_diastolic_max": 78,
        "respiratory_rate_mean": 16,
        "respiratory_rate_std": 2,
        "respiratory_rate_min": 14,
        "respiratory_rate_max": 20,
    },
    # P003 Amit Das
    {
        "heart_rate_mean": 102,
        "heart_rate_std": 8,
        "heart_rate_min": 90,
        "heart_rate_max": 118,
        "spo2_mean": 92,
        "spo2_std": 2,
        "spo2_min": 88,
        "spo2_max": 95,
        "bp_systolic_mean": 94,
        "bp_systolic_std": 6,
        "bp_systolic_min": 86,
        "bp_systolic_max": 104,
        "bp_diastolic_mean": 60,
        "bp_diastolic_std": 4,
        "bp_diastolic_min": 54,
        "bp_diastolic_max": 68,
        "respiratory_rate_mean": 22,
        "respiratory_rate_std": 3,
        "respiratory_rate_min": 18,
        "respiratory_rate_max": 28,
    },
    # P004 Sunita Patel
    {
        "heart_rate_mean": 74,
        "heart_rate_std": 3,
        "heart_rate_min": 68,
        "heart_rate_max": 82,
        "spo2_mean": 98,
        "spo2_std": 1,
        "spo2_min": 96,
        "spo2_max": 100,
        "bp_systolic_mean": 122,
        "bp_systolic_std": 4,
        "bp_systolic_min": 116,
        "bp_systolic_max": 130,
        "bp_diastolic_mean": 76,
        "bp_diastolic_std": 3,
        "bp_diastolic_min": 70,
        "bp_diastolic_max": 82,
        "respiratory_rate_mean": 14,
        "respiratory_rate_std": 1,
        "respiratory_rate_min": 13,
        "respiratory_rate_max": 16,
    },
]


@pytest.fixture
def valid_payload() -> dict:
    """A fresh, valid request body for /predict (the second demo patient)."""
    return copy.deepcopy(DEMO_PATIENTS[1])
