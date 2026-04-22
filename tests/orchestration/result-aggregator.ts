import { EventEmitter } from 'events';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { WebSocketServer } from 'ws';

export interface TestResult {
  sessionId: string;
  shardId: string;
  workerId: string;
  testType: string;
  testFile: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  duration: number;
  exitCode: number;
  stdout: string;
  stderr: string;
  error?: string;
  timestamp: number;
  metrics?: {
    memoryUsage: number;
    cpuUsage: number;
    diskUsage: number;
  };
}

export interface SessionSummary {
  sessionId: string;
  startTime: number;
  endTime?: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  totalDuration: number;
  workers: number;
  shards: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  testTypes: Record<string, {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    duration: number;
  }>;
}

export interface RealTimeMetrics {
  timestamp: number;
  activeWorkers: number;
  runningShards: number;
  completedTests: number;
  failedTests: number;
  averageTestDuration: number;
  throughput: number; // tests per second
  errorRate: number; // percentage
  resourceUtilization: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export class ResultAggregator extends EventEmitter {
  private redis: Redis;
  private db: Pool;
  private httpServer: any;
  private wsServer: WebSocketServer;
  private io: SocketIOServer;
  private results: Map<string, TestResult[]> = new Map();
  private sessions: Map<string, SessionSummary> = new Map();
  private metrics: RealTimeMetrics[] = [];
  private isRunning: boolean = false;
  private metricsInterval: NodeJS.Timeout;
  private cleanupInterval: NodeJS.Timeout;
  private options: {
    port?: number;
    metricsInterval?: number;
    cleanupInterval?: number;
    maxMetricsHistory?: number;
    maxResultHistory?: number;
  };

  constructor(
    redisUrl: string,
    postgresUrl: string,
    options: {
      port?: number;
      metricsInterval?: number;
      cleanupInterval?: number;
      maxMetricsHistory?: number;
      maxResultHistory?: number;
    } = {}
  ) {
    this.options = options;
    super();
    this.redis = new Redis(redisUrl);
    this.db = new Pool({
      connectionString: postgresUrl,
      max: 10,
      idleTimeoutMillis: 30000,
    });

    this.options = {
      port: 3003,
      metricsInterval: 5000, // 5 seconds
      cleanupInterval: 60000, // 1 minute
      maxMetricsHistory: 1000,
      maxResultHistory: 10000,
      ...options
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Result aggregator is already running');
    }

    console.log('[RESULT_AGGREGATOR] Starting result aggregation service...');

    // Create HTTP server for REST API
    this.httpServer = createServer(this.createRouter());
    this.httpServer.listen(this.options.port, () => {
      console.log(`[RESULT_AGGREGATOR] HTTP server listening on port ${this.options.port}`);
    });

    // Create WebSocket server for real-time updates
    this.wsServer = new WebSocketServer({ server: this.httpServer });
    this.setupWebSocketServer();

    // Create Socket.IO server for additional real-time features
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });
    this.setupSocketIO();

    // Load existing data
    await this.loadExistingData();

    // Start metrics collection
    this.metricsInterval = setInterval(() => {
      this.collectMetrics();
    }, this.options.metricsInterval!);

    // Start cleanup process
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldData();
    }, this.options.cleanupInterval!);

    this.isRunning = true;
    console.log('[RESULT_AGGREGATOR] Result aggregation service started');
    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('[RESULT_AGGREGATOR] Stopping result aggregation service...');

    clearInterval(this.metricsInterval);
    clearInterval(this.cleanupInterval);

    this.httpServer?.close();
    this.wsServer?.close();
    this.io?.close();

    await this.redis.quit();
    await this.db.end();

    this.isRunning = false;
    console.log('[RESULT_AGGREGATOR] Result aggregation service stopped');
    this.emit('stopped');
  }

  async addResult(result: TestResult): Promise<void> {
    // Store in memory
    if (!this.results.has(result.sessionId)) {
      this.results.set(result.sessionId, []);
    }
    this.results.get(result.sessionId)!.push(result);

    // Store in Redis for persistence
    await this.redis.lpush(`results:${result.sessionId}`, JSON.stringify(result));
    await this.redis.expire(`results:${result.sessionId}`, 86400); // 24 hours

    // Store in database for long-term storage
    await this.storeResultInDB(result);

    // Update session summary
    await this.updateSessionSummary(result);

    // Broadcast to connected clients
    this.broadcastResult(result);

    console.log(`[RESULT_AGGREGATOR] Added result for ${result.testFile} (${result.status})`);
    this.emit('resultAdded', result);
  }

  async createSession(sessionId: string, config: any): Promise<void> {
    const summary: SessionSummary = {
      sessionId,
      startTime: Date.now(),
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      totalDuration: 0,
      workers: config.workers || 0,
      shards: config.shards || 0,
      status: 'running',
      testTypes: {}
    };

    this.sessions.set(sessionId, summary);
    await this.redis.hset('sessions', sessionId, JSON.stringify(summary));

    console.log(`[RESULT_AGGREGATOR] Created session ${sessionId}`);
    this.emit('sessionCreated', summary);
  }

  async completeSession(sessionId: string, status: 'completed' | 'failed' | 'cancelled' = 'completed'): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.endTime = Date.now();
    session.status = status;
    session.totalDuration = session.endTime - session.startTime;

    await this.redis.hset('sessions', sessionId, JSON.stringify(session));
    await this.updateSessionInDB(session);

    console.log(`[RESULT_AGGREGATOR] Completed session ${sessionId} with status ${status}`);
    this.emit('sessionCompleted', session);
  }

  async getSessionResults(sessionId: string): Promise<TestResult[]> {
    return this.results.get(sessionId) || [];
  }

  async getSessionSummary(sessionId: string): Promise<SessionSummary | null> {
    return this.sessions.get(sessionId) || null;
  }

  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const latest = this.metrics[this.metrics.length - 1];
    return latest || this.createEmptyMetrics();
  }

  async getHistoricalMetrics(sessionId?: string, limit: number = 100): Promise<RealTimeMetrics[]> {
    if (sessionId) {
      // Filter metrics by session if needed
      return this.metrics.slice(-limit);
    }
    return this.metrics.slice(-limit);
  }

  private createRouter() {
    return async (req: any, res: any) => {
      const url = new URL(req.url, `http://localhost:${this.options.port}`);
      
      try {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.writeHead(200);
          res.end();
          return;
        }

        const route = `${req.method}:${url.pathname}`;
        
        switch (route) {
          case 'GET:/health':
            res.writeHead(200);
            res.end(JSON.stringify({ status: 'healthy', timestamp: Date.now() }));
            break;
          case 'GET:/metrics':
            const metrics = await this.getRealTimeMetrics();
            res.writeHead(200);
            res.end(JSON.stringify(metrics));
            break;
          case 'GET:/metrics/history':
            const history = await this.getHistoricalMetrics();
            res.writeHead(200);
            res.end(JSON.stringify(history));
            break;
          case 'GET:/sessions':
            const sessions = Array.from(this.sessions.values());
            res.writeHead(200);
            res.end(JSON.stringify(sessions));
            break;
          case 'GET:/sessions/:sessionId':
            const sessionId = url.pathname.split('/')[2];
            const session = await this.getSessionSummary(sessionId);
            if (session) {
              res.writeHead(200);
              res.end(JSON.stringify(session));
            } else {
              res.writeHead(404);
              res.end(JSON.stringify({ error: 'Session not found' }));
            }
            break;
          case 'GET:/sessions/:sessionId/results':
            const resultsSessionId = url.pathname.split('/')[2];
            const results = await this.getSessionResults(resultsSessionId);
            res.writeHead(200);
            res.end(JSON.stringify(results));
            break;
          case 'POST:/sessions':
            const body = await this.parseRequestBody(req);
            await this.createSession(body.sessionId, body.config);
            res.writeHead(201);
            res.end(JSON.stringify({ success: true }));
            break;
          case 'POST:/sessions/:sessionId/complete':
            const completeSessionId = url.pathname.split('/')[2];
            const completeBody = await this.parseRequestBody(req);
            await this.completeSession(completeSessionId, completeBody.status);
            res.writeHead(200);
            res.end(JSON.stringify({ success: true }));
            break;
          default:
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Route not found' }));
        }
      } catch (error) {
        console.error('[RESULT_AGGREGATOR] Route error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    };
  }

  private setupWebSocketServer(): void {
    this.wsServer.on('connection', (ws, req) => {
      console.log('[RESULT_AGGREGATOR] WebSocket client connected');

      // Send current metrics immediately
      this.sendMetricsToClient(ws);

      // Handle client messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleWebSocketMessage(ws, message);
        } catch (error) {
          console.error('[RESULT_AGGREGATOR] WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('[RESULT_AGGREGATOR] WebSocket client disconnected');
      });

      ws.on('error', (error) => {
        console.error('[RESULT_AGGREGATOR] WebSocket error:', error);
      });
    });
  }

  private setupSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log('[RESULT_AGGREGATOR] Socket.IO client connected');

      // Join room for real-time updates
      socket.on('subscribe', (data) => {
        const { sessionId, events } = data;
        if (sessionId) {
          socket.join(`session:${sessionId}`);
        }
        if (events) {
          events.forEach((event: string) => socket.join(event));
        }
        console.log(`[RESULT_AGGREGATOR] Client subscribed to ${sessionId || 'all sessions'}`);
      });

      socket.on('unsubscribe', (data) => {
        const { sessionId, events } = data;
        if (sessionId) {
          socket.leave(`session:${sessionId}`);
        }
        if (events) {
          events.forEach((event: string) => socket.leave(event));
        }
      });

      socket.on('disconnect', () => {
        console.log('[RESULT_AGGREGATOR] Socket.IO client disconnected');
      });
    });
  }

  private async handleWebSocketMessage(ws: any, message: any): Promise<void> {
    switch (message.type) {
      case 'subscribe':
        // Handle subscription to specific events
        break;
      case 'getMetrics':
        const metrics = await this.getRealTimeMetrics();
        ws.send(JSON.stringify({ type: 'metrics', data: metrics }));
        break;
      case 'getSessionResults':
        const results = await this.getSessionResults(message.sessionId);
        ws.send(JSON.stringify({ type: 'sessionResults', data: results }));
        break;
    }
  }

  private broadcastResult(result: TestResult): void {
    const message = JSON.stringify({ type: 'result', data: result });

    // Broadcast to WebSocket clients
    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });

    // Broadcast to Socket.IO clients
    this.io.emit('result', result);
    this.io.to(`session:${result.sessionId}`).emit('result', result);
  }

  private broadcastMetrics(metrics: RealTimeMetrics): void {
    const message = JSON.stringify({ type: 'metrics', data: metrics });

    // Broadcast to WebSocket clients
    this.wsServer.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message);
      }
    });

    // Broadcast to Socket.IO clients
    this.io.emit('metrics', metrics);
  }

  private sendMetricsToClient(ws: any): void {
    const metrics = this.createEmptyMetrics();
    ws.send(JSON.stringify({ type: 'metrics', data: metrics }));
  }

  private async collectMetrics(): Promise<void> {
    const now = Date.now();
    
    // Calculate current metrics
    const activeWorkers = await this.getActiveWorkerCount();
    const runningShards = await this.getRunningShardCount();
    const recentResults = await this.getRecentResults(60000); // Last minute
    
    const completedTests = recentResults.filter(r => r.status === 'passed').length;
    const failedTests = recentResults.filter(r => r.status === 'failed').length;
    const totalTests = completedTests + failedTests;
    
    const averageTestDuration = totalTests > 0 
      ? recentResults.reduce((sum, r) => sum + r.duration, 0) / totalTests 
      : 0;
    
    const throughput = totalTests / 60; // tests per second
    const errorRate = totalTests > 0 ? (failedTests / totalTests) * 100 : 0;

    const metrics: RealTimeMetrics = {
      timestamp: now,
      activeWorkers,
      runningShards,
      completedTests,
      failedTests,
      averageTestDuration,
      throughput,
      errorRate,
      resourceUtilization: await this.getResourceUtilization()
    };

    this.metrics.push(metrics);
    
    // Limit metrics history
    if (this.metrics.length > this.options.maxMetricsHistory!) {
      this.metrics = this.metrics.slice(-this.options.maxMetricsHistory!);
    }

    // Broadcast to clients
    this.broadcastMetrics(metrics);

    // Store in Redis
    await this.redis.lpush('metrics', JSON.stringify(metrics));
    await this.redis.ltrim('metrics', 0, this.options.maxMetricsHistory! - 1);
  }

  private async updateSessionSummary(result: TestResult): Promise<void> {
    let session = this.sessions.get(result.sessionId);
    
    if (!session) {
      // Create session if it doesn't exist
      session = {
        sessionId: result.sessionId,
        startTime: result.timestamp,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        totalDuration: 0,
        workers: 0,
        shards: 0,
        status: 'running',
        testTypes: {}
      };
      this.sessions.set(result.sessionId, session);
    }

    // Update counters
    session.totalTests++;
    session.totalDuration += result.duration;

    switch (result.status) {
      case 'passed':
        session.passedTests++;
        break;
      case 'failed':
        session.failedTests++;
        break;
      case 'skipped':
        session.skippedTests++;
        break;
    }

    // Update test type breakdown
    if (!session.testTypes[result.testType]) {
      session.testTypes[result.testType] = {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      };
    }
    
    const typeStats = session.testTypes[result.testType];
    typeStats.total++;
    typeStats.duration += result.duration;
    
    switch (result.status) {
      case 'passed':
        typeStats.passed++;
        break;
      case 'failed':
        typeStats.failed++;
        break;
      case 'skipped':
        typeStats.skipped++;
        break;
    }

    await this.redis.hset('sessions', result.sessionId, JSON.stringify(session));
  }

  private async storeResultInDB(result: TestResult): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO test_results (
          session_id, shard_id, worker_id, test_type, test_file, 
          status, duration_ms, exit_code, stdout, stderr, error, 
          timestamp, metrics
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT (session_id, test_file) DO UPDATE SET
          status = EXCLUDED.status,
          duration_ms = EXCLUDED.duration_ms,
          exit_code = EXCLUDED.exit_code,
          stdout = EXCLUDED.stdout,
          stderr = EXCLUDED.stderr,
          error = EXCLUDED.error,
          timestamp = EXCLUDED.timestamp,
          metrics = EXCLUDED.metrics
      `, [
        result.sessionId,
        result.shardId,
        result.workerId,
        result.testType,
        result.testFile,
        result.status,
        result.duration,
        result.exitCode,
        result.stdout,
        result.stderr,
        result.error,
        new Date(result.timestamp),
        JSON.stringify(result.metrics)
      ]);
    } catch (error) {
      console.error('[RESULT_AGGREGATOR] Failed to store result in database:', error);
    }
  }

  private async updateSessionInDB(session: SessionSummary): Promise<void> {
    try {
      await this.db.query(`
        INSERT INTO test_sessions (
          session_id, status, started_at, completed_at, 
          total_tests, completed_tests, failed_tests, 
          test_types, config
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (session_id) DO UPDATE SET
          status = EXCLUDED.status,
          completed_at = EXCLUDED.completed_at,
          total_tests = EXCLUDED.total_tests,
          completed_tests = EXCLUDED.completed_tests,
          failed_tests = EXCLUDED.failed_tests,
          test_types = EXCLUDED.test_types,
          config = EXCLUDED.config
      `, [
        session.sessionId,
        session.status,
        new Date(session.startTime),
        session.endTime ? new Date(session.endTime) : null,
        session.totalTests,
        session.passedTests,
        session.failedTests,
        JSON.stringify(session.testTypes),
        JSON.stringify({ workers: session.workers, shards: session.shards })
      ]);
    } catch (error) {
      console.error('[RESULT_AGGREGATOR] Failed to update session in database:', error);
    }
  }

  private async loadExistingData(): Promise<void> {
    try {
      // Load sessions
      const sessions = await this.redis.hgetall('sessions');
      for (const [id, data] of Object.entries(sessions)) {
        this.sessions.set(id, JSON.parse(data));
      }

      // Load recent metrics
      const metrics = await this.redis.lrange('metrics', 0, -1);
      this.metrics = metrics.map(m => JSON.parse(m));

      console.log(`[RESULT_AGGREGATOR] Loaded existing data: ${this.sessions.size} sessions, ${this.metrics.length} metrics`);
    } catch (error) {
      console.error('[RESULT_AGGREGATOR] Failed to load existing data:', error);
    }
  }

  private async cleanupOldData(): Promise<void> {
    try {
      // Clean up old result data from memory
      for (const [sessionId, results] of this.results) {
        if (results.length > this.options.maxResultHistory!) {
          this.results.set(sessionId, results.slice(-this.options.maxResultHistory!));
        }
      }

      // Clean up old metrics
      if (this.metrics.length > this.options.maxMetricsHistory!) {
        this.metrics = this.metrics.slice(-this.options.maxMetricsHistory!);
      }

      // Clean up completed sessions older than 24 hours
      const now = Date.now();
      const dayAgo = now - (24 * 60 * 60 * 1000);
      
      for (const [sessionId, session] of this.sessions) {
        if (session.endTime && session.endTime < dayAgo) {
          this.sessions.delete(sessionId);
          this.results.delete(sessionId);
          await this.redis.hdel('sessions', sessionId);
          await this.redis.del(`results:${sessionId}`);
        }
      }
    } catch (error) {
      console.error('[RESULT_AGGREGATOR] Failed to cleanup old data:', error);
    }
  }

  private async getActiveWorkerCount(): Promise<number> {
    try {
      const { rows } = await this.db.query(`
        SELECT COUNT(*) as count FROM worker_status 
        WHERE status = 'active' AND last_heartbeat > NOW() - INTERVAL '2 minutes'
      `);
      return rows[0].count;
    } catch (error) {
      return 0;
    }
  }

  private async getRunningShardCount(): Promise<number> {
    try {
      const { rows } = await this.db.query(`
        SELECT COUNT(*) as count FROM test_sessions 
        WHERE status = 'running'
      `);
      return rows[0].count;
    } catch (error) {
      return 0;
    }
  }

  private async getRecentResults(timeWindowMs: number): Promise<TestResult[]> {
    const cutoff = Date.now() - timeWindowMs;
    const recentResults: TestResult[] = [];

    for (const results of this.results.values()) {
      recentResults.push(...results.filter(r => r.timestamp > cutoff));
    }

    return recentResults;
  }

  private async getResourceUtilization(): Promise<{ cpu: number; memory: number; disk: number }> {
    // This would integrate with your monitoring system
    // For now, return mock data
    return {
      cpu: Math.random() * 100,
      memory: Math.random() * 100,
      disk: Math.random() * 100
    };
  }

  private createEmptyMetrics(): RealTimeMetrics {
    return {
      timestamp: Date.now(),
      activeWorkers: 0,
      runningShards: 0,
      completedTests: 0,
      failedTests: 0,
      averageTestDuration: 0,
      throughput: 0,
      errorRate: 0,
      resourceUtilization: { cpu: 0, memory: 0, disk: 0 }
    };
  }

  private async parseRequestBody(req: any): Promise<any> {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => resolve(JSON.parse(body)));
    });
  }
}
