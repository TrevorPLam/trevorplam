import { EventEmitter } from 'events';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import Redis from 'ioredis';
import { Pool } from 'pg';

export interface ShardConfig {
  id: string;
  testType: string;
  testFiles: string[];
  priority: 'low' | 'normal' | 'high';
  timeout: number;
  maxRetries: number;
  estimatedDuration: number;
  dependencies?: string[];
  resources?: {
    cpu: number;
    memory: string;
    disk: string;
  };
}

export interface WorkerCapability {
  workerId: string;
  capabilities: string[];
  currentLoad: number;
  maxCapacity: number;
  resources: {
    cpu: number;
    memory: string;
    disk: string;
  };
  lastHeartbeat: number;
  status: 'active' | 'busy' | 'offline';
}

export interface ShardAssignment {
  shardId: string;
  workerId: string;
  assignedAt: number;
  status: 'assigned' | 'running' | 'completed' | 'failed' | 'retrying';
  startedAt?: number;
  completedAt?: number;
  retryCount: number;
  result?: any;
  error?: string;
}

export class ShardOrchestrator extends EventEmitter {
  private redis: Redis;
  private db: Pool;
  private shards: Map<string, ShardConfig> = new Map();
  private workers: Map<string, WorkerCapability> = new Map();
  private assignments: Map<string, ShardAssignment> = new Map();
  private heartbeatInterval: NodeJS.Timeout;
  private rebalanceInterval: NodeJS.Timeout;
  private isRunning: boolean = false;

  constructor(
    redisUrl: string,
    postgresUrl: string,
    private options: {
      heartbeatInterval?: number;
      rebalanceInterval?: number;
      maxConcurrentShards?: number;
      retryDelay?: number;
    } = {}
  ) {
    super();
    this.redis = new Redis(redisUrl);
    this.db = new Pool({
      connectionString: postgresUrl,
      max: 10,
      idleTimeoutMillis: 30000,
    });

    this.options = {
      heartbeatInterval: 30000,
      rebalanceInterval: 10000,
      maxConcurrentShards: 50,
      retryDelay: 5000,
      ...options
    };
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Orchestrator is already running');
    }

    console.log('[SHARD_ORCHESTRATOR] Starting shard orchestration...');
    
    // Load existing state
    await this.loadState();
    
    // Start monitoring loops
    this.heartbeatInterval = setInterval(() => {
      this.checkWorkerHeartbeats();
    }, this.options.heartbeatInterval!);

    this.rebalanceInterval = setInterval(() => {
      this.rebalanceShards();
    }, this.options.rebalanceInterval!);

    this.isRunning = true;
    console.log('[SHARD_ORCHESTRATOR] Shard orchestration started');
    this.emit('started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('[SHARD_ORCHESTRATOR] Stopping shard orchestration...');
    
    clearInterval(this.heartbeatInterval);
    clearInterval(this.rebalanceInterval);
    
    await this.saveState();
    await this.redis.quit();
    await this.db.end();
    
    this.isRunning = false;
    console.log('[SHARD_ORCHESTRATOR] Shard orchestration stopped');
    this.emit('stopped');
  }

  async createShard(config: Omit<ShardConfig, 'id'>): Promise<string> {
    const shard: ShardConfig = {
      id: this.generateShardId(),
      ...config
    };

    this.shards.set(shard.id, shard);
    await this.saveShard(shard);
    
    console.log(`[SHARD_ORCHESTRATOR] Created shard ${shard.id} for ${config.testType}`);
    this.emit('shardCreated', shard);
    
    // Try to assign immediately
    await this.assignShard(shard.id);
    
    return shard.id;
  }

  async createShardsFromTestSuite(testSuite: any): Promise<string[]> {
    const shardIds: string[] = [];
    
    // Group tests by type and create shards
    const testTypes = Object.keys(testSuite.testTypes || {});
    
    for (const testType of testTypes) {
      const typeConfig = testSuite.testTypes[testType];
      const testFiles = await this.getTestFilesForType(testType);
      
      // Split tests into shards based on historical timing data
      const shardConfigs = await this.createOptimalShards(testType, testFiles, typeConfig);
      
      for (const config of shardConfigs) {
        const shardId = await this.createShard(config);
        shardIds.push(shardId);
      }
    }
    
    console.log(`[SHARD_ORCHESTRATOR] Created ${shardIds.length} shards from test suite`);
    return shardIds;
  }

  async registerWorker(workerCapability: WorkerCapability): Promise<void> {
    this.workers.set(workerCapability.workerId, workerCapability);
    await this.saveWorker(workerCapability);
    
    console.log(`[SHARD_ORCHESTRATOR] Registered worker ${workerCapability.workerId}`);
    this.emit('workerRegistered', workerCapability);
    
    // Try to assign pending shards
    await this.rebalanceShards();
  }

  async updateWorkerHeartbeat(workerId: string, activeTasks: number): Promise<void> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return;
    }

    worker.lastHeartbeat = Date.now();
    worker.currentLoad = activeTasks;
    worker.status = activeTasks < worker.maxCapacity ? 'active' : 'busy';
    
    await this.saveWorker(worker);
  }

  async completeShard(shardId: string, result: any, error?: string): Promise<void> {
    const assignment = this.assignments.get(shardId);
    if (!assignment) {
      console.error(`[SHARD_ORCHESTRATOR] No assignment found for shard ${shardId}`);
      return;
    }

    assignment.status = error ? 'failed' : 'completed';
    assignment.completedAt = Date.now();
    assignment.result = result;
    assignment.error = error;

    await this.saveAssignment(assignment);
    
    // Update worker load
    const worker = this.workers.get(assignment.workerId);
    if (worker) {
      worker.currentLoad = Math.max(0, worker.currentLoad - 1);
      await this.saveWorker(worker);
    }

    console.log(`[SHARD_ORCHESTRATOR] Shard ${shardId} ${error ? 'failed' : 'completed'}`);
    this.emit(error ? 'shardFailed' : 'shardCompleted', { shardId, assignment, result, error });

    // If failed and retries available, retry
    if (error && assignment.retryCount < this.getShardConfig(shardId)?.maxRetries!) {
      await this.retryShard(shardId);
    } else {
      // Remove from active assignments
      this.assignments.delete(shardId);
      this.shards.delete(shardId);
      
      // Try to assign next pending shard
      await this.rebalanceShards();
    }
  }

  private async assignShard(shardId: string): Promise<boolean> {
    const shard = this.shards.get(shardId);
    if (!shard) {
      return false;
    }

    // Find best worker for this shard
    const bestWorker = this.findBestWorker(shard);
    if (!bestWorker) {
      console.log(`[SHARD_ORCHESTRATOR] No available worker for shard ${shardId}`);
      return false;
    }

    const assignment: ShardAssignment = {
      shardId,
      workerId: bestWorker.workerId,
      assignedAt: Date.now(),
      status: 'assigned',
      retryCount: 0
    };

    this.assignments.set(shardId, assignment);
    await this.saveAssignment(assignment);

    // Update worker load
    bestWorker.currentLoad++;
    bestWorker.status = 'busy';
    await this.saveWorker(bestWorker);

    console.log(`[SHARD_ORCHESTRATOR] Assigned shard ${shardId} to worker ${bestWorker.workerId}`);
    this.emit('shardAssigned', { shardId, workerId: bestWorker.workerId });

    // Notify worker
    await this.notifyWorker(bestWorker.workerId, 'assign', { shard, assignment });
    
    return true;
  }

  private findBestWorker(shard: ShardConfig): WorkerCapability | null {
    const availableWorkers = Array.from(this.workers.values())
      .filter(worker => 
        worker.status === 'active' &&
        worker.currentLoad < worker.maxCapacity &&
        worker.capabilities.includes(shard.testType) &&
        this.hasSufficientResources(worker, shard)
      )
      .sort((a, b) => {
        // Sort by current load (least loaded first)
        const loadA = a.currentLoad / a.maxCapacity;
        const loadB = b.currentLoad / b.maxCapacity;
        return loadA - loadB;
      });

    return availableWorkers[0] || null;
  }

  private hasSufficientResources(worker: WorkerCapability, shard: ShardConfig): boolean {
    if (!shard.resources) {
      return true;
    }

    const workerCpu = worker.resources.cpu;
    const workerMemory = parseInt(worker.resources.memory.replace('GB', ''));
    const shardCpu = shard.resources.cpu;
    const shardMemory = parseInt(shard.resources.memory.replace('GB', ''));

    return workerCpu >= shardCpu && workerMemory >= shardMemory;
  }

  private async retryShard(shardId: string): Promise<void> {
    const assignment = this.assignments.get(shardId);
    if (!assignment) {
      return;
    }

    assignment.status = 'retrying';
    assignment.retryCount++;

    await this.saveAssignment(assignment);
    
    console.log(`[SHARD_ORCHESTRATOR] Retrying shard ${shardId} (attempt ${assignment.retryCount})`);
    this.emit('shardRetrying', { shardId, retryCount: assignment.retryCount });

    // Wait before retry
    setTimeout(async () => {
      await this.assignShard(shardId);
    }, this.options.retryDelay! * Math.pow(2, assignment.retryCount - 1)); // Exponential backoff
  }

  private async rebalanceShards(): Promise<void> {
    const unassignedShards = Array.from(this.shards.values())
      .filter(shard => !this.assignments.has(shard.id));

    for (const shard of unassignedShards) {
      await this.assignShard(shard.id);
    }
  }

  private async checkWorkerHeartbeats(): Promise<void> {
    const now = Date.now();
    const deadWorkers: string[] = [];

    for (const [workerId, worker] of this.workers) {
      if (now - worker.lastHeartbeat > this.options.heartbeatInterval! * 3) {
        deadWorkers.push(workerId);
      }
    }

    for (const workerId of deadWorkers) {
      await this.handleWorkerFailure(workerId);
    }
  }

  private async handleWorkerFailure(workerId: string): Promise<void> {
    console.log(`[SHARD_ORCHESTRATOR] Worker ${workerId} appears to have failed`);

    // Mark worker as offline
    const worker = this.workers.get(workerId);
    if (worker) {
      worker.status = 'offline';
      await this.saveWorker(worker);
    }

    // Reassign shards from failed worker
    const failedAssignments = Array.from(this.assignments.values())
      .filter(assignment => assignment.workerId === workerId && assignment.status === 'running');

    for (const assignment of failedAssignments) {
      console.log(`[SHARD_ORCHESTRATOR] Reassigning shard ${assignment.shardId} from failed worker`);
      this.assignments.delete(assignment.shardId);
      await this.assignShard(assignment.shardId);
    }

    this.emit('workerFailed', workerId);
  }

  private async notifyWorker(workerId: string, action: string, data: any): Promise<void> {
    const worker = this.workers.get(workerId);
    if (!worker) {
      return;
    }

    try {
      await this.redis.publish(`worker:${workerId}:commands`, JSON.stringify({
        action,
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error(`[SHARD_ORCHESTRATOR] Failed to notify worker ${workerId}:`, error);
    }
  }

  private async createOptimalShards(
    testType: string, 
    testFiles: string[], 
    config: any
  ): Promise<Omit<ShardConfig, 'id'>[]> {
    const shards: Omit<ShardConfig, 'id'>[] = [];
    
    // Get historical timing data
    const timingData = await this.getHistoricalTimingData(testType);
    
    // Group tests into shards based on estimated duration
    const targetShardDuration = 60000; // 1 minute per shard
    let currentShard: string[] = [];
    let currentDuration = 0;

    for (const testFile of testFiles) {
      const estimatedDuration = timingData[testFile] || 5000; // Default 5 seconds
      
      if (currentDuration + estimatedDuration > targetShardDuration && currentShard.length > 0) {
        // Create shard with current tests
        shards.push({
          testType,
          testFiles: [...currentShard],
          priority: config.priority || 'normal',
          timeout: config.timeout || 300000,
          maxRetries: config.maxRetries || 3,
          estimatedDuration: currentDuration,
          resources: config.resources
        });
        
        currentShard = [];
        currentDuration = 0;
      }
      
      currentShard.push(testFile);
      currentDuration += estimatedDuration;
    }

    // Add remaining tests
    if (currentShard.length > 0) {
      shards.push({
        testType,
        testFiles: currentShard,
        priority: config.priority || 'normal',
        timeout: config.timeout || 300000,
        maxRetries: config.maxRetries || 3,
        estimatedDuration: currentDuration,
        resources: config.resources
      });
    }

    return shards;
  }

  private async getTestFilesForType(testType: string): Promise<string[]> {
    // This would integrate with your test discovery system
    // For now, return mock data
    const testFiles = {
      unit: [
        'tests/unit/utils.test.ts',
        'tests/unit/formatters.test.ts',
        'tests/unit/validators.test.ts'
      ],
      integration: [
        'tests/integration/api.test.ts',
        'tests/integration/database.test.ts'
      ],
      e2e: [
        'tests/e2e/user-journey.test.ts',
        'tests/e2e/checkout.test.ts'
      ],
      performance: [
        'tests/performance/load.test.ts',
        'tests/performance/memory.test.ts'
      ]
    };

    return testFiles[testType] || [];
  }

  private async getHistoricalTimingData(testType: string): Promise<Record<string, number>> {
    try {
      const { rows } = await this.db.query(`
        SELECT test_file, AVG(duration_ms) as avg_duration
        FROM task_metrics
        WHERE task_type = $1
        GROUP BY test_file
      `, [testType]);

      const timingData: Record<string, number> = {};
      for (const row of rows) {
        timingData[row.test_file] = row.avg_duration;
      }

      return timingData;
    } catch (error) {
      console.error('[SHARD_ORCHESTRATOR] Failed to get historical timing data:', error);
      return {};
    }
  }

  private getShardConfig(shardId: string): ShardConfig | undefined {
    return this.shards.get(shardId);
  }

  private generateShardId(): string {
    return `shard-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async saveShard(shard: ShardConfig): Promise<void> {
    await this.redis.hset('shards', shard.id, JSON.stringify(shard));
  }

  private async saveWorker(worker: WorkerCapability): Promise<void> {
    await this.redis.hset('workers', worker.workerId, JSON.stringify(worker));
  }

  private async saveAssignment(assignment: ShardAssignment): Promise<void> {
    await this.redis.hset('assignments', assignment.shardId, JSON.stringify(assignment));
  }

  private async loadState(): Promise<void> {
    try {
      // Load shards
      const shards = await this.redis.hgetall('shards');
      for (const [id, data] of Object.entries(shards)) {
        this.shards.set(id, JSON.parse(data));
      }

      // Load workers
      const workers = await this.redis.hgetall('workers');
      for (const [id, data] of Object.entries(workers)) {
        this.workers.set(id, JSON.parse(data));
      }

      // Load assignments
      const assignments = await this.redis.hgetall('assignments');
      for (const [id, data] of Object.entries(assignments)) {
        this.assignments.set(id, JSON.parse(data));
      }

      console.log(`[SHARD_ORCHESTRATOR] Loaded state: ${this.shards.size} shards, ${this.workers.size} workers, ${this.assignments.size} assignments`);
    } catch (error) {
      console.error('[SHARD_ORCHESTRATOR] Failed to load state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      // State is automatically saved when items are added/updated
      console.log('[SHARD_ORCHESTRATOR] State saved');
    } catch (error) {
      console.error('[SHARD_ORCHESTRATOR] Failed to save state:', error);
    }
  }

  // Public API methods
  async getStatus(): Promise<any> {
    return {
      isRunning: this.isRunning,
      shards: {
        total: this.shards.size,
        pending: Array.from(this.shards.values()).filter(s => !this.assignments.has(s.id)).length,
        running: Array.from(this.assignments.values()).filter(a => a.status === 'running').length,
        completed: Array.from(this.assignments.values()).filter(a => a.status === 'completed').length,
        failed: Array.from(this.assignments.values()).filter(a => a.status === 'failed').length
      },
      workers: {
        total: this.workers.size,
        active: Array.from(this.workers.values()).filter(w => w.status === 'active').length,
        busy: Array.from(this.workers.values()).filter(w => w.status === 'busy').length,
        offline: Array.from(this.workers.values()).filter(w => w.status === 'offline').length
      }
    };
  }

  async getWorkerStatus(workerId: string): Promise<WorkerCapability | null> {
    return this.workers.get(workerId) || null;
  }

  async getShardStatus(shardId: string): Promise<ShardAssignment | null> {
    return this.assignments.get(shardId) || null;
  }
}
