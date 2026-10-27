"""In-memory sliding-window rate limiting.

State lives in the process, which suits the single free-tier instance this project runs on. If the API is ever
scaled to several instances, replace this with a shared store (for example Redis).
"""
from __future__ import annotations

import threading
import time
from collections import OrderedDict, deque
from typing import Callable

from starlette.requests import Request


class SlidingWindowLimiter:
    """Allows at most `max_requests` per `window_seconds` for each key. `max_requests <= 0` disables it."""

    def __init__(
        self,
        max_requests: int,
        window_seconds: float = 60.0,
        max_keys: int = 10_000,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.max_keys = max_keys
        self._clock = clock
        self._hits: OrderedDict[str, deque[float]] = OrderedDict()
        self._lock = threading.Lock()

    @property
    def enabled(self) -> bool:
        return self.max_requests > 0

    def check(self, key: str) -> tuple[bool, float]:
        """Record a request for `key`. Returns (allowed, seconds_until_a_slot_frees_up)."""
        if not self.enabled:
            return True, 0.0
        now = self._clock()
        cutoff = now - self.window_seconds
        with self._lock:
            hits = self._hits.get(key)
            if hits is None:
                hits = deque()
                self._hits[key] = hits
            else:
                self._hits.move_to_end(key)
            while hits and hits[0] <= cutoff:
                hits.popleft()
            if len(hits) >= self.max_requests:
                return False, max(hits[0] + self.window_seconds - now, 0.0)
            hits.append(now)
            while len(self._hits) > self.max_keys:  # bound memory: drop the least recently used keys
                self._hits.popitem(last=False)
            return True, 0.0


def client_ip(request: Request, trusted_proxies: int, header: str = "") -> str:
    """Best-effort client address.

    Behind `trusted_proxies` reverse proxies, each one appends the address it received the request from to
    X-Forwarded-For. A client can only add entries on the LEFT, so the entry `trusted_proxies` positions from the
    right is the one added by our own infrastructure and cannot be spoofed. With fewer entries than expected
    (direct access, wrong setting) the socket address is used instead.

    If `header` is given (CLIENT_IP_HEADER), a platform-provided header holding the real client address, for
    example one that the edge proxy overwrites on every request, it takes precedence. Only configure a header
    that clients cannot set themselves.
    """
    if header:
        value = request.headers.get(header, "").split(",")[0].strip()
        if value:
            return value
    if trusted_proxies > 0:
        header = request.headers.get("x-forwarded-for", "")
        hops = [hop.strip() for hop in header.split(",") if hop.strip()]
        if len(hops) >= trusted_proxies:
            return hops[-trusted_proxies]
    return request.client.host if request.client else "unknown"
