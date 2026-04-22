import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import Navigation from '../../src/components/Navigation.astro';

describe('Navigation Component - Behavior Based Tests', () => {
  test('provides access to main navigation sections', async () => {
    // Fresh container per test for proper isolation
    const container = await AstroContainer.create();
    const result = await container.renderToString(Navigation);

    // Test user behavior - not implementation details
    expect(result).toContain('<nav');
    expect(result).toContain('Trevor Lam');

    // Test accessibility using role-based selectors
    expect(result).toContain('aria-label="Toggle navigation menu"');
    expect(result).toContain('min-h-[44px]'); // Touch target size
    expect(result).toContain('min-w-[44px]');
  });

  test('desktop navigation links are accessible and functional', async () => {
    // Fresh container per test for proper isolation
    const container = await AstroContainer.create();
    const result = await container.renderToString(Navigation);

    // Test navigation links using semantic HTML structure
    expect(result).toContain('Home');
    expect(result).toContain('Evidence');
    expect(result).toContain('Trajectory');
    expect(result).toContain('Methodology');
    expect(result).toContain('Connect');
  });

  test('mobile menu button meets accessibility standards', async () => {
    // Fresh container per test for proper isolation
    const container = await AstroContainer.create();
    const result = await container.renderToString(Navigation);

    // Test mobile menu accessibility
    expect(result).toContain('aria-expanded="false"');
    expect(result).toContain('aria-controls="mobile-menu"');
    expect(result).toContain('min-h-[44px]'); // Proper touch target
    expect(result).toContain('min-w-[44px]');
  });

  test('navigation structure is semantic and responsive', async () => {
    // Fresh container per test for proper isolation
    const container = await AstroContainer.create();
    const result = await container.renderToString(Navigation);

    // Test semantic structure
    expect(result).toContain('sticky top-0 z-50'); // Sticky navigation
    expect(result).toContain('max-w-7xl'); // Responsive container
    expect(result).toContain('hidden md:block'); // Responsive design
    expect(result).toContain('md:hidden'); // Mobile-specific elements
  });

  test('navigation links have proper accessibility attributes', async () => {
    // Fresh container per test for proper isolation
    const container = await AstroContainer.create();
    const result = await container.renderToString(Navigation);

    // Test that all navigation links have proper attributes
    expect(result).toContain('href="/"');
    expect(result).toContain('href="/evidence"');
    expect(result).toContain('href="/trajectory"');
    expect(result).toContain('href="/methodology"');
    expect(result).toContain('href="/connect"');

    // Test hover states and transitions
    expect(result).toContain('hover:text-text-heading');
    expect(result).toContain('transition-colors');
  });
});
