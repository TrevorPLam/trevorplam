---
trigger: glob
globs:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "**/*.test.tsx"
  - "**/*.spec.tsx"
description: Testing conventions for test files
---

# Testing Requirements

## Web-First Assertions

- NEVER use `waitForTimeout()` in tests
- Use web-first assertions instead:
  - `expect().toBeVisible()`
  - `expect().toHaveURL()`
  - `expect().toBeInViewport()`
- These are more reliable and faster than arbitrary waits

## Test Structure

- Use `describe`/`it` blocks for organization
- Mock external API calls
- Test both happy paths and error cases
- Use descriptive test names

## Coverage Targets

- Target 80% test coverage overall
- Target 90% coverage for utility functions
- Use `npm run test:coverage` to check coverage

## Accessibility Testing

- Zero axe-core violations required
- Run with: `npm run test:a11y`
- Test with Playwright + `@axe-core/playwright`

## Mutation Testing

- Target 80% score with Stryker
- Run with: `npm run test:mutation`
- Tests should survive mutations to be meaningful

## Contract Testing

- Use Pact for any API endpoints
- Run with: `npm run test:contract`
- Ensures API contracts are maintained

## Property-Based Testing

- Use fast-check for generative testing
- Run with: `npm run test:property`
- Tests edge cases automatically

## Fuzzing

- Use Jazzer for security vulnerability detection
- Run with: `npm run test:fuzz`
- Identifies potential security issues

## Common Pitfalls

| Pitfall | Prevention |
|---------|-------------|
| Using waitForTimeout() | Use expect().toBeVisible() or other web-first assertions |
| Not mocking external APIs | Always mock API calls in tests |
| Low coverage | Target 80% overall, 90% for utils |
| Ignoring a11y violations | Zero axe-core violations required |
| Not running mutation tests | Target 80% Stryker score |
