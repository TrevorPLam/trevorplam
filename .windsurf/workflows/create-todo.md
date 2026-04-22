---
description: Create TODO.md with structured task list following the comprehensive task format
---

# Create TODO.md Workflow

This workflow guides you through creating a TODO.md file with a structured task list based on codebase assessment, following the comprehensive task format with detailed sections.

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

## Step 1.5: Targeted Online Research (Current as of 04/2026)

Inform your understanding with external best practices before creating tasks. This ensures tasks are informed by current best practices and modern patterns.

### Task-Specific Research
Conduct up-to-date research specifically on the topics and technologies involved in the identified issues.

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

## Step 2: Create TODO.md Structure

Create TODO.md in the repository root with the following structure:

```markdown
# TODO

Master task list for the Trevor Lam portfolio project.

## Task Format

Each task follows the comprehensive format:
- Small, focused scope
- Checkbox for completion
- Status indicator with emoji
- Priority indicator with emoji
- Unique task ID
- Subtasks with double-digit related IDs
- Priority / Urgency section
- Research / Investigation section
- Related Files section
- Definition of Done section
- Acceptance Criteria section
- Out of Scope section
- Dependencies section
- Estimated Effort section
- Testing Requirements section
- Validation Steps section
- Strict Rules section
- Existing Code Patterns section
- Advanced Code Patterns section
- Anti-Patterns section
```

## Step 3: Create Parent Tasks

For each identified issue, create a parent task following these rules:

### Rule 1: Small Scope
Each parent task should be SMALL in size. Break large tasks into multiple smaller, focused tasks.

### Rule 2: Checkbox, Status, and Priority
Each parent task should have:
- Empty checkbox: `[ ]`
- Status indicator with emoji: `🟡 Pending`, `🔵 In Progress`, `🟢 Completed`, `🔴 Blocked`
- Priority indicator with emoji: `🔴 High`, `🟡 Medium`, `🟢 Low`
- Unique task ID: `TASK-001`, `TASK-002`, etc.

### Rule 3: Subtasks
Each parent task should have a list of subtasks with:
- Empty checkbox: `[ ]`
- Unique task ID related to parent with double digits: `TASK-001-01`, `TASK-001-02`, etc.
- Targeted file path (if applicable): `src/components/Header.astro`

### Rule 4: Required Sections (in order)
Each parent task must include these sections in this exact order:
1. **Priority / Urgency**
2. **Research / Investigation** (state "None required" if none)
3. **Related Files**
4. **Definition of Done**
5. **Acceptance Criteria** (bulleted list, can be derived from Definition of Done)
6. **Out of Scope**
7. **Dependencies** (or "None")
8. **Estimated Effort**
9. **Testing Requirements** (e.g., unit/integration tests, coverage expectations)
10. **Validation Steps** (explicit steps to manually/automatically confirm completion)
11. **Strict Rules**
12. **Existing Code Patterns**
13. **Advanced Code Patterns**
14. **Anti-Patterns**

### Rule 5: Non-Code Tasks
For tasks that do not involve code changes (e.g., updating config files), the **Code Patterns** and **Anti-Patterns** sections may be marked as **N/A**.

## Step 4: Task Template

Use this template for each parent task:

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

## Step 5: Populate TODO.md with Tasks

Using the template, populate TODO.md with all identified tasks.

### Task Breakdown Guidelines

- Break large tasks into smaller, focused tasks
- Each task should be completable in 1-2 hours
- Tasks should have clear dependencies
- Order tasks by priority and dependencies

### Task ID Assignment

- Use sequential IDs: TASK-001, TASK-002, TASK-003
- Subtask IDs: TASK-001-01, TASK-001-02, TASK-001-03 (double digits)
- Maintain sequential order through the document

### Status Indicators

- `🟡 Pending` - Not started
- `🔵 In Progress` - Currently being worked on
- `🟢 Completed` - Finished and validated
- `🔴 Blocked` - Blocked by dependency or external factor

### Priority Indicators

- `🔴 High` - Critical, must be done soon
- `🟡 Medium` - Important, but can wait
- `🟢 Low` - Nice to have, can defer

## Step 6: Review and Validate

Review the created TODO.md for completeness and correctness.

### Validation Checklist

- [ ] All tasks have unique IDs
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
- [ ] Tasks are ordered by priority/dependencies
- [ ] Task scopes are small and focused

## Step 7: Commit TODO.md

Commit the created TODO.md to version control.

```bash
git add TODO.md
git commit -m "docs: add structured TODO.md with task breakdown

- Added [number] tasks following comprehensive format
- Each task includes 14 sections with detailed information
- Tasks ordered by priority and dependencies"
```

## Example Task

```markdown
## [TASK-001] Fix Accessibility Violations on Homepage

[ ] 🟡 Pending | 🔴 High

### Subtasks
- [ ] [TASK-001-01] Add skip to content link - `src/layouts/BaseLayout.astro`
- [ ] [TASK-001-02] Fix touch target sizes - `src/components/Button.astro`
- [ ] [TASK-001-03] Add ARIA labels to icon buttons - `src/components/Navigation.astro`
- [ ] [TASK-001-04] Verify color contrast ratios - `src/styles/global.css`

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
- [ ] All axe-core violations resolved
- [ ] `npm run test:a11y` passes with zero violations
- [ ] Manual keyboard navigation test passes
- [ ] Screen reader test passes

### Acceptance Criteria
- [ ] All axe-core violations are resolved
- [ ] Accessibility test suite passes with zero violations
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader can navigate and announce content correctly

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

## Notes

- Keep tasks small and focused (1-2 hours each)
- Break large tasks into multiple parent tasks
- Document dependencies between tasks
- Update task status as work progresses
- Add completion notes when marking tasks complete
- Review and update TODO.md regularly
- For non-code tasks, mark Code Patterns and Anti-Patterns as N/A
- Ensure all 14 sections are present and in correct order

## Error Handling

If you encounter issues:

1. Verify all tasks follow the comprehensive format
2. Ensure all task IDs are unique
3. Check that subtask IDs relate to parent task IDs with double digits
4. Validate that all 14 required sections are present
5. Ensure file paths are accurate
6. Review task scope - break down if too large
7. Verify status and priority indicators use correct emojis
8. Check that Research / Investigation is "None required" if not applicable
