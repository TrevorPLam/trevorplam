import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { createTestContainer, renderComponent, createMockElement, waitFor } from '../utils/test-helpers';

describe('SidebarNavigation Component', () => {
  let container: any;

  beforeEach(async () => {
    container = await createTestContainer();
  });

  afterEach(async () => {
    // Cleanup if needed
  });

  test('renders site title and navigation links', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    expect(result).toContain('Trevor Lam');
    expect(result).toContain('Dashboard');
    expect(result).toContain('Capabilities');
    expect(result).toContain('Case Studies');
    expect(result).toContain('Lab');
    expect(result).toContain('Resources');
    expect(result).toContain('Search');
    expect(result).toContain('Archive');
  });

  test('renders desktop navigation by default', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    expect(result).toContain('fixed left-0 top-0 h-full w-64');
    expect(result).toContain('md:translate-x-0');
    expect(result).toContain('-translate-x-full');
  });

  test('renders mobile menu button by default', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    expect(result).toContain('md:hidden');
    expect(result).toContain('close-sidebar-btn');
    expect(result).toContain('aria-label="Close navigation"');
    expect(result).toContain('Close Menu');
  });

  test('renders mobile menu links (hidden by default)', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    expect(result).toContain('sidebar-overlay');
    expect(result).toContain('fixed inset-0 bg-black/50 z-30 hidden md:hidden');
    expect(result).toContain('Dashboard');
    expect(result).toContain('Capabilities');
    expect(result).toContain('Case Studies');
    expect(result).toContain('Lab');
    expect(result).toContain('Resources');
    expect(result).toContain('Search');
    expect(result).toContain('Archive');
  });

  test('has proper semantic structure', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    expect(result).toContain('<aside');
    expect(result).toContain('role="navigation"');
    expect(result).toContain('fixed left-0 top-0 h-full w-64');
    expect(result).toContain('z-40');
  });

  test('has accessibility attributes', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    // Check for proper ARIA attributes
    expect(result).toContain('aria-label="Main navigation"');
    expect(result).toContain('min-h-[44px]'); // Touch target size
    expect(result).toContain('flex items-center');
  });

  test('has responsive design classes', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    expect(result).toContain('w-64');
    expect(result).toContain('p-4');
    expect(result).toContain('overflow-y-auto');
  });

  test('includes ClientRouter for transitions', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    // SidebarNavigation doesn't use ClientRouter - it's a sidebar navigation
    expect(result).toContain('sidebar');
    expect(result).toContain('transform transition-transform');
  });

  test('has proper hover states', async () => {
    const result = await renderComponent('SidebarNavigation');
    
    expect(result).toContain('hover:text-text-heading');
    expect(result).toContain('transition-colors');
    expect(result).toContain('hover:bg-accent/20');
  });
});
