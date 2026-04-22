---
description: Create TODO.md with structured task list following the 10-rule format for task organization
---

# Create TODO.md Workflow

This workflow guides you through creating a TODO.md file with a structured task list based on codebase assessment, following the 10-rule format for task organization.

## Prerequisites

- Codebase assessment completed
- Issues and improvements identified
- Repository root accessible for TODO.md creation

## Step 1: Assess Codebase and Identify Issues

Before creating the TODO.md, assess the codebase to identify tasks/issues.

### Assessment Areas
- Code quality issues
- Missing features
- Technical debt
- Performance improvements
- Security vulnerabilities
- Accessibility issues
- Documentation gaps
- Testing coverage

### Output Required
- List of discovered issues
- Severity/priority for each issue
- Dependencies between issues

## Step 2: Create TODO.md Structure

Create TODO.md in the repository root with the following structure:

```markdown
# TODO

Master task list for the Trevor Lam portfolio project.

## Task Format

Each task follows the 10-rule format:
- Small, focused scope
- Checkbox for completion
- Status indicator
- Unique task ID
- Subtasks with related IDs
- Related files section
- Definition of done
- Out of scope
- Strict rules to follow
- Existing code patterns
- Advanced code patterns
- Anti-patterns
```

## Step 3: Create Parent Tasks

For each identified issue, create a parent task following these rules:

### Rule 1: Small Scope
Each parent task should be SMALL in size. Break large tasks into multiple smaller, focused tasks.

### Rule 2: Checkbox and Status
Each parent task should have:
- Empty checkbox: `[ ]`
- Status indicator: `[pending]`, `[in-progress]`, `[completed]`, `[blocked]`
- Unique task ID: `TASK-001`, `TASK-002`, etc.

### Rule 3: Subtasks
Each parent task should have a list of subtasks with:
- Empty checkbox: `[ ]`
- Unique task ID related to parent: `TASK-001-1`, `TASK-001-2`, etc.
- Targeted file path (if applicable): `src/components/Header.astro`

### Rule 4: Related Files Section
List all files that will be touched or affected by this task.

### Rule 5: Definition of Done
Well-defined and well-reasoned criteria for when the task is complete.

### Rule 6: Out of Scope
Well-defined and well-reasoned boundaries of what this task will NOT do.

### Rule 7: Strict Rules to Follow
Specific rules that must be followed during implementation.

### Rule 8: Existing Code Patterns
Document existing patterns in the codebase that should be followed.

### Rule 9: Advanced Code Patterns
Advanced patterns or best practices that should be applied.

### Rule 10: Anti-Patterns
Patterns and approaches to avoid.

## Step 4: Task Template

Use this template for each parent task:

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

## Step 5: Populate TODO.md with Tasks

Using the template, populate TODO.md with all identified tasks.

### Task Breakdown Guidelines
- Break large tasks into smaller, focused tasks
- Each task should be completable in 1-2 hours
- Tasks should have clear dependencies
- Order tasks by priority and dependencies

### Task ID Assignment
- Use sequential IDs: TASK-001, TASK-002, TASK-003
- Subtask IDs: TASK-001-1, TASK-001-2, TASK-001-3
- Maintain sequential order through the document

### Status Indicators
- `[pending]` - Not started
- `[in-progress]` - Currently being worked on
- `[completed]` - Finished and validated
- `[blocked]` - Blocked by dependency or external factor

## Step 6: Review and Validate

Review the created TODO.md for completeness and correctness.

### Validation Checklist
- [ ] All tasks have unique IDs
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
- [ ] Tasks are ordered by priority/dependencies
- [ ] Task scopes are small and focused

## Step 7: Commit TODO.md

Commit the created TODO.md to version control.

```bash
git add TODO.md
git commit -m "docs: add structured TODO.md with task breakdown

- Added [number] tasks following 10-rule format
- Each task includes subtasks, related files, and patterns
- Tasks ordered by priority and dependencies"
```

## Example Task

```markdown
## [TASK-001] Fix Accessibility Violations on Homepage

**Status**: [pending]

### Description
Fix WCAG 2.2 AA accessibility violations identified by axe-core on the homepage.

### Subtasks
- [ ] [TASK-001-1] Add skip to content link - `src/layouts/BaseLayout.astro`
- [ ] [TASK-001-2] Fix touch target sizes - `src/components/Button.astro`
- [ ] [TASK-001-3] Add ARIA labels to icon buttons - `src/components/Navigation.astro`
- [ ] [TASK-001-4] Verify color contrast ratios - `src/styles/global.css`

### Related Files
- `src/layouts/BaseLayout.astro`
- `src/components/Button.astro`
- `src/components/Navigation.astro`
- `src/styles/global.css`

### Definition of Done
- [ ] All axe-core violations resolved
- [ ] `npm run test:a11y` passes with zero violations
- [ ] Manual keyboard navigation test passes
- [ ] Screen reader test passes

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
```

## Notes

- Keep tasks small and focused (1-2 hours each)
- Break large tasks into multiple parent tasks
- Document dependencies between tasks
- Update task status as work progresses
- Add completion notes when marking tasks complete
- Review and update TODO.md regularly

## Error Handling

If you encounter issues:
1. Verify all tasks follow the 10-rule format
2. Ensure all task IDs are unique
3. Check that subtask IDs relate to parent task IDs
4. Validate that all required sections are present
5. Ensure file paths are accurate
6. Review task scope - break down if too large
