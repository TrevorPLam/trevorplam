---
description: Optimize site performance with bundle analysis, Core Web Vitals improvements, and Lighthouse CI validation
---

# Performance Optimization Workflow

This workflow guides you through optimizing the Trevor Lam portfolio site for performance, focusing on bundle size reduction, Core Web Vitals improvements, and Lighthouse CI validation.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed (`npm install`)
- Production build available (`npm run build`)
- Lighthouse CI configured

## Step 1: Baseline Performance Measurement

Run Lighthouse CI to establish baseline metrics:
```bash
npm run lighthouse
```
// turbo

Record the baseline scores:
- Performance: [score]
- Accessibility: [score]
- Best Practices: [score]
- SEO: [score]

Core Web Vitals:
- LCP (Largest Contentful Paint): [time]
- INP (Interaction to Next Paint): [time]
- CLS (Cumulative Layout Shift): [time]

## Step 1.5: Targeted Online Research (Current as of 04/2026)

Inform your understanding with external best practices before optimizing performance. This ensures you use modern optimization techniques and current best practices.

### Task-Specific Research
Conduct up-to-date research specifically on performance optimization techniques relevant to the identified issues.

### Focus Areas
Your research should cover:
- Modern bundling strategies (code splitting, tree shaking, lazy loading)
- Latest image optimization techniques (formats, loading strategies)
- Core Web Vitals optimization strategies (LCP, INP, CLS)
- Modern CSS optimization techniques
- JavaScript optimization patterns
- Browser performance APIs and measurement tools
- Performance budgets and measurement strategies

### Prioritize Official Sources
- Web.dev performance guides
- Chrome DevTools documentation
- MDN Web Docs performance section
- Lighthouse documentation
- Performance optimization blogs (Google Web Vitals, web.dev)

### Output Required
- Research findings with sources
- Modern optimization techniques identified
- Recommended approaches for each performance issue
- Tool recommendations for performance measurement
- Best practices for the specific performance issues identified

## Step 2: Bundle Analysis

Analyze bundle size to identify large dependencies:
```bash
npm run analyze:bundle
```

This generates a bundle visualization at `reports/bundle-analysis.html`.

### Analysis Focus Areas

- **Large dependencies (>100KB)**: Identify heavy packages
- **Duplicate code**: Check for multiple instances of similar functionality
- **Unused code**: Identify dead code that can be removed
- **Tree-shaking opportunities**: Ensure proper ES module usage
- **Code splitting opportunities**: Identify lazy loading candidates

## Step 3: Optimize Dependencies

Based on bundle analysis, implement optimizations:

### Remove Unused Dependencies
```bash
npm uninstall [unused-package]
```

### Replace Heavy Alternatives
- Consider lighter alternatives for heavy packages
- Example: Replace moment.js with date-fns or luxon
- Example: Replace lodash with native JS methods or smaller utilities

### Enable Tree Shaking
- Ensure packages support ES modules
- Use named imports instead of default imports
- Configure sideEffects in package.json

### Implement Code Splitting
- Lazy load non-critical routes
- Dynamic import heavy components
- Split vendor chunks from application code

## Step 4: Optimize Images

Ensure all images follow optimization guidelines:

### Image Placement
- Images must be in `/src/assets/` (NOT `/public/`)
- Use `OptimizedImage` component for all images

### LCP Image Optimization
For the headshot (LCP image):
- Add `loading="eager"`
- Add `fetchpriority="high"`
- Ensure AVIF format (default in astro.config.mjs)

### Other Images
- Use default lazy loading
- Ensure AVIF format with 75% quality
- Consider responsive sizes for different viewports

## Step 5: Optimize CSS

Tailwind v4 optimizations:

### CSS-First Configuration
- No custom CSS in component `<style>` tags
- Use Tailwind utility classes only
- Leverage `@theme` directive for customization

### Critical CSS
- Inline critical CSS for above-the-fold content
- Lazy load non-critical CSS
- Minimize CSS bundle size

### Dark Mode
- Ensure `class="dark"` on `<html>` element
- Use `@custom-variant dark (&:where(.dark, .dark *))` in CSS
- Verify color-scheme: dark on `:root`

## Step 6: Optimize JavaScript

### Reduce JavaScript Bundle Size
- Remove unused polyfills (target ES2022)
- Minify with esbuild (already configured)
- Enable sourcemaps only in development

### Optimize Third-Party Scripts
- Remove unused third-party scripts
- Defer non-critical scripts
- Consider self-hosting when possible

### Enable Client-Side Caching
- Configure proper cache headers in vercel.json
- Use service workers for offline capability (if applicable)
- Leverage browser caching strategies

## Step 7: Optimize Fonts

### Font Optimization
- Use Fontsource (already configured in astro.config.mjs)
- Ensure `font-display: swap`
- Use subset fonts to reduce size
- Preload critical fonts

### Current Font Configuration
- Inter: weights 400, 600, 700
- JetBrains Mono: weights 400, 500

## Step 8: Implement Resource Hints

Add resource hints to critical resources:

### Preconnect
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

### Preload
```html
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
```

### Prefetch
- Prefetch next likely routes
- Prefetch non-critical resources

## Step 9: Rebuild and Measure

Rebuild the production site:
```bash
npm run build
```

Run Lighthouse CI again:
```bash
npm run lighthouse
```

Compare with baseline metrics:
- Performance improvement: [delta]
- LCP improvement: [delta]
- INP improvement: [delta]
- CLS improvement: [delta]

## Step 10: Validate Core Web Vitals

Ensure metrics meet thresholds:
- **LCP**: <2.5s
- **INP**: <200ms
- **CLS**: <0.1

If thresholds not met:
1. Identify the specific metric causing failure
2. Implement targeted optimization
3. Rebuild and re-measure
4. Iterate until thresholds met

## Step 11: Accessibility Validation

Run accessibility tests to ensure optimizations don't break WCAG 2.2 AA compliance:
```bash
npm run test:a11y
```

Ensure zero axe-core violations.

## Step 12: Test Critical User Journeys

Manually test critical paths:
1. Homepage load
2. Navigation between pages
3. Image loading
4. Interactive elements (buttons, forms)
5. Mobile responsiveness

## Step 13: Document Changes

Update documentation with optimizations:
- Document dependency changes in CHANGELOG.md
- Update performance monitoring baselines
- Record optimization techniques for future reference

## Step 14: Deploy and Monitor

Deploy optimized build:
```bash
vercel --prod
```

Monitor production performance:
- Check Lighthouse scores in production
- Monitor Core Web Vitals via analytics
- Verify no regressions in user experience

## Notes

- Node version must be >=22.12.0 (enforced in package.json engines)
- Vite must be locked to v7 (conflicts with @tailwindcss/vite in v8)
- Images in `/public/` are NOT optimized - use `/src/assets/`
- CSP is currently disabled in astro.config.mjs (enable when ready)
- No COEP header (would break third-party analytics)
- Bundle analysis only runs when ANALYZE=true environment variable is set

## Common Optimization Techniques

### JavaScript
- Use dynamic imports for code splitting
- Implement lazy loading for routes
- Remove unused dependencies
- Minify and compress bundles

### CSS
- Purge unused Tailwind classes
- Critical CSS extraction
- Minimize custom CSS
- Use CSS-in-JS sparingly

### Images
- Use modern formats (AVIF, WebP)
- Implement responsive images
- Lazy load below-the-fold images
- Compress images appropriately

### Fonts
- Use font-display: swap
- Subset fonts to reduce size
- Preload critical fonts
- Use variable fonts when possible

### Caching
- Implement proper cache headers
- Use service workers for offline
- Leverage browser caching
- Implement CDN caching

## Error Handling

If optimization causes issues:
1. Revert to last working commit
2. Identify the specific change that caused the issue
3. Test the change in isolation
4. Implement alternative optimization approach
5. Rebuild and re-test
6. Document the issue and solution

## Performance Budgets

Target metrics:
- **Performance score**: ≥90
- **Accessibility score**: ≥90
- **Best Practices score**: ≥90
- **SEO score**: ≥90
- **LCP**: <2.5s
- **INP**: <200ms
- **CLS**: <0.1
- **Total bundle size**: <500KB (gzipped)
- **JavaScript bundle**: <300KB (gzipped)
- **CSS bundle**: <50KB (gzipped)

## Monitoring

Set up ongoing performance monitoring:
- Use Lighthouse CI in CI/CD pipeline
- Monitor Core Web Vitals in production
- Track bundle size over time
- Alert on performance regressions
- Review performance metrics monthly
