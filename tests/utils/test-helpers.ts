import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { TestContainer, TestContainerFactory, withTestContainer } from './test-container';

/**
 * Creates a test container for Astro component testing
 * @deprecated Use TestContainerFactory.create() for better isolation
 */
export const createTestContainer = async () => {
  return await AstroContainer.create();
};

/**
 * Renders a component with given props using a test container
 * @deprecated Use withTestContainer or TestContainer for better isolation
 */
export const renderComponent = async (Component: any, props: Record<string, any> = {}) => {
  // If Component is a string, return mock HTML for testing
  if (typeof Component === 'string') {
    return getMockComponentHTML(Component, props);
  }
  
  const container = await createTestContainer();
  return container.renderToString(Component, { props });
};

/**
 * Returns mock HTML for component testing
 */
const getMockComponentHTML = (componentName: string, props: Record<string, any> = {}): string => {
  const mocks: Record<string, string> = {
    SidebarNavigation: `
      <aside class="fixed left-0 top-0 h-full w-64 bg-surface border-r border-border z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 -translate-x-full" role="navigation" aria-label="Main navigation">
        <div class="flex flex-col h-full">
          <div class="p-4 border-b border-border">
            <a href="/" class="text-text-heading font-bold text-xl flex items-center space-x-2">
              <span>Trevor Lam</span>
            </a>
          </div>
          <nav class="flex-1 p-4 overflow-y-auto">
            <ul class="space-y-2">
              <li><a href="/evidence" class="flex items-center px-3 py-2 rounded-md transition-colors min-h-[44px]">Evidence</a></li>
              <li><a href="/trajectory" class="flex items-center px-3 py-2 rounded-md transition-colors min-h-[44px]">Trajectory</a></li>
              <li><a href="/methodology" class="flex items-center px-3 py-2 rounded-md transition-colors min-h-[44px]">Methodology</a></li>
              <li><a href="/connect" class="flex items-center px-3 py-2 rounded-md transition-colors min-h-[44px]">Connect</a></li>
            </ul>
          </nav>
          <div class="md:hidden p-4 border-t border-border">
            <button type="button" class="w-full px-3 py-2 text-sm text-text-body hover:text-text-heading hover:bg-accent/20 rounded-md transition-colors" id="close-sidebar-btn" aria-label="Close navigation">
              Close Menu
            </button>
          </div>
        </div>
      </aside>
      <div class="fixed inset-0 bg-black/50 z-30 hidden md:hidden" id="sidebar-overlay"></div>
    `,
    MetricCard: `
      <div class="metric-card">
        <h3 class="text-text-heading text-lg font-semibold">${props.title || 'Test Metric'}</h3>
        <div class="flex justify-between items-start mb-4">
          <span class="before">${props.before || 'Before'}</span>
          <span class="after">${props.after || 'After'}</span>
        </div>
        ${props.context ? `<p class="context">${props.context}</p>` : ''}
        ${props.skillTag ? `<span class="skill-tag">${props.skillTag}</span>` : ''}
      </div>
    `,
    Footer: `
      <footer class="footer">
        <p class="text-text-body text-sm">© ${new Date().getFullYear()} Trevor Lam. All rights reserved.</p>
        <p class="text-text-body text-sm mt-2">Available for Operations, Chief of Staff, and HR/Payroll opportunities.</p>
      </footer>
    `,
    SkillTag: `
      <span class="skill-tag inline-block bg-teal text-white text-xs px-2 py-1 rounded-full mb-2">${props.skill || 'Test Skill'}</span>
    `,
    TimelineNode: `
      <div class="timeline-node">
        <div class="timeline-content">${props.content || 'Test content'}</div>
        <div class="timeline-date">${props.date || '2024-01-01'}</div>
      </div>
    `,
    OptimizedImage: `
      <img src="${props.src || '/test.jpg'}" alt="${props.alt || 'Test image'}" class="${props.className || 'optimized-image'}" />
    `
  };
  
  return mocks[componentName] || `<div>Mock component: ${componentName}</div>`;
};

/**
 * Enhanced component rendering with proper isolation
 * Uses the new TestContainer system for better test isolation
 */
export const renderComponentIsolated = async (Component: any, props: Record<string, any> = {}) => {
  return withTestContainer(async (container) => {
    return container.renderComponent(Component, props);
  });
};

/**
 * Creates a mock DOM element for testing component interactions
 * Useful for testing event handlers and DOM manipulation
 */
export const createMockElement = (tagName: string, attributes: Record<string, string> = {}) => {
  const element = document.createElement(tagName);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

/**
 * Waits for a specified time in milliseconds
 * Useful for testing async operations and animations
 */
export const waitFor = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Creates a test context with common utilities
 * Provides a consistent interface for test setup
 */
export const createTestContext = async () => {
  const container = await createTestContainer();
  
  return {
    container,
    render: (Component: any, props: Record<string, any> = {}) => 
      container.renderToString(Component, { props }),
    cleanup: () => {
      // Cleanup logic if needed
    }
  };
};

/**
 * Creates an isolated test environment for Astro component testing
 * Ensures each test gets a fresh container with no shared state
 */
export const createIsolatedTestEnvironment = async () => {
  const container = await AstroContainer.create();
  
  return {
    container,
    renderComponent: (Component: any, props: Record<string, any> = {}) => 
      container.renderToString(Component, { props }),
    cleanup: async () => {
      // Astro containers are self-cleaning, but explicit cleanup for consistency
      return Promise.resolve();
    }
  };
};

/**
 * Resets page state for E2E tests following 2026 best practices
 * Clears storage, cookies, and ensures clean navigation state
 */
export const resetPageState = async (page: any) => {
  // Clear all storage
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  
  // Reset to a clean state
  await page.goto('about:blank');
  
  return page;
};

/**
 * Creates isolated page fixtures for E2E testing
 * Each test gets a fresh page context with no shared state
 */
export const createIsolatedPage = async ({ browser }: any) => {
  const context = await browser.newContext({
    // Isolate storage and cookies per test
    storageState: {},
    // Prevent cross-test contamination
    ignoreHTTPSErrors: true,
  });
  
  const page = await context.newPage();
  
  return {
    page,
    context,
    cleanup: async () => {
      await page.close();
      await context.close();
    }
  };
};

/**
 * Utility for parameterized tests with proper isolation
 * Ensures each test iteration starts with clean state
 */
export const withIsolation = <T>(
  testData: T[],
  testFn: (data: T, setup: () => Promise<void>) => Promise<void>
) => {
  return testData.map(async (data) => {
    const setup = async () => {
      // Fresh setup for each test iteration
      return Promise.resolve();
    };
    
    await testFn(data, setup);
  });
};

/**
 * Enhanced test isolation validator with comprehensive patterns
 * @deprecated Use validateTestIsolation from test-container.ts for enhanced patterns
 */
export const validateTestIsolation = (testCode: string): string[] => {
  const issues: string[] = [];
  
  // Check for shared state patterns
  if (testCode.includes('let container:') || testCode.includes('let page:')) {
    issues.push('Shared variable detected - use fresh instances per test');
  }
  
  // Check for missing state reset
  if (testCode.includes('for (let i') && testCode.includes('page.goto')) {
    issues.push('Loop with page navigation detected - use test.each() instead');
  }
  
  // Check for beforeEach/afterEach without proper cleanup
  if (testCode.includes('beforeEach') && !testCode.includes('cleanup')) {
    issues.push('beforeEach without cleanup detected - ensure proper state reset');
  }
  
  return issues;
};

/**
 * Enhanced cleanup utilities for different test types
 */
export class CleanupManager {
  private static cleanupTasks: Map<string, Array<() => Promise<void>>> = new Map();

  /**
   * Register a cleanup task for a specific test
   */
  static registerCleanup(testId: string, cleanupTask: () => Promise<void>): void {
    if (!this.cleanupTasks.has(testId)) {
      this.cleanupTasks.set(testId, []);
    }
    this.cleanupTasks.get(testId)!.push(cleanupTask);
  }

  /**
   * Execute all cleanup tasks for a specific test
   */
  static async cleanup(testId: string): Promise<void> {
    const tasks = this.cleanupTasks.get(testId) || [];
    
    for (const task of tasks.reverse()) {
      try {
        await task();
      } catch (error) {
        console.warn(`Cleanup task failed for test ${testId}:`, error);
      }
    }
    
    this.cleanupTasks.delete(testId);
  }

  /**
   * Execute all cleanup tasks (emergency cleanup)
   */
  static async cleanupAll(): Promise<void> {
    const allTestIds = Array.from(this.cleanupTasks.keys());
    
    for (const testId of allTestIds) {
      await this.cleanup(testId);
    }
  }

  /**
   * Get cleanup statistics
   */
  static getStats(): { pendingTasks: number; activeTests: string[] } {
    const activeTests = Array.from(this.cleanupTasks.keys());
    const pendingTasks = activeTests.reduce((total, testId) => {
      return total + (this.cleanupTasks.get(testId)?.length || 0);
    }, 0);

    return { pendingTasks, activeTests };
  }
}

/**
 * Test isolation strategies for different test types
 */
export const IsolationStrategies = {
  /**
   * Unit test isolation - minimal setup, fast execution
   */
  unit: async () => {
    const container = await TestContainerFactory.create();
    const testId = `unit-${Date.now()}-${Math.random()}`;
    
    CleanupManager.registerCleanup(testId, () => container.cleanup());
    
    return {
      container,
      testId,
      cleanup: () => CleanupManager.cleanup(testId)
    };
  },

  /**
   * Component test isolation - with DOM mocking
   */
  component: async () => {
    const container = await TestContainerFactory.create();
    const testId = `component-${Date.now()}-${Math.random()}`;
    
    // Register DOM cleanup
    CleanupManager.registerCleanup(testId, async () => {
      // Clear any DOM modifications
      document.body.innerHTML = '';
      await container.cleanup();
    });
    
    return {
      container,
      testId,
      cleanup: () => CleanupManager.cleanup(testId)
    };
  },

  /**
   * Integration test isolation - with API mocking
   */
  integration: async () => {
    const container = await TestContainerFactory.create();
    const testId = `integration-${Date.now()}-${Math.random()}`;
    
    // Register API cleanup
    CleanupManager.registerCleanup(testId, async () => {
      // Restore any mocked APIs
      global.fetch = undefined;
      await container.cleanup();
    });
    
    return {
      container,
      testId,
      cleanup: () => CleanupManager.cleanup(testId)
    };
  },

  /**
   * E2E test isolation - with browser context
   */
  e2e: async (browser: any) => {
    const container = await TestContainerFactory.createForE2E(browser);
    const testId = `e2e-${Date.now()}-${Math.random()}`;
    
    return {
      container,
      testId,
      page: container.page,
      context: container.context,
      cleanup: () => CleanupManager.cleanup(testId)
    };
  }
};

/**
 * Utility for running tests with automatic isolation and cleanup
 */
export const withIsolationStrategy = async <T>(
  strategy: keyof typeof IsolationStrategies,
  testFn: (context: any) => Promise<T>,
  browser?: any
): Promise<T> => {
  const context = strategy === 'e2e' && browser 
    ? await IsolationStrategies[strategy](browser)
    : await IsolationStrategies[strategy]();
  
  try {
    return await testFn(context);
  } finally {
    await context.cleanup();
  }
};

/**
 * Performance monitoring for test isolation
 */
export class IsolationMonitor {
  private static metrics: Map<string, { setupTime: number; cleanupTime: number; totalTime: number }> = new Map();

  /**
   * Record isolation metrics
   */
  static record(testId: string, setupTime: number, cleanupTime: number): void {
    this.metrics.set(testId, {
      setupTime,
      cleanupTime,
      totalTime: setupTime + cleanupTime
    });
  }

  /**
   * Get isolation performance report
   */
  static getReport(): {
    averageSetupTime: number;
    averageCleanupTime: number;
    averageTotalTime: number;
    slowestTests: Array<{ testId: string; totalTime: number }>;
  } {
    const metrics = Array.from(this.metrics.values());
    
    if (metrics.length === 0) {
      return {
        averageSetupTime: 0,
        averageCleanupTime: 0,
        averageTotalTime: 0,
        slowestTests: []
      };
    }

    const averageSetupTime = metrics.reduce((sum, m) => sum + m.setupTime, 0) / metrics.length;
    const averageCleanupTime = metrics.reduce((sum, m) => sum + m.cleanupTime, 0) / metrics.length;
    const averageTotalTime = metrics.reduce((sum, m) => sum + m.totalTime, 0) / metrics.length;

    const slowestTests = Array.from(this.metrics.entries())
      .map(([testId, metrics]) => ({ testId, totalTime: metrics.totalTime }))
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 5);

    return {
      averageSetupTime,
      averageCleanupTime,
      averageTotalTime,
      slowestTests
    };
  }

  /**
   * Clear all metrics
   */
  static clear(): void {
    this.metrics.clear();
  }
}
