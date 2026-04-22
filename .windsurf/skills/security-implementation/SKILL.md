---
name: security-implementation
description: Guides security implementation including CSP configuration, security headers, dependency security, and environment variable management for Astro 6 projects
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [security, csp, headers, dependencies, environment]
  astro_version: 6.1.8
---

# Security Implementation

## Verification Snapshot (2026-04)
- Verified CSP configuration in astro.config.mjs
- Confirmed security headers in vercel.json
- Validated dependency security overrides
- Tested environment variable usage with import.meta.env
- Confirmed no COEP header (preserves third-party analytics)

This skill provides guidance for implementing security measures in Astro 6 projects, including CSP configuration, security headers, dependency management, and environment variables.

## CSP Configuration

### Enable CSP in astro.config.mjs

```javascript
export default defineConfig({
  security: {
    csp: {
      enabled: true
    }
  }
})
```

### CSP Behavior

- **Auto-generates script hashes**: No `'unsafe-inline'` needed
- **Hash-based approach**: Scripts are hashed at build time
- **Stable in Astro 6**: Previously experimental, now stable

### CSP Reporting and Monitoring

#### Report-Only Mode for Initial Testing

Before enforcing a strict CSP in production, deploy it first in Report-Only mode using the `Content-Security-Policy-Report-Only` header. This allows gathering violation reports without breaking functionality.

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; script-src 'self'; report-to csp-endpoint"
        }
      ]
    }
  ]
}
```

#### Modern Reporting with report-to Directive

Use the modern `report-to` directive (preferred over deprecated `report-uri`) to collect violation reports from production.

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Reporting-Endpoints",
          "value": "csp-endpoint=\"https://your-csp-reporting-endpoint.com/csp-reports\""
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; report-to csp-endpoint"
        }
      ]
    }
  ]
}
```

**Benefits of CSP Reporting:**
- Fine-tune policy based on real-world violations
- Identify third-party script issues before enforcement
- Monitor for XSS attempts in production
- Gradual migration from Report-Only to enforced mode

### Common CSP Pitfalls

- **Do not add 'unsafe-inline'**: CSP auto-generates hashes, inline scripts not needed
- **No script-src directives needed**: Astro handles this automatically
- **COEP breaks third-party scripts**: Do NOT add COEP header (breaks analytics)

## Security Headers (vercel.json)

### Required Headers

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Resource-Policy",
          "value": "same-site"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=(), autoplay=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
        }
      ]
    }
  ]
}
```

### Header Explanations

- **HSTS**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **COOP**: Prevents cross-origin window access
- **CORP**: Restricts cross-origin resource access
- **Permissions-Policy**: Restricts browser features with deny-by-default posture (camera, microphone, geolocation, payment, autoplay, usb, magnetometer, gyroscope, accelerometer all disabled)

### Critical: No COEP Header

**Do NOT add COEP (Cross-Origin-Embedder-Policy)**:
- Breaks third-party scripts like analytics
- Only use if you have no third-party dependencies
- This project uses analytics, so COEP must be omitted

## Dependency Security

### npm Overrides for Vulnerable Packages

```json
{
  "overrides": {
    "yaml": "^2.8.3",
    "tmp": "^0.2.3"
  }
}
```

### Security Scanning

```bash
npm run security:scan
```

### Dependency Updates

```bash
npm audit
npm audit fix
```

## Environment Variables

### Using Environment Variables

```typescript
const siteUrl = import.meta.env.SITE_URL
const edgeRuntime = import.meta.env.EDGE_RUNTIME
```

### .env File (Local Development)

```env
SITE_URL=https://trevor-lam.com
EDGE_RUNTIME=false
ANALYZE=true
```

### Environment Variables in Vercel

- Configure in Vercel dashboard
- Never commit secrets to repository
- Use Vercel environment variables for deployment

### Security Best Practices

- **Never commit secrets**: Use Vercel environment variables
- **Use import.meta.env**: Access environment variables in code
- **Different environments**: Use separate configs for dev/staging/prod
- **Sensitive data**: API keys, database credentials in env vars only

## ESLint Security Plugins

### Security Rules in eslint.config.js

```javascript
import security from 'eslint-plugin-security'

export default [
  {
    plugins: {
      security
    },
    rules: {
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-unsafe-regex': 'warn',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'warn',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-new-buffer': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-object-injection': 'warn',
      'security/detect-pseudoRandomBytes': 'error'
    }
  }
]
```

### Linting

```bash
npm run lint
```

## Gotchas

- **CSP unsafe-inline**: Never needed with Astro 6 - CSP auto-generates script hashes
- **COEP header**: Breaks third-party analytics - do not add
- **Environment variables**: Never commit .env files or secrets to repository
- **Dependency overrides**: Must use npm overrides for known vulnerable packages
- **Security headers**: Must be in vercel.json, not astro.config.mjs
- **import.meta.env**: Use this syntax, not process.env
- **ESLint security**: Security plugins must be in flat config, not .eslintrc
- **Prototype pollution**: ESLint rules prevent prototype pollution attacks
- **Eval usage**: Never use eval() - blocked by security rules
- **Dynamic imports**: Validate module paths to avoid injection attacks

## Validation Loop

1. Make security changes
2. Run lint: `npm run lint`
3. If lint errors:
   - Review security rule violations
   - Fix security issues
   - Re-run lint
4. Run security scan: `npm run security:scan`
5. If vulnerabilities found:
   - Review vulnerability report
   - Update dependencies or add overrides
   - Re-run security scan
6. Test environment variables:
   - Verify import.meta.env usage
   - Check .env not committed
   - Verify Vercel env vars configured
7. Run build: `npm run build`
8. If CSP errors:
   - Review CSP violations
   - Fix inline scripts or CSP configuration
   - Re-run build
9. Only proceed when lint passes, security scan clean, build succeeds

## Important Notes

- Enable CSP via `security: { csp: { enabled: true } }` in astro.config.mjs
- Security headers in vercel.json (HSTS, X-Frame-Options, COOP, CORP, Permissions-Policy)
- No COEP header (breaks third-party analytics)
- Environment variables: `import.meta.env` - never commit secrets
- Dependency security: npm overrides for vulnerable packages
- ESLint security plugins for code security
- Never use eval() or prototype pollution patterns
