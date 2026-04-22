---
name: testing-infrastructure
description: Guides enterprise testing infrastructure with Vitest, Playwright, Pact, Stryker, Jazzer, fast-check, and browser testing
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [testing, vitest, playwright, e2e, a11y]
  vitest_version: 4.x
  playwright_version: 1.51
---

# Testing Infrastructure

## Verification Snapshot (2026-04)
- Verified against Vitest 4.x and Playwright 1.51
- Confirmed 8-shard test matrix in CI/CD works
- Validated zero accessibility violations with axe-core
- Tested mutation testing with Stryker (80% target)
- Verified property-based testing with fast-check

This skill provides guidance for the comprehensive enterprise testing infrastructure including unit tests, E2E tests, accessibility tests, contract tests, mutation testing, fuzzing, and property-based testing.

## Test Overview

### Test Types

- **Unit Tests**: Vitest for utility functions and small components
- **Component Tests**: Vitest for Astro components
- **E2E Tests**: Playwright for full page flows
- **Accessibility Tests**: Playwright + axe-core for WCAG 2.2 AA compliance
- **Contract Tests**: Pact for API contract validation
- **Mutation Tests**: Stryker for code mutation analysis
- **Fuzzing Tests**: Jazzer for security vulnerability detection
- **Property-Based Tests**: fast-check for generative testing
- **Browser Tests**: Vitest browser mode for real browser component testing

### Test Scripts

```bash
npm test                    # Run all unit/component tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Generate coverage report
npm run test:e2e            # Run E2E tests
npm run test:a11y           # Run accessibility tests
npm run test:unit           # Run unit tests only
npm run test:mutation       # Run mutation tests
npm run test:browser        # Run browser tests
npm run test:contract       # Run contract tests
npm run test:property       # Run property-based tests
npm run test:fuzz           # Run fuzzing tests
npm run test:full           # Run full test suite
```

## Unit Tests (Vitest)

### Location
- `/tests/unit/` - Unit tests for utilities and functions
- `/tests/components/` - Component tests

### Configuration
- Configured in `vitest.config.ts`
- Uses happy-dom for DOM simulation
- Coverage via @vitest/coverage-v8

### Writing Unit Tests

```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/utils/myFunction'

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction('input')
    expect(result).toBe('expected')
  })
})
```

### Coverage Thresholds

- **Global**: 80% (branches, functions, lines, statements)
- **Utils**: 90% (stricter threshold for utility functions)

## Component Tests

### Location
- `/tests/components/` - Component-specific tests

### Testing Astro Components

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/astro'
import MyComponent from '@/components/MyComponent.astro'

describe('MyComponent', () => {
  it('should render correctly', async () => {
    const { container } = await render(MyComponent, { prop: 'value' })
    expect(container).toHaveTextContent('value')
  })
})
```

## E2E Tests (Playwright)

### Location
- `/tests/e2e/` - End-to-end tests

### Configuration
- Configured in `playwright.config.ts`
- Tests run in Chrome, Firefox, Safari

### Writing E2E Tests

```typescript
import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Trevor Lam/)
  await expect(page.locator('h1')).toBeVisible()
})
```

### Critical Rules

- **Never use `waitForTimeout()`** - Use web-first assertions
- Use `expect().toBeVisible()` instead of waiting
- Use `expect().toHaveURL()` for navigation validation
- Use `expect().toHaveTextContent()` for content validation

## Accessibility Tests

### Location
- `/tests/a11y/` - Accessibility tests

### Configuration
- Uses @axe-core/playwright
- Tests WCAG 2.2 AA compliance
- Zero violations required

### Writing Accessibility Tests

```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('homepage has no accessibility violations', async ({ page }) => {
  await page.goto('/')
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze()
  expect(accessibilityScanResults.violations).toEqual([])
})
```

### Accessibility Requirements

- Skip to content link as first focusable element
- Touch targets ≥44x44px
- Focus not obscured
- Semantic HTML
- ARIA labels for icon-only buttons
- Color contrast ≥4.5:1

## Contract Tests (Pact)

### Location
- `/tests/contract/` - Contract tests

### Configuration
- Uses @pact-foundation/pact
- Validates API contracts

### Writing Contract Tests

```typescript
import { Pact } from '@pact-foundation/pact'
import { expect } from 'chai'

describe('API Contract', () => {
  const provider = new Pact({
    provider: 'portfolio-api',
    consumer: 'portfolio-frontend'
  })

  it('validates contract', async () => {
    // Contract validation logic
  })
})
```

## Mutation Testing (Stryker)

### Location
- Configured in `stryker.config.mjs`
- Target score: 80%

### Running Mutation Tests

```bash
npm run test:mutation
```

### Configuration

```javascript
export default {
  testRunner: 'vitest',
  testRunnerCommand: 'vitest run',
  coverageAnalysis: 'perTest',
  mutate: ['src/**/*.ts', 'src/**/*.astro'],
  thresholds: {
    high: 80,
    low: 70
  }
}
```

## Fuzzing Tests (Jazzer)

### Location
- `/tests/fuzzing/` - Fuzzing targets

### Running Fuzzing Tests

```bash
npm run test:fuzz
```

### Fuzzing Targets

- Input validation functions
- Data parsing logic
- Authentication flows
- File handling code

## Property-Based Tests (fast-check)

### Location
- `/tests/property/` - Property-based tests

### Running Property-Based Tests

```bash
npm run test:property
```

### Writing Property-Based Tests

```typescript
import { test, expect } from 'vitest'
import { fc } from 'fast-check'

test('property-based test', () => {
  fc.assert(
    fc.property(fc.string(), fc.string(), (a, b) => {
      return myFunction(a, b).length === a.length + b.length
    })
  )
})
```

## Browser Tests

### Location
- `/tests/browser/` - Browser mode tests

### Configuration
- Uses @vitest/browser-playwright
- Real browser component testing

### Running Browser Tests

```bash
npm run test:browser
```

## CI/CD Integration

### Test Matrix

The CI pipeline runs tests in 8 shards for parallel execution:
- Unit tests (4 shards)
- E2E tests (2 shards)
- Accessibility tests (1 shard)
- Contract tests (1 shard)

### Security Tests

- Fuzzing tests
- Mutation tests
- Security scanning

### Performance Tests

- Lighthouse CI
- Bundle analysis

## Common Patterns

### Test Organization

```
tests/
├── unit/              # Unit tests
├── components/        # Component tests
├── e2e/              # E2E tests
├── a11y/             # Accessibility tests
├── contract/         # Contract tests
├── property/         # Property-based tests
├── fuzzing/          # Fuzzing tests
├── browser/          # Browser tests
├── ai/               # AI-generated tests
└── monitoring/       # Real-time monitoring
```

### Test Setup

Common setup in `/tests/setup.ts`:
```typescript
import { beforeAll } from 'vitest'
import { loadEnv } from 'vite'

beforeAll(() => {
  // Test setup logic
})
```

### Test Utilities

Browser test utilities in `/tests/browser/browser-test-utils.ts`:
```typescript
export const renderInBrowser = async (component) => {
  // Browser rendering logic
}
```

## Gotchas

- **waitForTimeout() prohibited**: Never use hardcoded waits - use web-first assertions (toBeVisible, toHaveURL)
- **waitForTimeout in async**: Even in async/await, avoid waitForTimeout - use expect().toBeVisible()
- **Axe-core violations**: Zero violations required before deployment - no exceptions
- **Coverage thresholds**: Global 80%, utils 90% - builds fail if below threshold
- **Mutation testing target**: 80% score required - review surviving mutants
- **Test isolation**: Tests must not depend on each other - use proper setup/teardown
- **Mock overuse**: Don't mock what you can test directly - only external dependencies
- **E2E test flakiness**: Use retry logic sparingly - prefer stable selectors and proper waits
- **Contract test versioning**: Update pact contracts when API changes - not before
- **Fuzzing resource limits**: Jazzer tests have resource limits - don't run in CI without limits

## Validation Loop

1. Write or modify tests
2. Run specific test suite: `npm run test:unit` or `npm run test:e2e` or `npm run test:a11y`
3. If test failures:
   - Review error message and stack trace
   - Check for flaky selectors or timing issues
   - Fix test or code as needed
   - Re-run tests
4. Run with coverage: `npm run test:coverage`
5. If coverage below threshold:
   - Add tests for uncovered code
   - Or adjust threshold if justified
6. Run accessibility tests: `npm run test:a11y`
7. If axe-core violations:
   - Fix accessibility issues
   - Re-run a11y tests
8. Only proceed when all tests pass, coverage meets threshold, zero a11y violations

## Important Notes

- Never use `waitForTimeout()` in tests
- Use web-first assertions
- Target 80% coverage (90% for utils)
- Zero accessibility violations
- Mutation testing target 80% score
- All tests must pass before deployment
- Run full test suite: `npm run test:full`
