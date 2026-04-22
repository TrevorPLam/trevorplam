import { RealtimeMonitoringServer } from './realtime-server';
import { SSEMonitoringServer } from './sse-server';
import { RealtimeEvent, TestProgress } from './realtime-server';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface RealtimeManagerConfig {
  websocketPort?: number;
  ssePort?: number;
  enableWebSocket?: boolean;
  enableSSE?: boolean;
  metricsInterval?: number;
  autoStartDemo?: boolean;
}

export interface ManagerStats {
  websocket: {
    enabled: boolean;
    port: number;
    clients: number;
    activeTests: number;
  };
  sse: {
    enabled: boolean;
    port: number;
    clients: number;
  };
  uptime: number;
  memory: NodeJS.MemoryUsage;
  timestamp: string;
}

/**
 * Unified manager for real-time monitoring servers
 */
export class RealtimeMonitoringManager {
  private config: Required<RealtimeManagerConfig>;
  private wsServer?: RealtimeMonitoringServer;
  private sseServer?: SSEMonitoringServer;
  private metricsInterval?: NodeJS.Timeout;
  private startTime: number;
  private isRunning = false;

  constructor(config: RealtimeManagerConfig = {}) {
    this.startTime = Date.now();
    this.config = {
      websocketPort: config.websocketPort || 8080,
      ssePort: config.ssePort || 8081,
      enableWebSocket: config.enableWebSocket ?? true,
      enableSSE: config.enableSSE ?? true,
      metricsInterval: config.metricsInterval || 30000, // 30 seconds
      autoStartDemo: config.autoStartDemo ?? false
    };
  }

  /**
   * Start the monitoring servers
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.log('Real-time monitoring manager is already running');
      return;
    }

    console.log('Starting Real-time Monitoring Manager...');
    console.log('=====================================');

    try {
      // Start WebSocket server if enabled
      if (this.config.enableWebSocket) {
        this.wsServer = new RealtimeMonitoringServer(this.config.websocketPort);
        await this.wsServer.start();
        console.log(`WebSocket server started on port ${this.config.websocketPort}`);
      }

      // Start SSE server if enabled
      if (this.config.enableSSE) {
        this.sseServer = new SSEMonitoringServer(this.config.ssePort);
        await this.sseServer.start();
        console.log(`SSE server started on port ${this.config.ssePort}`);
      }

      // Start metrics broadcasting
      this.startMetricsBroadcasting();

      // Start demo if enabled
      if (this.config.autoStartDemo) {
        setTimeout(() => this.startDemo(), 2000);
      }

      this.isRunning = true;
      console.log('Real-time monitoring manager started successfully');
      console.log(`WebSocket: ws://localhost:${this.config.websocketPort}`);
      console.log(`SSE: http://localhost:${this.config.ssePort}/events`);

    } catch (error) {
      console.error('Failed to start monitoring manager:', error);
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop all monitoring servers
   */
  async stop(): Promise<void> {
    console.log('Stopping Real-time Monitoring Manager...');

    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = undefined;
    }

    if (this.wsServer) {
      this.wsServer.stop();
      this.wsServer = undefined;
    }

    if (this.sseServer) {
      this.sseServer.stop();
      this.sseServer = undefined;
    }

    this.isRunning = false;
    console.log('Real-time monitoring manager stopped');
  }

  /**
   * Broadcast event to all connected clients (WebSocket and SSE)
   */
  broadcast(event: RealtimeEvent): void {
    if (this.wsServer) {
      // WebSocket server has broadcast method
      (this.wsServer as any).broadcast(event);
    }

    if (this.sseServer) {
      // SSE server has broadcast method
      (this.sseServer as any).broadcast(event);
    }
  }

  /**
   * Start monitoring a test execution
   */
  startTestMonitoring(testFile: string): void {
    this.wsServer?.startTestMonitoring(testFile);
    this.sseServer?.startTestMonitoring(testFile);

    console.log(`Started monitoring: ${testFile}`);
  }

  /**
   * Update test progress
   */
  updateTestProgress(testFile: string, progress: Partial<TestProgress>): void {
    this.wsServer?.updateTestProgress(testFile, progress);
    this.sseServer?.updateTestProgress(testFile, progress);
  }

  /**
   * Complete test monitoring
   */
  completeTestMonitoring(testFile: string, status: 'passed' | 'failed' | 'skipped', error?: string): void {
    this.wsServer?.completeTestMonitoring(testFile, status, error);
    this.sseServer?.completeTestMonitoring(testFile, status, error);

    console.log(`Completed monitoring: ${testFile} (${status})`);
  }

  /**
   * Start periodic metrics broadcasting
   */
  private startMetricsBroadcasting(): void {
    this.metricsInterval = setInterval(() => {
      this.broadcastMetrics();
    }, this.config.metricsInterval);
  }

  /**
   * Broadcast current metrics to all clients
   */
  private async broadcastMetrics(): Promise<void> {
    try {
      const stats = this.getStats();
      
      this.broadcast({
        type: 'metrics_update',
        timestamp: new Date().toISOString(),
        data: {
          manager: stats,
          serverStatus: 'running'
        }
      });
    } catch (error) {
      console.error('Error broadcasting metrics:', error);
    }
  }

  /**
   * Start demo test monitoring
   */
  private startDemo(): void {
    console.log('Starting demo test monitoring...');

    const demoTests = [
      'tests/unit/utils.test.ts',
      'tests/components/MetricCard.test.ts',
      'tests/integration/api.test.ts',
      'tests/performance/load.test.ts',
      'tests/security/auth.test.ts'
    ];

    let testIndex = 0;
    const runNextTest = () => {
      if (!this.isRunning) return;

      const testFile = demoTests[testIndex % demoTests.length];
      this.startTestMonitoring(testFile);

      testIndex++;
      
      // Schedule next test
      setTimeout(runNextTest, Math.random() * 5000 + 3000); // 3-8 seconds interval
    };

    // Start first test
    runNextTest();
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): ManagerStats {
    const wsStats = this.wsServer?.getStats() || {
      clients: 0,
      activeTests: 0,
      uptime: 0,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    const sseStats = this.sseServer?.getStats() || {
      clients: 0,
      uptime: 0,
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    return {
      websocket: {
        enabled: this.config.enableWebSocket,
        port: this.config.websocketPort,
        clients: wsStats.clients,
        activeTests: wsStats.activeTests
      },
      sse: {
        enabled: this.config.enableSSE,
        port: this.config.ssePort,
        clients: sseStats.clients
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Save current configuration and stats
   */
  saveStats(filePath?: string): void {
    const stats = this.getStats();
    const defaultPath = 'tests/metrics/realtime-stats.json';
    const targetPath = filePath || defaultPath;
    
    try {
      writeFileSync(targetPath, JSON.stringify(stats, null, 2));
      console.log(`Stats saved to: ${targetPath}`);
    } catch (error) {
      console.error('Error saving stats:', error);
    }
  }

  /**
   * Check if manager is running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get manager configuration
   */
  getConfig(): Required<RealtimeManagerConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration (requires restart)
   */
  updateConfig(newConfig: Partial<RealtimeManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log('Configuration updated. Restart required for changes to take effect.');
  }
}

// CLI interface for running the manager
if (import.meta.url === `file://${process.argv[1]}`) {
  const manager = new RealtimeMonitoringManager({
    autoStartDemo: true // Start demo automatically
  });
  
  manager.start().then(() => {
    console.log('\nReal-time Monitoring Manager is running');
    console.log('Commands:');
    console.log('  stats - Show current statistics');
    console.log('  demo - Start demo test monitoring');
    console.log('  save - Save current statistics');
    console.log('  stop - Stop the manager');
    console.log('\nPress Ctrl+C to stop');
  });

  // Simple CLI interface
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      const command = chunk.toString().trim().toLowerCase();
      
      switch (command) {
        case 'stats':
          console.log('\nCurrent Statistics:');
          console.log(JSON.stringify(manager.getStats(), null, 2));
          break;
        case 'demo':
          console.log('Starting demo test monitoring...');
          // Demo is already running, just show message
          break;
        case 'save':
          manager.saveStats();
          break;
        case 'stop':
          manager.stop().then(() => {
            process.exit(0);
          });
          break;
        case 'help':
          console.log('Available commands: stats, demo, save, stop, help');
          break;
        default:
          if (command) {
            console.log(`Unknown command: ${command}`);
            console.log('Type "help" for available commands');
          }
      }
    }
  });

  process.on('SIGINT', () => {
    console.log('\nShutting down monitoring manager...');
    manager.stop().then(() => {
      process.exit(0);
    });
  });
}
