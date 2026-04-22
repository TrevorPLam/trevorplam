/**
 * Service Virtualization Layer
 * 
 * Provides comprehensive service virtualization capabilities for external dependencies
 * following 2026 enterprise standards with traffic capture, behavior modeling, and
 * intelligent service simulation.
 */

import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';

export interface ServiceBehavior {
  requestPattern: string;
  responseTemplate: any;
  latency: number;
  errorRate?: number;
  headers?: Record<string, string>;
  status: number;
}

export interface VirtualServiceConfig {
  name: string;
  baseUrl: string;
  behaviors: ServiceBehavior[];
  healthCheck?: {
    endpoint: string;
    interval: number;
    timeout: number;
  };
  version: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    description: string;
    tags: string[];
  };
}

export interface TrafficCapture {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: any;
  response: {
    status: number;
    headers: Record<string, string>;
    body?: any;
    latency: number;
  };
  metadata: {
    source: string;
    testId?: string;
    sessionId: string;
  };
}

/**
 * Core service virtualizer with traffic capture and behavior modeling
 */
export class ServiceVirtualizer extends EventEmitter {
  private virtualServices: Map<string, VirtualServiceConfig> = new Map();
  private trafficCaptures: TrafficCapture[] = [];
  private activeSessions: Map<string, string> = new Map();
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Register a new virtual service
   */
  registerService(config: VirtualServiceConfig): void {
    this.virtualServices.set(config.name, config);
    
    // Start health monitoring if configured
    if (config.healthCheck) {
      this.startHealthCheck(config);
    }
    
    this.emit('serviceRegistered', { service: config.name, version: config.version });
  }

  /**
   * Get virtual service configuration
   */
  getService(name: string): VirtualServiceConfig | undefined {
    return this.virtualServices.get(name);
  }

  /**
   * List all registered virtual services
   */
  listServices(): Array<{ name: string; version: string; status: 'healthy' | 'unhealthy' | 'unknown' }> {
    return Array.from(this.virtualServices.entries()).map(([name, config]) => ({
      name,
      version: config.version,
      status: this.getServiceHealth(name)
    }));
  }

  /**
   * Capture traffic for behavior modeling
   */
  captureTraffic(traffic: Omit<TrafficCapture, 'id' | 'timestamp'>): string {
    const capture: TrafficCapture = {
      ...traffic,
      id: randomUUID(),
      timestamp: new Date().toISOString()
    };
    
    this.trafficCaptures.push(capture);
    this.emit('trafficCaptured', capture);
    
    return capture.id;
  }

  /**
   * Get captured traffic for analysis
   */
  getCapturedTraffic(filter?: {
    service?: string;
    method?: string;
    sessionId?: string;
    timeRange?: { start: string; end: string };
  }): TrafficCapture[] {
    let filtered = this.trafficCaptures;
    
    if (filter?.service) {
      filtered = filtered.filter(t => t.url.includes(filter.service!));
    }
    
    if (filter?.method) {
      filtered = filtered.filter(t => t.method === filter.method);
    }
    
    if (filter?.sessionId) {
      filtered = filtered.filter(t => t.metadata.sessionId === filter.sessionId);
    }
    
    if (filter?.timeRange) {
      filtered = filtered.filter(t => 
        t.timestamp >= filter.timeRange!.start && t.timestamp <= filter.timeRange!.end
      );
    }
    
    return filtered;
  }

  /**
   * Generate behavior model from captured traffic
   */
  generateBehaviorModel(serviceName: string): ServiceBehavior[] {
    const traffic = this.getCapturedTraffic({ service: serviceName });
    const behaviors: ServiceBehavior[] = [];
    
    // Group by request pattern
    const patternGroups = new Map<string, TrafficCapture[]>();
    
    traffic.forEach(capture => {
      const pattern = this.extractRequestPattern(capture.url, capture.method);
      if (!patternGroups.has(pattern)) {
        patternGroups.set(pattern, []);
      }
      patternGroups.get(pattern)!.push(capture);
    });
    
    // Generate behaviors from patterns
    patternGroups.forEach((captures, pattern) => {
      const behavior = this.analyzeCapturesToBehavior(pattern, captures);
      behaviors.push(behavior);
    });
    
    return behaviors;
  }

  /**
   * Simulate service behavior based on request
   */
  simulateResponse(serviceName: string, method: string, url: string, body?: any): {
    status: number;
    headers: Record<string, string>;
    body: any;
    latency: number;
  } | null {
    const service = this.virtualServices.get(serviceName);
    if (!service) {
      return null;
    }
    
    const pattern = this.extractRequestPattern(url, method);
    const behavior = service.behaviors.find(b => b.requestPattern === pattern);
    
    if (!behavior) {
      return {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Behavior not found' },
        latency: 10
      };
    }
    
    // Simulate error rate
    if (behavior.errorRate && Math.random() < behavior.errorRate) {
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: { error: 'Simulated service error' },
        latency: behavior.latency
      };
    }
    
    // Generate response from template
    const response = this.generateResponseFromTemplate(behavior.responseTemplate, body);
    
    return {
      status: behavior.status,
      headers: behavior.headers || { 'Content-Type': 'application/json' },
      body: response,
      latency: behavior.latency
    };
  }

  /**
   * Start a new virtualization session
   */
  startSession(metadata?: Record<string, any>): string {
    const sessionId = randomUUID();
    this.activeSessions.set(sessionId, JSON.stringify(metadata || {}));
    
    this.emit('sessionStarted', { sessionId, metadata });
    
    return sessionId;
  }

  /**
   * End virtualization session
   */
  endSession(sessionId: string): void {
    this.activeSessions.delete(sessionId);
    this.emit('sessionEnded', { sessionId });
  }

  /**
   * Get virtualization metrics
   */
  getMetrics(): {
    servicesCount: number;
    activeSessions: number;
    trafficCaptures: number;
    averageLatency: number;
    errorRate: number;
  } {
    const traffic = this.trafficCaptures;
    const averageLatency = traffic.length > 0 
      ? traffic.reduce((sum, t) => sum + t.response.latency, 0) / traffic.length 
      : 0;
    
    const errorRate = traffic.length > 0
      ? traffic.filter(t => t.response.status >= 400).length / traffic.length
      : 0;
    
    return {
      servicesCount: this.virtualServices.size,
      activeSessions: this.activeSessions.size,
      trafficCaptures: traffic.length,
      averageLatency,
      errorRate
    };
  }

  /**
   * Clear all virtualization data
   */
  clear(): void {
    this.virtualServices.clear();
    this.trafficCaptures = [];
    this.activeSessions.clear();
    
    // Clear health check intervals
    this.healthCheckIntervals.forEach(interval => clearInterval(interval));
    this.healthCheckIntervals.clear();
    
    this.emit('cleared');
  }

  /**
   * Export virtualization configuration
   */
  export(): {
    services: VirtualServiceConfig[];
    trafficCaptures: TrafficCapture[];
    exportedAt: string;
  } {
    return {
      services: Array.from(this.virtualServices.values()),
      trafficCaptures: this.trafficCaptures,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Import virtualization configuration
   */
  import(data: {
    services: VirtualServiceConfig[];
    trafficCaptures?: TrafficCapture[];
  }): void {
    data.services.forEach(service => {
      this.registerService(service);
    });
    
    if (data.trafficCaptures) {
      this.trafficCaptures.push(...data.trafficCaptures);
    }
    
    this.emit('imported', { servicesCount: data.services.length });
  }

  private startHealthCheck(config: VirtualServiceConfig): void {
    if (!config.healthCheck) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await this.performHealthCheck(config);
        this.emit('healthCheck', { 
          service: config.name, 
          status: response.ok ? 'healthy' : 'unhealthy' 
        });
      } catch (error) {
        this.emit('healthCheck', { 
          service: config.name, 
          status: 'unhealthy', 
          error 
        });
      }
    }, config.healthCheck.interval);
    
    this.healthCheckIntervals.set(config.name, interval);
  }

  private async performHealthCheck(_config: VirtualServiceConfig): Promise<Response> {
    // Mock health check implementation
    return new Response('OK', { status: 200 });
  }

  private getServiceHealth(serviceName: string): 'healthy' | 'unhealthy' | 'unknown' {
    // Simplified health status
    return this.virtualServices.has(serviceName) ? 'healthy' : 'unknown';
  }

  private extractRequestPattern(url: string, method: string): string {
    // Extract pattern from URL (simplified)
    const urlPattern = url.replace(/\/\d+/g, '/{id}').replace(/\?.*$/, '');
    return `${method} ${urlPattern}`;
  }

  private analyzeCapturesToBehavior(pattern: string, captures: TrafficCapture[]): ServiceBehavior {
    const latencies = captures.map(c => c.response.latency);
    const averageLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    const errorRate = captures.filter(c => c.response.status >= 400).length / captures.length;
    
    // Extract response template from most common response
    const responseTemplate = this.extractResponseTemplate(captures);
    
    return {
      requestPattern: pattern,
      responseTemplate,
      latency: Math.round(averageLatency),
      errorRate: errorRate > 0 ? errorRate : undefined,
      status: captures[0].response.status,
      headers: captures[0].response.headers
    };
  }

  private extractResponseTemplate(captures: TrafficCapture[]): any {
    // Simplified template extraction - return first response as template
    return captures[0].response.body;
  }

  private generateResponseFromTemplate(template: any, _request?: any): any {
    // Simplified response generation - return template as-is
    // In a real implementation, this would handle dynamic values
    return typeof template === 'object' ? { ...template } : template;
  }
}

/**
 * Global service virtualizer instance
 */
export const serviceVirtualizer = new ServiceVirtualizer();

/**
 * Service virtualization middleware for Express-like frameworks
 */
export function createVirtualizationMiddleware(virtualizer: ServiceVirtualizer) {
  return (req: any, res: any, next: any) => {
    const sessionId = req.headers['x-virtualization-session'] as string;
    const serviceName = req.headers['x-virtual-service'] as string;
    
    if (serviceName && sessionId) {
      // Capture request
      virtualizer.captureTraffic({
        method: req.method,
        url: req.url,
        headers: req.headers,
        body: req.body,
        response: {
          status: 200, // Will be updated after response
          headers: {},
          body: undefined,
          latency: 0
        },
        metadata: {
          source: 'middleware',
          sessionId,
          testId: req.headers['x-test-id'] as string
        }
      });
      
      // Intercept response to capture latency
      const startTime = Date.now();
      const originalSend = res.send;
      res.send = function(body: any) {
        const latency = Date.now() - startTime;
        
        // Update captured traffic with response details
        const captures = virtualizer.getCapturedTraffic({ sessionId });
        if (captures.length > 0) {
          const lastCapture = captures[captures.length - 1];
          lastCapture.response = {
            status: res.statusCode,
            headers: res.getHeaders(),
            body,
            latency
          };
        }
        
        return originalSend.call(this, body);
      };
    }
    
    next();
  };
}
