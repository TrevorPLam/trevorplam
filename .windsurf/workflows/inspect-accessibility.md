---
description: Inspect codebase for accessibility issues including WCAG 2.2 AA violations, missing ARIA labels, color contrast, and keyboard navigation
---

# Accessibility Inspection Workflow

This workflow guides the AI agent through comprehensive accessibility inspection to identify WCAG 2.2 AA violations, missing ARIA labels, color contrast issues, and keyboard navigation problems.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed
- Understanding of WCAG 2.2 AA guidelines

## Step 1: Repository Impact Mapping

Before inspecting, analyze the codebase structure and identify accessibility focus areas:

### Impact Map Structure
```markdown
# Repository Impact Map: Accessibility Inspection

## Accessibility-Critical Areas
- All Astro components
- All pages
- Interactive elements (buttons, links, forms)
- Images and media
- Navigation structures
- Color usage
- Focus management

## Testing Tools
- Playwright with @axe-core/playwright
- Manual keyboard navigation testing
- Screen reader testing
- Color contrast checkers
```

## Step 2: Automated Accessibility Testing

Run automated accessibility tests:

```bash
npm run test:a11y
```

// turbo

### Issues to Flag
- Any axe-core violations (zero violations required)
- Missing ARIA labels
- Insufficient color contrast
- Missing alt text
- Keyboard navigation issues
- Focus management problems

### Review Test Results
- Check tests/a11y/ directory for test files
- Review test results for specific violations
- Document all accessibility issues found

## Step 3: Skip to Content Link Check

Verify skip to content link is present:

### Check Layout Component
```bash
# Check BaseLayout.astro for skip link
grep -i "skip" src/layouts/BaseLayout.astro
```

### Issues to Flag
- Missing skip to content link
- Skip link not first focusable element
- Skip link not visible to screen readers
- Skip link not keyboard accessible

### Requirements
- Must be first focusable element on page
- Allows keyboard users to skip navigation
- Should be visually hidden but available to screen readers

## Step 4: Touch Target Check

Verify all interactive elements have adequate touch targets:

### Issues to Flag
- Buttons/links <44x44px
- Form inputs <44x44px
- Interactive elements with insufficient padding
- Touch targets that are too close together

### Check Components
- All buttons
- All links
- All form inputs
- All interactive elements

### Tailwind Pattern
```css
min-h-[44px] min-w-[44px]
```

## Step 5: Focus Management Check

Verify focus is not obscured by fixed headers:

### Check CSS
```bash
# Check for scroll-padding-top
grep -rn "scroll-padding-top" src/styles/
```

### Issues to Flag
- Missing scroll-padding-top: 80px on :root
- Focus obscured by fixed headers
- No visible focus indicator
- Focus trap issues

### Requirements
- Add `scroll-padding-top: 80px` to `:root`
- Ensures focused elements are visible when scrolled into view
- Visible focus indicator on all interactive elements

## Step 6: Semantic HTML Check

Verify proper semantic HTML usage:

### Issues to Flag
- Using <div> instead of semantic elements
- Missing <header>, <nav>, <main>, <footer>
- Incorrect heading hierarchy
- Missing landmarks

### Check Components
- All pages should use semantic elements
- Navigation should be in <nav>
- Main content in <main>
- Footer in <footer>

## Step 7: ARIA Label Check

Verify ARIA labels for icon-only buttons:

### Search for Icon-Only Buttons
```bash
# Search for buttons without text content
grep -rn "<button" src/components/ | grep -v ">"
```

### Issues to Flag
- Icon-only buttons without aria-label
- Icon-only buttons without aria-labelledby
- Interactive elements without accessible names
- Decorative elements not marked as aria-hidden

### Requirements
- Icon-only buttons must have aria-label or aria-labelledby
- Example: `<button aria-label="Close menu">`

## Step 8: Color Contrast Check

Verify color contrast meets WCAG 2.2 AA standards:

### Issues to Flag
- Normal text contrast <4.5:1
- Large text (18pt+ or 14pt+ bold) contrast <3:1
- Interactive elements contrast <3:1
- Focus indicators contrast <3:1

### Check with Tools
- Use axe-core or contrast checkers
- Test all text colors against backgrounds
- Test focus indicators
- Test error/success messages

## Step 9: Image Accessibility Check

Verify all images have proper accessibility:

### Check for Alt Text
```bash
# Search for images without alt text
grep -rn "<img" src/ | grep -v "alt="
```

### Check OptimizedImage Component
```bash
# Verify OptimizedImage component usage
grep -rn "OptimizedImage" src/
```

### Issues to Flag
- Images missing alt text
- Decorative images not marked as alt=""
- Images with unhelpful alt text (e.g., "image")
- Complex images missing long descriptions
- Images in /public/ instead of /src/assets/

### Requirements
- LCP images need `loading="eager"` and `fetchpriority="high"`
- All images should use OptimizedImage component
- Images in /src/assets/ for optimization

## Step 10: Form Accessibility Check

Verify forms are accessible:

### Issues to Flag
- Form inputs without labels
- Missing required field indicators
- Error messages not associated with inputs
- Missing validation feedback
- Inaccessible error states

### Check Form Components
- All form inputs have associated labels
- Required fields are marked
- Error messages are accessible
- Form validation provides feedback

## Step 11: Keyboard Navigation Check

Verify keyboard navigation works:

### Issues to Flag
- Elements not keyboard accessible
- No visible focus indicator
- Keyboard traps
- Tab order is illogical
- Skip navigation doesn't work

### Test Keyboard Navigation
- Tab through all interactive elements
- Verify focus order is logical
- Test Enter/Space on buttons
- Test Escape on modals
- Test arrow keys on menus

## Step 12: Screen Reader Check

Verify screen reader compatibility:

### Issues to Flag
- Elements not announced by screen readers
- Incorrect ARIA roles
- Missing live regions for dynamic content
- Incorrect heading structure
- Landmarks not properly identified

### Test with Screen Readers
- NVDA (Windows)
- VoiceOver (macOS)
- JAWS (Windows)

## Step 13: Generate Accessibility Report

Compile all findings into a comprehensive accessibility report:

### Report Structure
```markdown
# Accessibility Inspection Report

## Critical Issues
- WCAG violations: [list with details]
- Zero axe-core violations required

## High Priority Issues
- Missing ARIA labels: [list]
- Color contrast: [list]

## Medium Priority Issues
- Focus management: [list]
- Keyboard navigation: [list]

## Low Priority Issues
- Minor improvements: [list]

## Test Results
- Automated tests: [results]
- Manual tests: [results]

## Recommendations
1. [Priority recommendation 1]
2. [Priority recommendation 2]
3. [Other recommendations]
```

## Notes

- Zero axe-core violations required (WCAG 2.2 AA compliance)
- All interactive elements must have touch targets ≥44x44px
- Focus must not be obscured by fixed headers (add scroll-padding-top: 80px)
- Icon-only buttons must have ARIA labels
- Color contrast must be ≥4.5:1 for normal text, ≥3:1 for large text
- Review AGENTS.md for accessibility guidelines
- Review accessibility-wcag.md memory for detailed requirements

## Error Handling

If inspection fails:
1. Review the specific error message
2. Check that Playwright and @axe-core/playwright are installed
3. Run individual accessibility tests
4. Verify test files are properly configured
5. Review AGENTS.md for accessibility standards
