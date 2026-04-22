# Trevor Lam - Personal Portfolio

A modern, performant personal portfolio website built with Astro 6, featuring enterprise-grade testing infrastructure, comprehensive accessibility support, and advanced security monitoring.

## Overview

This is Trevor Lam's professional portfolio showcasing case studies, skills, and professional experience for operations leadership, Chief of Staff, and HR/payroll roles. The site demonstrates modern web development practices with a focus on performance, accessibility, and maintainability.

## Tech Stack

### Core Framework

- **Astro 6.1.8** - Static site generator with Content Layer API and ClientRouter
- **TypeScript 5.9.3** - Type-safe development with strict mode
- **Tailwind CSS 4.2.3** - Utility-first styling with `@tailwindcss/vite` plugin
- **Vite 7.3.2** - Build tool and development server

### Content & SEO

- **MDX Integration** - Rich content authoring via `@astrojs/mdx`
- **Sitemap Generation** - Automated SEO optimization via `@astrojs/sitemap`
- **Fontsource Fonts** - Inter (400, 600, 700) and JetBrains Mono (400, 500) via `astro:fonts`
- **Content Collections** - Zod v4.3.6 schemas with `getCollection()` API
- **Prefetch** - Link prefetching with hover strategy for instant navigation

### Testing & Quality

- **Vitest 4.1.5** - Unit and component testing with tiered coverage thresholds
- **Playwright 1.51.0** - E2E testing across Chrome, Firefox, and Mobile Safari
- **Axe Core 4.11.2** - Accessibility compliance testing via `@axe-core/playwright`
- **ESLint 10.2.1** - Flat config with security plugins (no eval, prototype pollution prevention)
- **Contract Testing** - Consumer-driven contract tests with Pact 16.3.0
- **Stryker 9.6.1** - Mutation testing with 80% threshold
- **Lighthouse CI** - Performance regression detection (90+ score requirements)
- **Fuzzing** - Security vulnerability detection with Jazzer 4.0.0
- **Property-based Testing** - Robust validation with fast-check 4.7.0

## Project Structure

```text
trevorplam/
|-- public/                 # Static assets (favicons, images, robots.txt, PDFs)
|-- src/
|   |-- assets/            # Optimized images and assets (headshot.svg)
|   |-- components/        # Reusable Astro components (24 total)
|   |   |-- Breadcrumbs.astro         # Navigation breadcrumbs
|   |   |-- CaseStudyHeader.astro    # Case study page headers
|   |   |-- Chart.astro              # Interactive Chart.js components
|   |   |-- DashboardWidgets.astro   # Dashboard widget components
|   |   |-- ErrorBoundary.astro      # Error boundary handling
|   |   |-- Footer.astro             # Site footer with contact info
|   |   |-- InlineMetric.astro       # Inline metric displays
|   |   |-- KPICard.astro            # KPI display cards
|   |   |-- MetricCard.astro         # Quantified achievement displays
|   |   |-- MetricsGrid.astro        # Metrics dashboard grid
|   |   |-- OptimizedImage.astro     # Optimized image component
|   |   |-- QuickActions.astro       # Quick action buttons
|   |   |-- RecentActivity.astro     # Activity feed component
|   |   |-- SearchBar.astro          # Site search functionality
|   |   |-- SidebarNavigation.astro  # Main navigation sidebar
|   |   |-- SkillTag.astro           # Categorized expertise indicators
|   |   |-- Timeline.astro           # Interactive career timeline
|   |   |-- TimelineNode.astro       # Individual timeline nodes
|   |   |-- Timestamp.astro          # Time display component
|   |   |-- ToggleSwitch.astro       # View switching functionality
|   |   |-- TrustCues.astro          # Trust and verification badges
|   |   |-- ui/                      # UI component library (3 items)
|   |       |-- ComparisonTable.astro
|   |       |-- MetricCard.astro
|   |       |-- TrendIndicator.astro
|   |-- config/
|   |   |-- edge-config.ts           # Edge runtime configuration
|   |   |-- navigation.ts            # Centralized navigation structure
|   |-- content/           # MDX/JSON content collections with Zod validation
|   |   |-- capabilities/         # 5 capability pages (operations, hr, financial, customer, systems)
|   |   |-- cases/                # 3 case studies (sonic, klw, grandlux)
|   |   |-- learning-logs/        # 6 learning log entries
|   |   |-- projects/             # 3 project showcases
|   |   |-- resources/            # 8 resources (playbooks, templates, guides)
|   |   |-- skills/               # 4 skills category files
|   |-- content.config.ts  # Content collection schemas with Zod v4
|   |-- layouts/
|   |   |-- BaseLayout.astro    # Base layout with SEO, CSP, analytics
|   |-- pages/             # Astro pages with dynamic routing
|   |   |-- index.astro          # Homepage dashboard
|   |   |-- archive.astro        # Comprehensive content archive
|   |   |-- capabilities.astro   # Capabilities overview
|   |   |-- connect.astro        # Contact and opportunities
|   |   |-- search.astro         # Site-wide search with Cmd+K
|   |   |-- 404.astro            # Custom 404 page
|   |   |-- api/
|   |   |   |-- generate-pdf.ts  # PDF generation endpoint
|   |   |-- capabilities/
|   |   |   |-- [slug].astro    # Dynamic capability pages
|   |   |-- cases/
|   |   |   |-- [slug].astro    # Dynamic case study pages
|   |   |-- lab/
|   |   |   |-- index.astro      # Lab overview
|   |   |   |-- learning-log/
|   |   |   |   |-- index.astro
|   |   |   |   |-- [slug].astro  # Individual learning logs
|   |   |   |-- projects/
|   |   |   |   |-- index.astro
|   |   |   |   |-- [slug].astro  # Individual project pages
|   |   |   |-- tech-stack.astro   # Technology stack documentation
|   |   |-- resources/
|   |   |   |-- index.astro        # Resources overview
|   |   |   |-- playbooks/
|   |   |   |   |-- [slug].astro  # Individual playbooks
|   |   |   |-- templates/
|   |   |   |   |-- [slug].astro  # Individual templates
|   |   |   |-- skills-matrix.astro # Interactive skills matrix
|   |-- utils/             # Utility functions
|       |-- chart-utils.ts        # Chart.js utility functions
|       |-- date.ts               # Date formatting utilities
|       |-- error-monitoring.ts   # Error monitoring utilities
|       |-- formatters.ts         # Data formatting utilities
|       |-- metrics.ts            # Metrics calculation utilities
|       |-- rum-monitoring.ts     # Real User Monitoring
|       |-- validators.ts         # Data validation utilities
|-- data/                  # Static data files (JSON)
|   |-- metrics.json       # 9 quantified achievement metrics
|   |-- skills.json        # 5 skill categories (operations, hr_payroll, financial, technical, credentials)
|   |-- timeline.json      # 11 career progression entries
|-- tests/                 # Enterprise-grade test suite
|   |-- TESTING.md         # Comprehensive testing documentation
|   |-- a11y/              # Accessibility tests (2 files)
|   |-- ai/                # AI test utilities (16 files)
|   |-- browser/           # Browser-based tests (5 files)
|   |-- components/        # Component tests (8 files)
|   |-- contract/          # Contract tests (6 files)
|   |-- e2e/               # End-to-end tests (7 files)
|   |-- fuzzing/           # Security fuzzing tests (4 files)
|   |-- integration/       # Integration tests (2 files)
|   |-- mocks/             # Test mocks and factories (199 items)
|   |-- monitoring/        # Test monitoring utilities (7 files)
|   |-- performance/       # Performance tests (4 files)
|   |-- property/          # Property-based tests (3 files)
|   |-- unit/              # Unit tests (3 files)
|   |-- utils/             # Test helpers and factories (5 files)
|   |-- virtualization/    # Test virtualization (2 files)
|   |-- visual/            # Visual regression tests (1 file)
|   |-- reports/           # Test reports (5 items)
|-- scripts/               # Build and utility scripts (12 files)
|   |-- collect-test-metrics.mjs     # Test metrics collection
|   |-- distributed-runner.mjs       # Distributed test runner
|   |-- generate-case-pdf.mjs        # PDF generation for case studies
|   |-- load-balancer.mjs            # Test load balancing
|   |-- performance-monitor-simple.mjs # Performance monitoring
|   |-- performance-monitor.mjs      # Advanced performance monitoring
|   |-- result-aggregator.mjs        # Test result aggregation
|   |-- run-mutation-tests.mjs       # Stryker mutation test runner
|   |-- security-scan.mjs            # Security scanning script
|   |-- serve-dist.mjs               # Distribution server
|   |-- test-orchestrator.mjs        # Test orchestration
|   |-- timing-collector.mjs         # Test timing collection
|-- monitoring/            # Performance monitoring configuration
|-- docker/                # Docker configuration for testing
|-- .github/workflows/     # CI/CD pipelines
|-- vercel.json            # Security headers configuration

## Key Features

### Performance Optimization

- **Static site generation** with `output: 'static'` for optimal loading
- **Image optimization** via Sharp service with AVIF format (75% quality)
- **Font optimization** via Fontsource (Inter, JetBrains Mono) with `font-display: swap`
- **Bundle optimization** with manual chunking (vendor, UI, analytics)
- **Prefetching** with hover strategy for instant navigation
- **Lighthouse CI** with 90+ score requirements for Core Web Vitals
- **Build optimization**: ES2022 target, esbuild minification, sourcemaps in dev only

### Accessibility (WCAG 2.2 AA)

- **Semantic HTML**: `<header>`, `<nav>`, `<main>`, `<footer>` structure
- **Keyboard navigation**: Full support with visible focus indicators
- **Screen reader support**: ARIA labels, proper heading hierarchy
- **Touch targets**: Minimum 44x44px for interactive elements
- **Color contrast**: 4.5:1 minimum ratio
- **Skip links**: Direct navigation to main content
- **Axe Core testing**: Zero violations across all pages

### Testing Infrastructure

| Layer | Tool | Files | Description |
|-------|------|-------|-------------|
| Unit | Vitest | 3 | Utility function testing |
| Component | Vitest + happy-dom | 8 | Astro component rendering |
| Integration | Vitest | 2 | Component interaction tests |
| E2E | Playwright | 7 | Cross-browser functional tests |
| Accessibility | Playwright + Axe | 2 | WCAG 2.2 AA compliance |
| Contract | Pact | 6 | API contract validation |
| Mutation | Stryker | - | 80% threshold for code quality |
| Fuzzing | Jazzer | 4 | Security vulnerability detection |
| Property | fast-check | 3 | Generative testing |
| Browser | Vitest Browser Mode | 5 | Real browser component tests |
| Visual | Playwright | 1 | Screenshot comparison |
| Mocks | Factory pattern | 199 | Comprehensive test data |
| AI Utils | Custom | 16 | Automated test generation |

### Development Experience

- **TypeScript strict mode** with no implicit any
- **ESLint flat config** with security plugins (no eval, prototype pollution prevention)
- **Vite HMR** for fast development
- **Bundle analysis** via `ANALYZE=true npm run build`
- **Error monitoring** with comprehensive utilities
- **RUM (Real User Monitoring)** integration
- **Security scanning** via `npm run security:scan`

## Getting Started

### Prerequisites

- **Node.js >= 22.12.0** (enforced via `engines` in `package.json`)
- **npm** package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/TrevorPLam/trevorplam.git
cd trevorplam

# Install dependencies
npm install

# Start development server at localhost:4321
npm run dev
```

### Essential Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `/dist` |
| `npm run preview` | Preview production build |
| `npm run lint` | ESLint on all files |
| `npm run check` | `astro check` (TypeScript + diagnostics) |
| `npm test` | Run all Vitest tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:a11y` | Accessibility tests (Axe Core) |
| `npm run test:unit` | Unit tests only |
| `npm run test:browser` | Browser-based tests |
| `npm run test:contract` | Pact contract tests |
| `npm run test:mutation` | Stryker mutation testing |
| `npm run test:property` | Property-based tests |
| `npm run test:fuzz` | Fuzzing tests (Jazzer) |
| `npm run test:full` | Full test suite (unit + e2e + a11y) |
| `npm run lighthouse` | Lighthouse CI |
| `npm run security:scan` | Security vulnerability scan |
| `npm run analyze:bundle` | Bundle size analysis |


## Testing

This project features enterprise-grade testing infrastructure. See [tests/TESTING.md](./tests/TESTING.md) for comprehensive testing documentation (18K+ words).

### Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  E2E (Playwright)        - Cross-browser functional tests   │
│  Component (Vitest)    - Astro component rendering       │
│  Unit (Vitest)         - Utility functions               │
│  Integration (Vitest)  - Component interactions         │
├─────────────────────────────────────────────────────────────┤
│  Accessibility         - Axe Core WCAG 2.2 AA             │
│  Contract              - Pact API validation              │
│  Mutation              - Stryker 80% threshold            │
│  Fuzzing               - Jazzer security tests            │
│  Property              - fast-check generative tests    │
└─────────────────────────────────────────────────────────────┘
```

### Coverage Thresholds

- **Global**: 80% (branches, functions, lines, statements)
- **Utils**: 90% (stricter threshold for utility functions)

### CI/CD Test Matrix

| Shard | Test Type | Resource Level |
|-------|-----------|----------------|
| 1 | Unit | Standard |
| 2 | Components | Standard |
| 3 | Integration | Enhanced |
| 4 | Accessibility | Enhanced |
| 5 | E2E | High |
| 6 | Performance | High |
| 7 | Security | Standard |
| 8 | Contract | Standard |

## Site Architecture

Trevor Lam's portfolio showcases professional expertise as an Operations Leader and Chief of Staff, featuring case studies, methodology documentation, and career trajectory.

### Page Structure

| Route | Purpose | Key Features |
|-------|---------|--------------|
| `/` | Homepage dashboard | Metrics grid, recent activity, quick actions |
| `/capabilities` | Skills overview | 5 capability categories with KPIs |
| `/capabilities/[slug]` | Individual capability | KPI cards, metrics, related cases |
| `/cases` | Case studies index | 3 operational transformation stories |
| `/cases/[slug]` | Individual case study | PDF download, trust cues, related capabilities |
| `/connect` | Contact & opportunities | Form, LinkedIn, resume download |
| `/lab` | Learning & experiments | Projects, learning logs, tech stack |
| `/lab/learning-log` | Knowledge sharing | 6 entries with tags |
| `/lab/projects` | Work showcase | 3 active/completed projects |
| `/lab/tech-stack` | Technology documentation | Current tools and rationale |
| `/resources` | Practical resources | Playbooks, templates, skills matrix |
| `/resources/playbooks` | Operational guides | Step-by-step processes |
| `/resources/templates` | Downloadable assets | Project templates |
| `/resources/skills-matrix` | Skills visualization | Interactive proficiency table |
| `/search` | Site-wide search | Cmd+K shortcut, content filtering |
| `/archive` | Complete index | Changelog, chronological content |
| `/404` | Error page | Helpful navigation |

### Content Collections

| Collection | Count | Schema Key |
|------------|-------|------------|
| `caseStudies` | 3 | `title`, `industry`, `problem`, `result`, `skills[]`, `metrics[]` |
| `capabilities` | 5 | `title`, `philosophy`, `kpis[]`, `industries[]` |
| `learningLogs` | 6 | `title`, `date`, `tags[]`, `excerpt` |
| `projects` | 3 | `title`, `status`, `technologies[]`, `tags[]` |
| `resources` | 8 | `title`, `type`, `audience`, `gated` |
| `skills` | 4 | `category`, `skills[]` with `level` and `yearsExperience` |

### Case Studies

| Case | Industry | Key Metrics |
|------|----------|-------------|
| **Sonic Drive-in** | QSR | $1.4M → $1.7M revenue, food cost 2.7% → 0.75%, turnover 175%+ → <80% |
| **KLW Salon Group** | Salon | 280-315+ payroll accounts, 3 entities, 60 days to promotion |
| **GrandLux CPA** | CPA-Payroll | Zero cash discrepancies, proactive reputation management |

### Data Files

- **`/data/metrics.json`**: 9 quantified achievement metrics
- **`/data/skills.json`**: 5 skill categories with proficiency levels
- **`/data/timeline.json`**: 11 career progression entries

### Navigation Structure

```typescript
// src/config/navigation.ts
[
  { name: 'Dashboard', href: '/' },
  { name: 'Capabilities', href: '/capabilities', children: [...5 items] },
  { name: 'Case Studies', href: '/cases', children: [...3 items] },
  { name: 'Lab', href: '/lab', children: [...3 items] },
  { name: 'Resources', href: '/resources', children: [...3 items] },
  { name: 'Search', href: '/search' },
  { name: 'Archive', href: '/archive' }
]
```

## Configuration

### Environment Variables

Create a `.env` file for local development:

```env
# Site configuration
SITE_URL=https://trevor-lam.com
EDGE_RUNTIME=false
ANALYZE=true  # Enable bundle analyzer
```

### Build Configuration (`astro.config.mjs`)

| Setting | Value | Notes |
|---------|-------|-------|
| `output` | `static` | Static site generation |
| `site` | `https://trevor-lam.com` | Production URL |
| `target` | `es2022` | Modern browser support |
| `minify` | `esbuild` | Fast minification |
| `image.service` | `sharp` | Sharp processing with AVIF |
| `image.defaultQuality` | `75` | Optimized for performance |
| `prefetch` | `hover` | Link prefetching strategy |
| `security.csp.enabled` | `true` | Hash-based CSP (no unsafe-inline) |

### Redirects

| From | To | Reason |
|------|----|--------|
| `/about` | `/capabilities` | Consolidated content |
| `/approach` | `/cases` | Renamed section |
| `/impact` | `/lab` | Reorganized navigation |

### Vercel Security Headers (`vercel.json`)

- `Strict-Transport-Security`: HSTS with preload
- `X-Frame-Options`: DENY
- `X-Content-Type-Options`: nosniff
- `Referrer-Policy`: strict-origin-when-cross-origin
- `Cross-Origin-Opener-Policy`: same-origin
- `Cross-Origin-Resource-Policy`: same-site
- `Permissions-Policy`: camera=(), microphone=(), geolocation=()

## Deployment

### Production Deployment

The site is configured for static deployment and optimized for Vercel:

```bash
# Deploy to Vercel
vercel --prod
```

### CI/CD Pipeline (`.github/workflows/ci.yml`)

| Job | Purpose |
|-----|---------|
| `lint` | ESLint + Astro type checking |
| `test` | 8-shard test matrix (unit, component, integration, accessibility, e2e, performance, security, contract) |
| `lighthouse` | Performance auditing |
| `fuzzing` | Security fuzzing with resource limits |
| `mutation-testing` | Stryker mutation testing |
| `security-scan` | Trivy vulnerability scanning |
| `deploy` | Automated Vercel deployment on `main` |

### Security Features

- **CSP**: Hash-based approach via `astro.config.mjs` (auto-generates script hashes)
- **Security Headers**: Via `vercel.json` (HSTS, COOP, CORP, Permissions-Policy)
- **No COEP**: Intentionally omitted to avoid breaking third-party analytics
- **Dependency Security**: npm overrides for `yaml@^2.8.3` and `tmp@^0.2.3`
- **Linting**: ESLint plugins for browser security and secure coding

## Contributing

This is a personal portfolio project. For issues or questions:
- Open an issue for bug reports
- Contact Trevor directly for collaboration opportunities

## License

This project is private and proprietary.

## Acknowledgments

- Built with [Astro](https://astro.build)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Tested with [Vitest](https://vitest.dev) and [Playwright](https://playwright.dev)
- Fonts from [Fontsource](https://fontsource.org) via `astro:fonts`
