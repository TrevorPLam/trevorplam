/**
 * Dynamic Contract Test Scenario Generator
 * 
 * Generates realistic test scenarios for contract testing based on
 * API schemas, business rules, and edge cases. This helps maintain
 * comprehensive contract coverage while reducing manual maintenance.
 */

import { Matchers } from '@pact-foundation/pact';
import { randomUUID } from 'crypto';

const { eachLike, string, regex, integer, boolean, datetime } = Matchers;

export interface ScenarioTemplate {
  name: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  generator: () => any;
}

export interface GeneratedScenario {
  name: string;
  description: string;
  priority: string;
  tags: string[];
  data: any;
  generatedAt: string;
}

/**
 * Dynamic scenario generator for case studies content contracts
 */
export class CaseStudyScenarioGenerator {
  private static readonly INDUSTRIES = [
    'QSR', 'Salon', 'CPA-Payroll', 'E-commerce', 'Healthcare', 
    'FinTech', 'EdTech', 'RealEstate', 'Logistics', 'Manufacturing'
  ];

  private static readonly PROBLEMS = [
    'High-volume cash environment requiring precise reconciliation',
    'Complex commission structures with multiple technicians',
    'Inefficient inventory management causing stockouts',
    'Manual data entry errors affecting financial reporting',
    'Poor customer experience due to slow service times',
    'Lack of real-time visibility into operations',
    'Compliance issues with industry regulations',
    'Outdated technology hindering growth',
    'Inefficient workflow processes',
    'Data silos preventing informed decision-making'
  ];

  private static readonly RESULTS = [
    'Zero cash discrepancies and proactive reputation management',
    '45% increase in technician efficiency and accuracy',
    'Real-time inventory tracking with 99% accuracy',
    'Automated reporting reducing errors by 80%',
    'Customer satisfaction scores improved by 35%',
    'Dashboard providing real-time operational insights',
    'Full compliance with regulatory requirements',
    'Scalable technology supporting 3x growth',
    'Streamlined workflows reducing processing time by 60%',
    'Integrated data platform enabling data-driven decisions'
  ];

  private static readonly SKILLS = [
    'Financial Controls', 'Process Optimization', 'Technology Implementation',
    'Data Analytics', 'Change Management', 'Strategic Planning',
    'Risk Management', 'Compliance', 'Project Management', 'Leadership'
  ];

  private static readonly METRICS = [
    'Zero Discrepancies', '45% Efficiency Gain', '99% Accuracy', '80% Error Reduction',
    '35% CSAT Improvement', 'Real-time Visibility', '100% Compliance', '3x Growth',
    '60% Time Reduction', 'Data-Driven Decisions'
  ];

  /**
   * Generate realistic case study scenarios
   */
  static generateScenarios(count: number = 5): GeneratedScenario[] {
    const scenarios: GeneratedScenario[] = [];

    for (let i = 0; i < count; i++) {
      const scenario = this.generateSingleScenario();
      scenarios.push(scenario);
    }

    return scenarios;
  }

  /**
   * Generate a single realistic case study scenario
   */
  private static generateSingleScenario(): GeneratedScenario {
    const id = this.generateSlug();
    const industry = this.getRandomElement(this.INDUSTRIES);
    const problem = this.getRandomElement(this.PROBLEMS);
    const result = this.getRandomElement(this.RESULTS);
    const skills = this.getRandomElements(this.SKILLS, 2, 4);
    const metric = this.getRandomElement(this.METRICS);

    return {
      name: `Case Study: ${industry} Operations`,
      description: `Dynamic scenario for ${industry} case study with ${skills.length} key skills`,
      priority: this.getRandomPriority(),
      tags: ['case-study', industry.toLowerCase(), 'dynamic'],
      data: {
        id: string(id),
        slug: string(id),
        data: {
          title: string(`${industry} Operations`),
          industry: regex(this.INDUSTRIES.join('|'), industry),
          problem: string(problem),
          result: string(result),
          skills: eachLike(this.getRandomElement(skills)),
          metric: string(metric)
        }
      },
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate Pact matcher template for case studies
   */
  static generatePactTemplate(): any {
    return {
      id: string('grandlux'),
      slug: string('grandlux'),
      data: {
        title: string('Grandlux Nail Salon Operations'),
        industry: regex(this.INDUSTRIES.join('|'), 'Salon'),
        problem: string('High-volume cash environment with 17 commission-based technicians required precise reconciliation'),
        result: string('Zero cash discrepancies and proactive reputation management through service recovery'),
        skills: eachLike('Financial Controls'),
        metric: string('Zero Discrepancies')
      }
    };
  }

  /**
   * Generate edge case scenarios
   */
  static generateEdgeCases(): GeneratedScenario[] {
    return [
      {
        name: 'Edge Case: Empty Skills Array',
        description: 'Test case study with no skills specified',
        priority: 'medium',
        tags: ['edge-case', 'case-study'],
        data: {
          id: string('edge-case-1'),
          slug: string('edge-case-1'),
          data: {
            title: string('Edge Case Test'),
            industry: regex(this.INDUSTRIES.join('|'), 'QSR'),
            problem: string('Test problem'),
            result: string('Test result'),
            skills: eachLike(''), // Empty skill
            metric: string('Test Metric')
          }
        },
        generatedAt: new Date().toISOString()
      },
      {
        name: 'Edge Case: Maximum Length Fields',
        description: 'Test case study with maximum length strings',
        priority: 'low',
        tags: ['edge-case', 'case-study'],
        data: {
          id: string('edge-case-max-length'),
          slug: string('edge-case-max-length'),
          data: {
            title: string('A'.repeat(100)),
            industry: regex(this.INDUSTRIES.join('|'), 'Manufacturing'),
            problem: string('B'.repeat(500)),
            result: string('C'.repeat(500)),
            skills: eachLike('D'.repeat(50)),
            metric: string('E'.repeat(50))
          }
        },
        generatedAt: new Date().toISOString()
      }
    ];
  }

  private static generateSlug(): string {
    const adjectives = ['dynamic', 'smart', 'efficient', 'modern', 'optimized'];
    const nouns = ['solution', 'system', 'platform', 'process', 'workflow'];
    const adjective = this.getRandomElement(adjectives);
    const noun = this.getRandomElement(nouns);
    return `${adjective}-${noun}-${randomUUID().slice(0, 8)}`;
  }

  protected static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private static getRandomElements<T>(array: T[], min: number, max: number): T[] {
    const count = Math.floor(Math.random() * (max - min + 1)) + min;
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  private static getRandomPriority(): 'critical' | 'high' | 'medium' | 'low' {
    const priorities: ('critical' | 'high' | 'medium' | 'low')[] = ['critical', 'high', 'medium', 'low'];
    return this.getRandomElement(priorities);
  }
}

/**
 * Dynamic scenario generator for metrics content contracts
 */
export class MetricsScenarioGenerator {
  private static readonly CAREER_METRICS = [
    { value: '15+', label: 'Years Experience', description: 'Senior leadership experience' },
    { value: '50+', label: 'Projects Led', description: 'Cross-functional initiatives' },
    { value: '200+', label: 'Team Members Managed', description: 'Direct and indirect reports' },
    { value: '10M+', label: 'Budget Managed', description: 'Annual budget responsibility' }
  ];

  private static readonly IMPACT_METRICS = [
    { value: '45%', label: 'Average Growth', description: 'Client business growth' },
    { value: '60%', label: 'Cost Reduction', description: 'Operational efficiency gains' },
    { value: '80%', label: 'Process Improvement', description: 'Workflow optimization' },
    { value: '35%', label: 'Revenue Increase', description: 'Top-line growth impact' }
  ];

  private static readonly SKILL_CATEGORIES = [
    'Strategy', 'Leadership', 'Technology', 'Operations', 'Finance', 'Marketing'
  ];

  /**
   * Generate realistic metrics scenarios
   */
  static generateScenarios(count: number = 3): GeneratedScenario[] {
    const scenarios: GeneratedScenario[] = [];

    for (let i = 0; i < count; i++) {
      scenarios.push(this.generateSingleScenario());
    }

    return scenarios;
  }

  private static generateSingleScenario(): GeneratedScenario {
    const careerMetric = CaseStudyScenarioGenerator.getRandomElement(this.CAREER_METRICS);
    const impactMetric = CaseStudyScenarioGenerator.getRandomElement(this.IMPACT_METRICS);
    const skillCategory = CaseStudyScenarioGenerator.getRandomElement(this.SKILL_CATEGORIES);

    return {
      name: 'Metrics Configuration Scenario',
      description: `Dynamic metrics scenario with ${skillCategory} focus`,
      priority: 'high',
      tags: ['metrics', 'dynamic', skillCategory.toLowerCase()],
      data: {
        careerMetrics: eachLike({
          value: string(careerMetric.value),
          label: string(careerMetric.label),
          description: string(careerMetric.description)
        }),
        impactMetrics: eachLike({
          value: string(impactMetric.value),
          label: string(impactMetric.label),
          description: string(impactMetric.description)
        }),
        skillMetrics: eachLike({
          category: string(skillCategory),
          items: eachLike('Digital Transformation')
        })
      },
      generatedAt: new Date().toISOString()
    };
  }
}

/**
 * Dynamic scenario generator for timeline content contracts
 */
export class TimelineScenarioGenerator {
  private static readonly ORGANIZATIONS = [
    'Tech Corp', 'Global Solutions', 'Digital Innovations', 'Strategic Partners',
    'Enterprise Systems', 'Cloud Platforms', 'Data Analytics Inc', 'AI Solutions'
  ];

  private static readonly TITLES = [
    'Chief of Staff', 'Senior Director', 'VP of Operations', 'Head of Strategy',
    'Director of Transformation', 'Senior Consultant', 'Principal Architect', 'Lead Analyst'
  ];

  /**
   * Generate realistic timeline scenarios
   */
  static generateScenarios(count: number = 5): GeneratedScenario[] {
    const scenarios: GeneratedScenario[] = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i < count; i++) {
      const year = currentYear - i;
      scenarios.push(this.generateSingleScenario(year));
    }

    return scenarios;
  }

  private static generateSingleScenario(year: number): GeneratedScenario {
    const organization = CaseStudyScenarioGenerator.getRandomElement(this.ORGANIZATIONS);
    const title = CaseStudyScenarioGenerator.getRandomElement(this.TITLES);
    const type = Math.random() > 0.8 ? 'education' : 'work';

    return {
      name: `Timeline Entry: ${year}`,
      description: `Timeline scenario for ${year} at ${organization}`,
      priority: 'medium',
      tags: ['timeline', 'dynamic', type],
      data: eachLike({
        year: string(year.toString()),
        title: string(title),
        organization: string(organization),
        description: string(`Leading strategic initiatives and driving organizational excellence`),
        type: regex('work|education|achievement', type)
      }),
      generatedAt: new Date().toISOString()
    };
  }
}

/**
 * Main dynamic scenario orchestrator
 */
export class DynamicScenarioOrchestrator {
  /**
   * Generate all dynamic scenarios for contract testing
   */
  static generateAllScenarios(): {
    caseStudies: GeneratedScenario[];
    metrics: GeneratedScenario[];
    timeline: GeneratedScenario[];
    edgeCases: GeneratedScenario[];
  } {
    return {
      caseStudies: CaseStudyScenarioGenerator.generateScenarios(5),
      metrics: MetricsScenarioGenerator.generateScenarios(3),
      timeline: TimelineScenarioGenerator.generateScenarios(5),
      edgeCases: CaseStudyScenarioGenerator.generateEdgeCases()
    };
  }

  /**
   * Generate scenarios with specific priority filter
   */
  static generateScenariosByPriority(priority: 'critical' | 'high' | 'medium' | 'low'): GeneratedScenario[] {
    const allScenarios = this.generateAllScenarios();
    const all = [
      ...allScenarios.caseStudies,
      ...allScenarios.metrics,
      ...allScenarios.timeline,
      ...allScenarios.edgeCases
    ];

    return all.filter(scenario => scenario.priority === priority);
  }

  /**
   * Export scenarios for Pact testing
   */
  static exportForPact(): Record<string, any> {
    const scenarios = this.generateAllScenarios();
    
    return {
      caseStudyTemplate: CaseStudyScenarioGenerator.generatePactTemplate(),
      dynamicCaseStudies: scenarios.caseStudies.map(s => s.data),
      dynamicMetrics: scenarios.metrics.map(s => s.data),
      dynamicTimeline: scenarios.timeline.map(s => s.data),
      edgeCases: scenarios.edgeCases.map(s => s.data),
      metadata: {
        generatedAt: new Date().toISOString(),
        totalScenarios: Object.values(scenarios).reduce((sum, arr) => sum + arr.length, 0),
        generators: ['CaseStudyScenarioGenerator', 'MetricsScenarioGenerator', 'TimelineScenarioGenerator']
      }
    };
  }
}
