import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import MetricCard from '../../src/components/MetricCard.astro';
import { metricCardFactory } from '../utils/test-factories';
import { TestDataManager, TestDataFactories } from '../utils/test-data-manager';

describe('MetricCard Component', () => {
  test('renders metric card with all props', async () => {
    // Use fresh container per test for proper isolation
    const container = await AstroContainer.create();
    
    // Generate test data using factory for runtime validation and consistency
    const metricData = metricCardFactory.build({
      title: 'Cost Reduction',
      before: '$2.5M',
      after: '$1.2M',
      context: 'Streamlined procurement processes reduced operational costs by 52%',
      skillTag: 'Operations',
      caseStudySlug: 'sonic'
    });
    
    const result = await container.renderToString(MetricCard, {
      props: metricData
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
    
    // Generate test data using factory, overriding only required fields
    const metricData = metricCardFactory.build({
      title: 'Revenue Growth',
      before: '$100K',
      after: '$250K',
      context: undefined, // Remove optional prop
      skillTag: undefined, // Remove optional prop
      caseStudySlug: undefined // Remove optional prop
    });
    
    const result = await container.renderToString(MetricCard, {
      props: metricData
    });

    expect(result).toContain('Revenue Growth');
    expect(result).toContain('$100K');
    expect(result).toContain('$250K');
    expect(result).not.toContain('Operations'); // skillTag not provided
    expect(result).not.toContain('sonic'); // caseStudySlug not provided
  });

  test('renders accessible link structure', async () => {
    const container = await AstroContainer.create();
    
    // Generate test data using factory with sequence for uniqueness
    const metricData = metricCardFactory.buildWithSequence({
      title: 'Test Metric',
      before: '50%',
      after: '75%',
      caseStudySlug: 'test-case'
    }, 'title');
    
    const result = await container.renderToString(MetricCard, {
      props: metricData
    });

    expect(result).toContain('<a href="/cases/test-case"');
    // Use the actual generated title for aria-label assertion
    expect(result).toContain(`aria-label="${metricData.title}: improved from 50% to 75%"`);
  });

  test('renders with isolated data manager', async () => {
    // Use fresh container per test for proper isolation
    const container = await AstroContainer.create();
    
    // Create isolated test data with automatic cleanup
    const { data: metricData, cleanup } = await TestDataManager.createIsolatedDataSet(
      TestDataFactories.metric
    );
    
    try {
      const result = await container.renderToString(MetricCard, { props: metricData });

      // Test that isolated data renders correctly
      expect(result).toContain(metricData.title);
      expect(result).toContain(metricData.before);
      expect(result).toContain(metricData.after);
      if (metricData.context) {
        expect(result).toContain(metricData.context);
      }
      if (metricData.skillTag) {
        expect(result).toContain(metricData.skillTag);
      }
    } finally {
      // Ensure cleanup is called
      await cleanup();
    }
  });
});
