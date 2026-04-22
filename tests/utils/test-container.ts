import { experimental_AstroContainer as AstroContainer } from 'astro/container';

/**
 * Mock objects for testing
 */
export interface TestMocks {
  /**
   * Mock DOM utilities
   */
  dom: {
    createElement: (tagName: string, attributes?: Record<string, string>) => HTMLElement;
    querySelector: (selector: string) => Element | null;
  };
  
  /**
   * Mock data factories
   */
  data: {
    createMetricData: (overrides?: Partial<MetricData>) => MetricData;
    createCaseStudyData: (overrides?: Partial<CaseStudyData>) => CaseStudyData;
  };
  
  /**
   * Mock API responses
   */
  api: {
    mockResponse: (data: any, status?: number) => Response;
    mockError: (message: string, status?: number) => Response;
  };
}

/**
 * Test data interfaces
 */
export interface MetricData {
  title: string;
  before: string;
  after: string;
  context?: string;
  skillTag?: string;
  caseStudySlug?: string;
}

export interface CaseStudyData {
  title: string;
  slug: string;
  description: string;
  impact: string;
  client: string;
  duration: string;
  skills: string[];
}

/**
 * Dependency Injection Container for Test Dependencies
 * Provides centralized management of test dependencies with proper isolation
 */
export class TestContainer {
  private readonly container: AstroContainer;
  private readonly mocks: TestMocks;
  private readonly cleanupCallbacks: Array<() => Promise<void>> = [];

  constructor(container: AstroContainer, mocks: TestMocks) {
    this.container = container;
    this.mocks = mocks;
  }

  /**
   * Get the Astro container instance
   */
  get astroContainer(): AstroContainer {
    return this.container;
  }

  /**
   * Get mock objects
   */
  getMocks(): TestMocks {
    return this.mocks;
  }

  /**
   * Render a component with given props
   */
  async renderComponent(Component: any, props: Record<string, any> = {}) {
    return this.container.renderToString(Component, { props });
  }

  /**
   * Register a cleanup callback
   */
  registerCleanup(callback: () => Promise<void>): void {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Cleanup all resources
   */
  async cleanup(): Promise<void> {
    // Execute all cleanup callbacks in reverse order
    for (const callback of this.cleanupCallbacks.reverse()) {
      try {
        await callback();
      } catch (error) {
        console.warn('Cleanup callback failed:', error);
      }
    }
    this.cleanupCallbacks.length = 0;
  }

  /**
   * Create a child container with isolated dependencies
   */
  createChild(): TestContainer {
    const childContainer = new TestContainer(this.container, this.createMocks());
    return childContainer;
  }

  /**
   * Create fresh mock objects
   */
  private createMocks(): TestMocks {
    return {
      dom: {
        createElement: (tagName: string, attributes: Record<string, string> = {}) => {
          const element = document.createElement(tagName);
          Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
          });
          return element;
        },
        querySelector: (selector: string) => document.querySelector(selector)
      },
      data: {
        createMetricData: (overrides: Partial<MetricData> = {}) => ({
          title: 'Test Metric',
          before: '100',
          after: '200',
          context: 'Test context',
          skillTag: 'Test Skill',
          ...overrides
        }),
        createCaseStudyData: (overrides: Partial<CaseStudyData> = {}) => ({
          title: 'Test Case Study',
          slug: 'test-case-study',
          description: 'Test description',
          impact: 'Test impact',
          client: 'Test Client',
          duration: '3 months',
          skills: ['Test Skill'],
          ...overrides
        })
      },
      api: {
        mockResponse: (data: any, status: number = 200) => 
          new Response(JSON.stringify(data), { 
            status, 
            headers: { 'Content-Type': 'application/json' } 
          }),
        mockError: (message: string, status: number = 500) =>
          new Response(JSON.stringify({ error: message }), { 
            status, 
            headers: { 'Content-Type': 'application/json' } 
          })
      }
    };
  }
}

/**
 * Factory for creating test containers with proper isolation
 */
export class TestContainerFactory {
  /**
   * Create a fresh test container with all dependencies
   */
  static async create(): Promise<TestContainer> {
    const container = await AstroContainer.create();
    const mocks = TestContainerFactory.createMocks();
    
    return new TestContainer(container, mocks);
  }

  /**
   * Create a test container with custom mocks
   */
  static async createWithMocks(customMocks: Partial<TestMocks>): Promise<TestContainer> {
    const container = await AstroContainer.create();
    const defaultMocks = TestContainerFactory.createMocks();
    const mergedMocks = TestContainerFactory.mergeMocks(defaultMocks, customMocks);
    
    return new TestContainer(container, mergedMocks);
  }

  /**
   * Create a test container for E2E testing
   */
  static async createForE2E(browser: any): Promise<TestContainer & { page: any; context: any }> {
    const context = await browser.newContext({
      storageState: {},
      ignoreHTTPSErrors: true,
    });
    
    const page = await context.newPage();
    const container = await TestContainerFactory.create();
    
    // Register E2E cleanup
    container.registerCleanup(async () => {
      await page.close();
      await context.close();
    });
    
    return Object.assign(container, { page, context });
  }

  /**
   * Create default mock objects
   */
  private static createMocks(): TestMocks {
    return {
      dom: {
        createElement: (tagName: string, attributes: Record<string, string> = {}) => {
          const element = document.createElement(tagName);
          Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
          });
          return element;
        },
        querySelector: (selector: string) => document.querySelector(selector)
      },
      data: {
        createMetricData: (overrides: Partial<MetricData> = {}) => ({
          title: 'Test Metric',
          before: '100',
          after: '200',
          context: 'Test context',
          skillTag: 'Test Skill',
          ...overrides
        }),
        createCaseStudyData: (overrides: Partial<CaseStudyData> = {}) => ({
          title: 'Test Case Study',
          slug: 'test-case-study',
          description: 'Test description',
          impact: 'Test impact',
          client: 'Test Client',
          duration: '3 months',
          skills: ['Test Skill'],
          ...overrides
        })
      },
      api: {
        mockResponse: (data: any, status: number = 200) => 
          new Response(JSON.stringify(data), { 
            status, 
            headers: { 'Content-Type': 'application/json' } 
          }),
        mockError: (message: string, status: number = 500) =>
          new Response(JSON.stringify({ error: message }), { 
            status, 
            headers: { 'Content-Type': 'application/json' } 
          })
      }
    };
  }

  /**
   * Merge default mocks with custom mocks
   */
  private static mergeMocks(defaultMocks: TestMocks, customMocks: Partial<TestMocks>): TestMocks {
    return {
      dom: { ...defaultMocks.dom, ...customMocks.dom },
      data: { ...defaultMocks.data, ...customMocks.data },
      api: { ...defaultMocks.api, ...customMocks.api }
    };
  }
}

/**
 * Test isolation validator with enhanced patterns
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
  
  // Check for TestContainer usage patterns
  if (testCode.includes('TestContainer') && !testCode.includes('await TestContainerFactory.create')) {
    issues.push('TestContainer detected without factory usage - use TestContainerFactory.create()');
  }
  
  // Check for proper async/await usage
  if (testCode.includes('TestContainerFactory.create') && !testCode.includes('await')) {
    issues.push('TestContainerFactory.create() requires await - missing await keyword');
  }
  
  return issues;
};

/**
 * Utility for running tests with automatic cleanup
 */
export const withTestContainer = async <T>(
  testFn: (container: TestContainer) => Promise<T>
): Promise<T> => {
  const container = await TestContainerFactory.create();
  
  try {
    return await testFn(container);
  } finally {
    await container.cleanup();
  }
};

/**
 * Utility for parameterized tests with isolated containers
 */
export const withIsolatedContainers = async <T, R>(
  testData: T[],
  testFn: (data: T, container: TestContainer) => Promise<R>
): Promise<R[]> => {
  const results: R[] = [];
  
  for (const data of testData) {
    const container = await TestContainerFactory.create();
    
    try {
      const result = await testFn(data, container);
      results.push(result);
    } finally {
      await container.cleanup();
    }
  }
  
  return results;
};
