---
trigger: always_on
description: Tailwind CSS v4 styling standards and configuration
---

# Tailwind v4 Standards

## Configuration

- NO `tailwind.config.mjs` file - use CSS-first configuration
- Add `@tailwindcss/vite` to Vite plugins in astro.config.mjs
- Use `@theme` directive in CSS for theme customization

## Styling Rules

- Use Tailwind utility classes ONLY
- NO custom CSS in component `<style>` tags
- NO inline styles except for dynamic values

## Critical: MDX Components

- Do NOT use `<style>` tags in components imported into MDX
- Astro 6 bug: `<style>` tags are dropped in MDX-imported components
- Affects: InlineMetric, SkillTag, and any component imported into `.mdx` files
- Workaround: Use Tailwind classes only for all MDX-imported components

## Dark Mode

- Add `class="dark"` to `<html>` element
- Use CSS: `@custom-variant dark (&:where(.dark, .dark *))`
- Example:
  ```css
  @custom-variant dark (&:where(.dark, .dark *));
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
    }
  }
  ```

## Common Pitfalls

| Pitfall | Prevention |
|---------|-------------|
| Creating tailwind.config.mjs | Use CSS-first config with @theme |
| Using <style> in MDX components | Tailwind classes only (Astro 6 bug) |
| Forgetting dark mode class | Add class="dark" to <html> |
| Using @astrojs/tailwind | Use @tailwindcss/vite plugin |
