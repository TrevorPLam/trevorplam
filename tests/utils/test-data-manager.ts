import { z } from 'zod';

/**
 * Test data interfaces with Zod validation
 */
export const MetricDataSchema = z.object({
  title: z.string().min(1),
  before: z.string().min(1),
  after: z.string().min(1),
  context: z.string().optional(),
  skillTag: z.string().optional(),
  caseStudySlug: z.string().optional()
});

export const CaseStudyDataSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  impact: z.string().min(1),
  client: z.string().min(1),
  duration: z.string().min(1),
  skills: z.array(z.string()).min(1)
});

export const TimelineDataSchema = z.object({
  year: z.number().min(2000).max(2030),
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.enum(['work', 'education', 'project', 'achievement'])
});

export const SkillDataSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  level: z.number().min(1).max(5),
  years: z.number().min(0)
});

export type MetricData = z.infer<typeof MetricDataSchema>;
export type CaseStudyData = z.infer<typeof CaseStudyDataSchema>;
export type TimelineData = z.infer<typeof TimelineDataSchema>;
export type SkillData = z.infer<typeof SkillDataSchema>;

/**
 * Factory interface for creating test data
 */
export interface Factory<T> {
  build(overrides?: Partial<T>): T;
  buildList(count: number, overrides?: Partial<T>): T[];
}

/**
 * Test data factory implementation
 */
export class TestDataFactory<T> implements Factory<T> {
  constructor(
    private readonly defaultData: T,
    private readonly schema?: z.ZodSchema<T>
  ) {}

  build(overrides: Partial<T> = {}): T {
    const data = { ...this.defaultData, ...overrides };
    
    if (this.schema) {
      const result = this.schema.safeParse(data);
      if (!result.success) {
        throw new Error(`Invalid test data: ${result.error.message}`);
      }
      return result.data;
    }
    
    return data;
  }

  buildList(count: number, overrides: Partial<T> = {}): T[] {
    return Array.from({ length: count }, (_, index) => 
      this.build({ ...overrides, ...(typeof overrides === 'object' && 'id' in overrides ? {} : { id: index + 1 }) })
    );
  }
}

/**
 * Test data manager with isolation and cleanup
 */
export class TestDataManager {
  private static instance: TestDataManager;
  private readonly dataRegistry: Map<string, any[]> = new Map();
  private readonly cleanupCallbacks: Map<string, Array<() => Promise<void>>> = new Map();

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }

  /**
   * Create isolated data set for a test
   */
  static async createIsolatedDataSet<T>(factory: Factory<T>): Promise<{
    data: T;
    cleanup: () => Promise<void>;
    testId: string;
  }> {
    const manager = TestDataManager.getInstance();
    const testId = `test-${Date.now()}-${Math.random()}`;
    const data = factory.build();

    // Register data for cleanup
    manager.registerData(testId, data);

    return {
      data,
      cleanup: () => manager.cleanupTestData(testId),
      testId
    };
  }

  /**
   * Create multiple isolated data sets
   */
  static async createIsolatedDataSets<T>(factory: Factory<T>, count: number): Promise<{
    data: T[];
    cleanup: () => Promise<void>;
    testId: string;
  }> {
    const manager = TestDataManager.getInstance();
    const testId = `test-${Date.now()}-${Math.random()}`;
    const data = factory.buildList(count);

    // Register data for cleanup
    manager.registerData(testId, data);

    return {
      data,
      cleanup: () => manager.cleanupTestData(testId),
      testId
    };
  }

  /**
   * Register data for cleanup tracking
   */
  private registerData(testId: string, data: any): void {
    if (!this.dataRegistry.has(testId)) {
      this.dataRegistry.set(testId, []);
    }
    this.dataRegistry.get(testId)!.push(data);
  }

  /**
   * Register cleanup callback
   */
  registerCleanup(testId: string, callback: () => Promise<void>): void {
    if (!this.cleanupCallbacks.has(testId)) {
      this.cleanupCallbacks.set(testId, []);
    }
    this.cleanupCallbacks.get(testId)!.push(callback);
  }

  /**
   * Cleanup test data and callbacks
   */
  async cleanupTestData(testId: string): Promise<void> {
    // Execute cleanup callbacks
    const callbacks = this.cleanupCallbacks.get(testId) || [];
    for (const callback of callbacks.reverse()) {
      try {
        await callback();
      } catch (error) {
        console.warn(`Cleanup callback failed for test ${testId}:`, error);
      }
    }

    // Remove data from registry
    this.dataRegistry.delete(testId);
    this.cleanupCallbacks.delete(testId);
  }

  /**
   * Cleanup all test data (emergency cleanup)
   */
  async cleanupAll(): Promise<void> {
    const allTestIds = Array.from(this.dataRegistry.keys());
    
    for (const testId of allTestIds) {
      await this.cleanupTestData(testId);
    }
  }

  /**
   * Get data statistics
   */
  getStats(): { activeTests: number; totalDataItems: number; pendingCleanups: number } {
    const activeTests = this.dataRegistry.size;
    const totalDataItems = Array.from(this.dataRegistry.values())
      .reduce((total, data) => total + data.length, 0);
    const pendingCleanups = Array.from(this.cleanupCallbacks.values())
      .reduce((total, callbacks) => total + callbacks.length, 0);

    return { activeTests, totalDataItems, pendingCleanups };
  }

  /**
   * Validate data isolation
   */
  validateIsolation(): string[] {
    const issues: string[] = [];
    const stats = this.getStats();

    if (stats.activeTests > 100) {
      issues.push(`High number of active tests (${stats.activeTests}) - potential memory leak`);
    }

    if (stats.totalDataItems > 1000) {
      issues.push(`High number of data items (${stats.totalDataItems}) - potential memory leak`);
    }

    if (stats.pendingCleanups > 50) {
      issues.push(`High number of pending cleanups (${stats.pendingCleanups}) - cleanup bottleneck`);
    }

    return issues;
  }
}

/**
 * Predefined factories for common test data
 */
export const TestDataFactories = {
  /**
   * Metric data factory
   */
  metric: new TestDataFactory<MetricData>(
    {
      title: 'Test Metric',
      before: '100',
      after: '200',
      context: 'Test context description',
      skillTag: 'Test Skill',
      caseStudySlug: 'test-case-study'
    },
    MetricDataSchema
  ),

  /**
   * Case study data factory
   */
  caseStudy: new TestDataFactory<CaseStudyData>(
    {
      title: 'Test Case Study',
      slug: 'test-case-study',
      description: 'A comprehensive test case study description',
      impact: 'Significant positive impact on test outcomes',
      client: 'Test Client Organization',
      duration: '3 months',
      skills: ['Testing', 'Quality Assurance', 'Automation']
    },
    CaseStudyDataSchema
  ),

  /**
   * Timeline data factory
   */
  timeline: new TestDataFactory<TimelineData>(
    {
      year: 2024,
      title: 'Test Timeline Event',
      description: 'A significant event in the test timeline',
      type: 'project'
    },
    TimelineDataSchema
  ),

  /**
   * Skill data factory
   */
  skill: new TestDataFactory<SkillData>(
    {
      name: 'Test Skill',
      category: 'Testing',
      level: 4,
      years: 3
    },
    SkillDataSchema
  )
};

/**
 * Utility for running tests with isolated data
 */
export const withIsolatedData = async <T, R>(
  factory: Factory<T>,
  testFn: (data: T) => Promise<R>
): Promise<R> => {
  const { data, cleanup } = await TestDataManager.createIsolatedDataSet(factory);
  
  try {
    return await testFn(data);
  } finally {
    await cleanup();
  }
};

/**
 * Utility for running tests with multiple isolated data sets
 */
export const withIsolatedDataSets = async <T, R>(
  factory: Factory<T>,
  count: number,
  testFn: (data: T[]) => Promise<R>
): Promise<R> => {
  const { data, cleanup } = await TestDataManager.createIsolatedDataSets(factory, count);
  
  try {
    return await testFn(data);
  } finally {
    await cleanup();
  }
};

/**
 * Shared state detection utilities
 */
export class SharedStateDetector {
  /**
   * Detect shared variables in test code
   */
  static detectSharedVariables(testCode: string): string[] {
    const sharedPatterns: string[] = [];
    
    // Check for shared variable declarations
    const sharedVarMatches = testCode.match(/let\s+(container|page|context|data|mock|stub)\s*:/g);
    if (sharedVarMatches) {
      sharedPatterns.push(...sharedVarMatches.map(match => 
        `Shared variable detected: ${match.replace(/let\s+/, '')}`
      ));
    }

    // Check for global variable usage
    const globalVarMatches = testCode.match(/global\.\w+/g);
    if (globalVarMatches) {
      sharedPatterns.push(...globalVarMatches.map(match => 
        `Global variable usage detected: ${match}`
      ));
    }

    // Check for static property modifications
    const staticMatches = testCode.match(/\w+\.\w+\s*=/g);
    if (staticMatches) {
      sharedPatterns.push(...staticMatches.map(match => 
        `Static property modification detected: ${match}`
      ));
    }

    return sharedPatterns;
  }

  /**
   * Detect missing cleanup patterns
   */
  static detectMissingCleanup(testCode: string): string[] {
    const issues: string[] = [];
    
    // Check for resource creation without cleanup
    const resourceCreations = testCode.match(/(?:new|create|open|connect)\s+\w+/g) || [];
    const cleanupCalls = testCode.match(/(?:cleanup|close|dispose|destroy)\s*\(/g) || [];
    
    if (resourceCreations.length > cleanupCalls.length) {
      issues.push(`Resource creation (${resourceCreations.length}) exceeds cleanup calls (${cleanupCalls.length})`);
    }

    // Check for async operations without proper handling
    const asyncMatches = testCode.match(/async\s+\w+\s*\(\)/g) || [];
    const awaitMatches = testCode.match(/await\s+\w+/g) || [];
    
    if (asyncMatches.length > awaitMatches.length) {
      issues.push(`Async functions (${asyncMatches.length}) exceed await calls (${awaitMatches.length})`);
    }

    return issues;
  }

  /**
   * Comprehensive test isolation validation
   */
  static validateTestIsolation(testCode: string): {
    sharedVariables: string[];
    missingCleanup: string[];
    overall: string[];
  } {
    const sharedVariables = this.detectSharedVariables(testCode);
    const missingCleanup = this.detectMissingCleanup(testCode);
    const overall = [...sharedVariables, ...missingCleanup];

    return {
      sharedVariables,
      missingCleanup,
      overall
    };
  }
}

/**
 * Performance monitoring for test data operations
 */
export class TestDataPerformanceMonitor {
  private static metrics: Map<string, {
    creationTime: number;
    cleanupTime: number;
    dataSize: number;
    operationType: string;
  }> = new Map();

  /**
   * Record data operation metrics
   */
  static record(
    operationId: string,
    creationTime: number,
    cleanupTime: number,
    dataSize: number,
    operationType: string
  ): void {
    this.metrics.set(operationId, {
      creationTime,
      cleanupTime,
      dataSize,
      operationType
    });
  }

  /**
   * Get performance report
   */
  static getReport(): {
    averageCreationTime: number;
    averageCleanupTime: number;
    averageDataSize: number;
    slowestOperations: Array<{ operationId: string; totalTime: number; operationType: string }>;
  } {
    const metrics = Array.from(this.metrics.values());
    
    if (metrics.length === 0) {
      return {
        averageCreationTime: 0,
        averageCleanupTime: 0,
        averageDataSize: 0,
        slowestOperations: []
      };
    }

    const averageCreationTime = metrics.reduce((sum, m) => sum + m.creationTime, 0) / metrics.length;
    const averageCleanupTime = metrics.reduce((sum, m) => sum + m.cleanupTime, 0) / metrics.length;
    const averageDataSize = metrics.reduce((sum, m) => sum + m.dataSize, 0) / metrics.length;

    const slowestOperations = Array.from(this.metrics.entries())
      .map(([operationId, metrics]) => ({
        operationId,
        totalTime: metrics.creationTime + metrics.cleanupTime,
        operationType: metrics.operationType
      }))
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5);

    return {
      averageCreationTime,
      averageCleanupTime,
      averageDataSize,
      slowestOperations
    };
  }

  /**
   * Clear all metrics
   */
  static clear(): void {
    this.metrics.clear();
  }
}
