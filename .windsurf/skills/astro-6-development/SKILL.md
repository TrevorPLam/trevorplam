---
name: astro-6-development
description: Guides Astro 6 development patterns, breaking changes from v5, and proper implementation of Content Layer API, ClientRouter, and @tailwindcss/vite plugin
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [astro, framework, migration, content-layer]
  astro_version: 6.1.8
  vite_version: 7.3.2
---

# Astro 6 Development

## Verification Snapshot (2026-04)
- Verified against Astro 6.1.8 stable release
- Tested with Vite 7.3.2 (locked in package.json)
- Confirmed Content Layer API patterns work correctly
- Validated @tailwindcss/vite plugin integration
- Verified ClientRouter replaces ViewTransitions correctly

This skill provides guidance for developing with Astro 6, focusing on breaking changes from v5 and proper implementation of new features.

## Critical Breaking Changes from Astro v5

### 1. Tailwind CSS Integration
- **Old**: `@astrojs/tailwind` integration
- **New**: `@tailwindcss/vite` plugin (no integration)
- **Implementation**: Add to `vite.config.ts` or `astro.config.mjs` plugins array
- **Important**: No `tailwind.config.mjs` file - use CSS-first configuration with `@theme`

### 2. View Transitions
- **Old**: `<ViewTransitions />` component
- **New**: `<ClientRouter />` from `astro:transitions`
- **Import**: `import { ClientRouter } from 'astro:transitions'`

### 3. Content Rendering
- **Old**: `entry.render()` method
- **New**: `import { render } from 'astro:content'` → `await render(entry, { components })`
- **Usage**: When rendering MDX content collections

### 4. Content Discovery
- **Old**: `Astro.glob()` for file discovery
- **New**: `getCollection()` from Content Layer API
- **Usage**: `const entries = await getCollection('caseStudies')`

### 5. Content Configuration
- **Old**: `src/content/config.ts` without loader
- **New**: `src/content.config.ts` with `defineCollection` + `loader: glob()`
- **Example**:
```typescript
import { defineCollection, z } from 'astro:content'

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    industry: z.string(),
    // ... other fields
  })
})

export const collections = { caseStudies }
```

### 6. CSP Configuration
- **Old**: `experimental.csp` in astro.config
- **New**: `security: { csp: { enabled: true } }` (stable)
- **Behavior**: Auto-generates script hashes, no `'unsafe-inline'`

## Content Layer API Usage

### Getting Collections
```typescript
import { getCollection } from 'astro:content'

// Get all entries
const allCases = await getCollection('caseStudies')

// Get filtered entries
const publishedCases = await getCollection('caseStudies', ({ data }) => {
  return data.published === true
})
```

### Rendering MDX Content
```typescript
import { render } from 'astro:content'
import CaseStudyHeader from '@/components/CaseStudyHeader.astro'

const { Content, headings } = await render(entry, {
  components: {
    CaseStudyHeader,
    // ... other components
  }
})
```

## Common Pitfalls

### Using `<style>` Tags in MDX Components
- **Issue**: Astro 6 bug drops `<style>` tags in components imported into MDX
- **Solution**: Use Tailwind utility classes only
- **Comment**: Add "Astro 6 bug: <style> dropped in MDX" as reminder

### Forgetting Vite v7 Lock
- **Issue**: Vite v8 conflicts with `@tailwindcss/vite`
- **Solution**: Ensure `package.json` has `vite@^7.0.0`

### Using entry.render()
- **Issue**: Deprecated method
- **Solution**: Use `await render(entry, { components })`

### Hardcoded Waits in Tests
- **Issue**: Using `waitForTimeout()`
- **Solution**: Use web-first assertions (`expect().toBeVisible()`, `expect().toHaveURL()`)

### Placing Images in /public/
- **Issue**: Images not optimized
- **Solution**: Place in `/src/assets/` and use `OptimizedImage` component

## Project-Specific Configuration

### Vite Lock
Ensure `package.json` has:
```json
{
  "devDependencies": {
    "vite": "^7.3.2"
  }
}
```

### Tailwind v4 Configuration
- No `tailwind.config.mjs` file
- Use `@theme` directive in CSS
- CSS-first configuration approach
- Plugin: `@tailwindcss/vite` in astro.config.mjs

### Image Optimization
- Place images in `/src/assets/`
- Use `OptimizedImage` component
- LCP images need `loading="eager"` and `fetchpriority="high"`
- Sharp service with AVIF format (75% quality)

## Gotchas

- **Vite version lock**: Vite v8 conflicts with `@tailwindcss/vite` - must use v7.x (package.json: `vite@^7.0.0`)
- **Content config location**: Must be `src/content.config.ts` (not `src/content/config.ts`)
- **Style tags in MDX components**: Astro 6 bug drops `<style>` tags in components imported into MDX - use Tailwind classes only
- **entry.render() deprecated**: Must use `await render(entry, { components })` from `astro:content`
- **Astro.glob() deprecated**: Must use `getCollection()` from Content Layer API
- **ClientRouter import**: Import from `astro:transitions`, not `astro`
- **CSP unsafe-inline**: Never needed with Astro 6 - CSP auto-generates script hashes
- **Images in /public/**: Not optimized - must place in `/src/assets/` and use `OptimizedImage` component
- **LCP image attributes**: Headshot needs `loading="eager"` and `fetchpriority="high"`

## Validation Loop

1. Make Astro 6 changes
2. Run build: `npm run build`
3. If build errors:
   - Review error message for deprecated API usage
   - Fix the specific issue (check breaking changes list)
   - Re-run build
4. Run type check: `npm run check`
5. If type errors:
   - Fix TypeScript issues
   - Re-run type check
6. Only proceed when build and type check pass

## Reference Files

- Configuration: `astro.config.mjs`
- Content schema: `src/content.config.ts`
- Content collections: `src/content/`
- Components: `src/components/`
