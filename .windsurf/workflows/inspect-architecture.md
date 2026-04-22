---
description: Inspect codebase for architectural issues including circular dependencies, boundary violations, component coupling, and god components
---

# Architecture Inspection Workflow

This workflow guides the AI agent through comprehensive architecture inspection to identify circular dependencies, boundary violations, component coupling, and god components.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed
- Understanding of architectural patterns and principles

## Step 1: Repository Impact Mapping

Before inspecting, analyze the codebase structure and identify architectural focus areas:

### Impact Map Structure
```markdown
# Repository Impact Map: Architecture Inspection

## Module Boundaries
- src/components/ (UI components)
- src/pages/ (Route pages)
- src/utils/ (Utility functions)
- src/config/ (Configuration)
- src/content/ (Content collections)
- src/layouts/ (Layout components)

## Architectural Layers
- Presentation layer (components, pages)
- Business logic layer (utils, helpers)
- Data layer (content, config)
- Infrastructure layer (API routes, external integrations)

## Dependency Directions
- Pages should depend on components
- Components should depend on utils
- Utils should not depend on pages
- Content should be independent
```

## Step 2: Dependency Graph Analysis

Analyze the dependency structure of the codebase:

### Manual Dependency Mapping
- Create a dependency graph of major modules
- Identify import relationships between modules
- Map data flow through the application
- Document architectural layers

### Issues to Flag
- Circular dependencies between modules
- Dependencies that violate architectural boundaries
- Modules that depend on too many other modules (high coupling)
- Modules that are depended on by too many others (god modules)

## Step 3: Circular Dependency Detection

Search for circular dependencies:

### Check for Circular Imports
```bash
# Search for potential circular dependencies
# (This requires manual analysis or specialized tools)
```

### Manual Detection Method
1. Pick a module and trace its imports
2. For each import, trace its imports
3. Look for paths that lead back to the original module
4. Document any cycles found

### Issues to Flag
- Direct circular imports (A imports B, B imports A)
- Indirect circular dependencies (A → B → C → A)
- Cycles across architectural layers
- Cycles between components and pages

### Common Circular Dependency Patterns
- Component A imports Component B, Component B imports Component A
- Utility imports page, page imports utility
- Config imports component, component imports config

## Step 4: Boundary Violation Detection

Check for violations of architectural boundaries:

### Layer Violations
- Pages importing from other pages (should use components)
- Components importing from pages (should use shared components)
- Utils importing from components (should be independent)
- Content importing from src (should be pure data)

### Issues to Flag
- Presentation layer depending on infrastructure layer
- Business logic depending on presentation
- Data layer depending on business logic
- Cross-layer dependencies that bypass proper abstractions

## Step 5: Component Coupling Analysis

Analyze coupling between components:

### High Coupling Indicators
- Components that import many other components
- Components with deep prop drilling
- Components that know too much about other components' internals
- Components that directly manipulate other components' state

### Issues to Flag
- Components with >10 imports from other components
- Tight coupling between unrelated components
- Components that require specific implementation details of dependencies
- Lack of abstraction between components

## Step 6: God Component Detection

Identify god components (components doing too much):

### Large Component Files
```bash
# Find large component files
find src/components -name "*.astro" -exec wc -l {} + | sort -n
```

### God Component Indicators
- Components >300 lines
- Components with >10 props
- Components with >15 functions/methods
- Components that handle multiple unrelated concerns
- Components that know about too much of the application

### Issues to Flag
- DashboardWidgets.astro (9,309 bytes - potential god component)
- MetricsGrid.astro (5,462 bytes - review needed)
- Components that mix data fetching, rendering, and business logic
- Components that directly access global state

## Step 7: Utility Function Architecture

Inspect utility functions for architectural issues:

### Issues to Flag
- Utilities that depend on UI components
- Utilities that have side effects
- Utilities that are too specific (not reusable)
- Utilities that duplicate functionality
- Utilities without clear single responsibility

### Review Each Utility File
- chart-utils.ts - Should be pure chart utilities
- date.ts - Should be pure date manipulation
- error-monitoring.ts - Should be error handling logic
- formatters.ts - Should be pure formatting functions
- metrics.ts - Should be metric calculations
- rum-monitoring.ts - Should be RUM monitoring logic
- validators.ts - Should be validation logic

## Step 8: Content Architecture

Inspect content collection architecture:

### Issues to Flag
- Content that depends on implementation details
- Content with inconsistent structure
- Content that violates schema constraints
- Orphaned content files
- Content with circular references

### Check Content Collections
- caseStudies - Should be independent
- capabilities - Should be independent
- learningLogs - Should be independent
- projects - Should be independent
- resources - Should be independent
- skills - Should be independent

## Step 9: API Route Architecture

Inspect API routes for architectural issues:

### Issues to Flag
- API routes that depend on presentation layer
- API routes with business logic (should be in utils)
- API routes without proper error handling
- API routes that are too specific (not reusable)
- API routes that violate REST principles

### Check API Routes
- src/pages/api/generate-pdf.ts - Should be pure PDF generation logic

## Step 10: Configuration Architecture

Inspect configuration management:

### Issues to Flag
- Configuration scattered across files
- Hardcoded configuration values
- Configuration mixed with business logic
- Lack of environment-specific configuration
- Configuration without validation

### Check Config Files
- src/config/edge-config.ts
- src/config/navigation.ts

## Step 11: Separation of Concerns

Check for proper separation of concerns:

### Issues to Flag
- Components that fetch data (should use API routes or utils)
- Components that contain business logic (should use utils)
- Components that format data (should use formatters)
- Utils that contain presentation logic
- Pages that contain reusable components

## Step 12: Generate Architecture Report

Compile all findings into a comprehensive architecture report:

### Report Structure
```markdown
# Architecture Inspection Report

## Critical Issues
- Circular dependencies: [list with details]
- Boundary violations: [list with details]

## High Priority Issues
- God components: [list with details]
- High coupling: [list with details]

## Medium Priority Issues
- Separation of concerns: [list with details]
- Utility architecture: [list with details]

## Low Priority Issues
- Minor architectural improvements: [list]

## Dependency Graph
[Document the current dependency structure]

## Recommendations
1. [Priority recommendation 1]
2. [Priority recommendation 2]
3. [Other recommendations]
```

## Step 13: Create TODO.md Tasks from Findings

Convert the architecture inspection findings into TODO.md tasks using the comprehensive task format. This ensures architectural issues are systematically addressed.

### Task Creation Process

For each critical and high-priority architectural issue identified in the report, create a TODO.md task following the format defined in create-todo.md:

1. **Assign Task ID**: Use the next available TASK-[###] format
2. **Set Priority**: Based on severity (🔴 Critical = High, 🟡 High = High, 🟢 Medium = Medium)
3. **Set Status**: 🟡 Pending
4. **Populate All 14 Required Sections**:
   - Priority / Urgency
   - Research / Investigation (if architectural patterns need research)
   - Related Files (affected modules/components from inspection)
   - Definition of Done
   - Acceptance Criteria (bulleted list, include architectural principles)
   - Out of Scope
   - Dependencies
   - Estimated Effort
   - Testing Requirements (include regression tests for refactoring)
   - Validation Steps (specific to the architectural issue)
   - Strict Rules (from AGENTS.md architectural guidelines)
   - Existing Code Patterns
   - Advanced Code Patterns
   - Anti-Patterns (what to avoid)

### Example Task Template

```markdown
- [ ] 🔴 High 🟡 Pending TASK-[###]: [Architectural Issue Title]

  **Priority / Urgency**
  Critical - Circular dependency prevents proper module initialization

  **Research / Investigation**
  None required (or specific architectural pattern research needed)

  **Related Files**
  - [module path]
  - [dependent module path]

  **Definition of Done**
  Architectural issue resolved and dependency graph validated

  **Acceptance Criteria**
  - [architectural principle met]
  - [specific requirement]
  - Zero circular dependencies for this module
  - Dependency graph shows clean structure

  **Out of Scope**
  [What is not included in this task]

  **Dependencies**
  None (or list dependencies)

  **Estimated Effort**
  [time estimate]

  **Testing Requirements**
  - Regression tests for refactored code
  - Dependency validation tests
  - Integration tests

  **Validation Steps**
  - Manual dependency graph review
  - Verify no circular imports
  - Test module initialization

  **Strict Rules**
  - Utils should not depend on components
  - Pages should use shared components
  - Content should be independent

  **Existing Code Patterns**
  - [pattern to follow]

  **Advanced Code Patterns**
  N/A (or advanced architectural patterns)

  **Anti-Patterns**
  - Circular dependencies
  - Boundary violations
  - God components

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
git commit -m "chore: add TODO.md tasks from architecture inspection

- Added [number] tasks for critical/high-priority architectural issues
- Circular dependencies: [number] tasks
- Boundary violations: [number] tasks
- God components: [number] tasks
- High coupling: [number] tasks

Generated from /inspect-architecture workflow"
```

## Notes

- DashboardWidgets.astro is large (9,309 bytes) - review for god component patterns
- MetricsGrid.astro is also large (5,462 bytes) - may need refactoring
- Consider using dependency analysis tools like madge for automated detection
- Focus on high-impact architectural issues first
- Review AGENTS.md for architectural guidelines

## Error Handling

If inspection fails:
1. Review the specific error message
2. Check file permissions
3. Verify codebase structure
4. Run individual checks to isolate the issue
5. Consider using automated dependency analysis tools
