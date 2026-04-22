# Breadcrumb Usage Rules

This document defines when and how to use breadcrumbs on trevor-lam.com.

## When to Show Breadcrumbs

### Pages That SHOULD Have Breadcrumbs

Breadcrumbs should appear on all content pages except the homepage:

- **About** (`/about`)
- **Connect** (`/connect`)
- **Privacy Policy** (`/privacy`)
- **Terms of Use** (`/terms`)
- **Search** (`/search`)
- **Archive** (`/archive`)
- **Case Studies** (`/cases/[slug]`)
- **Capabilities** (`/capabilities/[slug]`)
- **Resources** (`/resources`, `/resources/[category]`, `/resources/[category]/[slug]`)
- **Lab** (`/lab`, `/lab/[section]`, `/lab/[section]/[slug]`)
- **Skills Matrix** (`/resources/skills-matrix`)
- **Tech Stack** (`/lab/tech-stack`)

### Pages That SHOULD NOT Have Breadcrumbs

- **Homepage** (`/`) - Root page, no navigation context needed
- **Error pages** (`/404`, `/500`) - Users are in an error state, navigation context is less relevant
- **Redirect pages** - Temporary redirects don't need breadcrumbs

## Breadcrumb Component Usage

### Using the Breadcrumbs Component

Import and use the `Breadcrumbs` component from `src/components/Breadcrumbs.astro`:

```astro
---
import Breadcrumbs from '../components/Breadcrumbs.astro';
---

<Breadcrumbs />
```

The component automatically:
- Generates breadcrumb hierarchy based on current path
- Includes Schema.org JSON-LD structured data
- Provides proper ARIA labels for accessibility
- Excludes itself on the homepage
- Converts kebab-case to Title Case for dynamic routes
- Uses navigation config for proper naming

### Component Features

**Schema.org JSON-LD:**
- Automatically generates `BreadcrumbList` structured data
- Includes proper position, name, and item properties
- Uses full URLs for SEO

**Accessibility:**
- `aria-label="Breadcrumb"` on the nav element
- `aria-current="page"` on the last breadcrumb item
- Touch targets ≥44x44px for all interactive elements
- Proper color contrast (4.5:1 minimum)

**Styling:**
- Uses Tailwind utility classes
- Responsive design with proper spacing
- Hover states for interactive breadcrumb items
- Separator icons between breadcrumb levels

## Custom Breadcrumb Implementations

### When to Use Custom Breadcrumbs

Custom breadcrumb implementations are acceptable when:
- The page has a unique navigation structure not captured by URL hierarchy
- The page requires additional context beyond the standard breadcrumb path
- The page is part of a special section with different naming conventions

### Custom Breadcrumb Requirements

If implementing custom breadcrumbs, they MUST:
1. Include Schema.org JSON-LD `BreadcrumbList` structured data
2. Use `aria-label="Breadcrumb"` on the nav element
3. Use `aria-current="page"` on the last breadcrumb item
4. Provide touch targets ≥44x44px for all interactive elements
5. Use proper semantic HTML (`<nav>`, `<ol>`, `<li>`)
6. Include separator icons between breadcrumb levels
7. Match the styling of the standard Breadcrumbs component

**Example of proper custom breadcrumbs:**
```astro
<nav aria-label="Breadcrumb">
  <ol class="flex items-center space-x-2 text-sm text-text-muted">
    <li>
      <a href="/" class="hover:text-text-heading min-h-[44px] min-w-[44px] flex items-center">Home</a>
    </li>
    <li>
      <span class="mx-2">/</span>
    </li>
    <li class="text-text-heading" aria-current="page">
      Current Page
    </li>
  </ol>
</nav>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://trevor-lam.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Current Page",
      "item": "https://trevor-lam.com/current-page"
    }
  ]
}
</script>
```

## Breadcrumb Hierarchy Rules

### Standard Hierarchy

Breadcrumbs should follow the site's information architecture:

```
Home → Section → Category → Item
```

**Examples:**
- `Home → Lab → Learning Log → [Post Title]`
- `Home → Resources → Playbooks → [Playbook Title]`
- `Home → Case Studies → [Case Study Title]`
- `Home → Capabilities → [Capability Name]`

### Section Naming

Breadcrumb names should match navigation labels:
- "Dashboard" for homepage (not "Home")
- "Lab" for experimental work section
- "Resources" for downloadable materials
- "Case Studies" for case study pages
- "Capabilities" for capability pages

### Dynamic Route Handling

For dynamic routes (e.g., `[slug]`), the component:
1. Attempts to find a matching name in navigation config
2. Falls back to converting kebab-case to Title Case
3. Uses the actual slug if no conversion is possible

## Anti-Patterns

### Incorrect Usage

- **Showing breadcrumbs on homepage** - No navigation context needed
- **Missing Schema.org JSON-LD** - Required for SEO and accessibility
- **Missing ARIA labels** - Required for screen reader users
- **Touch targets <44x44px** - Violates WCAG 2.2 AA accessibility standard
- **Inconsistent styling** - Breaks user experience
- **Hardcoded breadcrumb paths** - Use the component for automatic generation
- **Missing separator icons** - Users can't distinguish breadcrumb levels
- **Using `div` instead of semantic HTML** - Violates accessibility standards

### Common Mistakes

1. **Forgetting to import the component**
   ```astro
   <!-- Incorrect -->
   <Breadcrumbs />
   
   <!-- Correct -->
   ---
   import Breadcrumbs from '../components/Breadcrumbs.astro';
   ---
   <Breadcrumbs />
   ```

2. **Placing breadcrumbs after the main content**
   - Breadcrumbs should appear at the top of the page content
   - They help users understand where they are before reading content

3. **Not updating navigation config**
   - If a page name doesn't match the breadcrumb, update `src/config/navigation.ts`
   - This ensures consistent naming across the site

## Testing Checklist

When adding or modifying breadcrumbs, verify:

- [ ] Breadcrumbs appear on all content pages (except homepage)
- [ ] Breadcrumbs do NOT appear on homepage
- [ ] Schema.org JSON-LD is present and valid
- [ ] ARIA labels are correct (`aria-label="Breadcrumb"`, `aria-current="page"`)
- [ ] Touch targets are ≥44x44px
- [ ] Color contrast meets WCAG 2.2 AA (4.5:1 minimum)
- [ ] Breadcrumb hierarchy matches navigation structure
- [ ] Breadcrumb names match navigation labels
- [ ] Separator icons are visible between breadcrumb levels
- [ ] Hover states work for interactive breadcrumb items
- [ ] Breadcrumbs are keyboard navigable
- [ ] Screen readers announce breadcrumbs correctly

## Implementation Status

### Pages Using Breadcrumbs Component
- `search.astro`
- `resources/templates/[slug].astro`
- `resources/playbooks/[slug].astro`
- `lab/projects/index.astro`
- `lab/learning-log/index.astro`
- `cases/[slug].astro`
- `capabilities/[slug].astro`
- `archive.astro`

### Pages with Custom Breadcrumbs
- `lab/learning-log/[slug].astro` - Has Schema.org JSON-LD and proper ARIA
- `lab/projects/[slug].astro` - Has Schema.org JSON-LD and proper ARIA

### Pages Missing Breadcrumbs
- `about.astro`
- `connect.astro`
- `privacy.astro`
- `terms.astro`
- `resources/index.astro`
- `lab/index.astro`
- `resources/skills-matrix.astro`
- `lab/tech-stack.astro`

## Migration Plan

To standardize breadcrumb usage across the site:

1. Add Breadcrumbs component to all pages missing breadcrumbs
2. Replace custom breadcrumbs with Breadcrumbs component where appropriate
3. Update navigation config if breadcrumb names don't match
4. Validate Schema.org JSON-LD for all breadcrumb implementations
5. Run accessibility tests to ensure WCAG 2.2 AA compliance
6. Update this document as implementation progresses
