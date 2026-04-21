# Testing Guide

This document provides comprehensive guidance on the testing infrastructure for this Astro project.

## Table of Contents

- [Quick Start](#quick-start)
- [Testing Architecture](#testing-architecture)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Types](#test-types)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)
- [Troubleshooting](#troubleshooting)

## Quick Start

```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e

# Run accessibility tests only
npm run test:a11y

# Run in watch mode during development
npm test -- --watch
```

## Testing Architecture

This project uses a multi-layered testing approach:

```
┌─────────────────────────────────────────────────────────┐
│                    E2E Tests (Playwright)                 │
│         Cross-browser functional + accessibility          │
├─────────────────────────────────────────────────────────┤
│                 Component Tests (Vitest)                  │
│           Astro component rendering + logic               │
├─────────────────────────────────────────────────────────┤
│                  Unit Tests (Vitest)                      │
│         Utility functions + business logic                │
├─────────────────────────────────────────────────────────┤
│              Visual Regression (Playwright)               │
│              Screenshot comparison tests                  │
└─────────────────────────────────────────────────────────┘
```

### Test Organization

```
tests/
├── a11y/           # Accessibility compliance tests
├── ai/             # AI test enhancement utilities
├── components/     # Astro component tests (Vitest)
├── data/           # Test data management platform
├── e2e/            # End-to-end tests (Playwright)
│   ├── smoke.spec.ts
│   ├── comprehensive-e2e.spec.ts
│   └── visual-regression.spec.ts
├── integration/    # Integration tests
├── quality/        # Quality monitoring utilities
├── unit/           # Unit tests for utilities
│   ├── formatters.test.ts
│   ├── validators.test.ts
│   └── date.test.ts
└── utils/          # Test helpers and factories
    ├── test-helpers.ts
    └── test-factories.ts
```

## Running Tests

### Unit & Component Tests (Vitest)

```bash
# Run once
npm test

# With coverage report
npm test -- --coverage

# Watch mode for development
npm test -- --watch

# Run specific test file
npm test -- tests/unit/formatters.test.ts

# Run with UI
npm test -- --ui
```

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific browser
npm run test:e2e -- --project="Desktop Chrome"

# Run with headed browser (for debugging)
npm run test:e2e -- --headed

# Update visual regression snapshots
npm run test:e2e -- tests/e2e/visual-regression.spec.ts --update-snapshots
```

### Accessibility Tests

```bash
# Run accessibility test suite
npm run test:a11y

# Run with specific browser
npm run test:a11y -- --project="Desktop Chrome"
```

## Writing Tests

### Unit Tests

Unit tests should focus on pure functions and business logic. Located in `tests/unit/`.

```typescript
import { describe, test, expect } from 'vitest';
import { formatCurrency } from '../../src/utils/formatters';

describe('formatCurrency', () => {
  test('formats positive numbers as USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
  });

  test('formats negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });
});
```

### Component Tests

Component tests verify Astro component rendering and behavior. Located in `tests/components/`.

```typescript
import { describe, test, expect } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MetricCard from '../../src/components/MetricCard.astro';

describe('MetricCard Component', () => {
  test('renders metric card with all props', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(MetricCard, {
      props: {
        title: 'Cost Reduction',
        before: '$2.5M',
        after: '$1.2M'
      }
    });

    expect(result).toContain('Cost Reduction');
    expect(result).toContain('$2.5M');
  });
});
```

**Best Practices for Component Tests:**
- Use `test-factories.ts` for consistent test data
- Test with and without optional props
- Verify accessibility attributes
- Use `test-helpers.ts` for common operations

### E2E Tests

E2E tests verify complete user flows across the application.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    const navigation = page.getByRole('navigation');
    await expect(navigation).toBeVisible();
    
    const firstNavLink = navigation.getByRole('link').first();
    await firstNavLink.click();
    
    await expect(page).toHaveURL(/.*/);
  });
});
```

### Accessibility Tests

Accessibility tests use Axe Core via Playwright.

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
    
  expect(results.violations).toEqual([]);
});
```

### Visual Regression Tests

Visual tests capture and compare screenshots.

```bash
# First run: create baseline
npm run test:e2e -- tests/e2e/visual-regression.spec.ts --update-snapshots

# Subsequent runs: compare against baseline
npm run test:e2e -- tests/e2e/visual-regression.spec.ts
```

**When to Update Snapshots:**
- After intentional UI changes
- After design system updates
- After dependency updates that affect rendering

## Test Types

| Type | Tool | Purpose | Location |
|------|------|---------|----------|
| **Unit** | Vitest | Pure functions, utilities | `tests/unit/` |
| **Component** | Vitest + Astro Container | Component rendering | `tests/components/` |
| **Integration** | Vitest | Multi-component flows | `tests/integration/` |
| **E2E** | Playwright | Full user flows | `tests/e2e/` |
| **Accessibility** | Playwright + Axe | WCAG compliance | `tests/a11y/` |
| **Visual** | Playwright | Screenshot comparison | `tests/e2e/visual-regression.spec.ts` |

### Coverage Requirements

| Metric | Threshold |
|--------|-----------|
| Branches | 80% |
| Functions | 80% |
| Lines | 80% |
| Statements | 80% |

## Best Practices

### DO's

✅ Use test factories for consistent data
```typescript
import { metricCardFactory } from '../utils/test-factories';

const props = metricCardFactory.build({ title: 'Custom Title' });
```

✅ Test both success and error paths
```typescript
test('handles missing optional props', async () => {
  const result = await render(Component, {});
  expect(result).toBeTruthy();
});
```

✅ Use semantic selectors in E2E tests
```typescript
const button = page.getByRole('button', { name: 'Submit' });
```

✅ Mock external dependencies
```typescript
vi.mock('some-external-lib', () => ({
  default: vi.fn()
}));
```

### DON'Ts

❌ Don't test implementation details
```typescript
// Bad - testing internal state
expect(component.internalState).toBe('loading');

// Good - testing visible behavior
expect(screen.getByText('Loading...')).toBeVisible();
```

❌ Don't use arbitrary delays
```typescript
// Bad
await page.waitForTimeout(1000);

// Good
await page.waitForSelector('[data-testid="loaded"]');
```

❌ Don't skip test isolation
```typescript
// Bad - shared state between tests
let container: AstroContainer;

// Good - fresh instance per test
test('...', async () => {
  const container = await AstroContainer.create();
});
```

## CI/CD Integration

### GitHub Actions Workflows

| Workflow | Trigger | Tests Run |
|----------|---------|-----------|
| `test.yml` | Push to main/develop, PRs | Unit, coverage, E2E, a11y |
| `test-quality.yml` | Changes to tests/** | Lint, type-check, unit tests |
| `security-scan.yml` | Changes to src/** | Security audit, secrets scan |

### Performance Budgets

The CI enforces performance budgets:

- **Bundle Size**: Max 1MB for `dist/`
- **Individual JS**: Max 500KB per file
- **Build Time**: Monitored but not blocking

Warnings are generated in the GitHub Actions logs when budgets are exceeded.

### Coverage Reporting

Coverage reports are:
1. Generated locally: `coverage/index.html`
2. Uploaded to Codecov on CI
3. Enforced at 80% threshold (fails build if below)

## Troubleshooting

### Common Issues

**Tests fail with "Cannot find module"**
```bash
# Solution: Update TypeScript paths
npx tsc --noEmit
```

**Playwright browser not found**
```bash
# Solution: Install browsers
npx playwright install
```

**Visual regression tests fail locally but pass in CI**
- Font rendering differences between OS
- Use Docker or CI environment for consistent results
- Update snapshots from CI if needed

**Coverage threshold failures**
```bash
# View detailed coverage
coverage/index.html

# Check specific file coverage
npx vitest --coverage --reporter=verbose
```

### Debug Mode

```bash
# Debug specific test
npm test -- --reporter=verbose tests/unit/formatters.test.ts

# Debug E2E with UI
npm run test:e2e -- --headed --slow-mo=1000

# Show browser console logs
DEBUG=pw:api npm run test:e2e
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Axe Core Rules](https://dequeuniversity.com/rules/axe/html/4.4)
- [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)

---

## Test Utilities Reference

### Test Helpers (`tests/utils/test-helpers.ts`)

| Function | Purpose |
|----------|---------|
| `createTestContainer()` | Create Astro Container for component testing |
| `renderComponent(Component, props)` | Render component to string |
| `createMockElement(tag, attrs)` | Create DOM element for testing |
| `waitFor(ms)` | Async delay utility |
| `createTestContext()` | Full test context with cleanup |

### Test Factories (`tests/utils/test-factories.ts`)

| Factory | Default Data |
|---------|-------------|
| `metricCardFactory` | Title, before/after values, context |
| `skillTagFactory` | Label |
| `timelineNodeFactory` | Year, title, description, type |
| `optimizedImageFactory` | Src, alt, dimensions |
| `navigationFactory` | Current path, mobile state |
| `footerFactory` | Current year, contact info flag |

## AI Test Enhancement

The project includes AI-powered test utilities in `tests/ai/AITestEnhancer.ts`:

```typescript
import { AITestEnhancer } from '../ai/AITestEnhancer';

// Generate test scenarios for a component
const scenarios = await AITestEnhancer.generateTestScenarios(
  'src/components/MetricCard.astro'
);

// Get prioritized test list
const prioritized = AITestEnhancer.prioritizeTests(scenarios);
```

This helps identify:
- Missing test coverage
- Risk-based test prioritization
- Automated test generation suggestions

