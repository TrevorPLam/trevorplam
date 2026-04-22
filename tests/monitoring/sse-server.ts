import { createServer } from 'http';
import { PerformanceMonitor, TestMetrics } from '../performance/performance-monitor';
import { RealtimeEvent, TestProgress } from './realtime-server';

export interface SSEClient {
  id: string;
  response: any;
  lastPing: number;
}

export class SSEMonitoringServer {
  private httpServer: any;
  private monitor: PerformanceMonitor;
  private clients: Map<string, SSEClient> = new Map();
  private port: number;
  private pingInterval?: NodeJS.Timeout;

  constructor(port: number = 8081) {
    this.port = port;
    this.monitor = new PerformanceMonitor();
    this.httpServer = createServer();
    this.setupHttpServer();
    this.startPingInterval();
  }

  /**
   * Start the SSE monitoring server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.port, () => {
        console.log(`SSE monitoring server started on port ${this.port}`);
        console.log(`SSE endpoint: http://localhost:${this.port}/events`);
        console.log(`Status: http://localhost:${this.port}/status`);
        resolve();
      });
    });
  }

  /**
   * Stop the monitoring server
   */
  stop(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    // Close all client connections
    this.clients.forEach(client => {
      try {
        client.response.end();
      } catch (error) {
        // Client already closed
      }
    });
    
    this.httpServer.close();
    console.log('SSE monitoring server stopped');
  }

  /**
   * Setup HTTP server with SSE endpoint
   */
  private setupHttpServer(): void {
    this.httpServer.on('request', (req: any, res: any) => {
      const url = new URL(req.url, `http://localhost:${this.port}`);
      
      if (url.pathname === '/events') {
        this.handleSSEConnection(req, res);
      } else if (url.pathname === '/status') {
        this.handleStatusRequest(req, res);
      } else if (url.pathname === '/health') {
        this.handleHealthRequest(req, res);
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
  }

  /**
   * Handle new SSE connection
   */
  private handleSSEConnection(req: any, res: any): void {
    const clientId = this.generateClientId();
    
    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    console.log(`New SSE client connected: ${clientId}`);
    
    const client: SSEClient = {
      id: clientId,
      response: res,
      lastPing: Date.now()
    };
    
    this.clients.set(clientId, client);

    // Send initial connection event
    this.sendToClient(clientId, {
      type: 'connected',
      timestamp: new Date().toISOString(),
      data: {
        clientId,
        message: 'Connected to SSE monitoring stream'
      }
    });

    // Send current metrics
    this.sendLatestMetrics(clientId);

    // Handle client disconnect
    res.on('close', () => {
      console.log(`SSE client disconnected: ${clientId}`);
      this.clients.delete(clientId);
    });

    res.on('error', (error: any) => {
      console.error(`SSE client error (${clientId}):`, error);
      this.clients.delete(clientId);
    });
  }

  /**
   * Handle status requests
   */
  private handleStatusRequest(req: any, res: any): void {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      clients: this.clients.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Handle health check requests
   */
  private handleHealthRequest(req: any, res: any): void {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Send event to specific SSE client
   */
  private sendToClient(clientId: string, event: RealtimeEvent): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const data = `data: ${JSON.stringify(event)}\n\n`;
      client.response.write(data);
      client.lastPing = Date.now();
    } catch (error) {
      console.error(`Error sending to SSE client ${clientId}:`, error);
      this.clients.delete(clientId);
    }
  }

  /**
   * Broadcast event to all SSE clients
   */
  broadcast(event: RealtimeEvent): void {
    this.clients.forEach((client, clientId) => {
      this.sendToClient(clientId, event);
    });
  }

  /**
   * Send latest metrics to a client
   */
  private async sendLatestMetrics(clientId: string): Promise<void> {
    try {
      const metrics = await this.monitor.collectTestMetrics();
      this.sendToClient(clientId, {
        type: 'metrics_update',
        timestamp: new Date().toISOString(),
        data: { metrics }
      });
    } catch (error) {
      console.error('Error sending latest metrics:', error);
    }
  }

  /**
   * Start monitoring a test execution
   */
  startTestMonitoring(testFile: string): void {
    const progress: TestProgress = {
      testFile,
      status: 'running',
      duration: 0,
      progress: 0,
      currentStep: 'Initializing'
    };

    this.broadcast({
      type: 'test_start',
      timestamp: new Date().toISOString(),
      data: progress
    });

    // Start progress tracking
    this.startProgressTracking(testFile);
  }

  /**
   * Update test progress
   */
  updateTestProgress(testFile: string, progress: Partial<TestProgress>): void {
    this.broadcast({
      type: 'test_progress',
      timestamp: new Date().toISOString(),
      data: {
        testFile,
        ...progress
      }
    });
  }

  /**
   * Complete test monitoring
   */
  completeTestMonitoring(testFile: string, status: 'passed' | 'failed' | 'skipped', error?: string): void {
    this.broadcast({
      type: 'test_complete',
      timestamp: new Date().toISOString(),
      data: {
        testFile,
        status,
        progress: 100,
        error
      }
    });
  }

  /**
   * Simulate progress tracking for demonstration
   */
  private startProgressTracking(testFile: string): void {
    const steps = [
      'Initializing test environment',
      'Setting up test data',
      'Running test assertions',
      'Cleaning up resources',
      'Generating reports'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      const progress = Math.min(100, (currentStep + 1) * 20);
      const currentStepName = steps[Math.floor(currentStep / 1)] || 'Completing';

      this.updateTestProgress(testFile, {
        progress,
        currentStep: currentStepName,
        duration: Date.now() - 0
      });

      currentStep++;
      if (progress >= 100) {
        clearInterval(interval);
        // Randomly determine test result for demo
        const status = Math.random() > 0.2 ? 'passed' : 'failed';
        this.completeTestMonitoring(
          testFile, 
          status, 
          status === 'failed' ? 'Demo failure for testing' : undefined
        );
      }
    }, 1500);
  }

  /**
   * Start ping interval to keep connections alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const deadClients: string[] = [];

      this.clients.forEach((client, clientId) => {
        if (now - client.lastPing > 30000) { // 30 seconds timeout
          deadClients.push(clientId);
        } else {
          // Send ping
          this.sendToClient(clientId, {
            type: 'ping',
            timestamp: new Date().toISOString(),
            data: {}
          });
        }
      });

      // Remove dead clients
      deadClients.forEach(clientId => {
        console.log(`Removing dead SSE client: ${clientId}`);
        const client = this.clients.get(clientId);
        if (client) {
          try {
            client.response.end();
          } catch (error) {
            // Client already closed
          }
          this.clients.delete(clientId);
        }
      });
    }, 10000); // Every 10 seconds
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    return `sse_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get server statistics
   */
  getStats(): any {
    return {
      clients: this.clients.size,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}

// CLI interface for running the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new SSEMonitoringServer();
  
  server.start().then(() => {
    console.log('SSE monitoring server is running');
    console.log('Press Ctrl+C to stop');
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down SSE server...');
    server.stop();
    process.exit(0);
  });
}
