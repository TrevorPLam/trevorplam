---
name: content-layer-api
description: Guides Content Layer API usage with MDX, Zod v4 schemas, getCollection, and render functions for Astro 6
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [astro, content-layer, mdx, zod]
  astro_version: 6.1.8
  zod_version: 4.x
---

# Content Layer API

## Verification Snapshot (2026-04)
- Verified against Astro 6.1.8 Content Layer API
- Tested with Zod v4 schemas for validation
- Confirmed getCollection() patterns work correctly
- Validated render() function with custom components
- Verified MDX content collections load properly

This skill provides guidance for using Astro 6's Content Layer API with MDX content collections and Zod v4 schema validation.

## Content Configuration

### Define Collections in src/content.config.ts

```typescript
import { defineCollection, z } from 'astro:content'

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/cases', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    industry: z.string(),
    problem: z.string(),
    result: z.string(),
    skills: z.array(z.string()),
    metrics: z.array(z.string()),
  })
})

const capabilities = defineCollection({
  loader: glob({ base: './src/content/capabilities', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    philosophy: z.string(),
    kpis: z.array(z.object({
      name: z.string(),
      value: z.string(),
      unit: z.string()
    })),
    industries: z.array(z.string())
  })
})

const learningLogs = defineCollection({
  loader: glob({ base: './src/content/learning-logs', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    tags: z.array(z.string()),
    excerpt: z.string()
  })
})

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    status: z.enum(['active', 'completed', 'on-hold']),
    technologies: z.array(z.string()),
    tags: z.array(z.string())
  })
})

const resources = defineCollection({
  loader: glob({ base: './src/content/resources', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['playbook', 'template', 'guide']),
    audience: z.string(),
    gated: z.boolean()
  })
})

export const collections = {
  caseStudies,
  capabilities,
  learningLogs,
  projects,
  resources
}
```

## Getting Collections

### Get All Entries

```typescript
import { getCollection } from 'astro:content'

const allCases = await getCollection('caseStudies')
```

### Get Filtered Entries

```typescript
const publishedCases = await getCollection('caseStudies', ({ data }) => {
  return data.published === true
})
```

### Get Single Entry by Slug

```typescript
import { getEntry } from 'astro:content'

const entry = await getEntry('caseStudies', 'sonic-drive-in')
```

### Get Entry by ID

```typescript
const entry = await getEntryById('caseStudies', 'sonic-drive-in')
```

## Rendering MDX Content

### Basic Rendering

```typescript
import { render } from 'astro:content'

const { Content } = await render(entry)
```

### Rendering with Custom Components

```typescript
import { render } from 'astro:content'
import CaseStudyHeader from '@/components/CaseStudyHeader.astro'
import MetricCard from '@/components/MetricCard.astro'

const { Content, headings } = await render(entry, {
  components: {
    CaseStudyHeader,
    MetricCard,
    // ... other components
  }
})
```

### Extracting Headings

```typescript
const { headings } = await render(entry, { components })

// headings contains table of contents data
```

## Dynamic Page Generation

### Generate Pages from Collection

```typescript
export async function getStaticPaths() {
  const entries = await getCollection('caseStudies')
  
  return entries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry }
  }))
}

const { entry } = Astro.props
const { Content } = await render(entry, { components })
```

## Zod v4 Schema Patterns

### String Validation

```typescript
title: z.string().min(1).max(100)
```

### Enum Validation

```typescript
status: z.enum(['active', 'completed', 'on-hold'])
```

### Array Validation

```typescript
skills: z.array(z.string()).min(1)
tags: z.array(z.string())
```

### Object Validation

```typescript
kpis: z.array(z.object({
  name: z.string(),
  value: z.string(),
  unit: z.string()
}))
```

### Date Validation

```typescript
date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
```

### Boolean Validation

```typescript
gated: z.boolean()
```

## Content File Locations

- **Case studies**: `/src/content/cases/`
- **Capabilities**: `/src/content/capabilities/`
- **Learning logs**: `/src/content/learning-logs/`
- **Projects**: `/src/content/projects/`
- **Resources**: `/src/content/resources/`
- **Skills**: `/src/content/skills/` (JSON files)

## JSON Data Files

### Importing JSON Data

```typescript
import metrics from '../../data/metrics.json'
import skills from '../../data/skills.json'
import timeline from '../../data/timeline.json'
```

### Data File Locations

- **Metrics**: `/data/metrics.json`
- **Skills**: `/data/skills.json`
- **Timeline**: `/data/timeline.json`

## Common Patterns

### Display Metrics from Data

```typescript
import metrics from '../../data/metrics.json'

metrics.forEach(metric => {
  // Display metric
})
```

### Filter by Tags

```typescript
const taggedEntries = await getCollection('learningLogs', ({ data }) => {
  return data.tags.includes('astro')
})
```

### Sort by Date

```typescript
const sortedEntries = (await getCollection('learningLogs')).sort((a, b) => {
  return new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
})
```

## Gotchas

- **loader: glob() required**: Must specify both `base` and `pattern` in defineCollection
- **entry.render() deprecated**: Use `await render(entry, { components })` from `astro:content`
- **Astro.glob() deprecated**: Use `getCollection()` or `getEntry()` from Content Layer API
- **Components parameter**: render() requires components object for custom MDX components
- **Zod v4 syntax**: Use `z.object()`, `z.array()`, `z.enum()` for schema validation
- **Content config location**: Must be `src/content.config.ts` (not `src/content/config.ts`)
- **JSON data imports**: Import from `/data/` directory, not content collections
- **Slug vs ID**: `getEntry()` uses slug, `getEntryById()` uses entry ID
- **Filter function**: Second argument to `getCollection()` is a filter function on entry.data
- **Headings extraction**: Only available when using `await render(entry, { components })`

## Validation Loop

1. Make content collection changes
2. Run type check: `npm run check`
3. If schema validation errors:
   - Review Zod schema in `src/content.config.ts`
   - Fix schema or content file to match
   - Re-run type check
4. Run build: `npm run build`
5. If build errors:
   - Check for deprecated API usage (entry.render, Astro.glob)
   - Fix to use Content Layer API
   - Re-run build
6. Only proceed when type check and build pass

## Important Notes

- Always use `loader: glob()` with base and pattern
- Zod v4 provides type-safe content validation
- Use `await render(entry, { components })` for MDX
- Never use `entry.render()` (deprecated)
- Never use `Astro.glob()` (deprecated)
- Images go in `/src/assets/`, not `/public/`
- Use `OptimizedImage` component for images
