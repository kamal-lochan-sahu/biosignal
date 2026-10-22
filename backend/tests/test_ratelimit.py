import pytest
from starlette.requests import Request

from ratelimit import SlidingWindowLimiter, client_ip


class FakeClock:
    def __init__(self) -> None:
        self.now = 1000.0

    def __call__(self) -> float:
        return self.now


def request_with(headers: dict[str, str], client: tuple[str, int] | None = ("9.9.9.9", 1234)) -> Request:
    scope = {
        "type": "http",
        "headers": [(k.lower().encode(), v.encode()) for k, v in headers.items()],
        "client": client,
    }
    return Request(scope)


def test_allows_up_to_the_limit_then_blocks():
    limiter = SlidingWindowLimiter(3, clock=FakeClock())
    assert [limiter.check("a")[0] for _ in range(4)] == [True, True, True, False]


def test_reports_when_a_slot_frees_up():
    clock = FakeClock()
    limiter = SlidingWindowLimiter(2, window_seconds=60, clock=clock)
    limiter.check("a")
    clock.now += 10
    limiter.check("a")
    allowed, retry_after = limiter.check("a")
    assert not allowed
    assert retry_after == pytest.approx(50.0)  # the first hit leaves the window 60 s after it was made


def test_window_slides():
    clock = FakeClock()
    limiter = SlidingWindowLimiter(2, window_seconds=60, clock=clock)
    assert limiter.check("a")[0] and limiter.check("a")[0]
    assert not limiter.check("a")[0]
    clock.now += 61
    assert limiter.check("a")[0]


def test_keys_are_independent():
    limiter = SlidingWindowLimiter(1, clock=FakeClock())
    assert limiter.check("a")[0]
    assert not limiter.check("a")[0]
    assert limiter.check("b")[0]


@pytest.mark.parametrize("limit", [0, -1])
def test_non_positive_limit_disables_the_limiter(limit):
    limiter = SlidingWindowLimiter(limit, clock=FakeClock())
    assert not limiter.enabled
    assert all(limiter.check("a")[0] for _ in range(1000))


def test_memory_is_bounded_by_max_keys():
    limiter = SlidingWindowLimiter(5, max_keys=100, clock=FakeClock())
    for i in range(1000):
        limiter.check(f"ip-{i}")
    assert len(limiter._hits) <= 100


class TestClientIp:
    def test_uses_the_entry_added_by_the_nearest_trusted_proxy(self):
        request = request_with({"X-Forwarded-For": "1.1.1.1, 2.2.2.2"})
        assert client_ip(request, 1) == "2.2.2.2"
        assert client_ip(request, 2) == "1.1.1.1"

    def test_a_spoofed_leftmost_entry_is_ignored(self):
        request = request_with({"X-Forwarded-For": "6.6.6.6, 203.0.113.7"})
        assert client_ip(request, 1) == "203.0.113.7"

    def test_falls_back_to_the_socket_address(self):
        assert client_ip(request_with({}), 1) == "9.9.9.9"
        assert client_ip(request_with({"X-Forwarded-For": "1.1.1.1"}), 2) == "9.9.9.9"  # fewer hops than expected
        assert client_ip(request_with({"X-Forwarded-For": "1.1.1.1"}), 0) == "9.9.9.9"  # header not trusted

    def test_unknown_when_there_is_no_client(self):
        assert client_ip(request_with({}, client=None), 1) == "unknown"
