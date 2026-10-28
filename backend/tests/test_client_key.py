"""IPv6 /64 keying and bounded key length for the rate limiter."""
import pytest
from starlette.requests import Request

from ratelimit import MAX_KEY_LENGTH, client_ip, normalize_client_key


def request_with(headers: dict[str, str], client=("9.9.9.9", 1234)) -> Request:
    scope = {"type": "http", "headers": [(k.lower().encode(), v.encode()) for k, v in headers.items()], "client": client}
    return Request(scope)


@pytest.mark.parametrize(
    ("raw", "expected"),
    [
        ("203.0.113.9", "203.0.113.9"),
        (" 203.0.113.9 ", "203.0.113.9"),
        ("2001:db8:1:2:aaaa:bbbb:cccc:dddd", "2001:db8:1:2::/64"),
        ("2001:DB8:1:2::1", "2001:db8:1:2::/64"),
        ("::ffff:203.0.113.9", "203.0.113.9"),
        ("fe80::1%eth0", "fe80::/64"),
    ],
)
def test_keys_are_canonical(raw, expected):
    assert normalize_client_key(raw) == expected


def test_addresses_in_the_same_slash_64_share_a_key():
    assert normalize_client_key("2001:db8:1:2::1") == normalize_client_key("2001:db8:1:2:ffff:ffff:ffff:ffff")


def test_different_slash_64_networks_get_different_keys():
    assert normalize_client_key("2001:db8:1:2::1") != normalize_client_key("2001:db8:1:3::1")


def test_non_ip_values_are_kept_but_bounded():
    assert normalize_client_key("unknown") == "unknown"
    assert len(normalize_client_key("x" * 5000)) == MAX_KEY_LENGTH


def test_client_ip_applies_the_normalisation_on_every_path():
    v6 = "2001:db8:1:2:aaaa:bbbb:cccc:dddd"
    assert client_ip(request_with({"X-Forwarded-For": f"{v6}, 198.51.100.1, 10.0.0.1"}), 3) == "2001:db8:1:2::/64"
    assert client_ip(request_with({"CF-Connecting-IP": v6}), 1, "cf-connecting-ip") == "2001:db8:1:2::/64"
    assert client_ip(request_with({}, client=(v6, 1)), 1) == "2001:db8:1:2::/64"
    assert client_ip(request_with({}, client=None), 1) == "unknown"


def test_three_hop_chain_picks_the_real_client(  # the chain observed on Render: client, Cloudflare edge, internal proxy
):
    request = request_with({"X-Forwarded-For": "49.42.128.219, 162.158.54.165, 10.25.242.21"})
    assert client_ip(request, 3) == "49.42.128.219"
    assert client_ip(request, 2) == "162.158.54.165"  # one hop too few picks the rotating edge, which is why 3 is needed


def test_a_forged_leftmost_entry_does_not_change_the_key_on_the_render_chain():
    forged = request_with({"X-Forwarded-For": "6.6.6.6, 49.42.128.219, 162.158.54.165, 10.25.242.21"})
    assert client_ip(forged, 3) == "49.42.128.219"
