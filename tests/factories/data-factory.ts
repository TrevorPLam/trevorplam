/**
 * Mock Data Factories with Realistic Data Generation
 * 
 * Provides comprehensive data generation capabilities using Faker and custom
 * patterns following 2026 enterprise standards for realistic test data.
 */

import { faker } from '@faker-js/faker';
import { z, ZodSchema } from 'zod';
import { randomUUID } from 'crypto';

// Configure faker for deterministic testing
faker.seed(12345);

export interface FactoryConfig {
  locale?: string;
  seed?: number;
  deterministic?: boolean;
  validation?: {
    strict: boolean;
    schema?: ZodSchema;
  };
}

export interface FactoryOptions {
  count?: number;
  overrides?: Record<string, any>;
  relationships?: Record<string, any>;
  context?: Record<string, any>;
}

/**
 * Base factory class for data generation
 */
export abstract class BaseFactory<T> {
  protected config: FactoryConfig;
  protected defaultOptions: FactoryOptions = {};

  constructor(config: FactoryConfig = {}) {
    this.config = {
      locale: 'en',
      deterministic: true,
      validation: { strict: false },
      ...config
    };
    
    if (this.config.seed !== undefined) {
      faker.seed(this.config.seed);
    }
  }

  /**
   * Generate a single entity
   */
  abstract generate(options?: FactoryOptions): T;

  /**
   * Generate multiple entities
   */
  generateMany(count: number, options?: FactoryOptions): T[] {
    return Array.from({ length: count }, () => this.generate(options));
  }

  /**
   * Generate with relationships
   */
  generateWithRelationships(relationships: Record<string, any>, options?: FactoryOptions): T {
    const mergedOptions = {
      ...options,
      relationships: { ...options?.relationships, ...relationships }
    };
    return this.generate(mergedOptions);
  }

  /**
   * Validate generated data
   */
  protected validate(data: T): { valid: boolean; errors: string[] } {
    if (!this.config.validation?.schema) {
      return { valid: true, errors: [] };
    }

    try {
      this.config.validation.schema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        valid: false,
        errors: ['Unknown validation error']
      };
    }
  }

  /**
   * Apply overrides to generated data
   */
  protected applyOverrides(base: T, overrides?: Record<string, any>): T {
    if (!overrides) return base;
    
    return { ...base, ...overrides };
  }

  /**
   * Generate with validation
   */
  generateValidated(options?: FactoryOptions): T {
    const data = this.generate(options);
    const validation = this.validate(data);
    
    if (!validation.valid && this.config.validation?.strict) {
      throw new Error(`Generated data failed validation: ${validation.errors.join(', ')}`);
    }
    
    return data;
  }
}

/**
 * User data factory
 */
export class UserFactory extends BaseFactory<User> {
  private static readonly ROLES = ['admin', 'user', 'moderator', 'guest'];
  private static readonly STATUSES = ['active', 'inactive', 'suspended', 'pending'];

  generate(options?: FactoryOptions): User {
    const base: User = {
      id: randomUUID(),
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      role: faker.helpers.arrayElement(UserFactory.ROLES),
      status: faker.helpers.arrayElement(UserFactory.STATUSES),
      avatar: faker.image.avatar(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      lastLoginAt: faker.date.recent(),
      preferences: {
        theme: faker.helpers.arrayElement(['light', 'dark', 'auto']),
        language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
        notifications: faker.datatype.boolean()
      },
      metadata: {
        ipAddress: faker.internet.ip(),
        userAgent: faker.internet.userAgent(),
        location: {
          country: faker.location.country(),
          city: faker.location.city(),
          timezone: faker.location.timeZone()
        }
      }
    };

    return this.applyOverrides(base, options?.overrides);
  }
}

/**
 * Case study data factory
 */
export class CaseStudyFactory extends BaseFactory<CaseStudy> {
  private static readonly INDUSTRIES = [
    'QSR', 'Salon', 'CPA-Payroll', 'E-commerce', 'Healthcare', 
    'FinTech', 'EdTech', 'RealEstate', 'Logistics', 'Manufacturing'
  ];

  private static readonly SKILLS = [
    'Financial Controls', 'Process Optimization', 'Technology Implementation',
    'Data Analytics', 'Change Management', 'Strategic Planning',
    'Risk Management', 'Compliance', 'Project Management', 'Leadership'
  ];

  generate(options?: FactoryOptions): CaseStudy {
    const industry = faker.helpers.arrayElement(CaseStudyFactory.INDUSTRIES);
    const skills = faker.helpers.arrayElements(CaseStudyFactory.SKILLS, { min: 2, max: 4 });
    
    const base: CaseStudy = {
      id: faker.string.alphanumeric(8).toLowerCase(),
      slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
      data: {
        title: `${faker.company.name()} ${faker.helpers.arrayElement(['Operations', 'Transformation', 'Optimization', 'Modernization'])}`,
        industry,
        client: faker.company.name(),
        duration: `${faker.number.int({ min: 3, max: 24 })} months`,
        teamSize: faker.number.int({ min: 2, max: 15 }),
        problem: faker.helpers.arrayElement([
          'High-volume cash environment requiring precise reconciliation',
          'Complex commission structures with multiple technicians',
          'Inefficient inventory management causing stockouts',
          'Manual data entry errors affecting financial reporting',
          'Poor customer experience due to slow service times'
        ]),
        solution: faker.helpers.arrayElement([
          'Implemented automated reconciliation system',
          'Streamlined commission calculation process',
          'Deployed real-time inventory tracking',
          'Introduced automated data validation',
          'Redesigned customer service workflow'
        ]),
        result: faker.helpers.arrayElement([
          'Zero cash discrepancies and proactive reputation management',
          '45% increase in technician efficiency and accuracy',
          'Real-time inventory tracking with 99% accuracy',
          'Automated reporting reducing errors by 80%',
          'Customer satisfaction scores improved by 35%'
        ]),
        skills,
        metric: faker.helpers.arrayElement([
          'Zero Discrepancies', '45% Efficiency Gain', '99% Accuracy', 
          '80% Error Reduction', '35% CSAT Improvement'
        ]),
        technologies: faker.helpers.arrayElements([
          'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker', 
          'Kubernetes', 'MongoDB', 'Python', 'TypeScript'
        ], { min: 2, max: 5 }),
        testimonial: {
          quote: faker.lorem.sentences(2),
          author: faker.person.fullName(),
          position: faker.person.jobTitle(),
          company: faker.company.name()
        }
      },
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      published: faker.datatype.boolean(),
      featured: faker.datatype.boolean(),
      metadata: {
        readTime: faker.number.int({ min: 3, max: 15 }),
        difficulty: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
        tags: faker.helpers.arrayElements([
          'digital-transformation', 'process-optimization', 'technology',
          'strategy', 'leadership', 'innovation', 'growth'
        ], { min: 2, max: 4 })
      }
    };

    return this.applyOverrides(base, options?.overrides);
  }
}

/**
 * Metrics data factory
 */
export class MetricsFactory extends BaseFactory<Metrics> {
  generate(options?: FactoryOptions): Metrics {
    const base: Metrics = {
      careerMetrics: [
        {
          value: `${faker.number.int({ min: 10, max: 25 })}+`,
          label: 'Years Experience',
          description: faker.helpers.arrayElement([
            'Senior leadership experience',
            'Executive-level expertise',
            'Industry veteran'
          ])
        },
        {
          value: `${faker.number.int({ min: 50, max: 200 })}+`,
          label: 'Projects Led',
          description: faker.helpers.arrayElement([
            'Cross-functional initiatives',
            'Strategic programs',
            'Digital transformations'
          ])
        },
        {
          value: `$${faker.number.int({ min: 1, max: 50 })}M+`,
          label: 'Budget Managed',
          description: faker.helpers.arrayElement([
            'Annual budget responsibility',
            'Portfolio management',
            'Investment oversight'
          ])
        }
      ],
      impactMetrics: [
        {
          value: `${faker.number.int({ min: 20, max: 80 })}%`,
          label: 'Average Growth',
          description: faker.helpers.arrayElement([
            'Client business growth',
            'Revenue increase',
            'Market expansion'
          ])
        },
        {
          value: `${faker.number.int({ min: 30, max: 90 })}%`,
          label: 'Cost Reduction',
          description: faker.helpers.arrayElement([
            'Operational efficiency',
            'Process optimization',
            'Resource utilization'
          ])
        },
        {
          value: `${faker.number.int({ min: 85, max: 99 })}%`,
          label: 'Success Rate',
          description: faker.helpers.arrayElement([
            'Project completion',
            'Goal achievement',
            'Client satisfaction'
          ])
        }
      ],
      skillMetrics: [
        {
          category: 'Technical',
          items: faker.helpers.arrayElements([
            'TypeScript', 'React', 'Node.js', 'Python', 'AWS', 
            'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB'
          ], { min: 3, max: 6 })
        },
        {
          category: 'Strategic',
          items: faker.helpers.arrayElements([
            'Digital Strategy', 'Business Transformation', 'Innovation',
            'Growth Hacking', 'Market Analysis', 'Competitive Intelligence'
          ], { min: 2, max: 4 })
        },
        {
          category: 'Leadership',
          items: faker.helpers.arrayElements([
            'Team Building', 'Change Management', 'Stakeholder Management',
            'Executive Communication', 'Strategic Planning', 'Mentorship'
          ], { min: 2, max: 4 })
        }
      ],
      generatedAt: faker.date.recent().toISOString(),
      metadata: {
        source: 'factory-generated',
        confidence: faker.number.float({ min: 0.8, max: 0.95, fractionDigits: 2 }),
        lastValidated: faker.date.recent().toISOString()
      }
    };

    return this.applyOverrides(base, options?.overrides);
  }
}

/**
 * Timeline data factory
 */
export class TimelineFactory extends BaseFactory<TimelineItem> {
  private static readonly TYPES = ['work', 'education', 'achievement'] as const;
  private static readonly ORGANIZATIONS = [
    'Tech Corp', 'Digital Solutions Inc', 'Innovation Labs', 'Global Systems',
    'Startup Ventures', 'Enterprise Solutions', 'Cloud Technologies'
  ];

  generate(options?: FactoryOptions): TimelineItem {
    const type = faker.helpers.arrayElement(TimelineFactory.TYPES);
    const organization = faker.helpers.arrayElement(TimelineFactory.ORGANIZATIONS);
    
    const base: TimelineItem = {
      year: faker.date.past({ years: 20 }).getFullYear().toString(),
      title: this.generateTitleByType(type),
      organization,
      description: faker.lorem.paragraph(),
      type,
      duration: type === 'work' ? `${faker.number.int({ min: 6, max: 48 })} months` : undefined,
      achievements: type === 'work' ? faker.helpers.arrayElements([
        'Led cross-functional team of 10+ members',
        'Reduced operational costs by 30%',
        'Implemented new technology stack',
        'Improved customer satisfaction by 45%',
        'Expanded market presence by 60%'
      ], { min: 1, max: 3 }) : undefined,
      skills: type === 'education' ? faker.helpers.arrayElements([
        'Computer Science', 'Business Administration', 'Data Science',
        'Machine Learning', 'Software Engineering', 'Systems Architecture'
      ], { min: 3, max: 5 }) : undefined,
      metadata: {
        location: faker.location.city(),
        highlights: type === 'achievement' ? faker.helpers.arrayElements([
          'Industry recognition',
          'Innovation award',
          'Patent filed',
          'Speaking engagement',
          'Publication release'
        ], { min: 1, max: 2 }) : undefined
      }
    };

    return this.applyOverrides(base, options?.overrides);
  }

  private generateTitleByType(type: TimelineItem['type']): string {
    switch (type) {
      case 'work':
        return faker.helpers.arrayElement([
          'Chief of Staff', 'Senior Director', 'VP of Operations',
          'Head of Strategy', 'Managing Director', 'Principal Consultant'
        ]);
      case 'education':
        return faker.helpers.arrayElement([
          'MBA in Business Administration',
          'MS in Computer Science',
          'Executive Leadership Program',
          'PhD in Data Science',
          'Certificate in Digital Transformation'
        ]);
      case 'achievement':
        return faker.helpers.arrayElement([
          'Industry Innovation Award',
          'Best Technology Implementation',
          'Excellence in Leadership',
          'Digital Transformation Pioneer',
          'Outstanding Contribution Award'
        ]);
    }
  }
}

/**
 * Factory manager for orchestrating multiple factories
 */
export class FactoryManager {
  private factories: Map<string, BaseFactory<any>> = new Map();
  private config: FactoryConfig;

  constructor(config: FactoryConfig = {}) {
    this.config = config;
    this.registerDefaultFactories();
  }

  /**
   * Register a factory
   */
  registerFactory<T>(name: string, factory: BaseFactory<T>): void {
    this.factories.set(name, factory);
  }

  /**
   * Get a factory by name
   */
  getFactory<T>(name: string): BaseFactory<T> | undefined {
    return this.factories.get(name);
  }

  /**
   * Generate data using a specific factory
   */
  generate<T>(factoryName: string, options?: FactoryOptions): T {
    const factory = this.factories.get(factoryName);
    if (!factory) {
      throw new Error(`Factory not found: ${factoryName}`);
    }
    return factory.generate(options);
  }

  /**
   * Generate multiple items using a specific factory
   */
  generateMany<T>(factoryName: string, count: number, options?: FactoryOptions): T[] {
    const factory = this.factories.get(factoryName);
    if (!factory) {
      throw new Error(`Factory not found: ${factoryName}`);
    }
    return factory.generateMany(count, options);
  }

  /**
   * Generate a complete dataset with relationships
   */
  generateDataset(options: {
    users?: number;
    caseStudies?: number;
    metrics?: boolean;
    timeline?: number;
  }): {
    users?: User[];
    caseStudies?: CaseStudy[];
    metrics?: Metrics;
    timeline?: TimelineItem[];
  } {
    const dataset: any = {};

    if (options.users) {
      dataset.users = this.generateMany('user', options.users);
    }

    if (options.caseStudies) {
      dataset.caseStudies = this.generateMany('caseStudy', options.caseStudies);
    }

    if (options.metrics) {
      dataset.metrics = this.generate('metrics');
    }

    if (options.timeline) {
      dataset.timeline = this.generateMany('timeline', options.timeline);
    }

    return dataset;
  }

  /**
   * Get factory statistics
   */
  getStatistics(): {
    registeredFactories: number;
    totalGenerated: number;
    mostUsedFactories: Array<{ name: string; usageCount: number }>;
  } {
    return {
      registeredFactories: this.factories.size,
      totalGenerated: 0, // Would need tracking implementation
      mostUsedFactories: [] // Would need usage tracking implementation
    };
  }

  private registerDefaultFactories(): void {
    this.registerFactory('user', new UserFactory(this.config));
    this.registerFactory('caseStudy', new CaseStudyFactory(this.config));
    this.registerFactory('metrics', new MetricsFactory(this.config));
    this.registerFactory('timeline', new TimelineFactory(this.config));
  }
}

// Type definitions
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  preferences: {
    theme: string;
    language: string;
    notifications: boolean;
  };
  metadata: {
    ipAddress: string;
    userAgent: string;
    location: {
      country: string;
      city: string;
      timezone: string;
    };
  };
}

export interface CaseStudy {
  id: string;
  slug: string;
  data: {
    title: string;
    industry: string;
    client: string;
    duration: string;
    teamSize: number;
    problem: string;
    solution: string;
    result: string;
    skills: string[];
    metric: string;
    technologies: string[];
    testimonial: {
      quote: string;
      author: string;
      position: string;
      company: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
  featured: boolean;
  metadata: {
    readTime: number;
    difficulty: string;
    tags: string[];
  };
}

export interface Metrics {
  careerMetrics: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  impactMetrics: Array<{
    value: string;
    label: string;
    description: string;
  }>;
  skillMetrics: Array<{
    category: string;
    items: string[];
  }>;
  generatedAt: string;
  metadata: {
    source: string;
    confidence: number;
    lastValidated: string;
  };
}

export interface TimelineItem {
  year: string;
  title: string;
  organization: string;
  description: string;
  type: 'work' | 'education' | 'achievement';
  duration?: string;
  achievements?: string[];
  skills?: string[];
  metadata: {
    location: string;
    highlights?: string[];
  };
}

/**
 * Global factory manager instance
 */
export const factoryManager = new FactoryManager({
  deterministic: true,
  seed: 12345,
  validation: { strict: true }
});
