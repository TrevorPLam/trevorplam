---
trigger: always_on
description: WCAG 2.2 AA accessibility requirements
---

# Accessibility (WCAG 2.2 AA)

## Skip to Content Link

- Must be the first focusable element on the page
- Allows keyboard users to skip navigation
- Should be visually hidden but available to screen readers

## Touch Targets

- All interactive elements must have touch targets ≥44x44px
- Applies to buttons, links, form inputs, etc.
- Use Tailwind: `min-h-[44px] min-w-[44px]` or padding

## Focus Management

- Focus must not be obscured by fixed headers
- Add `scroll-padding-top: 80px` to `:root`
- Ensures focused elements are visible when scrolled into view

## Semantic HTML

- Use proper semantic elements:
  - `<header>` for page headers
  - `<nav>` for navigation
  - `<main>` for main content
  - `<footer>` for page footers
- Avoid using `<div>` when semantic elements exist

## ARIA Labels

- Icon-only buttons must have ARIA labels
- Use `aria-label` or `aria-labelledby`
- Example: `<button aria-label="Close menu">`

## Color Contrast

- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text (18pt+ or 14pt+ bold)
- Test with axe-core or contrast checkers
- Ensure text is readable on all backgrounds

## Testing

- Run accessibility tests: `npm run test:a11y`
- Zero axe-core violations required
- Test with keyboard navigation
- Test with screen readers

## Common Pitfalls

| Pitfall | Prevention |
|---------|-------------|
| Touch targets too small | Ensure ≥44x44px for all interactive elements |
| Focus obscured by header | Add scroll-padding-top: 80px to :root |
| Missing ARIA labels | Add aria-label to icon-only buttons |
| Low color contrast | Test with axe-core, ensure ≥4.5:1 ratio |
| Using div instead of semantic HTML | Use header, nav, main, footer |
