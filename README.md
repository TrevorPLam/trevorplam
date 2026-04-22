# Trevor Lam - Personal Portfolio

A modern, performant personal portfolio website built with Astro 6, featuring enterprise-grade testing infrastructure, comprehensive accessibility support, and advanced security monitoring.

## Overview

This is Trevor Lam's professional portfolio showcasing case studies, skills, and professional experience. The site demonstrates modern web development practices with a focus on performance, accessibility, and maintainability.

## Tech Stack

### Core Framework

- **Astro 6.1.8** - Static site generator with island architecture
- **TypeScript 5.9.3** - Type-safe development with strict mode
- **Tailwind CSS 4.2.3** - Utility-first styling with Vite integration
- **Vite 7.3.2** - Build tool and development server

### Content & SEO

- **MDX Integration** - Rich content authoring with React components
- **Sitemap Generation** - Automated SEO optimization
- **Google Fonts** - Inter (sans-serif) and JetBrains Mono (mono)

### Testing & Quality

- **Vitest 4.1.5** - Unit and component testing with coverage (80% threshold)
- **Playwright 1.51.0** - End-to-end testing across browsers (Chrome, Firefox, Safari)
- **Axe Core 4.11.2** - Accessibility compliance testing
- **ESLint 10.2.1** - Code quality and security linting with browser security plugins
- **Contract Testing** - Consumer-driven contract tests with Pact 16.3.0
- **AI Test Enhancement** - Automated test generation and validation
- **Stryker Mutation Testing** - Mutation testing for code quality validation
- **Lighthouse CI** - Performance monitoring and regression testing

## Project Structure

```text
trevorplam/
|-- public/                 # Static assets (favicons, images, robots.txt)
|-- src/
|   |-- assets/            # Optimized images and assets (headshot.svg)
|   |-- components/        # Reusable Astro components (11 total)
|   |   |-- Navigation.astro      # Responsive navigation with mobile menu
|   |   |-- Footer.astro          # Site footer with contact info
|   |   |-- MetricCard.astro      # Quantified achievement displays
|   |   |-- Timeline.astro        # Interactive career timeline
|   |   |-- TimelineNode.astro    # Individual timeline nodes
|   |   |-- SkillTag.astro        # Categorized expertise indicators
|   |   |-- ToggleSwitch.astro    # View switching functionality
|   |   |-- CaseStudyHeader.astro # Case study page headers
|   |   |-- InlineMetric.astro    # Inline metric displays
|   |   |-- OptimizedImage.astro  # Optimized image component
|   |   |-- ErrorBoundary.astro   # Error boundary handling
|   |-- content/           # MDX content collections
|   |   |-- cases/               # Case study content (3 cases)
|   |       |-- sonic.mdx        # Sonic Drive-in case study
|   |       |-- klw.mdx          # KLW Salon Group case study
|   |       |-- grandlux.mdx     # GrandLux CPA case study
|   |-- content.config.ts   # Content collection schema with Zod validation
|   |-- layouts/           # Page layouts
|   |   |-- BaseLayout.astro    # Base layout with SEO, analytics, error monitoring
|   |-- pages/             # Astro pages (8 total)
|   |   |-- index.astro          # Homepage
|   |   |-- about.astro          # About page
|   |   |-- approach.astro       # Methodology approach
|   |   |-- capabilities.astro   # Skills and capabilities
|   |   |-- impact.astro         # Impact and results
|   |   |-- connect.astro        # Contact and opportunities
|   |   |-- 404.astro             # Custom 404 page
|   |   |-- cases/               # Dynamic case study pages
|   |       |-- [slug].astro     # Dynamic case study routing
|   |-- sections/          # Page sections (9 total)
|   |-- styles/            # Global CSS and Tailwind
|   |-- utils/             # Utility functions (5 total)
|       |-- error-monitoring.ts  # Error monitoring setup
|       |-- rum-monitoring.ts    # Real User Monitoring
|       |-- [other utilities]     # Additional utility functions
|-- data/                  # Static data files
|   |-- metrics.json       # Performance metrics
|   |-- skills.json        # Skills and expertise data
|   |-- timeline.json      # Career timeline data
|-- tests/                 # Comprehensive test suite
|   |-- TESTING.md         # Comprehensive testing documentation
|   |-- a11y/              # Accessibility tests (2 files)
|   |-- ai/                # AI test enhancement utilities (1 file)
|   |-- components/        # Component tests (8 files)
|   |-- contract/          # Contract tests (4 files)
|   |-- e2e/               # End-to-end tests (6 files)
|   |-- unit/              # Unit tests (3 files)
|   |-- utils/             # Test helpers and factories (2 files)
|   |-- data/              # Test data fixtures (1 file)
|   |-- quality/           # Quality assurance (1 file)
|   |-- reports/           # Test reports (5 directories)
|-- scripts/               # Build and utility scripts
|   |-- security-scan.mjs  # Security scanning script
|   |-- serve-dist.mjs     # Distribution server script
|-- docs/                  # Project documentation (2 files)
|-- .github/workflows/     # CI/CD pipelines (5 workflows)
|   |-- ci.yml             # Main CI/CD pipeline
|   |-- test.yml           # Testing workflow
|   |-- security-scan.yml  # Security scanning workflow
|   |-- contract-testing.yml # Contract testing workflow
|   |-- test-quality.yml   # Test quality workflow
```

## Key Features

### Performance Optimization

- Static site generation for optimal loading
- Optimized image handling with Astro assets and Font preloading
- CSS optimization with Tailwind CSS 4.2.3 and Vite integration
- Bundle size monitoring with rollup-plugin-visualizer
- Lighthouse CI for performance regression detection
- Font optimization: Inter (400, 600, 700) and JetBrains Mono (400, 500)

### Accessibility

- WCAG 2.1 AA compliance
- Semantic HTML structure
- Keyboard navigation support
- Screen reader optimization
- Automated accessibility testing

### Testing Infrastructure

- **Multi-layered testing approach**: Unit, Component, Integration, E2E, Accessibility
- **Contract testing** for API integration with Pact framework
- **Mutation testing** with Stryker for code quality validation
- **Visual regression testing** with Playwright screenshot comparison
- **Accessibility testing** with Axe Core 4.11.2 across multiple browsers
- **Coverage reporting** with tiered thresholds (80% global, 90% utils, 70% components)
- **AI-powered test enhancement** for automated generation and validation
- **Lighthouse CI** for performance monitoring and regression detection
- **Cross-browser testing** on Chrome, Firefox, and Mobile Safari

### Development Experience

- TypeScript strict mode with Astro type checking
- ESLint with browser security and secure coding plugins
- Hot module replacement in development with Vite
- Comprehensive test documentation (18k+ testing guide)
- Automated quality gates with CI/CD enforcement
- Bundle analysis with rollup-plugin-visualizer
- Error monitoring and Real User Monitoring integration
- Security scanning with Trivy vulnerability scanner

## Getting Started

### Prerequisites

- Node.js >= 22.12.0
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/TrevorPLam/trevorplam.git
cd trevorplam

# Install dependencies
npm install

# Start development server
npm run dev
```

### Development

```bash
# Start development server at localhost:4321
npm run dev

# Run type checking
npm run check

# Run linting
npm run lint

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
npm run test:a11y:full
npm run test:a11y:homepage

# Run contract tests
npm run test:contract
npm run test:contract:publish
npm run test:contract:verify

# Run mutation testing
npm run test:mutation

# Security scanning
npm run security:scan

# Bundle analysis
npm run analyze:bundle

# Lighthouse testing
npm run lighthouse
npm run lighthouse:healthcheck

# Preview production build
npm run preview
npm run preview:test
```

### Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing

This project features enterprise-grade testing infrastructure. See [tests/TESTING.md](./tests/TESTING.md) for comprehensive testing documentation.

### Quick Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
npm run test:a11y:full
npm run test:a11y:homepage

# Run contract tests
npm run test:contract
npm run test:contract:publish
npm run test:contract:verify

# Run mutation testing
npm run test:mutation

# Run Lighthouse CI
npm run lighthouse
npm run lighthouse:healthcheck

# Security scanning
npm run security:scan

# Bundle analysis
npm run analyze:bundle
```

### Test Architecture

```text
E2E Tests (Playwright)     - Cross-browser functional + accessibility (Chrome, Firefox, Safari)
Component Tests (Vitest)   - Astro component rendering + logic with happy-dom
Unit Tests (Vitest)        - Utility functions + business logic
Visual Regression          - Screenshot comparison tests with 0.2 threshold
Contract Tests             - Consumer-driven contract testing with Pact
Mutation Tests             - Code quality validation with Stryker
Accessibility Tests        - Axe Core compliance testing
Performance Tests          - Lighthouse CI performance monitoring
```

## Website & Application Overview

This portfolio website showcases Trevor Lam's professional expertise as an Operations & Financial Controls Leader and Chief of Staff professional, featuring comprehensive case studies, methodology documentation, and career trajectory.

### Site Architecture

The website follows a modern multi-page application structure with the following pages:

#### **Homepage (`/`)**

**Purpose**: Professional introduction and value proposition overview

#### **About Page (`/about`)**

**Purpose**: Professional background and experience overview

#### **Approach Page (`/approach`)**

**Purpose**: Methodology and systematic approach to operational excellence

#### **Capabilities Page (`/capabilities`)**

**Purpose**: Skills, expertise, and service offerings

#### **Impact Page (`/impact`)**

**Purpose**: Quantified results and case study validation

#### **Connect Page (`/connect`)**

**Purpose**: Professional engagement and opportunity outreach

**Sections**:

- **Professional Identity**: Operations & Financial Controls Leader · Active Texas Notary · DFW/Remote
- **Target Opportunities**:
  - Operations roles
  - Chief of Staff positions
  - HR/Payroll expertise
  - Firm Administration
  - Trust & Estate Paralegal work
- **Contact Methods**: LinkedIn integration and direct email
- **Response Expectations**: Communication timeline and process

#### **Case Studies (`/cases/[slug]`)**

**Purpose**: Detailed documentation of operational transformation projects

**Available Cases**:

- **Sonic Drive-in** (`/cases/sonic`)
  - Industry: QSR (Quick Service Restaurant)
  - Focus: Payroll accuracy improvement (87% to 99.8%)
  - Skills: Multi-state payroll compliance, process redesign

- **KLW Salon Group** (`/cases/klw`)
  - Industry: Salon
  - Focus: Inventory management stabilization (95% accuracy, 73% stockout reduction)
  - Skills: Inventory systems, staffing optimization

- **GrandLux CPA** (`/cases/grandlux`)
  - Industry: CPA-Payroll
  - Focus: Client processing automation (65% time reduction)
  - Skills: Workflow automation, compliance optimization

**Case Study Features**:

- Dynamic routing with `[slug].astro`
- Industry categorization with Zod validation
- Skills tagging system
- Problem-solution-result structure
- MDX content with rich components

### Content Management System

#### **Content Collections**

- **Case Studies**: Managed through Astro content collections with glob loader
- **Schema Validation**: Zod 4.3.6 schemas for content type safety
- **Dynamic Routing**: Automatic page generation from MDX files
- **Component Integration**: Custom components for content rendering

#### **Content Structure**

```typescript
// Case Study Schema (<https://github.com/TrevorPLam/trevorplam/blob/main/src/content.config.ts>)
{
  title: string,
  industry: 'QSR' | 'Salon' | 'CPA-Payroll',
  problem: string,
  result: string,
  skills: string[],
  metric?: string
}
```

#### **Data Files**

- **metrics.json**: Performance metrics and achievements
- **skills.json**: Skills and expertise categorization
- **timeline.json**: Career progression data

### User Experience Features

#### **Navigation**

- **Responsive Design**: Mobile-first approach with desktop optimization
- **Semantic Navigation**: ARIA-compliant menu structure
- **Keyboard Navigation**: Full keyboard accessibility support
- **Skip Links**: Direct navigation to main content

#### **Interactive Elements**

- **Toggle Switches**: View switching functionality
- **Timeline Components**: Interactive career progression
- **Metric Cards**: Quantified achievement displays
- **Skill Tags**: Categorized expertise indicators

#### **Accessibility Features**

- **WCAG 2.1 AA Compliance**: Full accessibility standards
- **Screen Reader Support**: Comprehensive semantic markup
- **Focus Management**: Logical tab order and focus indicators
- **Color Contrast**: Optimized for readability

### Technical Implementation

#### **Performance Optimization**

- **Static Site Generation**: Optimal loading performance
- **Image Optimization**: Astro asset management
- **Font Preloading**: Inter and JetBrains Mono fonts
- **Bundle Optimization**: Minimal JavaScript footprint

#### **SEO Features**

- **Structured Data**: JSON-LD with Person and WebSite schemas
- **Meta Tags**: Comprehensive page metadata with Open Graph and Twitter Cards
- **Sitemap Generation**: Automated XML sitemap with @astrojs/sitemap
- **Semantic HTML**: Search engine optimization with proper heading hierarchy
- **Plausible Analytics**: Privacy-first analytics integration

#### **Content Architecture**

- **Component-Based Design**: Reusable Astro components
- **MDX Integration**: Rich content authoring capabilities
- **Type Safety**: TypeScript throughout the application
- **Modular Structure**: Maintainable code organization

## Configuration

### Environment Variables
Create a `.env` file for local development:

```env
# Site configuration
SITE_URL=https://trevor-lam.com
```

### Build Configuration
- **Output**: Static site generation (`output: 'static'`)
- **Site URL**: https://trevor-lam.com
- **Node Version**: >= 22.12.0 (engines enforced)
- **Security**: CSP headers enabled with Astro security configuration
- **Bundle Analysis**: Conditional bundle analyzer with ANALYZE environment variable

## Deployment

### Production Deployment
The site is configured for static deployment and can be hosted on:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Any static hosting service

### CI/CD Pipeline
Automated workflows include:
- **Testing**: Unit, E2E, accessibility, contract tests with artifact upload
- **Quality Gates**: Coverage thresholds, linting, type checking
- **Performance**: Lighthouse CI with performance monitoring
- **Security**: Trivy vulnerability scanning with SARIF reporting
- **Deployment**: Automated Vercel deployment on merge to main

#### **Security Features**

- **CSP Headers**: Content Security Policy with strict settings
- **Security Headers**: HSTS, X-Frame-Options, X-Content-Type-Options
- **Vulnerability Scanning**: Trivy integration with GitHub Security tab
- **Dependency Security**: npm overrides for known vulnerabilities
- **Security Linting**: ESLint plugins for browser security and secure coding

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
- Fonts from [Google Fonts](https://fonts.google.com)
