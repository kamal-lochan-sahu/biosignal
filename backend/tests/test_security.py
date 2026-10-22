import pytest
from fastapi.testclient import TestClient

import main
from ratelimit import SlidingWindowLimiter
from security import SECURITY_HEADERS

ORIGIN = "https://biosignal-puce.vercel.app"
client = TestClient(main.app)


@pytest.fixture(autouse=True)
def fresh_limiters(monkeypatch):
    """Every test starts with roomy, empty limiters; individual tests tighten them."""
    monkeypatch.setattr(main, "ip_limiter", SlidingWindowLimiter(1000))
    monkeypatch.setattr(main, "global_limiter", SlidingWindowLimiter(1000))


def post(payload, **headers):
    return client.post("/predict", json=payload, headers=headers)


# ------------------------------------------------------------------ rate limiting
def test_per_ip_limit_returns_429_with_retry_after(monkeypatch, valid_payload):
    monkeypatch.setattr(main, "ip_limiter", SlidingWindowLimiter(2))
    assert post(valid_payload).status_code == 200
    assert post(valid_payload).status_code == 200
    blocked = post(valid_payload)
    assert blocked.status_code == 429
    assert int(blocked.headers["retry-after"]) >= 1
    assert "Too many requests" in blocked.json()["detail"]


def test_health_is_never_rate_limited(monkeypatch):
    monkeypatch.setattr(main, "ip_limiter", SlidingWindowLimiter(1))
    monkeypatch.setattr(main, "global_limiter", SlidingWindowLimiter(1))
    assert all(client.get("/health").status_code == 200 for _ in range(20))


def test_a_spoofed_forwarded_for_header_does_not_bypass_the_limit(monkeypatch, valid_payload):
    monkeypatch.setattr(main, "ip_limiter", SlidingWindowLimiter(2))
    # same real client (rightmost entry), different forged leftmost entries
    codes = [post(valid_payload, **{"X-Forwarded-For": f"10.0.0.{i}, 203.0.113.7"}).status_code for i in range(3)]
    assert codes == [200, 200, 429]


def test_different_clients_have_separate_buckets(monkeypatch, valid_payload):
    monkeypatch.setattr(main, "ip_limiter", SlidingWindowLimiter(1))
    assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.1"}).status_code == 200
    assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.1"}).status_code == 429
    assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.2"}).status_code == 200


def test_global_limit_applies_across_clients(monkeypatch, valid_payload):
    monkeypatch.setattr(main, "global_limiter", SlidingWindowLimiter(2))
    assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.1"}).status_code == 200
    assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.2"}).status_code == 200
    assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.3"}).status_code == 429


def test_blocked_requests_do_not_use_up_the_global_budget(monkeypatch, valid_payload):
    monkeypatch.setattr(main, "ip_limiter", SlidingWindowLimiter(1))
    monkeypatch.setattr(main, "global_limiter", SlidingWindowLimiter(2))
    assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.1"}).status_code == 200
    for _ in range(5):
        assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.1"}).status_code == 429
    assert post(valid_payload, **{"X-Forwarded-For": "198.51.100.2"}).status_code == 200


def test_429_responses_carry_cors_headers_so_the_browser_can_read_them(monkeypatch, valid_payload):
    monkeypatch.setattr(main, "ip_limiter", SlidingWindowLimiter(1))
    post(valid_payload)
    blocked = client.post("/predict", json=valid_payload, headers={"Origin": ORIGIN})
    assert blocked.status_code == 429
    assert blocked.headers["access-control-allow-origin"] == ORIGIN


# ------------------------------------------------------------------ body size limit
def test_oversized_body_is_rejected_with_413(valid_payload):
    valid_payload["padding"] = "x" * (main.settings.max_body_bytes + 100)
    response = post(valid_payload)
    assert response.status_code == 413
    assert response.json() == {"detail": "Request body too large"}


def test_oversized_chunked_body_without_content_length_is_rejected():
    def chunks():
        for _ in range(main.settings.max_body_bytes // 1024 + 3):
            yield b"x" * 1024

    response = client.post("/predict", content=chunks(), headers={"Content-Type": "application/json"})
    assert response.status_code == 413


def test_normal_body_passes_through(valid_payload):
    assert post(valid_payload).status_code == 200


def test_413_responses_carry_cors_headers(valid_payload):
    valid_payload["padding"] = "x" * (main.settings.max_body_bytes + 100)
    response = client.post("/predict", json=valid_payload, headers={"Origin": ORIGIN})
    assert response.status_code == 413
    assert response.headers["access-control-allow-origin"] == ORIGIN


# ------------------------------------------------------------------ security headers
@pytest.mark.parametrize("path", ["/", "/health", "/openapi.json"])
def test_security_headers_are_present(path):
    response = client.get(path)
    for name, value in SECURITY_HEADERS.items():
        assert response.headers[name.lower()] == value


def test_predict_responses_are_never_cached(valid_payload):
    assert post(valid_payload).headers["cache-control"] == "no-store"
    assert "no-store" not in client.get("/health").headers.get("cache-control", "")


def test_error_responses_also_get_security_headers(valid_payload):
    valid_payload["spo2_mean"] = 150
    response = post(valid_payload)
    assert response.status_code == 422
    assert response.headers["x-content-type-options"] == "nosniff"


def test_swagger_docs_still_load():
    assert client.get("/docs").status_code == 200
