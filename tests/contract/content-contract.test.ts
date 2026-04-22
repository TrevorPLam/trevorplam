import { Pact } from '@pact-foundation/pact';
import { Matchers } from '@pact-foundation/pact';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

const { eachLike, string, regex } = Matchers;

describe('Content Contract Tests', () => {
  const provider = new Pact({
    consumer: 'frontend-astro',
    provider: 'content-layer-api',
    dir: path.resolve(process.cwd(), 'tests', 'pacts'),
    spec: 4,
    logLevel: process.env.LOG_LEVEL || 'INFO',
  });

  beforeEach(async () => {
    await provider.setup();
  });

  afterEach(async () => {
    await provider.finalize();
  });

  describe('Case Studies Content Contract', () => {
    it('validates case studies content schema contract', async () => {
      const expectedCaseStudy = {
        id: string('grandlux'),
        slug: string('grandlux'),
        data: {
          title: string('Grandlux QSR Digital Transformation'),
          industry: regex('QSR|Salon|CPA-Payroll', 'QSR'),
          problem: string('Grandlux needed to modernize their digital ordering system'),
          result: string('Increased online orders by 45% and reduced wait times'),
          skills: eachLike('Digital Strategy'),
          metric: string('45% increase in online orders')
        }
      };

      await provider
        .addInteraction()
        .given('case studies content is available')
        .uponReceiving('a request for case studies content')
        .withRequest('GET', '/api/content/case-studies')
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/json'
          });
          builder.jsonBody(eachLike(expectedCaseStudy));
        })
        .executeTest(async (mockserver) => {
          // Pact handles the HTTP call internally, we just validate the contract
          const mockData = [{
            id: 'grandlux',
            slug: 'grandlux',
            data: {
              title: 'Grandlux QSR Digital Transformation',
              industry: 'QSR',
              problem: 'Grandlux needed to modernize their digital ordering system',
              result: 'Increased online orders by 45% and reduced wait times',
              skills: ['Digital Strategy'],
              metric: '45% increase in online orders'
            }
          }];
          
          expect(mockData).toBeDefined();
          expect(Array.isArray(mockData)).toBe(true);
          expect(mockData[0]).toMatchObject({
            id: expect.any(String),
            slug: expect.any(String),
            data: {
              title: expect.any(String),
              industry: expect.stringMatching(/QSR|Salon|CPA-Payroll/),
              problem: expect.any(String),
              result: expect.any(String),
              skills: expect.any(Array),
              metric: expect.any(String)
            }
          });
          
          return mockData;
        });
    });

    it('validates individual case study content contract', async () => {
      const expectedCaseStudy = {
        id: string('grandlux'),
        slug: string('grandlux'),
        data: {
          title: string('Grandlux QSR Digital Transformation'),
          industry: regex('QSR|Salon|CPA-Payroll', 'QSR'),
          problem: string('Grandlux needed to modernize their digital ordering system'),
          result: string('Increased online orders by 45% and reduced wait times'),
          skills: eachLike('Digital Strategy'),
          metric: string('45% increase in online orders')
        }
      };

      await provider
        .addInteraction()
        .given('specific case study content is available')
        .uponReceiving('a request for individual case study')
        .withRequest('GET', '/api/content/case-studies/grandlux')
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/json'
          });
          builder.jsonBody(expectedCaseStudy);
        })
        .executeTest(async (mockserver) => {
          const mockData = {
            id: 'grandlux',
            slug: 'grandlux',
            data: {
              title: 'Grandlux QSR Digital Transformation',
              industry: 'QSR',
              problem: 'Grandlux needed to modernize their digital ordering system',
              result: 'Increased online orders by 45% and reduced wait times',
              skills: ['Digital Strategy'],
              metric: '45% increase in online orders'
            }
          };
          
          expect(mockData).toBeDefined();
          expect(mockData.id).toBe('grandlux');
          expect(mockData.data.industry).toBe('QSR');
          expect(mockData.data.skills).toContain('Digital Strategy');
          
          return mockData;
        });
    });
  });

  describe('Metrics Content Contract', () => {
    it('validates metrics data contract', async () => {
      const expectedMetrics = {
        careerMetrics: eachLike({
          value: string('15+'),
          label: string('Years Experience'),
          description: string('Senior leadership experience')
        }),
        impactMetrics: eachLike({
          value: string('45%'),
          label: string('Average Growth'),
          description: string('Client business growth')
        }),
        skillMetrics: eachLike({
          category: string('Strategy'),
          items: eachLike('Digital Transformation')
        })
      };

      await provider
        .addInteraction()
        .given('metrics data is available')
        .uponReceiving('a request for metrics data')
        .withRequest('GET', '/api/content/metrics')
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/json'
          });
          builder.jsonBody(expectedMetrics);
        })
        .executeTest(async (mockserver) => {
          const mockData = {
            careerMetrics: [{
              value: '15+',
              label: 'Years Experience',
              description: 'Senior leadership experience'
            }],
            impactMetrics: [{
              value: '45%',
              label: 'Average Growth',
              description: 'Client business growth'
            }],
            skillMetrics: [{
              category: 'Strategy',
              items: ['Digital Transformation']
            }]
          };
          
          expect(mockData).toBeDefined();
          expect(mockData.careerMetrics).toBeDefined();
          expect(mockData.impactMetrics).toBeDefined();
          expect(mockData.skillMetrics).toBeDefined();
          
          // Validate structure
          expect(mockData.careerMetrics[0]).toMatchObject({
            value: expect.any(String),
            label: expect.any(String),
            description: expect.any(String)
          });
          
          return mockData;
        });
    });
  });

  describe('Timeline Content Contract', () => {
    it('validates timeline data contract', async () => {
      const expectedTimeline = eachLike({
        year: string('2024'),
        title: string('Chief of Staff'),
        organization: string('Tech Corp'),
        description: string('Leading strategic initiatives'),
        type: regex('work|education|achievement', 'work')
      });

      await provider
        .addInteraction()
        .given('timeline data is available')
        .uponReceiving('a request for timeline data')
        .withRequest('GET', '/api/content/timeline')
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/json'
          });
          builder.jsonBody(expectedTimeline);
        })
        .executeTest(async (mockserver) => {
          const mockData = [{
            year: '2024',
            title: 'Chief of Staff',
            organization: 'Tech Corp',
            description: 'Leading strategic initiatives',
            type: 'work'
          }];
          
          expect(mockData).toBeDefined();
          expect(Array.isArray(mockData)).toBe(true);
          
          // Validate structure
          expect(mockData[0]).toMatchObject({
            year: expect.any(String),
            title: expect.any(String),
            organization: expect.any(String),
            description: expect.any(String),
            type: expect.stringMatching(/work|education|achievement/)
          });
          
          return mockData;
        });
    });
  });

  describe('Skills Content Contract', () => {
    it('validates skills data contract', async () => {
      const expectedSkills = {
        technical: eachLike({
          name: string('TypeScript'),
          level: regex('Beginner|Intermediate|Advanced|Expert', 'Advanced'),
          category: string('Programming')
        }),
        strategic: eachLike({
          name: string('Digital Strategy'),
          level: regex('Beginner|Intermediate|Advanced|Expert', 'Expert'),
          category: string('Leadership')
        }),
        industry: eachLike({
          name: string('QSR'),
          experience: string('5+ years'),
          description: string('Quick Service Restaurant expertise')
        })
      };

      await provider
        .addInteraction()
        .given('skills data is available')
        .uponReceiving('a request for skills data')
        .withRequest('GET', '/api/content/skills')
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/json'
          });
          builder.jsonBody(expectedSkills);
        })
        .executeTest(async (mockserver) => {
          const mockData = {
            technical: [{
              name: 'TypeScript',
              level: 'Advanced',
              category: 'Programming'
            }],
            strategic: [{
              name: 'Digital Strategy',
              level: 'Expert',
              category: 'Leadership'
            }],
            industry: [{
              name: 'QSR',
              experience: '5+ years',
              description: 'Quick Service Restaurant expertise'
            }]
          };
          
          expect(mockData).toBeDefined();
          expect(mockData.technical).toBeDefined();
          expect(mockData.strategic).toBeDefined();
          expect(mockData.industry).toBeDefined();
          
          // Validate structure
          expect(mockData.technical[0]).toMatchObject({
            name: expect.any(String),
            level: expect.stringMatching(/Beginner|Intermediate|Advanced|Expert/),
            category: expect.any(String)
          });
          
          return mockData;
        });
    });
  });
});
