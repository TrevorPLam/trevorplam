# Content Governance

This document defines update cadence, versioning, stale content policy, and archive rules for trevor-lam.com content.

## Update Cadence

### Case Studies
- **Review cadence:** Quarterly (every 3 months)
- **Update triggers:**
  - New quantified metrics available
  - Career role change with new case study material
  - Industry relevance shifts (e.g., company acquired, business model change)
- **Maintenance tasks:**
  - Verify all metrics are current
  - Update `lastUpdated` date in frontmatter
  - Check related capabilities links remain accurate
  - Regenerate PDF if content changes significantly

### Capabilities
- **Review cadence:** Biannually (every 6 months)
- **Update triggers:**
  - New skill acquisition or certification
  - Shift in professional focus or role
  - KPI changes based on new experience
- **Maintenance tasks:**
  - Update KPIs with latest achievements
  - Refresh philosophy statement if approach evolves
  - Verify related case studies remain relevant
  - Update `lastUpdated` date in frontmatter

### Learning Logs
- **Review cadence:** Monthly (for relevance), no forced updates
- **Update triggers:**
  - New insights or methodology refinements
  - Correction of outdated information
  - Addition of new tags for better discoverability
- **Maintenance tasks:**
  - Add new entries as insights develop (organic cadence)
  - Update tags to reflect current focus areas
  - Archive entries that no longer represent current thinking
  - Update `lastUpdated` date when content is modified

### Projects
- **Review cadence:** Monthly
- **Update triggers:**
  - Project status changes (active → completed → paused)
  - New technology adoption or stack changes
  - Milestone achievements
- **Maintenance tasks:**
  - Update status and dates in frontmatter
  - Add new technologies as they're adopted
  - Archive completed projects after 6 months
  - Update `lastUpdated` date on any change

### Resources (Playbooks, Templates, Guides)
- **Review cadence:** Quarterly
- **Update triggers:**
  - Process improvements based on real-world application
  - User feedback suggesting improvements
  - Tool or methodology updates
- **Maintenance tasks:**
  - Version templates when significant changes occur
  - Update download URLs if file structure changes
  - Mark deprecated resources with clear notices
  - Update `lastUpdated` date in frontmatter

### Skills Data
- **Review cadence:** Annually
- **Update triggers:**
  - New certifications or credentials
  - Significant experience level changes
  - Skill category reorganization
- **Maintenance tasks:**
  - Update proficiency levels based on recent experience
  - Add new skills as they're developed
  - Remove or archive skills no longer relevant
  - Update `yearsExperience` for active skills

## Versioning Strategy

### Semantic Versioning for Major Content Updates

For significant content restructuring or major overhauls, use semantic versioning in the `lastUpdated` date or a separate `version` field:

- **Major (X.0.0):** Complete rewrite, new structure, fundamental approach change
  - Example: Rewriting a case study with entirely new narrative structure
  - Example: Reorganizing capabilities into different categories

- **Minor (0.X.0):** New sections, new metrics, significant additions
  - Example: Adding a new KPI to a capability page
  - Example: Adding a new case study to the collection

- **Patch (0.0.X):** Typo fixes, minor clarifications, metric updates
  - Example: Correcting a percentage in a metric
  - Example: Fixing broken links or formatting issues

### Frontmatter Version Field

For content requiring explicit version tracking (resources, templates), add a `version` field:

```yaml
---
title: Financial Controls Playbook
slug: financial-controls-playbook
version: 2.1.0
lastUpdated: 2026-04-22
---
```

### Git-Based Versioning

All content changes are tracked through Git:
- Use descriptive commit messages for content updates
- Tag releases for major site overhauls
- Use branches for experimental content changes

## Stale Content Policy

### Stale Content Definition

Content is considered stale when:
- **Case studies:** Metrics or outcomes are no longer accurate (>12 months without update)
- **Capabilities:** KPIs or philosophy no longer represent current approach (>18 months without update)
- **Learning logs:** Insights no longer align with current thinking (>24 months without review)
- **Projects:** Status is "completed" for >6 months without archiving
- **Resources:** Process or methodology has been superseded (>12 months without update)

### Stale Content Actions

**Warning Stage (6 months overdue):**
- Add `stale: true` flag to frontmatter
- Display warning banner on content page
- Add to TODO.md for review priority

**Archive Stage (12 months overdue):**
- Move content to `src/content/archived/` collection
- Add redirect from original URL to archive page
- Remove from navigation and search index
- Keep in Git history for reference

**Delete Stage (24 months overdue):**
- Remove from repository entirely
- Document deletion in changelog
- Consider creating summary document if content was valuable

### Stale Content Detection

Automated checks via CI:
- Scan all content frontmatter for `lastUpdated` dates
- Flag content exceeding stale thresholds
- Create GitHub issue with list of stale content
- Run weekly via scheduled workflow

## Archive Rules

### Archive Criteria

Content should be archived when:
- Project is completed and no longer actively referenced (>6 months)
- Learning log insight is superseded by newer thinking
- Resource is deprecated and replaced by newer version
- Capability or skill is no longer relevant to current role

### Archive Process

1. **Move to archive collection:**
   - Create `src/content/archived/` if it doesn't exist
   - Move MDX/JSON files to archive folder
   - Preserve original frontmatter and structure

2. **Update navigation:**
   - Remove archived content from `src/config/navigation.ts`
   - Add redirect from original URL to archive page (if needed)

3. **Update references:**
   - Search for internal links to archived content
   - Update or remove links from other content
   - Update related content frontmatter fields

4. **Add archive metadata:**
   ```yaml
   ---
   archived: true
   archivedDate: 2026-04-22
   archiveReason: "Superseded by new approach documented in learning-log/new-methodology"
   ---
   ```

5. **Document in changelog:**
   - Add entry to `src/pages/archive.astro` or dedicated changelog
   - Include reason for archival and any replacement content

### Archive Retention

- **Retention period:** Indefinite (keep in Git history)
- **Access:** Archived content remains accessible via direct URL or archive index
- **Restoration:** Content can be restored from Git if needed
- **Cleanup:** Consider deleting after 2 years if no longer relevant

## Content Approval Workflow

### New Content Creation

1. **Draft in feature branch:**
   - Create branch from `main`
   - Draft content with proper frontmatter
   - Follow content collection schema

2. **Self-review:**
   - Verify schema validation passes
   - Check links and references
   - Ensure tone and formatting consistency

3. **Build verification:**
   - Run `npm run build` to ensure no errors
   - Run `npm run lint` for code quality
   - Run `npm run check` for type safety

4. **Merge to main:**
   - Create pull request
   - Review changes
   - Merge after approval

### Content Updates

For minor updates (typos, metric corrections):
- Edit directly on `main` branch
- Run build and lint checks
- Commit with descriptive message

For major updates (new sections, restructuring):
- Follow new content creation workflow
- Use feature branch for safety

## Content Quality Standards

### Tone Guidelines

- **Professional and confident:** Avoid hedging language ("maybe", "might")
- **Evidence-based:** All claims supported by metrics or specific examples
- **Action-oriented:** Focus on what was delivered, not just what was learned
- **No negative framing:** Use "initial state" instead of "mess", "operational context" instead of "chaos"

### Formatting Standards

- **Markdown:** Use GitHub Flavored Markdown
- **Headings:** Use H1 for title, H2 for main sections, H3 for subsections
- **Lists:** Use bullet points for enumerations, numbered lists for sequences
- **Code blocks:** Use language-specific syntax highlighting
- **Links:** Use descriptive link text, not "click here"

### Accessibility Standards

- **Alt text:** All images must have descriptive alt text
- **Headings:** Proper heading hierarchy (no skipped levels)
- **Links:** Descriptive link text that makes sense out of context
- **Color:** Ensure sufficient contrast (4.5:1 minimum)

## Content Ownership and Accountability

### Primary Owner

- **Trevor Lam:** All content creation and updates
- **Decision authority:** Final say on content strategy and changes

### Review Process

- **Self-review:** Primary owner reviews all changes before commit
- **Peer review:** Optional for major content overhauls
- **Automated review:** CI/CD pipeline checks for schema validation, broken links

### Content Inventory

Maintain content inventory in:
- `src/content.config.ts` - Collection schemas and counts
- `README.md` - High-level content overview
- `docs/strategy.md` - Content purpose and audience alignment

## Governance Exceptions

### Emergency Updates

For urgent corrections (factual errors, broken links):
- Skip feature branch workflow
- Edit directly on `main`
- Document reason in commit message
- Create follow-up issue for review

### Experimental Content

For testing new content types or structures:
- Use `draft: true` frontmatter flag
- Exclude from navigation and build
- Review after 30 days for promotion or removal
