---
description: Run the appropriate test suite based on file changes with coverage validation
---

# Run Tests Workflow

This workflow intelligently selects and runs the appropriate test suite based on the types of files that have changed.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed (`npm install`)
- Test dependencies installed (Vitest, Playwright, etc.)

## Step 1: Repository Impact Mapping (Harness Engineering)

Before running tests, have the AI scan the codebase and produce a repository impact map to understand which tests are relevant to the changes.

### Impact Map Structure

```markdown
# Repository Impact Map: Test Selection

## Changed Files
- List all modified files with paths

## Test Impact Analysis
- [file path]: affects [test suite(s)]
- [file path]: affects [test suite(s)]

## Recommended Test Suite
- Primary: [test suite name]
- Secondary: [test suite name] (if applicable)

## Test Coverage Impact
- Files changed: [number]
- Estimated coverage delta: [+/- X%]
```

**Human Review Required**: Review the impact map to ensure the recommended test suite is appropriate for the changes.

## Step 2: Analyze Changed Files

Determine which files have been modified to select the appropriate test suite:

- **Astro components/pages**: Run component tests
- **Utility functions**: Run unit tests
- **Content files**: Run integration tests
- **Styling/CSS**: Run visual regression tests
- **API endpoints**: Run contract tests
- **Security-related changes**: Run fuzzing and security tests
- **Multiple changes**: Run full test suite

## Step 3: Select Test Suite

Based on the analysis, run the appropriate test command:

### Unit Tests Only
```bash
npm run test:unit
```
// turbo

Use for: Utility function changes, small isolated logic updates

### Component Tests
```bash
npm test
```
Use for: Astro component changes, page updates

### Integration Tests
```bash
npm run test:integration
```
Use for: Content collection changes, data structure updates

### E2E Tests
```bash
npm run test:e2e
```
Use for: Page flow changes, navigation updates

### Accessibility Tests
```bash
npm run test:a11y
```
Use for: UI changes, component updates

### Contract Tests
```bash
npm run test:contract
```
Use for: API endpoint changes

### Mutation Tests
```bash
npm run test:mutation
```
Use for: Critical logic changes, refactoring

### Property-Based Tests
```bash
npm run test:property
```
Use for: Algorithm changes, data validation logic

### Browser Tests
```bash
npm run test:browser
```
Use for: Component rendering in real browser

### Full Test Suite
```bash
npm run test:full
```
Use for: Multiple file types changed, major updates

## Step 4: Check Coverage Thresholds

Ensure coverage meets the required thresholds:
- **Global**: 80% (branches, functions, lines, statements)
- **Utils**: 90% (stricter threshold for utility functions)

If coverage is below threshold, add tests to improve coverage.

## Step 5: Validate Accessibility

Ensure zero axe-core violations:
```bash
npm run test:a11y
```

All pages must meet WCAG 2.2 AA compliance with zero violations.

## Step 6: Run Lighthouse CI

If running full test suite, validate performance:
```bash
npm run lighthouse
```

Scores must be ≥90 for Performance, Accessibility, Best Practices, SEO.

## Notes

- Never use `waitForTimeout()` in tests - use web-first assertions
- Use `expect().toBeVisible()` and `expect().toHaveURL()` instead of waits
- Browser tests use Vitest browser mode for real browser component testing
- Mutation testing targets 80% score with Stryker
- Fuzzing uses Jazzer for security vulnerability detection
- Property-based testing uses fast-check for generative testing

## Error Handling

If tests fail:
1. Check the test output for specific failure details
2. Run the failing test individually: `npm test -- <test-file>`
3. For coverage issues, add tests to improve coverage
4. For accessibility violations, run `npm run test:a11y` for details
5. Check that test dependencies are installed
6. Verify test environment is properly configured
7. Review test file for proper assertions and selectors
