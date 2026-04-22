# Implementation Assumptions

This document documents non-obvious design decisions and architectural choices for trevor-lam.com.

## Content Architecture

### Company-Based Case Study Slugs

**Decision:** Case study URLs use company names (`/cases/sonic`, `/cases/grandlux`, `/cases/klw`) rather than industry-based slugs (`/cases/qsr`, `/cases/salon`, `/cases/financial-services`).

**Rationale:**
- Company names are more specific and memorable than industry categories
- Avoids confusion when multiple case studies exist in the same industry
- Companies are unique identifiers; industries are not
- Aligns with how recruiters and founders search (specific companies > generic industries)

**Trade-offs:**
- Less discoverable for industry-specific searches
- Requires redirects for legacy industry-based URLs (implemented via redirect pages)
- Company names may change over time (rare for the case studies featured)

**Implementation:**
- Redirect pages in `src/pages/cases/qsr.astro`, `salon.astro`, `financial-services.astro`
- Navigation uses company-based slugs in `src/config/navigation.ts`
- Metrics in `/data/metrics.json` reference `caseStudySlug` with company names

### Metrics-First Approach

**Decision:** All quantified achievements are stored in a single JSON file (`/data/metrics.json`) and referenced throughout the site, rather than being hardcoded in components.

**Rationale:**
- Single source of truth prevents inconsistencies
- Metrics can be updated in one place and reflected everywhere
- Enables easy addition of new metrics without component changes
- Supports metrics-to-case-study linkage via `caseStudySlug` field

**Trade-offs:**
- Requires JSON parsing in components (minor performance overhead)
- Metrics must be kept in sync with case study narratives
- No type safety at build time (mitigated by Zod schema in content collections)

**Implementation:**
- `MetricCard` component accepts `metricId` prop and fetches from `/data/metrics.json`
- Metrics grid on homepage maps to all metrics in the JSON file
- Case studies include inline metrics that reference the same data source

### Content Collections over Manual Routing

**Decision:** Use Astro Content Layer API with Zod schemas for all content (case studies, capabilities, learning logs, projects, resources, skills) rather than manual page creation.

**Rationale:**
- Schema validation ensures data consistency
- Type safety via TypeScript generation from Zod schemas
- Built-in data querying via `getCollection()`
- Automatic frontmatter validation at build time
- Supports future content additions without code changes

**Trade-offs:**
- Learning curve for Content Layer API (new in Astro 6)
- Requires schema updates for new fields
- Less flexibility for one-off content types

**Implementation:**
- `src/content.config.ts` defines all collections with Zod schemas
- Each collection uses `glob()` loader for file-based content
- Dynamic routes (`[slug].astro`) use `getCollection()` to fetch entries
- MDX rendering uses `await render(entry, { components })` pattern

## Technical Architecture

### Static Site Generation (SSG)

**Decision:** Use `output: 'static'` in Astro configuration rather than server-side rendering (SSR) or hybrid.

**Rationale:**
- Maximum performance (no server processing)
- Lowest hosting costs (static files only)
- Best security (no server-side attack surface)
- CDN-friendly (can be cached globally)
- Sufficient for personal portfolio (no dynamic content requirements)

**Trade-offs:**
- No server-side functionality (contact form uses Formspree)
- No real-time features (not needed for portfolio)
- Build time increases with content volume (acceptable for current scale)

**Implementation:**
- `astro.config.mjs` sets `output: 'static'`
- All routes are pre-rendered at build time
- Contact form uses Formspree for server-side processing
- No API routes or server-side logic

### Tailwind CSS v4 with @tailwindcss/vite Plugin

**Decision:** Use Tailwind CSS v4 with `@tailwindcss/vite` Vite plugin instead of the deprecated `@astrojs/tailwind` integration.

**Rationale:**
- Tailwind v4 is the current major version with improved performance
- CSS-first configuration via `@theme` directive (no `tailwind.config.mjs` file)
- Vite plugin is the recommended integration method for Astro 6
- Better build performance and smaller bundle size

**Trade-offs:**
- Newer ecosystem (less community examples)
- Migration from v3 requires configuration changes
- CSS-first approach is different from JavaScript-based config

**Implementation:**
- `astro.config.mjs` includes `tailwindcss()` in Vite plugins
- `src/styles/tailwind.css` uses `@theme` directive for customization
- No `tailwind.config.mjs` file exists
- Dark mode uses `@custom-variant dark (&:where(.dark, .dark *))` pattern

### ClientRouter Instead of ViewTransitions

**Decision:** Use `<ClientRouter />` from `astro:transitions` instead of the deprecated `<ViewTransitions />` component.

**Rationale:**
- `<ClientRouter />` is the recommended component in Astro 6
- Better performance and more predictable behavior
- Officially supported transition mechanism
- Aligns with Astro 6 best practices

**Trade-offs:**
- Requires explicit import from `astro:transitions`
- Different API from `<ViewTransitions />` (migration needed if upgrading from v5)

**Implementation:**
- `src/layouts/BaseLayout.astro` imports `<ClientRouter />` from `astro:transitions`
- ClientRouter component is rendered in the layout
- No `<ViewTransitions />` component used

### CSP with Hash-Based Script Hashes

**Decision:** Enable CSP via `security: { csp: { enabled: true } }` in Astro configuration, which auto-generates script hashes instead of using `'unsafe-inline'`.

**Rationale:**
- Hash-based CSP is more secure than `'unsafe-inline'`
- Astro auto-generates hashes for inline scripts
- No manual CSP configuration needed
- Aligns with security best practices for 2026

**Trade-offs:**
- CSP is stable in Astro 6 (was experimental in v5)
- Requires all scripts to be hashable (no dynamic script injection)
- Slightly more complex debugging if CSP violations occur

**Implementation:**
- `astro.config.mjs` sets `security: { csp: { enabled: true } }`
- No `'unsafe-inline'` in CSP directives
- Script hashes auto-generated by Astro at build time
- Security headers in `vercel.json` complement CSP

### No COEP Header

**Decision:** Intentionally omit Cross-Origin-Embedder-Policy (COEP) header from security headers configuration.

**Rationale:**
- COEP would break third-party scripts (Plausible analytics, Formspree)
- No SharedArrayBuffer or cross-origin isolation requirements for this site
- Analytics and form functionality are critical for conversion tracking
- Trade-off: slightly reduced security for essential functionality

**Trade-offs:**
- Cannot use certain advanced web APIs (not needed for portfolio)
- Third-party scripts have more privileges (acceptable for trusted services)
- Must rely on CSP and other headers for security

**Implementation:**
- `vercel.json` does not include COEP header
- Other security headers (HSTS, COOP, CORP, Permissions-Policy) are present
- CSP provides script security via hashes

## Performance Optimization

### Image Placement in /src/assets/

**Decision:** Place all images in `/src/assets/` for optimization via Astro's image service, rather than `/public/` for static serving.

**Rationale:**
- Automatic optimization (AVIF format, quality reduction)
- Responsive image generation (multiple sizes)
- Lazy loading for non-LCP images
- Better performance and smaller bundle size

**Trade-offs:**
- Build time slightly increased (image processing)
- Cannot access images directly via URL (must use component)
- Requires `OptimizedImage` component usage throughout site

**Implementation:**
- All images in `/src/assets/` (e.g., `headshot.svg`)
- `OptimizedImage` component used for all image rendering
- LCP image (headshot) has `loading="eager"` and `fetchpriority="high"`
- Other images use default lazy loading

### Lighthouse CI Enforcement

**Decision:** Use Lighthouse CI to enforce minimum scores (≥90) for Performance, Accessibility, Best Practices, and SEO.

**Rationale:**
- Automated quality gates prevent performance regressions
- Aligns with enterprise-grade testing infrastructure
- Ensures consistent user experience across deployments
- Provides objective metrics for optimization efforts

**Trade-offs:**
- May block deployments if scores drop below threshold
- Requires CI/CD pipeline integration
- Adds to build time (Lighthouse runs during CI)

**Implementation:**
- `lighthouserc.js` configures score thresholds (≥90)
- Lighthouse CI runs in `.github/workflows/ci.yml`
- Fails CI if any score falls below threshold
- Manual score review required for threshold changes

## Accessibility

### Skip to Content Link

**Decision:** Include skip-to-content link as the first focusable element on all pages.

**Rationale:**
- WCAG 2.2 AA requirement for keyboard accessibility
- Improves navigation for screen reader users
- Minimal implementation overhead
- Standard accessibility pattern

**Trade-offs:**
- Adds visual element to page (hidden via CSS)
- Requires consistent implementation across layouts

**Implementation:**
- Skip link in `BaseLayout.astro` as first element
- Visually hidden but available to screen readers
- Links to `#main` content area
- `scroll-padding-top: 80px` on `:root` prevents header obscuring focused content

### Touch Target Size (44x44px Minimum)

**Decision:** All interactive elements (buttons, links, form inputs) have touch targets ≥44x44px.

**Rationale:**
- WCAG 2.2 AA requirement for mobile accessibility
- Improves usability on touch devices
- Prevents accidental taps
- Industry standard for mobile UI

**Trade-offs:**
- May require larger buttons than design preference
- Padding increases element size
- Requires consistent application across components

**Implementation:**
- Tailwind utility classes: `min-h-[44px] min-w-[44px]` or padding
- Applied to all buttons, links, and form inputs
- Checked via accessibility tests (Playwright + Axe Core)

### No <style> Tags in MDX-Imported Components

**Decision:** Avoid using `<style>` tags in components imported into MDX files due to Astro 6 bug that drops them.

**Rationale:**
- Astro 6 bug: `<style>` tags are dropped when components are imported into MDX
- Workaround: use Tailwind utility classes only for styling
- Ensures consistent styling across MDX content
- Aligns with Tailwind-first approach

**Trade-offs:**
- All styling must use Tailwind classes (no custom CSS in components)
- May require more complex Tailwind class strings
- Limits component styling flexibility

**Implementation:**
- Components used in MDX (e.g., `InlineMetric`, `SkillTag`) use Tailwind only
- Comment added to components: "Astro 6 bug: <style> dropped in MDX"
- Custom CSS only in components not imported into MDX

## Content Strategy

### "Initial State → What I Delivered → Outcome" Structure

**Decision:** All case studies follow a three-part narrative structure: Initial State → What I Delivered → Outcome.

**Rationale:**
- Clear causation between actions and results
- Avoids "we" language (uses "I" for personal attribution)
- Demonstrates problem-solving approach
- Aligns with recruiter expectations for concrete evidence

**Trade-offs:**
- More structured than free-form narrative
- Requires consistent formatting across all case studies
- May feel formulaic if not executed well

**Implementation:**
- All case study MDX files use H2 headings for each section
- Metrics are embedded in "What I Delivered" and "Outcome" sections
- Structure documented in content governance guidelines

### No Negative Framing

**Decision:** Avoid negative framing (e.g., "mess", "broken", "chaos") in favor of neutral language (e.g., "initial state", "operational context", "friction points").

**Rationale:**
- Professional tone demonstrates emotional intelligence
- Avoids disparaging previous work or teams
- Focuses on improvement rather than criticism
- Aligns with executive communication standards

**Trade-offs:**
- May reduce dramatic impact of turnaround stories
- Requires more careful word choice
- Less emotive language

**Implementation:**
- Content governance guidelines specify tone rules
- Case study reviews check for negative framing
- Learning logs follow same tone guidelines

### Quantified Metrics Only

**Decision:** All claims of impact must be quantified with specific numbers, percentages, or timeframes. No vague claims like "significant improvement" or "dramatic increase."

**Rationale:**
- Recruiters and founders prioritize quantified results
- Enables verification and credibility
- Differentiates from generic portfolio claims
- Aligns with metrics-first data structure

**Trade-offs:**
- Requires data tracking and documentation
- May not capture all forms of value
- Some impacts are difficult to quantify

**Implementation:**
- All metrics in `/data/metrics.json` are quantified
- Case study metrics reference the JSON file
- Content validation checks for quantification
- Governance docs specify quantification requirements

## Testing Strategy

### Enterprise-Grade Test Infrastructure

**Decision:** Implement comprehensive testing infrastructure with 10+ test types (unit, component, integration, E2E, accessibility, contract, mutation, fuzzing, property-based, browser, visual).

**Rationale:**
- Demonstrates technical sophistication beyond typical portfolio
- Ensures reliability and maintainability
- Aligns with enterprise development standards
- Provides confidence for deployments

**Trade-offs:**
- Significant setup and maintenance overhead
- Increases build time
- May be over-engineering for a personal portfolio
- Requires ongoing test updates

**Implementation:**
- Vitest for unit, component, integration tests
- Playwright for E2E and accessibility tests
- Pact for contract tests
- Stryker for mutation testing
- Jazzer for fuzzing
- fast-check for property-based testing
- CI/CD pipeline runs 8-shard test matrix

### No waitForTimeout() in Tests

**Decision:** Prohibit use of `waitForTimeout()` in tests; use web-first assertions (`expect().toBeVisible()`, `expect().toHaveURL()`) instead.

**Rationale:**
- Flaky tests are a major CI/CD anti-pattern
- Web-first assertions are more reliable and faster
- Aligns with Playwright best practices
- Reduces test maintenance burden

**Trade-offs:**
- Requires understanding of Playwright assertion APIs
- May need to restructure some tests
- Less control over exact timing

**Implementation:**
- Test documentation specifies no `waitForTimeout()`
- Code reviews check for timeout usage
- Playwright config enables auto-waiting by default

## Security

### Hash-Based CSP Without unsafe-inline

**Decision:** Use CSP with auto-generated script hashes instead of `'unsafe-inline'` directive.

**Rationale:**
- `'unsafe-inline'` defeats the purpose of CSP
- Hash-based approach is more secure
- Astro auto-generates hashes for inline scripts
- Aligns with modern security best practices

**Trade-offs:**
- Requires all scripts to be hashable
- Slightly more complex debugging if violations occur
- Cannot use dynamic script injection

**Implementation:**
- `astro.config.mjs` enables CSP with `security: { csp: { enabled: true } }`
- No `'unsafe-inline'` in CSP directives
- Script hashes auto-generated at build time
- CSP violations visible in browser console

### External Link Security Attributes

**Decision:** All external links must have `rel="noopener noreferrer"` and `target="_blank"` attributes.

**Rationale:**
- Prevents tabnabbing attacks (security vulnerability)
- `noopener` prevents new page from accessing original page's window object
- `noreferrer` prevents passing referrer information
- Standard security practice for external links

**Trade-offs:**
- Opens links in new tab (user preference varies)
- Requires consistent application across all external links
- May be automated via rehype plugin (future enhancement)

**Implementation:**
- Manual audit of all external links
- PDF download links include security attributes
- Future: rehype plugin for automatic attribute addition

### No Secrets in Repository

**Decision:** Never commit secrets (API keys, credentials) to repository. Use environment variables via `import.meta.env`.

**Rationale:**
- Prevents credential leakage if repository is compromised
- Standard security practice for all applications
- Enables different configurations per environment
- Aligns with 12-factor app methodology

**Trade-offs:**
- Requires environment variable configuration
- Adds complexity to local development setup
- Must document required environment variables

**Implementation:**
- `.env` file in `.gitignore`
- Environment variables accessed via `import.meta.env`
- Vercel environment variables configured for production
- No secrets in code or configuration files

## Deployment

### Vercel Auto-Deploy from main Branch

**Decision:** Configure Vercel to automatically deploy on every push to `main` branch.

**Rationale:**
- Continuous deployment reduces release friction
- CI/CD pipeline ensures quality before deployment
- Fast feedback loop for changes
- Standard practice for static sites

**Trade-offs:**
- Every commit triggers deployment (build time)
- Requires CI/CD pipeline to be reliable
- May deploy incomplete features if not using feature branches

**Implementation:**
- Vercel project connected to GitHub repository
- Auto-deploy enabled for `main` branch
- Preview deployments for pull requests
- CI/CD pipeline runs before deployment

### Security Headers via vercel.json

**Decision:** Configure security headers (HSTS, X-Frame-Options, COOP, CORP, Permissions-Policy) in `vercel.json` rather than via middleware.

**Rationale:**
- Vercel-native configuration is simpler
- Headers applied at edge (better performance)
- No server-side middleware required
- Aligns with Vercel best practices

**Trade-offs:**
- Headers only apply on Vercel (not other hosts)
- Cannot dynamically adjust headers based on request
- Limited to Vercel's header configuration options

**Implementation:**
- `vercel.json` defines security headers
- Headers applied to all routes
- No COEP header (intentionally omitted)
- CSP configured separately in `astro.config.mjs`

## Future Considerations

### Potential Architecture Changes

**Dark Mode Toggle:**
- Current: Dark mode not implemented (light mode only)
- Future: Add ThemeToggle component with localStorage persistence
- Consideration: Requires careful FOUC prevention and Tailwind v4 dark mode configuration

**RSS Feed:**
- Current: No RSS feed
- Future: Add RSS feed for learning logs using `@astrojs/rss`
- Consideration: Feed should include only learning logs (not all content)

**PWA Support:**
- Current: Not a Progressive Web App
- Future: Add manifest.webmanifest and service worker for offline viewing
- Consideration: PWA may be over-engineering for a portfolio site

**Analytics Opt-Out:**
- Current: Plausible analytics always enabled
- Future: Add toggle switch for privacy-conscious users
- Consideration: Must respect localStorage preference and conditionally load scripts

**Pagination:**
- Current: No pagination (all content on single pages)
- Future: Add pagination for learning logs and resources using Astro's `paginate()`
- Consideration: Current content volume doesn't require pagination yet

### Technical Debt Monitoring

**Lint Warnings:**
- Current: Markdown lint warnings in docs/ (MD032, MD022)
- Action: Acceptable for internal documentation; not blocking
- Future: Consider adding markdownlint config to suppress or fix

**TypeScript Errors:**
- Current: `ts-errors-full.txt` exists (277 lines of errors)
- Action: Investigate and resolve TypeScript strict mode violations
- Future: Aim for zero TypeScript errors for type safety

**Bundle Size:**
- Current: No bundle size monitoring in CI
- Future: Add bundle size limits to prevent regressions
- Consideration: Use `bundlesize` package or similar tool
