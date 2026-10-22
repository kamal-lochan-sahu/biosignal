/**
 * HTTP security headers for the Next.js app (wired up in next.config.ts).
 *
 * The Content-Security-Policy is sent in REPORT-ONLY mode first: the browser logs violations to the
 * console but blocks nothing, so the policy can be checked on the live site before it is enforced.
 * 'unsafe-inline' is still needed for the inline scripts and styles Next.js emits; removing it requires nonces.
 */

export interface HeaderEntry {
  key: string
  value: string
}

export interface SecurityHeaderOptions {
  isProduction: boolean
  apiUrl?: string
}

export const DEFAULT_API_URL = 'https://biosignal-api.onrender.com'

/** Origin (scheme + host + port) of the API, used in connect-src. Falls back to the default for invalid input. */
export function apiOrigin(apiUrl: string | undefined): string {
  try {
    return new URL(apiUrl || DEFAULT_API_URL).origin
  } catch {
    return new URL(DEFAULT_API_URL).origin
  }
}

export function contentSecurityPolicy(connectOrigin: string): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${connectOrigin}`,
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

export function buildSecurityHeaders({ isProduction, apiUrl }: SecurityHeaderOptions): HeaderEntry[] {
  const headers: HeaderEntry[] = [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  ]
  if (isProduction) {
    // Not in development: the dev server needs eval and websockets, and there is no HTTPS on localhost.
    headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000' })
    headers.push({ key: 'Content-Security-Policy-Report-Only', value: contentSecurityPolicy(apiOrigin(apiUrl)) })
  }
  return headers
}
