/**
 * Service Virtualizer Validation Tests
 * 
 * Core functionality tests for service virtualization layer
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ServiceVirtualizer } from './service-virtualizer';

describe('Service Virtualizer', () => {
  let virtualizer: ServiceVirtualizer;

  beforeEach(() => {
    virtualizer = new ServiceVirtualizer();
  });

  afterEach(() => {
    virtualizer.clear();
  });

  describe('Service Registration', () => {
    it('should register a virtual service', () => {
      const serviceConfig = {
        name: 'test-service',
        baseUrl: 'https://api.test.com',
        behaviors: [{
          requestPattern: 'GET /api/test',
          responseTemplate: { message: 'Hello World' },
          latency: 50,
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }],
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'Test service',
          tags: ['test']
        }
      };

      virtualizer.registerService(serviceConfig);
      
      const retrievedService = virtualizer.getService('test-service');
      expect(retrievedService).toBeDefined();
      expect(retrievedService!.name).toBe('test-service');
      expect(retrievedService!.version).toBe('1.0.0');
    });

    it('should list all registered services', () => {
      virtualizer.registerService({
        name: 'service-1',
        baseUrl: 'https://api.test1.com',
        behaviors: [],
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'Service 1',
          tags: []
        }
      });

      virtualizer.registerService({
        name: 'service-2',
        baseUrl: 'https://api.test2.com',
        behaviors: [],
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'Service 2',
          tags: []
        }
      });

      const services = virtualizer.listServices();
      expect(services).toHaveLength(2);
      expect(services[0].name).toBe('service-1');
      expect(services[1].name).toBe('service-2');
    });
  });

  describe('Traffic Capture', () => {
    it('should capture traffic data', () => {
      const sessionId = virtualizer.startSession();
      
      const captureId = virtualizer.captureTraffic({
        method: 'GET',
        url: '/api/test',
        headers: { 'Authorization': 'Bearer token' },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: { message: 'Success' },
          latency: 100
        },
        metadata: {
          source: 'test',
          sessionId,
          testId: 'test-1'
        }
      });

      expect(captureId).toBeDefined();
      expect(typeof captureId).toBe('string');

      const capturedTraffic = virtualizer.getCapturedTraffic({ sessionId });
      expect(capturedTraffic).toHaveLength(1);
      expect(capturedTraffic[0].method).toBe('GET');
      expect(capturedTraffic[0].url).toBe('/api/test');
      
      virtualizer.endSession(sessionId);
    });

    it('should filter captured traffic', () => {
      const sessionId = virtualizer.startSession();
      
      // Capture different types of traffic
      virtualizer.captureTraffic({
        method: 'GET',
        url: '/api/users',
        headers: {},
        response: { status: 200, headers: {}, body: [], latency: 50 },
        metadata: { source: 'test', sessionId }
      });

      virtualizer.captureTraffic({
        method: 'POST',
        url: '/api/users',
        headers: {},
        response: { status: 201, headers: {}, body: {}, latency: 100 },
        metadata: { source: 'test', sessionId }
      });

      const getTraffic = virtualizer.getCapturedTraffic({ method: 'GET', sessionId });
      expect(getTraffic).toHaveLength(1);
      expect(getTraffic[0].method).toBe('GET');

      const postTraffic = virtualizer.getCapturedTraffic({ method: 'POST', sessionId });
      expect(postTraffic).toHaveLength(1);
      expect(postTraffic[0].method).toBe('POST');
      
      virtualizer.endSession(sessionId);
    });
  });

  describe('Response Simulation', () => {
    it('should simulate responses based on registered behaviors', () => {
      virtualizer.registerService({
        name: 'user-service',
        baseUrl: 'https://api.test.com',
        behaviors: [{
          requestPattern: 'GET /api/users/{id}',
          responseTemplate: { id: '123', name: 'Test User' },
          latency: 50,
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }],
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'User service',
          tags: []
        }
      });

      const response = virtualizer.simulateResponse('user-service', 'GET', '/api/users/123');
      
      expect(response).toBeDefined();
      expect(response!.status).toBe(200);
      expect(response!.body).toMatchObject({ id: '123', name: 'Test User' });
      expect(response!.latency).toBe(50);
    });

    it('should return 404 for unknown request patterns', () => {
      virtualizer.registerService({
        name: 'user-service',
        baseUrl: 'https://api.test.com',
        behaviors: [{
          requestPattern: 'GET /api/users/{id}',
          responseTemplate: { id: '123', name: 'Test User' },
          latency: 50,
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }],
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'User service',
          tags: []
        }
      });

      const response = virtualizer.simulateResponse('user-service', 'GET', '/api/posts/123');
      
      expect(response).toBeDefined();
      expect(response!.status).toBe(404);
      expect(response!.body).toMatchObject({ error: 'Behavior not found' });
    });

    it('should return null for unknown services', () => {
      const response = virtualizer.simulateResponse('unknown-service', 'GET', '/api/test');
      expect(response).toBeNull();
    });
  });

  describe('Session Management', () => {
    it('should manage virtualization sessions', () => {
      const sessionId1 = virtualizer.startSession({ testId: 'test-1' });
      const sessionId2 = virtualizer.startSession({ testId: 'test-2' });
      
      expect(sessionId1).toBeDefined();
      expect(sessionId2).toBeDefined();
      expect(sessionId1).not.toBe(sessionId2);
      
      let metrics = virtualizer.getMetrics();
      expect(metrics.activeSessions).toBe(2);
      
      virtualizer.endSession(sessionId1);
      metrics = virtualizer.getMetrics();
      expect(metrics.activeSessions).toBe(1);
      
      virtualizer.endSession(sessionId2);
      metrics = virtualizer.getMetrics();
      expect(metrics.activeSessions).toBe(0);
    });
  });

  describe('Metrics and Statistics', () => {
    it('should provide accurate metrics', () => {
      virtualizer.registerService({
        name: 'test-service',
        baseUrl: 'https://api.test.com',
        behaviors: [],
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'Test service',
          tags: []
        }
      });

      const sessionId = virtualizer.startSession();
      
      virtualizer.captureTraffic({
        method: 'GET',
        url: '/api/test',
        headers: {},
        response: { status: 200, headers: {}, body: {}, latency: 100 },
        metadata: { source: 'test', sessionId }
      });

      virtualizer.captureTraffic({
        method: 'POST',
        url: '/api/test',
        headers: {},
        response: { status: 500, headers: {}, body: {}, latency: 50 },
        metadata: { source: 'test', sessionId }
      });

      const metrics = virtualizer.getMetrics();
      
      expect(metrics.servicesCount).toBe(1);
      expect(metrics.activeSessions).toBe(1);
      expect(metrics.trafficCaptures).toBe(2);
      expect(metrics.averageLatency).toBe(75); // (100 + 50) / 2
      expect(metrics.errorRate).toBe(0.5); // 1 error out of 2 requests
      
      virtualizer.endSession(sessionId);
    });
  });

  describe('Export and Import', () => {
    it('should export and import virtualization data', () => {
      virtualizer.registerService({
        name: 'export-test-service',
        baseUrl: 'https://api.test.com',
        behaviors: [{
          requestPattern: 'GET /api/test',
          responseTemplate: { message: 'Exported' },
          latency: 25,
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }],
        version: '1.0.0',
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: 'Export test service',
          tags: ['export', 'test']
        }
      });

      const exportedData = virtualizer.export();
      
      expect(exportedData.services).toHaveLength(1);
      expect(exportedData.services[0].name).toBe('export-test-service');
      expect(exportedData.exportedAt).toBeDefined();
      
      // Create new virtualizer and import data
      const newVirtualizer = new ServiceVirtualizer();
      newVirtualizer.import({
        services: exportedData.services
      });

      const importedService = newVirtualizer.getService('export-test-service');
      expect(importedService).toBeDefined();
      expect(importedService!.name).toBe('export-test-service');
      expect(importedService!.version).toBe('1.0.0');
    });
  });
});
