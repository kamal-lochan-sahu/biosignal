"""CLIENT_IP_HEADER option, the temporary /debug/client diagnostic and HEAD /."""
import dataclasses

import pytest
from fastapi.testclient import TestClient
from starlette.requests import Request

import main
from config import load_settings
from ratelimit import SlidingWindowLimiter, client_ip

client = TestClient(main.app)


def request_with(headers: dict[str, str], client_addr=("9.9.9.9", 1234)) -> Request:
    scope = {"type": "http", "headers": [(k.lower().encode(), v.encode()) for k, v in headers.items()], "client": client_addr}
    return Request(scope)


# ------------------------------------------------------------------ settings
def test_new_settings_default_to_off(monkeypatch):
    monkeypatch.delenv("CLIENT_IP_HEADER", raising=False)
    monkeypatch.delenv("ENABLE_CLIENT_DEBUG", raising=False)
    settings = load_settings()
    assert settings.client_ip_header == ""
    assert settings.enable_client_debug is False


@pytest.mark.parametrize("value", ["1", "true", "TRUE", "yes", "on"])
def test_debug_flag_accepts_common_truthy_values(monkeypatch, value):
    monkeypatch.setenv("ENABLE_CLIENT_DEBUG", value)
    assert load_settings().enable_client_debug is True


@pytest.mark.parametrize("value", ["0", "false", "", "no", "maybe"])
def test_debug_flag_rejects_everything_else(monkeypatch, value):
    monkeypatch.setenv("ENABLE_CLIENT_DEBUG", value)
    assert load_settings().enable_client_debug is False


def test_client_ip_header_name_is_normalised(monkeypatch):
    monkeypatch.setenv("CLIENT_IP_HEADER", "  CF-Connecting-IP ")
    assert load_settings().client_ip_header == "cf-connecting-ip"


# ------------------------------------------------------------------ client_ip with a platform header
def test_platform_header_takes_precedence():
    request = request_with({"CF-Connecting-IP": "203.0.113.9", "X-Forwarded-For": "1.1.1.1, 2.2.2.2"})
    assert client_ip(request, 1, "cf-connecting-ip") == "203.0.113.9"


def test_platform_header_uses_the_first_value_if_it_holds_a_list():
    assert client_ip(request_with({"True-Client-IP": "203.0.113.9, 10.0.0.1"}), 1, "true-client-ip") == "203.0.113.9"


def test_falls_back_to_forwarded_for_when_the_platform_header_is_missing_or_empty():
    request = request_with({"X-Forwarded-For": "1.1.1.1, 2.2.2.2"})
    assert client_ip(request, 1, "cf-connecting-ip") == "2.2.2.2"
    assert client_ip(request_with({"CF-Connecting-IP": "  ", "X-Forwarded-For": "1.1.1.1, 2.2.2.2"}), 1, "cf-connecting-ip") == "2.2.2.2"


def test_configured_header_drives_the_rate_limit(monkeypatch, valid_payload):
    monkeypatch.setattr(main, "settings", dataclasses.replace(main.settings, client_ip_header="cf-connecting-ip"))
    monkeypatch.setattr(main, "ip_limiter", SlidingWindowLimiter(1))
    monkeypatch.setattr(main, "global_limiter", SlidingWindowLimiter(1000))
    # the proxy chain keeps changing, but the platform header identifies the same client
    first = client.post("/predict", json=valid_payload, headers={"CF-Connecting-IP": "203.0.113.9", "X-Forwarded-For": "a, b"})
    second = client.post("/predict", json=valid_payload, headers={"CF-Connecting-IP": "203.0.113.9", "X-Forwarded-For": "c, d"})
    other = client.post("/predict", json=valid_payload, headers={"CF-Connecting-IP": "203.0.113.10"})
    assert (first.status_code, second.status_code, other.status_code) == (200, 429, 200)


# ------------------------------------------------------------------ /debug/client
def test_debug_endpoint_is_hidden_by_default():
    response = client.get("/debug/client")
    assert response.status_code == 404
    assert response.json() == {"detail": "Not Found"}


def test_debug_endpoint_is_not_listed_in_the_api_schema():
    assert "/debug/client" not in client.get("/openapi.json").json()["paths"]


def test_debug_endpoint_reports_the_callers_own_proxy_chain(monkeypatch):
    monkeypatch.setattr(main, "settings", dataclasses.replace(main.settings, enable_client_debug=True, trusted_proxy_count=2))
    response = client.get("/debug/client", headers={"X-Forwarded-For": "203.0.113.9, 198.51.100.1", "CF-Connecting-IP": "203.0.113.9"})
    assert response.status_code == 200
    body = response.json()
    assert body["chosen_key"] == "203.0.113.9"  # second entry from the right
    assert body["trusted_proxy_count"] == 2
    assert body["proxy_headers"]["x-forwarded-for"] == "203.0.113.9, 198.51.100.1"
    assert body["proxy_headers"]["cf-connecting-ip"] == "203.0.113.9"
    assert "x-forwarded-for" in body["header_names"]


def test_debug_endpoint_never_shows_credentials(monkeypatch):
    monkeypatch.setattr(main, "settings", dataclasses.replace(main.settings, enable_client_debug=True))
    response = client.get("/debug/client", headers={"Authorization": "Bearer top-secret", "Cookie": "session=top-secret"})
    assert "top-secret" not in response.text
    assert "authorization" not in response.json()["header_names"]
    assert "cookie" not in response.json()["header_names"]


# ------------------------------------------------------------------ HEAD /
def test_head_root_is_supported_for_the_platform_health_check():
    assert client.head("/").status_code == 200
