---
description: Update TODO.md with new tasks, status changes, and task modifications following the comprehensive task format
---

# Update TODO.md Workflow

This workflow guides you through updating an existing TODO.md file with new tasks, status changes, and task modifications based on codebase assessment, following the comprehensive task format with detailed sections.

## Prerequisites

- TODO.md already exists in repository root
- Codebase assessment completed
- New issues or changes identified
- Repository root accessible for TODO.md updates

## Step 1: Read Existing TODO.md

Read the current TODO.md to understand the existing task structure and status.

### Output Required

- Current task IDs and their statuses
- Last used task ID number (to continue sequential numbering)
- Existing task categories and priorities
- Completed tasks that may need archiving

## Step 2: Assess New Issues or Changes

Identify what needs to be updated in the TODO.md.

### Update Types

- Add new tasks for newly discovered issues
- Update task statuses (pending → in-progress → completed)
- Update task priorities (high → medium → low)
- Add completion notes to completed tasks
- Modify task descriptions or subtasks
- Add/remove related files
- Update any of the 14 required sections
- Reorder tasks by changing priorities
- Archive or remove completed/obsolete tasks

### Output Required

- List of new tasks to add
- List of tasks to update with status changes
- List of tasks to modify
- List of tasks to archive/remove

## Step 2.5: Codebase Assessment for New Issues

For newly identified issues, assess the current codebase state before creating tasks.

### Targeted Analysis
Read all files that will be affected by the new issues.

### Relational Analysis
Identify and read any files that are directly imported by or have a direct dependency on the targeted files.

### Note Existing Patterns
Document the current implementation, relevant patterns, and any immediate constraints.

### Output Required
- Current implementation summary for each new issue
- Relevant patterns observed
- Immediate constraints
- Dependency relationships
- Potential side effects of changes

## Step 2.6: Targeted Online Research (Current as of 04/2026)

Inform your understanding with external best practices before creating new tasks. This ensures tasks are informed by current best practices and modern patterns.

### Task-Specific Research
Conduct up-to-date research specifically on the topics and technologies involved in the newly identified issues.

### Focus Areas
Your research should cover:
- Best practices and modern patterns for the identified issues
- Enterprise solutions and architectural standards
- Advanced coding patterns relevant to the issues
- Anti-patterns to avoid
- Security, accessibility, SEO, and performance implications

### Prioritize Official Sources
- Official documentation
- Changelogs
- Gold-standard reference implementations
- Secondary articles or tutorials (only if official sources are insufficient)

### Output Required
- Research findings with sources
- Best practices identified for each issue type
- Anti-patterns to avoid
- Security/accessibility/performance implications
- Conflicts with existing codebase
- Recommended approaches for each issue

## Step 3: Update Task Statuses and Priorities

For tasks that have progressed, update their status and priority indicators.

### Status Transitions

- `🟡 Pending` → `🔵 In Progress` when work begins
- `🔵 In Progress` → `🟢 Completed` when work finishes
- `🟡 Pending` → `🔴 Blocked` when blocked by dependency
- `🔴 Blocked` → `🟡 Pending` when block is resolved

### Priority Updates

- `🔴 High` → `🟡 Medium` or `🟢 Low` if urgency decreases
- `🟡 Medium` → `🔴 High` if urgency increases
- `🟢 Low` → `🟡 Medium` or `🔴 High` if urgency increases

### Adding Completion Notes

When marking a task as completed, add a completion note:

```markdown
### Completion Notes
- Completed on [date]
- [Brief notes on implementation]
- [Any challenges encountered]
- [Validation performed]
```

## Step 4: Add New Tasks

For newly identified issues, add new tasks following the comprehensive format.

### Task ID Assignment

- Continue from the last used task ID
- Use sequential IDs: TASK-XXX, TASK-XXX+1, etc.
- Subtask IDs: TASK-XXX-01, TASK-XXX-02, TASK-XXX-03 (double digits)

### Task Template

```markdown
## [TASK-XXX] [Task Title]

[ ] 🟡 Pending | 🔴 High

### Subtasks
- [ ] [TASK-XXX-01] [Subtask description] - `path/to/file`
- [ ] [TASK-XXX-02] [Subtask description] - `path/to/file`
- [ ] [TASK-XXX-03] [Subtask description]

### Priority / Urgency
[Explain why this task is important and urgent]

### Research / Investigation
[Required research or investigation steps, or "None required"]

### Related Files
- `src/components/Example.astro`
- `src/pages/example.astro`
- `data/metrics.json`

### Definition of Done
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

### Acceptance Criteria
- [ ] Criterion 1 (derived from Definition of Done)
- [ ] Criterion 2 (derived from Definition of Done)
- [ ] Criterion 3 (derived from Definition of Done)

### Out of Scope
- Item not included
- Another item not included

### Dependencies
- TASK-XXX (if applicable)
- None (if no dependencies)

### Estimated Effort
[Time estimate, e.g., "2-3 hours"]

### Testing Requirements
- Unit tests: [specific tests needed]
- Integration tests: [specific tests needed]
- Coverage expectations: [e.g., "80% coverage"]

### Validation Steps
1. [Explicit step to validate]
2. [Explicit step to validate]
3. [Explicit step to validate]

### Strict Rules
1. Rule 1
2. Rule 2
3. Rule 3

### Existing Code Patterns
- Pattern 1: Description
- Pattern 2: Description

### Advanced Code Patterns
- Pattern 1: Description with example
- Pattern 2: Description with example

### Anti-Patterns
- Anti-pattern 1: Why to avoid
- Anti-pattern 2: Why to avoid
```

## Step 5: Modify Existing Tasks

For tasks that need adjustments (not status changes), update the relevant sections.

### Common Modifications

- Add/remove subtasks
- Update related files list
- Update any of the 14 required sections
- Refine definition of done
- Expand out of scope
- Add new strict rules
- Update code patterns
- Add new anti-patterns

### Modification Guidelines

- Preserve the task ID
- Update the status and priority if work has progressed
- Add modification notes if significant changes
- Ensure all 14 sections remain in correct order

## Step 6: Reorder Tasks

If priorities have changed, reorder tasks within TODO.md.

### Reordering Guidelines

- Keep task IDs unchanged (don't renumber)
- Move tasks to reflect new priority order
- Document dependencies between tasks
- Place blocked tasks after their dependencies
- Group related tasks together

## Step 7: Archive Completed Tasks

For tasks that are completed and validated, consider archiving them.

### Archiving Options

1. Keep in TODO.md with `🟢 Completed` status
2. Move to a separate `COMPLETED.md` file
3. Add completion notes and keep for reference

### When to Archive

- Task is completed and validated
- No ongoing dependencies on the task
- Task is not part of current sprint/focus

## Step 8: Review and Validate

Review the updated TODO.md for completeness and correctness.

### Validation Checklist

- [ ] All new tasks have unique IDs
- [ ] All tasks have status indicators with emoji
- [ ] All tasks have priority indicators with emoji
- [ ] All tasks have subtasks with double-digit IDs
- [ ] All subtasks have related IDs
- [ ] All tasks have all 14 required sections in correct order
- [ ] Priority / Urgency section is present
- [ ] Research / Investigation section is present (or "None required")
- [ ] Related Files section is present
- [ ] Definition of Done section is present
- [ ] Acceptance Criteria section is present
- [ ] Out of Scope section is present
- [ ] Dependencies section is present (or "None")
- [ ] Estimated Effort section is present
- [ ] Testing Requirements section is present
- [ ] Validation Steps section is present
- [ ] Strict Rules section is present
- [ ] Existing Code Patterns section is present (or N/A for non-code tasks)
- [ ] Advanced Code Patterns section is present (or N/A for non-code tasks)
- [ ] Anti-Patterns section is present (or N/A for non-code tasks)
- [ ] Task IDs are sequential
- [ ] No duplicate task IDs
- [ ] Status updates are accurate
- [ ] Priority updates are accurate
- [ ] Completion notes added for completed tasks
- [ ] Tasks are ordered by priority/dependencies

## Step 9: Commit TODO.md

Commit the updated TODO.md to version control.

```bash
git add TODO.md
git commit -m "docs: update TODO.md with task changes

- Added [number] new tasks
- Updated [number] task statuses
- Updated [number] task priorities
- Modified [number] existing tasks
- Archived [number] completed tasks
- Tasks ordered by current priority and dependencies"
```

## Example Status Update

```markdown
## [TASK-001] Fix Accessibility Violations on Homepage

[x] 🟢 Completed | 🔴 High

### Subtasks
- [x] [TASK-001-01] Add skip to content link - `src/layouts/BaseLayout.astro`
- [x] [TASK-001-02] Fix touch target sizes - `src/components/Button.astro`
- [x] [TASK-001-03] Add ARIA labels to icon buttons - `src/components/Navigation.astro`
- [x] [TASK-001-04] Verify color contrast ratios - `src/styles/global.css`

### Priority / Urgency
Accessibility is critical for WCAG 2.2 AA compliance and affects all users. axe-core violations must be resolved to ensure the site is accessible to users with disabilities.

### Research / Investigation
None required - violations already identified by axe-core.

### Related Files
- `src/layouts/BaseLayout.astro`
- `src/components/Button.astro`
- `src/components/Navigation.astro`
- `src/styles/global.css`

### Definition of Done
- [x] All axe-core violations resolved
- [x] `npm run test:a11y` passes with zero violations
- [x] Manual keyboard navigation test passes
- [x] Screen reader test passes

### Acceptance Criteria
- [x] All axe-core violations are resolved
- [x] Accessibility test suite passes with zero violations
- [x] Keyboard navigation works without mouse
- [x] Screen reader can navigate and announce content correctly

### Out of Scope
- Accessibility fixes on other pages (separate tasks)
- Adding new accessibility features beyond violations
- Changing design for accessibility (unless required)

### Dependencies
None

### Estimated Effort
2-3 hours

### Testing Requirements
- E2E accessibility tests with Playwright + axe-core
- Manual keyboard navigation testing
- Screen reader testing (NVDA or JAWS)
- Coverage: 100% of identified violations addressed

### Validation Steps
1. Run `npm run test:a11y` and verify zero violations
2. Manually navigate site using only keyboard (Tab, Enter, Escape)
3. Test with screen reader (NVDA or JAWS) to verify announcements
4. Verify touch targets are ≥44x44px using browser dev tools
5. Check color contrast ratios using axe-core or contrast checker

### Strict Rules
1. Follow WCAG 2.2 AA guidelines
2. Test with keyboard navigation only
3. Test with screen reader (NVDA or JAWS)
4. Do not remove functionality to fix violations
5. Use semantic HTML over ARIA when possible

### Existing Code Patterns
- Use semantic HTML elements (`<header>`, `<nav>`, `<main>`, `<footer>`)
- Use Tailwind utility classes for styling
- Use `aria-label` for icon-only buttons
- Use `loading="eager"` and `fetchpriority="high"` for LCP images

### Advanced Code Patterns
- Use `@custom-variant dark (&:where(.dark, .dark *))` for dark mode
- Use `scroll-padding-top: 80px` on `:root` for focus management
- Use `OptimizedImage` component for all images
- Use `getCollection()` from Content Layer API

### Anti-Patterns
- Using `<div>` when semantic elements exist
- Adding ARIA when semantic HTML works
- Using `waitForTimeout()` in tests
- Hardcoding metric values instead of importing from `/data/metrics.json`
- Placing images in `/public/` instead of `/src/assets/`

### Completion Notes
- Completed on April 22, 2026
- All 4 axe-core violations resolved
- Skip to content link added as first focusable element
- Touch targets increased to minimum 44x44px
- ARIA labels added to all icon-only buttons
- Color contrast verified with axe-core (all ratios ≥4.5:1)
- `npm run test:a11y` passes with zero violations
- Manual keyboard navigation test passed
- Screen reader test passed with NVDA
```

## Example New Task Addition

```markdown
## [TASK-015] Implement Dark Mode Toggle

[ ] 🟡 Pending | 🟡 Medium

### Subtasks
- [ ] [TASK-015-01] Create ThemeToggle component - `src/components/ThemeToggle.astro`
- [ ] [TASK-015-02] Add theme context provider - `src/context/ThemeContext.ts`
- [ ] [TASK-015-03] Implement theme persistence in localStorage - `src/utils/theme.ts`
- [ ] [TASK-015-04] Add dark mode class to html element - `src/layouts/BaseLayout.astro`
- [ ] [TASK-015-05] Test theme switching across pages - `tests/e2e/theme.spec.ts`

### Priority / Urgency
Dark mode is a common user expectation and improves UX in low-light environments. While not critical for accessibility compliance, it enhances the user experience and demonstrates attention to modern web standards.

### Research / Investigation
- Review Tailwind v4 dark mode documentation
- Investigate system preference detection APIs
- Research localStorage persistence patterns

### Related Files
- `src/components/ThemeToggle.astro`
- `src/context/ThemeContext.ts`
- `src/utils/theme.ts`
- `src/layouts/BaseLayout.astro`
- `tests/e2e/theme.spec.ts`

### Definition of Done
- [ ] Theme toggle component created and functional
- [ ] Theme persists across page reloads
- [ ] System preference detection works
- [ ] Dark mode styling works for all components
- [ ] E2E tests for theme switching pass
- [ ] Accessibility test passes (keyboard navigation, ARIA labels)

### Acceptance Criteria
- [ ] Theme toggle button is visible and accessible
- [ ] Theme state persists after page refresh
- [ ] System preference is detected and respected by default
- [ ] All components render correctly in both light and dark modes
- [ ] Theme switching is smooth and visually consistent
- [ ] Keyboard navigation works for theme toggle
- [ ] ARIA labels announce theme state correctly

### Out of Scope
- Custom theme colors beyond light/dark
- Theme transitions/animations (unless simple)
- Theme preferences stored in backend
- Theme customization for users

### Dependencies
- TASK-001 (accessibility fixes should be completed first)

### Estimated Effort
4-6 hours

### Testing Requirements
- Unit tests for theme utility functions
- E2E tests for theme switching across pages
- Accessibility tests for theme toggle component
- Manual testing with system preference changes
- Coverage: 80% for theme-related code

### Validation Steps
1. Test theme toggle button click switches themes
2. Refresh page and verify theme persists
3. Change system preference and verify detection
4. Navigate to different pages and verify theme consistency
5. Test keyboard navigation (Tab, Enter, Escape)
6. Test with screen reader to verify ARIA announcements
7. Verify color contrast in both themes

### Strict Rules
1. Use Tailwind v4 dark mode: `@custom-variant dark (&:where(.dark, .dark *))`
2. Add `class="dark"` to `<html>` element for dark mode
3. Use localStorage for theme persistence
4. Respect system preference by default
5. Ensure theme toggle is keyboard accessible
6. Add ARIA labels to theme toggle button

### Existing Code Patterns
- Use Tailwind utility classes for styling
- Use `aria-label` for icon-only buttons
- Use `localStorage` for client-side persistence
- Use `class="dark"` on html element (per Tailwind v4 standards)

### Advanced Code Patterns
- Use `@custom-variant dark (&:where(.dark, .dark *))` in CSS
- Use `window.matchMedia('(prefers-color-scheme: dark)')` for system preference
- Use React Context or Astro state for theme management
- Use CSS transitions for smooth theme switching

### Anti-Patterns
- Using JavaScript-only theme detection (no CSS fallback)
- Forgetting to add `class="dark"` to html element
- Not persisting theme preference
- Breaking accessibility in dark mode (contrast issues)
- Using separate CSS files for themes (use Tailwind dark mode)
```

## Notes

- Keep task IDs sequential and unique
- Update task statuses and priorities as work progresses
- Add completion notes when marking tasks complete
- Review and update TODO.md regularly
- Break large new tasks into smaller, focused tasks
- Document dependencies between tasks
- Archive completed tasks to keep TODO.md manageable
- For non-code tasks, mark Code Patterns and Anti-Patterns as N/A
- Ensure all 14 sections are present and in correct order

## Error Handling

If you encounter issues:

1. Verify all tasks follow the comprehensive format
2. Ensure all task IDs are unique and sequential
3. Check that subtask IDs relate to parent task IDs with double digits
4. Validate that all 14 required sections are present
5. Ensure file paths are accurate
6. Review task scope - break down if too large
7. Verify status and priority updates are accurate
8. Check for duplicate tasks or IDs
9. Verify status and priority indicators use correct emojis
10. Check that Research / Investigation is "None required" if not applicable
