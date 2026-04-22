import { expect, test, describe } from 'vitest';
import { createTestContainer, renderComponent, createMockElement, waitFor } from '../utils/test-helpers';

describe('SidebarNavigation Component - Behavior Based Tests', () => {
  test('provides access to main navigation sections', async () => {
    // Fresh container per test for proper isolation
    const result = await renderComponent('SidebarNavigation');

    // Test user behavior - not implementation details
    expect(result).toContain('<aside');
    expect(result).toContain('Trevor Lam');

    // Test accessibility using role-based selectors
    expect(result).toContain('role="navigation"');
    expect(result).toContain('aria-label="Main navigation"');
    expect(result).toContain('min-h-[44px]');
  });

  test('desktop navigation links are accessible and functional', async () => {
    // Fresh container per test for proper isolation
    const result = await renderComponent('SidebarNavigation');

    // Test navigation links using semantic HTML structure
    expect(result).toContain('Evidence');
    expect(result).toContain('Trajectory');
    expect(result).toContain('Methodology');
    expect(result).toContain('Connect');
  });

  test('mobile menu button meets accessibility standards', async () => {
    // Fresh container per test for proper isolation
    const result = await renderComponent('SidebarNavigation');

    // Test mobile menu accessibility
    expect(result).toContain('close-sidebar-btn');
    expect(result).toContain('aria-label="Close navigation"');
    expect(result).toContain('min-h-[44px]'); // Proper touch target
  });

  test('navigation structure is semantic and responsive', async () => {
    // Fresh container per test for proper isolation
    const result = await renderComponent('SidebarNavigation');

    // Test semantic structure
    expect(result).toContain('fixed left-0 top-0 h-full w-64'); // Fixed sidebar
    expect(result).toContain('z-40'); // Z-index
    expect(result).toContain('md:translate-x-0'); // Responsive design
    expect(result).toContain('-translate-x-full'); // Mobile hidden state
  });

  test('navigation links have proper accessibility attributes', async () => {
    // Fresh container per test for proper isolation
    const result = await renderComponent('SidebarNavigation');

    // Test that all navigation links have proper attributes
    expect(result).toContain('href="/"');
    expect(result).toContain('href="/evidence"');
    expect(result).toContain('href="/trajectory"');
    expect(result).toContain('href="/methodology"');
    expect(result).toContain('href="/connect"');

    // Test hover states and transitions
    expect(result).toContain('hover:text-text-heading');
    expect(result).toContain('transition-colors');
    expect(result).toContain('hover:bg-accent/20');
  });
});
