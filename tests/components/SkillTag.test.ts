import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe } from 'vitest';
import SkillTag from '../../src/components/SkillTag.astro';

describe('SkillTag Component', () => {
  test('renders skill tag with label', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(SkillTag, {
      props: {
        label: 'Operations'
      }
    });

    expect(result).toContain('Operations');
    expect(result).toMatch(/class="[^"]*bg-teal[^"]*"/);
  });

  test('renders skill tag with different label', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(SkillTag, {
      props: {
        label: 'Analytics'
      }
    });

    expect(result).toContain('Analytics');
    expect(result).toMatch(/class="[^"]*bg-teal[^"]*"/);
  });

  test('renders as span element', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(SkillTag, {
      props: {
        label: 'Test Skill'
      }
    });

    expect(result).toContain('<span');
    expect(result).toContain('</span>');
  });

  test('renders proper pill styling', async () => {
    const container = await AstroContainer.create();
    
    const result = await container.renderToString(SkillTag, {
      props: {
        label: 'Leadership'
      }
    });

    expect(result).toContain('bg-teal');
    expect(result).toContain('text-white');
    expect(result).toContain('text-xs');
    expect(result).toContain('px-2');
    expect(result).toContain('py-1');
    expect(result).toContain('rounded-full');
    expect(result).toContain('inline-block');
  });
});
