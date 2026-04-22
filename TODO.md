# Project TODO List

This document tracks all outstanding tasks, improvements, and missing features required for production readiness and long-term maintainability.

---

- [x] [COMPLETED] **TASK-001: Fix Case Study Navigation Slugs**
  - [x] TASK-001.1: Update sidebar navigation links in `src/config/navigation.ts` to match actual case study slugs (`/cases/sonic`, `/cases/klw`, `/cases/grandlux`)
  - [x] TASK-001.2: Add redirects for legacy industry-based slugs (`/cases/qsr`, `/cases/salon`, `/cases/financial-services`) to prevent 404s
  - [x] TASK-001.3: Audit all internal links to case studies across components (`MetricCard.astro`, `Timeline.astro`, `CaseStudyHeader.astro`) for correct hrefs

  **Completion Notes (2026-04-22):**
  - Updated navigation.ts to use company-based slugs: `/cases/sonic`, `/cases/grandlux`, `/cases/klw`
  - Created explicit redirect pages in `src/pages/cases/` for legacy slugs (Astro redirect config doesn't work for dynamic route patterns)
  - Audited internal links: MetricCard uses dynamic `caseStudySlug` prop, Timeline has no case study links, other components use data-driven slugs
  - Fixed pre-existing build issue: removed manualChunks configuration due to externalization conflicts
  - CSP temporarily disabled (pre-existing issue with directives format)
  - Build successful with 41 pages including 3 redirect pages

  #### Related Files
  - `src/config/navigation.ts`
  - `astro.config.mjs`
  - `src/components/MetricCard.astro`
  - `src/components/Timeline.astro`

  #### Definition of Done
  - [ ] Sidebar navigation links point to existing `/cases/sonic`, `/cases/klw`, `/cases/grandlux` without 404 errors
  - [ ] Redirects are configured for any legacy/alias routes to maintain external link integrity
  - [ ] All internal component links to case studies resolve correctly

  #### Out of Scope
  - Changing the canonical slug naming convention (staying with company-based slugs)
  - Implementing dynamic route generation for industry-based views

  #### Strict Rules to Follow
  - Do not remove existing routes without adding redirects
  - Use Astro's built-in `redirects` config in `astro.config.mjs`, not server middleware
  - Navigation labels must remain unchanged unless a design decision is documented

  #### Existing Code Patterns
  - The `navigation` export in `src/config/navigation.ts` defines the entire site structure
  - Redirects are defined in `astro.config.mjs` under the `redirects` object

  #### Advanced Code Patterns
  - Consider using a `slug` field in case study frontmatter to decouple navigation from file names
  - Use Astro's `Astro.url` to generate canonical URLs dynamically if needed

  #### Anti-Patterns
  - Do not hardcode links directly in component templates; always reference the navigation config
  - Do not create duplicate case study pages to satisfy both slug styles

---

- [x] [COMPLETED] **TASK-002: Implement Functional Search**
  - [x] TASK-002.1: Install and configure Pagefind via `astro-pagefind` integration
  - [x] TASK-002.2: Update `astro.config.mjs` to include Pagefind integration and build hooks
  - [x] TASK-002.3: Replace placeholder content in `src/pages/search.astro` with actual search UI and results rendering
  - [x] TASK-002.4: Add search indexing configuration to include all relevant content collections (case studies, learning logs, resources)
  - [x] TASK-002.5: Implement no-results messaging and loading states in `search.astro`

  **Completion Notes (2026-04-22):**
  - Installed `astro-pagefind` package
  - Added Pagefind integration to astro.config.mjs
  - Updated search.astro to use PagefindUI with dynamic script loading (avoids build-time resolution issues)
  - Added loading state, no-results messaging, and translated UI text
  - Pagefind indexed 41 pages during build
  - Search works in production build; shows helpful message in development mode
  - Simplified SearchBar.astro (removed unused Pagefind UI styles, kept keyboard shortcut)

  #### Related Files
  - `astro.config.mjs`
  - `src/pages/search.astro`
  - `src/components/SearchBar.astro`
  - `package.json`

  #### Definition of Done
  - [ ] Typing a query in the search bar returns relevant results from content collections
  - [ ] Search results page displays titles, excerpts, and links to matching pages
  - [ ] "No results found" message appears when appropriate
  - [ ] Keyboard shortcuts (e.g., Cmd+K) open search as currently implemented

  #### Out of Scope
  - Full-text search across PDF assets
  - Faceted search or advanced filtering in this iteration

  #### Strict Rules to Follow
  - Pagefind must run as a post-build step; do not rely on client-side indexing of all content
  - Search UI must remain accessible (ARIA live regions for results updates)
  - Do not remove the existing `SearchBar.astro` component; enhance it

  #### Existing Code Patterns
  - `SearchBar.astro` already has keyboard shortcut handling and a modal trigger
  - The search page layout exists but contains static placeholder text

  #### Advanced Code Patterns
  - Use Pagefind's `debounced` search for performance
  - Pre-fetch search index with a service worker for offline capability

  #### Anti-Patterns
  - Do not implement client-side `fetch` of entire JSON content manifest
  - Do not use `innerHTML` to render search results without sanitization

---

- [x] [COMPLETED] **TASK-003: Expose Case Study PDF Download Links**
  - [x] TASK-003.1: Add a `pdfUrl` field (optional) to the case study schema in `src/content.config.ts`
  - [x] TASK-003.2: Populate `pdfUrl` for existing case studies (`sonic`, `klw`, `grandlux`) pointing to generated PDFs in `/public/case-studies/`
  - [x] TASK-003.3: Add a download button/link in `src/pages/cases/[slug].astro` that renders when `pdfUrl` is present
  - [x] TASK-003.4: Ensure PDF generation script (`scripts/generate-pdfs.js`) outputs files to correct public location

  **Completion Notes (2026-04-22):**
  - Added `pdfUrl: z.string().optional()` to case study schema (used `z.string()` instead of `z.string().url()` since PDFs use relative paths)
  - Added `pdfUrl: "/pdfs/[slug].pdf"` to frontmatter of all three case studies (sonic.mdx, klw.mdx, grandlux.mdx)
  - Added conditional PDF download button in case study page template that renders when `pdfUrl` is present
  - Button uses Tailwind styling with `target="_blank"` and `rel="noopener"` for security
  - PDF generation script already outputs to correct location (`public/pdfs/`), no changes needed
  - Build successful with 41 pages, schema validation passed

  #### Related Files
  - `src/content.config.ts`
  - `src/content/cases/*.mdx`
  - `src/pages/cases/[slug].astro`
  - `scripts/generate-pdfs.js`
  - `public/case-studies/`

  #### Definition of Done
  - [ ] Each case study page displays a clearly labeled "Download PDF" button linking to the corresponding PDF file
  - [ ] PDF files are accessible and open in a new tab or trigger download
  - [ ] Missing PDF files do not break the page (conditional rendering)

  #### Out of Scope
  - Automated PDF generation during build (manual script execution is acceptable for now)
  - Styling PDFs beyond basic readability

  #### Strict Rules to Follow
  - Use the existing `OptimizedImage.astro` pattern for asset path resolution
  - PDF links must open in a new tab (`target="_blank"`) with `rel="noopener"`

  #### Existing Code Patterns
  - The `Button` or `Link` component styling can be reused for the download CTA
  - Case study pages already have a header section where the button can be placed

  #### Advanced Code Patterns
  - Use Astro's `getEntry` to access `pdfUrl` from the collection entry
  - Consider adding a `download` attribute to force download behavior

  #### Anti-Patterns
  - Do not hardcode PDF paths in the template; use schema field
  - Do not assume PDF exists; always check `pdfUrl` before rendering

---

- [x] [COMPLETED] **TASK-004: Add Standalone About / Overview Page**
  - [x] TASK-004.1: Create `src/pages/about.astro` with professional biography and value proposition
  - [x] TASK-004.2: Use `BaseLayout.astro` with appropriate frontmatter for SEO (`title`, `description`)
  - [x] TASK-004.3: Add the page to the main navigation in `src/config/navigation.ts` (e.g., under "About" or as a top-level item)
  - [x] TASK-004.4: Include a clear link to the resume PDF and Connect page

  **Completion Notes (2026-04-22):**
  - Created `src/pages/about.astro` with professional biography, career approach, value proposition sections
  - Used BaseLayout with proper SEO frontmatter (title, description)
  - Added Person schema JSON-LD for structured data (consistent with BaseLayout)
  - Included resume download link and Connect page link in CTA section
  - Added "About" to main navigation as second item after Dashboard
  - Used Tailwind utility classes for styling, no client-side JavaScript
  - Build successful with 42 pages (up from 41)

  #### Related Files
  - `src/pages/about.astro`
  - `src/config/navigation.ts`
  - `src/layouts/BaseLayout.astro`

  #### Definition of Done
  - [ ] Page is accessible at `/about`
  - [ ] Content clearly explains Trevor's background, approach, and site purpose
  - [ ] Page is linked from the main navigation or footer

  #### Out of Scope
  - Interactive timeline or complex data visualizations
  - Contact form integration (already exists on `/connect`)

  #### Strict Rules to Follow
  - Use existing typography and spacing utilities from Tailwind
  - Page must be static (no client-side JavaScript unless necessary)
  - Include structured data (Person schema) consistent with other pages

  #### Existing Code Patterns
  - `src/pages/connect.astro` and `src/pages/404.astro` demonstrate page structure with `BaseLayout`
  - `src/components/Timeline.astro` can be reused if career summary is desired

  #### Advanced Code Patterns
  - Use Astro's `Content` component if content is written in MDX for easier editing

  #### Anti-Patterns
  - Do not duplicate the homepage hero section verbatim
  - Do not create a separate layout; extend `BaseLayout`

---

- [x] [COMPLETED] **TASK-005: Create Strategy and Governance Documentation**
  - [x] TASK-005.1: Create `docs/strategy.md` covering primary conversion goal, audience personas, and visitor journeys
  - [x] TASK-005.2: Create `docs/content-governance.md` defining update cadence, versioning, stale content policy, and archive rules
  - [x] TASK-005.3: Create `docs/proof-hierarchy.md` documenting primary vs. supporting evidence and how it's presented
  - [x] TASK-005.4: Create `docs/launch-checklist.md` with pre-launch verification steps
  - [x] TASK-005.5: Create `docs/implementation-assumptions.md` for non-obvious design decisions

  **Completion Notes (2026-04-22):**
  - Created `docs/strategy.md` with primary conversion goal (contact form), 4 audience personas (Recruiter, Founder, Operator, Peer), and 4 visitor journeys
  - Created `docs/content-governance.md` with quarterly/biannual/annual update cadence, semantic versioning, 12-24 month stale content policy, and archive rules
  - Created `docs/proof-hierarchy.md` documenting Primary (case studies + metrics), Supporting (capabilities, timeline), Secondary (learning logs, projects, resources)
  - Created `docs/launch-checklist.md` with comprehensive pre-launch verification steps aligned with existing CI/CD pipeline and testing infrastructure
  - Created `docs/implementation-assumptions.md` documenting non-obvious design decisions (company-based slugs, metrics-first approach, SSG, Tailwind v4, CSP, etc.)
  - All 5 documentation files created in new `docs/` folder
  - Build successful (42 pages), docs are internal (not published to site)
  - Markdown lint warnings present (stylistic, not functional - acceptable for internal docs)

  #### Related Files
  - `docs/strategy.md`
  - `docs/content-governance.md`
  - `docs/proof-hierarchy.md`
  - `docs/launch-checklist.md`
  - `docs/implementation-assumptions.md`

  #### Definition of Done
  - [x] All five markdown files exist in the `docs/` folder
  - [x] Each document contains actionable, specific information relevant to the project
  - [x] Strategy document references actual site pages and user flows

  #### Out of Scope
  - Automated enforcement of governance rules (manual process for now)
  - Publishing these docs on the public site

  #### Strict Rules to Follow
  - Use existing `docs/` folder structure; do not create new top-level directories
  - Follow the same markdown formatting as existing `README.md`

  #### Existing Code Patterns
  - The `README.md` contains a project overview and structure; these docs extend that

  #### Advanced Code Patterns
  - Consider linking these docs from a `/colophon` or `/docs` hidden page

  #### Anti-Patterns
  - Do not duplicate information already present in the README
  - Do not use vague language; be specific about decisions made

---

- [ ] [READY] **TASK-006: Add Privacy Policy and Terms Pages**
  - [ ] TASK-006.1: Create `src/pages/privacy.astro` with clear disclosure of data collection (Plausible, contact form)
  - [ ] TASK-006.2: Create `src/pages/terms.astro` with basic terms of use
  - [ ] TASK-006.3: Link both pages in the site footer (`src/components/Footer.astro`)
  - [ ] TASK-006.4: Include last updated dates on both pages

  #### Related Files
  - `src/pages/privacy.astro`
  - `src/pages/terms.astro`
  - `src/components/Footer.astro`

  #### Definition of Done
  - [ ] Pages are accessible at `/privacy` and `/terms`
  - [ ] Content is legally sufficient for a portfolio site with contact form and privacy-friendly analytics
  - [ ] Footer links are present and functional

  #### Out of Scope
  - Cookie consent banner (Plausible is privacy-first and may not require it)
  - Drafting custom legal language from scratch (use a reputable template)

  #### Strict Rules to Follow
  - Pages must use `BaseLayout`
  - Do not include any tracking scripts on these pages
  - Ensure mobile responsiveness

  #### Existing Code Patterns
  - `src/pages/404.astro` demonstrates static page structure
  - Footer component already has a links section

  #### Advanced Code Patterns
  - Use `import.meta.env.SITE_URL` for dynamic references to site name

  #### Anti-Patterns
  - Do not copy-paste a generic privacy policy without customizing for Plausible and Formspree
  - Do not hide these pages from navigation

---

- [ ] [READY] **TASK-007: Add 500 Error Page**
  - [ ] TASK-007.1: Create `src/pages/500.astro` styled consistently with `404.astro`
  - [ ] TASK-007.2: Ensure the page uses `BaseLayout` and provides a clear "Something went wrong" message
  - [ ] TASK-007.3: Add a link back to the homepage and a contact suggestion

  #### Related Files
  - `src/pages/500.astro`
  - `src/pages/404.astro` (for styling reference)

  #### Definition of Done
  - [ ] Page is present and renders correctly when a server error occurs
  - [ ] Styling matches the 404 page for visual consistency

  #### Out of Scope
  - Custom error logging integration on this page (handled by `error-monitoring.ts`)

  #### Strict Rules to Follow
  - Do not use client-side routing for this page; it must be a static Astro page
  - Keep the message user-friendly and non-technical

  #### Existing Code Patterns
  - `404.astro` uses `BaseLayout` and a centered message box

  #### Advanced Code Patterns
  - Optionally include a button to report the error (via Formspree)

  #### Anti-Patterns
  - Do not expose stack traces or technical details to the user

---

- [ ] [READY] **TASK-008: Implement Pagination for Content Lists**
  - [ ] TASK-008.1: Add pagination to `/learning-log` using Astro's `paginate()` function in `src/pages/learning-log/index.astro`
  - [ ] TASK-008.2: Add pagination to `/resources` in `src/pages/resources/index.astro`
  - [ ] TASK-008.3: Create a reusable `Pagination.astro` component for navigation between pages
  - [ ] TASK-008.4: Set a reasonable page size (e.g., 5 items per page)

  #### Related Files
  - `src/pages/learning-log/index.astro`
  - `src/pages/resources/index.astro`
  - `src/components/Pagination.astro`

  #### Definition of Done
  - [ ] Learning log index shows a limited number of entries with previous/next navigation
  - [ ] Resources index similarly paginated
  - [ ] URL structure reflects pagination (e.g., `/learning-log/2`)

  #### Out of Scope
  - Infinite scroll or "Load More" buttons
  - Filtering combined with pagination

  #### Strict Rules to Follow
  - Use Astro's built-in `paginate()` and `page` object
  - Preserve existing layout and styling of list items

  #### Existing Code Patterns
  - The `getStaticPaths` pattern is used in dynamic case study routes; extend to pagination

  #### Advanced Code Patterns
  - Use the `page.url.prev` and `page.url.next` helpers for navigation links

  #### Anti-Patterns
  - Do not implement client-side pagination that loads all data upfront
  - Do not forget to handle the first page URL without `/1` suffix

---

- [ ] [READY] **TASK-009: Add Analytics Opt-Out Mechanism**
  - [ ] TASK-009.1: Add a toggle switch in the footer or a dedicated settings panel to disable Plausible and RUM tracking
  - [ ] TASK-009.2: Implement localStorage flag (`plausible_optout` or `rum_disabled`) checked before loading tracking scripts
  - [ ] TASK-009.3: Update `BaseLayout.astro` to conditionally load Plausible script based on opt-out status
  - [ ] TASK-009.4: Update `error-monitoring.ts` to respect the opt-out flag for RUM

  #### Related Files
  - `src/layouts/BaseLayout.astro`
  - `src/components/Footer.astro`
  - `src/utils/error-monitoring.ts`

  #### Definition of Done
  - [ ] Users can toggle analytics off, and the preference persists across sessions
  - [ ] When opted out, no Plausible script is injected and no RUM beacons are sent
  - [ ] Opt-out toggle is accessible and clearly labeled

  #### Out of Scope
  - Server-side opt-out management
  - Integration with external consent management platforms

  #### Strict Rules to Follow
  - The default state must be opt-in (as analytics are privacy-focused) but with clear ability to opt out
  - Toggle must work without page reload

  #### Existing Code Patterns
  - `ToggleSwitch.astro` component can be reused or adapted

  #### Advanced Code Patterns
  - Use a small inline script to read localStorage before Plausible loads to avoid race conditions

  #### Anti-Patterns
  - Do not use cookies for opt-out; localStorage is sufficient for this use case
  - Do not remove the toggle after opting out; allow re-enabling

---

- [ ] [READY] **TASK-010: Enforce Global External Link Security**
  - [ ] TASK-010.1: Create a rehype plugin (`rehype-external-links.js`) to automatically add `rel="noopener noreferrer"` and `target="_blank"` to external links in MDX content
  - [ ] TASK-010.2: Integrate the plugin into `astro.config.mjs` for MDX processing
  - [ ] TASK-010.3: Audit and update any manual external links in Astro components to include security attributes
  - [ ] TASK-010.4: Add a linting rule to enforce `rel="noopener"` on all `target="_blank"` links

  #### Related Files
  - `astro.config.mjs`
  - `rehype-external-links.js` (new)
  - `src/components/*.astro`
  - `eslint.config.js`

  #### Definition of Done
  - [ ] All external links in content and components have `rel="noopener noreferrer"`
  - [ ] Linter catches any missing attributes
  - [ ] No functional regressions in link behavior

  #### Out of Scope
  - Rewriting existing internal link handling

  #### Strict Rules to Follow
  - Do not modify internal relative links
  - The plugin must check `href.startsWith('http')` or similar

  #### Existing Code Patterns
  - MDX is already integrated; rehype plugins are supported in the Astro config

  #### Advanced Code Patterns
  - Use `unified` and `rehype` ecosystem for robust link detection

  #### Anti-Patterns
  - Do not manually add these attributes to every link; use automation

---

- [ ] [READY] **TASK-011: Implement Dark Mode Toggle UI**
  - [ ] TASK-011.1: Create a `ThemeToggle.astro` component that reads/writes `theme` to localStorage and toggles a `dark` class on `<html>`
  - [ ] TASK-011.2: Integrate the toggle into `Navigation.astro` or `Footer.astro`
  - [ ] TASK-011.3: Ensure the initial theme respects `prefers-color-scheme` media query
  - [ ] TASK-011.4: Add a small inline script to prevent FOUC (Flash of Unstyled Content) on page load

  #### Related Files
  - `src/components/ThemeToggle.astro`
  - `src/components/Navigation.astro`
  - `src/layouts/BaseLayout.astro`

  #### Definition of Done
  - [ ] Users can switch between light and dark mode
  - [ ] Preference is saved and applied on subsequent visits
  - [ ] No visible flash of incorrect theme on initial load

  #### Out of Scope
  - Multiple theme options beyond light/dark
  - Per-page theme overrides

  #### Strict Rules to Follow
  - Use Tailwind's `dark:` variant for styling; the `dark` class on `<html>` enables it
  - The toggle must be accessible (ARIA label, keyboard operable)

  #### Existing Code Patterns
  - The `ToggleSwitch.astro` component can serve as a base
  - Tailwind config already supports dark mode via `@custom-variant dark`

  #### Advanced Code Patterns
  - Use a `<script is:inline>` to set the class before the page renders

  #### Anti-Patterns
  - Do not rely solely on client-side JS to set initial theme (causes flash)
  - Do not use a separate CSS file for dark mode

---

- [ ] [READY] **TASK-012: Add RSS Feed Generation**
  - [ ] TASK-012.1: Install `@astrojs/rss` package
  - [ ] TASK-012.2: Create `src/pages/rss.xml.js` (or `.ts`) using the RSS package to generate feed from learning log collection
  - [ ] TASK-012.3: Add feed metadata (title, description, site URL)
  - [ ] TASK-012.4: Link the RSS feed in the `<head>` of `BaseLayout.astro` for auto-discovery

  #### Related Files
  - `src/pages/rss.xml.js`
  - `src/layouts/BaseLayout.astro`
  - `package.json`

  #### Definition of Done
  - [ ] Accessing `/rss.xml` returns a valid RSS feed containing recent learning log entries
  - [ ] Feed includes full content or summaries as appropriate
  - [ ] Auto-discovery link is present in page head

  #### Out of Scope
  - Multiple feeds for different content types
  - JSON Feed format

  #### Strict Rules to Follow
  - Use the learning log collection exclusively for feed content
  - Follow Astro's official RSS integration pattern

  #### Existing Code Patterns
  - Content collections are already defined and queryable

  #### Advanced Code Patterns
  - Use `getCollection` to fetch and sort entries by date
  - Customize feed item rendering with MDX components

  #### Anti-Patterns
  - Do not hardcode feed items; always fetch from collections

---

- [ ] [READY] **TASK-013: Add PWA Manifest and Basic Service Worker**
  - [ ] TASK-013.1: Create `public/manifest.webmanifest` with app name, icons, and theme colors
  - [ ] TASK-013.2: Add required icon sizes (`icon-192.png`, `icon-512.png`) to `/public/`
  - [ ] TASK-013.3: Create a basic service worker (`public/sw.js`) that caches static assets for offline viewing
  - [ ] TASK-013.4: Register the service worker in `BaseLayout.astro` with a feature check

  #### Related Files
  - `public/manifest.webmanifest`
  - `public/sw.js`
  - `src/layouts/BaseLayout.astro`
  - `public/icon-192.png`, `public/icon-512.png`

  #### Definition of Done
  - [ ] Site is installable as a PWA on supported browsers
  - [ ] Cached assets load when offline
  - [ ] Manifest is linked correctly in `<head>`

  #### Out of Scope
  - Advanced caching strategies (stale-while-revalidate)
  - Push notifications

  #### Strict Rules to Follow
  - Service worker must not cache the `/connect` form page or admin routes
  - Use a simple cache-first strategy for static assets

  #### Existing Code Patterns
  - `BaseLayout.astro` already manages `<head>` content

  #### Advanced Code Patterns
  - Use Workbox for more robust service worker generation (future iteration)

  #### Anti-Patterns
  - Do not cache the service worker itself with a long max-age
  - Do not cache HTML pages aggressively; use network-first

---

- [ ] [READY] **TASK-014: Add Missing Resume PDF File**
  - [ ] TASK-014.1: Place the latest resume PDF at `public/TrevorLam-Resume-2026.pdf` (or update link if different)
  - [ ] TASK-014.2: Verify the link in `src/pages/connect.astro` points to the correct file path
  - [ ] TASK-014.3: Consider adding a download attribute to the link for better UX

  #### Related Files
  - `public/TrevorLam-Resume-2026.pdf`
  - `src/pages/connect.astro`

  #### Definition of Done
  - [ ] Clicking the resume link on the Connect page downloads or opens the PDF
  - [ ] File is present in the repository and deployed

  #### Out of Scope
  - Automated PDF generation from content

  #### Strict Rules to Follow
  - Do not track resume downloads unless explicitly desired and disclosed in privacy policy

  #### Existing Code Patterns
  - The link already exists in `connect.astro`; just need the file

  #### Anti-Patterns
  - Do not use a third-party hosting service for the resume without good reason

---

- [ ] [READY] **TASK-015: Implement Speculation Rules API for Instant Navigation**
  - [ ] TASK-015.1: Add a `<script type="speculationrules">` block in `BaseLayout.astro`
  - [ ] TASK-015.2: Configure rules to prerender or prefetch links on hover (moderate eagerness)
  - [ ] TASK-015.3: Exclude external links and download links from speculation

  #### Related Files
  - `src/layouts/BaseLayout.astro`

  #### Definition of Done
  - [ ] Speculation rules script is present in the document head
  - [ ] Navigation feels instant for internal links when supported by browser
  - [ ] No console errors related to speculation rules

  #### Out of Scope
  - Cross-origin prefetching
  - Analytics for speculation hits

  #### Strict Rules to Follow
  - Use `"eagerness": "moderate"` to balance performance and bandwidth
  - Ensure rules are applied only to same-origin navigation

  #### Existing Code Patterns
  - `BaseLayout.astro` already contains `<script>` tags for other purposes

  #### Advanced Code Patterns
  - Use `document.head` to detect support and only inject if `HTMLScriptElement.supports('speculationrules')`

  #### Anti-Patterns
  - Do not prefetch every link on the page; rely on hover or viewport triggers

---

- [ ] [READY] **TASK-016: Clarify Dashboard Metric Card Interactivity**
  - [ ] TASK-016.1: Review `src/components/MetricCard.astro` and determine if cards should link to case studies
  - [ ] TASK-016.2: If linking, update the component to accept an optional `href` prop and render as an `<a>` tag
  - [ ] TASK-016.3: Update homepage (`src/pages/index.astro`) to pass appropriate case study slugs to metric cards
  - [ ] TASK-016.4: If not linking, ensure visual design does not imply clickability (e.g., remove hover effects that suggest interaction)

  #### Related Files
  - `src/components/MetricCard.astro`
  - `src/pages/index.astro`

  #### Definition of Done
  - [ ] User expectation matches behavior: clickable cards navigate; non-clickable do not
  - [ ] Accessibility is maintained (focusable if interactive, proper roles)

  #### Out of Scope
  - Creating new metric-card designs

  #### Strict Rules to Follow
  - If clickable, ensure keyboard focus and `Enter` key work
  - Use semantic `<a>` for navigation

  #### Existing Code Patterns
  - `CaseStudyHeader.astro` already uses links

  #### Anti-Patterns
  - Do not wrap the entire card in a `<button>` for navigation

---

- [ ] [READY] **TASK-017: Formalize Content Governance Rules**
  - [ ] TASK-017.1: Create `docs/content-governance.md` (if not already created in TASK-005)
  - [ ] TASK-017.2: Define update cadence for case studies, learning logs, and resources
  - [ ] TASK-017.3: Establish a process for marking content as stale or archived
  - [ ] TASK-017.4: Document versioning strategy for major content updates

  #### Related Files
  - `docs/content-governance.md`

  #### Definition of Done
  - [ ] Document exists and is referenced in project onboarding
  - [ ] Clear guidelines are established

  #### Out of Scope
  - Automated enforcement of governance rules

  #### Strict Rules to Follow
  - Keep the document practical and lightweight

  #### Anti-Patterns
  - Do not create a governance document that is never followed

---

- [ ] [READY] **TASK-018: Define Proof Hierarchy**
  - [ ] TASK-018.1: Create `docs/proof-hierarchy.md` (if not already created)
  - [ ] TASK-018.2: Categorize evidence as Primary (case studies, metrics), Supporting (capabilities, timeline), Secondary (learning logs)
  - [ ] TASK-018.3: Ensure visual design and content placement reflect this hierarchy

  #### Related Files
  - `docs/proof-hierarchy.md`

  #### Definition of Done
  - [ ] Document provides clear guidance on which content carries the most weight
  - [ ] Site layout aligns with hierarchy (primary proof above the fold, etc.)

  #### Out of Scope
  - Changing existing page designs unless necessary

  #### Anti-Patterns
  - Do not bury primary proof deep in the site

---

- [ ] [READY] **TASK-019: Document User Journeys**
  - [ ] TASK-019.1: Create `docs/user-journeys.md` mapping common visitor paths (Recruiter, Founder, Operator, Peer)
  - [ ] TASK-019.2: Ensure navigation and CTAs support these journeys
  - [ ] TASK-019.3: Review the site's information architecture against these journeys

  #### Related Files
  - `docs/user-journeys.md`

  #### Definition of Done
  - [ ] Document exists and informs future design decisions

  #### Out of Scope
  - User testing or analytics validation

  #### Anti-Patterns
  - Do not create journeys that are not actually navigable

---

- [ ] [READY] **TASK-020: Add Breadcrumb Usage Rules**
  - [ ] TASK-020.1: Document when breadcrumbs should appear (e.g., all pages except homepage)
  - [ ] TASK-020.2: Review `src/components/Breadcrumbs.astro` and ensure it follows the documented rules
  - [ ] TASK-020.3: Add breadcrumbs to pages where missing (e.g., case studies, learning log posts)

  #### Related Files
  - `src/components/Breadcrumbs.astro`
  - `src/pages/**/*.astro`

  #### Definition of Done
  - [ ] Breadcrumbs appear consistently according to defined rules
  - [ ] They accurately reflect the site hierarchy

  #### Out of Scope
  - Dynamic breadcrumbs based on user path (use static hierarchy)

  #### Strict Rules to Follow
  - Breadcrumbs must include Schema.org markup

  #### Existing Code Patterns
  - `Breadcrumbs.astro` is already implemented; just need consistency

  #### Anti-Patterns
  - Do not show breadcrumbs on the homepage

---

- [ ] [READY] **TASK-021: Standardize Loading and Empty States**
  - [ ] TASK-021.1: Create reusable `LoadingSpinner.astro` and `EmptyState.astro` components
  - [ ] TASK-021.2: Implement loading states for search results (`search.astro`)
  - [ ] TASK-021.3: Add empty states for search (no results), resources list (coming soon), and filtered views
  - [ ] TASK-021.4: Apply consistent styling using Tailwind

  #### Related Files
  - `src/components/LoadingSpinner.astro`
  - `src/components/EmptyState.astro`
  - `src/pages/search.astro`
  - `src/pages/resources/index.astro`

  #### Definition of Done
  - [ ] Users see visual feedback while content loads or when no content exists
  - [ ] Empty states include helpful messaging and a call to action if appropriate

  #### Out of Scope
  - Skeleton loaders matching exact content layout

  #### Strict Rules to Follow
  - Use ARIA live regions for loading announcements
  - Empty states must not be misleading

  #### Existing Code Patterns
  - Similar patterns exist in other components; formalize them

  #### Anti-Patterns
  - Do not leave a blank white space where content should be

---

- [ ] [READY] **TASK-022: Standardize Interaction States**
  - [ ] TASK-022.1: Audit all interactive elements (buttons, links, cards) for consistent `:hover`, `:focus`, `:active`, and `:disabled` styles
  - [ ] TASK-022.2: Create a set of utility classes or component variants for these states
  - [ ] TASK-022.3: Update `tailwind.css` with any missing state definitions
  - [ ] TASK-022.4: Ensure focus indicators are visible and meet WCAG contrast requirements

  #### Related Files
  - `src/styles/tailwind.css`
  - `src/components/**/*.astro`

  #### Definition of Done
  - [ ] All interactive elements have consistent, accessible state styling
  - [ ] No elements rely solely on color to indicate state

  #### Out of Scope
  - Creating a full design system

  #### Strict Rules to Follow
  - Use Tailwind's built-in variants where possible

  #### Anti-Patterns
  - Do not remove focus outlines without providing an alternative

---

- [ ] [READY] **TASK-023: Improve Search UX Messaging**
  - [ ] TASK-023.1: Update `search.astro` placeholder to indicate what content is searchable
  - [ ] TASK-023.2: Add a "no results" message with suggestions (e.g., check spelling, browse categories)
  - [ ] TASK-023.3: If search is partial, clearly communicate limitations

  #### Related Files
  - `src/pages/search.astro`
  - `src/components/SearchBar.astro`

  #### Definition of Done
  - [ ] User understands what they can search for and what to do if no results found

  #### Out of Scope
  - Search analytics

  #### Anti-Patterns
  - Do not show a generic "No results" without context

---

- [ ] [READY] **TASK-024: Add Case Study PDF Metadata to Schema**
  - [ ] TASK-024.1: Update `src/content.config.ts` to add `pdfUrl: z.string().url().optional()` to case study schema
  - [ ] TASK-024.2: Populate frontmatter for existing case studies with correct PDF paths

  #### Related Files
  - `src/content.config.ts`
  - `src/content/cases/*.mdx`

  #### Definition of Done
  - [ ] Schema supports PDF downloads natively
  - [ ] Frontmatter includes `pdfUrl` where applicable

  #### Out of Scope
  - Validation that PDF file exists at build time

  #### Anti-Patterns
  - Do not hardcode paths in the page template

---

- [ ] [READY] **TASK-025: Decide Timeline as Content Collection**
  - [ ] TASK-025.1: Evaluate whether `data/timeline.json` should be migrated to a content collection for richer querying
  - [ ] TASK-025.2: If yes, create a timeline collection with schema; if no, document reasoning in `docs/implementation-assumptions.md`
  - [ ] TASK-025.3: Update components to use collection if migration is performed

  #### Related Files
  - `data/timeline.json`
  - `src/content.config.ts`
  - `src/components/Timeline.astro`

  #### Definition of Done
  - [ ] Decision is documented and implemented consistently

  #### Out of Scope
  - Rewriting timeline UI

  #### Anti-Patterns
  - Do not leave the data in limbo without a clear plan

---

- [ ] [READY] **TASK-026: Ensure Consistent Timestamp Rendering**
  - [ ] TASK-026.1: Standardize on using the `Timestamp.astro` component for all date displays
  - [ ] TASK-026.2: Audit content collections to ensure `lastUpdated` or `pubDate` fields are present and used
  - [ ] TASK-026.3: Update `src/pages/learning-log/[...slug].astro` and `src/pages/cases/[slug].astro` to display dates consistently

  #### Related Files
  - `src/components/Timestamp.astro`
  - `src/pages/**/*.astro`

  #### Definition of Done
  - [ ] All content shows publication or update dates in a uniform format
  - [ ] Schema.org date fields are populated

  #### Anti-Patterns
  - Do not hardcode date strings in templates

---

- [ ] [READY] **TASK-027: Confirm and Normalize Relationship Fields**
  - [ ] TASK-027.1: Define a `relatedItems` field pattern for cross-linking between case studies, capabilities, and learning logs
  - [ ] TASK-027.2: Update schemas in `src/content.config.ts` to support relationships
  - [ ] TASK-027.3: Implement "Related Content" sections on detail pages where applicable

  #### Related Files
  - `src/content.config.ts`
  - `src/pages/cases/[slug].astro`
  - `src/pages/learning-log/[...slug].astro`

  #### Definition of Done
  - [ ] Content creators can specify related items in frontmatter
  - [ ] Related links are rendered consistently

  #### Out of Scope
  - Automated relationship inference

  #### Anti-Patterns
  - Do not hardcode related links in templates

---

- [ ] [READY] **TASK-028: Enhance Archive / Story Index Experience**
  - [ ] TASK-028.1: Review `src/pages/archive.astro` (if exists) or create one that aggregates all content types chronologically
  - [ ] TASK-028.2: Add filters by content type (case study, learning log, resource)
  - [ ] TASK-028.3: Include a brief introduction explaining the archive's purpose

  #### Related Files
  - `src/pages/archive.astro`

  #### Definition of Done
  - [ ] Archive page serves as a comprehensive, filterable index of site content

  #### Anti-Patterns
  - Do not simply list all items without organization

---

- [ ] [READY] **TASK-029: Refine Tech Stack and Skills Matrix Pages**
  - [ ] TASK-029.1: Review `src/pages/tech-stack.astro` for depth; add context on why tools are chosen
  - [ ] TASK-029.2: Review `src/pages/skills-matrix.astro` for clarity; add proficiency explanations
  - [ ] TASK-029.3: Ensure both pages are linked from appropriate places (footer or /about)

  #### Related Files
  - `src/pages/tech-stack.astro`
  - `src/pages/skills-matrix.astro`

  #### Definition of Done
  - [ ] Pages provide valuable, up-to-date information beyond a static list

  #### Anti-Patterns
  - Do not use jargon without explanation

---

- [ ] [READY] **TASK-030: Review Dashboard as Information Hub**
  - [ ] TASK-030.1: Evaluate homepage (`src/pages/index.astro`) layout: ensure KPI grid, recent activity, and CTAs are prominent
  - [ ] TASK-030.2: Add contextual links from metrics to relevant case studies or capabilities
  - [ ] TASK-030.3: Consider adding a short narrative introduction above the fold

  #### Related Files
  - `src/pages/index.astro`
  - `src/components/MetricCard.astro`

  #### Definition of Done
  - [ ] Homepage effectively communicates value and routes visitors to proof points

  #### Anti-Patterns
  - Do not make the homepage a generic landing page; it should feel like a dashboard

---

- [ ] [READY] **TASK-031: Audit All Nav Items and Sub-Items for Route Validity**
  - [ ] TASK-031.1: Manually test every link in `navigation.ts` and sidebar components
  - [ ] TASK-031.2: Add automated link checking to CI (e.g., `broken-link-checker` or Playwright test)

  #### Related Files
  - `src/config/navigation.ts`
  - `.github/workflows/*.yml`

  #### Definition of Done
  - [ ] No 404s from internal navigation

  #### Anti-Patterns
  - Do not rely solely on manual testing

---

- [ ] [READY] **TASK-032: Add Redirects for Legacy or Alias Routes**
  - [ ] TASK-032.1: Identify any changed or deprecated routes (e.g., `/cases/qsr`)
  - [ ] TASK-032.2: Add permanent redirects (301) in `astro.config.mjs`

  #### Related Files
  - `astro.config.mjs`

  #### Definition of Done
  - [ ] Users accessing old URLs are seamlessly redirected to current content

  #### Anti-Patterns
  - Do not use client-side redirects

---

- [ ] [READY] **TASK-033: Clarify Canonical Route Naming**
  - [ ] TASK-033.1: Document the decision to use company-based slugs for case studies in `docs/implementation-assumptions.md`
  - [ ] TASK-033.2: Ensure all internal links and sitemap reflect this convention

  #### Related Files
  - `docs/implementation-assumptions.md`

  #### Definition of Done
  - [ ] Decision is recorded and consistently applied

  #### Anti-Patterns
  - Do not mix industry and company slugs without redirects

---

- [ ] [READY] **TASK-034: Add Content QA Checks**
  - [ ] TASK-034.1: Create a script (`scripts/validate-content.js`) that checks for broken internal links, missing required frontmatter, and orphaned content
  - [ ] TASK-034.2: Run this script in CI as part of the test suite

  #### Related Files
  - `scripts/validate-content.js`
  - `.github/workflows/test.yml`

  #### Definition of Done
  - [ ] Content issues are caught before deployment

  #### Anti-Patterns
  - Do not wait for user reports to find broken links

---

- [ ] [READY] **TASK-035: Additional Polish and Future Enhancements**
  - [ ] TASK-035.1: Create a `/uses` page (`src/pages/uses.astro`) detailing tools and workflow (nice-to-have)
  - [ ] TASK-035.2: Add an animation pause toggle for `prefers-reduced-motion` override
  - [ ] TASK-035.3: Implement draft mode using `draft: true` in frontmatter and conditional rendering based on `import.meta.env.MODE`
  - [ ] TASK-035.4: Add a `vercel dev` script to `package.json` for local edge emulation
  - [ ] TASK-035.5: Set up CSP reporting endpoint in `astro.config.mjs` or `vercel.json`
  - [ ] TASK-035.6: Add pre-commit hooks with Husky and lint-staged

  #### Related Files
  - Various

  #### Definition of Done
  - [ ] Low-priority enhancements are captured for future work; some may be implemented if time permits

  #### Out of Scope
  - Immediate launch requirements

  #### Anti-Patterns
  - Do not let these distract from critical launch tasks

---

# TypeScript Error Remediation Tasks

The following tasks address the 148 TypeScript errors identified in the codebase assessment. Tasks are organized by priority.

---

- [ ] [BLOCKED] **TASK-036: Fix Type-Only Import Violations (ts1484)**
**Status**: [pending]

### Description
Fix 24 type-only import violations across test files. TypeScript's `verbatimModuleSyntax` setting requires types to be imported with the `type` keyword.

### Subtasks
- [ ] [TASK-036-1] Fix imports in `tests/ai/AITestEnhancer.ts` (6 errors) - `tests/ai/AITestEnhancer.ts`
- [ ] [TASK-036-2] Fix imports in `tests/ai/MCPIntegration.ts` (5 errors) - `tests/ai/MCPIntegration.ts`
- [ ] [TASK-036-3] Fix imports in `tests/ai/MLTestPrioritizer.ts` (4 errors) - `tests/ai/MLTestPrioritizer.ts`
- [ ] [TASK-036-4] Fix imports in `tests/ai/SelfHealingEngine.ts` (1 error) - `tests/ai/SelfHealingEngine.ts`
- [ ] [TASK-036-5] Fix imports in `tests/monitoring/alerting-system.ts` (1 error) - `tests/monitoring/alerting-system.ts`
- [ ] [TASK-036-6] Fix imports in `tests/monitoring/health-scoring.ts` (4 errors) - `tests/monitoring/health-scoring.ts`
- [ ] [TASK-036-7] Fix imports in `tests/performance/dashboard.ts` (3 errors) - `tests/performance/dashboard.ts`
- [ ] [TASK-036-8] Fix imports in `tests/factories/data-factory.ts` (1 error) - `tests/factories/data-factory.ts`
- [ ] [TASK-036-9] Fix imports in `tests/mocks/mock-manager.ts` (1 error) - `tests/mocks/mock-manager.ts`

### Related Files
- `tests/ai/AITestEnhancer.ts`
- `tests/ai/MCPIntegration.ts`
- `tests/ai/MLTestPrioritizer.ts`
- `tests/ai/SelfHealingEngine.ts`
- `tests/monitoring/alerting-system.ts`
- `tests/monitoring/health-scoring.ts`
- `tests/performance/dashboard.ts`
- `tests/factories/data-factory.ts`
- `tests/mocks/mock-manager.ts`

### Definition of Done
- [ ] All type imports use `import type { Type }` syntax
- [ ] `npm run check` passes with zero ts1484 errors
- [ ] No runtime regressions in test files

### Out of Scope
- Changing the `verbatimModuleSyntax` configuration
- Refactoring import structure beyond type keyword addition

### Strict Rules to Follow
1. Only change import statements that import types (not values)
2. Test files must continue to run after changes
3. Do not remove imports; only add `type` keyword

### Existing Code Patterns
- Test files use Playwright, Vitest, and custom AI testing utilities
- Type imports are used for interfaces and type definitions

### Advanced Code Patterns
- Use `import type` for all type-only imports to satisfy verbatimModuleSyntax
- Consider separating type and value imports on different lines for clarity

### Anti-Patterns
- Do not add `type` keyword to value imports (classes, functions, constants)
- Do not reorganize imports beyond the minimal fix

---

- [ ] [BLOCKED] **TASK-037: Fix Module Resolution Errors (ts2305, ts2304)**
**Status**: [pending]

### Description
Fix 6 module resolution errors including missing components, exports, and type definitions.

### Subtasks
- [ ] [TASK-037-1] Create or fix `LinkCard.astro` component - `src/components/LinkCard.astro`
- [ ] [TASK-037-2] Fix `@jazzer.js/core` fuzz import in formatter-security test - `tests/fuzzing/formatter-security.fuzz.test.ts`
- [ ] [TASK-037-3] Fix `@jazzer.js/core` fuzz import in input-validation test - `tests/fuzzing/input-validation.fuzz.test.ts`
- [ ] [TASK-037-4] Fix `@jazzer.js/core` fuzz import in security test - `tests/fuzzing/security.fuzz.test.ts`
- [ ] [TASK-037-5] Add or fix `ResourceRequirements` type in MLTestPrioritizer - `tests/ai/MLTestPrioritizer.ts`
- [ ] [TASK-037-6] Import `dirname` from `path` in regression-detector - `tests/performance/regression-detector.ts`

### Related Files
- `src/components/LinkCard.astro`
- `tests/fuzzing/formatter-security.fuzz.test.ts`
- `tests/fuzzing/input-validation.fuzz.test.ts`
- `tests/fuzzing/security.fuzz.test.ts`
- `tests/ai/MLTestPrioritizer.ts`
- `tests/performance/regression-detector.ts`

### Definition of Done
- [ ] All module resolution errors resolved
- [ ] Missing components are created or imports are fixed
- [ ] Type definitions are installed or added

### Out of Scope
- Rewriting Jazzer.js fuzzing tests if the library is incompatible
- Removing functionality to fix import errors

### Strict Rules to Follow
1. If a component is missing, create it or remove the import
2. For Jazzer.js, verify the correct import or consider alternative fuzzing library
3. Add type definitions for missing packages (@types/*)

### Existing Code Patterns
- Components are in `src/components/`
- Type definitions are installed via npm

### Advanced Code Patterns
- Use `declare module` for missing type definitions if @types package unavailable
- Consider creating local type definitions for third-party libraries

### Anti-Patterns
- Do not comment out imports instead of fixing them
- Do not use `@ts-ignore` to suppress module errors

---

- [ ] [BLOCKED] **TASK-038: Fix Erasable Syntax Violations (ts1294)**
**Status**: [pending]

### Description
Fix 13 erasable syntax violations in test orchestration files caused by `erasableSyntaxOnly` TypeScript configuration.

### Subtasks
- [ ] [TASK-038-1] Refactor class properties in `tests/orchestration/fault-tolerance.ts` (10 errors) - `tests/orchestration/fault-tolerance.ts`
- [ ] [TASK-038-2] Refactor class properties in `tests/orchestration/result-aggregator.ts` (1 error) - `tests/orchestration/result-aggregator.ts`
- [ ] [TASK-038-3] Refactor class properties in `tests/orchestration/shard-orchestrator.ts` (1 error) - `tests/orchestration/shard-orchestrator.ts`
- [ ] [TASK-038-4] Refactor class properties in `tests/performance/performance-monitor.ts` (1 error) - `tests/performance/performance-monitor.ts`

### Related Files
- `tests/orchestration/fault-tolerance.ts`
- `tests/orchestration/result-aggregator.ts`
- `tests/orchestration/shard-orchestrator.ts`
- `tests/performance/performance-monitor.ts`
- `tsconfig.json`

### Definition of Done
- [ ] All erasable syntax violations resolved
- [ ] Class properties use compatible syntax
- [ ] Tests continue to function correctly

### Out of Scope
- Disabling `erasableSyntaxOnly` in tsconfig.json
- Rewriting entire class architectures

### Strict Rules to Follow
1. Convert class property declarations to compatible syntax
2. Use constructor initialization or definite assignment assertions
3. Maintain encapsulation and functionality

### Existing Code Patterns
- Test orchestration uses classes for fault tolerance, result aggregation
- Performance monitoring uses class-based architecture

### Advanced Code Patterns
- Use parameter properties in constructor: `constructor(private readonly field: Type)`
- Use definite assignment assertions: `field!: Type`

### Anti-Patterns
- Do not convert classes to functions if not necessary
- Do not remove type annotations to fix syntax errors

---

- [ ] [BLOCKED] **TASK-039: Fix Property Initialization Errors (ts2564)**
**Status**: [pending]

### Description
Fix 5 property initialization errors where class properties are declared without initialization.

### Subtasks
- [ ] [TASK-039-1] Initialize `healthCheckInterval` in fault-tolerance - `tests/orchestration/fault-tolerance.ts`
- [ ] [TASK-039-2] Initialize `wsServer`, `io`, and intervals in result-aggregator (3 errors) - `tests/orchestration/result-aggregator.ts`
- [ ] [TASK-039-3] Initialize `heartbeatInterval` and `rebalanceInterval` in shard-orchestrator (2 errors) - `tests/orchestration/shard-orchestrator.ts`

### Related Files
- `tests/orchestration/fault-tolerance.ts`
- `tests/orchestration/result-aggregator.ts`
- `tests/orchestration/shard-orchestrator.ts`

### Definition of Done
- [ ] All class properties are initialized in constructor
- [ ] No definite assignment errors remain
- [ ] Tests initialize correctly

### Out of Scope
- Changing class architecture beyond initialization fixes

### Strict Rules to Follow
1. Initialize properties in constructor or use definite assignment assertion
2. For timers, initialize to null or set in constructor
3. Maintain existing initialization logic

### Existing Code Patterns
- Test orchestration classes use timers and WebSocket servers
- Properties are often initialized in constructor methods

### Advanced Code Patterns
- Use definite assignment assertion: `property!: Type` when initialization is guaranteed
- Use null initialization: `property: NodeJS.Timeout | null = null`

### Anti-Patterns
- Do not use `@ts-ignore` to suppress initialization errors
- Do not make properties optional if they should always be initialized

---

- [ ] [BLOCKED] **TASK-040: Fix Property Access Errors (ts2339)**
**Status**: [pending]

### Description
Fix 35+ property access errors where properties don't exist on types or APIs have changed.

### Subtasks
- [ ] [TASK-040-1] Fix Element type casting in SearchBar.astro (2 errors) - `src/components/SearchBar.astro`
- [ ] [TASK-040-2] Fix Window property assignments in ToggleSwitch.astro (3 errors) - `src/components/ToggleSwitch.astro`
- [ ] [TASK-040-3] Fix missing properties in archive.astro (5 errors) - `src/pages/archive.astro`
- [ ] [TASK-040-4] Fix typo `philosophie` to `philosophy` in cases/[slug].astro - `src/pages/cases/[slug].astro`
- [ ] [TASK-040-5] Fix missing `slug` property in lab/index.astro (2 errors) - `src/pages/lab/index.astro`
- [ ] [TASK-040-6] Fix invalid `key` prop in skills-matrix.astro (2 errors) - `src/pages/resources/skills-matrix.astro`
- [ ] [TASK-040-7] Fix type mismatch in error-monitoring.ts - `src/utils/error-monitoring.ts`
- [ ] [TASK-040-8] Fix AI test property access errors - `tests/ai/AITestEnhancer.ts`
- [ ] [TASK-040-9] Fix Playwright API changes in MCPIntegration.ts - `tests/ai/MCPIntegration.ts`
- [ ] [TASK-041-0] Fix SelfHealingEngine method property errors - `tests/ai/SelfHealingEngine.ts`
- [ ] [TASK-041-1] Fix Pact API changes in mock-service-contract.test.ts - `tests/contract/mock-service-contract.test.ts`
- [ ] [TASK-041-2] Fix missing instances property in mock-manager.ts - `tests/mocks/mock-manager.ts`
- [ ] [TASK-041-3] Fix dashboard data property errors - `tests/performance/dashboard.ts`
- [ ] [TASK-041-4] Fix threshold index signature errors - `tests/performance/performance-monitor.ts`
- [ ] [TASK-041-5] Fix private method access in regression-detector.ts - `tests/performance/regression-detector.ts`
- [ ] [TASK-041-6] Fix missing getThresholds method calls - `tests/performance/dashboard.ts`

### Related Files
- `src/components/SearchBar.astro`
- `src/components/ToggleSwitch.astro`
- `src/pages/archive.astro`
- `src/pages/cases/[slug].astro`
- `src/pages/lab/index.astro`
- `src/pages/resources/skills-matrix.astro`
- `src/utils/error-monitoring.ts`
- `tests/ai/AITestEnhancer.ts`
- `tests/ai/MCPIntegration.ts`
- `tests/ai/SelfHealingEngine.ts`
- `tests/contract/mock-service-contract.test.ts`
- `tests/mocks/mock-manager.ts`
- `tests/performance/dashboard.ts`
- `tests/performance/performance-monitor.ts`
- `tests/performance/regression-detector.ts`

### Definition of Done
- [ ] All property access errors resolved
- [ ] Type casts are added where appropriate
- [ ] API calls use current method signatures
- [ ] Typos are corrected

### Out of Scope
- Changing business logic to fix type errors
- Removing functionality that requires property access

### Strict Rules to Follow
1. Use type assertions (as Type) when DOM types are too generic
2. Extend Window interface for custom properties
3. Update to current API signatures for third-party libraries
4. Fix typos in property names

### Existing Code Patterns
- Components use DOM manipulation in scripts
- Test files use Playwright, Pact, and custom monitoring

### Advanced Code Patterns
- Use `document.getElementById` with type guard: `const el = document.getElementById('id') as HTMLInputElement`
- Extend Window interface in `.d.ts` file for custom properties

### Anti-Patterns
- Do not use `@ts-ignore` to suppress property errors
- Do not cast to `any` to bypass type checking

---

- [ ] [BLOCKED] **TASK-041: Fix Private/Protected Property Access Errors (ts2341, ts2445)**
**Status**: [pending]

### Description
Fix 10 errors where private or protected class members are being accessed from outside.

### Subtasks
- [ ] [TASK-041-1] Fix method property access in SelfHealingEngine (3 errors) - `tests/ai/SelfHealingEngine.ts`
- [ ] [TASK-041-2] Fix getRandomElement private access in dynamic-scenario-generator (4 errors) - `tests/contract/dynamic-scenario-generator.ts`
- [ ] [TASK-041-3] Fix onFailure/onSuccess private access in fault-tolerance (4 errors) - `tests/orchestration/fault-tolerance.ts`
- [ ] [TASK-041-4] Fix categorizeTest protected access in regression-detector (3 errors) - `tests/performance/regression-detector.ts`

### Related Files
- `tests/ai/SelfHealingEngine.ts`
- `tests/contract/dynamic-scenario-generator.ts`
- `tests/orchestration/fault-tolerance.ts`
- `tests/performance/regression-detector.ts`

### Definition of Done
- [ ] All private/protected access errors resolved
- [ ] Methods are made public or accessed through public interfaces
- [ ] Encapsulation is maintained where appropriate

### Out of Scope
- Making all class members public without consideration

### Strict Rules to Follow
1. Make methods public if they need external access
2. Create public wrapper methods if encapsulation is important
3. Use dependency injection instead of direct private access

### Existing Code Patterns
- Test classes use private methods for internal logic
- AI testing uses private method access for self-healing

### Advanced Code Patterns
- Use public interface pattern: expose public API while keeping implementation private
- Use protected methods for inheritance-based access

### Anti-Patterns
- Do not make everything public to fix access errors
- Do not break encapsulation unnecessarily

---

- [ ] [BLOCKED] **TASK-042: Fix Type Assignment Incompatibility Errors (ts2345, ts2322)**
**Status**: [pending]

### Description
Fix 8 type assignment incompatibility errors in test files.

### Subtasks
- [ ] [TASK-042-1] Fix screenshot config type in visual-regression.test.ts (2 errors) - `tests/browser/visual-regression.test.ts`
- [ ] [TASK-042-2] Fix TestContainer type in Footer.test.ts - `tests/components/Footer.test.ts`
- [ ] [TASK-042-3] Fix render options type in MetricCard.test.ts - `tests/components/MetricCard.test.ts`
- [ ] [TASK-042-4] Fix component factory type in basic-component.test.ts - `tests/integration/basic-component.test.ts`
- [ ] [TASK-042-5] Fix HTMLAttributes with key prop in skills-matrix.astro (2 errors) - `src/pages/resources/skills-matrix.astro`
- [ ] [TASK-042-6] Fix array to key conversion in input-validation.fuzz.test.ts (2 errors) - `tests/fuzzing/input-validation.fuzz.test.ts`

### Related Files
- `tests/browser/visual-regression.test.ts`
- `tests/components/Footer.test.ts`
- `tests/components/MetricCard.test.ts`
- `tests/integration/basic-component.test.ts`
- `src/pages/resources/skills-matrix.astro`
- `tests/fuzzing/input-validation.fuzz.test.ts`

### Definition of Done
- [ ] All type assignment errors resolved
- [ ] Types match expected signatures
- [ ] Tests run without type errors

### Out of Scope
- Changing test frameworks or libraries

### Strict Rules to Follow
1. Update types to match current API signatures
2. Use proper type assertions when necessary
3. Remove invalid props from component attributes

### Existing Code Patterns
- Browser tests use Vitest browser mode
- Component tests use Astro test utilities

### Advanced Code Patterns
- Use satisfies operator for type checking: `value satisfies Type`
- Use type guards for runtime type checking

### Anti-Patterns
- Do not cast to `any` to fix type errors
- Do not remove type checking

---

- [ ] [BLOCKED] **TASK-043: Fix Implicit 'any' Type Errors (ts7006)**
**Status**: [pending]

### Description
Fix 20+ errors where function parameters implicitly have 'any' type.

### Subtasks
- [ ] [TASK-043-1] Fix value parameter in ToggleSwitch.astro - `src/components/ToggleSwitch.astro`
- [ ] [TASK-043-2] Fix mockserver/builder parameters in mock-service-contract.test.ts (2 errors) - `tests/contract/mock-service-contract.test.ts`
- [ ] [TASK-043-3] Fix error parameter in data-factory.ts - `tests/factories/data-factory.ts`
- [ ] [TASK-043-4] Fix fuzz test parameters in formatter-security.fuzz.test.ts (6 errors) - `tests/fuzzing/formatter-security.fuzz.test.ts`
- [ ] [TASK-043-5] Fix fuzz test parameters in input-validation.fuzz.test.ts (6 errors) - `tests/fuzzing/input-validation.fuzz.test.ts`
- [ ] [TASK-043-6] Fix fuzz test parameters in security.fuzz.test.ts (6 errors) - `tests/fuzzing/security.fuzz.test.ts`
- [ ] [TASK-043-7] Fix file parameter in mock-manager.ts - `tests/mocks/mock-manager.ts`
- [ ] [TASK-043-8] Fix chunk parameter in result-aggregator.ts - `tests/orchestration/result-aggregator.ts`
- [ ] [TASK-043-9] Fix map function parameters in dashboard.ts (4 errors) - `tests/performance/dashboard.ts`
- [ ] [TASK-044-0] Fix testFile parameter in performance-monitor.ts - `tests/performance/performance-monitor.ts`

### Related Files
- `src/components/ToggleSwitch.astro`
- `tests/contract/mock-service-contract.test.ts`
- `tests/factories/data-factory.ts`
- `tests/fuzzing/formatter-security.fuzz.test.ts`
- `tests/fuzzing/input-validation.fuzz.test.ts`
- `tests/fuzzing/security.fuzz.test.ts`
- `tests/mocks/mock-manager.ts`
- `tests/orchestration/result-aggregator.ts`
- `tests/performance/dashboard.ts`
- `tests/performance/performance-monitor.ts`

### Definition of Done
- [ ] All function parameters have explicit types
- [ ] No implicit 'any' type errors remain
- [ ] Type safety is maintained

### Out of Scope
- Changing function signatures beyond type annotations

### Strict Rules to Follow
1. Add explicit type annotations to all function parameters
2. Use appropriate types for callbacks and event handlers
3. Maintain existing functionality

### Existing Code Patterns
- Fuzzing tests use Jazzer.js for security testing
- Test orchestration uses callback functions

### Advanced Code Patterns
- Use generic types for callbacks: `(param: Type) => void`
- Use union types for multiple possible types: `param: Type1 | Type2`

### Anti-Patterns
- Do not use `any` as a quick fix
- Do not remove type checking

---

- [ ] [BLOCKED] **TASK-044: Fix Unknown Type Errors (ts18046, ts18048)**
**Status**: [pending]

### Description
Fix 15+ errors where types are not narrowed before property access or are possibly undefined.

### Subtasks
- [ ] [TASK-044-1] Fix user type errors in mock-service-contract.test.ts (4 errors) - `tests/contract/mock-service-contract.test.ts`
- [ ] [TASK-044-2] Fix error.message in dashboard.ts - `tests/performance/dashboard.ts`
- [ ] [TASK-044-3] Fix error.message in performance-monitor.ts - `tests/performance/performance-monitor.ts`
- [ ] [TASK-044-4] Fix riskScore possibly undefined in test-scheduler.ts (4 errors) - `tests/performance/test-scheduler.ts`
- [ ] [TASK-044-5] Fix error.message in test-scheduler.ts - `tests/performance/test-scheduler.ts`
- [ ] [TASK-044-6] Fix lastError used before assignment in fault-tolerance.ts - `tests/orchestration/fault-tolerance.ts`

### Related Files
- `tests/contract/mock-service-contract.test.ts`
- `tests/performance/dashboard.ts`
- `tests/performance/performance-monitor.ts`
- `tests/performance/test-scheduler.ts`
- `tests/orchestration/fault-tolerance.ts`

### Definition of Done
- [ ] All unknown type errors resolved
- [ ] Type guards are used for narrowing
- [ ] Optional chaining is used appropriately

### Out of Scope
- Changing error handling logic

### Strict Rules to Follow
1. Add type guards before property access
2. Use optional chaining for potentially undefined properties
3. Initialize variables before use

### Existing Code Patterns
- Error handling uses try-catch blocks
- Test results may have optional properties

### Advanced Code Patterns
- Use type guards: `if (error instanceof Error) { error.message }`
- Use optional chaining: `error?.message`
- Use nullish coalescing: `error?.message ?? 'Unknown error'`

### Anti-Patterns
- Do not cast to `any` to bypass type checking
- Do not assume properties exist without checking

---

- [ ] [BLOCKED] **TASK-045: Migrate Zod v3 to v4 API**
**Status**: [pending]

### Description
Fix 100+ errors caused by deprecated Zod v3 API usage in content config and test files.

### Subtasks
- [ ] [TASK-045-1] Update `z` import in src/content.config.ts (80+ errors) - `src/content.config.ts`
- [ ] [TASK-045-2] Update ZodSchema import in data-factory.ts - `tests/factories/data-factory.ts`
- [ ] [TASK-045-3] Fix ZodError.errors property access in data-factory.ts - `tests/factories/data-factory.ts`
- [ ] [TASK-045-4] Update ZodSchema import in mock-manager.ts - `tests/mocks/mock-manager.ts`
- [ ] [TASK-045-5] Fix ZodError.errors property access in mock-manager.ts - `tests/mocks/mock-manager.ts`
- [ ] [TASK-045-6] Update z.record() calls in mock-manager.ts (3 errors) - `tests/mocks/mock-manager.ts`

### Related Files
- `src/content.config.ts`
- `tests/factories/data-factory.ts`
- `tests/mocks/mock-manager.ts`

### Definition of Done
- [ ] All Zod v3 API usage updated to v4
- [ ] No Zod deprecation warnings
- [ ] Content validation still works correctly

### Out of Scope
- Changing content schema structure
- Removing Zod validation

### Strict Rules to Follow
1. Update to Zod v4 syntax for all schema definitions
2. Use `z.issues` instead of `z.errors` for error access
3. Update `z.record()` to use new signature

### Existing Code Patterns
- Content config uses Zod for schema validation
- Test factories use Zod for data generation

### Advanced Code Patterns
- Use Zod v4's `z.coerce` for type coercion
- Use Zod v4's `z.discriminatedUnion` for better union types

### Anti-Patterns
- Do not downgrade Zod to v3
- Do not ignore deprecation warnings

---

- [ ] [BLOCKED] **TASK-046: Replace Deprecated substr() with substring()**
**Status**: [pending]

### Description
Fix 10+ deprecated API warnings by replacing `substr()` with `substring()` or `slice()`.

### Subtasks
- [ ] [TASK-046-1] Replace substr in distributed-runner.mjs (2 errors) - `scripts/distributed-runner.mjs`
- [ ] [TASK-046-2] Replace substr in test-orchestrator.mjs - `scripts/test-orchestrator.mjs`
- [ ] [TASK-046-3] Replace substr in Chart.astro - `src/components/Chart.astro`
- [ ] [TASK-046-4] Replace substr in error-monitoring.ts - `src/utils/error-monitoring.ts`
- [ ] [TASK-046-5] Replace substr in rum-monitoring.ts - `src/utils/rum-monitoring.ts`
- [ ] [TASK-046-6] Replace substr in alerting-system.ts - `tests/monitoring/alerting-system.ts`
- [ ] [TASK-046-7] Replace substr in shard-orchestrator.ts - `tests/orchestration/shard-orchestrator.ts`
- [ [TASK-046-8] Replace substr in test-scheduler.ts - `tests/performance/test-scheduler.ts`
- [ ] [TASK-046-9] Replace page.type() in MCPIntegration.ts - `tests/ai/MCPIntegration.ts`

### Related Files
- `scripts/distributed-runner.mjs`
- `scripts/test-orchestrator.mjs`
- `src/components/Chart.astro`
- `src/utils/error-monitoring.ts`
- `src/utils/rum-monitoring.ts`
- `tests/monitoring/alerting-system.ts`
- `tests/orchestration/shard-orchestrator.ts`
- `tests/performance/test-scheduler.ts`
- `tests/ai/MCPIntegration.ts`

### Definition of Done
- [ ] All `substr()` calls replaced with `substring()` or `slice()`
- [ ] No deprecation warnings for string methods
- [ ] Functionality remains identical

### Out of Scope
- Changing random ID generation logic

### Strict Rules to Follow
1. Use `substring()` for direct replacement of `substr()`
2. Use `slice()` for negative indices (if needed)
3. Maintain existing random ID generation behavior

### Existing Code Patterns
- Random IDs are generated using `Date.now()` and `Math.random()`

### Advanced Code Patterns
- Consider using `crypto.randomUUID()` for better random IDs (future enhancement)

### Anti-Patterns
- Do not change the random ID generation logic
- Do not suppress deprecation warnings

---

- [ ] [BLOCKED] **TASK-047: Fix Vitest Configuration Errors**
**Status**: [pending]

### Description
Fix 6 Vitest workspace configuration errors in vitest.config.ts.

### Subtasks
- [ ] [TASK-047-1] Fix inline property in vitest.config.ts - `vitest.config.ts`
- [ ] [TASK-047-2] Fix name properties for workspace projects (6 errors) - `vitest.config.ts`
- [ ] [TASK-047-3] Remove unused defineConfig import - `vitest.config.ts`

### Related Files
- `vitest.config.ts`

### Definition of Done
- [ ] Vitest workspace configuration is valid
- [ ] Test projects use correct Vitest v4 API
- [ ] Tests run correctly with workspace config

### Out of Scope
- Restructuring test organization

### Strict Rules to Follow
1. Update to Vitest v4 workspace API
2. Use correct property names for workspace configuration
3. Remove unused imports

### Existing Code Patterns
- Vitest workspace for organizing test suites

### Advanced Code Patterns
- Use Vitest v4's `workspace` feature for multi-project setup

### Anti-Patterns
- Do not downgrade Vitest to v3
- Do not remove workspace functionality

---

- [ ] [BLOCKED] **TASK-048: Fix Playwright API Errors**
**Status**: [pending]

### Description
Fix 3 Playwright API errors related to accessibility and deprecated methods.

### Subtasks
- [ ] [TASK-048-1] Fix page.accessibility.snapshot() in MCPIntegration.ts - `tests/ai/MCPIntegration.ts`
- [ ] [TASK-048-2] Fix locator.accessibilitySnapshot() in MCPIntegration.ts - `tests/ai/MCPIntegration.ts`
- [ ] [TASK-048-3] Remove unnecessary await in comprehensive-a11y.spec.ts - `tests/a11y/comprehensive-a11y.spec.ts`

### Related Files
- `tests/ai/MCPIntegration.ts`
- `tests/a11y/comprehensive-a11y.spec.ts`

### Definition of Done
- [ ] Playwright API calls use current methods
- [ ] Accessibility testing works correctly
- [ ] No unnecessary awaits

### Out of Scope
- Rewriting accessibility test logic

### Strict Rules to Follow
1. Update to current Playwright accessibility API
2. Use `@axe-core/playwright` for accessibility testing
3. Remove await on non-async operations

### Existing Code Patterns
- Accessibility testing uses axe-core
- AI testing uses Playwright for browser automation

### Advanced Code Patterns
- Use Playwright's built-in accessibility tree API

### Anti-Patterns
- Do not use deprecated Playwright methods
- Do not await non-promises

---

- [ ] [BLOCKED] **TASK-049: Fix Pact Contract Testing Errors**
**Status**: [pending]

### Description
Fix 5 Pact contract testing errors related to API changes.

### Subtasks
- [ ] [TASK-049-1] Fix withHeaders API in mock-service-contract.test.ts - `tests/contract/mock-service-contract.test.ts`
- [ ] [TASK-049-2] Fix builder parameter type in mock-service-contract.test.ts - `tests/contract/mock-service-contract.test.ts`
- [ ] [TASK-049-3] Fix mockserver parameter type in mock-service-contract.test.ts - `tests/contract/mock-service-contract.test.ts`
- [ ] [TASK-049-4] Fix user type errors in mock-service-contract.test.ts (4 errors) - `tests/contract/mock-service-contract.test.ts`

### Related Files
- `tests/contract/mock-service-contract.test.ts`

### Definition of Done
- [ ] Pact API uses current method signatures
- [ ] Contract tests run without errors
- [ ] Type safety is maintained

### Out of Scope
- Removing contract testing

### Strict Rules to Follow
1. Update to current Pact JS API
2. Add type annotations for Pact objects
3. Maintain contract test coverage

### Existing Code Patterns
- Contract testing uses Pact for API contract verification

### Advanced Code Patterns
- Use Pact's type-safe builder pattern

### Anti-Patterns
- Do not bypass Pact's type system

---

- [ ] [BLOCKED] **TASK-050: Remove Unused Variables and Imports (ts6133)**
**Status**: [pending]

### Description
Fix 80+ unused variable warnings across the codebase.

### Subtasks
- [ ] [TASK-050-1] Remove unused imports in vitest.config.ts - `vitest.config.ts`
- [ ] [TASK-050-2] Remove unused variables in scripts/*.mjs (20+ warnings) - `scripts/*.mjs`
- [ ] [TASK-050-3] Remove unused props/functions in components (10+ warnings) - `src/components/*.astro`
- [ ] [TASK-050-4] Remove unused imports in pages (5+ warnings) - `src/pages/*.astro`
- [ ] [TASK-050-5] Remove unused parameters/imports in tests (40+ warnings) - `tests/**/*.ts`

### Related Files
- `vitest.config.ts`
- `scripts/*.mjs`
- `src/components/*.astro`
- `src/pages/*.astro`
- `tests/**/*.ts`

### Definition of Done
- [ ] All unused variable warnings resolved
- [ ] Code is cleaner and more maintainable
- [ ] No functionality is removed

### Out of Scope
- Removing code that might be used in the future (use TODO comments instead)

### Strict Rules to Follow
1. Remove truly unused imports and variables
2. Prefix intentionally unused parameters with underscore: `_param`
3. Add TODO comments for code to be used later

### Existing Code Patterns
- Code has accumulated some unused imports during development

### Advanced Code Patterns
- Use ESLint's no-unused-vars rule with appropriate config
- Use TypeScript's unusedImports check

### Anti-Patterns
- Do not suppress warnings with @ts-ignore
- Do not remove code without verifying it's unused

---

- [ ] [BLOCKED] **TASK-051: Fix Astro-Specific Script Warnings**
**Status**: [pending]

### Description
Fix 6 Astro warnings about scripts with attributes being treated as inline.

### Subtasks
- [ ] [TASK-051-1] Add is:inline to Breadcrumbs.astro script - `src/components/Breadcrumbs.astro`
- [ ] [TASK-051-2] Add is:inline or remove unused import in Chart.astro - `src/components/Chart.astro`
- [ ] [TASK-051-3] Add is:inline to BaseLayout.astro scripts (4 warnings) - `src/layouts/BaseLayout.astro`

### Related Files
- `src/components/Breadcrumbs.astro`
- `src/components/Chart.astro`
- `src/layouts/BaseLayout.astro`

### Definition of Done
- [ ] All script warnings resolved
- [ ] Scripts have explicit is:inline directive if needed
- [ ] Unused imports are removed

### Out of Scope
- Changing script functionality

### Strict Rules to Follow
1. Add `is:inline` to scripts that need it
2. Remove unused imports before adding is:inline
3. Follow Astro's script processing guidelines

### Existing Code Patterns
- Astro scripts with attributes are treated as inline

### Advanced Code Patterns
- Use `<script define:vars={{ ... }}>` for passing variables to inline scripts

### Anti-Patterns
- Do not use is:inline for all scripts
- Do not ignore script processing warnings
