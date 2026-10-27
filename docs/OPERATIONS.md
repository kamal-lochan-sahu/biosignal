# Operations notes

## Rate limiting behind a hosting proxy

The API limits `/predict` per client address. Behind a hosting provider the app only sees the proxy's connection, so the
real client address has to be read from request headers, and which header (or which position in `X-Forwarded-For`) is
correct depends on the provider's proxy chain.

Settings (environment variables on the host):

| Variable | Meaning |
|---|---|
| `CLIENT_IP_HEADER` | Name of a header that the platform sets to the real client address on every request (for example `cf-connecting-ip`). Takes precedence. Only use a header clients cannot set themselves. |
| `TRUSTED_PROXY_COUNT` | Number of proxies in front of the API. The address that many positions from the **right** of `X-Forwarded-For` is used. |
| `ENABLE_CLIENT_DEBUG` | `1` enables `GET /debug/client`, a temporary diagnostic. Leave it unset in normal operation. |

### Finding the right setting

1. Set `ENABLE_CLIENT_DEBUG=1` on the host and wait for the redeploy.
2. Call the endpoint a few times, from your computer and from a phone on mobile data:

   ```bash
   curl -s https://<api-host>/debug/client
   ```

   It shows the proxy headers your own request arrived with and `chosen_key`, the key the limiter would use.
3. Pick the setting so that `chosen_key` is **the same on every call** and **equals your public address**
   (compare with `curl -s https://ifconfig.me`).
4. Set `CLIENT_IP_HEADER` or `TRUSTED_PROXY_COUNT` accordingly, **remove `ENABLE_CLIENT_DEBUG`**, and verify with a burst:

   ```bash
   seq 1 100 | xargs -P 25 -I{} curl -s -o /dev/null -w "%{http_code}\n" -X POST https://<api-host>/predict \
     -H "Content-Type: application/json" -d "$PAYLOAD" | sort | uniq -c
   ```

   With the default limit of 60 per minute, a warm instance should answer about 60 requests with `200` and the rest with `429`.
   If more than 60 get through, the key is still not stable.

The global limit (`GLOBAL_RATE_LIMIT_PER_MINUTE`) applies regardless of this setting and protects the instance either way.
