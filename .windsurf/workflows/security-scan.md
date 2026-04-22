---
description: Run security vulnerability scanning with dependency checks, ESLint security rules, and fuzzing tests
---

# Security Scan Workflow

This workflow guides you through running comprehensive security scans to identify and address vulnerabilities.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed (`npm install`)
- npm audit available

## Step 1: Dependency Vulnerability Scan

Run the security scan script to check for known vulnerabilities:
```bash
npm run security:scan
```
// turbo

This script checks:
- npm dependencies for known vulnerabilities (CVEs)
- Outdated packages with security issues
- License compliance issues

### Fix Vulnerabilities

If vulnerabilities are found:
```bash
npm audit fix
```

For automated fixes that may include breaking changes:
```bash
npm audit fix --force
```

## Step 2: ESLint Security Rules

Run ESLint with security plugins:
```bash
npm run lint
```

The ESLint configuration includes:
- `eslint-plugin-browser-security` - Browser security best practices
- `eslint-plugin-secure-coding` - Secure coding patterns
- No `eval()` usage
- No prototype pollution
- No dangerous HTML/JSX patterns

### Security Rules Enforced

- No use of `eval()`, `Function()`, or similar dynamic code execution
- No use of `innerHTML` with user input
- No hardcoded secrets or API keys
- No insecure random number generation
- No unsafe regular expressions (ReDoS)

## Step 3: CSP Validation

Ensure Content Security Policy is properly configured in `astro.config.mjs`:
```javascript
security: {
  csp: {
    enabled: true
  }
}
```

Verify:
- CSP is enabled (auto-generates script hashes)
- No `'unsafe-inline'` in CSP directives
- Script hashes are properly generated
- External scripts are from trusted sources

## Step 4: Security Headers Verification

Verify security headers in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Resource-Policy",
          "value": "same-site"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### Headers Explained

- **HSTS**: Enforces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer-Policy**: Controls referrer information
- **COOP**: Isolates your page from potential attackers
- **CORP**: Protects your resources from being loaded by other origins
- **Permissions-Policy**: Disables sensitive browser features

## Step 5: Fuzzing Tests

Run security fuzzing tests with Jazzer:
```bash
npm run test:fuzz
```

Fuzzing tests:
- Test inputs with random data
- Identify buffer overflows
- Find input validation issues
- Detect edge cases in security-critical code

### Fuzzing Targets

Located in `/tests/fuzzing/`:
- Input validation functions
- Data parsing logic
- Authentication flows
- File handling code

## Step 6: Contract Testing

Run contract tests to validate API security:
```bash
npm run test:contract
```

Contract tests ensure:
- API contracts are properly defined
- Input validation is enforced
- Output sanitization is working
- Error handling doesn't leak sensitive information

## Step 7: Environment Variable Check

Verify no secrets are committed:
```bash
git grep -i "password\|secret\|api_key\|token" -- ':!package-lock.json' -- ':!node_modules/'
```

**Alternative**: Run the env:audit script to validate environment variables:
```bash
npm run env:audit
```

This checks for missing or empty environment variables against `.env.example`.

Ensure:
- No API keys in code
- No database credentials
- No secrets in configuration files
- Environment variables use `import.meta.env`

## Step 8: Dependency Overrides Check

Verify security overrides in `package.json`:
```json
{
  "overrides": {
    "yaml": "^2.8.3",
    "tmp": "^0.2.3"
  }
}
```

These overrides address known security vulnerabilities in transitive dependencies.

## Step 9: Run Full Security Test Suite

The CI/CD pipeline includes a dedicated security job that runs:
- Dependency vulnerability scan
- ESLint security rules
- Fuzzing tests
- Contract tests
- Trivy container scanning (if using Docker)

## Step 10: Create TODO.md Tasks from Critical/High-Priority Vulnerabilities

Convert critical and high-priority security vulnerabilities found during the scan into TODO.md tasks using the comprehensive task format. This ensures security issues are systematically addressed.

### Task Creation Process

For each critical and high-priority security vulnerability identified during the scan, create a TODO.md task following the format defined in create-todo.md:

1. **Assign Task ID**: Use the next available TASK-[###] format
2. **Set Priority**: Based on severity (🔴 Critical = High, 🟡 High = High, 🟢 Medium = Medium)
3. **Set Status**: 🟡 Pending
4. **Populate All 14 Required Sections**:
   - Priority / Urgency
   - Research / Investigation (if vulnerability fix needs research)
   - Related Files (affected files/packages from scan)
   - Definition of Done
   - Acceptance Criteria (bulleted list, include security requirements)
   - Out of Scope
   - Dependencies
   - Estimated Effort
   - Testing Requirements (include security validation)
   - Validation Steps (specific to the vulnerability)
   - Strict Rules (from AGENTS.md security guidelines)
   - Existing Code Patterns
   - Advanced Code Patterns
   - Anti-Patterns (what to avoid)

### Example Task Template

```markdown
- [ ] 🔴 High 🟡 Pending TASK-[###]: [Security Vulnerability Title]

  **Priority / Urgency**
  Critical - CVE-XXXX-XXXX in [package name] with known exploit

  **Research / Investigation**
  None required (or specific vulnerability fix research needed)

  **Related Files**
  - package.json (affected dependency)
  - [file using the vulnerable package]

  **Definition of Done**
  Security vulnerability resolved and validated with security scan

  **Acceptance Criteria**
  - Vulnerability fixed (package updated or overridden)
  - npm run security:scan passes with zero vulnerabilities
  - No breaking changes introduced
  - Tests pass after dependency update

  **Out of Scope**
  [What is not included in this task]

  **Dependencies**
  None (or list dependencies)

  **Estimated Effort**
  [time estimate]

  **Testing Requirements**
  - Security vulnerability scan (npm run security:scan)
  - Regression tests for affected functionality
  - ESLint security rules validation

  **Validation Steps**
  - Run npm run security:scan
  - Verify zero vulnerabilities for this CVE
  - Run full test suite to ensure no regressions

  **Strict Rules**
  - No known CVEs in dependencies
  - ESLint security rules must pass
  - CSP must be enabled
  - No hardcoded secrets

  **Existing Code Patterns**
  - [pattern to follow]

  **Advanced Code Patterns**
  N/A (or advanced security patterns)

  **Anti-Patterns**
  - Ignoring CVE warnings
  - Using vulnerable packages
  - Disabling security checks

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
git commit -m "chore: add TODO.md tasks from security scan

- Added [number] tasks for critical/high-priority security vulnerabilities
- Dependency CVEs: [number] tasks
- ESLint security violations: [number] tasks
- CSP configuration: [number] tasks
- Hardcoded secrets: [number] tasks

Generated from /security-scan workflow"
```

## Notes

- Node version must be >=22.12.0 for security patches
- Keep dependencies updated regularly
- Review security advisories for Astro, Tailwind, and dependencies
- Monitor `npm audit` for new vulnerabilities
- Use `npm audit` in CI/CD pipeline
- Never commit secrets or API keys
- Use environment variables for sensitive configuration

## Error Handling

If security scans fail:
1. Review the vulnerability report for specific CVEs
2. Check if vulnerabilities are in direct or transitive dependencies
3. Run `npm audit fix` for automatic fixes
4. For manual fixes, update affected packages manually
5. Check dependency overrides in package.json
6. Review ESLint security output for specific rule violations
7. For CSP errors, verify astro.config.mjs security settings
8. For secrets found, remove them immediately and rotate credentials
