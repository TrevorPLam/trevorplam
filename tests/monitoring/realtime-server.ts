import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PerformanceMonitor, TestMetrics } from '../performance/performance-monitor';

export interface RealtimeEvent {
  type: 'test_start' | 'test_progress' | 'test_complete' | 'test_failure' | 'metrics_update';
  timestamp: string;
  data: any;
}

export interface TestProgress {
  testFile: string;
  status: 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  currentStep?: string;
  progress: number; // 0-100
  error?: string;
}

export class RealtimeMonitoringServer {
  private wss: WebSocketServer;
  private httpServer: any;
  private monitor: PerformanceMonitor;
  private clients: Set<WebSocket> = new Set();
  private activeTests: Map<string, TestProgress> = new Map();
  private port: number;

  constructor(port: number = 8080) {
    this.port = port;
    this.monitor = new PerformanceMonitor();
    this.httpServer = createServer();
    this.wss = new WebSocketServer({ server: this.httpServer });
    this.setupWebSocketServer();
    this.setupHttpServer();
  }

  /**
   * Start the real-time monitoring server
   */
  async start(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer.listen(this.port, () => {
        console.log(`Real-time monitoring server started on port ${this.port}`);
        console.log(`WebSocket: ws://localhost:${this.port}`);
        console.log(`HTTP: http://localhost:${this.port}/status`);
        resolve();
      });
    });
  }

  /**
   * Stop the monitoring server
   */
  stop(): void {
    this.wss.close();
    this.httpServer.close();
    console.log('Real-time monitoring server stopped');
  }

  /**
   * Setup WebSocket server for real-time communication
   */
  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New client connected to real-time monitoring');
      this.clients.add(ws);

      // Send current status to new client
      this.sendToClient(ws, {
        type: 'metrics_update',
        timestamp: new Date().toISOString(),
        data: {
          activeTests: Array.from(this.activeTests.values()),
          serverStatus: 'connected'
        }
      });

      ws.on('message', (message: string) => {
        try {
          const event = JSON.parse(message);
          this.handleClientMessage(ws, event);
        } catch (error) {
          console.error('Invalid message from client:', error);
        }
      });

      ws.on('close', () => {
        console.log('Client disconnected from real-time monitoring');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  /**
   * Setup HTTP server for status and health checks
   */
  private setupHttpServer(): void {
    this.httpServer.on('request', (req: any, res: any) => {
      if (req.url === '/status') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'running',
          clients: this.clients.size,
          activeTests: this.activeTests.size,
          timestamp: new Date().toISOString()
        }));
      } else if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'healthy',
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date().toISOString()
        }));
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });
  }

  /**
   * Handle messages from WebSocket clients
   */
  private handleClientMessage(ws: WebSocket, event: any): void {
    switch (event.type) {
      case 'subscribe':
        console.log('Client subscribed to real-time updates');
        break;
      case 'get_metrics':
        this.sendLatestMetrics(ws);
        break;
      case 'ping':
        this.sendToClient(ws, {
          type: 'pong',
          timestamp: new Date().toISOString(),
          data: {}
        });
        break;
      default:
        console.log('Unknown message type:', event.type);
    }
  }

  /**
   * Send event to all connected clients
   */
  private broadcast(event: RealtimeEvent): void {
    const message = JSON.stringify(event);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  /**
   * Send event to specific client
   */
  private sendToClient(client: WebSocket, event: RealtimeEvent): void {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(event));
    }
  }

  /**
   * Send latest metrics to a client
   */
  private async sendLatestMetrics(client: WebSocket): Promise<void> {
    try {
      const metrics = await this.monitor.collectTestMetrics();
      this.sendToClient(client, {
        type: 'metrics_update',
        timestamp: new Date().toISOString(),
        data: { metrics, activeTests: Array.from(this.activeTests.values()) }
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

    this.activeTests.set(testFile, progress);
    
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
    const existing = this.activeTests.get(testFile);
    if (!existing) return;

    const updated = { ...existing, ...progress };
    this.activeTests.set(testFile, updated);

    this.broadcast({
      type: 'test_progress',
      timestamp: new Date().toISOString(),
      data: updated
    });
  }

  /**
   * Complete test monitoring
   */
  completeTestMonitoring(testFile: string, status: 'passed' | 'failed' | 'skipped', error?: string): void {
    const existing = this.activeTests.get(testFile);
    if (!existing) return;

    const completed = {
      ...existing,
      status,
      progress: 100,
      error
    };

    this.activeTests.delete(testFile);

    this.broadcast({
      type: 'test_complete',
      timestamp: new Date().toISOString(),
      data: completed
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
        duration: Date.now() - (this.activeTests.get(testFile)?.duration || 0)
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
    }, 1000);
  }

  /**
   * Get server statistics
   */
  getStats(): any {
    return {
      clients: this.clients.size,
      activeTests: this.activeTests.size,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }
}

// CLI interface for running the server
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new RealtimeMonitoringServer();
  
  server.start().then(() => {
    console.log('Real-time monitoring server is running');
    console.log('Press Ctrl+C to stop');
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.stop();
    process.exit(0);
  });
}
