import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import Navigation from '../../src/components/Navigation.astro';

describe('Navigation Component - Behavior Based Tests', () => {
  let container: AstroContainer;

  beforeEach(async () => {
    container = await AstroContainer.create();
  });

  afterEach(async () => {
    // Cleanup if needed
  });

  test('provides access to main navigation sections', async () => {
    const result = await container.renderToString(Navigation);
    
    // Test user behavior - not implementation details
    expect(result).toContain('<nav');
    expect(result).toContain('role="navigation"');
    expect(result).toContain('Trevor Lam');
    
    // Test accessibility using role-based selectors
    expect(result).toContain('aria-label="Toggle navigation menu"');
    expect(result).toContain('min-h-[44px] min-w-[44px]"'); // Touch target size
  });

  test('desktop navigation links are accessible and functional', async () => {
    const result = await container.renderToString(Navigation);
    
    // Test navigation links using semantic HTML structure
    expect(result).toMatch(/<a[^>]*role="link"[^>]*>Home<\/a>/);
    expect(result).toMatch(/<a[^>]*role="link"[^>]*>Evidence<\/a>/);
    expect(result).toMatch(/<a[^>]*role="link"[^>]*>Trajectory<\/a>/);
    expect(result).toMatch(/<a[^>]*role="link"[^>]*>Methodology<\/a>/);
    expect(result).toMatch(/<a[^>]*role="link"[^>]*>Connect<\/a>/);
  });

  test('mobile menu button meets accessibility standards', async () => {
    const result = await container.renderToString(Navigation);
    
    // Test mobile menu accessibility
    expect(result).toContain('aria-expanded="false"');
    expect(result).toContain('aria-controls="mobile-menu"');
    expect(result).toContain('class="min-h-[44px] min-w-[44px]"'); // Proper touch target
  });

  test('navigation structure is semantic and responsive', async () => {
    const result = await container.renderToString(Navigation);
    
    // Test semantic structure
    expect(result).toContain('<header'); // Main navigation in header
    expect(result).toContain('class="sticky top-0 z-50"'); // Sticky navigation
    expect(result).toContain('max-w-7xl mx-auto'); // Responsive container
  });

  test('client router integration works correctly', async () => {
    const result = await container.renderToString(Navigation);
    
    // Test client-side routing
    expect(result).toContain('ClientRouter'); // Component for client-side navigation
  });
});
