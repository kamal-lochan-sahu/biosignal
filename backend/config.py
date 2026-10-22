"""Runtime settings read from environment variables (all optional, with safe defaults)."""
import os
from dataclasses import dataclass


def _int_env(name: str, default: int, minimum: int = 0) -> int:
    """Integer from the environment; falls back to the default if missing or invalid, never below `minimum`."""
    try:
        value = int(os.getenv(name, str(default)))
    except ValueError:
        return default
    return max(value, minimum)


@dataclass(frozen=True)
class Settings:
    rate_limit_per_minute: int  # per client IP on /predict; 0 disables
    global_rate_limit_per_minute: int  # across all clients on /predict; 0 disables
    trusted_proxy_count: int  # proxies in front of the app that append to X-Forwarded-For; 0 = ignore the header
    max_body_bytes: int  # request bodies larger than this are rejected with 413


def load_settings() -> Settings:
    return Settings(
        rate_limit_per_minute=_int_env("RATE_LIMIT_PER_MINUTE", 60),
        global_rate_limit_per_minute=_int_env("GLOBAL_RATE_LIMIT_PER_MINUTE", 300),
        trusted_proxy_count=_int_env("TRUSTED_PROXY_COUNT", 1),
        max_body_bytes=_int_env("MAX_BODY_BYTES", 16_384, minimum=1),
    )
