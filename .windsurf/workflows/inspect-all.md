---
description: Run all inspection workflows to comprehensively analyze codebase for security, code quality, architecture, performance, accessibility, and content issues
---

# Comprehensive Inspection Workflow

This workflow runs all inspection workflows to provide a comprehensive analysis of the codebase for security, code quality, architecture, performance, accessibility, and content issues.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed
- All individual inspection workflows available

## Step 1: Repository Impact Mapping

Before inspecting, analyze the codebase structure:

### Impact Map Structure
```markdown
# Repository Impact Map: Comprehensive Inspection

## All Inspection Areas
- Security vulnerabilities and unsafe patterns
- Code quality (dead code, smells, TypeScript violations)
- Architecture (circular dependencies, boundary violations)
- Performance (bundle size, Core Web Vitals, optimization)
- Accessibility (WCAG 2.2 AA compliance)
- Content (broken links, schema validation, orphaned files)

## Execution Order
1. Security (highest priority)
2. Code Quality
3. Architecture
4. Performance
5. Accessibility
6. Content
```

## Step 2: Security Inspection

Run security inspection workflow:

```bash
# Invoke security inspection
/inspect-security
```

### Expected Output
- CSP configuration status
- Security headers verification
- Unsafe pattern detection
- Dependency vulnerabilities
- Hardcoded secrets check
- TypeScript type safety issues

### Document Findings
- Critical security issues
- High priority security issues
- Medium priority security issues
- Low priority security issues

## Step 3: Code Quality Inspection

Run code quality inspection workflow:

```bash
# Invoke code quality inspection
/inspect-code-quality
```

### Expected Output
- Dead code detection results
- Unused imports/exports
- Code smells identified
- TypeScript violations
- Console.log statements
- Component quality issues

### Document Findings
- Critical code quality issues
- High priority code quality issues
- Medium priority code quality issues
- Low priority code quality issues

## Step 4: Architecture Inspection

Run architecture inspection workflow:

```bash
# Invoke architecture inspection
/inspect-architecture
```

### Expected Output
- Circular dependencies
- Boundary violations
- Component coupling analysis
- God component detection
- Utility function architecture
- Separation of concerns

### Document Findings
- Critical architecture issues
- High priority architecture issues
- Medium priority architecture issues
- Low priority architecture issues

## Step 5: Performance Inspection

Run performance inspection workflow:

```bash
# Invoke performance inspection
/inspect-performance
```

### Expected Output
- Bundle size analysis
- Image optimization check
- Core Web Vitals (LCP, INP, CLS)
- Asset loading strategies
- CSS/JavaScript optimization
- Unused asset detection

### Document Findings
- Critical performance issues
- High priority performance issues
- Medium priority performance issues
- Low priority performance issues

## Step 6: Accessibility Inspection

Run accessibility inspection workflow:

```bash
# Invoke accessibility inspection
/inspect-accessibility
```

### Expected Output
- WCAG 2.2 AA violations (axe-core)
- Skip to content link check
- Touch target verification
- Focus management check
- ARIA label verification
- Color contrast analysis
- Keyboard navigation test

### Document Findings
- Critical accessibility issues
- High priority accessibility issues
- Medium priority accessibility issues
- Low priority accessibility issues

## Step 7: Content Inspection

Run content inspection workflow:

```bash
# Invoke content inspection
/inspect-content
```

### Expected Output
- Content schema validation
- Broken link detection
- Image reference check
- Metric reference verification
- Orphaned content detection
- Content consistency check
- SEO verification

### Document Findings
- Critical content issues
- High priority content issues
- Medium priority content issues
- Low priority content issues

## Step 8: Aggregate Findings

Compile all findings into a comprehensive report:

### Report Structure
```markdown
# Comprehensive Codebase Inspection Report

## Executive Summary
- Total critical issues: [number]
- Total high priority issues: [number]
- Total medium priority issues: [number]
- Total low priority issues: [number]

## Security Issues
### Critical
- [List critical security issues]

### High Priority
- [List high priority security issues]

### Medium Priority
- [List medium priority security issues]

### Low Priority
- [List low priority security issues]

## Code Quality Issues
### Critical
- [List critical code quality issues]

### High Priority
- [List high priority code quality issues]

### Medium Priority
- [List medium priority code quality issues]

### Low Priority
- [List low priority code quality issues]

## Architecture Issues
### Critical
- [List critical architecture issues]

### High Priority
- [List high priority architecture issues]

### Medium Priority
- [List medium priority architecture issues]

### Low Priority
- [List low priority architecture issues]

## Performance Issues
### Critical
- [List critical performance issues]

### High Priority
- [List high priority performance issues]

### Medium Priority
- [List medium priority performance issues]

### Low Priority
- [List low priority performance issues]

## Accessibility Issues
### Critical
- [List critical accessibility issues]

### High Priority
- [List high priority accessibility issues]

### Medium Priority
- [List medium priority accessibility issues]

### Low Priority
- [List low priority accessibility issues]

## Content Issues
### Critical
- [List critical content issues]

### High Priority
- [List high priority content issues]

### Medium Priority
- [List medium priority content issues]

### Low Priority
- [List low priority content issues]

## Priority Recommendations
1. [Most critical recommendation]
2. [Second most critical recommendation]
3. [Other high-priority recommendations]

## Next Steps
- [Immediate actions]
- [Short-term improvements]
- [Long-term improvements]
```

## Step 9: Generate Action Plan

Create a prioritized action plan:

### Immediate Actions (This Week)
- Fix all critical security issues
- Fix all critical accessibility issues
- Fix any blocking build/deploy issues

### Short-term Actions (This Month)
- Address high priority issues across all categories
- Implement automated checks for recurring issues
- Update documentation with findings

### Long-term Actions (This Quarter)
- Address medium priority issues
- Refactor god components
- Improve test coverage
- Optimize performance

## Step 10: Create TODO.md Tasks from Findings

Convert the inspection findings into TODO.md tasks using the comprehensive task format. This ensures issues are systematically addressed.

### Task Creation Process

For each critical and high-priority issue identified in the comprehensive report, create a TODO.md task following the format defined in create-todo.md:

1. **Assign Task ID**: Use the next available TASK-[###] format
2. **Set Priority**: Based on severity (🔴 Critical = High, 🟡 High = High, 🟢 Medium = Medium)
3. **Set Status**: 🟡 Pending
4. **Populate All 14 Required Sections**:
   - Priority / Urgency
   - Research / Investigation (if additional research needed)
   - Related Files (affected files from inspection)
   - Definition of Done
   - Acceptance Criteria (bulleted list)
   - Out of Scope
   - Dependencies
   - Estimated Effort
   - Testing Requirements
   - Validation Steps (specific to the issue)
   - Strict Rules (from AGENTS.md or project-specific)
   - Existing Code Patterns
   - Advanced Code Patterns
   - Anti-Patterns (what to avoid)

### Example Task Template

```markdown
- [ ] 🔴 High 🟡 Pending TASK-[###]: [Issue Title]

  **Priority / Urgency**
  Critical - [specific urgency reason]

  **Research / Investigation**
  None required (or specific investigation needed)

  **Related Files**
  - [file path]
  - [file path]

  **Definition of Done**
  [Clear definition of when the issue is resolved]

  **Acceptance Criteria**
  - [criteria 1]
  - [criteria 2]

  **Out of Scope**
  [What is not included in this task]

  **Dependencies**
  None (or list dependencies)

  **Estimated Effort**
  [time estimate]

  **Testing Requirements**
  - [specific tests needed]

  **Validation Steps**
  - [step 1]
  - [step 2]

  **Strict Rules**
  - [rule from AGENTS.md]
  - [project-specific rule]

  **Existing Code Patterns**
  - [pattern to follow]

  **Advanced Code Patterns**
  N/A (or advanced patterns to use)

  **Anti-Patterns**
  - [what to avoid]

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
git commit -m "chore: add TODO.md tasks from comprehensive inspection

- Added [number] tasks for critical/high-priority issues
- Security: [number] tasks
- Code Quality: [number] tasks
- Architecture: [number] tasks
- Performance: [number] tasks
- Accessibility: [number] tasks
- Content: [number] tasks

Generated from /inspect-all workflow"
```

## Notes

- This workflow runs all individual inspection workflows
- Results are aggregated into a comprehensive report
- Prioritize critical and high priority issues first
- Document all findings for future reference
- Review AGENTS.md for project-specific guidelines

## Error Handling

If an individual workflow fails:
1. Document which workflow failed
2. Review the specific error message
3. Continue with remaining workflows
4. Note the failure in the final report
5. Retry the failed workflow after fixing the issue

## Integration with CI/CD

Consider integrating this workflow into CI/CD:
- Run on a schedule (e.g., weekly)
- Run before major releases
- Run after significant changes
- Track metrics over time
