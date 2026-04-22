---
description: Update TODO.md with new tasks, status changes, and task modifications following the 10-rule format
---

# Update TODO.md Workflow

This workflow guides you through updating an existing TODO.md file with new tasks, status changes, and task modifications based on codebase assessment, following the 10-rule format for task organization.

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
- Add completion notes to completed tasks
- Modify task descriptions or subtasks
- Add/remove related files
- Update definition of done or out of scope
- Reorder tasks by changing priorities
- Archive or remove completed/obsolete tasks

### Output Required
- List of new tasks to add
- List of tasks to update with status changes
- List of tasks to modify
- List of tasks to archive/remove

## Step 3: Update Task Statuses

For tasks that have progressed, update their status indicators.

### Status Transitions
- `[pending]` → `[in-progress]` when work begins
- `[in-progress]` → `[completed]` when work finishes
- `[pending]` → `[blocked]` when blocked by dependency
- `[blocked]` → `[pending]` when block is resolved

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

For newly identified issues, add new tasks following the 10-rule format.

### Task ID Assignment
- Continue from the last used task ID
- Use sequential IDs: TASK-XXX, TASK-XXX+1, etc.
- Subtask IDs: TASK-XXX-1, TASK-XXX-2, TASK-XXX-3

### Task Template

```markdown
## [TASK-XXX] [Task Title]

**Status**: [pending|in-progress|completed|blocked]

### Description
[Brief description of the task]

### Subtasks
- [ ] [TASK-XXX-1] [Subtask description] - `path/to/file`
- [ ] [TASK-XXX-2] [Subtask description] - `path/to/file`
- [ ] [TASK-XXX-3] [Subtask description]

### Related Files
- `src/components/Example.astro`
- `src/pages/example.astro`
- `data/metrics.json`

### Definition of Done
- [ ] Criteria 1
- [ ] Criteria 2
- [ ] Criteria 3

### Out of Scope
- Item not included
- Another item not included

### Strict Rules to Follow
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
- Refine definition of done
- Expand out of scope
- Add new strict rules
- Update code patterns
- Add new anti-patterns

### Modification Guidelines
- Preserve the task ID
- Update the status if work has progressed
- Add modification notes if significant changes

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
1. Keep in TODO.md with `[completed]` status
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
- [ ] All tasks have status indicators
- [ ] All tasks have subtasks
- [ ] All subtasks have related IDs
- [ ] All tasks have related files section
- [ ] All tasks have definition of done
- [ ] All tasks have out of scope
- [ ] All tasks have strict rules to follow
- [ ] All tasks have existing code patterns
- [ ] All tasks have advanced code patterns
- [ ] All tasks have anti-patterns
- [ ] Task IDs are sequential
- [ ] No duplicate task IDs
- [ ] Status updates are accurate
- [ ] Completion notes added for completed tasks
- [ ] Tasks are ordered by priority/dependencies

## Step 9: Commit TODO.md

Commit the updated TODO.md to version control.

```bash
git add TODO.md
git commit -m "docs: update TODO.md with task changes

- Added [number] new tasks
- Updated [number] task statuses
- Modified [number] existing tasks
- Archived [number] completed tasks
- Tasks ordered by current priority and dependencies"
```

## Example Status Update

```markdown
## [TASK-001] Fix Accessibility Violations on Homepage

**Status**: [completed]

### Description
Fix WCAG 2.2 AA accessibility violations identified by axe-core on the homepage.

### Subtasks
- [x] [TASK-001-1] Add skip to content link - `src/layouts/BaseLayout.astro`
- [x] [TASK-001-2] Fix touch target sizes - `src/components/Button.astro`
- [x] [TASK-001-3] Add ARIA labels to icon buttons - `src/components/Navigation.astro`
- [x] [TASK-001-4] Verify color contrast ratios - `src/styles/global.css`

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

### Out of Scope
- Accessibility fixes on other pages (separate tasks)
- Adding new accessibility features beyond violations
- Changing design for accessibility (unless required)

### Strict Rules to Follow
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

**Status**: [pending]

### Description
Add a dark mode toggle component that allows users to switch between light and dark themes, with system preference detection and persistence.

### Subtasks
- [ ] [TASK-015-1] Create ThemeToggle component - `src/components/ThemeToggle.astro`
- [ ] [TASK-015-2] Add theme context provider - `src/context/ThemeContext.ts`
- [ ] [TASK-015-3] Implement theme persistence in localStorage - `src/utils/theme.ts`
- [ ] [TASK-015-4] Add dark mode class to html element - `src/layouts/BaseLayout.astro`
- [ ] [TASK-015-5] Test theme switching across pages - `tests/e2e/theme.spec.ts`

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

### Out of Scope
- Custom theme colors beyond light/dark
- Theme transitions/animations (unless simple)
- Theme preferences stored in backend
- Theme customization for users

### Strict Rules to Follow
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
- Update task statuses as work progresses
- Add completion notes when marking tasks complete
- Review and update TODO.md regularly
- Break large new tasks into smaller, focused tasks
- Document dependencies between tasks
- Archive completed tasks to keep TODO.md manageable

## Error Handling

If you encounter issues:
1. Verify all new tasks follow the 10-rule format
2. Ensure all task IDs are unique and sequential
3. Check that subtask IDs relate to parent task IDs
4. Validate that all required sections are present
5. Ensure file paths are accurate
6. Review task scope - break down if too large
7. Verify status updates are accurate
8. Check for duplicate tasks or IDs
