---
description: Inspect codebase for performance issues including bundle size, image optimization, Core Web Vitals, and unused assets
---

# Performance Inspection Workflow

This workflow guides the AI agent through comprehensive performance inspection to identify bundle size issues, image optimization problems, Core Web Vitals violations, and unused assets.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed
- Understanding of web performance metrics and optimization

## Step 1: Repository Impact Mapping

Before inspecting, analyze the codebase structure and identify performance focus areas:

### Impact Map Structure
```markdown
# Repository Impact Map: Performance Inspection

## Performance-Critical Areas
- Bundle size (JavaScript, CSS)
- Image optimization
- Core Web Vitals (LCP, INP, CLS)
- Asset loading strategies
- Rendering performance
- Network requests

## Configuration Files
- astro.config.mjs (build optimization)
- package.json (dependencies)
- vercel.json (deployment)

## Asset Locations
- src/assets/ (optimized images)
- public/ (static assets)
- src/content/ (content files)
```

## Step 2: Bundle Size Analysis

Analyze the production bundle size:

### Build with Bundle Analysis
```bash
# Build with bundle analysis
npm run analyze:bundle
```

// turbo

### Issues to Flag
- JavaScript bundle >100KB gzipped
- CSS bundle >50KB gzipped
- Large dependencies contributing to bundle size
- Unused code in production bundle
- Missing code splitting opportunities

### Check Dependencies
```bash
# Analyze dependency sizes
npm ls --depth=0
```

### Issues to Flag
- Dependencies that are too large
- Dependencies that could be replaced with smaller alternatives
- Duplicate dependencies
- Unused dependencies

## Step 3: Image Optimization Check

Verify image optimization configuration:

### Check astro.config.mjs
```bash
# Review image optimization settings
grep -A 10 "image:" astro.config.mjs
```

### Current Configuration
- Service: Sharp (correct - faster than default)
- Default format: AVIF (correct - 40-60% better than WebP)
- Default quality: 75 (correct - balance of quality/size)

### Issues to Flag
- Images in /public/ instead of /src/assets/ (not optimized)
- Images without proper dimensions
- Images in wrong format (should use AVIF/WebP)
- Large images (>500KB) without optimization
- Missing responsive image variants

### Check Image Locations
```bash
# Find images in public (should be in src/assets)
find public -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.webp" \)
```

### Check for LCP Image
- Headshot image should have `loading="eager"`
- Headshot image should have `fetchpriority="high"`
- LCP image should be in AVIF format

## Step 4: Core Web Vitals Check

Run Lighthouse CI to check Core Web Vitals:

```bash
npm run lighthouse
```

// turbo

### Required Scores
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

### Core Web Vitals Thresholds
- LCP (Largest Contentful Paint): <2.5s
- INP (Interaction to Next Paint): <200ms
- CLS (Cumulative Layout Shift): <0.1

### Issues to Flag
- LCP >2.5s (slow loading)
- INP >200ms (slow interaction)
- CLS >0.1 (layout instability)
- Low Lighthouse scores (<90)
- Missing performance optimizations

## Step 5: Asset Loading Strategy

Check asset loading strategies:

### Check Prefetch Configuration
```bash
# Review prefetch settings in astro.config.mjs
grep -A 5 "prefetch:" astro.config.mjs
```

### Current Configuration
- prefetchAll: true (correct for portfolio site)
- defaultStrategy: 'hover' (correct for instant navigation)

### Issues to Flag
- Missing prefetch for important routes
- Over-prefetching (wasting bandwidth)
- Missing preload for critical resources
- Lazy loading for above-the-fold content

## Step 6: CSS Optimization

Check CSS optimization:

### Check Tailwind Configuration
- Verify @tailwindcss/vite plugin is used (not @astrojs/tailwind)
- Check for unused CSS classes
- Verify CSS code splitting is enabled

### Issues to Flag
- Unused CSS classes
- Large CSS files
- Missing CSS code splitting
- Inline styles that should be in Tailwind
- CSS in component <style> tags (Astro 6 bug drops these in MDX)

## Step 7: JavaScript Optimization

Check JavaScript optimization:

### Check Build Configuration
```bash
# Review build settings in astro.config.mjs
grep -A 10 "build:" astro.config.mjs
```

### Current Configuration
- target: 'es2022' (correct - modern browsers)
- minify: 'esbuild' (correct - faster)
- sourcemap: development only (correct)
- cssMinify: true (correct)

### Issues to Flag
- Missing minification
- Source maps in production
- Old browser targets
- Missing tree shaking
- Unused JavaScript code

## Step 8: Font Optimization

Check font configuration:

### Check astro.config.mjs
```bash
# Review font settings
grep -A 15 "fonts:" astro.config.mjs
```

### Current Configuration
- Provider: Fontsource (correct - privacy-focused)
- Fonts: Inter (sans), JetBrains Mono (mono)
- Weights: Optimized set

### Issues to Flag
- Missing font-display: swap
- Loading too many font weights
- Missing font subsetting
- Font files not self-hosted
- FOUT (Flash of Unstyled Text)

## Step 9: Unused Asset Detection

Search for unused assets:

### Check for Unused Images
- Images in src/assets/ not referenced in code
- Images in public/ not referenced in code
- Duplicate images
- Old/obsolete images

### Check for Unused CSS
- Unused Tailwind classes
- Unused component styles
- Duplicate CSS rules

### Check for Unused JavaScript
- Unused utility functions
- Unused components
- Duplicate code

## Step 10: Network Request Analysis

Analyze network request patterns:

### Issues to Flag
- Too many HTTP requests
- Large file sizes
- Missing HTTP/2 or HTTP/3
- Missing compression (gzip/brotli)
- Missing caching headers
- Unnecessary external resources

## Step 11: Rendering Performance

Check rendering performance:

### Issues to Flag
- Slow initial render
- Layout thrashing
- Excessive re-renders
- Missing virtualization for long lists
- Synchronous operations blocking render

## Step 12: Generate Performance Report

Compile all findings into a comprehensive performance report:

### Report Structure
```markdown
# Performance Inspection Report

## Critical Issues
- Bundle size: [details]
- Core Web Vitals: [details]

## High Priority Issues
- Image optimization: [details]
- Asset loading: [details]

## Medium Priority Issues
- CSS optimization: [details]
- JavaScript optimization: [details]

## Low Priority Issues
- Minor optimizations: [details]

## Metrics
- Bundle size: [size]
- LCP: [time]
- INP: [time]
- CLS: [score]
- Lighthouse scores: [scores]

## Recommendations
1. [Priority recommendation 1]
2. [Priority recommendation 2]
3. [Other recommendations]
```

## Notes

- Current image optimization is well-configured (Sharp + AVIF)
- LCP image (headshot) needs verification for loading="eager" and fetchpriority="high"
- Bundle analysis should be run regularly to catch size regressions
- Lighthouse CI enforces ≥90 scores for all categories
- Review AGENTS.md for performance guidelines

## Error Handling

If inspection fails:
1. Review the specific error message
2. Check that build completes successfully
3. Verify Lighthouse CI is configured
4. Run individual checks to isolate the issue
5. Review AGENTS.md for performance standards
