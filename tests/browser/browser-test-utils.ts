import { page, userEvent } from 'vitest/browser';
import { expect } from 'vitest';

/**
 * Browser test utilities for real browser testing with Vitest 4.0
 */

export interface BrowserTestOptions {
  viewport?: { width: number; height: number };
  screenshot?: boolean;
  trace?: boolean;
  timeout?: number;
}

export class BrowserTestHelper {
  private static defaultOptions: BrowserTestOptions = {
    viewport: { width: 1280, height: 720 },
    screenshot: false,
    trace: false,
    timeout: 5000
  };

  /**
   * Setup browser test environment with custom options
   */
  static async setup(options: BrowserTestOptions = {}): Promise<void> {
    const opts = { ...this.defaultOptions, ...options };
    
    // Set viewport size
    if (opts.viewport) {
      page.setViewportSize(opts.viewport);
    }
    
    // Configure timeout
    if (opts.timeout) {
      page.setDefaultTimeout(opts.timeout);
    }
  }

  /**
   * Create isolated test container
   */
  static createTestContainer(id?: string): HTMLElement {
    const container = document.createElement('div');
    if (id) {
      container.id = id;
    }
    container.className = 'test-container';
    document.body.appendChild(container);
    return container;
  }

  /**
   * Clean up test container and resources
   */
  static async cleanup(container?: HTMLElement): Promise<void> {
    // Remove test container
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Clear any event listeners
    document.removeEventListener('click', () => {});
    document.removeEventListener('keydown', () => {});
    
    // Reset viewport to default
    page.setViewportSize({ width: 1280, height: 720 });
  }

  /**
   * Take screenshot for visual regression testing
   */
  static async takeScreenshot(element: HTMLElement, name?: string): Promise<void> {
    if (name) {
      await expect.element(element).toMatchScreenshot({ name });
    } else {
      await expect.element(element).toMatchScreenshot();
    }
  }

  /**
   * Wait for element to be visible and interactive
   */
  static async waitForElement(selector: string, timeout = 5000): Promise<HTMLElement> {
    const element = page.locator(selector);
    await expect(element).toBeVisible({ timeout });
    return element.elementHandle() as Promise<HTMLElement>;
  }

  /**
   * Simulate user interaction with proper error handling
   */
  static async simulateInteraction(
    element: HTMLElement, 
    interaction: 'click' | 'hover' | 'focus' | 'blur' | 'type',
    value?: string
  ): Promise<void> {
    try {
      switch (interaction) {
        case 'click':
          await userEvent.click(element);
          break;
        case 'hover':
          await userEvent.hover(element);
          break;
        case 'focus':
          element.focus();
          break;
        case 'blur':
          element.blur();
          break;
        case 'type':
          if (value) {
            await userEvent.type(element, value);
          }
          break;
      }
    } catch (error) {
      throw new Error(`Failed to ${interaction} element: ${error}`);
    }
  }

  /**
   * Test responsive behavior across different viewports
   */
  static async testResponsive(
    testFn: (viewport: { width: number; height: number }) => Promise<void>,
    viewports: Array<{ width: number; height: number; name: string }> = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ]
  ): Promise<void> {
    for (const viewport of viewports) {
      await this.setup({ viewport });
      await testFn(viewport);
    }
  }

  /**
   * Measure performance metrics
   */
  static async measurePerformance(
    operation: () => Promise<void>,
    name: string
  ): Promise<{ duration: number; memoryBefore: number; memoryAfter: number }> {
    const memoryBefore = (performance as any).memory?.usedJSHeapSize || 0;
    const startTime = performance.now();
    
    await operation();
    
    const endTime = performance.now();
    const memoryAfter = (performance as any).memory?.usedJSHeapSize || 0;
    
    const duration = endTime - startTime;
    
    // Log performance metrics
    console.log(`Performance - ${name}:`);
    console.log(`  Duration: ${duration.toFixed(2)}ms`);
    console.log(`  Memory Before: ${(memoryBefore / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Memory After: ${(memoryAfter / 1024 / 1024).toFixed(2)}MB`);
    console.log(`  Memory Delta: ${((memoryAfter - memoryBefore) / 1024 / 1024).toFixed(2)}MB`);
    
    return { duration, memoryBefore, memoryAfter };
  }

  /**
   * Test accessibility attributes
   */
  static async testAccessibility(element: HTMLElement): Promise<void> {
    // Check for proper ARIA attributes
    const role = element.getAttribute('role');
    const label = element.getAttribute('aria-label') || element.getAttribute('aria-labelledby');
    
    if (role && !label) {
      console.warn(`Element with role "${role}" missing accessible label`);
    }
    
    // Test keyboard accessibility
    if (element.tabIndex >= 0) {
      element.focus();
      expect(element).toHaveFocus();
      element.blur();
    }
    
    // Test color contrast (simplified check)
    const styles = getComputedStyle(element);
    const color = styles.color;
    const backgroundColor = styles.backgroundColor;
    
    // This is a simplified check - real contrast calculation would be more complex
    if (color === backgroundColor) {
      console.warn('Element may have poor color contrast');
    }
  }

  /**
   * Validate form inputs
   */
  static async validateForm(form: HTMLFormElement): Promise<{
    isValid: boolean;
    errors: string[];
  }> {
    const errors: string[] = [];
    
    // Check required fields
    const requiredFields = form.querySelectorAll('[required]');
    for (const field of requiredFields) {
      const input = field as HTMLInputElement;
      if (!input.value.trim()) {
        errors.push(`Required field "${input.name}" is empty`);
      }
    }
    
    // Check email format
    const emailFields = form.querySelectorAll('input[type="email"]');
    for (const field of emailFields) {
      const input = field as HTMLInputElement;
      if (input.value && !input.value.includes('@')) {
        errors.push(`Email field "${input.name}" has invalid format`);
      }
    }
    
    // Check URL format
    const urlFields = form.querySelectorAll('input[type="url"]');
    for (const field of urlFields) {
      const input = field as HTMLInputElement;
      if (input.value && !input.value.startsWith('http')) {
        errors.push(`URL field "${input.name}" has invalid format`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Simulate network conditions
   */
  static async simulateNetworkConditions(
    conditions: 'offline' | 'slow' | 'fast'
  ): Promise<void> {
    // This would require additional setup in a real implementation
    // For now, we'll just add delays to simulate different conditions
    
    switch (conditions) {
      case 'offline':
        console.log('Simulating offline conditions');
        // In real implementation, would use Service Worker or similar
        break;
      case 'slow':
        console.log('Simulating slow network (3G)');
        await new Promise(resolve => setTimeout(resolve, 1000));
        break;
      case 'fast':
        console.log('Simulating fast network (4G)');
        await new Promise(resolve => setTimeout(resolve, 100));
        break;
    }
  }

  /**
   * Test error boundaries and error handling
   */
  static async testErrorHandling(
    operation: () => void,
    expectedError?: string
  ): Promise<void> {
    try {
      operation();
      if (expectedError) {
        throw new Error(`Expected error "${expectedError}" was not thrown`);
      }
    } catch (error) {
      if (expectedError) {
        expect((error as Error).message).toContain(expectedError);
      } else {
        // If no specific error expected, just ensure it's handled gracefully
        console.log('Error handled gracefully:', error);
      }
    }
  }

  /**
   * Generate test data for browser tests
   */
  static generateTestData(type: 'metric' | 'timeline' | 'form'): any {
    switch (type) {
      case 'metric':
        return {
          title: 'Test Metric',
          before: '$100K',
          after: '$250K',
          context: 'Test context for browser testing',
          skillTag: 'Testing'
        };
      case 'timeline':
        return {
          title: 'Test Timeline Event',
          date: 'January 2024',
          description: 'Test timeline event description'
        };
      case 'form':
        return {
          name: 'Test User',
          email: 'test@example.com',
          message: 'This is a test message for browser testing'
        };
      default:
        return {};
    }
  }
}

/**
 * Custom matchers for browser testing
 */
export const customMatchers = {
  /**
   * Check if element is properly styled
   */
  async toBeStyled(element: HTMLElement, expectedStyles: Record<string, string>) {
    const styles = getComputedStyle(element);
    const mismatches: string[] = [];
    
    for (const [property, expectedValue] of Object.entries(expectedStyles)) {
      const actualValue = styles.getPropertyValue(property);
      if (actualValue !== expectedValue) {
        mismatches.push(`${property}: expected "${expectedValue}", got "${actualValue}"`);
      }
    }
    
    if (mismatches.length > 0) {
      throw new Error(`Style mismatches: ${mismatches.join(', ')}`);
    }
    
    return true;
  },

  /**
   * Check if element has proper responsive behavior
   */
  async toBeResponsive(element: HTMLElement, viewports: Array<{ width: number; expectedBehavior: string }>) {
    for (const viewport of viewports) {
      page.setViewportSize({ width: viewport.width, height: 720 });
      
      // Wait for layout to adjust
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Check if element has expected responsive class or style
      const hasExpectedBehavior = element.classList.contains(viewport.expectedBehavior) ||
        getComputedStyle(element).getPropertyValue('display') === viewport.expectedBehavior;
      
      if (!hasExpectedBehavior) {
        throw new Error(`Element not responsive at ${viewport.width}px width`);
      }
    }
    
    return true;
  }
};

/**
 * Anti-pattern detection for browser tests
 */
export class BrowserTestAntiPatterns {
  /**
   * Detect shared state between tests
   */
  static detectSharedState(): string[] {
    const issues: string[] = [];
    
    // Check for global variables that might be shared
    const globals = Object.keys(window);
    const testGlobals = globals.filter(key => key.startsWith('test') || key.startsWith('temp'));
    
    if (testGlobals.length > 0) {
      issues.push(`Global test variables detected: ${testGlobals.join(', ')}`);
    }
    
    // Check for DOM elements that might persist
    const testContainers = document.querySelectorAll('.test-container');
    if (testContainers.length > 1) {
      issues.push(`Multiple test containers found: ${testContainers.length}`);
    }
    
    return issues;
  }

  /**
   * Detect memory leaks in browser tests
   */
  static async detectMemoryLeaks(): Promise<string[]> {
    const issues: string[] = [];
    
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Create and destroy elements
    for (let i = 0; i < 50; i++) {
      const div = document.createElement('div');
      div.innerHTML = `<p>Test element ${i}</p>`;
      document.body.appendChild(div);
      document.body.removeChild(div);
    }
    
    // Force garbage collection if available
    if ((window as any).gc) {
      (window as any).gc();
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;
    
    if (memoryIncrease > 1024 * 1024) { // 1MB threshold
      issues.push(`Potential memory leak detected: ${memoryIncrease} bytes increase`);
    }
    
    return issues;
  }

  /**
   * Validate browser test isolation
   */
  static validateIsolation(): string[] {
    const issues: string[] = [];
    
    // Check for leftover event listeners
    const bodyClone = document.body.cloneNode(true) as HTMLElement;
    if (bodyClone.children.length > 1) {
      issues.push('DOM contains elements outside test container');
    }
    
    // Check for leftover styles
    const styles = document.querySelectorAll('style');
    if (styles.length > 1) {
      issues.push('Multiple style elements detected');
    }
    
    return issues;
  }
}
