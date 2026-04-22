import { expect, test, describe } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';

describe('Basic Component Integration Tests', () => {
  test('Astro Container can render simple HTML', async () => {
    // Create a simple test component
    const TestComponent = () => '<div class="test">Hello World</div>';
    
    // Render the component using Astro Container
    const container = await AstroContainer.create();
    const renderedHTML = await container.renderToString(TestComponent);

    // Verify the rendered HTML contains expected content
    expect(renderedHTML).toContain('Hello World');
    expect(renderedHTML).toContain('class="test"');
  });

  test('TestContainerFactory creates working container', async () => {
    const { TestContainerFactory } = await import('../utils/test-container');
    const container = await TestContainerFactory.create();

    // Test that the container can render a simple component
    const TestComponent = () => '<div class="factory-test">Factory Test</div>';
    const renderedHTML = await container.renderComponent(TestComponent);

    expect(renderedHTML).toContain('Factory Test');
    expect(renderedHTML).toContain('factory-test');

    // Cleanup
    await container.cleanup();
  });

  test('Footer component renders without errors', async () => {
    // Import the Footer component
    const { default: Footer } = await import('../../src/components/Footer.astro');
    
    // Render the component using Astro Container
    const container = await AstroContainer.create();
    const renderedHTML = await container.renderToString(Footer);

    // Verify the rendered HTML contains expected content and accessibility
    expect(renderedHTML).toContain('role="contentinfo"');
    expect(renderedHTML).toContain('Trevor Lam');
    expect(renderedHTML).toContain('All rights reserved');
    expect(renderedHTML).toContain('Operations, Chief of Staff, and HR/Payroll');
    expect(renderedHTML).toContain('LinkedIn');
    expect(renderedHTML).toContain('mailto:trevor@trevor-lam.com');
  });
});
