---
name: performance-optimization
description: Guides performance optimization including Core Web Vitals (LCP, INP, CLS), bundle optimization, image optimization, and font loading for Astro 6 projects
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [performance, web-vitals, lcp, inp, cls, optimization]
  astro_version: 6.1.8
---

# Performance Optimization

## Verification Snapshot (2026-04)
- Verified LCP <2.5s, INP <200ms, CLS <0.1 budgets
- Confirmed Lighthouse CI enforces 90+ scores
- Validated image optimization with Sharp service
- Tested font loading with Astro Fonts API
- Confirmed bundle optimization with manual chunking

This skill provides guidance for optimizing performance in Astro 6 projects, focusing on Core Web Vitals, bundle optimization, image optimization, and font loading.

## Core Web Vitals Budgets

### Performance Targets

- **LCP (Largest Contentful Paint)**: <2.5s
- **INP (Interaction to Next Paint)**: <200ms
- **CLS (Cumulative Layout Shift)**: <0.1

### Lighthouse CI Requirements

Lighthouse CI enforces scores ≥90 for:
- Performance
- Accessibility
- Best Practices
- SEO

### Running Lighthouse

```bash
npm run lighthouse
```

## Bundle Optimization

### Manual Chunking (vite.config.ts or astro.config.mjs)

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['@astrojs/react', 'react', 'react-dom'],
          ui: ['@astrojs/mdx'],
          analytics: ['@vercel/analytics']
        }
      }
    }
  }
})
```

### Bundle Analysis

```bash
ANALYZE=true npm run build
```

### Build Optimization Settings

```javascript
export default defineConfig({
  target: 'es2022',
  minify: 'esbuild',
  sourcemap: false // Disable in production
})
```

## Image Optimization

### Image Service Configuration

```javascript
export default defineConfig({
  image: {
    service: 'sharp',
    defaultQuality: 75
  }
})
```

### Image Placement

- **Place images in `/src/assets/`** (not `/public/`)
- Use `OptimizedImage` component for all images
- Images in `/src/assets/` are automatically optimized

### LCP Image Optimization

For Largest Contentful Paint images (e.g., headshot):

```html
<OptimizedImage 
  src="/assets/headshot.svg" 
  alt="Trevor Lam, professional headshot"
  loading="eager"
  fetchpriority="high"
/>
```

### Image Formats

- **AVIF**: Modern format, 75% quality
- **WebP**: Fallback for older browsers
- **SVG**: For vector graphics (icons, logos)

### Common Image Pitfalls

- **Placing images in /public/**: Not optimized, use /src/assets/
- **Missing loading="eager" on LCP**: Delays LCP, add to headshot
- **Missing fetchpriority="high"**: Low priority for critical images
- **Large unoptimized images**: Use Sharp service for optimization
- **Missing alt text**: Accessibility issue, always provide alt text

## Font Optimization

### Astro Fonts API

```typescript
import { Inter, JetBrains_Mono } from 'astro:fonts'

const inter = Inter({ 
  subsets: ['latin'],
  weights: [400, 600, 700],
  variable: '--font-inter',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weights: [400, 500],
  variable: '--font-mono',
  display: 'swap'
})
```

### Font Display Strategy

- **font-display: swap**: Text visible immediately, font swaps in later
- **Self-hosted**: Fonts served from your domain (no external requests)
- **Subset loading**: Only load needed character subsets

### Font Configuration

```css
@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Font Loading Gotchas

- **External font services**: Avoid Google Fonts, use Astro Fonts API
- **Missing font-display: swap**: Causes FOIT (Flash of Invisible Text)
- **Loading full font files**: Use subsets for smaller files
- **Blocking font loading**: Use swap to prevent render blocking

## Prefetching Strategy

### Link Prefetching

```javascript
export default defineConfig({
  prefetch: {
    default: 'hover'
  }
})
```

### Prefetch Behavior

- **Hover strategy**: Prefetch links on hover
- **Instant navigation**: Pre-loaded pages load instantly
- **Bandwidth-aware**: Respects user's connection quality

## Critical CSS

### Astro Automatic Optimization

- Astro automatically inlines critical CSS
- No manual optimization needed
- Improves LCP performance

### CSS Purge

- Tailwind v4 automatically purges unused styles
- No configuration needed
- Only used classes included in build

## Performance Validation Loop

1. Make performance changes
2. Run build: `npm run build`
3. Run Lighthouse: `npm run lighthouse`
4. If scores below 90:
   - Review Lighthouse report
   - Address performance issues
   - Re-run Lighthouse
5. Check bundle size: `ANALYZE=true npm run build`
6. If bundle too large:
   - Add manual chunking
   - Remove unused dependencies
   - Optimize imports
7. Test LCP in dev: Check network tab for image loading
8. If LCP >2.5s:
   - Optimize LCP image (eager, high priority)
   - Reduce image size
   - Check for render-blocking resources
9. Only proceed when Lighthouse ≥90, LCP <2.5s, INP <200ms, CLS <0.1

## Gotchas

- **Images in /public/**: Not optimized - must place in /src/assets/
- **LCP image attributes**: Missing loading="eager" or fetchpriority="high" delays LCP
- **External fonts**: Use Astro Fonts API, not Google Fonts
- **Missing font-display: swap**: Causes FOIT, always include swap
- **Bundle size**: Large bundles hurt performance - use manual chunking
- **Render-blocking resources**: Critical CSS inlined automatically, but check for blocking scripts
- **Unused dependencies**: Increase bundle size - remove unused packages
- **Missing source maps**: Enable in dev, disable in production
- **Prefetch strategy**: Use hover for instant navigation
- **CLS from images**: Always specify width/height to prevent layout shift

## Important Notes

- LCP <2.5s, INP <200ms, CLS <0.1 budgets
- Lighthouse CI enforces 90+ scores for Performance, Accessibility, Best Practices, SEO
- Images in `/src/assets/` with Sharp service (AVIF, 75% quality)
- LCP images need `loading="eager"` and `fetchpriority="high"`
- Use Astro Fonts API with `font-display: swap`
- Manual chunking for vendor, UI, analytics bundles
- Prefetch with hover strategy for instant navigation
- Run Lighthouse: `npm run lighthouse`
- Bundle analysis: `ANALYZE=true npm run build`
