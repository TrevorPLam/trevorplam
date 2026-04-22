---
name: content-authoring
description: Guides content authoring for case studies, capabilities, learning logs, projects, and resources with proper structure, metrics handling, and tone guidelines
license: MIT
metadata:
  version: 1.0.0
  last_updated: 2026-04-22
  author: Trevor Lam
  tags: [content, authoring, case-studies, metrics, tone]
  astro_version: 6.1.8
---

# Content Authoring

## Verification Snapshot (2026-04)
- Verified case study structure (Initial State → What I Delivered → Outcome)
- Confirmed metrics imported from /data/metrics.json (never hardcoded)
- Validated tone guidelines (professional, confident, evidence-based)
- Tested content collection schemas with Zod v4
- Confirmed proper MDX rendering with render() function

This skill provides guidance for authoring content in the Trevor Lam portfolio, including case studies, capabilities, learning logs, projects, and resources with proper structure, metrics handling, and tone guidelines.

## Tone Guidelines

### Professional and Confident

- **Evidence-based**: Support claims with data and metrics
- **Positive framing**: Use "initial state", "operational context" instead of "mess", "broken", "chaos"
- **Confident language**: Demonstrate expertise without arrogance
- **Outcome-focused**: Emphasize results and impact

### Examples of Tone

**Good:**
- "Initial state: Manual payroll processing with 280-315 accounts"
- "What I delivered: Automated payroll system reducing processing time by 60%"
- "Outcome: Payroll accuracy improved to 99.9%, zero cash discrepancies"

**Avoid:**
- "The payroll system was a mess"
- "I fixed the broken process"
- "Chaos in the payroll department"

## Case Study Structure

### Required Sections

```markdown
---
title: Case Study Title
industry: Industry Name
problem: Brief problem description
result: Key outcome
skills: [skill1, skill2, skill3]
metrics: [metric1, metric2]
---

## Initial State
Describe the starting situation and challenges

## What I Delivered
Detail the actions taken and solutions implemented

## Outcome
Quantify the results with metrics
```

### Case Study Best Practices

- **Use metrics from /data/metrics.json**: Never hardcode metric values
- **Structure**: Initial State → What I Delivered → Outcome
- **Specific metrics**: Include before/after numbers
- **Skills alignment**: Tag relevant skills from skills.json
- **Industry context**: Specify industry for filtering

### Metrics Import

```typescript
import metrics from '../../data/metrics.json'

// Use metrics in content
metrics.forEach(metric => {
  // Display metric
})
```

## Capability Pages

### Required Structure

```markdown
---
title: Capability Title
philosophy: Brief philosophy statement
kpis:
  - name: KPI Name
    value: Value
    unit: Unit
industries: [industry1, industry2]
---

## Philosophy
Explain the approach and methodology

## Key Performance Indicators
Display KPIs with MetricCard component

## Industries
List relevant industries served
```

### KPI Display

```astro
<KPICard
  name="Revenue Growth"
  value="25%"
  unit="YoY"
/>
```

## Learning Logs

### Required Structure

```markdown
---
title: Learning Log Title
date: YYYY-MM-DD
tags: [tag1, tag2, tag3]
excerpt: Brief summary
---

## Content
Detailed learning content
```

### Learning Log Best Practices

- **Date format**: YYYY-MM-DD for consistency
- **Tags**: Use 3-5 relevant tags for filtering
- **Excerpt**: 1-2 sentence summary for listing pages
- **Technical depth**: Balance theory with practical application

## Projects

### Required Structure

```markdown
---
title: Project Title
status: active | completed | on-hold
technologies: [tech1, tech2]
tags: [tag1, tag2]
---

## Description
Project description and goals

## Implementation
Technical approach and implementation details

## Status
Current status and next steps
```

### Status Values

- **active**: Currently in development
- **completed**: Finished and deployed
- **on-hold**: Paused or deferred

## Resources

### Required Structure

```markdown
---
title: Resource Title
type: playbook | template | guide
audience: Target audience
gated: false | true
---

## Content
Resource content
```

### Resource Types

- **playbook**: Step-by-step operational guide
- **template**: Reusable document or code template
- **guide**: Educational content on a topic

### Gated Content

- **gated: false**: Publicly accessible
- **gated: true**: Requires form submission to access

## Metrics Handling

### Critical Rule: Never Hardcode Metrics

All metric values must come from `/data/metrics.json`:

```typescript
import metrics from '../../data/metrics.json'

// Correct
const revenueGrowth = metrics.find(m => m.id === 'revenue-growth')

// Incorrect - NEVER do this
const revenueGrowth = 25 // Hardcoded value
```

### Metrics JSON Structure

```json
{
  "id": "metric-id",
  "label": "Metric Label",
  "value": "Value",
  "unit": "Unit",
  "context": "Additional context"
}
```

### Skills JSON Structure

```json
{
  "category": "Category Name",
  "skills": [
    {
      "name": "Skill Name",
      "level": "expert | advanced | intermediate",
      "yearsExperience": 5
    }
  ]
}
```

### Timeline JSON Structure

```json
{
  "year": 2020,
  "title": "Role Title",
  "company": "Company Name",
  "description": "Description"
}
```

## Content Rendering

### Rendering MDX with Components

```typescript
import { render } from 'astro:content'
import CaseStudyHeader from '@/components/CaseStudyHeader.astro'
import MetricCard from '@/components/MetricCard.astro'

const { Content, headings } = await render(entry, {
  components: {
    CaseStudyHeader,
    MetricCard
  }
})
```

### Component Usage in MDX

```mdx
import { MetricCard } from '@/components/MetricCard.astro'

<MetricCard name="Revenue Growth" value="25%" unit="YoY" />
```

## Content Validation Loop

1. Create or edit content file
2. Run type check: `npm run check`
3. If schema validation errors:
   - Review Zod schema in `src/content.config.ts`
   - Fix schema or content file to match
   - Re-run type check
4. Run build: `npm run build`
5. If build errors:
   - Check for missing required fields
   - Verify MDX syntax
   - Fix and re-run build
6. Verify metrics:
   - Ensure no hardcoded metric values
   - Confirm import from /data/metrics.json
   - Check metric IDs exist in metrics.json
7. Test rendering:
   - Run dev server: `npm run dev`
   - Navigate to content page
   - Verify content displays correctly
8. Only proceed when type check passes, build succeeds, metrics validated

## Gotchas

- **Hardcoded metrics**: Never hardcode metric values - always import from /data/metrics.json
- **Missing required fields**: Check Zod schema in src/content.config.ts for required fields
- **Wrong content config location**: Must be src/content.config.ts (not src/content/config.ts)
- **entry.render() deprecated**: Use await render(entry, { components }) from astro:content
- **Style tags in MDX components**: Astro 6 bug drops <style> tags - use Tailwind classes only
- **Negative framing**: Avoid "mess", "broken", "chaos" - use "initial state", "operational context"
- **Placeholder text**: No placeholder text - final copy only
- **Missing alt text**: Images must have descriptive alt text
- **Images in /public/**: Place in /src/assets/ for optimization
- **Missing tone**: Ensure professional, confident, evidence-based tone

## Important Notes

- Tone: professional, confident, evidence-based
- Metrics: all from /data/metrics.json - never hardcoded
- Case studies: Initial State → What I Delivered → Outcome structure
- Content rendering: await render(entry, { components })
- Images in /src/assets/ with OptimizedImage component
- LCP images need loading="eager" and fetchpriority="high"
- No placeholder text - final copy only
