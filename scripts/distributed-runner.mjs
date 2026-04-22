#!/usr/bin/env node

import { createServer } from 'http';
import { createServer as createHttpsServer } from 'https';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const config = {
  role: process.env.ROLE || 'master',
  masterUrl: process.env.MASTER_URL || 'http://localhost:3001',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  apiPort: process.env.API_PORT || (process.env.ROLE === 'master' ? 3001 : 3002),
  workerCount: parseInt(process.env.WORKER_COUNT) || 4,
  heartbeatInterval: 30000, // 30 seconds
  taskTimeout: 300000, // 5 minutes
  maxRetries: 3,
  postgresUrl: process.env.POSTGRES_URL || 'postgresql://test_user:test_password@localhost:5432/test_results'
};

// Initialize Redis client
const redis = new Redis(config.redisUrl);

// Initialize PostgreSQL pool (only for master)
let pool;
if (config.role === 'master') {
  pool = new Pool({
    connectionString: config.postgresUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
}

// Event emitter for distributed coordination
const eventBus = new EventEmitter();

// Worker registry
const workers = new Map();

// Task queue and results
const taskQueue = [];
const taskResults = new Map();
const activeTasks = new Map();

class DistributedTestRunner {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isShuttingDown = false;
    this.setupGracefulShutdown();
  }

  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  setupGracefulShutdown() {
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      console.error('Uncaught exception:', error);
      this.shutdown('uncaughtException');
    });
  }

  async shutdown(signal) {
    console.log(`[${config.role}] Shutting down due to ${signal}...`);
    this.isShuttingDown = true;

    if (config.role === 'master') {
      await this.shutdownWorkers();
      await pool?.end();
    }

    await redis.quit();
    process.exit(0);
  }

  async start() {
    console.log(`[${config.role}] Starting distributed test runner...`);
    console.log(`[${config.role}] Session ID: ${this.sessionId}`);

    if (config.role === 'master') {
      await this.startMaster();
    } else {
      await this.startWorker();
    }
  }

  async startMaster() {
    console.log('[MASTER] Starting master orchestrator...');
    
    // Initialize database schema
    await this.initializeDatabase();
    
    // Start HTTP server
    const server = createServer(this.createMasterRouter());
    server.listen(config.apiPort, () => {
      console.log(`[MASTER] API server listening on port ${config.apiPort}`);
    });

    // Start worker monitoring
    this.startWorkerMonitoring();
    
    // Start task distribution
    this.startTaskDistribution();
    
    // Start result aggregation
    this.startResultAggregation();

    console.log('[MASTER] Master orchestrator started successfully');
  }

  async startWorker() {
    console.log('[WORKER] Starting worker node...');
    
    // Register with master
    await this.registerWithMaster();
    
    // Start HTTP server for worker API
    const server = createServer(this.createWorkerRouter());
    server.listen(config.apiPort, () => {
      console.log(`[WORKER] API server listening on port ${config.apiPort}`);
    });

    // Start heartbeat to master
    this.startHeartbeat();
    
    // Start task processing
    this.startTaskProcessing();

    console.log('[WORKER] Worker node started successfully');
  }

  createMasterRouter() {
    return async (req, res) => {
      const url = new URL(req.url, `http://localhost:${config.apiPort}`);
      
      try {
        // CORS headers
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
            await this.handleHealthCheck(req, res);
            break;
          case 'POST:/workers/register':
            await this.handleWorkerRegister(req, res);
            break;
          case 'POST:/workers/unregister':
            await this.handleWorkerUnregister(req, res);
            break;
          case 'GET:/workers':
            await this.handleListWorkers(req, res);
            break;
          case 'POST:/tasks':
            await this.handleCreateTask(req, res);
            break;
          case 'GET:/tasks':
            await this.handleListTasks(req, res);
            break;
          case 'POST:/tasks/execute':
            await this.handleExecuteTasks(req, res);
            break;
          case 'GET:/results':
            await this.handleGetResults(req, res);
            break;
          case 'GET:/status':
            await this.handleGetStatus(req, res);
            break;
          default:
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Route not found' }));
        }
      } catch (error) {
        console.error('[MASTER] Route error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    };
  }

  createWorkerRouter() {
    return async (req, res) => {
      const url = new URL(req.url, `http://localhost:${config.apiPort}`);
      
      try {
        // CORS headers
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
            await this.handleWorkerHealthCheck(req, res);
            break;
          case 'POST:/tasks/execute':
            await this.handleExecuteTask(req, res);
            break;
          case 'POST:/tasks/complete':
            await this.handleTaskComplete(req, res);
            break;
          case 'GET:/status':
            await this.handleWorkerStatus(req, res);
            break;
          default:
            res.writeHead(404);
            res.end(JSON.stringify({ error: 'Route not found' }));
        }
      } catch (error) {
        console.error('[WORKER] Route error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    };
  }

  async handleHealthCheck(req, res) {
    const status = {
      role: config.role,
      sessionId: this.sessionId,
      uptime: Date.now() - this.startTime,
      workers: workers.size,
      activeTasks: activeTasks.size,
      queuedTasks: taskQueue.length,
      timestamp: Date.now()
    };

    res.writeHead(200);
    res.end(JSON.stringify(status));
  }

  async handleWorkerRegister(req, res) {
    const body = await this.parseRequestBody(req);
    const workerId = body.workerId;
    
    if (!workerId) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Worker ID required' }));
      return;
    }

    const worker = {
      id: workerId,
      url: body.url,
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
      status: 'active',
      tasks: new Map(),
      capabilities: body.capabilities || [],
      resources: body.resources || {}
    };

    workers.set(workerId, worker);
    
    // Store in Redis for persistence
    await redis.hset('workers', workerId, JSON.stringify(worker));
    
    console.log(`[MASTER] Worker ${workerId} registered from ${body.url}`);
    
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, workerId }));
  }

  async handleWorkerUnregister(req, res) {
    const body = await this.parseRequestBody(req);
    const workerId = body.workerId;
    
    if (workers.has(workerId)) {
      workers.delete(workerId);
      await redis.hdel('workers', workerId);
      console.log(`[MASTER] Worker ${workerId} unregistered`);
    }
    
    res.writeHead(200);
    res.end(JSON.stringify({ success: true }));
  }

  async handleListWorkers(req, res) {
    const workerList = Array.from(workers.values()).map(worker => ({
      ...worker,
      tasks: worker.tasks.size
    }));
    
    res.writeHead(200);
    res.end(JSON.stringify(workerList));
  }

  async handleCreateTask(req, res) {
    const body = await this.parseRequestBody(req);
    const task = {
      id: this.generateTaskId(),
      type: body.type,
      command: body.command,
      args: body.args || [],
      priority: body.priority || 'normal',
      timeout: body.timeout || config.taskTimeout,
      retries: 0,
      maxRetries: body.maxRetries || config.maxRetries,
      createdAt: Date.now(),
      status: 'queued'
    };

    taskQueue.push(task);
    await redis.lpush('task_queue', JSON.stringify(task));
    
    console.log(`[MASTER] Task ${task.id} created: ${task.type}`);
    
    res.writeHead(201);
    res.end(JSON.stringify(task));
  }

  async handleListTasks(req, res) {
    const tasks = {
      queued: taskQueue.length,
      active: activeTasks.size,
      completed: taskResults.size
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(tasks));
  }

  async handleExecuteTasks(req, res) {
    const body = await this.parseRequestBody(req);
    const testConfig = body.config;
    
    if (!testConfig) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Test configuration required' }));
      return;
    }

    // Create tasks based on configuration
    const tasks = this.createTasksFromConfig(testConfig);
    
    for (const task of tasks) {
      taskQueue.push(task);
      await redis.lpush('task_queue', JSON.stringify(task));
    }
    
    console.log(`[MASTER] Created ${tasks.length} tasks from configuration`);
    
    res.writeHead(200);
    res.end(JSON.stringify({ 
      success: true, 
      tasksCreated: tasks.length,
      sessionId: this.sessionId 
    }));
  }

  async handleGetResults(req, res) {
    const url = new URL(req.url, `http://localhost:${config.apiPort}`);
    const sessionId = url.searchParams.get('session');
    
    if (sessionId) {
      // Get results for specific session
      const sessionResults = await this.getSessionResults(sessionId);
      res.writeHead(200);
      res.end(JSON.stringify(sessionResults));
    } else {
      // Get all results
      const allResults = Array.from(taskResults.values());
      res.writeHead(200);
      res.end(JSON.stringify(allResults));
    }
  }

  async handleGetStatus(req, res) {
    const status = {
      sessionId: this.sessionId,
      role: config.role,
      uptime: Date.now() - this.startTime,
      workers: workers.size,
      tasks: {
        queued: taskQueue.length,
        active: activeTasks.size,
        completed: taskResults.size
      },
      timestamp: Date.now()
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(status));
  }

  // Worker handlers
  async handleWorkerHealthCheck(req, res) {
    const status = {
      role: config.role,
      sessionId: this.sessionId,
      uptime: Date.now() - this.startTime,
      activeTasks: activeTasks.size,
      timestamp: Date.now()
    };

    res.writeHead(200);
    res.end(JSON.stringify(status));
  }

  async handleExecuteTask(req, res) {
    const body = await this.parseRequestBody(req);
    const task = body.task;
    
    if (!task) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Task required' }));
      return;
    }

    // Add task to active tasks
    activeTasks.set(task.id, {
      ...task,
      startedAt: Date.now(),
      status: 'running'
    });

    console.log(`[WORKER] Executing task ${task.id}: ${task.type}`);
    
    // Execute task in background
    this.executeTaskAsync(task);
    
    res.writeHead(200);
    res.end(JSON.stringify({ success: true, taskId: task.id }));
  }

  async handleTaskComplete(req, res) {
    const body = await this.parseRequestBody(req);
    const { taskId, result, error } = body;
    
    if (!taskId) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Task ID required' }));
      return;
    }

    const taskResult = {
      taskId,
      result,
      error,
      completedAt: Date.now(),
      workerId: process.env.WORKER_ID || 'unknown'
    };

    // Store result
    taskResults.set(taskId, taskResult);
    await redis.hset('task_results', taskId, JSON.stringify(taskResult));
    
    // Remove from active tasks
    activeTasks.delete(taskId);
    
    // Notify master
    await this.notifyMasterTaskComplete(taskResult);
    
    console.log(`[WORKER] Task ${taskId} completed`);
    
    res.writeHead(200);
    res.end(JSON.stringify({ success: true }));
  }

  async handleWorkerStatus(req, res) {
    const status = {
      role: config.role,
      sessionId: this.sessionId,
      uptime: Date.now() - this.startTime,
      activeTasks: Array.from(activeTasks.values()),
      timestamp: Date.now()
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(status));
  }

  // Helper methods
  async parseRequestBody(req) {
    return new Promise((resolve) => {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => resolve(JSON.parse(body)));
    });
  }

  generateTaskId() {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  createTasksFromConfig(config) {
    const tasks = [];
    
    // Create tasks based on test types
    if (config.testTypes) {
      for (const [testType, typeConfig] of Object.entries(config.testTypes)) {
        const task = {
          id: this.generateTaskId(),
          type: testType,
          command: 'npm',
          args: ['run', `test:${testType}`],
          priority: typeConfig.priority || 'normal',
          timeout: typeConfig.timeout || config.taskTimeout,
          retries: 0,
          maxRetries: config.maxRetries,
          createdAt: Date.now(),
          status: 'queued',
          config: typeConfig
        };
        tasks.push(task);
      }
    }
    
    return tasks;
  }

  async executeTaskAsync(task) {
    try {
      const { spawn } = await import('child_process');
      
      const child = spawn(task.command, task.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: { ...process.env, ...task.config?.env }
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => stdout += data);
      child.stderr.on('data', (data) => stderr += data);

      const result = await new Promise((resolve, reject) => {
        child.on('close', (code) => {
          resolve({
            exitCode: code,
            stdout,
            stderr,
            duration: Date.now() - task.startedAt
          });
        });

        child.on('error', reject);

        // Timeout handling
        setTimeout(() => {
          child.kill('SIGKILL');
          reject(new Error('Task timeout'));
        }, task.timeout);
      });

      // Notify master of completion
      await this.notifyMasterTaskComplete({
        taskId: task.id,
        result,
        completedAt: Date.now(),
        workerId: process.env.WORKER_ID || 'unknown'
      });

    } catch (error) {
      console.error(`[WORKER] Task ${task.id} failed:`, error);
      
      await this.notifyMasterTaskComplete({
        taskId: task.id,
        error: error.message,
        completedAt: Date.now(),
        workerId: process.env.WORKER_ID || 'unknown'
      });
    } finally {
      activeTasks.delete(task.id);
    }
  }

  async notifyMasterTaskComplete(taskResult) {
    try {
      const response = await fetch(`${config.masterUrl}/tasks/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskResult)
      });
      
      if (!response.ok) {
        console.error('[WORKER] Failed to notify master of task completion');
      }
    } catch (error) {
      console.error('[WORKER] Error notifying master:', error);
    }
  }

  async registerWithMaster() {
    const workerId = process.env.WORKER_ID || `worker-${Date.now()}`;
    process.env.WORKER_ID = workerId;
    
    const registration = {
      workerId,
      url: `http://localhost:${config.apiPort}`,
      capabilities: ['unit', 'integration', 'e2e', 'performance'],
      resources: {
        cpu: 4,
        memory: '8GB',
        disk: '50GB'
      }
    };

    try {
      const response = await fetch(`${config.masterUrl}/workers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registration)
      });

      if (response.ok) {
        console.log(`[WORKER] Registered with master as ${workerId}`);
      } else {
        throw new Error('Failed to register with master');
      }
    } catch (error) {
      console.error('[WORKER] Registration failed:', error);
      process.exit(1);
    }
  }

  startHeartbeat() {
    setInterval(async () => {
      try {
        await fetch(`${config.masterUrl}/workers/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workerId: process.env.WORKER_ID,
            timestamp: Date.now(),
            activeTasks: activeTasks.size
          })
        });
      } catch (error) {
        console.error('[WORKER] Heartbeat failed:', error);
      }
    }, config.heartbeatInterval);
  }

  startTaskProcessing() {
    setInterval(async () => {
      if (activeTasks.size < 2 && taskQueue.length > 0) { // Max 2 concurrent tasks per worker
        const taskData = await redis.brpop('task_queue', 1);
        if (taskData) {
          const task = JSON.parse(taskData[1]);
          await this.handleExecuteTask({ body: { task } }, { 
            writeHead: () => {}, 
            end: () => {} 
          });
        }
      }
    }, 1000);
  }

  startWorkerMonitoring() {
    setInterval(async () => {
      const now = Date.now();
      const deadWorkers = [];
      
      for (const [workerId, worker] of workers) {
        if (now - worker.lastHeartbeat > config.heartbeatInterval * 3) {
          deadWorkers.push(workerId);
        }
      }
      
      for (const workerId of deadWorkers) {
        console.log(`[MASTER] Worker ${workerId} appears dead, removing...`);
        workers.delete(workerId);
        await redis.hdel('workers', workerId);
        
        // Requeue tasks from dead worker
        await this.requeueWorkerTasks(workerId);
      }
    }, config.heartbeatInterval);
  }

  startTaskDistribution() {
    setInterval(async () => {
      if (taskQueue.length > 0 && workers.size > 0) {
        await this.distributeTasks();
      }
    }, 2000);
  }

  async distributeTasks() {
    const availableWorkers = Array.from(workers.values())
      .filter(worker => worker.status === 'active')
      .sort((a, b) => a.tasks.size - b.tasks.size);

    for (const worker of availableWorkers) {
      if (taskQueue.length === 0) break;
      if (worker.tasks.size >= 2) continue; // Max 2 tasks per worker

      const task = taskQueue.shift();
      if (task) {
        try {
          const response = await fetch(`${worker.url}/tasks/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task })
          });

          if (response.ok) {
            worker.tasks.set(task.id, task);
            activeTasks.set(task.id, task);
            console.log(`[MASTER] Assigned task ${task.id} to worker ${worker.id}`);
          } else {
            taskQueue.unshift(task); // Put back in queue
          }
        } catch (error) {
          console.error(`[MASTER] Failed to assign task to worker ${worker.id}:`, error);
          taskQueue.unshift(task); // Put back in queue
        }
      }
    }
  }

  startResultAggregation() {
    setInterval(async () => {
      if (taskResults.size > 0) {
        await this.aggregateResults();
      }
    }, 10000); // Aggregate every 10 seconds
  }

  async aggregateResults() {
    const results = Array.from(taskResults.values());
    
    // Store aggregated results in database
    for (const result of results) {
      await this.storeResult(result);
    }
    
    // Clean up old results (keep last 1000)
    if (taskResults.size > 1000) {
      const sortedResults = Array.from(taskResults.entries())
        .sort((a, b) => b[1].completedAt - a[1].completedAt);
      
      for (let i = 1000; i < sortedResults.length; i++) {
        taskResults.delete(sortedResults[i][0]);
        await redis.hdel('task_results', sortedResults[i][0]);
      }
    }
  }

  async storeResult(result) {
    if (!pool) return;
    
    try {
      await pool.query(`
        INSERT INTO test_results (session_id, task_id, worker_id, result, error, completed_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (task_id) DO UPDATE SET
          result = EXCLUDED.result,
          error = EXCLUDED.error,
          completed_at = EXCLUDED.completed_at
      `, [
        this.sessionId,
        result.taskId,
        result.workerId,
        JSON.stringify(result.result),
        result.error,
        new Date(result.completedAt)
      ]);
    } catch (error) {
      console.error('[MASTER] Failed to store result:', error);
    }
  }

  async getSessionResults(sessionId) {
    if (!pool) return [];
    
    try {
      const { rows } = await pool.query(`
        SELECT * FROM test_results 
        WHERE session_id = $1 
        ORDER BY completed_at DESC
      `, [sessionId]);
      
      return rows;
    } catch (error) {
      console.error('[MASTER] Failed to get session results:', error);
      return [];
    }
  }

  async initializeDatabase() {
    if (!pool) return;
    
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS test_results (
          id SERIAL PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          task_id VARCHAR(255) UNIQUE NOT NULL,
          worker_id VARCHAR(255) NOT NULL,
          result JSONB,
          error TEXT,
          completed_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )
        
        CREATE INDEX IF NOT EXISTS idx_test_results_session ON test_results(session_id)
        CREATE INDEX IF NOT EXISTS idx_test_results_task ON test_results(task_id)
        CREATE INDEX IF NOT EXISTS idx_test_results_completed ON test_results(completed_at)
      `);
      
      console.log('[MASTER] Database initialized');
    } catch (error) {
      console.error('[MASTER] Failed to initialize database:', error);
    }
  }

  async requeueWorkerTasks(workerId) {
    const worker = workers.get(workerId);
    if (!worker) return;

    for (const [taskId, task] of worker.tasks) {
      task.retries++;
      if (task.retries <= task.maxRetries) {
        taskQueue.push(task);
        console.log(`[MASTER] Requeued task ${taskId} (retry ${task.retries}/${task.maxRetries})`);
      } else {
        console.log(`[MASTER] Task ${taskId} exceeded max retries, marking as failed`);
        taskResults.set(taskId, {
          taskId,
          error: 'Task exceeded maximum retries',
          completedAt: Date.now(),
          workerId: 'dead_worker'
        });
      }
    }
  }

  async shutdownWorkers() {
    console.log('[MASTER] Shutting down all workers...');
    
    for (const [workerId, worker] of workers) {
      try {
        await fetch(`${worker.url}/shutdown`, { method: 'POST' });
      } catch (error) {
        console.error(`[MASTER] Failed to shutdown worker ${workerId}:`, error);
      }
    }
  }
}

// Start the distributed runner
const runner = new DistributedTestRunner();
runner.start().catch(error => {
  console.error('Failed to start distributed runner:', error);
  process.exit(1);
});
