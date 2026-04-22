---
description: Build the production site with bundle analysis, run Lighthouse CI validation, and prepare for Vercel deployment
---

# Build and Deploy Workflow

This workflow guides you through building the production site, validating performance, and preparing for Vercel deployment.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed (`npm install`)
- Vercel CLI authenticated (for deployment)
- Git repository initialized

## Step 1: Repository Impact Mapping (Harness Engineering)

Before building, have the AI scan the codebase and produce a repository impact map to understand what will be affected by this build and deployment.

### Impact Map Structure

```markdown
# Repository Impact Map: Build and Deploy

## Files Affected by Build
- All files in `/src/` directory
- Configuration files: `astro.config.mjs`, `tsconfig.json`, `package.json`
- Content files: `/src/content/`

## Build Artifacts
- `/dist/` directory (will be regenerated)
- Bundle analysis report (if ANALYZE=true)
- Lighthouse CI reports

## Deployment Targets
- Vercel production environment
- CDN edge caches
- Search engine indexes

## Potential Breaking Changes
- Astro version compatibility
- Tailwind v4 configuration changes
- Dependency updates
- Security header changes

## Rollback Plan
- Previous Vercel deployment available
- Git history for quick revert
- Backup of current production build
```

**Human Review Required**: Review the impact map to ensure you understand what will be deployed and any potential risks.

## Step 2: Pre-Build Validation

Run type checking and linting before building:
```bash
npm run check
npm run lint
```

**Alternative**: Run the quality-gate script for all-in-one validation:
```bash
npm run quality-gate
```

Fix any errors before proceeding with the build.

## Step 3: Run Tests

Call /run-tests to execute the appropriate test suite based on changes.

## Step 4: Production Build

Build the production site:
```bash
npm run build
```

This creates an optimized production build in the `/dist` directory with:
- Static site generation (SSG)
- Image optimization via Sharp (AVIF format, 75% quality)
- Bundle optimization with manual chunking
- Minification via esbuild
- CSP script hash generation

## Step 5: Bundle Analysis (Optional)

Analyze bundle size to identify large dependencies:
```bash
npm run analyze:bundle
```

This sets `ANALYZE=true` and generates a bundle visualization.

## Step 6: Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

This serves the `/dist` directory at `localhost:4321` for testing.

## Step 7: Lighthouse CI Validation

Run Lighthouse CI to validate performance metrics:
```bash
npm run lighthouse
```

Ensure scores meet the required thresholds:
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

### Core Web Vitals

Ensure the following metrics are met:
- LCP (Largest Contentful Paint): <2.5s
- INP (Interaction to Next Paint): <200ms
- CLS (Cumulative Layout Shift): <0.1

## Step 8: Security Headers Verification

Verify security headers in `vercel.json` are configured:
- `Strict-Transport-Security`: HSTS with preload
- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Cross-Origin-Opener-Policy`: same-origin
- `Cross-Origin-Resource-Policy`: same-site
- `Permissions-Policy`: camera=(), microphone=(), geolocation=()

## Step 9: robots.txt and Sitemap Verification

Verify that `robots.txt` and `sitemap.xml` are generated correctly for SEO.

### Check robots.txt

After the build, verify `public/robots.txt` exists and contains appropriate directives:

```bash
cat public/robots.txt
```

Expected content example:

```txt
User-agent: *
Allow: /
Sitemap: https://trevor-lam.com/sitemap-index.xml
```

### Check Sitemap Generation

Astro automatically generates sitemaps. Verify the sitemap is generated in the build output:

```bash
ls dist/sitemap*.xml
```

Test the sitemap URL:
```bash
curl https://trevor-lam.com/sitemap-index.xml
```

### Sitemap Configuration (astro.config.mjs)

Ensure sitemap generation is enabled in `astro.config.mjs`:

```javascript
export default defineConfig({
  site: 'https://trevor-lam.com',
  integrations: [
    sitemap()
  ]
})
```

### Verification Checklist

- [ ] `robots.txt` exists in `public/` directory
- [ ] `robots.txt` allows search engine crawling
- [ ] `robots.txt` references the sitemap URL
- [ ] `sitemap-index.xml` is generated in the build output
- [ ] Sitemap contains all content pages (cases, capabilities, learning logs, projects, resources)
- [ ] Sitemap URLs are absolute and correct
- [ ] Sitemap is accessible at the production URL

**Why this matters**: Proper robots.txt and sitemap configuration ensures search engines can discover and index your content effectively, improving SEO visibility.

## Step 11: CSP Validation

Ensure CSP is enabled in `astro.config.mjs`:

```javascript
security: {
  csp: {
    enabled: true
  }
}
```

This auto-generates script hashes and prevents `'unsafe-inline'`.

## Step 12: Deploy to Vercel

Deploy the production build to Vercel:
```bash
vercel --prod
```

Or push to `main` branch for automatic deployment via CI/CD.

### CI/CD Pipeline

The `.github/workflows/ci.yml` pipeline automatically:
1. Runs linting and type checking
2. Executes 8-shard test matrix
3. Runs Lighthouse CI
4. Runs fuzzing and mutation testing
5. Runs security scanning
6. Deploys to Vercel on `main` branch

## Step 11: Post-Deployment Validation

After deployment, validate:
- All pages load correctly
- Navigation works as expected
- Images are optimized
- CSP is working (no console errors)
- Lighthouse scores meet thresholds
- Accessibility is maintained (zero axe-core violations)

## Notes

- Node version must be >=22.12.0 (enforced in package.json engines)
- Vite must be locked to v7 (conflicts with @tailwindcss/vite in v8)
- Images must be in `/src/assets/` for optimization
- LCP image (headshot) needs `loading="eager"` and `fetchpriority="high"`
- No COEP header (would break third-party analytics)
- Environment variables: use `import.meta.env` (never commit secrets)

## Error Handling

If a step fails:
1. Check the error message for specific details
2. Review the relevant documentation (AGENTS.md, skill guides)
3. Run the failed step individually to debug
4. Check Node version: `node --version` (must be >=22.12.0)
5. Verify dependencies: `npm install`
6. For deployment issues, check Vercel CLI authentication: `vercel whoami`
7. For CSP errors, review astro.config.mjs security settings
8. Contact the team if issue persists after debugging
