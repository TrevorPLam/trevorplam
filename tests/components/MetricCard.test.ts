import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import MetricCard from '../../src/components/MetricCard.astro';

describe('MetricCard Component', () => {
  test('renders metric card with all props', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(MetricCard, {
      props: {
        title: 'Cost Reduction',
        before: '$2.5M',
        after: '$1.2M',
        context: 'Streamlined procurement processes reduced operational costs by 52%',
        skillTag: 'Operations',
        caseStudySlug: 'sonic'
      }
    });

    expect(result).toContain('Cost Reduction');
    expect(result).toContain('$2.5M');
    expect(result).toContain('$1.2M');
    expect(result).toContain('Streamlined procurement processes reduced operational costs by 52%');
    expect(result).toContain('Operations');
    expect(result).toContain('/cases/sonic');
    expect(result).toContain('font-mono');
  });

  test('renders metric card without optional props', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(MetricCard, {
      props: {
        title: 'Revenue Growth',
        before: '$100K',
        after: '$250K'
      }
    });

    expect(result).toContain('Revenue Growth');
    expect(result).toContain('$100K');
    expect(result).toContain('$250K');
    expect(result).not.toContain('Operations'); // skillTag not provided
    expect(result).not.toContain('sonic'); // caseStudySlug not provided
  });

  test('renders accessible link structure', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(MetricCard, {
      props: {
        title: 'Test Metric',
        before: '50%',
        after: '75%',
        caseStudySlug: 'test-case'
      }
    });

    expect(result).toContain('<a href="/cases/test-case"');
    expect(result).toContain('aria-label="Test Metric: improved from 50% to 75%"');
  });
});
