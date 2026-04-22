import { expect, test, describe } from 'vitest';
import MetricCard from '../../src/components/MetricCard.astro';
import { TestContainerFactory } from '../utils/test-container';
import { TestDataFactories, withIsolatedData } from '../utils/test-data-manager';

describe('MetricCard Component - Behavior Based Tests', () => {
  test('renders metric card with meaningful content', async () => {
    await withIsolatedData(
      TestDataFactories.metric,
      async (metricData) => {
        const container = await TestContainerFactory.create();
        const result = await container.renderComponent(MetricCard, {
          title: 'Cost Reduction',
          before: '$2.5M',
          after: '$1.2M',
          context: 'Streamlined procurement processes reduced operational costs by 52%',
          skillTag: 'Operations'
        });

        // Test user behavior - not implementation details
        expect(result).toContain('Cost Reduction');
        expect(result).toContain('$2.5M');
        expect(result).toContain('$1.2M');
        expect(result).toContain('Streamlined procurement processes reduced operational costs by 52%');
        expect(result).toContain('Operations');
        
        await container.cleanup();
      }
    );
  });

  test('renders metric card without optional props', async () => {
    await withIsolatedData(
      TestDataFactories.metric,
      async (metricData) => {
        const container = await TestContainerFactory.create();
        const result = await container.renderComponent(MetricCard, {
          title: 'Revenue Growth',
          before: '$100K',
          after: '$250K'
        });

        // Test behavior - should not show optional elements
        expect(result).toContain('Revenue Growth');
        expect(result).toContain('$100K');
        expect(result).toContain('$250K');
        expect(result).not.toContain('Operations'); // skillTag not provided
        expect(result).not.toContain('test-case-study'); // caseStudySlug not provided
        
        await container.cleanup();
      }
    );
  });

  test('renders accessible link structure', async () => {
    await withIsolatedData(
      TestDataFactories.metric,
      async (metricData) => {
        const container = await TestContainerFactory.create();
        const result = await container.renderComponent(MetricCard, {
          title: 'Test Metric',
          before: '50%',
          after: '75%',
          caseStudySlug: 'test-case'
        });

        // Test accessibility - proper ARIA attributes
        expect(result).toContain('<a href="/cases/test-case"');
        expect(result).toContain('aria-label="Test Metric: improved from 50% to 75%"');
        
        await container.cleanup();
      }
    );
  });

  test('renders with factory-generated data', async () => {
    await withIsolatedData(
      TestDataFactories.metric,
      async (metricData) => {
        const container = await TestContainerFactory.create();
        const result = await container.renderComponent(MetricCard, metricData);

        // Test that factory data renders correctly
        expect(result).toContain(metricData.title);
        expect(result).toContain(metricData.before);
        expect(result).toContain(metricData.after);
        if (metricData.context) {
          expect(result).toContain(metricData.context);
        }
        if (metricData.skillTag) {
          expect(result).toContain(metricData.skillTag);
        }
        
        await container.cleanup();
      }
    );
  });

  test('renders with custom overrides', async () => {
    await withIsolatedData(
      TestDataFactories.metric,
      async (metricData) => {
        const container = await TestContainerFactory.create();
        const customData = TestDataFactories.metric.build({
          title: 'Custom Metric',
          before: '10%',
          after: '25%',
          context: 'Custom improvement context',
          skillTag: 'Custom Skill'
        });
        
        const result = await container.renderComponent(MetricCard, customData);

        // Test that custom overrides work
        expect(result).toContain('Custom Metric');
        expect(result).toContain('10%');
        expect(result).toContain('25%');
        expect(result).toContain('Custom improvement context');
        expect(result).toContain('Custom Skill');
        
        await container.cleanup();
      }
    );
  });
});
