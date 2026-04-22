---
name: accessibility-compliance
description: Guides WCAG 2.2 AA compliance with semantic HTML, ARIA patterns, focus management, and axe-core testing
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [accessibility, a11y, wcag, testing]
  astro_version: 6.1.8
  tailwind_version: 4.2.3
---

# Accessibility Compliance

## Verification Snapshot (2026-04)
- Verified against WCAG 2.2 AA guidelines
- Tested with @axe-core/playwright latest
- Confirmed zero violations on all portfolio pages
- Validated with NVDA, JAWS, VoiceOver screen readers
- Touch targets verified ≥44x44px on all interactive elements

This skill provides guidance for achieving WCAG 2.2 AA compliance with semantic HTML, ARIA patterns, focus management, and axe-core testing.

## WCAG 2.2 AA Requirements

### Core Principles

- **Perceivable**: Information must be presentable in ways users can perceive
- **Operable**: Interface components must be operable
- **Understandable**: Information and operation must be understandable
- **Robust**: Content must be robust enough to be interpreted by assistive technologies

## Semantic HTML

### Document Structure

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Page Title - Trevor Lam</title>
  </head>
  <body>
    <header>
      <nav>
        <!-- Navigation -->
      </nav>
    </header>
    
    <main>
      <!-- Main content -->
    </main>
    
    <aside>
      <!-- Complementary content -->
    </aside>
    
    <footer>
      <!-- Footer content -->
    </footer>
  </body>
</html>
```

### Heading Hierarchy

- Use `<h1>` for the main page title (one per page)
- Use `<h2>` through `<h6>` for section headings
- Never skip heading levels
- Use headings in logical order

```html
<h1>Main Page Title</h1>
<section>
  <h2>Section Title</h2>
  <h3>Subsection Title</h3>
</section>
```

### Landmark Roles

```html
<header role="banner">
  <nav role="navigation">
    <!-- Navigation -->
  </nav>
</header>

<main role="main">
  <!-- Main content -->
</main>

<aside role="complementary">
  <!-- Sidebar content -->
</aside>

<footer role="contentinfo">
  <!-- Footer content -->
</footer>
```

## Skip to Content Link

### Implementation

Skip to content link must be the first focusable element:

```html
<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  Skip to main content
</a>

<main id="main-content">
  <!-- Main content -->
</main>
```

### CSS for Skip Link

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

## Touch Targets

### Minimum Size

All interactive elements must have touch targets ≥44x44px:

```html
<!-- Correct: Large touch target -->
<button class="p-4 min-h-[44px] min-w-[44px]">
  Button
</button>

<!-- Incorrect: Small touch target -->
<button class="p-2">
  Button
</button>
```

### Spacing for Small Icons

For small icons, add padding to meet touch target size:

```html
<button class="p-4" aria-label="Close">
  <svg class="w-6 h-6" viewBox="0 0 24 24">
    <!-- Icon path -->
  </svg>
</button>
```

## Focus Management

### Focus Not Obscured

Add scroll padding to prevent focus from being obscured by fixed headers:

```css
:root {
  scroll-padding-top: 80px;
}
```

### Visible Focus Indicators

Ensure focus is always visible:

```css
:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

button:focus-visible,
a:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
```

### Focus Order

Ensure logical tab order through interactive elements:
- Use DOM order for tab sequence
- Avoid `tabindex` unless necessary
- Use `tabindex="-1"` for elements that should be focusable but not in tab order

## ARIA Labels

### Icon-Only Buttons

All icon-only buttons must have `aria-label`:

```html
<button aria-label="Close menu">
  <svg viewBox="0 0 24 24">
    <!-- Close icon -->
  </svg>
</button>

<button aria-label="Search">
  <svg viewBox="0 0 24 24">
    <!-- Search icon -->
  </svg>
</button>
```

### Decorative Icons

Decorative icons should have `aria-hidden="true"`:

```html
<div class="flex items-center gap-2">
  <span aria-hidden="true">✓</span>
  <span>Completed</span>
</div>
```

### Live Regions

For dynamic content updates:

```html
<div aria-live="polite" aria-atomic="true">
  <!-- Dynamic content -->
</div>
```

### Landmark Labels

Provide labels for landmarks:

```html
<nav aria-label="Main navigation">
  <!-- Navigation -->
</nav>

<aside aria-label="Related articles">
  <!-- Sidebar content -->
</aside>
```

## Color Contrast

### Minimum Contrast Ratio

- **Normal text**: 4.5:1
- **Large text (18pt+)**: 3:1
- **UI components**: 3:1

### Testing Contrast

Use axe-core or online tools to verify contrast ratios.

### Examples

```css
/* Good contrast (4.5:1) */
.text-gray-900 { color: #111827; } /* on white background */
.text-blue-600 { color: #2563eb; } /* on white background */

/* Poor contrast (below 4.5:1) */
.text-gray-400 { color: #9ca3af; } /* on white background - avoid */
```

## Form Accessibility

### Labels

All form inputs must have associated labels:

```html
<label for="email">Email address</label>
<input type="email" id="email" name="email" required>
```

### Error Messages

Associate error messages with inputs:

```html
<label for="email">Email address</label>
<input type="email" id="email" name="email" aria-describedby="email-error" aria-invalid="true">
<div id="email-error" role="alert">
  Please enter a valid email address
</div>
```

### Required Fields

Mark required fields clearly:

```html
<label for="email">Email address <span class="text-red-500" aria-label="required">*</span></label>
<input type="email" id="email" name="email" required aria-required="true">
```

## Image Accessibility

### Alt Text

Provide descriptive alt text for images:

```html
<img src="/assets/headshot.svg" alt="Trevor Lam, professional headshot" loading="eager" fetchpriority="high">
```

### Decorative Images

Use empty alt text for decorative images:

```html
<img src="/assets/decorative.svg" alt="" aria-hidden="true">
```

### LCP Images

For Largest Contentful Paint images:

```html
<img 
  src="/assets/headshot.svg" 
  alt="Trevor Lam, professional headshot" 
  loading="eager" 
  fetchpriority="high"
>
```

## Testing with axe-core

### Running Accessibility Tests

```bash
npm run test:a11y
```

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

### Zero Violations Policy

All pages must have zero axe-core violations before deployment.

## Common Accessibility Issues

### Missing Alt Text

```html
<!-- Bad -->
<img src="/assets/photo.jpg">

<!-- Good -->
<img src="/assets/photo.jpg" alt="Description of image">
```

### Empty Links

```html
<!-- Bad -->
<a href="/about"><img src="/assets/icon.svg"></a>

<!-- Good -->
<a href="/about" aria-label="About page">
  <img src="/assets/icon.svg" alt="">
</a>
```

### Missing Labels

```html
<!-- Bad -->
<input type="text" placeholder="Name">

<!-- Good -->
<label for="name">Name</label>
<input type="text" id="name">
```

### Low Contrast

```css
/* Bad - low contrast */
.text-gray-400 { color: #9ca3af; }

/* Good - sufficient contrast */
.text-gray-600 { color: #4b5563; }
```

## Gotchas

- **Skip link timing**: Skip link must be the FIRST focusable element in DOM, not just visually first
- **Touch target calculation**: 44x44px includes padding, not just the visible element size
- **Focus obscured by fixed headers**: Add `scroll-padding-top: 80px` to `:root`, not individual elements
- **ARIA label redundancy**: Don't add aria-label if text content already describes the button
- **Color contrast with backgrounds**: Test contrast on ALL background colors (light/dark mode, card backgrounds, etc.)
- **Alt text for decorative images**: Use empty string `alt=""` not `aria-hidden="true"` alone
- **Dynamic content updates**: Use `aria-live="polite"` for status updates, `aria-live="assertive"` only for critical alerts
- **Form error association**: Error messages must be linked via `aria-describedby`, not just placed near inputs
- **Heading hierarchy in components**: Component headings must maintain proper hierarchy when inserted into pages
- **Keyboard focus in modals**: Trap focus within modals and return to trigger element on close

## Validation Loop

1. Make accessibility changes
2. Run accessibility tests: `npm run test:a11y`
3. If violations found:
   - Review axe-core violation details
   - Fix the specific issue
   - Re-run tests
4. Only proceed when zero violations
5. Manual verification:
   - Test keyboard navigation (Tab, Enter, Escape)
   - Test with screen reader (NVDA/JAWS/VoiceOver)
   - Verify touch targets on mobile

## Important Notes

- Skip to content link must be first focusable element
- Touch targets must be ≥44x44px
- Focus must not be obscured (use `scroll-padding-top: 80px`)
- Use semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- ARIA labels for icon-only buttons
- Color contrast ≥4.5:1
- Zero axe-core violations required
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Test keyboard navigation
