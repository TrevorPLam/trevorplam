import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Comprehensive Accessibility Tests', () => {
  test.describe('Homepage', () => {
    test('has no a11y violations', async ({ page }) => {
      await page.goto('/');
      
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });

    test('has no WCAG AA violations', async ({ page }) => {
      await page.goto('/');
      
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      expect(results.violations).toEqual([]);
    });

    test('navigation is keyboard accessible', async ({ page }) => {
      await page.goto('/');
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      const firstFocusable = await page.locator(':focus').isVisible();
      expect(firstFocusable).toBeTruthy();
      
      // Test through navigation items
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
        const hasFocus = await page.locator(':focus').count();
        expect(hasFocus).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Case Studies', () => {
    const caseStudies = ['grandlux', 'klw', 'sonic'];
    
    caseStudies.forEach(caseStudy => {
      test(`${caseStudy} case study has no a11y violations`, async ({ page }) => {
        await page.goto(`/cases/${caseStudy}`);
        
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });

      test(`${caseStudy} case study has no WCAG AA violations`, async ({ page }) => {
        await page.goto(`/cases/${caseStudy}`);
        
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();
        expect(results.violations).toEqual([]);
      });
    });
  });

  test.describe('Interactive Elements', () => {
    test('focus management works correctly', async ({ page }) => {
      await page.goto('/');
      
      // Test that focus is visible
      await page.keyboard.press('Tab');
      const focusedElement = await page.locator(':focus');
      expect(await focusedElement.isVisible()).toBeTruthy();
      
      // Test focus trap behavior (if modals exist)
      const focusableElements = await page.locator('button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])').count();
      expect(focusableElements).toBeGreaterThan(0);
    });

    test('color contrast meets WCAG standards', async ({ page }) => {
      await page.goto('/');
      
      const results = await new AxeBuilder({ page })
        .withTags(['color-contrast'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  });

  test.describe('Responsive Design Accessibility', () => {
    const viewports = [
      { width: 375, height: 667, name: 'Mobile' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 1920, height: 1080, name: 'Desktop' }
    ];

    viewports.forEach(viewport => {
      test(`${viewport.name} viewport has no a11y violations`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    });
  });
});
