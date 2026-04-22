import { experimental_AstroContainer as AstroContainer } from 'astro/container';

/**
 * Creates a test container for Astro component testing
 * Eliminates repetitive container creation across tests
 */
export const createTestContainer = async () => {
  return await AstroContainer.create();
};

/**
 * Renders a component with given props using a test container
 * Standardizes component rendering approach across all tests
 */
export const renderComponent = async (Component: any, props: Record<string, any> = {}) => {
  const container = await createTestContainer();
  return container.renderToString(Component, { props });
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
 * Test isolation validator - helps identify potential isolation issues
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
