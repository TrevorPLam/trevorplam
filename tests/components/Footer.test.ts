import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test, describe, beforeEach, afterEach } from 'vitest';
import { createTestContainer, renderComponent } from '../utils/test-helpers';
import Footer from '../../src/components/Footer.astro';

describe('Footer Component', () => {
  let container: Awaited<ReturnType<typeof AstroContainer.create>>;

  beforeEach(async () => {
    container = await createTestContainer();
  });

  afterEach(async () => {
    // Cleanup if needed
  });

  test('renders current year dynamically', async () => {
    const result = await renderComponent(Footer);
    const currentYear = new Date().getFullYear();
    
    expect(result).toContain(currentYear.toString());
    expect(result).toContain('©');
    expect(result).toContain('Trevor Lam');
    expect(result).toContain('All rights reserved');
  });

  test('renders availability statement', async () => {
    const result = await renderComponent(Footer);
    
    expect(result).toContain('Available for Operations, Chief of Staff, and HR/Payroll opportunities');
  });

  test('renders LinkedIn link with proper attributes', async () => {
    const result = await renderComponent(Footer);
    
    expect(result).toContain('href="https://linkedin.com/in/trevor-lam"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).toContain('aria-label="LinkedIn profile"');
  });

  test('renders email link with proper attributes', async () => {
    const result = await renderComponent(Footer);
    
    expect(result).toContain('href="mailto:trevor@trevor-lam.com"');
    expect(result).toContain('aria-label="Email contact"');
  });

  test('has proper semantic structure', async () => {
    const result = await renderComponent(Footer);
    
    expect(result).toContain('<footer');
    expect(result).toContain('role="contentinfo"');
    expect(result).toContain('text-center');
  });

  test('has responsive design classes', async () => {
    const result = await renderComponent(Footer);
    
    expect(result).toContain('max-w-7xl');
    expect(result).toContain('mx-auto');
    expect(result).toContain('px-4');
    expect(result).toContain('sm:px-6');
    expect(result).toContain('lg:px-8');
  });

  test('has proper styling classes', async () => {
    const result = await renderComponent(Footer);
    
    expect(result).toContain('bg-surface');
    expect(result).toContain('border-t');
    expect(result).toContain('border-border');
    expect(result).toContain('mt-auto');
  });
});
