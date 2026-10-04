import pytest
from fastapi.testclient import TestClient

from main import app, feature_cols
from risk import risk_level_for
from tests.conftest import DEMO_PATIENTS

ALLOWED_ORIGIN = "https://biosignal-puce.vercel.app"

client = TestClient(app)


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "BioSignal API running"}


def test_health_supports_get_and_head():
    assert client.get("/health").json() == {"status": "ok"}
    assert client.head("/health").status_code == 200


@pytest.mark.parametrize("payload", DEMO_PATIENTS, ids=["P001", "P002", "P003", "P004"])
def test_predict_returns_the_documented_contract(payload):
    response = client.post("/predict", json=payload)
    assert response.status_code == 200
    body = response.json()

    assert set(body) == {"risk_score", "risk_level", "top_factors"}
    assert 0.0 <= body["risk_score"] <= 1.0
    assert body["risk_level"] in {"LOW", "MEDIUM", "HIGH"}
    assert body["risk_level"] == risk_level_for(body["risk_score"])

    factors = body["top_factors"]
    assert len(factors) == 5
    assert all(set(f) == {"feature", "impact"} for f in factors)
    assert all(f["feature"] in feature_cols for f in factors)
    impacts = [abs(f["impact"]) for f in factors]
    assert impacts == sorted(impacts, reverse=True)


def test_predict_is_deterministic(valid_payload):
    first = client.post("/predict", json=valid_payload).json()
    second = client.post("/predict", json=valid_payload).json()
    assert first == second


def test_predict_rejects_out_of_range_input(valid_payload):
    valid_payload["spo2_mean"] = 150
    response = client.post("/predict", json=valid_payload)
    assert response.status_code == 422


def test_predict_rejects_missing_fields(valid_payload):
    del valid_payload["heart_rate_mean"]
    assert client.post("/predict", json=valid_payload).status_code == 422


def test_predict_rejects_inconsistent_min_mean_max(valid_payload):
    valid_payload["heart_rate_min"] = 250
    assert client.post("/predict", json=valid_payload).status_code == 422


def test_predict_rejects_non_json_body():
    assert client.post("/predict", content="not json", headers={"Content-Type": "application/json"}).status_code == 422


def test_cors_allows_the_deployed_frontend():
    response = client.options(
        "/predict",
        headers={"Origin": ALLOWED_ORIGIN, "Access-Control-Request-Method": "POST", "Access-Control-Request-Headers": "content-type"},
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == ALLOWED_ORIGIN


def test_cors_does_not_allow_other_origins():
    response = client.options(
        "/predict",
        headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "POST"},
    )
    assert "access-control-allow-origin" not in response.headers
