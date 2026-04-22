---
description: Inspect codebase for security vulnerabilities, unsafe patterns, and security configuration issues
---

# Security Inspection Workflow

This workflow guides the AI agent through comprehensive security inspection of the codebase to identify vulnerabilities, unsafe patterns, and configuration issues.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed
- Understanding of OWASP Top 10 and security best practices

## Step 1: Repository Impact Mapping

Before inspecting, analyze the codebase structure and identify security-sensitive areas:

### Impact Map Structure
```markdown
# Repository Impact Map: Security Inspection

## Security-Sensitive Areas
- Authentication/authorization code
- User input handling
- External API calls
- File system operations
- Database queries
- Third-party integrations

## Configuration Files to Review
- astro.config.mjs (CSP configuration)
- vercel.json (security headers)
- package.json (dependencies)
- .env files (if any)

## High-Risk Components
- Components using innerHTML
- API routes
- Data processing utilities
- Form handling components

## External Dependencies
- List all npm packages
- Identify packages with known vulnerabilities
```

## Step 2: CSP Configuration Check

Verify Content Security Policy is properly configured:

### Check astro.config.mjs
```bash
# Verify CSP is enabled
grep -n "csp" astro.config.mjs
```

### Issues to Flag
- CSP disabled (currently line 68: `enabled: false`)
- Missing CSP directives
- Unsafe CSP directives (e.g., 'unsafe-inline', 'unsafe-eval')
- CSP directives format issues (TODO comment on line 65)

### Required CSP Configuration
```javascript
security: {
  csp: {
    enabled: true
  }
}
```

## Step 3: Security Headers Verification

Verify vercel.json security headers:

### Check vercel.json
```bash
# Verify all required headers are present
cat vercel.json
```

### Required Headers
- Strict-Transport-Security (HSTS)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy
- Permissions-Policy

### Issues to Flag
- Missing security headers
- Weak header values
- Deprecated headers (X-XSS-Protection is correctly removed)

## Step 4: Unsafe Pattern Detection

Search for dangerous coding patterns:

### innerHTML Usage (XSS Risk)
```bash
# Search for innerHTML usage
grep -rn "innerHTML" src/
```

**Current findings:**
- src/pages/search.astro:287
- src/components/ErrorBoundary.astro:24, 83, 98, 112

**Issues to flag:**
- Any innerHTML usage without sanitization
- Dynamic HTML injection without validation
- User-controlled content in innerHTML

### eval() and Function() Usage
```bash
# Search for eval or Function constructor
grep -rn "eval(" src/
grep -rn "Function(" src/
```

**Issues to flag:**
- Direct eval() usage
- Function() constructor usage
- Dynamic code execution

### Prototype Pollution
```bash
# Search for prototype manipulation
grep -rn "__proto__" src/
grep -rn "prototype\[" src/
```

**Issues to flag:**
- Direct prototype manipulation
- Object prototype pollution vectors

## Step 5: Dependency Vulnerability Scan

Run security vulnerability scan:

```bash
npm run security:scan
```

// turbo

### Issues to Flag
- Known CVEs in dependencies
- Outdated packages with security issues
- License compliance issues
- Transitive dependency vulnerabilities

### Check Dependency Overrides
```bash
# Verify security overrides in package.json
grep -A 5 "overrides" package.json
```

## Step 6: Hardcoded Secrets Detection

Search for hardcoded secrets and credentials:

```bash
# Search for common secret patterns
git grep -i "password\|secret\|api_key\|token\|private_key" -- ':!package-lock.json' -- ':!node_modules/'
```

### Issues to Flag
- Hardcoded API keys
- Database credentials
- Secret tokens
- Private keys
- Password strings

### Verify Environment Variable Usage
- Check that secrets use `import.meta.env`
- Verify no secrets committed to repository
- Check .gitignore excludes .env files

## Step 7: TypeScript Type Safety

Check for unsafe TypeScript patterns:

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
- Unsafe type casts

## Step 8: API Route Security

Inspect API routes for security issues:

### Check API Routes
```bash
# List all API routes
find src/pages/api -type f
```

### Issues to Flag
- Missing input validation
- Missing authentication
- Missing rate limiting
- Error information leakage
- CORS misconfiguration

## Step 9: Content Security

Inspect MDX content for security issues:

### Check for Unsafe Content
```bash
# List all MDX files
find src/content -name "*.mdx"
```

### Issues to Flag
- Script tags in content
- Unsafe HTML in MDX
- External resource loading without validation
- User-generated content without sanitization

## Step 10: Console.log Removal

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
- debugger statements
- Commented-out debug code

## Step 11: History API Overrides

Check for history API manipulation:

```bash
# Search for history.pushState/replaceState overrides
grep -rn "history.pushState\|history.replaceState" src/
```

**Current findings:**
- src/utils/rum-monitoring.ts:304, 316
- src/components/ErrorBoundary.astro:50, 58

### Issues to Flag
- History API overrides (can break navigation)
- Side effects from history manipulation
- Potential for navigation state corruption

## Step 12: Generate Security Report

Compile all findings into a comprehensive security report:

### Report Structure
```markdown
# Security Inspection Report

## Critical Issues
- CSP disabled (HIGH)
- innerHTML usage without sanitization (HIGH)
- [Other critical findings]

## High Priority Issues
- [List high priority findings]

## Medium Priority Issues
- [List medium priority findings]

## Low Priority Issues
- [List low priority findings]

## Recommendations
1. Enable CSP in astro.config.mjs
2. Sanitize innerHTML usage or replace with safer alternatives
3. Remove console.log from production code
4. [Other recommendations]
```

## Step 13: Create TODO.md Tasks from Findings

Convert the security inspection findings into TODO.md tasks using the comprehensive task format. This ensures security issues are systematically addressed.

### Task Creation Process

For each critical and high-priority security issue identified in the report, create a TODO.md task following the format defined in create-todo.md:

1. **Assign Task ID**: Use the next available TASK-[###] format
2. **Set Priority**: Based on severity (🔴 Critical = High, 🟡 High = High, 🟢 Medium = Medium)
3. **Set Status**: 🟡 Pending
4. **Populate All 14 Required Sections**:
   - Priority / Urgency
   - Research / Investigation (if security patterns need research)
   - Related Files (affected files from inspection)
   - Definition of Done
   - Acceptance Criteria (bulleted list, include security standards)
   - Out of Scope
   - Dependencies
   - Estimated Effort
   - Testing Requirements (include security validation)
   - Validation Steps (specific to the security issue)
   - Strict Rules (from AGENTS.md security guidelines)
   - Existing Code Patterns
   - Advanced Code Patterns
   - Anti-Patterns (what to avoid)

### Example Task Template

```markdown
- [ ] 🔴 High 🟡 Pending TASK-[###]: [Security Issue Title]

  **Priority / Urgency**
  Critical - CSP disabled exposes site to XSS attacks

  **Research / Investigation**
  None required (or specific security pattern research needed)

  **Related Files**
  - [file path with security issue]
  - [configuration files if applicable]

  **Definition of Done**
  Security issue resolved and validated with security scan

  **Acceptance Criteria**
  - [security standard met]
  - [specific requirement]
  - CSP enabled and properly configured
  - Zero security vulnerabilities

  **Out of Scope**
  [What is not included in this task]

  **Dependencies**
  None (or list dependencies)

  **Estimated Effort**
  [time estimate]

  **Testing Requirements**
  - Security vulnerability scan (npm run security:scan)
  - CSP validation
  - XSS testing

  **Validation Steps**
  - Run npm run security:scan
  - Verify CSP is enabled
  - Test for XSS vulnerabilities

  **Strict Rules**
  - No innerHTML without sanitization
  - No eval() or Function() usage
  - No hardcoded secrets
  - CSP must be enabled

  **Existing Code Patterns**
  - [pattern to follow]

  **Advanced Code Patterns**
  N/A (or advanced security patterns)

  **Anti-Patterns**
  - innerHTML usage
  - eval() usage
  - Hardcoded secrets
  - Disabled CSP

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
git commit -m "chore: add TODO.md tasks from security inspection

- Added [number] tasks for critical/high-priority security issues
- CSP configuration: [number] tasks
- Unsafe patterns: [number] tasks
- Dependency vulnerabilities: [number] tasks
- Hardcoded secrets: [number] tasks

Generated from /inspect-security workflow"
```

## Notes

- CSP is currently disabled - this is a critical security issue
- innerHTML usage in search.astro and ErrorBoundary.astro needs review
- Some `any` types in utility files should be replaced with proper types
- Console.log in generate-pdf.ts should be removed
- History API overrides should be reviewed for necessity

## Error Handling

If inspection fails:
1. Review the specific error message
2. Check file permissions
3. Verify npm dependencies are installed
4. Run individual checks to isolate the issue
5. Review AGENTS.md for security guidelines
