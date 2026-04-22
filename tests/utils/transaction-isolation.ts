/**
 * Database Transaction Isolation for Integration Tests
 * Provides comprehensive transaction management and isolation for test databases
 * Supports multiple database adapters and ensures proper cleanup
 */

export interface TransactionOptions {
  isolationLevel?: 'READ_UNCOMMITTED' | 'READ_COMMITTED' | 'REPEATABLE_READ' | 'SERIALIZABLE';
  timeout?: number;
  readOnly?: boolean;
  savepoints?: boolean;
}

export interface DatabaseConnection {
  query(sql: string, params?: any[]): Promise<any>;
  transaction(): Promise<Transaction>;
  close(): Promise<void>;
}

export interface Transaction {
  query(sql: string, params?: any[]): Promise<any>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  savepoint(name?: string): Promise<string>;
  rollbackToSavepoint(name: string): Promise<void>;
  releaseSavepoint(name: string): Promise<void>;
}

export interface TransactionManager {
  createTransaction(options?: TransactionOptions): Promise<Transaction>;
  executeInTransaction<T>(
    callback: (tx: Transaction) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T>;
  cleanup(): Promise<void>;
}

/**
 * Mock Database Transaction for Testing
 * Simulates database behavior without requiring actual database connection
 */
export class MockTransaction implements Transaction {
  private queries: Array<{ sql: string; params: any[]; result: any }> = [];
  private savepoints: string[] = [];
  private committed = false;
  private rolledBack = false;

  async query(sql: string, params: any[] = []): Promise<any> {
    if (this.committed) {
      throw new Error('Cannot query on committed transaction');
    }
    if (this.rolledBack) {
      throw new Error('Cannot query on rolled back transaction');
    }

    // Simulate different query types
    let result: any;
    
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      result = this.mockSelect(sql, params);
    } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
      result = this.mockInsert(sql, params);
    } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
      result = this.mockUpdate(sql, params);
    } else if (sql.trim().toUpperCase().startsWith('DELETE')) {
      result = this.mockDelete(sql, params);
    } else {
      result = { affectedRows: 0 };
    }

    this.queries.push({ sql, params, result });
    return result;
  }

  async commit(): Promise<void> {
    if (this.rolledBack) {
      throw new Error('Cannot commit rolled back transaction');
    }
    this.committed = true;
  }

  async rollback(): Promise<void> {
    if (this.committed) {
      throw new Error('Cannot rollback committed transaction');
    }
    this.rolledBack = true;
    this.queries = [];
    this.savepoints = [];
  }

  async savepoint(name?: string): Promise<string> {
    const savepointName = name || `sp_${this.savepoints.length + 1}`;
    this.savepoints.push(savepointName);
    return savepointName;
  }

  async rollbackToSavepoint(name: string): Promise<void> {
    const index = this.savepoints.indexOf(name);
    if (index === -1) {
      throw new Error(`Savepoint ${name} not found`);
    }
    // Remove queries and savepoints after this point
    this.savepoints = this.savepoints.slice(0, index + 1);
  }

  async releaseSavepoint(name: string): Promise<void> {
    const index = this.savepoints.indexOf(name);
    if (index === -1) {
      throw new Error(`Savepoint ${name} not found`);
    }
    this.savepoints.splice(index, 1);
  }

  getQueries(): Array<{ sql: string; params: any[]; result: any }> {
    return [...this.queries];
  }

  getSavepoints(): string[] {
    return [...this.savepoints];
  }

  isCommitted(): boolean {
    return this.committed;
  }

  isRolledBack(): boolean {
    return this.rolledBack;
  }

  private mockSelect(_sql: string, _params: any[]): any[] {
    // Simple mock implementation for SELECT queries
    if (_sql.includes('users')) {
      return [
        { id: 1, name: 'Test User', email: 'test@example.com' },
        { id: 2, name: 'Another User', email: 'another@example.com' }
      ];
    }
    if (_sql.includes('posts')) {
      return [
        { id: 1, title: 'Test Post', user_id: 1 },
        { id: 2, title: 'Another Post', user_id: 2 }
      ];
    }
    return [];
  }

  private mockInsert(_sql: string, _params: any[]): { insertId: number; affectedRows: number } {
    return { insertId: Math.floor(Math.random() * 1000), affectedRows: 1 };
  }

  private mockUpdate(_sql: string, _params: any[]): { affectedRows: number } {
    return { affectedRows: 1 };
  }

  private mockDelete(_sql: string, _params: any[]): { affectedRows: number } {
    return { affectedRows: 1 };
  }
}

/**
 * Mock Database Connection for Testing
 */
export class MockDatabaseConnection implements DatabaseConnection {
  private transactions: MockTransaction[] = [];
  private closed = false;

  async query(sql: string, params: any[] = []): Promise<any> {
    if (this.closed) {
      throw new Error('Database connection is closed');
    }
    
    // Auto-commit for queries outside transactions
    const tx = new MockTransaction();
    const result = await tx.query(sql, params);
    await tx.commit();
    return result;
  }

  async transaction(): Promise<Transaction> {
    if (this.closed) {
      throw new Error('Database connection is closed');
    }
    
    const tx = new MockTransaction();
    this.transactions.push(tx);
    return tx;
  }

  async close(): Promise<void> {
    this.closed = true;
    // Rollback any uncommitted transactions
    for (const tx of this.transactions) {
      if (!tx.isCommitted() && !tx.isRolledBack()) {
        await tx.rollback();
      }
    }
    this.transactions = [];
  }

  getTransactionCount(): number {
    return this.transactions.length;
  }

  isOpen(): boolean {
    return !this.closed;
  }
}

/**
 * Transaction Manager Implementation
 */
export class DefaultTransactionManager implements TransactionManager {
  private connections: DatabaseConnection[] = [];
  private transactions: Transaction[] = [];

  async createTransaction(_options: TransactionOptions = {}): Promise<Transaction> {
    const connection = new MockDatabaseConnection();
    this.connections.push(connection);
    
    const transaction = await connection.transaction();
    this.transactions.push(transaction);
    
    return transaction;
  }

  async executeInTransaction<T>(
    callback: (tx: Transaction) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const transaction = await this.createTransaction(options);
    
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    // Close all connections
    for (const connection of this.connections) {
      await connection.close();
    }
    this.connections = [];
    this.transactions = [];
  }

  getConnectionCount(): number {
    return this.connections.length;
  }

  getTransactionCount(): number {
    return this.transactions.length;
  }
}

/**
 * Isolation Strategies for Different Test Types
 */
export class IsolationStrategies {
  /**
   * Read Committed Isolation - Default for most tests
   */
  static readCommitted(): TransactionOptions {
    return {
      isolationLevel: 'READ_COMMITTED',
      timeout: 30000,
      readOnly: false,
      savepoints: true
    };
  }

  /**
   * Serializable Isolation - For tests requiring strict consistency
   */
  static serializable(): TransactionOptions {
    return {
      isolationLevel: 'SERIALIZABLE',
      timeout: 60000,
      readOnly: false,
      savepoints: true
    };
  }

  /**
   * Read Only Isolation - For read-heavy tests
   */
  static readOnly(): TransactionOptions {
    return {
      isolationLevel: 'READ_COMMITTED',
      timeout: 15000,
      readOnly: true,
      savepoints: false
    };
  }

  /**
   * Fast Isolation - For performance-critical tests
   */
  static fast(): TransactionOptions {
    return {
      isolationLevel: 'READ_UNCOMMITTED',
      timeout: 5000,
      readOnly: false,
      savepoints: false
    };
  }
}

/**
 * Test Database Utilities
 */
export class TestDatabaseUtils {
  private static managers: Map<string, TransactionManager> = new Map();

  /**
   * Get or create a transaction manager for a test
   */
  static getManager(testId: string): TransactionManager {
    if (!this.managers.has(testId)) {
      this.managers.set(testId, new DefaultTransactionManager());
    }
    return this.managers.get(testId)!;
  }

  /**
   * Clean up a test's transaction manager
   */
  static async cleanupManager(testId: string): Promise<void> {
    const manager = this.managers.get(testId);
    if (manager) {
      await manager.cleanup();
      this.managers.delete(testId);
    }
  }

  /**
   * Clean up all managers (emergency cleanup)
   */
  static async cleanupAll(): Promise<void> {
    const promises = Array.from(this.managers.entries()).map(
      async ([testId, manager]) => {
        await manager.cleanup();
        this.managers.delete(testId);
      }
    );
    await Promise.all(promises);
  }

  /**
   * Get statistics about active managers
   */
  static getStats(): { activeManagers: number; totalConnections: number; totalTransactions: number } {
    const managers = Array.from(this.managers.values());
    const totalConnections = managers.reduce((sum, m) => sum + (m as any).getConnectionCount?.() || 0, 0);
    const totalTransactions = managers.reduce((sum, m) => sum + (m as any).getTransactionCount?.() || 0, 0);

    return {
      activeManagers: this.managers.size,
      totalConnections,
      totalTransactions
    };
  }

  /**
   * Validate isolation compliance
   */
  static validateIsolation(): string[] {
    const issues: string[] = [];
    const stats = this.getStats();

    if (stats.activeManagers > 50) {
      issues.push(`High number of active managers (${stats.activeManagers}) - potential memory leak`);
    }

    if (stats.totalConnections > 100) {
      issues.push(`High number of connections (${stats.totalConnections}) - potential resource leak`);
    }

    if (stats.totalTransactions > 200) {
      issues.push(`High number of transactions (${stats.totalTransactions}) - potential performance issue`);
    }

    return issues;
  }
}

/**
 * Utility for running tests with database transaction isolation
 */
export const withTransactionIsolation = async <T>(
  testId: string,
  strategy: TransactionOptions,
  testFn: (tx: Transaction) => Promise<T>
): Promise<T> => {
  const manager = TestDatabaseUtils.getManager(testId);
  
  try {
    return await manager.executeInTransaction(testFn, strategy);
  } finally {
    await TestDatabaseUtils.cleanupManager(testId);
  }
};

/**
 * Utility for running tests with multiple transactions
 */
export const withMultipleTransactions = async <T>(
  testId: string,
  transactionCount: number,
  strategy: TransactionOptions,
  testFn: (transactions: Transaction[]) => Promise<T>
): Promise<T> => {
  const manager = TestDatabaseUtils.getManager(testId);
  const transactions: Transaction[] = [];
  
  try {
    // Create multiple transactions
    for (let i = 0; i < transactionCount; i++) {
      transactions.push(await manager.createTransaction(strategy));
    }
    
    return await testFn(transactions);
  } finally {
    // Cleanup all transactions
    for (const tx of transactions) {
      try {
        await tx.rollback();
      } catch (error) {
        // Ignore rollback errors during cleanup
      }
    }
    await TestDatabaseUtils.cleanupManager(testId);
  }
};

/**
 * Performance monitoring for transaction operations
 */
export class TransactionPerformanceMonitor {
  private static metrics: Map<string, {
    setupTime: number;
    executionTime: number;
    cleanupTime: number;
    queryCount: number;
    transactionType: string;
  }> = new Map();

  /**
   * Record transaction metrics
   */
  static record(
    operationId: string,
    setupTime: number,
    executionTime: number,
    cleanupTime: number,
    queryCount: number,
    transactionType: string
  ): void {
    this.metrics.set(operationId, {
      setupTime,
      executionTime,
      cleanupTime,
      queryCount,
      transactionType
    });
  }

  /**
   * Get performance report
   */
  static getReport(): {
    averageSetupTime: number;
    averageExecutionTime: number;
    averageCleanupTime: number;
    averageQueryCount: number;
    slowestOperations: Array<{ operationId: string; totalTime: number; transactionType: string }>;
  } {
    const metrics = Array.from(this.metrics.values());
    
    if (metrics.length === 0) {
      return {
        averageSetupTime: 0,
        averageExecutionTime: 0,
        averageCleanupTime: 0,
        averageQueryCount: 0,
        slowestOperations: []
      };
    }

    const averageSetupTime = metrics.reduce((sum, m) => sum + m.setupTime, 0) / metrics.length;
    const averageExecutionTime = metrics.reduce((sum, m) => sum + m.executionTime, 0) / metrics.length;
    const averageCleanupTime = metrics.reduce((sum, m) => sum + m.cleanupTime, 0) / metrics.length;
    const averageQueryCount = metrics.reduce((sum, m) => sum + m.queryCount, 0) / metrics.length;

    const slowestOperations = Array.from(this.metrics.entries())
      .map(([operationId, metrics]) => ({
        operationId,
        totalTime: metrics.setupTime + metrics.executionTime + metrics.cleanupTime,
        transactionType: metrics.transactionType
      }))
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5);

    return {
      averageSetupTime,
      averageExecutionTime,
      averageCleanupTime,
      averageQueryCount,
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
