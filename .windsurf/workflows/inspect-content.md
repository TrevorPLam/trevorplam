---
description: Inspect content for issues including broken links, missing alt text, invalid frontmatter, orphaned files, and data inconsistencies
---

# Content Inspection Workflow

This workflow guides the AI agent through comprehensive content inspection to identify broken links, missing alt text, invalid frontmatter, orphaned files, and data inconsistencies.

## Prerequisites

- Node.js >=22.12.0 installed
- npm dependencies installed
- Understanding of content collection schemas and validation

## Step 1: Repository Impact Mapping

Before inspecting, analyze the content structure and identify focus areas:

### Impact Map Structure
```markdown
# Repository Impact Map: Content Inspection

## Content Collections
- src/content/cases/ (case studies)
- src/content/capabilities/ (capabilities)
- src/content/learning-logs/ (learning logs)
- src/content/projects/ (projects)
- src/content/resources/ (resources)
- src/content/skills/ (skills JSON)

## Data Sources
- data/metrics.json (metrics data)
- data/skills.json (skills data)
- data/timeline.json (timeline data)

## Content References
- Internal links between content
- External links to resources
- Image references
- Metric references
```

## Step 2: Content Schema Validation

Validate all content against Zod schemas:

### Run Astro Check
```bash
npm run check
```

// turbo

### Issues to Flag
- Content failing schema validation
- Missing required fields
- Invalid enum values
- Type mismatches
- Invalid date formats

### Check Each Collection
- caseStudies: title, industry, problem, result, skills, lastUpdated
- capabilities: title, slug, philosophy, kpis, industries, lastUpdated
- learningLogs: title, date, lastUpdated, tags, excerpt
- projects: title, slug, description, status, technologies, lastUpdated
- resources: title, slug, type, description, audience, lastUpdated
- skills: category, skills array

## Step 3: Broken Link Detection

Check for broken internal and external links:

### Internal Link Check
```bash
# Search for internal links
grep -rn "\[" src/content/ | grep -E "\]\(|src/"
```

### Issues to Flag
- Links to non-existent pages
- Links to deleted content
- Incorrect slug references
- Case sensitivity issues in URLs
- Missing trailing slashes where required

### External Link Check
- Test all external links
- Flag broken or redirected links
- Check for HTTP links (should be HTTPS)
- Verify link relevance

## Step 4: Image Reference Check

Verify all image references are valid:

### Check Image References
```bash
# Search for image references in content
grep -rn "!\[" src/content/
```

### Issues to Flag
- Images in /public/ instead of /src/assets/
- Missing image files
- Incorrect image paths
- Images without alt text
- Large images not optimized

### Check Image Locations
- All images should be in /src/assets/
- Verify OptimizedImage component usage
- Check for duplicate images

## Step 5: Metric Reference Check

Verify metric references are valid:

### Check Metric References
```bash
# Search for metric references in content
grep -rn "metric" src/content/
```

### Issues to Flag
- References to non-existent metrics
- Metrics not in /data/metrics.json
- Hardcoded metric values (should reference data file)
- Inconsistent metric formatting

### Verify data/metrics.json
- All metrics referenced in content exist
- Metric values are up to date
- No duplicate metric IDs

## Step 6: Orphaned Content Detection

Identify orphaned or unreferenced content:

### Check for Orphaned Files
```bash
# List all content files
find src/content -type f

# Check if each file is referenced
```

### Issues to Flag
- Content files not referenced anywhere
- Case studies not linked from capabilities
- Resources not linked from relevant pages
- Projects not displayed anywhere
- Learning logs not in archive

### Check Navigation
- Verify all cases are accessible
- Verify all capabilities are accessible
- Verify all resources are accessible
- Verify all projects are accessible

## Step 7: Content Consistency Check

Verify consistency across content:

### Issues to Flag
- Inconsistent date formats
- Inconsistent capitalization
- Inconsistent terminology
- Duplicate content
- Outdated content (old lastUpdated dates)

### Check Last Updated Dates
- Verify lastUpdated dates are recent
- Flag content not updated in >6 months
- Check for future dates

## Step 8: Frontmatter Completeness

Verify all frontmatter is complete and valid:

### Check Each Content Type
```markdown
# Case Studies Required Fields
- title: string
- industry: enum (QSR, Salon, CPA-Payroll)
- problem: string
- result: string
- skills: array of strings
- lastUpdated: date
- relatedCases: array of strings (optional)
- metrics: array (optional)

# Capabilities Required Fields
- title: string
- slug: string
- philosophy: string
- kpis: array
- industries: array
- relatedCases: array
- lastUpdated: date

# Learning Logs Required Fields
- title: string
- date: date
- lastUpdated: date
- tags: enum array
- excerpt: string

# Projects Required Fields
- title: string
- slug: string
- description: string
- status: enum
- startDate: date
- endDate: date (optional)
- technologies: array
- tags: array
- lastUpdated: date

# Resources Required Fields
- title: string
- slug: string
- type: enum
- description: string
- audience: string
- downloadUrl: string (optional)
- gated: boolean
- lastUpdated: date
```

### Issues to Flag
- Missing required fields
- Invalid enum values
- Wrong data types
- Empty required fields
- Malformed YAML

## Step 9: Data File Validation

Validate data files:

### Check data/metrics.json
- Valid JSON structure
- No duplicate metric IDs
- All metrics have required fields
- Metric values are reasonable

### Check data/skills.json
- Valid JSON structure
- No duplicate skill names
- All skills have required fields
- Proficiency levels are valid

### Check data/timeline.json
- Valid JSON structure
- No duplicate entries
- All entries have required fields
- Dates are in correct format

## Step 10: Content Quality Check

Assess content quality:

### Issues to Flag
- Placeholder text (TODO, FIXME, etc.)
- Grammar and spelling errors
- Inconsistent tone
- Negative framing (use "initial state" not "mess")
- Missing context or explanations
- Content too brief or too verbose

### Check Against Guidelines
- Professional, confident, evidence-based tone
- Avoid negative framing
- Use "initial state", "operational context", "friction points"
- For case studies: "Initial State" → "What I Delivered" → "Outcome"
- No placeholder text

## Step 11: SEO Check

Verify SEO optimization:

### Issues to Flag
- Missing meta descriptions
- Missing titles
- Duplicate titles
- Missing canonical URLs
- Missing Open Graph tags
- Missing structured data

### Check Pages
- All pages have unique titles
- All pages have meta descriptions
- All pages have proper headings (h1, h2, etc.)
- All pages have structured data (JSON-LD)

## Step 12: Generate Content Report

Compile all findings into a comprehensive content report:

### Report Structure
```markdown
# Content Inspection Report

## Critical Issues
- Schema violations: [list with details]
- Broken links: [list]

## High Priority Issues
- Orphaned content: [list]
- Missing frontmatter: [list]

## Medium Priority Issues
- Content quality: [list]
- Data inconsistencies: [list]

## Low Priority Issues
- Minor improvements: [list]

## Content Statistics
- Total content files: [number]
- Files with issues: [number]
- Broken links: [number]
- Orphaned files: [number]

## Recommendations
1. [Priority recommendation 1]
2. [Priority recommendation 2]
3. [Other recommendations]
```

## Notes

- Content must validate against Zod schemas in src/content.config.ts
- All metrics must reference /data/metrics.json (never hardcoded)
- Images must be in /src/assets/ for optimization
- Check for orphaned content that's not referenced anywhere
- Review AGENTS.md for content guidelines
- Review content-data-handling.md memory for detailed requirements

## Error Handling

If inspection fails:
1. Review the specific error message
2. Check that content files are valid MDX/JSON
3. Verify schema configuration
4. Run individual checks to isolate the issue
5. Review AGENTS.md for content standards
