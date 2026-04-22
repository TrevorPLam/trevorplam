# Project TODO List

*Last updated: 2026-04-22*

---

## TASK-001: Add Missing Resume PDF File
**Status**: [PENDING USER ACTION]

### Description
Place the latest resume PDF at the expected location and verify the download link works correctly.

### Subtasks
- [ ] TASK-001.1: Place the latest resume PDF at `public/TrevorLam-Resume-2026.pdf` – `public/TrevorLam-Resume-2026.pdf` (USER ACTION REQUIRED)
- [x] TASK-001.2: Verify the link in `src/pages/connect.astro` points to the correct file path – `src/pages/connect.astro` (COMPLETED: link already points to correct path)
- [x] TASK-001.3: Confirm the download attribute is present for better UX – `src/pages/connect.astro` (COMPLETED: added `target="_blank"` and `rel="noopener noreferrer"` security attributes)

### Related Files
- `public/TrevorLam-Resume-2026.pdf`
- `src/pages/connect.astro`

### Definition of Done
- Clicking the resume link on the Connect page successfully downloads or opens the PDF in a new tab.
- The PDF file is present in the repository and deployed to production.
- No 404 errors occur when the link is followed.

### Out of Scope
- Automated PDF generation from content collections.
- Tracking resume downloads (unless explicitly desired and disclosed in privacy policy).

### Strict Rules to Follow
- The file must be placed in the `/public` directory to be served correctly.
- The link must use `target="_blank"` and `rel="noopener noreferrer"` for security.
- Do not use a third‑party hosting service without good reason.

### Existing Code Patterns
- The download link already exists in `connect.astro` and includes a download attribute.
- Public assets are served from the `/public` directory.

### Advanced Code Patterns
- Consider adding a `download` attribute to force download behavior instead of inline viewing.
- Use environment variables for the file path if multiple resume versions are needed.

### Anti-Patterns
- Do not hardcode a different filename without updating the link.
- Do not commit a placeholder file that causes a broken download experience.

---

## TASK-002: Standardize Interaction States
**Status**: [COMPLETED]

### Description
Audit and standardize hover, focus, active, and disabled states across all interactive elements to improve accessibility and visual consistency.

### Subtasks
- [x] TASK-002.1: Audit all interactive elements (buttons, links, cards) for consistent `:hover`, `:focus`, `:active`, and `:disabled` styles – `src/components/**/*.astro`, `src/pages/**/*.astro`
- [x] TASK-002.2: Fix color-only hover states by adding additional visual indicators (border, transform, shadow) – various components
- [x] TASK-002.3: Ensure focus indicators are visible and meet WCAG 2.2 contrast requirements (3:1 minimum) – all interactive components
- [x] TASK-002.4: Add active states (scale or darker background) to buttons for tactile feedback – button components

### Related Files
- `src/styles/global.css`
- `src/components/**/*.astro`
- `src/pages/**/*.astro`

### Definition of Done
- All interactive elements exhibit consistent, accessible state styling.
- No element relies solely on color to convey state (e.g., additional underline or border on hover).
- Focus indicators are clearly visible and meet WCAG contrast thresholds.
- Disabled elements are visually distinct and not focusable.

### Out of Scope
- Creating a full design system or component library.
- Redesigning existing component structures.

### Strict Rules to Follow
- Use Tailwind’s built‑in variants (`hover:`, `focus:`, `active:`, `disabled:`) wherever possible.
- Do not remove focus outlines without providing an accessible alternative.
- Touch targets must maintain a minimum size of 44×44px.

### Existing Code Patterns
- Components currently use ad‑hoc hover effects (e.g., `hover:bg-gray-100`).
- Some focus styles rely on browser defaults, which may not meet contrast requirements.

### Advanced Code Patterns
- Use `@apply` in `tailwind.css` to create reusable interaction state classes.
- Consider adding a global `:focus-visible` style to ensure keyboard users see clear focus rings.

### Anti-Patterns
- Do not use `outline: none` without a replacement focus style.
- Do not rely on color alone for hover states (e.g., only changing text color).

---

## TASK-003: Improve Search UX Messaging
**Status**: [COMPLETED]

### Description
Enhance the search interface with clearer messaging about what content is searchable and what to do when no results are found.

### Subtasks
- [x] TASK-003.1: Update `search.astro` placeholder to indicate searchable content scope (e.g., “Search case studies, learning logs, and resources…”) – `src/pages/search.astro`
- [x] TASK-003.2: Add a “no results” message with actionable suggestions (e.g., “Try different keywords or browse our case studies”) – `src/pages/search.astro`
- [x] TASK-003.3: Clearly communicate any search limitations (e.g., PDF content not searchable) – `src/pages/search.astro`
- [x] TASK-003.4: Update `SearchBar.astro` placeholder for consistency – `src/components/SearchBar.astro`

### Related Files
- `src/pages/search.astro`
- `src/components/SearchBar.astro`

### Definition of Done
- Users understand what content is included in search results before typing.
- A helpful, non‑generic message appears when no results match a query.
- Search limitations are documented in the UI.

### Out of Scope
- Adding faceted search or advanced filtering.
- Implementing search analytics or tracking.

### Strict Rules to Follow
- Messaging must be concise and use the same tone as the rest of the site.
- The “no results” message must include at least one actionable link (e.g., to browse case studies).
- Accessibility: use ARIA live regions to announce search results updates.

### Existing Code Patterns
- `search.astro` already contains a loading state and a basic no‑results message.
- `SearchBar.astro` includes a keyboard shortcut hint.

### Advanced Code Patterns
- Use Pagefind’s metadata to display search scope dynamically.
- Debounce search input to avoid excessive re‑rendering.

### Anti-Patterns
- Do not display a generic “No results” message without guidance.
- Do not hide the search scope—users should know what they are searching.

---

## TASK-004: Add Case Study PDF Metadata to Schema
**Status**: [COMPLETED]

### Description
Formalize PDF download support by adding a `pdfUrl` field to the case study content schema and populating it for all case studies.

### Subtasks
- [x] TASK-004.1: Update `src/content.config.ts` to add `pdfUrl: z.string().url().optional()` to the case study schema – `src/content.config.ts`
- [x] TASK-004.2: Populate `pdfUrl` in frontmatter for all existing case studies (`sonic.mdx`, `klw.mdx`, `grandlux.mdx`) – `src/content/cases/*.mdx`

### Related Files
- `src/content.config.ts`
- `src/content/cases/*.mdx`

### Definition of Done
- The case study schema includes an optional `pdfUrl` field that validates as a URL.
- All case study frontmatter files contain a `pdfUrl` pointing to the generated PDF.
- The case study page template correctly renders a download button when `pdfUrl` is present (already implemented).

### Out of Scope
- Validating that the PDF file actually exists at build time.
- Automatically generating `pdfUrl` from the slug (keep it explicit).

### Strict Rules to Follow
- Use Zod’s `z.string().url()` to ensure valid URL format.
- Use relative paths (e.g., `/pdfs/sonic.pdf`) rather than absolute URLs.
- Do not hardcode the PDF path in the page template; always read from the schema.

### Existing Code Patterns
- The case study page already conditionally renders a download button based on `pdfUrl`.
- PDFs are generated by a script and placed in `/public/pdfs/`.

### Advanced Code Patterns
- Use Zod’s `transform` to prepend the site URL for absolute URLs if needed.
- Consider adding a `download` attribute automatically to the rendered link.

### Anti-Patterns
- Do not assume a PDF exists for every case study; the field must remain optional.
- Do not use a non‑URL string that breaks link resolution.

---

## TASK-005: Decide Timeline as Content Collection
**Status**: [COMPLETED]

### Description
Evaluate whether the static `timeline.json` data file should be migrated to a content collection to enable richer querying and optional MDX descriptions.

### Subtasks
- [x] TASK-005.1: Evaluate benefits of migrating `data/timeline.json` to a content collection – `data/timeline.json`
- [x] TASK-005.2: If migrating, create a timeline collection with schema in `src/content.config.ts` – `src/content.config.ts`
- [x] TASK-005.3: If not migrating, document the reasoning in `docs/implementation-assumptions.md` – `docs/implementation-assumptions.md`
- [x] TASK-005.4: Update `Timeline.astro` component to use the new collection (if migrated) – `src/components/Timeline.astro`

### Related Files
- `data/timeline.json`
- `src/content.config.ts`
- `src/components/Timeline.astro`
- `docs/implementation-assumptions.md`

### Definition of Done
- A clear decision is documented and implemented consistently.
- If migrated, the timeline collection is queryable and integrated into the component.
- If not migrated, the rationale is recorded for future reference.

### Out of Scope
- Redesigning the timeline UI.
- Adding rich text descriptions to every timeline entry (optional enhancement only if migrated).

### Strict Rules to Follow
- If migrating, use Zod to define the timeline entry schema.
- Maintain backward compatibility with the existing data structure.
- The decision must be based on long‑term maintainability, not just immediate convenience.

### Existing Code Patterns
- `Timeline.astro` currently imports JSON directly.
- Other content types (case studies, learning logs) use Astro content collections.

### Advanced Code Patterns
- Use `getCollection('timeline')` to fetch and sort entries by date.
- Consider using MDX for timeline entries to allow rich descriptions.

### Anti-Patterns
- Do not leave the data in limbo without a documented decision.
- Do not implement a partial migration that breaks the existing component.

---

## TASK-006: Ensure Consistent Timestamp Rendering
**Status**: [COMPLETED]

### Description
Standardize all date displays across the site using the `Timestamp.astro` component, and ensure content collections include proper date fields.

### Subtasks
- [x] TASK-006.1: Audit all pages and components for date displays – `src/pages/**/*.astro`, `src/components/**/*.astro`
- [x] TASK-006.2: Replace inline date formatting with the `Timestamp.astro` component – various files
- [x] TASK-006.3: Ensure all content collections (case studies, learning logs) have `pubDate` and optional `lastUpdated` fields – `src/content.config.ts`, `src/content/**/*.mdx`
- [x] TASK-006.4: Update detail pages to display both publication and update dates where appropriate – `src/pages/cases/[slug].astro`, `src/pages/lab/learning-log/[slug].astro`

### Related Files
- `src/components/Timestamp.astro`
- `src/pages/cases/[slug].astro`
- `src/pages/lab/learning-log/[slug].astro`
- `src/content.config.ts`

### Definition of Done
- Every visible date on the site is rendered using the `Timestamp.astro` component.
- Schema.org date fields (`datePublished`, `dateModified`) are populated correctly.
- The format is consistent across all content types.

### Out of Scope
- Changing the date format (currently “Month DD, YYYY”).
- Adding time‑based sorting or filtering.

### Strict Rules to Follow
- Use the `datetime` attribute for machine‑readable dates.
- Never hardcode date strings in templates.
- `Timestamp.astro` must handle both `Date` objects and string inputs gracefully.

### Existing Code Patterns
- `Timestamp.astro` is already implemented and used in some places.
- Content collections already define `pubDate` in their schemas.

### Advanced Code Patterns
- Use Astro’s `getEntry` to access frontmatter dates directly.
- Consider adding a `format` prop to `Timestamp.astro` for different contexts (short vs. long).

### Anti-Patterns
- Do not use JavaScript’s `Date` constructor directly in templates.
- Do not display a date without providing the corresponding Schema.org markup.

---

## TASK-007: Confirm and Normalize Relationship Fields
**Status**: [READY]

### Description
Define a consistent pattern for cross‑linking related content (case studies, capabilities, learning logs) and implement “Related Content” sections on detail pages.

### Subtasks
- [ ] TASK-007.1: Define a `relatedItems` field pattern (e.g., array of slugs with optional relationship types) – documentation
- [ ] TASK-007.2: Update schemas in `src/content.config.ts` to support `relatedItems` – `src/content.config.ts`
- [ ] TASK-007.3: Add `relatedItems` frontmatter to relevant content entries – `src/content/cases/*.mdx`, `src/content/learning-logs/*.mdx`
- [ ] TASK-007.4: Implement a “Related Content” section component and integrate it on case study and learning log detail pages – `src/components/RelatedContent.astro`, `src/pages/cases/[slug].astro`, `src/pages/lab/learning-log/[slug].astro`

### Related Files
- `src/content.config.ts`
- `src/components/RelatedContent.astro` (new)
- `src/pages/cases/[slug].astro`
- `src/pages/lab/learning-log/[slug].astro`

### Definition of Done
- Content creators can specify related items in frontmatter using a consistent field name.
- Related links are rendered automatically on detail pages when data exists.
- Links are validated at build time (or through a linting rule) to prevent broken references.

### Out of Scope
- Automated relationship inference based on tags or content similarity.
- Bi‑directional relationship management (manual only).

### Strict Rules to Follow
- Use an array of objects with `slug` and `collection` (or infer collection from slug prefix).
- The component must gracefully handle missing or invalid slugs.
- Do not display the section if the `relatedItems` array is empty.

### Existing Code Patterns
- Content collections use `reference()` for internal linking in some contexts.
- The `getCollection` API can look up entries by slug.

### Advanced Code Patterns
- Use Zod’s `z.array(z.object({...}))` for type‑safe relationships.
- Pre‑fetch related entries in `getStaticPaths` to avoid runtime lookups.

### Anti-Patterns
- Do not hardcode related links in templates.
- Do not assume all slugs resolve; provide fallback behavior.

---

## TASK-008: Enhance Archive / Story Index Experience
**Status**: [READY]

### Description
Create or improve an archive page that aggregates all site content chronologically with filtering by content type.

### Subtasks
- [ ] TASK-008.1: Review existing `src/pages/archive.astro` or create it if missing – `src/pages/archive.astro`
- [ ] TASK-008.2: Fetch and merge all content collections (case studies, learning logs, resources) and sort by date – `src/pages/archive.astro`
- [ ] TASK-008.3: Add filter controls by content type (e.g., “All”, “Case Studies”, “Learning Log”, “Resources”) – `src/pages/archive.astro`
- [ ] TASK-008.4: Include a brief introduction explaining the archive’s purpose – `src/pages/archive.astro`

### Related Files
- `src/pages/archive.astro`

### Definition of Done
- The archive page is accessible at `/archive`.
- It displays a unified, reverse‑chronological list of all published content.
- Users can filter the list by content type without a page reload (client‑side filtering acceptable).
- The page includes a clear heading and introductory text.

### Out of Scope
- Advanced filtering by tag or date range.
- Pagination for the archive list (assume manageable number of items).

### Strict Rules to Follow
- Use Astro’s `getCollection` to fetch entries from all collections.
- Sorting must be deterministic based on `pubDate`.
- Filtering must be accessible (ARIA labels, keyboard operable).

### Existing Code Patterns
- The site uses content collections extensively; fetching multiple collections is straightforward.
- Client‑side filtering is used on other pages (e.g., learning log tag filter).

### Advanced Code Patterns
- Use URL query parameters to persist filter state (e.g., `?type=case-studies`).
- Implement a small inline script for client‑side filtering to keep the page static.

### Anti-Patterns
- Do not simply list all items without any organization or filtering.
- Do not fetch all content on the client side; keep it build‑time where possible.

---

## TASK-009: Configure Sentry for Error Tracking (Optional)
**Status**: [READY]

### Description
Integrate Sentry to capture client‑side JavaScript errors in production, respecting user privacy and opt‑out preferences.

### Subtasks
- [ ] TASK-009.1: Install `@sentry/astro` SDK – `package.json`
- [ ] TASK-009.2: Create `sentry.properties` configuration file – `sentry.properties`
- [ ] TASK-009.3: Initialize Sentry in `BaseLayout.astro` with conditional loading based on environment – `src/layouts/BaseLayout.astro`
- [ ] TASK-009.4: Configure DSN via environment variable (`PUBLIC_SENTRY_DSN`) – `.env.example`, Vercel UI
- [ ] TASK-009.5: Ensure Sentry respects the analytics opt‑out flag (`plausible_optout`) – `src/layouts/BaseLayout.astro`

### Related Files
- `sentry.properties`
- `package.json`
- `src/layouts/BaseLayout.astro`
- `.env.example`

### Definition of Done
- Sentry is configured and initialised only in production builds.
- Runtime JavaScript errors are captured and reported to Sentry.
- The DSN is not committed to the repository.
- Error tracking is disabled when the user has opted out of analytics.
- No errors are tracked on privacy‑sensitive pages (`/privacy`, `/terms`).

### Out of Scope
- Performance monitoring (use existing RUM monitoring instead).
- Session replay (privacy concerns for a portfolio site).

### Strict Rules to Follow
- Use `PUBLIC_` prefix for client‑side environment variables in Astro.
- Never hardcode the DSN; it must come from `import.meta.env`.
- Respect the `plausible_optout` localStorage flag by checking it before initialising Sentry.
- Do not track errors on pages with `excludeAnalytics` frontmatter.

### Existing Code Patterns
- `BaseLayout.astro` already conditionally loads Plausible and RUM monitoring based on opt‑out.
- Error monitoring stub exists in `src/utils/error-monitoring.ts`.

### Advanced Code Patterns
- Use Sentry’s `beforeSend` hook to filter out non‑critical errors (e.g., ad blocker false positives).
- Set the release version automatically using Vercel’s `VERCEL_GIT_COMMIT_SHA`.

### Anti-Patterns
- Do not commit the Sentry DSN to version control.
- Do not initialise Sentry in development mode unless explicitly desired.
- Do not ignore the analytics opt‑out flag.

---

## TASK-010: Set Up Vale for Prose Linting
**Status**: [READY]

### Description
Integrate Vale as a prose linter for MDX content to maintain consistent tone, style, and clarity across case studies and documentation.

### Subtasks
- [ ] TASK-010.1: Install Vale (via package manager or direct binary) – development environment
- [ ] TASK-010.2: Create `vale.ini` configuration file at project root – `vale.ini`
- [ ] TASK-010.3: Enable recommended style packages (e.g., `write-good`, `proselint`) – `vale.ini`
- [ ] TASK-010.4: Configure Vale to lint `.mdx` files in `src/content/` – `vale.ini`
- [ ] TASK-010.5: Add Vale to Lefthook pre‑commit hook – `lefthook.yml`
- [ ] TASK-010.6: Add Vale step to CI workflow – `.github/workflows/ci.yml`

### Related Files
- `vale.ini`
- `lefthook.yml`
- `.github/workflows/ci.yml`

### Definition of Done
- Vale runs locally and in CI on all MDX content.
- Linting warnings help authors maintain consistent tone and catch common prose issues.
- The configuration is not overly strict—it focuses on clarity, not pedantic grammar rules.

### Out of Scope
- Creating custom Vale rules for this specific project (use existing style guides).
- Enforcing a specific academic style (focus on plain English).

### Strict Rules to Follow
- Use existing Vale styles (`write-good`, `proselint`) rather than creating custom rules initially.
- Configure the `MinAlertLevel` to `suggestion` to avoid blocking commits unnecessarily.
- Allow ignoring specific lines with `<!-- vale off -->` comments.

### Existing Code Patterns
- Content collections are in `src/content/` with `.mdx` extensions.
- Lefthook is already configured for pre‑commit linting.

### Advanced Code Patterns
- Create a project‑specific vocabulary file for technical terms (Astro, Vitest, etc.).
- Use Vale’s `BasedOnStyles` to extend existing style guides with custom overrides.

### Anti-Patterns
- Do not make Vale rules so strict that they discourage writing.
- Do not ignore Vale warnings without review; they indicate potential readability issues.

---

## TASK-011: Configure Release Please for Automated Releases
**Status**: [READY]

### Description
Automate versioning and changelog generation using Release Please, driven by Conventional Commits.

### Subtasks
- [ ] TASK-011.1: Install `release-please` as a dev dependency or use the GitHub Action – `package.json` or `.github/workflows/release-please.yml`
- [ ] TASK-011.2: Create `.release-please-config.json` with Node.js release type – `.release-please-config.json`
- [ ] TASK-011.3: Configure Release Please workflow in GitHub Actions – `.github/workflows/release-please.yml`
- [ ] TASK-011.4: Ensure `version` in `package.json` is managed by Release Please (initial value `0.0.0` or current version) – `package.json`

### Related Files
- `.release-please-config.json`
- `.github/workflows/release-please.yml`
- `package.json`

### Definition of Done
- Release Please creates a release PR when changes are pushed to `main`.
- Merging the release PR tags a new version and generates a changelog entry.
- The changelog follows the Conventional Commits format.
- No manual version bumps are required.

### Out of Scope
- Publishing to npm (the site is not an npm package).
- Automated deployment triggers based on releases (already handled by Vercel).

### Strict Rules to Follow
- Follow semantic versioning (`major.minor.patch`) strictly.
- Use Conventional Commits for all commit messages to drive version bumps.
- The `release-type` must be set to `node`.
- Do not manually edit the changelog; it is generated from commit history.

### Existing Code Patterns
- Commitlint is already configured to enforce Conventional Commits.
- The project uses GitHub Actions for CI.

### Advanced Code Patterns
- Use Release Please's `changelog-sections` to customise the changelog format.
- Configure Release Please to create GitHub Releases with assets.

### Anti-Patterns
- Do not bypass Release Please by manually tagging versions.
- Do not skip version numbers (always increment).

---

# Comprehensive Inspection Report

*Generated from /inspect-all workflow on 2026-04-22*

## Executive Summary
- **Total Critical Issues**: 4
- **Total High Priority Issues**: 7
- **Total Medium Priority Issues**: 8
- **Total Low Priority Issues**: 409 (mostly debug code in test files)

## Security Issues

### Critical
- **CSP Disabled**: Content Security Policy is disabled in `astro.config.mjs` (line 75: `enabled: false`). This is a critical security vulnerability that exposes the site to XSS attacks. The TODO comment on line 72 indicates this is a pre-existing issue with CSP directives format.

### High Priority
- **innerHTML Usage Without Sanitization**: Found in multiple files:
  - `src/utils/error-monitoring.ts:312`
  - `src/utils/chart-utils.ts:62`
  - `src/pages/search.astro:295, 311`
  - `src/components/ErrorBoundary.astro:24, 83, 98, 112`
- **TypeScript 'any' Types**: Bypasses type checking in multiple files:
  - `src/utils/chart-utils.ts:36, 40`
  - `src/pages/capabilities/[slug].astro:104, 121`
  - `src/components/ui/ComparisonTable.astro:30`
  - `src/components/TrustCues.astro:110`
  - `src/components/MetricsGrid.astro:13`
  - `src/components/DashboardWidgets.astro:16`

### Medium Priority
- **History API Overrides**: Can break navigation in:
  - `src/utils/rum-monitoring.ts:301, 304, 316`
  - `src/components/ErrorBoundary.astro:47, 50, 58`
- **console.log in Production Code**:
  - `src/pages/api/generate-pdf.ts:55`
  - `src/layouts/BaseLayout.astro:180` (service worker registration - acceptable)

### Low Priority
- **Security Scan Issues**: 409 issues found (43 HIGH, 23 MEDIUM, 343 LOW)
  - HIGH: dangerousFunctions (37), XSS patterns (6)
  - MEDIUM: insecureHttp (23) - mostly in test files
  - LOW: debugCode (343) - mostly console.log in test files

## Code Quality Issues

### Critical
- **TypeScript Check Failed**: 150 errors found when running `npm run check`
- **ESLint Configuration Broken**: Missing `eslint-plugin-jsx-a11y` dependency prevents linting

### High Priority
- **Large Components**:
  - `DashboardWidgets.astro`: 371 lines (potential god component)
  - `MetricsGrid.astro`: 258 lines
- **Multiple 'any' Types**: Throughout codebase, bypassing type safety

### Medium Priority
- **Code Smells**: Components with mixed concerns and excessive complexity

## Architecture Issues

### High Priority
- **God Component**: `DashboardWidgets.astro` (371 lines) handles multiple responsibilities:
  - Data conversion
  - Chart configuration
  - Summary statistics
  - Category breakdown
  - Performance trends
- **Large Component**: `MetricsGrid.astro` (258 lines) needs review for potential refactoring

### Medium Priority
- **Component Coupling**: Some components have tight coupling to data structures
- **Separation of Concerns**: Some components mix data fetching, rendering, and business logic

## Performance Issues

### Blocker
- **Lighthouse CI Cannot Run**: Chrome not installed, prevents performance validation

### Good Configuration
- Image optimization correctly configured (Sharp + AVIF)
- Prefetch configured correctly
- Build successful

## Accessibility Issues

### Blocker
- **Mobile Safari Tests Timeout**: 36 tests failed due to timeout (environment issue)
- **Partial Success**: 12 tests passed (Desktop Chrome/Firefox)

### Note
Timeout issues appear to be environment-related, not actual accessibility violations. Desktop browser tests passed successfully.

## Content Issues

### Good
- No broken image references in content
- `metrics.json` properly structured with 9 metrics
- Content collections properly configured with Zod schemas
- No orphaned content detected

---

## TASK-012: Enable Content Security Policy
**Status**: [READY]

**Priority / Urgency**
Critical - CSP disabled exposes site to XSS attacks

**Research / Investigation**
Review CSP directives format for Astro 6 (pre-existing issue noted in line 72 of astro.config.mjs)

**Related Files**
- `astro.config.mjs`
- `vercel.json`

**Definition of Done**
CSP enabled and properly configured with hash-based approach for static sites

**Acceptance Criteria**
- Set `enabled: true` in astro.config.mjs security.csp
- CSP directives properly formatted (fix TODO comment on line 72)
- Build completes successfully with CSP enabled
- No CSP violations in browser console

**Out of Scope**
- Implementing nonce-based CSP (not needed for static site)
- CSP for third-party scripts (currently minimal third-party usage)

**Dependencies**
None

**Estimated Effort**
1-2 hours

**Testing Requirements**
- Build test with CSP enabled
- Manual browser console check for CSP violations
- Verify all scripts load correctly

**Validation Steps**
- Set `enabled: true` in astro.config.mjs
- Run `npm run build`
- Check browser console for CSP violations
- Verify site functions correctly

**Strict Rules**
- CSP must be enabled (AGENTS.md security guidelines)
- No `unsafe-inline` needed - Astro 6 uses hash-based approach
- Remove TODO comment once CSP is properly configured

**Existing Code Patterns**
- vercel.json already has security headers configured
- CSP configuration exists but is disabled

**Advanced Code Patterns**
- Use Astro's automatic script hash generation
- Configure CSP directives as object or array based on Astro 6 requirements

**Anti-Patterns**
- Leaving CSP disabled
- Using `unsafe-inline` when hash-based approach is available

---

## TASK-013: Fix TypeScript Check Errors
**Status**: [READY]

**Priority / Urgency**
Critical - 150 TypeScript errors prevent type safety validation

**Research / Investigation**
Review TypeScript error output to categorize and prioritize fixes

**Related Files**
- Multiple files across src/ and tests/
- `tsconfig.json`

**Definition of Done**
TypeScript check passes with zero errors

**Acceptance Criteria**
- Run `npm run check` with exit code 0
- All implicit any types resolved
- All type errors fixed
- Strict mode compliance maintained

**Out of Scope**
- Changing TypeScript configuration to be less strict
- Using `@ts-ignore` to suppress errors

**Dependencies**
None

**Estimated Effort**
4-6 hours

**Testing Requirements**
- Run `npm run check` after fixes
- Run build to ensure no runtime errors
- Type validation for all changed files

**Validation Steps**
- Run `npm run check`
- Fix errors systematically by category
- Re-run check until zero errors

**Strict Rules**
- TypeScript strict mode must remain enabled
- No `@ts-ignore` or `@ts-expect-error` without documented reason
- All types must be properly defined

**Existing Code Patterns**
- Zod schemas for type safety in content collections
- Type imports from utils

**Advanced Code Patterns**
- Use utility types (Pick, Omit, Partial) to reduce duplication
- Create shared type definitions in separate files

**Anti-Patterns**
- Using `any` type to bypass errors
- Disabling strict mode
- Ignoring type errors

---

## TASK-014: Install Missing ESLint Dependency
**Status**: [READY]

**Priority / Urgency**
High - ESLint broken prevents code quality checks

**Research / Investigation**
None required

**Related Files**
- `package.json`
- `eslint.config.js`

**Definition of Done**
ESLint runs successfully with all required plugins

**Acceptance Criteria**
- Install `eslint-plugin-jsx-a11y` dependency
- Run `npm run lint` with exit code 0
- No missing dependency errors

**Out of Scope**
- Adding new ESLint rules beyond current configuration

**Dependencies**
None

**Estimated Effort**
15 minutes

**Testing Requirements**
- Run `npm run lint` after installation
- Verify no dependency errors

**Validation Steps**
- Run `npm install --save-dev eslint-plugin-jsx-a11y`
- Run `npm run lint`
- Verify successful lint run

**Strict Rules**
- Use exact version matching peer dependencies
- Commit package-lock.json with new dependency

**Existing Code Patterns**
- ESLint flat config in eslint.config.js
- Security plugins already configured

**Advanced Code Patterns**
N/A

**Anti-Patterns**
- Installing without saving to devDependencies
- Using incompatible version

---

## TASK-015: Refactor DashboardWidgets God Component
**Status**: [READY]

**Priority / Urgency**
High - 371-line component violates single responsibility principle

**Research / Investigation**
Analyze component responsibilities and identify extraction points

**Related Files**
- `src/components/DashboardWidgets.astro`
- `src/utils/metrics.ts`

**Definition of Done**
Component split into smaller, focused components with single responsibilities

**Acceptance Criteria**
- Extract chart configuration logic to separate utility
- Extract summary stats to separate component
- Extract category breakdown to separate component
- Each component <150 lines
- Maintain all existing functionality

**Out of Scope**
- Changing visual design
- Altering data structure

**Dependencies**
TASK-013 (TypeScript errors may block refactoring)

**Estimated Effort**
3-4 hours

**Testing Requirements**
- Visual regression tests for each extracted component
- Integration test for refactored dashboard
- Ensure no functionality lost

**Validation Steps**
- Extract components one at a time
- Test after each extraction
- Verify dashboard renders correctly
- Check all interactive elements work

**Strict Rules**
- Maintain backward compatibility
- No breaking changes to props interface
- Follow single responsibility principle

**Existing Code Patterns**
- Smaller components in src/components/
- Utility functions in src/utils/

**Advanced Code Patterns**
- Use composition pattern
- Consider render props for flexibility

**Anti-Patterns**
- Creating components without clear purpose
- Passing too many props (prop drilling)
- Mixing concerns in new components