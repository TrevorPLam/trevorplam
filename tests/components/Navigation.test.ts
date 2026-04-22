import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { createTestContainer, renderComponent, createMockElement, waitFor } from '../utils/test-helpers';
import Navigation from '../../src/components/Navigation.astro';

describe('Navigation Component', () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeEach(async () => {
    container = await createTestContainer();
  });

  afterEach(async () => {
    // Cleanup if needed
  });

  test('renders site title and navigation links', async () => {
    const result = await renderComponent(Navigation);
    
    expect(result).toContain('Trevor Lam');
    expect(result).toContain('Home');
    expect(result).toContain('Evidence');
    expect(result).toContain('Trajectory');
    expect(result).toContain('Methodology');
    expect(result).toContain('Connect');
  });

  test('renders desktop navigation by default', async () => {
    const result = await renderComponent(Navigation);
    
    expect(result).toContain('hidden md:block');
    expect(result).not.toContain('md:hidden');
    expect(result).toContain('flex space-x-8');
  });

  test('renders mobile menu button by default', async () => {
    const result = await renderComponent(Navigation);
    
    expect(result).toContain('md:hidden');
    expect(result).toContain('mobile-menu-button');
    expect(result).toContain('aria-expanded="false"');
    expect(result).toContain('aria-label="Toggle navigation menu"');
    expect(result).toContain('hamburger-icon');
    expect(result).toContain('close-icon');
    expect(result).toContain('class="hidden"'); // Close icon hidden by default
  });

  test('renders mobile menu links (hidden by default)', async () => {
    const result = await renderComponent(Navigation);
    
    expect(result).toContain('mobile-menu');
    expect(result).toContain('class="hidden"'); // Menu hidden by default
    expect(result).toContain('Home');
    expect(result).toContain('Evidence');
    expect(result).toContain('Trajectory');
    expect(result).toContain('Methodology');
    expect(result).toContain('Connect');
  });

  test('has proper semantic structure', async () => {
    const result = await renderComponent(Navigation);
    
    expect(result).toContain('<nav');
    expect(result).toContain('role="navigation"');
    expect(result).toContain('sticky top-0 z-50');
    expect(result).toContain('max-w-7xl mx-auto');
  });

  test('has accessibility attributes', async () => {
    const result = await renderComponent(Navigation);
    
    // Check for proper ARIA attributes
    expect(result).toContain('aria-label="Toggle navigation menu"');
    expect(result).toContain('min-h-[44px] min-w-[44px]"'); // Touch target size
    expect(result).toContain('flex items-center justify-center"');
  });

  test('has responsive design classes', async () => {
    const result = await renderComponent(Navigation);
    
    expect(result).toContain('max-w-7xl');
    expect(result).toContain('mx-auto');
    expect(result).toContain('px-4');
    expect(result).toContain('sm:px-6');
    expect(result).toContain('lg:px-8');
  });

  test('includes ClientRouter for transitions', async () => {
    const result = await renderComponent(Navigation);
    
    expect(result).toContain('<ClientRouter />');
  });

  test('has proper hover states', async () => {
    const result = await renderComponent(Navigation);
    
    expect(result).toContain('hover:text-text-heading');
    expect(result).toContain('transition-colors');
  });
});
