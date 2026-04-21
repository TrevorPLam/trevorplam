import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import TimelineNode from '../../src/components/TimelineNode.astro';

describe('TimelineNode Component', () => {
  test('renders timeline node with role type', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(TimelineNode, {
      props: {
        year: '2021',
        title: 'Operations Manager',
        description: 'Led operational excellence initiatives across multiple departments',
        type: 'role'
      }
    });

    expect(result).toContain('2021');
    expect(result).toContain('Operations Manager');
    expect(result).toContain('Led operational excellence initiatives across multiple departments');
    expect(result).toContain('Role');
    expect(result).toContain('border-accent');
    expect(result).toContain('bg-accent');
  });

  test('renders timeline node with award type', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(TimelineNode, {
      props: {
        year: '2020',
        title: 'Employee of the Year',
        description: 'Recognized for outstanding performance and leadership',
        type: 'award'
      }
    });

    expect(result).toContain('2020');
    expect(result).toContain('Employee of the Year');
    expect(result).toContain('Award');
    expect(result).toContain('border-teal');
    expect(result).toContain('bg-teal');
  });

  test('renders timeline node with degree type', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(TimelineNode, {
      props: {
        year: '2022',
        title: 'Bachelor of Business Administration',
        description: 'The University of Texas at Dallas',
        type: 'degree'
      }
    });

    expect(result).toContain('2022');
    expect(result).toContain('Bachelor of Business Administration');
    expect(result).toContain('Degree');
    expect(result).toContain('border-yellow-500');
    expect(result).toContain('bg-yellow-500');
  });

  test('renders timeline node with constraint type', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(TimelineNode, {
      props: {
        year: '2019',
        title: 'Budget Reduction Mandate',
        description: '15% cost reduction required across all departments',
        type: 'constraint'
      }
    });

    expect(result).toContain('2019');
    expect(result).toContain('Budget Reduction Mandate');
    expect(result).toContain('Constraint');
    expect(result).toContain('border-orange-500');
    expect(result).toContain('bg-orange-500');
  });

  test('renders timeline node with future type', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(TimelineNode, {
      props: {
        year: 'Q1 2027',
        title: 'Chief of Staff Role',
        description: 'Strategic leadership position at enterprise level',
        type: 'future'
      }
    });

    expect(result).toContain('Q1 2027');
    expect(result).toContain('Chief of Staff Role');
    expect(result).toContain('Future');
    expect(result).toContain('border-cyan-400');
    expect(result).toContain('bg-cyan-400');
    expect(result).toContain('shadow-cyan-400/50');
    expect(result).toContain('shadow-lg');
  });

  test('renders proper timeline structure', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(TimelineNode, {
      props: {
        year: '2021',
        title: 'Test Role',
        description: 'Test description',
        type: 'role'
      }
    });

    expect(result).toContain('relative pl-8 pb-8 border-l border-border');
    expect(result).toContain('absolute -left-2 w-4 h-4 rounded-full border-2 border-bg');
    expect(result).toContain('bg-surface rounded-lg p-4 border border-border');
    expect(result).toContain('font-mono text-text-body text-sm');
    expect(result).toContain('text-text-heading font-semibold mb-2');
    expect(result).toContain('text-text-body text-sm');
  });
});
