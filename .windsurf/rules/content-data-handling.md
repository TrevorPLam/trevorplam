---
trigger: always_on
description: Content collections, data handling, and image optimization standards
---

# Content & Data Handling

## Image Storage

- Place images in `/src/assets/`, NOT `/public/`
- Images in `/src/assets/` are automatically optimized
- Use `OptimizedImage` component for all images

## Image Optimization

- LCP images (headshot) need:
  - `loading="eager"`
  - `fetchpriority="high"`
- Other images: use default lazy loading

## JSON Data

- Import JSON data from `/data/` directory
- Available files: metrics.json, skills.json, timeline.json
- Example: `import metrics from 
../../data/metrics.json`

## Metrics

- NEVER hardcode metric values
- Always reference `/data/metrics.json`
- This ensures single source of truth

## Content Collections

- Case studies: `/src/content/cases/` – use `getCollection(caseStudies)`
- Capabilities: `/src/content/capabilities/` – 5 capability categories
- Learning logs: `/src/content/learning-logs/` – 6 entries with tagging
- Projects: `/src/content/projects/` – 3 project showcases
- Resources: `/src/content/resources/` – 8 playbooks, templates, guides
- Skills: JSON in `/src/content/skills/` – 4 category files

## Content Rendering

- Use `await render(entry, { components })` for MDX
- Import: `import { render } from astro:content`
- Pass component map for custom components

## Common Pitfalls

| Pitfall | Prevention |
|---------|-------------|
| Placing images in /public/ | Place in /src/assets/ for optimization |
| Hardcoding metrics | Import from /data/metrics.json |
| Forgetting loading="eager" on LCP images | Add to headshot image |
| Using entry.render() | Use await render(entry, { components }) |
