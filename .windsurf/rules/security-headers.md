---
trigger: always_on
description: Security headers and CSP configuration
---

# Security & Headers

## CSP Configuration

- Enable CSP in astro.config.mjs: `security: { csp: { enabled: true } }`
- CSP auto-generates script hashes
- NO `
unsafe-inline` needed - hashes are used instead
- CSP is now stable in Astro 6 (was experimental)

## Security Headers in vercel.json

Configure the following headers in vercel.json:

- **HSTS**: Strict-Transport-Security
- **X-Frame-Options**: DENY or SAMEORIGIN
- **COOP**: Cross-Origin-Opener-Policy
- **CORP**: Cross-Origin-Resource-Policy
- **Permissions-Policy**: Restricts browser features

## NO COEP Header

- Do NOT add COEP (Cross-Origin-Embedder-Policy)
- COEP breaks third-party scripts like analytics
- Only use COEP if you have no third-party dependencies

## Environment Variables

- Use `import.meta.env` for environment variables
- NEVER commit secrets to repository
- Use Vercel environment variables for deployment

## Common Pitfalls

| Pitfall | Prevention |
|---------|-------------|
| Using unsafe-inline in CSP | Rely on auto-generated script hashes |
| Adding COEP header | Breaks third-party analytics - omit it |
| Committing secrets | Use import.meta.env and Vercel env vars |
| Not enabling CSP | Enable in astro.config.mjs |
