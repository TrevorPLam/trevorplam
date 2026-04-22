---
description: Inspect codebase for code quality issues including dead code, code smells, unused imports/exports, and TypeScript violations
---

# Code Quality Inspection Workflow

This workflow guides the AI agent through comprehensive code quality inspection to identify dead code, code smells, unused imports/exports, and TypeScript violations.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed
- Understanding of code quality metrics and best practices

## Step 1: Repository Impact Mapping

Before inspecting, analyze the codebase structure and identify code quality focus areas:

### Impact Map Structure
```markdown
# Repository Impact Map: Code Quality Inspection

## Source Code Areas
- src/components/ (Astro components)
- src/pages/ (Astro pages)
- src/utils/ (TypeScript utilities)
- src/layouts/ (Layout components)
- src/styles/ (CSS files)

## File Types to Inspect
- *.astro (Astro components)
- *.ts (TypeScript files)
- *.tsx (TypeScript React components)
- *.mdx (MDX content files)

## Quality Metrics to Check
- Dead code detection
- Unused imports/exports
- Code complexity
- Code duplication
- TypeScript strict mode violations
```

## Step 2: Dead Code Detection

Search for and identify dead code across the codebase:

### TypeScript Dead Code
```bash
# Use ts-prune for TypeScript dead code detection
npx ts-prune
```

### JavaScript/TypeScript Comprehensive Dead Code
```bash
# Use knip for comprehensive dead code detection
npx knip
```

### Issues to Flag
- Unused functions and methods
- Unused variables
- Unreachable code blocks
- Dead imports
- Unused exports
- Orphaned files (files not referenced anywhere)

### Check for Unused Dependencies
```bash
# Check package.json for unused dependencies
npm run security:scan
```

## Step 3: Unused Import/Export Detection

Search for unused imports and exports:

### Search for Unused Imports
```bash
# TypeScript compiler can detect unused locals
npm run check
```

### Manual Import Analysis
- Check each file for imports that are never used
- Identify re-exports that are never consumed
- Flag type-only imports that could be removed

### Issues to Flag
- Imports with no references in the file
- Exports that are never imported elsewhere
- Type imports that are only used in type annotations (could be inline)
- Side-effect imports that are unnecessary

## Step 4: Code Smell Detection

Identify code smells and anti-patterns:

### Long Functions/Methods
```bash
# Search for long functions (>50 lines)
find src -name "*.ts" -o -name "*.astro" | xargs wc -l | sort -n
```

### Issues to Flag
- Functions longer than 50 lines
- Components with excessive props (>10 props)
- Deep nesting (>4 levels)
- Complex conditional logic (>5 branches)
- Magic numbers without constants
- Duplicate code blocks

### Check for Code Duplication
- Look for similar code patterns across files
- Identify repeated logic that could be extracted
- Flag copy-pasted code with minor variations

## Step 5: TypeScript Type Safety

Check for TypeScript violations and unsafe patterns:

### Run TypeScript Check
```bash
npm run check
```

### Search for 'any' Types
```bash
# Search for any type usage
grep -rn ": any" src/
```

**Current findings:**
- src/utils/metrics.ts:318
- src/utils/error-monitoring.ts:117, 118
- src/utils/chart-utils.ts:36, 40

### Issues to Flag
- Use of `any` type (bypasses type checking)
- Type assertions without validation
- Missing type annotations
- Implicit any types
- Unsafe type casts

### Check for Strict Mode Violations
- Implicit any types
- Unused variables (except prefixed with _)
- Missing return types on functions
- Unreachable code

## Step 6: Component Quality

Inspect Astro components for quality issues:

### Large Components
```bash
# Find large component files
find src/components -name "*.astro" -exec wc -l {} + | sort -n
```

### Issues to Flag
- Components larger than 300 lines
- Components with excessive nested logic
- Components doing too much (violation of single responsibility)
- Components with complex prop drilling

### Check Component Props
- Components with too many props (>10)
- Props without TypeScript interfaces
- Optional props that should be required
- Props with unclear naming

## Step 7: Utility Function Quality

Inspect utility functions in src/utils/:

### Function Complexity
- Check each utility file for complex functions
- Identify functions with high cyclomatic complexity
- Flag functions with multiple responsibilities

### Issues to Flag
- Functions with >5 parameters
- Functions that do too much
- Functions without clear single responsibility
- Functions without proper error handling
- Functions without JSDoc comments

## Step 8: Console.log Detection

Search for debug statements that should be removed:

```bash
# Search for console.log statements
grep -rn "console.log" src/
```

**Current findings:**
- src/utils/formatters.ts:12, 13, 14 (in comments - acceptable)
- src/utils/date.ts:13, 14, 15 (in comments - acceptable)
- src/pages/api/generate-pdf.ts:55 (production code - should be removed)

### Issues to Flag
- console.log in production code
- console.error without proper error handling
- console.warn for non-warnings
- debugger statements
- Commented-out debug code

## Step 9: Comment and Documentation Quality

Check code comments and documentation:

### Issues to Flag
- Missing JSDoc for public functions
- Outdated comments that don't match code
- Excessive commenting (code should be self-documenting)
- TODO/FIXME comments without issues
- Cryptic comments that don't add value

## Step 10: Naming Convention Check

Verify consistent naming conventions:

### Issues to Flag
- Inconsistent naming (camelCase vs snake_case)
- Abbreviations without context
- Single-letter variables except in loops
- Magic numbers without named constants
- Inconsistent file naming

## Step 11: Error Handling Check

Inspect error handling patterns:

### Issues to Flag
- Functions without error handling where needed
- Generic error catching without specific handling
- Silent error swallowing
- Missing error logging
- Inconsistent error handling patterns

## Step 12: Generate Code Quality Report

Compile all findings into a comprehensive code quality report:

### Report Structure
```markdown
# Code Quality Inspection Report

## Critical Issues
- [List critical findings with file locations]

## High Priority Issues
- [List high priority findings]

## Medium Priority Issues
- [List medium priority findings]

## Low Priority Issues
- [List low priority findings]

## Metrics
- Total files inspected: [number]
- Files with dead code: [number]
- Files with code smells: [number]
- TypeScript violations: [number]
- Unused imports: [number]

## Recommendations
1. [Priority recommendation 1]
2. [Priority recommendation 2]
3. [Other recommendations]
```

## Notes

- Use knip for comprehensive dead code detection in TypeScript/JavaScript
- ts-prune is faster but less comprehensive than knip
- Focus on high-impact issues first (dead code, security, type safety)
- Consider setting up automated dead code detection in CI/CD
- Review AGENTS.md for code quality guidelines

## Error Handling

If inspection fails:
1. Review the specific error message
2. Check that knip/ts-prune is installed
3. Verify TypeScript configuration
4. Run individual checks to isolate the issue
5. Review AGENTS.md for code quality standards
