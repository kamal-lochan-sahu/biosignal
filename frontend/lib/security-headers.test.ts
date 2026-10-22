import { describe, expect, it } from 'vitest'
import nextConfig from '../next.config'
import { apiOrigin, buildSecurityHeaders, contentSecurityPolicy, DEFAULT_API_URL } from './security-headers'

const byKey = (headers: { key: string; value: string }[]) => Object.fromEntries(headers.map(h => [h.key, h.value]))

describe('apiOrigin', () => {
  it('defaults to the deployed API', () => {
    expect(apiOrigin(undefined)).toBe('https://biosignal-api.onrender.com')
    expect(apiOrigin('')).toBe(new URL(DEFAULT_API_URL).origin)
  })

  it('reduces a URL to its origin', () => {
    expect(apiOrigin('http://127.0.0.1:8000/predict?x=1')).toBe('http://127.0.0.1:8000')
    expect(apiOrigin('https://api.example.com/v1')).toBe('https://api.example.com')
  })

  it('falls back to the default for invalid input', () => {
    expect(apiOrigin('not a url')).toBe(new URL(DEFAULT_API_URL).origin)
  })
})

describe('contentSecurityPolicy', () => {
  const csp = contentSecurityPolicy('https://api.example.com')
  const directives = Object.fromEntries(csp.split('; ').map(d => [d.split(' ')[0], d]))

  it('only allows the API origin for connections', () => {
    expect(directives['connect-src']).toBe("connect-src 'self' https://api.example.com")
  })

  it('blocks plugins, framing, base-tag and form hijacking', () => {
    expect(directives['object-src']).toBe("object-src 'none'")
    expect(directives['frame-ancestors']).toBe("frame-ancestors 'none'")
    expect(directives['base-uri']).toBe("base-uri 'self'")
    expect(directives['form-action']).toBe("form-action 'self'")
  })

  it('defaults to same-origin and allows no third-party scripts', () => {
    expect(directives['default-src']).toBe("default-src 'self'")
    expect(directives['script-src']).not.toMatch(/https?:/)
  })
})

describe('buildSecurityHeaders', () => {
  it('always sends the basic hardening headers', () => {
    for (const isProduction of [false, true]) {
      const headers = byKey(buildSecurityHeaders({ isProduction }))
      expect(headers['X-Content-Type-Options']).toBe('nosniff')
      expect(headers['X-Frame-Options']).toBe('DENY')
      expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
      expect(headers['Permissions-Policy']).toContain('camera=()')
    }
  })

  it('adds HSTS and a REPORT-ONLY CSP in production, and no enforcing CSP', () => {
    const headers = byKey(buildSecurityHeaders({ isProduction: true, apiUrl: 'https://api.example.com' }))
    expect(headers['Strict-Transport-Security']).toContain('max-age=')
    expect(headers['Content-Security-Policy-Report-Only']).toContain('https://api.example.com')
    expect(headers).not.toHaveProperty('Content-Security-Policy')
  })

  it('keeps the dev server working: no CSP and no HSTS outside production', () => {
    const headers = byKey(buildSecurityHeaders({ isProduction: false }))
    expect(headers).not.toHaveProperty('Content-Security-Policy-Report-Only')
    expect(headers).not.toHaveProperty('Strict-Transport-Security')
  })

  it('never sends an empty header value', () => {
    for (const h of buildSecurityHeaders({ isProduction: true })) expect(h.value.length).toBeGreaterThan(0)
  })
})

describe('next.config', () => {
  it('applies the security headers to every route and hides X-Powered-By', async () => {
    expect(nextConfig.poweredByHeader).toBe(false)
    const rules = await nextConfig.headers?.()
    expect(rules).toHaveLength(1)
    expect(rules?.[0].source).toBe('/:path*')
    expect(rules?.[0].headers.map(h => h.key)).toContain('X-Content-Type-Options')
  })
})
