---
description: Update dependencies with security awareness, semantic versioning, and comprehensive testing
---

# Dependency Update Workflow

This workflow guides you through updating project dependencies with security awareness, semantic versioning awareness, and comprehensive testing to ensure stability.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed (`npm install`)
- Git repository initialized with clean working directory
- Backup or branch created before updates

## Step 1: Create Safety Branch

Create a new branch for dependency updates:
```bash
git checkout -b deps/update-[date]
```

This allows easy rollback if issues arise.

## Step 2: Check for Security Vulnerabilities

Run security scan to identify known vulnerabilities:
```bash
npm run security:scan
```
// turbo

Or use npm audit directly:
```bash
npm audit
```

### Vulnerability Categories

- **Critical**: Immediate action required
- **High**: Address soon
- **Moderate**: Address in next update cycle
- **Low**: Address when convenient
- **Info**: Informational only

## Step 3: Review Current Dependencies

Check current dependency versions:
```bash
npm outdated
```

This shows packages that have newer versions available.

### Categorize Updates

- **Patch updates** (x.x.Z): Bug fixes, backward compatible
- **Minor updates** (x.Y.z): New features, backward compatible
- **Major updates** (X.y.z): Breaking changes, requires testing

## Step 4: Update Dependencies

### Option A: Automated Fixes (Safe)

For security vulnerabilities with automated fixes:
```bash
npm audit fix
```

For fixes that may include breaking changes:
```bash
npm audit fix --force
```

**Caution**: Only use `--force` if you understand the breaking changes and have tests to catch issues.

### Option B: Manual Updates (Controlled)

Update specific packages:
```bash
npm install [package-name]@[version]
```

Update to latest patch version:
```bash
npm update [package-name]
```

Update all packages to latest versions (risky):
```bash
npm update
```

### Option C: Interactive Updates (Recommended)

Use npm-check-updates for interactive updates:
```bash
npx npm-check-updates -u
npm install
```

This allows you to review and select which updates to apply.

## Step 5: Review Dependency Overrides

Check package.json for existing security overrides:
```json
{
  "overrides": {
    "yaml": "^2.8.3",
    "tmp": "^0.2.3"
  }
}
```

These overrides address known security vulnerabilities in transitive dependencies. Ensure they remain after updates.

## Step 6: Check for Breaking Changes

For major version updates, review breaking changes:

### Check Changelogs
- Visit package documentation
- Review GitHub releases
- Check breaking change sections

### Review Package Documentation
- Look for migration guides
- Check API changes
- Review configuration changes

## Step 7: Update Lockfile

Ensure package-lock.json is updated:
```bash
npm install
```

This regenerates the lockfile with new dependency tree.

## Step 8: Run Type Checking

Run TypeScript type checking:
```bash
npm run check
```

Fix any type errors introduced by dependency updates.

## Step 9: Run Linting

Run ESLint to check for code style issues:
```bash
npm run lint
```

Fix any linting errors.

## Step 10: Run Unit Tests

Run unit tests to check for breaking changes:
```bash
npm run test:unit
```
// turbo

Fix any failing tests. Tests may fail due to:
- API changes in dependencies
- Behavior changes in dependencies
- Removed features in dependencies

## Step 11: Run Component Tests

Run component tests:
```bash
npm test
```

Ensure UI components still work correctly after updates.

## Step 12: Run Integration Tests

Run integration tests:
```bash
npm run test:integration
```

Check that data flow and integrations still work.

## Step 13: Run E2E Tests

Run end-to-end tests:
```bash
npm run test:e2e
```

Verify critical user journeys still function.

## Step 14: Run Accessibility Tests

Run accessibility tests to ensure no regressions:
```bash
npm run test:a11y
```

Ensure zero axe-core violations.

## Step 15: Build Production Site

Build the production site:
```bash
npm run build
```

Fix any build errors. Common issues:
- Missing peer dependencies
- Incompatible module formats
- Configuration incompatibilities

## Step 16: Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

Manually test:
- Homepage loads
- Navigation works
- Images display
- Interactive elements function
- Mobile responsiveness

## Step 17: Run Lighthouse CI

Run Lighthouse CI to check for performance regressions:
```bash
npm run lighthouse
```

Ensure scores meet thresholds:
- Performance: ≥90
- Accessibility: ≥90
- Best Practices: ≥90
- SEO: ≥90

## Step 18: Run Security Scan Again

Run security scan to verify vulnerabilities are fixed:
```bash
npm run security:scan
```

Ensure no new vulnerabilities were introduced.

## Step 19: Generate Changelog

Document the dependency changes:

### Manual Changelog Entry

Create or update CHANGELOG.md:
```markdown
## [Version] - [Date]

### Dependencies Updated

#### Security Fixes
- [package-name]: [version] → [version] - Fixed [CVE-ID]
- [package-name]: [version] → [version] - Fixed [CVE-ID]

#### Bug Fixes
- [package-name]: [version] → [version] - Fixed [issue]

#### Features
- [package-name]: [version] → [version] - Added [feature]

#### Breaking Changes
- [package-name]: [version] → [version] - [change description]
  - Migration: [steps to migrate]
```

### Automated Changelog

Use conventional-changelog:
```bash
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

## Step 20: Commit Changes

Commit the dependency updates:
```bash
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore: update dependencies

- Updated [package-name] from [old] to [new]
- Fixed security vulnerabilities: [CVE-IDs]
- Tested with full test suite

Closes #[issue-number]"
```

## Step 21: Push and Create Pull Request

Push branch and create pull request:
```bash
git push origin deps/update-[date]
```

### PR Description Template

```markdown
## Dependency Updates

### Security Fixes
- [List security fixes with CVE IDs]

### Package Updates
- [package-name]: [old] → [new]
- [package-name]: [old] → [new]

### Breaking Changes
- [List any breaking changes and migration steps]

### Testing
- [x] Unit tests pass
- [x] Component tests pass
- [x] Integration tests pass
- [x] E2E tests pass
- [x] Accessibility tests pass
- [x] Build succeeds
- [x] Lighthouse CI passes
- [x] Security scan passes

### Manual Testing
- [x] Homepage loads
- [x] Navigation works
- [x] Images display
- [x] Interactive elements function

### Notes
[Any additional notes or concerns]
```

## Step 22: Request Code Review

Request review from team members, especially for:
- Major version updates
- Breaking changes
- Security fixes
- Performance-critical dependencies

## Step 23: Merge and Deploy

After approval:
1. Merge pull request to main
2. Delete branch
3. Monitor production for issues
4. Roll back if problems detected

## Notes

### Semantic Versioning

- **Patch (x.x.Z)**: Bug fixes, backward compatible - Safe to update
- **Minor (x.Y.z)**: New features, backward compatible - Generally safe
- **Major (X.y.z)**: Breaking changes - Requires thorough testing

### Update Strategy

**Conservative Approach** (Recommended for production):
1. Update patch versions first
2. Test thoroughly
3. Update minor versions
4. Test thoroughly
5. Update major versions last
6. Test extensively

**Aggressive Approach** (For development/feature branches):
1. Update all dependencies at once
2. Run full test suite
3. Fix issues iteratively
4. Monitor for regressions

### Dependency Categories

**Production Dependencies**:
- Update carefully with full testing
- Monitor for breaking changes
- Review security advisories

**Development Dependencies**:
- Can update more aggressively
- Less critical for production
- Still test build and linting

**Peer Dependencies**:
- Must match required versions
- Check compatibility with other packages
- May require manual resolution

### Common Issues

**Peer Dependency Conflicts**:
- Check if packages require different versions
- Use npm overrides to resolve
- Consider alternative packages

**Build Failures**:
- Check for missing dependencies
- Verify module format compatibility
- Review build tool configuration

**Test Failures**:
- Review test expectations
- Check for API changes
- Update test fixtures if needed

**Performance Regressions**:
- Run Lighthouse CI before/after
- Monitor bundle size changes
- Check for slower operations

## Error Handling

If updates cause issues:

### Immediate Rollback
```bash
git checkout main
git branch -D deps/update-[date]
```

### Selective Rollback
```bash
git checkout package.json package-lock.json
npm install
```

### Debug Mode
- Update one package at a time
- Test after each update
- Identify problematic package
- Find alternative or fix

### Fallback Versions
- Use older stable version
- Pin to specific version
- Monitor for fixes in future releases

## Security Considerations

### Vulnerability Scanning
- Run `npm audit` regularly
- Subscribe to security advisories
- Monitor CVE databases
- Review npm security blog

### Supply Chain Security
- Verify package integrity
- Check package maintainers
- Review package popularity
- Avoid unmaintained packages

### Private Packages
- Use npm private registries
- Configure .npmrc for auth
- Use npm scopes for organization
- Enable 2FA for npm accounts

## Monitoring After Deployment

After deploying dependency updates:

### Monitor Logs
- Check for runtime errors
- Monitor performance metrics
- Watch for unusual behavior
- Review error rates

### User Feedback
- Monitor user reports
- Check support tickets
- Review analytics for issues
- Gather feedback on changes

### Rollback Plan
- Have rollback procedure ready
- Document rollback steps
- Test rollback process
- Communicate rollback plan

## Best Practices

- **Always create a branch** before updating dependencies
- **Test thoroughly** after updates, especially major versions
- **Document changes** in changelog
- **Review breaking changes** before updating
- **Monitor production** after deployment
- **Keep dependencies updated** to avoid security vulnerabilities
- **Use semantic versioning** to understand impact
- **Pin critical versions** if needed
- **Use dependency locks** for reproducible builds
- **Regular security audits** to catch vulnerabilities early
