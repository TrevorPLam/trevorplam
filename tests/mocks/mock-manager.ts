/**
 * Mock Management System with Version Control
 * 
 * Provides comprehensive mock management with versioning, lifecycle management,
 * and schema validation following 2026 enterprise standards.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import type { ZodSchema } from 'zod';

export interface MockVersion {
  version: string;
  createdAt: string;
  description: string;
  changes: string[];
  schema: any;
  deprecated?: boolean;
  migrationPath?: string;
}

export interface MockDefinition {
  id: string;
  name: string;
  type: 'api' | 'database' | 'service' | 'component';
  category: string;
  currentVersion: string;
  versions: MockVersion[];
  metadata: {
    author: string;
    tags: string[];
    dependencies: string[];
    environment: 'development' | 'testing' | 'staging';
  };
  validation: {
    schema: ZodSchema;
    strict: boolean;
  };
}

export interface MockInstance {
  id: string;
  mockId: string;
  version: string;
  data: any;
  isActive: boolean;
  createdAt: string;
  lastUsed: string;
  usageCount: number;
  metadata: {
    testId?: string;
    sessionId?: string;
    context: Record<string, any>;
  };
}

/**
 * Mock Manager with version control and lifecycle management
 */
export class MockManager {
  private mocks: Map<string, MockDefinition> = new Map();
  private instances: Map<string, MockInstance> = new Map();
  private storagePath: string;
  private versionHistory: Map<string, string[]> = new Map();

  constructor(storagePath: string = 'tests/mocks/storage') {
    this.storagePath = storagePath;
    this.ensureStorageDirectory();
    this.loadStoredMocks();
  }

  /**
   * Register a new mock definition
   */
  registerMock(definition: Omit<MockDefinition, 'id'>): string {
    const id = randomUUID();
    const mock: MockDefinition = {
      ...definition,
      id
    };
    
    this.mocks.set(id, mock);
    this.versionHistory.set(id, [mock.currentVersion]);
    this.saveMock(mock);
    
    return id;
  }

  /**
   * Get mock definition by ID
   */
  getMock(id: string): MockDefinition | undefined {
    return this.mocks.get(id);
  }

  /**
   * Get mock definition by name
   */
  getMockByName(name: string): MockDefinition | undefined {
    return Array.from(this.mocks.values()).find(mock => mock.name === name);
  }

  /**
   * List all mocks with optional filtering
   */
  listMocks(filter?: {
    type?: MockDefinition['type'];
    category?: string;
    environment?: MockDefinition['metadata']['environment'];
    tags?: string[];
  }): Array<{ id: string; name: string; type: string; version: string; deprecated: boolean }> {
    let mocks = Array.from(this.mocks.values());
    
    if (filter?.type) {
      mocks = mocks.filter(mock => mock.type === filter.type);
    }
    
    if (filter?.category) {
      mocks = mocks.filter(mock => mock.category === filter.category);
    }
    
    if (filter?.environment) {
      mocks = mocks.filter(mock => mock.metadata.environment === filter.environment);
    }
    
    if (filter?.tags && filter.tags.length > 0) {
      mocks = mocks.filter(mock => 
        filter.tags!.some(tag => mock.metadata.tags.includes(tag))
      );
    }
    
    return mocks.map(mock => ({
      id: mock.id,
      name: mock.name,
      type: mock.type,
      version: mock.currentVersion,
      deprecated: mock.versions.find(v => v.version === mock.currentVersion)?.deprecated || false
    }));
  }

  /**
   * Create a new version of an existing mock
   */
  createVersion(mockId: string, version: Omit<MockVersion, 'version' | 'createdAt'>): string {
    const mock = this.mocks.get(mockId);
    if (!mock) {
      throw new Error(`Mock not found: ${mockId}`);
    }
    
    const newVersion = this.generateVersionNumber(mock.versions);
    const mockVersion: MockVersion = {
      ...version,
      version: newVersion,
      createdAt: new Date().toISOString()
    };
    
    mock.versions.push(mockVersion);
    mock.currentVersion = newVersion;
    
    const history = this.versionHistory.get(mockId) || [];
    history.push(newVersion);
    this.versionHistory.set(mockId, history);
    
    this.saveMock(mock);
    
    return newVersion;
  }

  /**
   * Get specific version of a mock
   */
  getMockVersion(mockId: string, version: string): MockVersion | undefined {
    const mock = this.mocks.get(mockId);
    if (!mock) return undefined;
    
    return mock.versions.find(v => v.version === version);
  }

  /**
   * Revert mock to specific version
   */
  revertVersion(mockId: string, version: string): void {
    const mock = this.mocks.get(mockId);
    if (!mock) {
      throw new Error(`Mock not found: ${mockId}`);
    }
    
    const versionExists = mock.versions.find(v => v.version === version);
    if (!versionExists) {
      throw new Error(`Version not found: ${version}`);
    }
    
    mock.currentVersion = version;
    this.saveMock(mock);
  }

  /**
   * Deprecate a mock version
   */
  deprecateVersion(mockId: string, version: string, reason?: string): void {
    const mock = this.mocks.get(mockId);
    if (!mock) {
      throw new Error(`Mock not found: ${mockId}`);
    }
    
    const mockVersion = mock.versions.find(v => v.version === version);
    if (!mockVersion) {
      throw new Error(`Version not found: ${version}`);
    }
    
    mockVersion.deprecated = true;
    if (reason) {
      mockVersion.description += ` (DEPRECATED: ${reason})`;
    }
    
    this.saveMock(mock);
  }

  /**
   * Create a mock instance for testing
   */
  createInstance(mockId: string, context?: Record<string, any>): string {
    const mock = this.mocks.get(mockId);
    if (!mock) {
      throw new Error(`Mock not found: ${mockId}`);
    }
    
    const currentVersion = mock.versions.find(v => v.version === mock.currentVersion);
    if (!currentVersion) {
      throw new Error(`Current version not found: ${mock.currentVersion}`);
    }
    
    // Validate mock data against schema
    const validationResult = this.validateMockData(currentVersion.schema, mock.validation.schema);
    if (!validationResult.valid && mock.validation.strict) {
      throw new Error(`Mock validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    const instanceId = randomUUID();
    const instance: MockInstance = {
      id: instanceId,
      mockId,
      version: mock.currentVersion,
      data: currentVersion.schema,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      usageCount: 0,
      metadata: {
        context: context || {},
        testId: context?.testId,
        sessionId: context?.sessionId
      }
    };
    
    this.instances.set(instanceId, instance);
    
    return instanceId;
  }

  /**
   * Get mock instance
   */
  getInstance(instanceId: string): MockInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Update mock instance usage
   */
  updateInstanceUsage(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.lastUsed = new Date().toISOString();
      instance.usageCount++;
    }
  }

  /**
   * Deactivate mock instance
   */
  deactivateInstance(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.isActive = false;
    }
  }

  /**
   * Clean up inactive instances
   */
  cleanupInactiveInstances(olderThanHours: number = 24): number {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    let cleaned = 0;
    
    for (const [id, instance] of this.instances.entries()) {
      if (!instance.isActive || new Date(instance.lastUsed) < cutoff) {
        this.instances.delete(id);
        cleaned++;
      }
    }
    
    return cleaned;
  }

  /**
   * Validate mock data against schema
   */
  validateMockData(data: any, schema: ZodSchema): { valid: boolean; errors: string[] } {
    try {
      schema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: (error as z.ZodError).errors.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        valid: false,
        errors: ['Unknown validation error']
      };
    }
  }

  /**
   * Get mock statistics
   */
  getStatistics(): {
    totalMocks: number;
    activeInstances: number;
    deprecatedVersions: number;
    averageVersionsPerMock: number;
    mostUsedMocks: Array<{ name: string; usageCount: number }>;
  } {
    const totalMocks = this.mocks.size;
    const activeInstances = Array.from(this.instances.values()).filter(i => i.isActive).length;
    
    let deprecatedVersions = 0;
    let totalVersions = 0;
    
    this.mocks.forEach(mock => {
      totalVersions += mock.versions.length;
      deprecatedVersions += mock.versions.filter(v => v.deprecated).length;
    });
    
    const averageVersionsPerMock = totalMocks > 0 ? totalVersions / totalMocks : 0;
    
    // Calculate most used mocks
    const usageByMock = new Map<string, number>();
    this.instances.forEach(instance => {
      const mock = this.mocks.get(instance.mockId);
      if (mock) {
        usageByMock.set(mock.name, (usageByMock.get(mock.name) || 0) + instance.usageCount);
      }
    });
    
    const mostUsedMocks = Array.from(usageByMock.entries())
      .map(([name, usageCount]) => ({ name, usageCount }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5);
    
    return {
      totalMocks,
      activeInstances,
      deprecatedVersions,
      averageVersionsPerMock,
      mostUsedMocks
    };
  }

  /**
   * Export mock definitions
   */
  export(includeInstances: boolean = false): {
    mocks: MockDefinition[];
    instances?: MockInstance[];
    exportedAt: string;
  } {
    const data = {
      mocks: Array.from(this.mocks.values()),
      exportedAt: new Date().toISOString()
    };
    
    if (includeInstances) {
      data.instances = Array.from(this.instances.values());
    }
    
    return data;
  }

  /**
   * Import mock definitions
   */
  import(data: { mocks: MockDefinition[]; instances?: MockInstance[] }): {
    imported: number;
    conflicts: string[];
  } {
    const conflicts: string[] = [];
    let imported = 0;
    
    data.mocks.forEach(mock => {
      const existing = this.getMockByName(mock.name);
      if (existing) {
        conflicts.push(`Mock already exists: ${mock.name}`);
        return;
      }
      
      this.mocks.set(mock.id, mock);
      this.versionHistory.set(mock.id, mock.versions.map(v => v.version));
      this.saveMock(mock);
      imported++;
    });
    
    if (data.instances) {
      data.instances.forEach(instance => {
        this.instances.set(instance.id, instance);
      });
    }
    
    return { imported, conflicts };
  }

  private ensureStorageDirectory(): void {
    if (!existsSync(this.storagePath)) {
      mkdirSync(this.storagePath, { recursive: true });
    }
  }

  private saveMock(mock: MockDefinition): void {
    const filePath = join(this.storagePath, `${mock.id}.json`);
    const data = {
      ...mock,
      validation: {
        ...mock.validation,
        schema: mock.validation.schema.toString() // Convert Zod schema to string
      }
    };
    writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private loadStoredMocks(): void {
    try {
      const files = require('fs').readdirSync(this.storagePath);
      
      files.forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const filePath = join(this.storagePath, file);
            const data = JSON.parse(readFileSync(filePath, 'utf-8'));
            
            // Reconstruct Zod schema (simplified - would need proper schema reconstruction)
            data.validation.schema = z.any();
            
            this.mocks.set(data.id, data);
            this.versionHistory.set(data.id, data.versions.map((v: MockVersion) => v.version));
          } catch (error) {
            console.warn(`Failed to load mock from ${file}:`, error);
          }
        }
      });
    } catch (error) {
      // Directory doesn't exist or is empty
    }
  }

  private generateVersionNumber(existingVersions: MockVersion[]): string {
    const versionNumbers = existingVersions.map(v => v.version);
    let major = 1;
    let minor = 0;
    let patch = 0;
    
    if (versionNumbers.length > 0) {
      const latest = versionNumbers[versionNumbers.length - 1];
      const parts = latest.split('.').map(Number);
      major = parts[0] || 1;
      minor = parts[1] || 0;
      patch = parts[2] || 0;
      patch++;
    }
    
    return `${major}.${minor}.${patch}`;
  }
}

/**
 * Global mock manager instance
 */
export const mockManager = new MockManager();

/**
 * Mock factory helper for creating common mock types
 */
export class MockFactory {
  /**
   * Create API response mock
   */
  static createApiResponseMock(name: string, responses: Record<string, any>): MockDefinition {
    return {
      id: '',
      name,
      type: 'api',
      category: 'response',
      currentVersion: '1.0.0',
      versions: [{
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        description: `API response mock for ${name}`,
        changes: ['Initial version'],
        schema: responses
      }],
      metadata: {
        author: 'MockFactory',
        tags: ['api', 'response'],
        dependencies: [],
        environment: 'testing'
      },
      validation: {
        schema: z.record(z.string(), z.any()),
        strict: true
      }
    };
  }

  /**
   * Create database mock
   */
  static createDatabaseMock(name: string, tables: Record<string, any[]>): MockDefinition {
    return {
      id: '',
      name,
      type: 'database',
      category: 'data',
      currentVersion: '1.0.0',
      versions: [{
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        description: `Database mock for ${name}`,
        changes: ['Initial version'],
        schema: tables
      }],
      metadata: {
        author: 'MockFactory',
        tags: ['database', 'data'],
        dependencies: [],
        environment: 'testing'
      },
      validation: {
        schema: z.record(z.string(), z.array(z.any())),
        strict: true
      }
    };
  }

  /**
   * Create service mock
   */
  static createServiceMock(name: string, methods: Record<string, any>): MockDefinition {
    return {
      id: '',
      name,
      type: 'service',
      category: 'service',
      currentVersion: '1.0.0',
      versions: [{
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        description: `Service mock for ${name}`,
        changes: ['Initial version'],
        schema: methods
      }],
      metadata: {
        author: 'MockFactory',
        tags: ['service', 'methods'],
        dependencies: [],
        environment: 'testing'
      },
      validation: {
        schema: z.record(z.string(), z.function()),
        strict: false
      }
    };
  }
}
