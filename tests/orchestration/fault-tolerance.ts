import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { Pool } from 'pg';

export interface RetryPolicy {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  expectedRecoveryTime: number;
}

export interface HealthCheckConfig {
  interval: number;
  timeout: number;
  unhealthyThreshold: number;
  healthyThreshold: number;
}

export interface FaultToleranceConfig {
  retryPolicy: RetryPolicy;
  circuitBreaker: CircuitBreakerConfig;
  healthCheck: HealthCheckConfig;
  gracefulShutdown: boolean;
  timeoutMs: number;
}

export const CircuitBreakerState = {
  CLOSED: 'closed',
  OPEN: 'open',
  HALF_OPEN: 'half_open'
} as const;

export type CircuitBreakerState = typeof CircuitBreakerState[keyof typeof CircuitBreakerState];

export class CircuitBreaker {
  private state = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  private nextAttempt = 0;

  constructor(
    name: string,
    config: CircuitBreakerConfig,
    eventEmitter: EventEmitter
  ) {
    this.name = name;
    this.config = config;
    this.eventEmitter = eventEmitter;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new Error(`Circuit breaker ${this.name} is OPEN`);
      }
      this.state = CircuitBreakerState.HALF_OPEN;
      this.successCount = 0;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.expectedRecoveryTime) {
        this.state = CircuitBreakerState.CLOSED;
        this.eventEmitter.emit('circuitBreakerRecovered', this.name);
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
      this.nextAttempt = Date.now() + this.config.recoveryTimeout;
      this.eventEmitter.emit('circuitBreakerTripped', this.name);
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }

  getFailureCount(): number {
    return this.failureCount;
  }
}

export class RetryHandler {
  constructor(
    private policy: RetryPolicy,
    private eventEmitter: EventEmitter
  ) {}

  async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: any
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.policy.maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.calculateDelay(attempt);
          this.eventEmitter.emit('retryAttempt', {
            operationName,
            attempt,
            delay,
            lastError: lastError?.message,
            context
          });
          
          await this.sleep(delay);
        }

        const result = await operation();
        
        if (attempt > 0) {
          this.eventEmitter.emit('retrySuccess', {
            operationName,
            attempt,
            context
          });
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (!this.isRetryableError(lastError) || attempt === this.policy.maxRetries) {
          this.eventEmitter.emit('retryFailed', {
            operationName,
            attempt,
            error: lastError.message,
            context
          });
          throw lastError;
        }
      }
    }
    
    throw lastError!;
  }

  private calculateDelay(attempt: number): number {
    let delay = this.policy.baseDelay * Math.pow(this.policy.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, this.policy.maxDelay);
    
    if (this.policy.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  private isRetryableError(error: Error): boolean {
    return this.policy.retryableErrors.some(pattern => 
      error.message.includes(pattern) || error.constructor.name.includes(pattern)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class HealthChecker {
  private isHealthy: boolean = true;
  private consecutiveFailures: number = 0;
  private consecutiveSuccesses: number = 0;
  private lastCheck: number = 0;

  constructor(
    private name: string,
    private config: HealthCheckConfig,
    private eventEmitter: EventEmitter,
    private healthCheckFn: () => Promise<boolean>
  ) {}

  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    
    try {
      const healthy = await Promise.race([
        this.healthCheckFn(),
        this.createTimeoutPromise(this.config.timeout)
      ]);

      this.lastCheck = now;
      
      if (healthy) {
        this.onSuccess();
      } else {
        this.onFailure();
      }
      
      return healthy;
    } catch (error) {
      this.lastCheck = now;
      this.onFailure();
      return false;
    }
  }

  private onSuccess(): void {
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses++;
    
    if (!this.isHealthy && this.consecutiveSuccesses >= this.config.healthyThreshold) {
      this.isHealthy = true;
      this.eventEmitter.emit('healthRestored', this.name);
    }
  }

  private onFailure(): void {
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures++;
    
    if (this.isHealthy && this.consecutiveFailures >= this.config.unhealthyThreshold) {
      this.isHealthy = false;
      this.eventEmitter.emit('healthDegraded', this.name);
    }
  }

  private createTimeoutPromise(timeoutMs: number): Promise<boolean> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Health check timeout')), timeoutMs);
    });
  }

  isCurrentlyHealthy(): boolean {
    return this.isHealthy;
  }

  getLastCheck(): number {
    return this.lastCheck;
  }
}

export class FaultToleranceManager extends EventEmitter {
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private retryHandlers: Map<string, RetryHandler> = new Map();
  private healthCheckers: Map<string, HealthChecker> = new Map();
  private isShuttingDown: boolean = false;
  private healthCheckInterval: NodeJS.Timeout;

  constructor(
    private redis: Redis,
    private db: Pool,
    private config: FaultToleranceConfig
  ) {
    super();
  }

  async start(): Promise<void> {
    console.log('[FAULT_TOLERANCE] Starting fault tolerance manager...');
    
    // Start periodic health checks
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheck.interval);

    // Load existing fault tolerance state
    await this.loadState();

    console.log('[FAULT_TOLERANCE] Fault tolerance manager started');
    this.emit('started');
  }

  async stop(): Promise<void> {
    console.log('[FAULT_TOLERANCE] Stopping fault tolerance manager...');
    
    this.isShuttingDown = true;
    
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    await this.saveState();
    
    console.log('[FAULT_TOLERANCE] Fault tolerance manager stopped');
    this.emit('stopped');
  }

  createCircuitBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    const breakerConfig = config || this.config.circuitBreaker;
    const breaker = new CircuitBreaker(name, breakerConfig, this);
    this.circuitBreakers.set(name, breaker);
    return breaker;
  }

  createRetryHandler(name: string, policy?: RetryPolicy): RetryHandler {
    const retryPolicy = policy || this.config.retryPolicy;
    const handler = new RetryHandler(retryPolicy, this);
    this.retryHandlers.set(name, handler);
    return handler;
  }

  createHealthChecker(
    name: string, 
    healthCheckFn: () => Promise<boolean>,
    config?: HealthCheckConfig
  ): HealthChecker {
    const healthConfig = config || this.config.healthCheck;
    const checker = new HealthChecker(name, healthConfig, this, healthCheckFn);
    this.healthCheckers.set(name, checker);
    return checker;
  }

  async executeWithFaultTolerance<T>(
    operationName: string,
    operation: () => Promise<T>,
    options: {
      circuitBreaker?: string;
      retryHandler?: string;
      timeout?: number;
      context?: any;
    } = {}
  ): Promise<T> {
    const { circuitBreaker, retryHandler, timeout, context } = options;
    
    // Apply timeout if specified
    const operationWithTimeout = timeout 
      ? () => Promise.race([operation(), this.createTimeoutPromise(timeout)])
      : operation;

    // Apply circuit breaker if specified
    const operationWithCircuitBreaker = circuitBreaker
      ? () => this.getCircuitBreaker(circuitBreaker).execute(operationWithTimeout)
      : operationWithTimeout;

    // Apply retry handler if specified
    if (retryHandler) {
      return await this.getRetryHandler(retryHandler).executeWithRetry(
        operationWithCircuitBreaker,
        operationName,
        context
      );
    }

    return await operationWithCircuitBreaker();
  }

  async executeDistributedOperation<T>(
    operationName: string,
    operation: () => Promise<T>,
    workerId?: string,
    options: {
      retryOnWorkerFailure?: boolean;
      fallbackWorkers?: string[];
      context?: any;
    } = {}
  ): Promise<T> {
    const { retryOnWorkerFailure = true, fallbackWorkers = [], context } = options;

    try {
      return await this.executeWithFaultTolerance(operationName, operation, {
        circuitBreaker: workerId ? `worker-${workerId}` : 'default',
        retryHandler: workerId ? `worker-${workerId}` : 'default',
        timeout: this.config.timeoutMs,
        context
      });
    } catch (error) {
      if (retryOnWorkerFailure && fallbackWorkers.length > 0) {
        this.emit('workerFailure', { workerId, error, fallbackWorkers });
        
        // Try fallback workers
        for (const fallbackWorkerId of fallbackWorkers) {
          try {
            this.emit('fallbackAttempt', { originalWorker: workerId, fallbackWorker: fallbackWorkerId });
            
            return await this.executeWithFaultTolerance(
              `${operationName}-fallback-${fallbackWorkerId}`,
              operation,
              {
                circuitBreaker: `worker-${fallbackWorkerId}`,
                retryHandler: `worker-${fallbackWorkerId}`,
                timeout: this.config.timeoutMs,
                context: { ...context, fallbackWorker: fallbackWorkerId }
              }
            );
          } catch (fallbackError) {
            this.emit('fallbackFailed', { fallbackWorker: fallbackWorkerId, error: fallbackError });
            continue;
          }
        }
      }
      
      throw error;
    }
  }

  async handleWorkerFailure(workerId: string, error: Error): Promise<void> {
    console.log(`[FAULT_TOLERANCE] Handling worker failure: ${workerId}`, error.message);
    
    // Trip circuit breaker for this worker
    const circuitBreaker = this.getCircuitBreaker(`worker-${workerId}`);
    circuitBreaker.onFailure();
    
    // Mark worker as unhealthy
    const healthChecker = this.getHealthChecker(`worker-${workerId}`);
    if (healthChecker) {
      healthChecker.onFailure();
    }
    
    // Store failure information
    await this.redis.hset('worker_failures', workerId, JSON.stringify({
      timestamp: Date.now(),
      error: error.message,
      stack: error.stack
    }));
    
    this.emit('workerFailureHandled', { workerId, error });
  }

  async handleWorkerRecovery(workerId: string): Promise<void> {
    console.log(`[FAULT_TOLERANCE] Handling worker recovery: ${workerId}`);
    
    // Reset circuit breaker for this worker
    const circuitBreaker = this.getCircuitBreaker(`worker-${workerId}`);
    if (circuitBreaker.getState() === CircuitBreakerState.OPEN) {
      circuitBreaker.onSuccess();
    }
    
    // Mark worker as healthy
    const healthChecker = this.getHealthChecker(`worker-${workerId}`);
    if (healthChecker && !healthChecker.isCurrentlyHealthy()) {
      healthChecker.onSuccess();
    }
    
    // Clear failure information
    await this.redis.hdel('worker_failures', workerId);
    
    this.emit('workerRecovered', { workerId });
  }

  async getFaultToleranceStatus(): Promise<any> {
    const circuitBreakers = Array.from(this.circuitBreakers.entries()).map(([name, breaker]) => ({
      name,
      state: breaker.getState(),
      failureCount: breaker.getFailureCount()
    }));

    const healthCheckers = Array.from(this.healthCheckers.entries()).map(([name, checker]) => ({
      name,
      healthy: checker.isCurrentlyHealthy(),
      lastCheck: checker.getLastCheck()
    }));

    return {
      circuitBreakers,
      healthCheckers,
      isShuttingDown: this.isShuttingDown
    };
  }

  private getCircuitBreaker(name: string): CircuitBreaker {
    let breaker = this.circuitBreakers.get(name);
    if (!breaker) {
      breaker = this.createCircuitBreaker(name);
    }
    return breaker;
  }

  private getRetryHandler(name: string): RetryHandler {
    let handler = this.retryHandlers.get(name);
    if (!handler) {
      handler = this.createRetryHandler(name);
    }
    return handler;
  }

  private getHealthChecker(name: string): HealthChecker | undefined {
    return this.healthCheckers.get(name);
  }

  private async performHealthChecks(): Promise<void> {
    if (this.isShuttingDown) {
      return;
    }

    const healthCheckPromises = Array.from(this.healthCheckers.values()).map(
      checker => checker.checkHealth()
    );

    try {
      await Promise.allSettled(healthCheckPromises);
    } catch (error) {
      console.error('[FAULT_TOLERANCE] Health check error:', error);
    }
  }

  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Operation timeout after ${timeoutMs}ms`)), timeoutMs);
    });
  }

  private async loadState(): Promise<void> {
    try {
      // Load circuit breaker states
      const circuitBreakerStates = await this.redis.hgetall('circuit_breaker_states');
      for (const [name, state] of Object.entries(circuitBreakerStates)) {
        const data = JSON.parse(state);
        const breaker = this.getCircuitBreaker(name);
        // Restore circuit breaker state if needed
      }

      console.log('[FAULT_TOLERANCE] Loaded fault tolerance state');
    } catch (error) {
      console.error('[FAULT_TOLERANCE] Failed to load state:', error);
    }
  }

  private async saveState(): Promise<void> {
    try {
      // Save circuit breaker states
      const states: Record<string, string> = {};
      for (const [name, breaker] of this.circuitBreakers) {
        states[name] = JSON.stringify({
          state: breaker.getState(),
          failureCount: breaker.getFailureCount()
        });
      }
      await this.redis.hset('circuit_breaker_states', states);

      console.log('[FAULT_TOLERANCE] Saved fault tolerance state');
    } catch (error) {
      console.error('[FAULT_TOLERANCE] Failed to save state:', error);
    }
  }
}

// Default configurations
export const defaultRetryPolicy: RetryPolicy = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'timeout',
    'network',
    'connection'
  ]
};

export const defaultCircuitBreakerConfig: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeout: 60000,
  monitoringPeriod: 10000,
  expectedRecoveryTime: 3
};

export const defaultHealthCheckConfig: HealthCheckConfig = {
  interval: 30000,
  timeout: 5000,
  unhealthyThreshold: 2,
  healthyThreshold: 3
};

export const defaultFaultToleranceConfig: FaultToleranceConfig = {
  retryPolicy: defaultRetryPolicy,
  circuitBreaker: defaultCircuitBreakerConfig,
  healthCheck: defaultHealthCheckConfig,
  gracefulShutdown: true,
  timeoutMs: 300000
};
