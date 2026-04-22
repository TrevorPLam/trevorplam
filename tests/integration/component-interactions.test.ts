import { expect, test, describe } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { kpiCardFactory, metricCardFactory } from '../utils/test-factories';

describe('Component Integration Tests', () => {
  test('KPICard renders with proper structure', async () => {
    // Import the KPICard component
    const { default: KPICard } = await import('../../src/components/KPICard.astro');
    
    // Generate test data using factory
    const kpiData = kpiCardFactory.build({
      name: 'Customer Satisfaction',
      value: '95%',
      context: 'Improved customer satisfaction through better service'
    });

    // Render the component using Astro Container
    const container = await AstroContainer.create();
    const renderedHTML = await container.renderToString(KPICard, {
      props: kpiData
    });

    // Verify the rendered HTML contains expected content
    expect(renderedHTML).toContain('Customer Satisfaction');
    expect(renderedHTML).toContain('95%');
    expect(renderedHTML).toContain('Improved customer satisfaction through better service');
  });

  test('MetricCard integrates with KPICard data', async () => {
    // Import the MetricCard component
    const { default: MetricCard } = await import('../../src/components/MetricCard.astro');
    
    // Generate test data using factory
    const metricData = metricCardFactory.build({
      title: 'Revenue Growth',
      before: '$100K',
      after: '$250K',
      context: 'Increased revenue through strategic initiatives',
      skillTag: 'Growth'
    });

    // Render the component using Astro Container
    const container = await AstroContainer.create();
    const renderedHTML = await container.renderToString(MetricCard, {
      props: metricData
    });

    // Verify the rendered HTML contains expected content
    expect(renderedHTML).toContain('Revenue Growth');
    expect(renderedHTML).toContain('$100K');
    expect(renderedHTML).toContain('$250K');
    expect(renderedHTML).toContain('Increased revenue through strategic initiatives');
    expect(renderedHTML).toContain('Growth');
  });

  test('SidebarNavigation renders navigation structure', async () => {
    // Import the SidebarNavigation component
    const { default: SidebarNavigation } = await import('../../src/components/SidebarNavigation.astro');
    
    // Render the component using Astro Container
    const container = await AstroContainer.create();
    const renderedHTML = await container.renderToString(SidebarNavigation);

    // Verify the rendered HTML contains expected navigation structure
    expect(renderedHTML).toContain('Trevor Lam');
    expect(renderedHTML).toContain('Dashboard');
    expect(renderedHTML).toContain('Capabilities');
    expect(renderedHTML).toContain('Case Studies');
    expect(renderedHTML).toContain('Lab');
    expect(renderedHTML).toContain('Resources');
    expect(renderedHTML).toContain('Search');
    expect(renderedHTML).toContain('Archive');
    expect(renderedHTML).toContain('role="navigation"');
  });

  test('Footer renders with proper accessibility', async () => {
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
