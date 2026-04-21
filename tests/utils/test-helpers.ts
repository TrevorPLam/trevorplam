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
