---
name: tailwind-v4
description: Guides Tailwind CSS v4 patterns with @tailwindcss/vite plugin, CSS-first configuration, @theme directive, and utility-only styling
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [tailwind, css, styling, utility-first]
  tailwind_version: 4.2.3
  vite_version: 7.3.2
---

# Tailwind CSS v4

## Verification Snapshot (2026-04)
- Verified against Tailwind CSS 4.2.3
- Tested with @tailwindcss/vite plugin in Astro 6.1.8
- Confirmed CSS-first configuration with @theme works
- Validated dark mode with @custom-variant
- Verified no <style> tags in MDX-imported components

This skill provides guidance for using Tailwind CSS v4 with Astro 6, focusing on the @tailwindcss/vite plugin and CSS-first configuration.

## Key Differences from Tailwind v3

### No tailwind.config.mjs File
- Tailwind v4 uses CSS-first configuration
- No JavaScript config file needed
- Configuration done via CSS `@theme` directive

### @tailwindcss/vite Plugin
- Replaces `@astrojs/tailwind` integration
- Added to Vite plugins in `astro.config.mjs`
- No separate integration configuration

### CSS-First Configuration
- Use `@theme` directive in CSS
- Define theme values directly in CSS
- Supports CSS variables and modern CSS features

## Configuration

### astro.config.mjs

```javascript
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
  vite: {
    plugins: [tailwindcss()]
  }
})
```

### CSS Theme Configuration

```css
@theme {
  --color-primary: #3b82f6;
  --color-secondary: #10b981;
  --font-sans: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}

@custom-variant dark (&:where(.dark, .dark *));
```

## Dark Mode

### HTML Setup
```html
<html class="dark">
```

### CSS Custom Variant
```css
@custom-variant dark (&:where(.dark, .dark *));
```

### Usage
```html
<div class="dark:bg-gray-900 dark:text-white">
  Content
</div>
```

## Styling Rules

### Utility Classes Only
- Use Tailwind utility classes for all styling
- No custom CSS in component `<style>` tags
- Especially important for components imported into MDX

### Components in MDX
- **Critical**: Do NOT use `<style>` tags in components used inside MDX
- Astro 6 bug drops `<style>` tags in MDX-imported components
- Use Tailwind utility classes only
- Add comment: "Astro 6 bug: <style> dropped in MDX"

### Affected Components
- `InlineMetric.astro`
- `SkillTag.astro`
- Any component imported into `.mdx` files

## Common Patterns

### Responsive Design
```html
<div class="p-4 md:p-8 lg:p-12">
  Content
</div>
```

### Dark Mode
```html
<div class="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### Flexbox
```html
<div class="flex items-center justify-between gap-4">
  Content
</div>
```

### Grid
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  Content
</div>
```

### Typography
```html
<h1 class="text-3xl font-bold text-gray-900 dark:text-white">
  Heading
</h1>
<p class="text-base text-gray-600 dark:text-gray-400">
  Paragraph
</p>
```

### Spacing
```html
<div class="mt-4 mb-8 px-4 py-2">
  Content
</div>
```

### Colors
```html
<div class="bg-blue-500 text-white hover:bg-blue-600">
  Button
</div>
```

### Borders
```html
<div class="border border-gray-200 dark:border-gray-700 rounded-lg">
  Content
</div>
```

### Shadows
```html
<div class="shadow-md hover:shadow-lg transition-shadow">
  Card
</div>
```

## Theme Customization

### Custom Colors
```css
@theme {
  --color-brand: #3b82f6;
  --color-brand-light: #60a5fa;
  --color-brand-dark: #2563eb;
}
```

### Custom Fonts
```css
@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Custom Spacing
```css
@theme {
  --spacing-18: 4.5rem;
  --spacing-22: 5.5rem;
}
```

### Custom Breakpoints
```css
@theme {
  --breakpoint-2xl: 1536px;
}
```

## Performance Optimization

### PurgeCSS
- Tailwind v4 automatically purges unused styles
- No configuration needed
- Only used classes are included in build

### Critical CSS
- Astro automatically inlines critical CSS
- No manual optimization needed
- Improves LCP performance

## Gotchas

- **No tailwind.config.mjs**: Tailwind v4 uses CSS-first configuration - delete any existing config file
- **Vite v8 conflict**: Vite v8 conflicts with `@tailwindcss/vite` - must use v7.x
- **Style tags in MDX**: Astro 6 bug drops `<style>` tags in components imported into MDX - use Tailwind classes only
- **@custom-variant syntax**: Must use `@custom-variant dark (&:where(.dark, .dark *));` not just `@custom-variant dark`
- **Dark mode class**: Must add `class="dark"` to `<html>` element, not body
- **Color scheme**: Required `color-scheme: dark` on `:root` for proper dark mode
- **Inline styles**: Avoid inline styles - use Tailwind utility classes instead
- **Component styling**: Components used in MDX cannot have `<style>` tags - Tailwind classes only
- **Theme values**: Define custom values in `@theme` directive, not in JavaScript config
- **Plugin location**: Add `tailwindcss()` to Vite plugins in astro.config.mjs, not as Astro integration

## Validation Loop

1. Make Tailwind v4 styling changes
2. Run dev server: `npm run dev`
3. If styling issues:
   - Check browser console for CSS errors
   - Verify @theme directive syntax
   - Check for missing utility classes
   - Fix issues and reload
4. Run build: `npm run build`
5. If build errors:
   - Check for Tailwind syntax errors
   - Verify Vite plugin configuration
   - Fix and re-run build
6. Test dark mode:
   - Verify dark class on html element
   - Check dark mode utility classes apply correctly
7. Only proceed when styling and build pass

## Important Notes

- No `tailwind.config.mjs` file
- Use `@tailwindcss/vite` plugin in astro.config.mjs
- CSS-first configuration with `@theme` directive
- Dark mode: `class="dark"` on `<html>` with `@custom-variant dark`
- Do NOT use `<style>` tags in MDX-imported components (Astro 6 bug)
- Use Tailwind utility classes only for all styling
- Images in `/src/assets/`, not `/public/`
