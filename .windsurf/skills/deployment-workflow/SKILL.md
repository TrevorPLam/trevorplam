---
name: deployment-workflow
description: Guides deployment workflow including Vercel deployment, CI/CD pipeline, build validation, and security scanning for Astro 6 projects
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [deployment, vercel, ci-cd, build, security]
  astro_version: 6.1.8
---

# Deployment Workflow

## Verification Snapshot (2026-04)
- Verified Vercel deployment configuration
- Confirmed CI/CD pipeline in .github/workflows/ci.yml
- Validated build process with npm run build
- Tested security scanning with npm run security:scan
- Confirmed auto-deploy from main branch

This skill provides guidance for deploying Astro 6 projects to Vercel, including CI/CD pipeline, build validation, and security scanning.

## Local Build Validation

### Build the Project

```bash
npm run build
```

### Build Output

- Output directory: `/dist`
- Static site generation
- Optimized assets (images, fonts, CSS, JS)

### Build Validation Checklist

- [ ] Run `npm run build` - no errors
- [ ] Check `/dist` directory created
- [ ] Verify static assets generated
- [ ] Check for build warnings
- [ ] Test locally with `npm run preview`

### Preview Production Build

```bash
npm run preview
```

## Vercel Deployment

### Deploy to Vercel

```bash
vercel --prod
```

### Vercel Configuration

The project is configured for static deployment:

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'static',
  site: 'https://trevor-lam.com'
})
```

### Vercel Environment Variables

Configure in Vercel dashboard:
- `SITE_URL`: Production URL
- `EDGE_RUNTIME`: false (static site)
- `ANALYZE`: true (for bundle analysis)

### Vercel Auto-Deploy

- Auto-deploys from `main` branch on push
- CI/CD pipeline runs before deployment
- Deployment fails if tests fail

## CI/CD Pipeline

### Pipeline Overview (.github/workflows/ci.yml)

The CI pipeline runs the following jobs:

| Job | Purpose |
|-----|---------|
| `lint` | ESLint + Astro type checking |
| `test` | 8-shard test matrix (unit, component, integration, accessibility, e2e, performance, security, contract) |
| `lighthouse` | Performance auditing |
| `fuzzing` | Security fuzzing with resource limits |
| `mutation-testing` | Stryker mutation testing |
| `security-scan` | Trivy vulnerability scanning |
| `deploy` | Automated Vercel deployment on `main` |

### Running CI Locally

```bash
npm run lint
npm run check
npm test
npm run test:e2e
npm run test:a11y
npm run lighthouse
npm run security:scan
```

### Test Matrix

The test suite runs in 8 shards for parallel execution:

| Shard | Test Type | Resource Level |
|-------|-----------|----------------|
| 1 | Unit | Standard |
| 2 | Components | Standard |
| 3 | Integration | Enhanced |
| 4 | Accessibility | Enhanced |
| 5 | E2E | High |
| 6 | Performance | High |
| 7 | Security | Standard |
| 8 | Contract | Standard |

## Pre-Deployment Checklist

### Code Quality

- [ ] Run `npm run lint` - no errors
- [ ] Run `npm run check` - no TypeScript errors
- [ ] Run `npm test` - all tests pass
- [ ] Run `npm run test:coverage` - coverage meets threshold (80% global, 90% utils)

### Testing

- [ ] Run `npm run test:e2e` - all E2E tests pass
- [ ] Run `npm run test:a11y` - zero axe-core violations
- [ ] Run `npm run test:contract` - contract tests pass
- [ ] Run `npm run test:mutation` - mutation score ≥80%

### Security

- [ ] Run `npm run security:scan` - no vulnerabilities
- [ ] Verify CSP configuration in astro.config.mjs
- [ ] Verify security headers in vercel.json
- [ ] Check no secrets committed to repository

### Performance

- [ ] Run `npm run lighthouse` - scores ≥90 for Performance, Accessibility, Best Practices, SEO
- [ ] Run `ANALYZE=true npm run build` - check bundle size
- [ ] Verify LCP <2.5s, INP <200ms, CLS <0.1

### Build

- [ ] Run `npm run build` - no errors
- [ ] Verify `/dist` directory created
- [ ] Test locally with `npm run preview`
- [ ] Verify static assets optimized

## Deployment Validation Loop

1. Complete pre-deployment checklist
2. Commit and push to `main` branch
3. CI/CD pipeline runs automatically
4. Monitor CI/CD pipeline in GitHub Actions
5. If CI fails:
   - Review failure logs
   - Fix the issue
   - Push fix
   - CI re-runs automatically
6. If CI passes:
   - Vercel auto-deploys
   - Monitor Vercel deployment logs
7. Test production deployment:
   - Visit production URL
   - Verify pages load correctly
   - Test key functionality
   - Check console for errors
8. Run Lighthouse on production:
   - Test with Lighthouse CI or browser extension
   - Verify scores ≥90
   - Check Core Web Vitals
9. Only consider deployment complete when all checks pass

## Gotchas

- **Auto-deploy from main**: Any push to main triggers deployment - ensure CI passes first
- **CI failures block deployment**: Deployment won't proceed if CI fails
- **Security scan failures**: Trivy scan blocks deployment - fix vulnerabilities
- **Missing environment variables**: Configure in Vercel dashboard, not in code
- **CSP violations**: Build fails if CSP violations detected - fix inline scripts
- **TypeScript errors**: npm run check fails - fix type errors before pushing
- **Test failures**: Any test failure blocks deployment - fix tests first
- **Lighthouse score below 90**: CI fails - optimize performance
- **Coverage below threshold**: CI fails - add tests or adjust threshold if justified
- **Mutation score below 80%**: CI fails - review surviving mutants

## Important Notes

- Auto-deploy from `main` branch on push
- CI/CD pipeline must pass before deployment
- Pre-deployment checklist required
- Vercel environment variables configured in dashboard
- Lighthouse CI enforces 90+ scores
- Security scanning blocks vulnerable deployments
- Test coverage thresholds: 80% global, 90% utils
- Zero accessibility violations required
- Mutation testing target 80% score
