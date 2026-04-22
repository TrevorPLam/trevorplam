# AGENTS.md

This file gives AI coding agents project‑specific guidance for the Trevor Lam portfolio.

## Project Overview

**Personal portfolio site** – built with Astro 6, Tailwind CSS v4, TypeScript.  
**Purpose**: professional site for operations / Chief of Staff / HR‑payroll roles.

**Key stack**:
- Astro 6.1.8 (static site, Content Layer API, ClientRouter)
- Tailwind CSS 4.2.3 (CSS‑first config, `@theme`, no `tailwind.config.mjs`)
- TypeScript 5.9.3 (strict)
- MDX (content collections with Zod v4 schemas)
- Testing: Vitest 4 (unit/component), Playwright 1.51 (E2E + a11y), Axe‑Core
- Linting: ESLint 10 (flat config, security plugins)
- Deployment: Vercel (auto‑deploy from `main`, security headers)

## Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `/dist` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint on all files |
| `npm run check` | `astro check` (TypeScript + diagnostics) |
| `npm test` | Vitest unit/component tests |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:a11y` | Playwright accessibility tests |
| `npm run test:contract` | Pact contract tests |
| `npm run lighthouse` | Lighthouse CI (build required) |

**Node version**: >=22.12.0 (see `engines` in `package.json`)

## Critical Astro 6 Constraints (Non‑negotiable)

| Old / removed | New / required |
|---------------|----------------|
| `@astrojs/tailwind` | `@tailwindcss/vite` plugin (no integration) |
| `<ViewTransitions />` | `<ClientRouter />` from `astro:transitions` |
| `entry.render()` | `import { render }` from `astro:content` → `await render(entry, { components })` |
| `Astro.glob()` | `getCollection()` from Content Layer API |
| `src/content/config.ts` (no loader) | `src/content.config.ts` with `defineCollection` + `loader: glob()` |
| `experimental.csp` | `security: { csp: { enabled: true } }` (stable) |

## Code & Style Rules

- **ESLint** flat config (`eslint.config.js`) – extends Astro recommended + security rules (no `eval`, no prototype pollution)
- **TypeScript** strict mode, no implicit any
- **Indentation**: 2 spaces (no enforced formatter)
- **Tailwind v4**: all styling via utility classes. **Do NOT use `<style>` tags** in components used inside MDX (Astro 6 bug drops them). Affects `InlineMetric`, `SkillTag`, and any component imported into `.mdx`.
- **Dark mode**: `class="dark"` on `<html>`; `@custom-variant dark (&:where(.dark, .dark *));` in CSS

## Content & Data

- **Case studies**: MDX in `/src/content/cases/` – use `getCollection('caseStudies')` + `await render(entry, { components })`
- **Capabilities**: MDX in `/src/content/capabilities/` – 5 capability categories with KPIs
- **Learning logs**: MDX in `/src/content/learning-logs/` – 6 entries with tagging
- **Projects**: MDX in `/src/content/projects/` – 3 project showcases
- **Resources**: MDX in `/src/content/resources/` – 8 playbooks, templates, guides
- **Skills**: JSON in `/src/content/skills/` – 4 category files with proficiency levels
- **JSON data** (metrics, skills, timeline) – import directly from `/data/` (e.g. `import metrics from '../../data/metrics.json'`)
- **Images**: place in `/src/assets/` (not `/public/`). Use `OptimizedImage` component. LCP image (headshot) needs `loading="eager"` and `fetchpriority="high"`.

### Content Collection Schemas

Content collections are configured in `src/content.config.ts` with Zod v4 schemas for type safety:

- **caseStudies**: title, description, date, tags, outcome, metrics
- **capabilities**: name, description, kpi[], examples[]
- **learningLogs**: title, date, tags[], content
- **projects**: name, description, url, tech[], role, outcome
- **resources**: title, type, description, url, difficulty

## Testing Requirements

- **No `waitForTimeout()`** – use web‑first assertions (`expect().toBeVisible()`, `expect().toHaveURL()`)
- **Accessibility**: zero axe‑core violations (Playwright + `@axe-core/playwright`)
- **Contract tests**: Pact for any API endpoints
- **Mutation testing**: Stryker (target 80% score)
- **Fuzzing**: Jazzer for security vulnerability detection
- **Property-based**: fast-check for generative testing
- **Browser tests**: Vitest browser mode for real browser component testing

## Security & Headers

- **CSP**: enabled via `astro.config.mjs` → `security.csp.enabled: true` (auto‑hashes scripts, no `'unsafe-inline'`)
- **Security headers** in `vercel.json` (HSTS, X‑Frame‑Options, COOP, CORP, Permissions‑Policy)
- **No COEP** (would break third‑party scripts like analytics)
- Environment variables: `import.meta.env` – never commit secrets

## Accessibility (WCAG 2.2 AA)

- Skip to content link as first focusable element
- Touch targets ≥44x44px for all interactive elements
- Focus not obscured → `scroll-padding-top: 80px` on `:root`
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- ARIA labels for icon‑only buttons
- Color contrast ≥4.5:1 (test with axe‑core)

## Performance Budgets

- LCP <2.5s, INP <200ms, CLS <0.1
- Lighthouse CI enforces scores ≥90 for Performance, Accessibility, Best Practices, SEO
- Fonts: Astro Fonts API (self‑hosted, `font-display: swap`)

## Content & Tone Guidelines

- **Tone**: professional, confident, evidence‑based. Avoid negative framing ("mess", "broken", "chaos") → use "initial state", "operational context", "friction points"
- **Metrics**: all numbers from `/data/metrics.json` – never hardcoded
- **Case studies**: structure → "Initial State" → "What I Delivered" → "Outcome"
- **No placeholder text** – final copy only

## Common Pitfalls (Strict Rules)

| Pitfall | Prevention |
|---------|-------------|
| Using `<style>` in MDX‑imported components | Tailwind classes only. Add comment: "Astro 6 bug: <style> dropped in MDX" |
| Forgetting to lock Vite to v7 | `package.json` must have `vite@^7.0.0` (v8 conflicts with `@tailwindcss/vite`) |
| Using `entry.render()` | Use `await render(entry, { components })` |
| Hardcoded waits in tests | `expect().toBeVisible()`, `expect().toHaveURL()` |
| Placing images in `/public/` | Place in `/src/assets/` for optimization |
| Missing `mainEntityOfPage` in JSON‑LD | All schemas must link `@id` to `#person` and `#website` |
| Forgetting `color-scheme: dark` on `:root` | Required for proper dark mode styling |

## Powerhouse Scripts

The repository includes 40+ automation scripts in `scripts/` for self-managing operations:

- **Foundation**: `bootstrap`, `quality-gate`, `test-pyramid`, `doctor`, `sync`
- **AI-Native**: `ai:validate`, `ai:context`, `ai:compress`, `ai:brief` (in `scripts/ai/`)
- **Monorepo**: `mookme:init`, `turbo:pipeline`, `swarm` (in `scripts/monorepo/`)
- **DevOps**: `bash-nuke`, `timewarp`, `simulate`, `gitops` (in `scripts/ops/`)
- **Health**: `env:audit`, `pulse`, `cycle-hunter` (in `scripts/health/`)
- **Reporting**: `standup`, `pr:describe`, `oracle`
- **Security**: `backup`, self-healing workflows (`.github/workflows/`)

See `docs/powerhouse-scripts.md` for complete documentation.

## AI Control Instructions

For comprehensive global AI directives applicable to all AI tools (Cursor, Copilot, Claude), see `ai-control/ai-instructions.md`. This document provides tool-agnostic guidance for code style, testing standards, accessibility requirements, and project conventions.

For tool-specific instructions:
- Cursor: `.cursor/rules/astro.mdc`
- Windsurf: `.windsurf/rules/`
