# Production Readiness TODO

This document tracks missing features and improvements identified during the codebase audit. Tasks are prioritized by production readiness impact.

---

- [ ] [READY] **TASK-001: Add Privacy Policy and Terms Pages**
  - [ ] TASK-001.1: Create privacy policy page at `src/pages/privacy.astro`
  - [ ] TASK-001.2: Create terms of use page at `src/pages/terms.astro`
  - [ ] TASK-001.3: Add privacy and terms links to `src/components/Footer.astro`
  - [ ] TASK-001.4: Add legal disclosures for Formspree contact form and Plausible analytics

#### Related Files
- `src/pages/privacy.astro` (to create)
- `src/pages/terms.astro` (to create)
- `src/components/Footer.astro` (to modify)
- `src/layouts/BaseLayout.astro` (reference for page structure)
- `src/pages/connect.astro` (reference for contact form context)

#### Definition of Done
- [ ] Privacy policy page exists and is accessible at `/privacy`
- [ ] Terms of use page exists and is accessible at `/terms`
- [ ] Both pages are linked in the site footer
- [ ] Content includes required legal disclosures for contact forms and analytics (GDPR/CCPA compliance)
- [ ] Pages use consistent styling with BaseLayout component
- [ ] Links are accessible and properly labeled

#### Out of Scope
- Drafting legal language from scratch (use a template or generator)
- Adding cookie consent banner (separate task)
- Implementing age verification
- Dynamic consent management platform integration

#### Strict Rules to Follow
- Pages must use the `BaseLayout` component for consistent styling
- Do not use inline styles; use Tailwind utility classes only
- Content must be plain HTML/Markdown in `.astro` files, no external CMS
- Do not modify `astro.config.mjs` for this task
- Follow TypeScript strict mode (no implicit any)
- Maintain dark mode compatibility

#### Existing Code Patterns
- The `404.astro` page demonstrates the correct page structure and `BaseLayout` usage
- The `connect.astro` page shows how to embed forms and structure content sections
- Footer links are defined in `src/components/Footer.astro`
- BaseLayout accepts title, description, and optional jsonLd props

#### Advanced Code Patterns
- Consider using Astro's `<Content />` component if you want to write policy content in MDX
- Use the jsonLd prop in BaseLayout to add LegalService schema markup
- Add breadcrumb navigation using the `Breadcrumbs.astro` component

#### Anti-Patterns
- Do not copy-paste the entire base layout; always import and use `<BaseLayout>`
- Do not hardcode footer links; update the Footer component systematically
- Do not use client-side JavaScript for static legal pages
- Do not skip accessibility testing on legal pages (they must be screen-reader friendly)

---

- [ ] [READY] **TASK-002: Create 500 Error Page**
  - [ ] TASK-002.1: Create 500 error page at `src/pages/500.astro`
  - [ ] TASK-002.2: Style consistently with existing 404 page
  - [ ] TASK-002.3: Add helpful error recovery options (home, contact, retry)
  - [ ] TASK-002.4: Configure Vercel to route server errors to 500 page

#### Related Files
- `src/pages/500.astro` (to create)
- `src/pages/404.astro` (reference for styling and structure)
- `src/layouts/BaseLayout.astro` (reference for layout)
- `vercel.json` (may need configuration for error routing)

#### Definition of Done
- [ ] 500 error page exists at `/500` route
- [ ] Page is styled consistently with 404 page
- [ ] Includes clear error messaging
- [ ] Provides actionable recovery options (back to home, contact support)
- [ ] Accessible with proper heading hierarchy and focus management
- [ ] Vercel configured to route 5xx errors to this page

#### Out of Scope
- Custom error logging dashboard
- Server-side error monitoring integration (Sentry, etc.)
- Dynamic error message display based on error codes
- Email notifications on 500 errors

#### Strict Rules to Follow
- Use BaseLayout component for consistency
- Tailwind utility classes only, no inline styles
- Maintain dark mode compatibility
- Ensure touch targets meet 44x44px minimum
- Include skip link functionality for accessibility

#### Existing Code Patterns
- `404.astro` shows the error page pattern with BaseLayout
- `ErrorBoundary.astro` demonstrates client-side error handling
- BaseLayout provides consistent SEO meta tags and structured data

#### Advanced Code Patterns
- Add error-specific JSON-LD schema for better search engine understanding
- Include a "Report This Error" link that pre-fills the contact form
- Consider adding a timestamp for when the error occurred

#### Anti-Patterns
- Do not expose stack traces or sensitive error details to users
- Do not use technical jargon in error messages
- Do not create a dead-end page without navigation options
- Do not forget to test error routing in production environment

---

- [ ] [READY] **TASK-003: Implement Pagination for Content Lists**
  - [ ] TASK-003.1: Add pagination to `src/pages/lab/learning-log/index.astro`
  - [ ] TASK-003.2: Add pagination to `src/pages/resources/index.astro`
  - [ ] TASK-003.3: Create reusable Pagination component at `src/components/Pagination.astro`
  - [ ] TASK-003.4: Configure items per page (recommend 10-12 items)
  - [ ] TASK-003.5: Add URL query parameter for page state

#### Related Files
- `src/pages/lab/learning-log/index.astro` (to modify)
- `src/pages/resources/index.astro` (to modify)
- `src/components/Pagination.astro` (to create)
- `src/content.config.ts` (reference for collection schemas)

#### Definition of Done
- [ ] Learning log index page uses pagination with 10-12 items per page
- [ ] Resources index page uses pagination with 10-12 items per page
- [ ] Pagination component is reusable across content types
- [ ] URL includes page query parameter (e.g., `?page=2`)
- [ ] Pagination controls include previous, next, and page numbers
- [ ] First and last page buttons are disabled appropriately
- [ ] Pagination is accessible with proper ARIA labels

#### Out of Scope
- Infinite scroll implementation
- Client-side filtering combined with pagination
- Dynamic items-per-page user preference
- Pagination for case studies or capabilities (low volume)

#### Strict Rules to Follow
- Use Astro's built-in `paginate()` function from `astro:content`
- Maintain TypeScript strict mode
- Use Tailwind utility classes for Pagination component styling
- Do not use inline styles
- Ensure pagination works with tag filtering (learning logs)

#### Existing Code Patterns
- `src/pages/lab/learning-log/index.astro` uses `getCollection('learningLogs')`
- `src/pages/resources/index.astro` uses `getCollection('resources')`
- Both pages already filter and sort content (pagination should preserve this)

#### Advanced Code Patterns
- Use Astro's `paginate()` function which automatically handles URL params
- Preserve existing filter state when changing pages
- Add canonical URLs with page parameter to prevent duplicate content issues
- Consider adding structured data for CollectionPage schema

#### Anti-Patterns
- Do not implement client-side pagination (use Astro's server-side pagination)
- Do not break existing tag filtering when adding pagination
- Do not forget to handle edge cases (empty results, single page)
- Do not use complex JavaScript for simple pagination needs

---

- [ ] [READY] **TASK-004: Add Analytics Opt-Out Mechanism**
  - [ ] TASK-004.1: Create analytics opt-out toggle component at `src/components/AnalyticsToggle.astro`
  - [ ] TASK-004.2: Add toggle to `src/components/Footer.astro`
  - [ ] TASK-004.3: Implement localStorage persistence for opt-out preference
  - [ ] TASK-004.4: Conditionally load Plausible script based on opt-out state
  - [ ] TASK-004.5: Add privacy notice linking to privacy policy

#### Related Files
- `src/components/AnalyticsToggle.astro` (to create)
- `src/components/Footer.astro` (to modify)
- `src/layouts/BaseLayout.astro` (modify Plausible script loading)
- `src/pages/privacy.astro` (link to privacy policy)

#### Definition of Done
- [ ] Analytics opt-out toggle is visible in site footer
- [ ] User preference is stored in localStorage
- [ ] Plausible script does not load when user has opted out
- [ ] Toggle state reflects current opt-out status on page load
- [ ] Privacy notice links to privacy policy page
- [ ] Component is accessible with proper labels and focus states
- [ ] Opt-out respects GDPR/CCPA right to withdraw consent

#### Out of Scope
- Cookie consent banner (separate task)
- Granular analytics category selection
- Consent management platform integration
- Server-side opt-out tracking

#### Strict Rules to Follow
- Use localStorage with try-catch for storage blocked scenarios
- Tailwind utility classes only, no inline styles
- Maintain dark mode compatibility
- Ensure toggle meets 44x44px touch target minimum
- Do not use external consent management libraries

#### Existing Code Patterns
- `src/layouts/BaseLayout.astro` has deferred Plausible script loading
- `src/components/Footer.astro` structure for adding footer elements
- `ErrorBoundary.astro` shows localStorage usage with error handling

#### Advanced Code Patterns
- Use a client-side script to check localStorage before loading Plausible
- Consider adding a "reset consent" option for users who change their mind
- Add ARIA live region for toggle state announcements to screen readers

#### Anti-Patterns
- Do not load Plausible script before checking opt-out preference
- Do not use cookies when localStorage suffices
- Do not make the opt-out process difficult or hidden
- Do not forget to handle localStorage quota exceeded errors

---

- [ ] [READY] **TASK-005: Implement Global External Link Security**
  - [ ] TASK-005.1: Create rehype plugin at `src/plugins/external-links.ts` to auto-add rel attributes
  - [ ] TASK-005.2: Integrate plugin into MDX processing in `astro.config.mjs`
  - [ ] TASK-005.3: Verify all external links have `rel="noopener noreferrer"`
  - [ ] TASK-005.4: Add `target="_blank"` to external links for consistency
  - [ ] TASK-005.5: Test with existing external links (LinkedIn, email, case study PDFs)

#### Related Files
- `src/plugins/external-links.ts` (to create)
- `astro.config.mjs` (modify MDX integration)
- `src/pages/connect.astro` (has existing external link)
- `src/components/Footer.astro` (may have external links)

#### Definition of Done
- [ ] Rehype plugin automatically adds `rel="noopener noreferrer"` to all external links
- [ ] External links automatically get `target="_blank"` attribute
  - [ ] Plugin is integrated into Astro MDX processing
- [ ] Existing external links (LinkedIn, email) are enhanced by plugin
- [ ] Internal links are not affected by plugin
- [ ] Plugin works across all MDX content (case studies, capabilities, learning logs, resources)

#### Out of Scope
- Manual link attribute management (plugin handles this)
- Link tracking/analytics (separate concern)
- Custom link behavior for specific domains
- Link shortening or redirect services

#### Strict Rules to Follow
- Use rehype ecosystem for MDX processing
- Follow TypeScript strict mode
- Do not modify content, only add attributes
- Preserve existing rel attributes if present
- Test that internal links are not affected

#### Existing Code Patterns
- `astro.config.mjs` already has MDX integration
- MDX content is in `src/content/cases/`, `src/content/capabilities/`, etc.
- `src/pages/connect.astro` has manual `rel="noopener noreferrer"` as reference

#### Advanced Code Patterns
- Use `rehype-external-links` package from npm if suitable, or custom implementation
- Add configuration option to exclude certain domains from auto-targeting
- Consider adding `rel="nofollow"` for untrusted external domains

#### Anti-Patterns
- Do not manually add rel attributes to every link (use the plugin)
- Do not apply target="_blank" to internal links
- Do not break existing MDX content with the plugin
- Do not forget to test with various link formats (markdown, HTML, MDX components)

---

- [ ] [READY] **TASK-006: Add Dark Mode Toggle UI**
  - [ ] TASK-006.1: Create theme toggle component at `src/components/ThemeToggle.astro`
  - [ ] TASK-006.2: Add toggle to `src/layouts/BaseLayout.astro` (header area)
  - [ ] TASK-006.3: Implement localStorage persistence for theme preference
  - [ ] TASK-006.4: Add system preference detection with `prefers-color-scheme`
  - [ ] TASK-006.5: Ensure toggle works with existing `@custom-variant dark` CSS

#### Related Files
- `src/components/ThemeToggle.astro` (to create)
- `src/layouts/BaseLayout.astro` (to modify)
- `src/styles/global.css` (has `@custom-variant dark` and `class="dark"`)

#### Definition of Done
- [ ] Theme toggle button is visible in site header
- [ ] Toggle switches between light and dark modes
- [ ] Theme preference is stored in localStorage
- [ ] Initial theme respects system preference if no localStorage value
- [ ] Toggle icon reflects current theme state
- [ ] Toggle meets 44x44px touch target minimum
- [ ] Component is accessible with proper ARIA labels

#### Out of Scope
- Custom color themes beyond light/dark
- Theme transition animations (beyond CSS transitions)
- Per-page theme overrides
- Theme sync across browser tabs (localStorage is sufficient)

#### Strict Rules to Follow
- Use localStorage with try-catch for storage blocked scenarios
- Tailwind utility classes only, no inline styles
- Work with existing `@custom-variant dark` in global.css
- Ensure toggle does not break existing dark mode CSS
- Do not use external theme libraries

#### Existing Code Patterns
- `src/styles/global.css` has `@custom-variant dark (&:where(.dark, .dark *))`
- `src/layouts/BaseLayout.astro` has `<html class="dark">` hardcoded
- `ErrorBoundary.astro` shows localStorage usage with error handling

#### Advanced Code Patterns
- Use a client-side script to toggle class on html element
- Consider adding a "system" option that follows OS preference
- Add smooth color transition in CSS for theme switching

#### Anti-Patterns
- Do not hardcode `class="dark"` on html element after adding toggle
- Do not use cookies when localStorage suffices
- Do not create a separate light-only CSS file
- Do not forget to handle localStorage quota exceeded errors

---

- [ ] [READY] **TASK-007: Implement RSS Feed Generation**
  - [ ] TASK-007.1: Install `@astrojs/rss` package
  - [ ] TASK-007.2: Create RSS endpoint at `src/pages/rss.xml.js`
  - [ ] TASK-007.3: Configure RSS feed for learning logs content
  - [ ] TASK-007.4: Add RSS feed link to `src/layouts/BaseLayout.astro` head
  - [ ] TASK-007.5: Test RSS feed validation

#### Related Files
- `src/pages/rss.xml.js` (to create)
- `src/layouts/BaseLayout.astro` (add RSS link tag)
- `src/content.config.ts` (reference learning logs schema)
- `package.json` (add @astrojs/rss dependency)

#### Definition of Done
- [ ] RSS feed is accessible at `/rss.xml`
- [ ] Feed includes all learning log entries
- [ ] Feed includes proper item metadata (title, date, description, link)
- [ ] RSS auto-discovery link is in page head
- [ ] Feed validates against RSS 2.0 specification
- [ ] Feed updates automatically when content is added

#### Out of Scope
- RSS feeds for other content types (resources, case studies)
- JSON Feed format
- Email newsletter integration
- Feed analytics/tracking

#### Strict Rules to Follow
- Use `@astrojs/rss` package for RSS generation
- Follow TypeScript strict mode
- Use existing `getCollection('learningLogs')` pattern
- Do not hardcode feed items; use dynamic content
- Ensure feed includes proper dates from content frontmatter

#### Existing Code Patterns
- `src/pages/lab/learning-log/index.astro` uses `getCollection('learningLogs')`
- `src/content.config.ts` defines learning logs schema with date field
- `src/layouts/BaseLayout.astro` has other meta tags in head section

#### Advanced Code Patterns
- Consider adding RSS feeds for resources and case studies separately
- Use RSS feed for newsletter platform integration later
- Add feed item descriptions from excerpt field

#### Anti-Patterns
- Do not manually create RSS XML (use the package)
- Do not include draft or unpublished content in feed
- Do not forget to add RSS auto-discovery link to head
- Do not break existing sitemap generation

---

- [ ] [READY] **TASK-008: Add PWA Manifest and Service Worker**
  - [ ] TASK-008.1: Create web app manifest at `public/manifest.webmanifest`
  - [ ] TASK-008.2: Create service worker at `public/sw.js`
  - [ ] TASK-008.3: Add service worker registration script to `src/layouts/BaseLayout.astro`
  - [ ] TASK-008.4: Add missing PWA icons (icon-192.png, icon-512.png)
  - [ ] TASK-008.5: Create browserconfig.xml for Windows tile support

#### Related Files
- `public/manifest.webmanifest` (to create)
- `public/sw.js` (to create)
- `src/layouts/BaseLayout.astro` (add service worker registration)
- `public/` (add icon-192.png, icon-512.png, browserconfig.xml)

#### Definition of Done
- [ ] Web app manifest exists at `/manifest.webmanifest`
- [ ] Service worker exists at `/sw.js` with basic caching strategy
- [ ] Service worker is registered in BaseLayout
- [ ] PWA icons (192x192, 512x512) exist in public directory
- [ ] browserconfig.xml exists for Windows tile support
- [ ] Site is installable on supported browsers
- [ ] Service worker caches critical assets for offline viewing

#### Out of Scope
- Full offline functionality (basic caching only)
- Push notifications
- Background sync
- Complex caching strategies (stale-while-revalidate, etc.)

#### Strict Rules to Follow
- Use standard web app manifest format
- Keep service worker simple (cache-first for static assets)
- Tailwind utility classes for any PWA-related UI
- Do not use external PWA build tools
- Ensure service worker scope is correct

#### Existing Code Patterns
- `src/layouts/BaseLayout.astro` already references `/browserconfig.xml` in meta tags
- `public/` already has apple-touch-icon.png, favicon.ico, favicon.svg
- `astro.config.mjs` has static site output configuration

#### Advanced Code Patterns
- Use Workbox for more advanced service worker features (if needed later)
- Add offline fallback page for cached content
- Consider adding app shortcuts in manifest

#### Anti-Patterns
- Do not implement complex service worker logic for a simple portfolio
- Do not forget to unregister old service workers during development
- Do not cache dynamic content that should always be fresh
- Do not break existing favicon setup

---

- [ ] [READY] **TASK-009: Add Resume PDF File**
  - [ ] TASK-009.1: Create or obtain resume PDF file
  - [ ] TASK-009.2: Place resume PDF at `public/TrevorLam-Resume-2026.pdf`
  - [ ] TASK-009.3: Verify download link in `src/pages/connect.astro` works
  - [ ] TASK-009.4: Add PDF metadata (title, author, creation date)

#### Related Files
- `public/TrevorLam-Resume-2026.pdf` (to add)
- `src/pages/connect.astro` (verify existing link)
- `public/pdfs/` (existing case study PDFs for reference)

#### Definition of Done
- [ ] Resume PDF exists at `/TrevorLam-Resume-2026.pdf`
- [ ] Download link in connect page works correctly
- [ ] PDF file is accessible and not broken
- [ ] PDF has proper metadata for SEO
- [ ] File size is reasonable (< 5MB for fast download)

#### Out of Scope
- Server-side PDF generation
- Dynamic resume generation from data
- Multiple resume versions
- Resume analytics/tracking

#### Strict Rules to Follow
- Use exact filename referenced in connect page
- Ensure PDF is optimized for web (compressed, not print-quality)
- Do not add PDF to src/assets (belongs in public/)
- Do not use external hosting for resume PDF

#### Existing Code Patterns
- `src/pages/connect.astro` has link to `/TrevorLam-Resume-2026.pdf`
- `public/pdfs/` contains case study PDFs (grandlux.pdf, klw.pdf, sonic.pdf)

#### Advanced Code Patterns
- Consider adding PDF viewer integration for in-browser preview
- Add PDF schema markup to connect page for search engines

#### Anti-Patterns
- Do not link to a non-existent PDF file
- Do not use an excessively large PDF file
- Do not forget to test the download link
- Do not put resume in a subdirectory (link expects root level)

---

- [ ] [READY] **TASK-010: Implement Speculation Rules API**
  - [ ] TASK-010.1: Add speculation rules script to `src/layouts/BaseLayout.astro` head
  - [ ] TASK-010.2: Configure prerender rules for key navigation links
  - [ ] TASK-010.3: Add prefetch hints for likely next pages
  - [ ] TASK-010.4: Test speculation rules in Chrome DevTools

#### Related Files
- `src/layouts/BaseLayout.astro` (add speculation rules script)
- `src/config/navigation.ts` (reference for key navigation links)

#### Definition of Done
- [ ] Speculation rules script is present in page head
- [ ] Rules prerender key navigation links (cases, capabilities, lab)
- [ ] Rules prefetch likely next pages for faster navigation
- [ ] Speculation rules are valid JSON
- [ ] Rules do not cause excessive bandwidth usage
- [ ] Performance improvement is measurable in Lighthouse

#### Out of Scope
- Full prefetch of all pages (too aggressive)
- Speculative prefetch for external links
- Complex speculation rule conditions
- Browser compatibility fallbacks (Chrome-only feature)

#### Strict Rules to Follow
- Use speculation rules API format (JSON in script tag)
- Keep rules conservative to avoid bandwidth waste
- Only speculate on high-probability next pages
- Do not speculate on external domains
- Test in Chrome DevTools Application panel

#### Existing Code Patterns
- `src/layouts/BaseLayout.astro` already has preconnect hints for plausible.io
- `astro.config.mjs` has prefetch configuration for ClientRouter

#### Advanced Code Patterns
- Use eagerness parameter to control speculation aggressiveness
- Add document rules for specific high-traffic pages
- Consider adding speculation rules for search results

#### Anti-Patterns
- Do not speculate on every link (wastes bandwidth)
- Do not forget that this is Chrome-only currently
- Do not use speculation rules for critical navigation (use link prefetch instead)
- Do not break existing prefetch configuration

---

- [ ] [READY] **TASK-011: Additional Polish Tasks**
  - [ ] TASK-011.1: Create `/uses` page at `src/pages/uses.astro` (tools, hardware, software stack)
  - [ ] TASK-011.2: Add animation pause toggle for `prefers-reduced-motion` override
  - [ ] TASK-011.3: Add draft mode support with `draft: true` field in schemas
  - [ ] TASK-011.4: Create `.nvmrc` file with Node version `>=22.12.0`
  - [ ] TASK-011.5: Set up Husky pre-commit hooks with lint-staged
  - [ ] TASK-011.6: Add CSP reporting endpoint configuration
  - [ ] TASK-011.7: Add `vercel dev` script to package.json
  - [ ] TASK-011.8: Add noscript fallback content to BaseLayout
  - [ ] TASK-011.9: Create 500 error page (duplicate of TASK-002 - remove if completed)

#### Related Files
- `src/pages/uses.astro` (to create)
- `src/components/AnimationToggle.astro` (to create)
- `src/content.config.ts` (add draft field to schemas)
- `.nvmrc` (to create)
- `package.json` (add husky, lint-staged, vercel dev script)
- `astro.config.mjs` (add CSP reporting)
- `src/layouts/BaseLayout.astro` (add noscript content)

#### Definition of Done
- [ ] `/uses` page exists with equipment and software list
- [ ] Animation toggle allows users to pause all animations
- [ ] Draft content is filtered out in production builds
- [ ] `.nvmrc` file specifies Node version
- [ ] Pre-commit hooks run lint on staged files
- [ ] CSP violations are reported to monitoring endpoint
- [ ] `vercel dev` script works for local development
- [ ] noscript content provides navigation when JS is disabled

#### Out of Scope
- Complex draft workflow with preview URLs
- Full CI/CD pipeline configuration
- Advanced animation controls (speed, type)
- Equipment affiliate links

#### Strict Rules to Follow
- Use BaseLayout for all new pages
- Tailwind utility classes only
- TypeScript strict mode
- Follow existing code patterns

#### Existing Code Patterns
- `src/pages/404.astro` for page structure reference
- `src/content.config.ts` for schema patterns
- `src/styles/global.css` for animation references

#### Advanced Code Patterns
- Use Astro's `import.meta.env.MODE` for draft mode detection
- Consider using rehype plugin for global noscript injection

#### Anti-Patterns
- Do not add draft mode without proper production filtering
- Do not make animation controls overly complex
- Do not skip accessibility testing for noscript content
- Do not break existing content with draft field addition
