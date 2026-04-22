import { expect, test, describe } from 'vitest';
import { page } from 'vitest/browser';

describe('Simple Browser Tests', () => {
  test('browser environment is working', async () => {
    // Test that we're in a browser environment
    expect(typeof window).toBe('object');
    expect(typeof document).toBe('object');
    
    // Test basic DOM manipulation
    const div = document.createElement('div');
    div.textContent = 'Hello Browser Test';
    document.body.appendChild(div);
    
    const element = page.getByText('Hello Browser Test');
    await expect.element(element).toBeInTheDocument();
    
    // Clean up
    document.body.removeChild(div);
  });

  test('page object is available', async () => {
    // Test that the page object from vitest/browser works
    expect(page).toBeDefined();
    
    // Test basic page functionality
    const title = page.title();
    expect(typeof title).toBe('string');
  });

  test('viewport can be set', async () => {
    // Test viewport manipulation
    page.setViewportSize({ width: 800, height: 600 });
    
    // Verify viewport was set (this is a basic test)
    const viewport = page.viewportSize();
    expect(viewport.width).toBe(800);
    expect(viewport.height).toBe(600);
  });
});
