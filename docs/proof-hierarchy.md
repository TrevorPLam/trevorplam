# Proof Hierarchy

This document defines the hierarchy of evidence presented on trevor-lam.com, distinguishing primary proof from supporting and secondary evidence.

## Primary Proof

Primary proof is the strongest evidence of operational expertise. It is quantified, verifiable, and directly tied to specific case studies.

### Case Studies

**Definition:** Detailed narratives of operational transformations with quantified before/after metrics.

**Current case studies (3):**
- **Sonic Drive-in (QSR):** $1.4M → $1.7M revenue, food cost 2.7% → 0.75%, turnover 175%+ → <80%
- **KLW Salon Group (Salon):** 280-315+ payroll accounts, 3 entities, 60 days to promotion
- **GrandLux CPA (CPA-Payroll):** Zero cash discrepancies, proactive reputation management

**Why primary:**
- Specific, named companies with verifiable contexts
- Quantified before/after metrics
- Direct attribution to Trevor's actions
- "Initial State → What I Delivered → Outcome" structure shows causation

**Presentation:**
- Dedicated pages at `/cases/[slug]`
- PDF downloads for offline review
- Linked from homepage metrics grid
- Cross-referenced from capabilities

### Quantified Metrics

**Definition:** Numerical achievements that demonstrate impact across dimensions of operational excellence.

**Current metrics (9 in `/data/metrics.json`):**
- Fast promotion (Entry → Executive Assistant in 60 days)
- Revenue growth ($1.4M → $1.7M)
- Food cost variance (2.7% → 0.75%)
- Turnover reduction (175%+ → <80%)
- Labor cost variance (3.9% → -0.25%)
- Promotion velocity (Entry → Integrator in 18 months)
- Client scale (280-315+ accounts)
- Cash reconciliation accuracy (Zero discrepancies)
- Reputation management (Reactive → Proactive)

**Why primary:**
- All metrics are quantified (numbers, percentages, timeframes)
- Each metric is linked to a specific case study via `caseStudySlug`
- Metrics are never hardcoded (single source of truth in `/data/metrics.json`)
- Metrics demonstrate P&L responsibility and operational control

**Presentation:**
- Homepage metrics grid (above the fold)
- Individual MetricCard components with trend indicators
- Inline metrics in case studies and capabilities
- Reused across site for consistency

**Metrics-to-case-study linkage:**
```json
{
  "id": "sonic-revenue-growth",
  "title": "Annual Revenue Growth",
  "before": "$1.4M",
  "after": "$1.7M",
  "context": "Unit facing potential closure turned top 10% performer",
  "skillTag": "P&L Management",
  "caseStudySlug": "sonic"
}
```

## Supporting Evidence

Supporting evidence provides context, methodology, and scope for primary proof. It is not quantified but demonstrates expertise breadth.

### Capabilities

**Definition:** Functional areas of expertise with philosophy statements and KPIs.

**Current capabilities (5):**
- Operations & Supply Chain
- People, HR & Compliance
- Financial Control & P&L
- Customer & Growth
- Systems & Tooling

**Why supporting:**
- Demonstrates breadth of expertise beyond specific case studies
- KPIs show operational philosophy and approach
- Related case studies provide proof points
- No direct quantification (qualitative philosophy statements)

**Presentation:**
- Overview page at `/capabilities`
- Individual capability pages at `/capabilities/[slug]`
- KPI cards with context (not quantified before/after)
- Cross-references to relevant case studies

### Timeline

**Definition:** Career progression showing role evolution and responsibility growth.

**Current timeline (11 entries in `/data/timeline.json`):**
- Entry-level roles to executive positions
- Industry transitions (QSR → Salon → CPA-Payroll)
- Responsibility expansion (individual contributor → leadership)

**Why supporting:**
- Shows career trajectory and advancement velocity
- Provides context for case study chronology
- Demonstrates adaptability across industries
- No direct quantification of impact

**Presentation:**
- Interactive Timeline component on about page
- Chronological progression with role descriptions
- Visual representation of career growth

## Secondary Evidence

Secondary evidence demonstrates thought leadership, ongoing learning, and practical tools. It is valuable but not proof of operational impact.

### Learning Logs

**Definition:** Methodology insights, reflections, and knowledge sharing.

**Current learning logs (6):**
- AI operations insights
- Financial controls automation
- Leadership communication framework
- QSR turnaround strategy
- QSR turnover strategy

**Why secondary:**
- Shows methodology and thinking process
- Demonstrates continuous learning
- No quantified impact or specific case attribution
- Theoretical rather than proven

**Presentation:**
- Lab section at `/lab/learning-log`
- Individual entries at `/lab/learning-log/[slug]`
- Tag-based categorization
- Chronological ordering by date

### Projects

**Definition:** Experimental work, tools, and systems in development.

**Current projects (3):**
- Employee feedback dashboard
- Inventory optimization system
- Operations dashboard

**Why secondary:**
- Shows technical capability and systems thinking
- Demonstrates proactive problem-solving
- Status may be "active" or "paused" (not completed)
- No proven impact in production environment

**Presentation:**
- Lab section at `/lab/projects`
- Individual projects at `/lab/projects/[slug]`
- Status indicators (active, completed, paused)
- Technology stack documentation

### Resources (Playbooks, Templates, Guides)

**Definition:** Practical tools and frameworks for immediate application.

**Current resources (8):**
- Financial controls playbook
- Budget tracking template
- KPI dashboard template
- Meeting agenda template
- Process documentation template
- Process optimization playbook
- Project charter template
- Team scaling playbook

**Why secondary:**
- Demonstrates ability to codify methodology
- Provides value to visitors (practical application)
- Shows systems thinking and documentation skills
- Not proof of personal impact (tools can be used by anyone)

**Presentation:**
- Resources section at `/resources`
- Categorized by type (playbooks, templates, guides)
- Download links for offline use
- Skills matrix for capability visualization

### Skills Data

**Definition:** Categorized skill inventory with proficiency levels.

**Current skills (4 categories in `/src/content/skills/`):**
- Operations
- HR & Payroll
- Financial
- Technical
- Credentials

**Why secondary:**
- Self-assessed proficiency levels
- No external verification
- Demonstrates scope but not depth of impact
- Supporting context for capabilities

**Presentation:**
- Skills matrix at `/resources/skills-matrix`
- Interactive proficiency table
- Category-based organization
- Years of experience and certifications

## Hierarchy Application

### Above the Fold (Primary Proof)

**Homepage:**
- Metrics grid (9 quantified achievements) - PRIMARY
- Positioning statement ("Operations Integrator · Forensic Stabilizer")
- Quick actions to case studies

**Rationale:** First impression must establish credibility through quantified proof.

### Primary Navigation (Primary + Supporting)

**Navigation structure:**
- Dashboard (metrics grid) - PRIMARY
- About (timeline) - SUPPORTING
- Capabilities (KPIs, philosophy) - SUPPORTING
- Case Studies (narratives, metrics) - PRIMARY
- Lab (learning logs, projects) - SECONDARY
- Resources (playbooks, templates) - SECONDARY
- Search (all content) - MIXED
- Archive (chronological) - MIXED

**Rationale:** Primary proof gets top-level navigation; supporting evidence provides context; secondary evidence is grouped in Lab/Resources.

### Content Cross-References

**Case study pages:**
- Link to related capabilities (SUPPORTING)
- Link to relevant resources (SECONDARY)
- Link to related learning logs (SECONDARY)

**Capability pages:**
- Link to related case studies (PRIMARY)
- Link to relevant metrics (PRIMARY)
- Link to resources for application (SECONDARY)

**Rationale:** Primary proof anchors supporting and secondary evidence. Never present secondary evidence without primary proof context.

## Proof Quality Standards

### Primary Proof Requirements

**Quantification:**
- Must include before/after metrics
- Metrics must be specific (numbers, percentages, timeframes)
- Metrics must be verifiable (not "significant improvement")

**Attribution:**
- Must clearly state Trevor's role and actions
- Must show causation (not just correlation)
- Must avoid "we" language (use "I" for personal attribution)

**Context:**
- Must include industry, company size, operational context
- Must explain initial state (baseline)
- Must show what was delivered (actions taken)

### Supporting Evidence Requirements

**Specificity:**
- Must be tied to functional areas (not generic "leadership")
- Must include philosophy or approach
- Must reference primary proof where applicable

**Relevance:**
- Must align with current role and expertise
- Must be current (not outdated skills)
- Must demonstrate breadth without exaggeration

### Secondary Evidence Requirements

**Value:**
- Must provide practical value to visitors
- Must demonstrate thought leadership or learning
- Must be actionable (not theoretical only)

**Transparency:**
- Must clearly indicate status (for projects)
- Must distinguish between proven and experimental
- Must avoid overstating impact

## Anti-Patterns to Avoid

### Primary Proof Anti-Patterns

- **Vague metrics:** "Improved revenue" instead of "$1.4M → $1.7M"
- **Missing attribution:** "The team achieved" instead of "I delivered"
- **No context:** Case study without industry or company size
- **Correlation without causation:** "Revenue increased during my tenure" without showing actions

### Supporting Evidence Anti-Patterns

- **Generic claims:** "Strong leadership skills" without specific examples
- **Outdated information:** Capabilities no longer relevant to current role
- **Overstating scope:** Claiming expertise without primary proof

### Secondary Evidence Anti-Patterns

- **Theory without practice:** Learning logs without application context
- **Incomplete projects:** Projects without clear status or outcomes
- **Overpromising:** Resources that don't deliver promised value

## Proof Maintenance

### Regular Review

**Quarterly:**
- Verify all metrics remain accurate
- Update case studies with new quantified achievements
- Check capabilities align with current role

**Biannually:**
- Review learning logs for continued relevance
- Update project statuses
- Refresh resources based on usage and feedback

### Proof Expansion

**When adding new primary proof:**
- Add new case study with quantified metrics
- Update metrics.json with new achievements
- Cross-reference from relevant capabilities
- Consider archiving oldest case study if >5 total

**When adding new supporting evidence:**
- Add new capability if functional area expands
- Update timeline with new role
- Refresh capability KPIs with new experience

**When adding new secondary evidence:**
- Add learning log for new methodology insights
- Document new projects as they're initiated
- Create resources for codified processes

## Proof Presentation Guidelines

### Visual Hierarchy

**Size and placement:**
- Primary proof: Large, prominent, above the fold
- Supporting evidence: Medium, contextual, secondary navigation
- Secondary evidence: Smaller, grouped, tertiary navigation

**Color and emphasis:**
- Primary proof: Strong contrast, bold text
- Supporting evidence: Medium contrast, regular text
- Secondary evidence: Lower contrast, lighter text

### Linking Strategy

**Internal links:**
- Always link secondary evidence to primary proof
- Never present secondary evidence in isolation
- Use descriptive link text (not "click here")

**External links:**
- LinkedIn: Supporting evidence (professional network)
- Resume: Supporting evidence (traditional credentials)
- PDF downloads: Primary proof (offline review)
