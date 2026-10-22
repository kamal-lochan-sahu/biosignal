import pytest

from config import load_settings


def test_defaults(monkeypatch):
    for name in ("RATE_LIMIT_PER_MINUTE", "GLOBAL_RATE_LIMIT_PER_MINUTE", "TRUSTED_PROXY_COUNT", "MAX_BODY_BYTES"):
        monkeypatch.delenv(name, raising=False)
    settings = load_settings()
    assert settings.rate_limit_per_minute == 60
    assert settings.global_rate_limit_per_minute == 300
    assert settings.trusted_proxy_count == 1
    assert settings.max_body_bytes == 16_384


def test_values_come_from_the_environment(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "10")
    monkeypatch.setenv("GLOBAL_RATE_LIMIT_PER_MINUTE", "0")
    monkeypatch.setenv("TRUSTED_PROXY_COUNT", "2")
    monkeypatch.setenv("MAX_BODY_BYTES", "2048")
    settings = load_settings()
    assert (settings.rate_limit_per_minute, settings.global_rate_limit_per_minute) == (10, 0)
    assert (settings.trusted_proxy_count, settings.max_body_bytes) == (2, 2048)


@pytest.mark.parametrize("bad", ["abc", "", "1.5", "ten"])
def test_invalid_values_fall_back_to_the_default(monkeypatch, bad):
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", bad)
    assert load_settings().rate_limit_per_minute == 60


def test_negative_values_are_clamped(monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_MINUTE", "-5")
    monkeypatch.setenv("MAX_BODY_BYTES", "0")
    settings = load_settings()
    assert settings.rate_limit_per_minute == 0
    assert settings.max_body_bytes == 1
