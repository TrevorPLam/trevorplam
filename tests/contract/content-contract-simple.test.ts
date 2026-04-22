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
    logLevel: (process.env.LOG_LEVEL as 'trace' | 'debug' | 'info' | 'warn' | 'error') || 'info',
    port: 1234, // Fixed port for consistent testing
    host: '127.0.0.1'
  });

  beforeEach(async () => {
    await provider.setup();
  });

  afterEach(async () => {
    // Pact V4 automatically handles cleanup after each interaction
    // No explicit close needed in afterEach
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
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          builder.jsonBody(eachLike(expectedCaseStudy));
        })
        .executeTest(async (mockserver) => {
          // Make actual HTTP request to mock server with proper CORS headers
          const response = await fetch(`${mockserver.url}/api/content/case-studies`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            mode: 'cors'
          });
          const data = await response.json();
          
          expect(data).toBeDefined();
          expect(Array.isArray(data)).toBe(true);
          expect(data[0]).toMatchObject({
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
          
          return data;
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
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          builder.jsonBody(expectedCaseStudy);
        })
        .executeTest(async (mockserver) => {
          const response = await fetch(`${mockserver.url}/api/content/case-studies/grandlux`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            mode: 'cors'
          });
          const data = await response.json();
          
          expect(data).toBeDefined();
          expect(data.id).toBe('grandlux');
          expect(data.data.industry).toBe('QSR');
          expect(data.data.skills).toContain('Digital Strategy');
          
          return data;
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
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          builder.jsonBody(expectedMetrics);
        })
        .executeTest(async (mockserver) => {
          const response = await fetch(`${mockserver.url}/api/content/metrics`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            mode: 'cors'
          });
          const data = await response.json();
          
          expect(data).toBeDefined();
          expect(data.careerMetrics).toBeDefined();
          expect(data.impactMetrics).toBeDefined();
          expect(data.skillMetrics).toBeDefined();
          
          // Validate structure
          expect(data.careerMetrics[0]).toMatchObject({
            value: expect.any(String),
            label: expect.any(String),
            description: expect.any(String)
          });
          
          return data;
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
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          builder.jsonBody(expectedTimeline);
        })
        .executeTest(async (mockserver) => {
          const response = await fetch(`${mockserver.url}/api/content/timeline`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            mode: 'cors'
          });
          const data = await response.json();
          
          expect(data).toBeDefined();
          expect(Array.isArray(data)).toBe(true);
          
          // Validate structure
          expect(data[0]).toMatchObject({
            year: expect.any(String),
            title: expect.any(String),
            organization: expect.any(String),
            description: expect.any(String),
            type: expect.stringMatching(/work|education|achievement/)
          });
          
          return data;
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
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          });
          builder.jsonBody(expectedSkills);
        })
        .executeTest(async (mockserver) => {
          const response = await fetch(`${mockserver.url}/api/content/skills`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            },
            mode: 'cors'
          });
          const data = await response.json();
          
          expect(data).toBeDefined();
          expect(data.technical).toBeDefined();
          expect(data.strategic).toBeDefined();
          expect(data.industry).toBeDefined();
          
          // Validate structure
          expect(data.technical[0]).toMatchObject({
            name: expect.any(String),
            level: expect.stringMatching(/Beginner|Intermediate|Advanced|Expert/),
            category: expect.any(String)
          });
          
          return data;
        });
    });
  });
});
