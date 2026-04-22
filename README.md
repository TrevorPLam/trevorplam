# Trevor Lam - Personal Portfolio

A modern, performant personal portfolio website built with Astro 6, featuring enterprise-grade testing infrastructure and comprehensive accessibility support.

## Overview

This is Trevor Lam's professional portfolio showcasing case studies, skills, and professional experience. The site demonstrates modern web development practices with a focus on performance, accessibility, and maintainability.

## Tech Stack

### Core Framework
- **Astro 6.1.8** - Static site generator with island architecture
- **TypeScript 5.9.3** - Type-safe development
- **Tailwind CSS 4.2.3** - Utility-first styling with Vite integration

### Content & SEO
- **MDX Integration** - Rich content authoring with React components
- **Sitemap Generation** - Automated SEO optimization
- **Google Fonts** - Inter (sans-serif) and JetBrains Mono (mono)

### Testing & Quality
- **Vitest 4.1.5** - Unit and component testing with coverage
- **Playwright 1.51.0** - End-to-end testing across browsers
- **Axe Core** - Accessibility compliance testing
- **ESLint** - Code quality and security linting
- **Contract Testing** - Consumer-driven contract tests with Pact
- **AI Test Enhancement** - Automated test generation and validation

## Project Structure

```
trevorplam/
|-- public/                 # Static assets (favicons, images)
|-- src/
|   |-- assets/            # Optimized images and assets
|   |-- components/        # Reusable Astro components
|   |   |-- Navigation.astro
|   |   |-- Footer.astro
|   |   |-- MetricCard.astro
|   |   |-- Timeline.astro
|   |   |-- SkillTag.astro
|   |   |-- ToggleSwitch.astro
|   |   |-- CaseStudyHeader.astro
|   |   |-- InlineMetric.astro
|   |   |-- OptimizedImage.astro
|   |-- content/           # MDX content collections
|   |-- layouts/           # Page layouts
|   |   |-- BaseLayout.astro
|   |-- styles/            # Global CSS and Tailwind
|-- tests/                 # Comprehensive test suite
|   |-- a11y/             # Accessibility tests
|   |-- ai/               # AI test enhancement utilities
|   |-- components/       # Component tests
|   |-- contract/         # Contract tests
|   |-- e2e/              # End-to-end tests
|   |-- integration/      # Integration tests
|   |-- unit/             # Unit tests
|   |-- utils/            # Test helpers and factories
|-- docs/                 # Project documentation
|-- .github/workflows/    # CI/CD pipelines
```

## Key Features

### Performance
- Static site generation for optimal loading
- Optimized image handling with Astro assets
- Font preloading and CSS optimization
- Bundle size monitoring and optimization

### Accessibility
- WCAG 2.1 AA compliance
- Semantic HTML structure
- Keyboard navigation support
- Screen reader optimization
- Automated accessibility testing

### Testing Infrastructure
- **Multi-layered testing approach**: Unit, Component, Integration, E2E
- **Contract testing** for API integration
- **Property-based testing** for invariant validation
- **Visual regression testing** with AI comparison
- **Accessibility testing** with Axe Core
- **Coverage reporting** with 80% threshold enforcement
- **AI-powered test enhancement** for automated generation

### Development Experience
- TypeScript strict mode
- ESLint with security plugins
- Hot module replacement in development
- Comprehensive test documentation
- Automated quality gates

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
npm run test:e11y

# Run accessibility tests
npm run test:a11y

# Run contract tests
npm run test:contract
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

# Run contract tests
npm run test:contract
```

### Test Architecture

```
E2E Tests (Playwright)     - Cross-browser functional + accessibility
Component Tests (Vitest)   - Astro component rendering + logic  
Unit Tests (Vitest)        - Utility functions + business logic
Visual Regression          - Screenshot comparison tests
Contract Tests             - Consumer-driven contract testing
```

## Website & Application Overview

This portfolio website showcases Trevor Lam's professional expertise as an Operations Integrator and Chief of Staff professional, featuring comprehensive case studies, methodology documentation, and career trajectory.

### Site Architecture

The website follows a modern single-page application structure with multiple distinct sections:

#### **Homepage (`/`)**
**Purpose**: Professional introduction and value proposition overview

**Content Sections**:
- **Hero Section**: Professional identity as "Operations Integrator · Forensic Stabilizer"
- **Stabilizer Pattern**: Introduction to the forensic stabilization methodology
- **Proof Points**: Quantified achievements and key metrics
- **Industry Fluidity**: Cross-industry experience demonstration
- **The Method**: Overview of the systematic approach to operational excellence
- **Trajectory Teaser**: Preview of career journey and future readiness
- **Connect CTA**: Call-to-action for professional engagement

#### **Evidence Page (`/evidence`)**
**Purpose**: Quantified results and case study validation with dual-view interface

**Features**:
- **Toggle Interface**: Switch between narrative and dashboard views
- **Narrative View**: Detailed case study presentations
- **Forensic Dashboard**: Data-driven performance metrics and analytics
- **Interactive Elements**: Dynamic content switching with smooth transitions

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
- PDF download capability
- Navigation between cases
- Industry categorization
- Skills tagging system
- Problem-solution-result structure

#### **Methodology Page (`/methodology`)**
**Purpose**: Deep dive into the Forensic Stabilizer Framework

**Content Structure**:
- **Forensic Stabilizer Framework**:
  - Phase 1: Diagnostic Analysis
  - Phase 2: Impact Triage  
  - Phase 3: Architectural Rebuild

- **Information Architecture Meta-Skill**:
  - Single Source of Truth principle
  - Controlled Access systems
  - Auditability requirements
  - Scalability considerations

- **Validation Section**: Links to case studies with quantified results

**Technical Features**:
- JSON-LD structured data for SEO
- Semantic HTML structure
- Comprehensive methodology documentation

#### **Career Trajectory (`/trajectory`)**
**Purpose**: Professional journey visualization and future readiness

**Content**:
- **Interactive Timeline**: Career progression from 2008 to 2027
- **Industry Experience**: QSR, Salon, CPA-Payroll sectors
- **Strategic Fortification Phase**: Explanation of 2026-2027 credential development period
- **Future Readiness**: Preparation for next-tier operational leadership

#### **Connect Page (`/connect`)**
**Purpose**: Professional engagement and opportunity outreach

**Sections**:
- **Professional Identity**: Operations Integrator · Active Texas Notary · DFW/Remote
- **Target Opportunities**:
  - Operations roles
  - Chief of Staff positions
  - HR/Payroll expertise
  - Firm Administration
  - Trust & Estate Paralegal work
- **Contact Methods**: LinkedIn integration and direct email
- **Response Expectations**: Communication timeline and process

### Content Management System

#### **Content Collections**
- **Case Studies**: Managed through Astro content collections
- **Schema Validation**: Zod schemas for content type safety
- **Dynamic Routing**: Automatic page generation from MDX files
- **Component Integration**: Custom components for content rendering

#### **Content Structure**
```typescript
// Case Study Schema
{
  title: string,
  industry: 'QSR' | 'Salon' | 'CPA-Payroll',
  problem: string,
  result: string,
  skills: string[],
  metric?: string
}
```

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
- **Structured Data**: JSON-LD for methodology concepts
- **Meta Tags**: Comprehensive page metadata
- **Sitemap Generation**: Automated XML sitemap
- **Semantic HTML**: Search engine optimization

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
- **Output**: Static site generation
- **Site URL**: https://trevor-lam.com
- **Node Version**: >= 22.12.0

## Deployment

### Production Deployment
The site is configured for static deployment and can be hosted on:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- Any static hosting service

### CI/CD Pipeline
Automated workflows include:
- **Testing**: Unit, E2E, accessibility, contract tests
- **Quality Gates**: Coverage thresholds, linting, type checking
- **Security**: Security scanning and vulnerability detection
- **Deployment**: Automated deployment on merge to main

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
