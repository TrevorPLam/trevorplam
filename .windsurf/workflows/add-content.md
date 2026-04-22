---
description: Add new content (case studies, capabilities, learning logs, projects, resources) with proper structure and validation
---

# Add Content Workflow

This workflow guides you through adding new content to the Trevor Lam portfolio with proper structure, Zod schema validation, and test generation.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed (`npm install`)
- Content schema defined in `src/content.config.ts`

## Step 1: Create Spec (AI Best Practice: Specs Before Code)

Before creating content, generate a comprehensive spec following Addy Osmani's "specs before code" principle. This ensures clarity and prevents wasted cycles.

### Spec Structure

Create a `spec-[content-type].md` file with:

1. **Requirements**: What content are we adding and why?
2. **Target Audience**: Who will read this content?
3. **Key Messages**: What points must be communicated?
4. **Structure**: How should the content be organized?
5. **Tone Guidelines**: Professional, confident, evidence-based
6. **Metrics/Data**: Which metrics from `/data/metrics.json` will be referenced?
7. **Related Content**: Links to related case studies, capabilities, etc.
8. **Testing Strategy**: How will we validate the content?

### Example Spec for Case Study

```markdown
# Spec: [Case Study Title]

## Requirements
Add a case study showcasing [specific achievement/role]

## Target Audience
[Recruiters, hiring managers, clients]

## Key Messages
- Demonstrated [specific skill]
- Achieved [specific outcome]
- Applied [specific methodology]

## Structure
1. Initial State
2. What I Delivered
3. Outcome

## Tone Guidelines
- Professional, confident
- Use "initial state" not "mess"
- Use "operational context" not "chaos"
- Evidence-based with specific metrics

## Metrics/Data
- Reference: [metric-name] from /data/metrics.json
- Reference: [metric-name] from /data/metrics.json

## Related Content
- Link to capability: [capability-name]
- Link to skill: [skill-name]

## Testing Strategy
- Schema validation
- Build verification
- Accessibility check
- E2E test for page
```

**Why this matters**: A clear spec forces you and the AI onto the same page, preventing wasted cycles and ensuring the content aligns with goals.

## Step 1.5: Targeted Online Research (Current as of 04/2026)

Inform your understanding with external best practices before creating content. This ensures content follows current best practices for tone, structure, and SEO.

### Task-Specific Research
Conduct up-to-date research specifically on the content type and topic you're creating.

### Focus Areas
Your research should cover:
- Best practices for the content type (case studies, capabilities, learning logs, etc.)
- Current SEO guidelines for content structure
- Tone and voice best practices for professional portfolios
- Accessibility guidelines for content (WCAG 2.2 AA)
- Modern content formatting and organization patterns

### Prioritize Official Sources
- Official documentation for content management systems
- SEO best practice guides (Google, Moz, etc.)
- Accessibility guidelines (WCAG 2.2)
- Content strategy resources
- Industry-specific writing standards

### Output Required
- Research findings with sources
- Best practices for the content type
- SEO recommendations
- Accessibility considerations
- Tone and voice guidelines
- Content structure recommendations

## Step 2: Repository Impact Mapping (Harness Engineering)

Before creating files, have the AI scan the codebase and produce a repository impact map. This grounds the work in the actual codebase structure.

### Impact Map Structure

```markdown
# Repository Impact Map: [Content Title]

## Files to Create
- `src/content/[type]/[filename].mdx` - New content file

## Files to Modify
- `src/content.config.ts` - May need schema updates
- `src/pages/[page].astro` - May need navigation updates

## Dependencies
- Check if new components needed
- Verify image assets available in `/src/assets/`
- Confirm metrics exist in `/data/metrics.json`

## Integration Points
- Navigation menu updates
- Sitemap generation
- Search indexing
```

**Human Review Required**: Before proceeding, review the impact map. If the AI picked the wrong location or missed dependencies, catch it here.

## Step 3: Determine Content Type

Based on the approved spec and impact map, determine which type of content to add:
- Case study (`/src/content/cases/`)
- Capability (`/src/content/capabilities/`)
- Learning log (`/src/content/learning-logs/`)
- Project (`/src/content/projects/`)
- Resource (`/src/content/resources/`)

## Step 4: Create Content File

Based on the content type, create the appropriate MDX file in the correct directory with proper frontmatter:

### Case Study Frontmatter
```yaml
---
title: "Case Study Title"
industry: "Industry Name"
problem: "Brief problem description"
result: "Brief result description"
skills: ["skill1", "skill2"]
metrics: ["metric1", "metric2"]
---
```

### Capability Frontmatter
```yaml
---
title: "Capability Title"
philosophy: "Brief philosophy statement"
kpis: [
  { name: "KPI Name", value: "Value", unit: "Unit" }
]
industries: ["industry1", "industry2"]
---
```

### Learning Log Frontmatter
```yaml
---
title: "Learning Log Title"
date: "YYYY-MM-DD"
tags: ["tag1", "tag2"]
excerpt: "Brief excerpt"
---
```

### Project Frontmatter
```yaml
---
title: "Project Title"
status: "active|completed|on-hold"
technologies: ["tech1", "tech2"]
tags: ["tag1", "tag2"]
---
```

### Resource Frontmatter
```yaml
---
title: "Resource Title"
type: "playbook|template|guide"
audience: "target audience"
gated: false
---
```

## Step 5: Write Content

Write the content following the tone guidelines from AGENTS.md:
- Professional, confident, evidence-based tone
- Avoid negative framing ("mess", "broken", "chaos")
- Use "initial state", "operational context", "friction points"
- For case studies: structure as "Initial State" → "What I Delivered" → "Outcome"
- No placeholder text – final copy only
- Metrics from `/data/metrics.json` – never hardcoded

## Step 6: Human Review and Commit (AI Best Practice: Commit Often)

Before proceeding to validation, review the content and commit as a safety checkpoint.

### Review Checklist
- [ ] Content matches the spec requirements
- [ ] Tone guidelines followed (no negative framing)
- [ ] Metrics referenced from `/data/metrics.json` (not hardcoded)
- [ ] Frontmatter matches schema in `src/content.config.ts`
- [ ] Structure follows the approved spec
- [ ] No placeholder text

### Commit the Work
```bash
git add src/content/[type]/[filename].mdx
git commit -m "feat: add [content-type] - [title]

- Created spec: spec-[content-type].md
- Created impact map: impact-[content-type].md
- Added content following approved spec
- Ready for validation and testing"
```

**Why this matters**: Frequent commits act as save points. If validation fails or issues arise, you can easily revert to this checkpoint without losing work. This follows Addy Osmani's "commit often and use version control as a safety net" principle.

## Step 7: Pre-Commit Quality Automation (Husky & lint-staged)

For automated quality checks before commits, consider integrating **Husky** and **lint-staged**. This runs linting, formatting, and type checking on staged files before a commit is finalized.

### Installation

```bash
npm install --save-dev husky lint-staged
npx husky init
```

### Configuration

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,astro}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

### Benefits

- **Automated quality**: Catches lint errors and formatting issues before commit
- **Fast**: Only runs on staged files, not the entire codebase
- **Consistent**: Ensures all committed code meets quality standards
- **Prevents CI failures**: Reduces failed builds due to linting issues

### Optional: Add Type Check to Pre-Commit

```json
{
  "lint-staged": {
    "*.{ts,tsx,astro}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "pre-commit": "npm run check && npm run lint"
  }
}
```

Update `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run pre-commit
```

**Note**: This is optional but recommended for teams to maintain code quality standards.

## Step 8: Validate Schema

Run `npm run check` to validate the Zod schema in `src/content.config.ts`:

```bash
npm run check
```

// turbo

## Step 9: Generate Tests

Create appropriate tests for the new content:
- Unit tests for data validation
- Component tests if new components are created
- E2E tests for page functionality

## Step 10: Run Full Test Suite

Run the full test suite to ensure no regressions:
```bash
npm run test:full
```

## Step 11: Accessibility Check

Run accessibility tests to ensure WCAG 2.2 AA compliance:

```bash
npm run test:a11y
```

## Step 12: Build Verification

Build the site to verify the new content renders correctly:
```bash
npm run build
npm run preview
```

## Notes

- Images should be placed in `/src/assets/` and use the `OptimizedImage` component
- For LCP images (headshot), use `loading="eager"` and `fetchpriority="high"`
- Do NOT use `<style>` tags in components imported into MDX (Astro 6 bug)
- Use Tailwind utility classes only for styling
- Ensure all metrics reference `/data/metrics.json`

## Error Handling

If a step fails:
1. Check the Zod schema error message for specific validation issues
2. Verify frontmatter fields match the schema in `src/content.config.ts`
3. Run `npm run check` for detailed type errors
4. Ensure file is saved in the correct directory
5. Check that required fields are not empty
6. For build errors, verify content structure matches examples
7. Review AGENTS.md for tone and content guidelines
