---
trigger: always_on
description: Astro 6 specific requirements and constraints
---

# Astro 6 Constraints

## Plugin Requirements

- Use `@tailwindcss/vite` plugin, NOT `@astrojs/tailwind` integration
- Add to Vite plugins in astro.config.mjs: `tailwindcss()`

## Transitions

- Use `<ClientRouter />` from `astro:transitions`, NOT `<ViewTransitions />`
- Import: `import { ClientRouter } from 
astro:transitions`

## Content Layer API

- Use `getCollection()` from Content Layer API, NOT `Astro.glob()`
- Import: `import { getCollection } from astro:content`
- For MDX rendering: `await render(entry, { components })`

## Content Configuration

- Configure in `src/content.config.ts` (NOT `src/content/config.ts`)
- Use `defineCollection` + `loader: glob()` for each collection
- Example:
  ```ts
  defineCollection({
    loader: glob({ base: ./src/content/cases, pattern: **/*.mdx })
  })
  ```

## Security

- Enable CSP via `security: { csp: { enabled: true } }` in astro.config.mjs
- CSP auto-generates script hashes (no `unsafe-inline` needed)

## Common Pitfalls

| Pitfall | Prevention |
|---------|-------------|
| Using `entry.render()` | Use `await render(entry, { components })` |
| Using `Astro.glob()` | Use `getCollection()` from Content Layer API |
| Wrong config file location | Use `src/content.config.ts` (not `src/content/config.ts`) |
| Using `<ViewTransitions />` | Use `<ClientRouter />` from `astro:transitions` |
| Using `@astrojs/tailwind` | Use `@tailwindcss/vite` plugin
