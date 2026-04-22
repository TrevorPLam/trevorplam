import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import type { CollectionEntry } from 'astro:content';

// Content schemas based on src/content.config.ts
const CaseStudySchema = z.object({
  id: z.string(),
  slug: z.string(),
  data: z.object({
    title: z.string(),
    industry: z.enum(['QSR', 'Salon', 'CPA-Payroll']),
    problem: z.string(),
    result: z.string(),
    skills: z.array(z.string()),
    metric: z.string().optional()
  })
});

const MetricsSchema = z.object({
  careerMetrics: z.array(z.object({
    value: z.string(),
    label: z.string(),
    description: z.string()
  })),
  impactMetrics: z.array(z.object({
    value: z.string(),
    label: z.string(),
    description: z.string()
  })),
  skillMetrics: z.array(z.object({
    category: z.string(),
    items: z.array(z.string())
  }))
});

const TimelineSchema = z.array(z.object({
  year: z.string(),
  title: z.string(),
  organization: z.string(),
  description: z.string(),
  type: z.enum(['work', 'education', 'achievement'])
}));

const SkillsSchema = z.object({
  technical: z.array(z.object({
    name: z.string(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    category: z.string()
  })),
  strategic: z.array(z.object({
    name: z.string(),
    level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
    category: z.string()
  })),
  industry: z.array(z.object({
    name: z.string(),
    experience: z.string(),
    description: z.string()
  }))
});

describe('Content Schema Contract Tests', () => {
  describe('Case Studies Content Contract', () => {
    it('validates case study schema contract', () => {
      const validCaseStudy = {
        id: 'grandlux',
        slug: 'grandlux',
        data: {
          title: 'Grandlux QSR Digital Transformation',
          industry: 'QSR' as const,
          problem: 'Grandlux needed to modernize their digital ordering system',
          result: 'Increased online orders by 45% and reduced wait times',
          skills: ['Digital Strategy'],
          metric: '45% increase in online orders'
        }
      };

      const result = CaseStudySchema.safeParse(validCaseStudy);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.data.industry).toBe('QSR');
        expect(result.data.data.skills).toContain('Digital Strategy');
      }
    });

    it('rejects invalid case study schema', () => {
      const invalidCaseStudy = {
        id: 'grandlux',
        slug: 'grandlux',
        data: {
          title: 'Grandlux QSR Digital Transformation',
          industry: 'INVALID_INDUSTRY', // Invalid industry
          problem: 'Grandlux needed to modernize their digital ordering system',
          result: 'Increased online orders by 45% and reduced wait times',
          skills: ['Digital Strategy'],
          metric: '45% increase in online orders'
        }
      };

      const result = CaseStudySchema.safeParse(invalidCaseStudy);
      expect(result.success).toBe(false);
    });

    it('validates case study array contract', () => {
      const caseStudies = [
        {
          id: 'grandlux',
          slug: 'grandlux',
          data: {
            title: 'Grandlux QSR Digital Transformation',
            industry: 'QSR' as const,
            problem: 'Grandlux needed to modernize their digital ordering system',
            result: 'Increased online orders by 45% and reduced wait times',
            skills: ['Digital Strategy'],
            metric: '45% increase in online orders'
          }
        },
        {
          id: 'klw',
          slug: 'klw',
          data: {
            title: 'KLW Salon Marketing Automation',
            industry: 'Salon' as const,
            problem: 'KLW struggled with inconsistent marketing',
            result: 'Implemented automated marketing system',
            skills: ['Marketing Automation'],
            metric: '30% increase in client retention'
          }
        }
      ];

      const results = caseStudies.map(study => CaseStudySchema.safeParse(study));
      expect(results.every(result => result.success)).toBe(true);
    });
  });

  describe('Metrics Content Contract', () => {
    it('validates metrics schema contract', () => {
      const validMetrics = {
        careerMetrics: [
          {
            value: '15+',
            label: 'Years Experience',
            description: 'Senior leadership experience'
          }
        ],
        impactMetrics: [
          {
            value: '45%',
            label: 'Average Growth',
            description: 'Client business growth'
          }
        ],
        skillMetrics: [
          {
            category: 'Strategy',
            items: ['Digital Transformation']
          }
        ]
      };

      const result = MetricsSchema.safeParse(validMetrics);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.careerMetrics[0].value).toBe('15+');
        expect(result.data.impactMetrics[0].label).toBe('Average Growth');
        expect(result.data.skillMetrics[0].category).toBe('Strategy');
      }
    });

    it('rejects invalid metrics schema', () => {
      const invalidMetrics = {
        careerMetrics: [
          {
            value: '15+',
            label: 'Years Experience',
            description: 'Senior leadership experience'
          }
        ],
        impactMetrics: [
          {
            value: '45%',
            label: 'Average Growth',
            description: 'Client business growth'
          }
        ],
        skillMetrics: [
          {
            category: 'Strategy',
            items: 'NOT_AN_ARRAY' // Invalid: should be array
          }
        ]
      };

      const result = MetricsSchema.safeParse(invalidMetrics);
      expect(result.success).toBe(false);
    });
  });

  describe('Timeline Content Contract', () => {
    it('validates timeline schema contract', () => {
      const validTimeline = [
        {
          year: '2024',
          title: 'Chief of Staff',
          organization: 'Tech Corp',
          description: 'Leading strategic initiatives',
          type: 'work' as const
        },
        {
          year: '2020',
          title: 'MBA',
          organization: 'Business School',
          description: 'Completed MBA program',
          type: 'education' as const
        }
      ];

      const result = TimelineSchema.safeParse(validTimeline);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data[0].type).toBe('work');
        expect(result.data[1].type).toBe('education');
      }
    });

    it('rejects invalid timeline schema', () => {
      const invalidTimeline = [
        {
          year: '2024',
          title: 'Chief of Staff',
          organization: 'Tech Corp',
          description: 'Leading strategic initiatives',
          type: 'INVALID_TYPE' as any // Invalid type
        }
      ];

      const result = TimelineSchema.safeParse(invalidTimeline);
      expect(result.success).toBe(false);
    });
  });

  describe('Skills Content Contract', () => {
    it('validates skills schema contract', () => {
      const validSkills = {
        technical: [
          {
            name: 'TypeScript',
            level: 'Advanced' as const,
            category: 'Programming'
          }
        ],
        strategic: [
          {
            name: 'Digital Strategy',
            level: 'Expert' as const,
            category: 'Leadership'
          }
        ],
        industry: [
          {
            name: 'QSR',
            experience: '5+ years',
            description: 'Quick Service Restaurant expertise'
          }
        ]
      };

      const result = SkillsSchema.safeParse(validSkills);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.technical[0].level).toBe('Advanced');
        expect(result.data.strategic[0].level).toBe('Expert');
        expect(result.data.industry[0].name).toBe('QSR');
      }
    });

    it('rejects invalid skills schema', () => {
      const invalidSkills = {
        technical: [
          {
            name: 'TypeScript',
            level: 'INVALID_LEVEL' as any, // Invalid level
            category: 'Programming'
          }
        ],
        strategic: [
          {
            name: 'Digital Strategy',
            level: 'Expert' as const,
            category: 'Leadership'
          }
        ],
        industry: [
          {
            name: 'QSR',
            experience: '5+ years',
            description: 'Quick Service Restaurant expertise'
          }
        ]
      };

      const result = SkillsSchema.safeParse(invalidSkills);
      expect(result.success).toBe(false);
    });
  });

  describe('Content Contract Integration', () => {
    it('validates complete content contract', () => {
      // Simulate complete content structure
      const completeContent = {
        caseStudies: [
          {
            id: 'grandlux',
            slug: 'grandlux',
            data: {
              title: 'Grandlux QSR Digital Transformation',
              industry: 'QSR' as const,
              problem: 'Grandlux needed to modernize their digital ordering system',
              result: 'Increased online orders by 45% and reduced wait times',
              skills: ['Digital Strategy'],
              metric: '45% increase in online orders'
            }
          }
        ],
        metrics: {
          careerMetrics: [
            {
              value: '15+',
              label: 'Years Experience',
              description: 'Senior leadership experience'
            }
          ],
          impactMetrics: [
            {
              value: '45%',
              label: 'Average Growth',
              description: 'Client business growth'
            }
          ],
          skillMetrics: [
            {
              category: 'Strategy',
              items: ['Digital Transformation']
            }
          ]
        },
        timeline: [
          {
            year: '2024',
            title: 'Chief of Staff',
            organization: 'Tech Corp',
            description: 'Leading strategic initiatives',
            type: 'work' as const
          }
        ],
        skills: {
          technical: [
            {
              name: 'TypeScript',
              level: 'Advanced' as const,
              category: 'Programming'
            }
          ],
          strategic: [
            {
              name: 'Digital Strategy',
              level: 'Expert' as const,
              category: 'Leadership'
            }
          ],
          industry: [
            {
              name: 'QSR',
              experience: '5+ years',
              description: 'Quick Service Restaurant expertise'
            }
          ]
        }
      };

      // Validate each content type
      const caseStudyResults = completeContent.caseStudies.map(study => 
        CaseStudySchema.safeParse(study)
      );
      const metricsResult = MetricsSchema.safeParse(completeContent.metrics);
      const timelineResult = TimelineSchema.safeParse(completeContent.timeline);
      const skillsResult = SkillsSchema.safeParse(completeContent.skills);

      expect(caseStudyResults.every(result => result.success)).toBe(true);
      expect(metricsResult.success).toBe(true);
      expect(timelineResult.success).toBe(true);
      expect(skillsResult.success).toBe(true);
    });
  });
});
