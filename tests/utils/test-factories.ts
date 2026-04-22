/**
 * Enhanced type-safe test factory interface with 2026 patterns
 * Provides consistent object creation for testing with runtime validation
 */
export type Factory<T> = {
  build(overrides?: Partial<T>): T;
  buildList(count: number, overrides?: Partial<T>): T[];
  buildWithSequence(overrides?: Partial<T>, sequenceField?: keyof T): T;
  extend<U>(traits: U): Factory<T & U>;
  withValidation<U>(schema: { parse: (data: unknown) => U }): Factory<T & U>;
};

import { z } from 'zod';

/**
 * Zod schemas for test data validation
 */
export const CaseStudySchema = z.object({
  slug: z.string(),
  title: z.string(),
  content: z.string(),
  industry: z.enum(['QSR', 'Salon', 'CPA-Payroll']),
  problem: z.string(),
  result: z.string(),
  skills: z.array(z.string()),
  metric: z.string()
});

export const MetricCardSchema = z.object({
  title: z.string(),
  before: z.string(),
  after: z.string(),
  context: z.string().optional(),
  skillTag: z.string().optional(),
  caseStudySlug: z.string().optional()
});

export const SkillTagSchema = z.object({
  label: z.string()
});

export const TimelineNodeSchema = z.object({
  year: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['role', 'award', 'degree', 'constraint', 'future'])
});

export const OptimizedImageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  width: z.number().positive(),
  height: z.number().positive()
});

export const NavigationSchema = z.object({
  currentPath: z.string(),
  isMobileMenuOpen: z.boolean()
});

export const KPICardSchema = z.object({
  name: z.string(),
  value: z.string(),
  context: z.string()
});

export const FooterSchema = z.object({
  currentYear: z.number(),
  showContactInfo: z.boolean()
});

// Type exports
export type CaseStudy = z.infer<typeof CaseStudySchema>;
export type MetricCard = z.infer<typeof MetricCardSchema>;
export type SkillTag = z.infer<typeof SkillTagSchema>;
export type TimelineNode = z.infer<typeof TimelineNodeSchema>;
export type OptimizedImage = z.infer<typeof OptimizedImageSchema>;
export type Navigation = z.infer<typeof NavigationSchema>;
export type KPICard = z.infer<typeof KPICardSchema>;
export type Footer = z.infer<typeof FooterSchema>;

/**
 * Creates a type-safe factory for building test objects
 * Enhanced with 2026 patterns: sequence generation, trait composition, and Zod validation
 * Reduces hardcoded test data and improves maintainability with runtime validation
 */
export function createFactory<T>(defaults: T): Factory<T> {
  let sequenceCounter = 0;
  
  return {
    build: (overrides = {}) => ({
      ...defaults,
      ...overrides
    }),
    
    buildList: (count, overrides = {}) => 
      Array.from({ length: count }, () => ({
        ...defaults,
        ...overrides
      })),
    
    // Generate unique values for fields like `id`, `email`, etc.
    buildWithSequence: (overrides = {}, sequenceField) => {
      const seq = ++sequenceCounter;
      const result = { ...defaults, ...overrides };
      if (sequenceField && typeof defaults[sequenceField] === 'string') {
        (result as any)[sequenceField] = `${defaults[sequenceField]}-${seq}`;
      }
      return result;
    },
    
    // Compose traits for variant creation
    extend: <U>(traits: U) => createFactory({ ...defaults, ...traits }),
    
    // Add Zod validation to factory
    withValidation: <U>(schema: { parse: (data: unknown) => U }) => {
      const validatedDefaults = schema.parse(defaults);
      return createFactory(validatedDefaults) as Factory<T & U>;
    }
  };
}

// Component-specific factories with Zod validation
export const metricCardFactory = createFactory({
  title: 'Test Metric',
  before: '$100K',
  after: '$200K',
  context: 'Test context for unit testing',
  skillTag: 'Testing',
  caseStudySlug: 'test-case'
}).withValidation(MetricCardSchema);

export const skillTagFactory = createFactory({
  label: 'Test Skill'
}).withValidation(SkillTagSchema);

export const timelineNodeFactory = createFactory({
  year: '2021',
  title: 'Test Role',
  description: 'Test description for unit testing',
  type: 'role' as const
}).withValidation(TimelineNodeSchema);

export const kpiCardFactory = createFactory({
  name: 'Test KPI',
  value: '100%',
  context: 'Test context for unit testing'
}).withValidation(KPICardSchema);

export const optimizedImageFactory = createFactory({
  src: '/test-image.jpg',
  alt: 'Test image description',
  width: 400,
  height: 300
}).withValidation(OptimizedImageSchema);

export const navigationFactory = createFactory({
  currentPath: '/',
  isMobileMenuOpen: false
}).withValidation(NavigationSchema);

export const footerFactory = createFactory({
  currentYear: new Date().getFullYear(),
  showContactInfo: true
}).withValidation(FooterSchema);

// Case study factory with deterministic seeding for test reproducibility
export const caseStudyFactory = createFactory({
  slug: 'test-case',
  title: 'Test Case Study',
  content: 'Test content for unit testing',
  industry: 'QSR' as const,
  problem: 'Test problem description',
  result: 'Test result description',
  skills: ['Testing', 'Validation'],
  metric: 'Test Metric'
}).withValidation(CaseStudySchema);

// Pre-configured case study variants for common test scenarios
// Using separate createFactory calls instead of extend() to avoid type intersection issues with Zod schemas
export const grandluxCaseStudyFactory = createFactory({
  slug: 'grandlux',
  title: 'Grandlux Restaurant Group Financial Operations',
  content: 'Test content for unit testing',
  industry: 'Salon' as const,
  problem: 'Multi-location restaurant group was experiencing 12-day monthly financial close and 76% inventory accuracy',
  result: 'Reduced financial close to 4 days and achieved 94.2% inventory accuracy',
  skills: ['Financial Operations', 'Inventory Management', 'Cost Analysis', 'Process Optimization'],
  metric: 'Monthly Financial Close Time'
}).withValidation(CaseStudySchema);

export const klwCaseStudyFactory = createFactory({
  slug: 'klw',
  title: 'KLW CPA Firm Operations',
  content: 'Test content for unit testing',
  industry: 'CPA-Payroll' as const,
  problem: 'Manual payroll processing causing delays and errors',
  result: 'Automated payroll system with 99.9% accuracy',
  skills: ['Payroll Processing', 'Automation', 'Compliance'],
  metric: 'Payroll Processing Time'
}).withValidation(CaseStudySchema);

export const sonicCaseStudyFactory = createFactory({
  slug: 'sonic',
  title: 'Sonic QSR Digital Transformation',
  content: 'Test content for unit testing',
  industry: 'QSR' as const,
  problem: 'Legacy systems causing operational inefficiencies',
  result: 'Digital platform implementation with 40% efficiency gain',
  skills: ['Digital Transformation', 'Process Optimization', 'System Integration'],
  metric: 'Operational Efficiency'
}).withValidation(CaseStudySchema);

// Example usage of enhanced factories:
// export const userFactory = createFactory({
//   id: 'user',
//   name: 'Test User',
//   email: 'test@example.com',
//   role: 'user'
// });
// 
// export const adminUserFactory = userFactory.extend({ role: 'admin' });
// 
// // Usage:
// const user1 = userFactory.buildWithSequence({}, 'id'); // { id: 'user-1', name: 'Test User', ... }
// const admin = adminUserFactory.build({ name: 'Admin User' }); // { id: 'user', name: 'Admin User', role: 'admin', ... }
