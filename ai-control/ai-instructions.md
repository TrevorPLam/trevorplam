# AI Control Instructions

This document provides global directives for AI assistants to maintain code style, testing standards, and project conventions across all AI tools (Cursor, Copilot, Claude, etc.).

## Project Context

This is a personal portfolio site for Trevor Lam, built with Astro 6, Tailwind CSS v4, TypeScript, and comprehensive testing infrastructure. The project focuses on operations / Chief of Staff / HR-payroll roles with evidence-based case studies and capabilities.

## Code Style Requirements

### Astro 6 Constraints (Critical)
- Use `@tailwindcss/vite` plugin in Vite, NOT `@astrojs/tailwind` integration
- Use `ClientRouter` from `astro:transitions`, NOT `ViewTransitions`
- Use Content Layer API: `getCollection()` from `astro:content`, NOT `Astro.glob()`
- Configure in `src/content.config.ts`, NOT `src/content/config.ts`
- For MDX rendering: use `await render(entry, { components })`, NOT `entry.render()`
- Enable CSP via `security: { csp: { enabled: true } }` in astro.config.mjs
- CSP auto-generates script hashes - NO `unsafe-inline` needed

### Tailwind v4 Requirements
- NO `tailwind.config.mjs` file - use CSS-first configuration
- Use Tailwind utility classes ONLY - NO custom CSS in component `<style>` tags
- **CRITICAL**: Do NOT use `<style>` tags in components imported into MDX (Astro 6 bug drops them)
- Use `@theme` directive in CSS for theme customization
- NO inline styles except for dynamic values

### TypeScript
- Strict mode enabled, no implicit any
- 2-space indentation
- Imports must be at the top of the file

### Dark Mode
- Add `class="dark"` to `<html>` element
- Use CSS: `@custom-variant dark (&:where(.dark, .dark *));`
- Add `color-scheme: dark` to `:root` for proper dark mode styling

## Testing Standards

### Vitest (Unit/Component Tests)
- Use web-first assertions: `expect().toBeVisible()`, `expect().toHaveURL()`
- NO `waitForTimeout()` - use web-first assertions instead
- Target: `tests/unit/` and `tests/components/`

### Playwright (E2E/A11y Tests)
- Use web-first assertions: `expect(page.locator()).toBeVisible()`
- Accessibility: Zero axe-core violations required
- Test keyboard navigation and screen reader compatibility
- Target: `tests/e2e/` and `tests/a11y/`

### Contract Tests
- Use Pact for API contract testing
- Target: `tests/contract/`

### Property-Based Testing
- Use fast-check for generative testing
- Target: `tests/property/`

### Fuzzing
- Use Jazzer for security vulnerability detection
- Target: `tests/fuzzing/`

### Mutation Testing
- Use Stryker with target 80% score
- Run via `npm run test:mutation`

## Accessibility Requirements (WCAG 2.2 AA)

- Skip to content link as first focusable element
- Touch targets ≥44x44px for all interactive elements
- Focus not obscured → `scroll-padding-top: 80px` on `:root`
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- ARIA labels for icon-only buttons
- Color contrast ≥4.5:1 (test with axe-core)

## Data & Content Handling

### Images
- Place images in `/src/assets/`, NOT `/public/`
- Use `OptimizedImage` component for all images
- LCP images (headshot) need: `loading="eager"` and `fetchpriority="high"`
- Other images: use default lazy loading

### JSON Data
- Import from `/data/` directory (metrics.json, skills.json, timeline.json)
- NEVER hardcode metric values - use single source of truth

### Content Collections
- Case studies: `/src/content/cases/` - use `getCollection('caseStudies')`
- Capabilities: `/src/content/capabilities/` - 5 capability categories
- Learning logs: `/src/content/learning-logs/` - 6 entries with tagging
- Projects: `/src/content/projects/` - 3 project showcases
- Resources: `/src/content/resources/` - 8 playbooks, templates, guides

## Security & Headers

### CSP Configuration
- Enable CSP in astro.config.mjs: `security: { csp: { enabled: true } }`
- CSP auto-generates script hashes - NO `unsafe-inline` needed
- NO COEP header (breaks third-party scripts like analytics)

### Environment Variables
- Use `import.meta.env` for environment variables
- NEVER commit secrets to repository

## Content Tone Guidelines

- Tone: Professional, confident, evidence-based
- Avoid negative framing ("mess", "broken", "chaos") → use "initial state", "operational context", "friction points"
- Metrics: All numbers from `/data/metrics.json` - never hardcoded
- Case studies structure: "Initial State" → "What I Delivered" → "Outcome"
- No placeholder text - final copy only

## Common Pitfalls to Avoid

| Pitfall | Prevention |
|---------|-------------|
| Using `entry.render()` | Use `await render(entry, { components })` |
| Using `Astro.glob()` | Use `getCollection()` from Content Layer API |
| Wrong config file location | Use `src/content.config.ts` (not `src/content/config.ts`) |
| Using `<ViewTransitions />` | Use `ClientRouter />` from `astro:transitions` |
| Using `@astrojs/tailwind` | Use `@tailwindcss/vite` plugin |
| Using `<style>` in MDX-imported components | Tailwind classes only (Astro 6 bug) |
| Forgetting to lock Vite to v7 | `package.json` must have `vite@^7.0.0` |
| Placing images in `/public/` | Place in `/src/assets/` for optimization |
| Hardcoded waits in tests | `expect().toBeVisible()`, `expect().toHaveURL()` |
| Missing `mainEntityOfPage` in JSON-LD | All schemas must link `@id` to `#person` and `#website` |

## References

- AGENTS.md - Project-specific guidance for AI coding agents
- `.cursor/rules/astro.mdc` - Cursor-specific Astro development patterns
- `.windsurf/rules/` - Accessibility and other project rules
- docs/launch-checklist.md - Testing requirements
- docs/content-governance.md - Content management guidelines

## Tool-Specific Instructions

For tool-specific instructions, refer to:
- Cursor: `.cursor/rules/astro.mdc`
- Windsurf: `.windsurf/rules/`

This document is intentionally tool-agnostic to provide consistent guidance across all AI assistants.
