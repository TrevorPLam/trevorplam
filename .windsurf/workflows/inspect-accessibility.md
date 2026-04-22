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

Generate a comprehensive accessibility report summarizing all findings:

### Report Structure

1. **Executive Summary**
   - Overall accessibility score
   - Number of critical issues
   - Number of high priority issues
   - Number of medium priority issues
   - Number of low priority issues

2. **Critical Issues**
   - List all critical accessibility violations
   - Impact on users
   - Recommended fixes

3. **High Priority Issues**
   - List all high priority violations
   - Impact on users
   - Recommended fixes

4. **Medium Priority Issues**
   - List all medium priority violations
   - Impact on users
   - Recommended fixes

5. **Low Priority Issues**
   - List all low priority violations
   - Impact on users
   - Recommended fixes

6. **WCAG 2.2 AA Compliance Status**
   - Overall compliance percentage
   - Specific guidelines not met
   - Recommendations for achieving full compliance

## Step 14: Create TODO.md Tasks from Findings

Convert the accessibility inspection findings into TODO.md tasks using the comprehensive task format. This ensures accessibility issues are systematically addressed.

### Task Creation Process

For each critical and high-priority accessibility issue identified in the report, create a TODO.md task following the format defined in create-todo.md:

1. **Assign Task ID**: Use the next available TASK-[###] format
2. **Set Priority**: Based on severity (🔴 Critical = High, 🟡 High = High, 🟢 Medium = Medium)
3. **Set Status**: 🟡 Pending
4. **Populate All 14 Required Sections**:
   - Priority / Urgency
   - Research / Investigation (if additional WCAG guidance needed)
   - Related Files (affected components from inspection)
   - Definition of Done
   - Acceptance Criteria (bulleted list, include WCAG success criteria)
   - Out of Scope
   - Dependencies
   - Estimated Effort
   - Testing Requirements (include accessibility testing)
   - Validation Steps (specific to the accessibility issue)
   - Strict Rules (from AGENTS.md accessibility rules)
   - Existing Code Patterns
   - Advanced Code Patterns
   - Anti-Patterns (what to avoid)

### Example Task Template

```markdown
- [ ] 🔴 High 🟡 Pending TASK-[###]: [Accessibility Issue Title]

  **Priority / Urgency**
  Critical - Blocks keyboard navigation for screen reader users

  **Research / Investigation**
  None required (or specific WCAG 2.2 guidance needed)

  **Related Files**
  - [component path]
  - [page path]

  **Definition of Done**
  Accessibility issue resolved and verified with axe-core

  **Acceptance Criteria**
  - [WCAG success criteria met]
  - [specific accessibility requirement]
  - Zero axe-core violations for this issue

  **Out of Scope**
  [What is not included in this task]

  **Dependencies**
  None (or list dependencies)

  **Estimated Effort**
  [time estimate]

  **Testing Requirements**
  - axe-core validation
  - Keyboard navigation test
  - Screen reader test

  **Validation Steps**
  - Run npm run test:a11y
  - Verify zero violations for this issue
  - Manual keyboard navigation test

  **Strict Rules**
  - Touch targets ≥44x44px (AGENTS.md)
  - ARIA labels for icon-only buttons
  - Semantic HTML elements

  **Existing Code Patterns**
  - [pattern to follow]

  **Advanced Code Patterns**
  N/A (or advanced accessibility patterns)

  **Anti-Patterns**
  - Using div instead of semantic HTML
  - Missing ARIA labels on icon buttons

  - [ ] TASK-[###]-01: [Subtask 1]
  - [ ] TASK-[###]-02: [Subtask 2]
```

### Update TODO.md

After creating tasks, update TODO.md:
1. If TODO.md doesn't exist, create it using /create-todo
2. If TODO.md exists, use /update-todo to add the new tasks
3. Commit the updated TODO.md with a descriptive commit message

### Commit Message

```bash
git add TODO.md
git commit -m "chore: add TODO.md tasks from accessibility inspection

- Added [number] tasks for critical/high-priority accessibility issues
- WCAG 2.2 AA compliance: [summary]
- Critical issues: [number]
- High priority issues: [number]

Generated from /inspect-accessibility workflow"
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
