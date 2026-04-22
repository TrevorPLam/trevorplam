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
