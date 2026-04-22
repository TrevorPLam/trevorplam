/**
 * Mock Service Contract Testing
 * 
 * Enhanced contract testing for mock services with validation, versioning,
 * and integration with the service virtualization layer.
 */

import { Pact } from '@pact-foundation/pact';
import { Matchers } from '@pact-foundation/pact';
import path from 'path';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mockManager } from '../mocks/mock-manager';
import { serviceVirtualizer } from '../virtualization/service-virtualizer';
import { factoryManager } from '../factories/data-factory';

const { eachLike, string, regex, integer, boolean, datetime } = Matchers;

describe('Mock Service Contract Tests', () => {
  const provider = new Pact({
    consumer: 'test-suite',
    provider: 'mock-service-virtualizer',
    dir: path.resolve(process.cwd(), 'tests', 'pacts'),
    spec: 4,
    logLevel: (process.env.LOG_LEVEL as 'trace' | 'debug' | 'info' | 'warn' | 'error') || 'info',
  });

  beforeEach(async () => {
    await provider.setup();
    
    // Register test virtual services
    serviceVirtualizer.registerService({
      name: 'user-service',
      baseUrl: 'https://api.test.com/users',
      behaviors: [
        {
          requestPattern: 'GET /api/users/{id}',
          responseTemplate: factoryManager.generate('user'),
          latency: 50,
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        },
        {
          requestPattern: 'POST /api/users',
          responseTemplate: factoryManager.generate('user'),
          latency: 100,
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        }
      ],
      version: '1.0.0',
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'User service mock for testing',
        tags: ['user', 'api', 'mock']
      }
    });

    // Register mock definitions
    let userMockId: string;
    userMockId = mockManager.registerMock({
      name: 'user-api-response',
      type: 'api',
      category: 'user',
      currentVersion: '1.0.0',
      versions: [{
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        description: 'User API response mock',
        changes: ['Initial version'],
        schema: factoryManager.generate('user')
      }],
      metadata: {
        author: 'test-suite',
        tags: ['user', 'api'],
        dependencies: [],
        environment: 'testing'
      },
      validation: {
        schema: require('zod').z.object({
          id: require('zod').z.string(),
          email: require('zod').z.string().email(),
          firstName: require('zod').z.string(),
          lastName: require('zod').z.string(),
          role: require('zod').z.string()
        }),
        strict: true
      }
    });
  });

  afterEach(async () => {
    // Cleanup virtual services and mocks
    serviceVirtualizer.clear();
    mockManager.cleanupInactiveInstances(0);
    
    // Provider cleanup handled by Pact framework
  });

  describe('User Service Mock Contract', () => {
    it('validates user retrieval contract', async () => {
      const expectedUser = {
        id: string('uuid'),
        email: string('email'),
        firstName: string('firstName'),
        lastName: string('lastName'),
        role: regex('admin|user|moderator|guest', 'user'),
        status: regex('active|inactive|suspended|pending', 'active'),
        avatar: string('url'),
        createdAt: datetime('iso-date-time', '2024-01-01T00:00:00Z'),
        updatedAt: datetime('iso-date-time', '2024-01-01T00:00:00Z'),
        lastLoginAt: datetime('iso-date-time', '2024-01-01T12:00:00Z'),
        preferences: {
          theme: regex('light|dark|auto', 'light'),
          language: regex('en|es|fr|de', 'en'),
          notifications: boolean()
        },
        metadata: {
          ipAddress: regex('\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}', '192.168.1.1'),
          userAgent: string('userAgent'),
          location: {
            country: string('country'),
            city: string('city'),
            timezone: string('timezone')
          }
        }
      };

      await provider
        .addInteraction()
        .given('user service is available')
        .uponReceiving('a request for user by ID')
        .withRequest('GET', '/api/users/123')
        .willRespondWith(200, (builder) => {
          builder.headers({
            'Content-Type': 'application/json',
            'X-Response-Time': string('number')
          });
          builder.jsonBody(expectedUser);
        })
        .executeTest(async (mockserver) => {
          // Test virtual service simulation
          const response = serviceVirtualizer.simulateResponse('user-service', 'GET', '/api/users/123');
          
          expect(response).toBeDefined();
          expect(response!.status).toBe(200);
          expect(response!.headers['Content-Type']).toBe('application/json');
          expect(response!.body).toMatchObject({
            id: expect.any(String),
            email: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            role: expect.stringMatching(/admin|user|moderator|guest/),
            status: expect.stringMatching(/active|inactive|suspended|pending/)
          });
          
          // Test mock instance creation
          const mockInstanceId = mockManager.createInstance('user-api-response');
          const mockInstance = mockManager.getInstance(mockInstanceId);
          
          expect(mockInstance).toBeDefined();
          expect(mockInstance!.isActive).toBe(true);
          expect(mockInstance!.data).toMatchObject({
            id: expect.any(String),
            email: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String)
          });
          
          return response!.body;
        });
    });

    it('validates user creation contract', async () => {
      const userCreationRequest = {
        email: string('email'),
        firstName: string('firstName'),
        lastName: string('lastName'),
        role: regex('admin|user|moderator|guest', 'user')
      };

      const userCreationResponse = {
        id: string('uuid'),
        email: string('email'),
        firstName: string('firstName'),
        lastName: string('lastName'),
        role: regex('admin|user|moderator|guest', 'user'),
        status: regex('active|inactive|suspended|pending', 'active'),
        createdAt: datetime('iso-date-time', '2024-01-01T00:00:00Z'),
        updatedAt: datetime('iso-date-time', '2024-01-01T00:00:00Z')
      };

      await provider
        .addInteraction()
        .given('user service is available')
        .uponReceiving('a request to create a new user')
        .withRequest('POST', '/api/users')
        .withHeaders({
          'Content-Type': 'application/json',
          'X-Request-ID': string('uuid')
        })
        .withJsonBody(userCreationRequest)
        .willRespondWith(201, (builder) => {
          builder.headers({
            'Content-Type': 'application/json',
            'Location': string('url')
          });
          builder.jsonBody(userCreationResponse);
        })
        .executeTest(async (mockserver) => {
          // Test virtual service simulation for creation
          const newUserData = factoryManager.generate('user');
          const response = serviceVirtualizer.simulateResponse('user-service', 'POST', '/api/users', newUserData);
          
          expect(response).toBeDefined();
          expect(response!.status).toBe(201);
          expect(response!.headers['Content-Type']).toBe('application/json');
          expect(response!.body).toMatchObject({
            id: expect.any(String),
            email: expect.any(String),
            firstName: expect.any(String),
            lastName: expect.any(String),
            role: expect.stringMatching(/admin|user|moderator|guest/),
            status: 'active'
          });
          
          // Capture traffic for behavior analysis
          const sessionId = serviceVirtualizer.startSession({ testId: 'user-creation-test' });
          serviceVirtualizer.captureTraffic({
            method: 'POST',
            url: '/api/users',
            headers: { 'Content-Type': 'application/json' },
            body: newUserData,
            response: response!,
            metadata: {
              source: 'contract-test',
              sessionId,
              testId: 'user-creation-test'
            }
          });
          
          // Generate behavior model from captured traffic
          const behaviors = serviceVirtualizer.generateBehaviorModel('user-service');
          expect(behaviors).toHaveLength(expect.any(Number));
          
          serviceVirtualizer.endSession(sessionId);
          
          return response!.body;
        });
    });
  });

  describe('Mock Version Control Contract', () => {
    it('validates mock versioning', async () => {
      const userMock = mockManager.getMockByName('user-api-response');
      expect(userMock).toBeDefined();
      
      // Create a new version
      const newVersion = mockManager.createVersion(userMock!.id, {
        description: 'Added phone number field',
        changes: ['Added phone number to user schema'],
        schema: {
          ...userMock!.versions[0].schema,
          phone: '+1234567890'
        }
      });
      
      expect(newVersion).toMatch(/^1\.\d+\.\d+$/);
      
      // Test version retrieval
      const versionData = mockManager.getMockVersion(userMock!.id, newVersion);
      expect(versionData).toBeDefined();
      expect(versionData!.version).toBe(newVersion);
      expect(versionData!.schema).toHaveProperty('phone');
      
      // Test version reversion
      mockManager.revertVersion(userMock!.id, '1.0.0');
      const revertedMock = mockManager.getMock(userMock!.id);
      expect(revertedMock!.currentVersion).toBe('1.0.0');
    });

    it('validates mock deprecation', async () => {
      const userMock = mockManager.getMockByName('user-api-response');
      expect(userMock).toBeDefined();
      
      // Deprecate current version
      mockManager.deprecateVersion(userMock!.id, '1.0.0', 'Replaced by v1.1.0');
      
      const deprecatedVersion = mockManager.getMockVersion(userMock!.id, '1.0.0');
      expect(deprecatedVersion!.deprecated).toBe(true);
      expect(deprecatedVersion!.description).toContain('DEPRECATED');
    });
  });

  describe('Service Virtualization Contract', () => {
    it('validates service registration and discovery', async () => {
      const services = serviceVirtualizer.listServices();
      expect(services).toHaveLength(1);
      expect(services[0].name).toBe('user-service');
      expect(services[0].version).toBe('1.0.0');
      expect(services[0].status).toBe('healthy');
    });

    it('validates traffic capture and analysis', async () => {
      const sessionId = serviceVirtualizer.startSession({ testId: 'traffic-analysis' });
      
      // Simulate some traffic
      for (let i = 0; i < 5; i++) {
        serviceVirtualizer.captureTraffic({
          method: 'GET',
          url: `/api/users/${i}`,
          headers: { 'Authorization': 'Bearer token' },
          response: {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
            body: factoryManager.generate('user'),
            latency: 50 + Math.random() * 50
          },
          metadata: {
            source: 'test',
            sessionId,
            testId: 'traffic-analysis'
          }
        });
      }
      
      // Analyze captured traffic
      const capturedTraffic = serviceVirtualizer.getCapturedTraffic({ sessionId });
      expect(capturedTraffic).toHaveLength(5);
      
      // Generate behavior model
      const behaviors = serviceVirtualizer.generateBehaviorModel('user-service');
      expect(behaviors.length).toBeGreaterThan(0);
      
      // Get metrics
      const metrics = serviceVirtualizer.getMetrics();
      expect(metrics.trafficCaptures).toBe(5);
      expect(metrics.activeSessions).toBe(1);
      
      serviceVirtualizer.endSession(sessionId);
    });

    it('validates virtualization session management', async () => {
      const sessionId1 = serviceVirtualizer.startSession({ testId: 'session-1' });
      const sessionId2 = serviceVirtualizer.startSession({ testId: 'session-2' });
      
      expect(sessionId1).toBeDefined();
      expect(sessionId2).toBeDefined();
      expect(sessionId1).not.toBe(sessionId2);
      
      const metrics = serviceVirtualizer.getMetrics();
      expect(metrics.activeSessions).toBeGreaterThanOrEqual(2);
      
      serviceVirtualizer.endSession(sessionId1);
      const metricsAfterEnd = serviceVirtualizer.getMetrics();
      expect(metricsAfterEnd.activeSessions).toBe(1);
      
      serviceVirtualizer.endSession(sessionId2);
    });
  });

  describe('Data Factory Contract', () => {
    it('validates realistic data generation', async () => {
      const users = factoryManager.generateMany('user', 3);
      const caseStudies = factoryManager.generateMany('caseStudy', 2);
      const metrics = factoryManager.generate('metrics');
      const timeline = factoryManager.generateMany('timeline', 5);
      
      // Validate user data
      expect(users).toHaveLength(3);
      users.forEach(user => {
        expect(user).toMatchObject({
          id: expect.any(String),
          email: expect.stringMatching(/@/),
          firstName: expect.any(String),
          lastName: expect.any(String),
          role: expect.stringMatching(/admin|user|moderator|guest/),
          status: expect.stringMatching(/active|inactive|suspended|pending/)
        });
      });
      
      // Validate case study data
      expect(caseStudies).toHaveLength(2);
      caseStudies.forEach(study => {
        expect(study).toMatchObject({
          id: expect.any(String),
          slug: expect.any(String),
          data: {
            title: expect.any(String),
            industry: expect.stringMatching(/QSR|Salon|CPA-Payroll|E-commerce|Healthcare|FinTech|EdTech|RealEstate|Logistics|Manufacturing/),
            problem: expect.any(String),
            solution: expect.any(String),
            result: expect.any(String),
            skills: expect.any(Array)
          }
        });
      });
      
      // Validate metrics data
      expect(metrics).toMatchObject({
        careerMetrics: expect.any(Array),
        impactMetrics: expect.any(Array),
        skillMetrics: expect.any(Array),
        generatedAt: expect.any(String)
      });
      
      // Validate timeline data
      expect(timeline).toHaveLength(5);
      timeline.forEach(item => {
        expect(item).toMatchObject({
          year: expect.any(String),
          title: expect.any(String),
          organization: expect.any(String),
          type: expect.stringMatching(/work|education|achievement/)
        });
      });
    });

    it('validates deterministic generation with seed', async () => {
      // Create new factory instances with same seed for deterministic testing
      const factory1 = new (require('../factories/data-factory').FactoryManager)({ seed: 12345 });
      const factory2 = new (require('../factories/data-factory').FactoryManager)({ seed: 12345 });
      
      const users1 = factory1.generateMany('user', 2);
      const users2 = factory2.generateMany('user', 2);
      
      // Should generate the same data with the same seed
      expect(users1[0].email).toBe(users2[0].email);
      expect(users1[1].firstName).toBe(users2[1].firstName);
    });

    it('validates factory overrides', async () => {
      const user = factoryManager.generate('user', {
        overrides: {
          role: 'admin',
          status: 'active',
          firstName: 'Test',
          lastName: 'User'
        }
      });
      
      expect(user.role).toBe('admin');
      expect(user.status).toBe('active');
      expect(user.firstName).toBe('Test');
      expect(user.lastName).toBe('User');
    });
  });

  describe('Integration Contract', () => {
    it('validates end-to-end mock service workflow', async () => {
      // 1. Generate realistic test data
      const testUsers = factoryManager.generateMany('user', 3);
      
      // 2. Register virtual service with behavior model
      serviceVirtualizer.registerService({
        name: 'integration-test-service',
        baseUrl: 'https://api.test.com/integration',
        behaviors: testUsers.map((user, index) => ({
          requestPattern: `GET /api/users/${index}`,
          responseTemplate: user,
          latency: 30,
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        })),
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'Integration test service',
          tags: ['integration', 'test']
        }
      });
      
      // 3. Create mock instances
      const mockInstances = testUsers.map(() => 
        mockManager.createInstance('user-api-response')
      );
      
      expect(mockInstances).toHaveLength(3);
      
      // 4. Test virtual service responses
      testUsers.forEach((user, index) => {
        const response = serviceVirtualizer.simulateResponse(
          'integration-test-service', 
          'GET', 
          `/api/users/${index}`
        );
        
        expect(response).toBeDefined();
        expect(response!.status).toBe(200);
        expect(response!.body.id).toBe(user.id);
      });
      
      // 5. Capture traffic and generate insights
      const sessionId = serviceVirtualizer.startSession({ testId: 'integration-test' });
      
      testUsers.forEach((user, index) => {
        serviceVirtualizer.captureTraffic({
          method: 'GET',
          url: `/api/users/${index}`,
          headers: { 'Accept': 'application/json' },
          response: serviceVirtualizer.simulateResponse('integration-test-service', 'GET', `/api/users/${index}`)!,
          metadata: {
            source: 'integration-test',
            sessionId,
            testId: 'integration-test'
          }
        });
      });
      
      // 6. Analyze behavior and metrics
      const behaviors = serviceVirtualizer.generateBehaviorModel('integration-test-service');
      const metrics = serviceVirtualizer.getMetrics();
      
      expect(behaviors.length).toBeGreaterThan(0);
      expect(metrics.trafficCaptures).toBeGreaterThanOrEqual(3);
      
      serviceVirtualizer.endSession(sessionId);
      
      // 7. Cleanup
      mockInstances.forEach(id => mockManager.deactivateInstance(id));
    });
  });
});
