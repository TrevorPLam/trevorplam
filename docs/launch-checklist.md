# Launch Checklist

This document provides pre-launch verification steps for trevor-lam.com to ensure production readiness.

## Pre-Launch Verification

### Content Validation

**Case Studies (3):**
- [ ] All case studies have complete frontmatter (title, industry, problem, result, skills, lastUpdated)
- [ ] All metrics in case studies match `/data/metrics.json`
- [ ] PDF files exist in `/public/pdfs/` for each case study
- [ ] PDF download links work correctly
- [ ] Related capabilities are linked correctly
- [ ] `lastUpdated` dates are current (within 6 months)

**Capabilities (5):**
- [ ] All capabilities have complete frontmatter (title, slug, philosophy, kpis, industries, lastUpdated)
- [ ] KPIs are specific and contextualized
- [ ] Related case studies are linked correctly
- [ ] Navigation links work correctly
- [ ] `lastUpdated` dates are current (within 6 months)

**Learning Logs (6):**
- [ ] All learning logs have complete frontmatter (title, date, tags, excerpt, lastUpdated)
- [ ] Tags are consistent with tag taxonomy
- [ ] Content is relevant to current thinking
- [ ] `lastUpdated` dates are current (within 12 months)

**Projects (3):**
- [ ] All projects have complete frontmatter (title, slug, status, technologies, lastUpdated)
- [ ] Status is accurate (active, completed, paused)
- [ ] Technologies list is current
- [ ] `lastUpdated` dates are current (within 3 months)

**Resources (8):**
- [ ] All resources have complete frontmatter (title, slug, type, audience, lastUpdated)
- [ ] Download URLs work correctly (if applicable)
- [ ] Gated resources are properly configured
- [ ] `lastUpdated` dates are current (within 12 months)

**Skills Data (4 categories):**
- [ ] All skill categories have valid JSON structure
- [ ] Proficiency levels are accurate
- [ ] Years of experience are current
- [ ] Certifications are up-to-date

**Metrics Data (9 metrics):**
- [ ] All metrics have valid JSON structure
- [ ] `caseStudySlug` references exist in case studies
- [ ] Metrics are quantified (numbers, percentages, timeframes)
- [ ] No hardcoded metrics in components (all from `/data/metrics.json`)

### Navigation Validation

**Navigation Structure:**
- [ ] All navigation links in `src/config/navigation.ts` work
- [ ] Navigation hierarchy is logical and consistent
- [ ] No broken links in navigation
- [ ] Mobile navigation works correctly
- [ ] Active state highlighting works

**Redirects:**
- [ ] Legacy redirects are configured in `astro.config.mjs`
- [ ] Redirect pages exist for `/cases/qsr`, `/cases/salon`, `/cases/financial-services`
- [ ] Redirects test correctly (no 404s)

**Breadcrumbs:**
- [ ] Breadcrumbs appear on all pages except homepage
- [ ] Breadcrumb hierarchy is accurate
- [ ] Schema.org markup is present
- [ ] Breadcrumbs are clickable

### Build Verification

**Production Build:**
- [ ] `npm run build` completes without errors
- [ ] Build output in `/dist` is complete
- [ ] All 41+ pages are generated successfully
- [ ] No TypeScript errors
- [ ] No ESLint errors (warnings acceptable for docs)

**Asset Optimization:**
- [ ] Images are optimized (AVIF format, 75% quality)
- [ ] LCP image (headshot.svg) has `loading="eager"` and `fetchpriority="high"`
- [ ] Fonts are self-hosted with `font-display: swap`
- [ ] Bundle size is within acceptable limits

**Static Generation:**
- [ ] `output: 'static'` is configured
- [ ] No client-side JavaScript unless necessary
- [ ] All routes are pre-rendered
- [ ] No dynamic route generation issues

### Testing Verification

**Unit Tests:**
- [ ] `npm test` passes (Vitest unit tests)
- [ ] Coverage meets thresholds (80% global, 90% utils)
- [ ] No failing tests

**Component Tests:**
- [ ] Component tests pass (Vitest + happy-dom)
- [ ] All Astro components render correctly
- [ ] No console errors in component tests

**Integration Tests:**
- [ ] Integration tests pass
- [ ] Component interactions work correctly
- [ ] Data flow between components is correct

**E2E Tests:**
- [ ] `npm run test:e2e` passes (Playwright)
- [ ] Tests run across Chrome, Firefox, Mobile Safari
- [ ] No flaky tests
- [ ] Critical user journeys are covered

**Accessibility Tests:**
- [ ] `npm run test:a11y` passes (Axe Core)
- [ ] Zero WCAG 2.2 AA violations
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility verified

**Contract Tests:**
- [ ] `npm run test:contract` passes (Pact)
- [ ] API contracts are valid
- [ ] No breaking changes

**Mutation Tests:**
- [ ] `npm run test:mutation` passes (Stryker)
- [ ] Mutation score ≥80%
- [ ] No critical code mutants survived

**Fuzzing Tests:**
- [ ] `npm run test:fuzz` passes (Jazzer)
- [ ] No security vulnerabilities detected
- [ ] Resource limits respected

**Property-Based Tests:**
- [ ] `npm run test:property` passes (fast-check)
- [ ] Generative tests cover edge cases
- [ ] No property violations

**Browser Tests:**
- [ ] `npm run test:browser` passes (Vitest browser mode)
- [ ] Real browser component rendering verified
- [ ] No cross-browser issues

### Security Verification

**CSP Configuration:**
- [ ] CSP is enabled in `astro.config.mjs` (`security.csp.enabled: true`)
- [ ] No `'unsafe-inline'` in CSP (uses script hashes)
- [ ] Script hashes are auto-generated correctly
- [ ] No CSP violations in browser console

**Security Headers:**
- [ ] HSTS header configured in `vercel.json`
- [ ] X-Frame-Options: DENY configured
- [ ] COOP and CORP headers configured
- [ ] Permissions-Policy restricts browser features
- [ ] No COEP header (intentionally omitted for analytics)

**External Links:**
- [ ] All external links have `rel="noopener noreferrer"`
- [ ] All external links have `target="_blank"`
- [ ] No mixed content (HTTP resources on HTTPS page)

**Dependency Security:**
- [ ] `npm run security:scan` passes (Trivy)
- [ ] No high-severity vulnerabilities
- [ ] npm overrides are applied for known vulnerable packages

**Secrets Management:**
- [ ] No secrets committed to repository
- [ ] Environment variables use `import.meta.env`
- [ ] `.env` file is in `.gitignore`

### Performance Verification

**Lighthouse CI:**
- [ ] `npm run lighthouse` passes
- [ ] Performance score ≥90
- [ ] Accessibility score ≥90
- [ ] Best Practices score ≥90
- [ ] SEO score ≥90

**Core Web Vitals:**
- [ ] LCP <2.5s
- [ ] INP <200ms
- [ ] CLS <0.1

**Bundle Analysis:**
- [ ] `ANALYZE=true npm run build` shows acceptable bundle sizes
- [ ] No unnecessary dependencies
- [ ] Code splitting is effective
- [ ] Vendor chunks are optimized

**Image Optimization:**
- [ ] All images in `/src/assets/` (not `/public/`)
- [ ] OptimizedImage component used throughout
- [ ] Image formats are modern (AVIF, WebP)
- [ ] Lazy loading applied to non-LCP images

### SEO Verification

**Meta Tags:**
- [ ] All pages have title and description
- [ ] Titles are unique and descriptive
- [ ] Descriptions are within length limits
- [ ] Open Graph tags present
- [ ] Twitter Card tags present

**Structured Data:**
- [ ] Person schema is present and correct
- [ ] WebSite schema is present and correct
- [ ] `mainEntityOfPage` links to `#person` and `#website`
- [ ] BreadcrumbList schema present
- [ ] No schema validation errors

**Sitemap:**
- [ ] Sitemap is generated by `@astrojs/sitemap`
- [ ] Sitemap includes all pages
- [ ] Sitemap is accessible at `/sitemap-index.xml`
- [ ] Sitemap is submitted to search engines

**Robots.txt:**
- [ ] `robots.txt` is present in `/public/`
- [ ] Sitemap is referenced in robots.txt
- [ ] No disallow rules for public content

**Canonical URLs:**
- [ ] Canonical URLs are set correctly
- [ ] No duplicate content issues
- [ ] URL structure is consistent

### Accessibility Verification

**WCAG 2.2 AA Compliance:**
- [ ] Skip to content link is first focusable element
- [ ] Touch targets ≥44x44px for all interactive elements
- [ ] Focus not obscured by fixed headers (scroll-padding-top: 80px)
- [ ] Semantic HTML used throughout (header, nav, main, footer)
- [ ] ARIA labels on icon-only buttons
- [ ] Color contrast ≥4.5:1 for normal text
- [ ] Color contrast ≥3:1 for large text

**Keyboard Navigation:**
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] No keyboard traps

**Screen Reader Support:**
- [ ] Proper heading hierarchy (no skipped levels)
- [ ] Alt text on all images
- [ ] ARIA live regions for dynamic content
- [ ] Form labels are associated with inputs

### Cross-Browser Verification

**Browser Testing:**
- [ ] Site works in Chrome (latest)
- [ ] Site works in Firefox (latest)
- [ ] Site works in Safari (latest)
- [ ] Site works on Mobile Safari (iOS)
- [ ] Site works on Chrome Mobile (Android)

**Responsive Design:**
- [ ] Layout works on desktop (1920x1080)
- [ ] Layout works on laptop (1366x768)
- [ ] Layout works on tablet (768x1024)
- [ ] Layout works on mobile (375x667)
- [ ] No horizontal scroll on mobile

**Feature Detection:**
- [ ] Graceful degradation for unsupported features
- [ ] Polyfills are loaded if needed
- [ ] No JavaScript errors in browser console

### Analytics Verification

**Plausible Analytics:**
- [ ] Plausible script is loaded correctly
- [ ] Analytics events fire correctly
- [ ] No tracking on privacy-sensitive pages
- [ ] Privacy policy discloses analytics usage

**Error Monitoring:**
- [ ] Error monitoring is configured
- [ ] RUM (Real User Monitoring) is set up
- [ ] Error tracking works without breaking functionality
- [ ] No PII in error logs

### Form Verification

**Contact Form:**
- [ ] Form submission works correctly
- [ ] Formspree integration is configured
- [ ] Form validation works client-side
- [ ] Form validation works server-side
- [ ] Success/failure messages display correctly
- [ ] No spam submissions (honeypot or reCAPTCHA if needed)

### Deployment Verification

**Vercel Configuration:**
- [ ] `vercel.json` is configured correctly
- [ ] Environment variables are set in Vercel
- [ ] Auto-deploy from `main` branch is enabled
- [ ] Preview deployments work correctly
- [ ] Domain configuration is correct (trevor-lam.com)

**CI/CD Pipeline:**
- [ ] `.github/workflows/ci.yml` is configured
- [ ] All CI jobs pass on `main` branch
- [ ] Test matrix runs correctly
- [ ] Deployment job triggers after tests pass
- [ ] No flaky CI jobs

**Git Repository:**
- [ ] Repository is clean (no uncommitted changes)
- [ ] `.gitignore` is configured correctly
- [ ] No sensitive files in repository
- [ ] Commit messages are descriptive

### Documentation Verification

**README.md:**
- [ ] Installation instructions are correct
- [ ] Essential commands are documented
- [ ] Project structure is accurate
- [ ] Tech stack is current

**AGENTS.md:**
- [ ] Project overview is accurate
- [ ] Essential commands are correct
- [ ] Astro 6 constraints are documented
- [ ] Common pitfalls are listed

**TODO.md:**
- [ ] Completed tasks are marked
- [ ] Pending tasks are accurate
- [ ] Completion notes are present
- [ ] No duplicate tasks

**Strategy Documentation:**
- [ ] `docs/strategy.md` exists
- [ ] `docs/content-governance.md` exists
- [ ] `docs/proof-hierarchy.md` exists
- [ ] `docs/launch-checklist.md` exists
- [ ] `docs/implementation-assumptions.md` exists

## Launch Day Checklist

### Final Checks

**1 Hour Before Launch:**
- [ ] Run full test suite: `npm run test:full`
- [ ] Run production build: `npm run build`
- [ ] Run Lighthouse CI: `npm run lighthouse`
- [ ] Verify no console errors in browser
- [ ] Check analytics integration

**30 Minutes Before Launch:**
- [ ] Merge all pending PRs to `main`
- [ ] Verify CI/CD pipeline passes
- [ ] Check Vercel deployment preview
- [ ] Test critical user journeys manually
- [ ] Verify contact form submission

**At Launch:**
- [ ] Deploy to production via Vercel
- [ ] Verify deployment completes successfully
- [ ] Test live site (trevor-lam.com)
- [ ] Check analytics are receiving data
- [ ] Monitor error logs for 15 minutes

**Post-Launch (1 Hour):**
- [ ] Check Lighthouse scores on live site
- [ ] Verify all page loads work
- [ ] Test contact form on live site
- [ ] Check search engine indexing
- [ ] Monitor error rate

**Post-Launch (24 Hours):**
- [ ] Review analytics data
- [ ] Check for error spikes
- [ ] Verify no performance regressions
- [ ] Test on mobile devices
- [ ] Solicit feedback from trusted contacts

## Rollback Plan

If critical issues are discovered post-launch:

**Immediate Rollback (<15 minutes):**
- Use Vercel rollback to previous deployment
- Document the issue in GitHub
- Communicate status if users are affected

**Fix and Redeploy (<1 hour):**
- Create hotfix branch from `main`
- Implement fix
- Run full test suite
- Deploy to preview environment
- Test fix thoroughly
- Merge and deploy to production

**Post-Mortem (within 1 week):**
- Document root cause
- Update launch checklist to prevent recurrence
- Add regression test if applicable
- Review monitoring and alerting

## Ongoing Monitoring

**Daily Checks:**
- [ ] Error rate is within acceptable limits
- [ ] Site performance is stable
- [ ] No security vulnerabilities detected

**Weekly Checks:**
- [ ] Analytics data is being collected
- [ ] Contact form submissions are received
- [ ] No broken links (via automated check)

**Monthly Checks:**
- [ ] Lighthouse scores remain ≥90
- [ ] Accessibility violations are at zero
- [ ] Dependencies are up-to-date
- [ ] Content freshness review (per governance docs)
