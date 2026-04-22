import { expect, test, describe } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import MetricCard from '../../src/components/MetricCard.astro';
import { metricCardFactory } from '../utils/test-factories';

describe('MetricCard Browser Tests', () => {
  test('renders metric card correctly in real browser', async () => {
    // Generate test data using factory
    const metricData = metricCardFactory.build({
      title: 'Cost Reduction',
      before: '$2.5M',
      after: '$1.2M',
      context: 'Streamlined procurement processes reduced operational costs by 52%',
      skillTag: 'Operations',
      caseStudySlug: 'sonic'
    });

    // Render the Astro component using Astro Container
    const astroContainer = await AstroContainer.create();
    const renderedHTML = await astroContainer.renderToString(MetricCard, {
      props: metricData
    });

    // Create a test container and insert rendered HTML
    const container = document.createElement('div');
    container.innerHTML = renderedHTML;
    document.body.appendChild(container);

    // Test DOM interactions in real browser
    const title = page.getByText('Cost Reduction');
    await expect.element(title).toBeInTheDocument();

    const beforeValue = page.getByText('$2.5M');
    await expect.element(beforeValue).toBeInTheDocument();

    const afterValue = page.getByText('$1.2M');
    await expect.element(afterValue).toBeInTheDocument();

    const context = page.getByText('Streamlined procurement processes reduced operational costs by 52%');
    await expect.element(context).toBeInTheDocument();

    const skillTag = page.getByText('Operations');
    await expect.element(skillTag).toBeInTheDocument();

    const caseStudyLink = page.getByRole('link', { name: 'View Case Study' });
    await expect.element(caseStudyLink).toBeInTheDocument();
    await expect.element(caseStudyLink).toHaveAttribute('href', '/cases/sonic');
  });

  test('handles hover interactions correctly', async () => {
    const metricData = metricCardFactory.build({
      title: 'Revenue Growth',
      before: '$100K',
      after: '$250K',
      skillTag: 'Sales'
    });

    // Render the Astro component using Astro Container
    const astroContainer = await AstroContainer.create();
    const renderedHTML = await astroContainer.renderToString(MetricCard, {
      props: metricData
    });

    const container = document.createElement('div');
    container.innerHTML = renderedHTML;
    document.body.appendChild(container);

    const card = container.querySelector('.metric-card') as HTMLElement;
    
    // Test hover effect
    await userEvent.hover(card);
    
    // Verify hover state (this would depend on your CSS implementation)
    expect(card).toHaveClass('hover:scale-105');
    
    // Test mouse leave
    await userEvent.unhover(card);
  });

  test('supports keyboard navigation', async () => {
    const metricData = metricCardFactory.build({
      title: 'Customer Satisfaction',
      before: '65%',
      after: '92%',
      caseStudySlug: 'hubspot'
    });

    // Render the Astro component using Astro Container
    const astroContainer = await AstroContainer.create();
    const renderedHTML = await astroContainer.renderToString(MetricCard, {
      props: metricData
    });

    const container = document.createElement('div');
    container.innerHTML = renderedHTML;
    document.body.appendChild(container);

    const card = container.querySelector('.metric-card') as HTMLElement;
    const link = container.querySelector('.case-study-link') as HTMLElement;
    
    // Test keyboard focus
    card.focus();
    expect(card).toHaveFocus();
    
    // Test Tab navigation
    await userEvent.tab();
    expect(link).toHaveFocus();
    
    // Test Enter key on link
    const linkClick = vi.fn();
    link.addEventListener('click', linkClick);
    await userEvent.keyboard('{Enter}');
    expect(linkClick).toHaveBeenCalled();
  });

  test('visual regression test - metric card appearance', async () => {
    const metricData = metricCardFactory.build({
      title: 'Visual Test',
      before: '$1M',
      after: '$2M',
      context: 'Testing visual consistency',
      skillTag: 'Testing'
    });

    // Render the Astro component using Astro Container
    const astroContainer = await AstroContainer.create();
    const renderedHTML = await astroContainer.renderToString(MetricCard, {
      props: metricData
    });

    const container = document.createElement('div');
    container.innerHTML = renderedHTML;
    document.body.appendChild(container);

    // Visual regression test
    const card = container.querySelector('.metric-card') as HTMLElement;
    await expect.element(card).toMatchScreenshot();
  });

  test('performance test - render time', async () => {
    const startTime = performance.now();
    
    // Render the Astro component using Astro Container
    const astroContainer = await AstroContainer.create();
    const metricData = metricCardFactory.build();
    
    const renderedHTML = await astroContainer.renderToString(MetricCard, {
      props: metricData
    });

    const container = document.createElement('div');
    container.innerHTML = renderedHTML;
    document.body.appendChild(container);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Assert that rendering completes within acceptable time
    expect(renderTime).toBeLessThan(100); // 100ms threshold
  });

  test('accessibility test - screen reader compatibility', async () => {
    const metricData = metricCardFactory.build({
      title: 'Accessibility Test',
      before: '50%',
      after: '95%',
      context: 'Improved accessibility compliance'
    });

    // Render the Astro component using Astro Container
    const astroContainer = await AstroContainer.create();
    const renderedHTML = await astroContainer.renderToString(MetricCard, {
      props: metricData
    });

    const container = document.createElement('div');
    container.innerHTML = renderedHTML;
    document.body.appendChild(container);

    // Test ARIA attributes
    const card = container.querySelector('.metric-card') as HTMLElement;
    expect(card).toHaveAttribute('role', 'article');
    expect(card).toHaveAttribute('aria-labelledby', 'metric-title');
    
    const title = container.querySelector('#metric-title') as HTMLElement;
    expect(title).toBeInTheDocument();
    
    const valuesContainer = container.querySelector('.metric-values') as HTMLElement;
    expect(valuesContainer).toHaveAttribute('aria-label', 'Before and after values');
  });

  test('responsive design test - mobile viewport', async () => {
    // Set mobile viewport
    page.setViewportSize({ width: 375, height: 667 });
    
    const metricData = metricCardFactory.build({
      title: 'Mobile Test',
      before: '$10K',
      after: '$25K'
    });

    // Render the Astro component using Astro Container
    const astroContainer = await AstroContainer.create();
    const renderedHTML = await astroContainer.renderToString(MetricCard, {
      props: metricData
    });

    const container = document.createElement('div');
    container.innerHTML = renderedHTML;
    document.body.appendChild(container);

    const card = container.querySelector('.metric-card') as HTMLElement;
    
    // Test that card is visible in mobile viewport
    await expect.element(card).toBeInViewport();
    
    // Test responsive layout
    const flexContainer = container.querySelector('.flex') as HTMLElement;
    expect(flexContainer).toHaveClass('flex-col');
    
    // Reset to desktop viewport
    page.setViewportSize({ width: 1280, height: 720 });
  });
});
