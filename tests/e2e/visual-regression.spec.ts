import { test, expect } from '@playwright/test';
import { grandluxCaseStudyFactory, klwCaseStudyFactory, sonicCaseStudyFactory } from '../utils/test-factories';

/**
 * Visual Regression Tests
 * 
 * These tests capture and compare screenshots to detect UI changes.
 * Run locally with: npm run test:e2e -- tests/e2e/visual-regression.spec.ts --update-snapshots
 * 
 * Key pages to monitor:
 * - Homepage (hero, navigation, critical components)
 * - Case study pages (content layout, cards)
 * - Key interactive states (hover, focus)
 */

test.describe('Visual Regression - Homepage', () => {
  test('homepage matches baseline', async ({ page }) => {
    await page.goto('/');
    
    // Wait for critical content to load
    await page.waitForSelector('[role="navigation"]');
    await page.waitForLoadState('networkidle');
    
    // Capture full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true
    });
  });

  test('hero section matches baseline', async ({ page }) => {
    await page.goto('/');
    
    const hero = page.locator('header, [role="banner"]').first();
    await expect(hero).toBeVisible();
    
    await expect(hero).toHaveScreenshot('homepage-hero.png');
  });

  test('navigation matches baseline', async ({ page }) => {
    await page.goto('/');
    
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
    
    await expect(nav).toHaveScreenshot('homepage-navigation.png');
  });
});

test.describe('Visual Regression - Case Studies', () => {
  // Generate case study data using factories for deterministic, validated test data
  const caseStudies = [
    grandluxCaseStudyFactory.build().slug,
    klwCaseStudyFactory.build().slug,
    sonicCaseStudyFactory.build().slug
  ];

  for (const caseStudy of caseStudies) {
    test(`${caseStudy} case study matches baseline`, async ({ page }) => {
      await page.goto(`/cases/${caseStudy}`);
      
      // Wait for content to settle
      await page.waitForSelector('main, article, [role="main"]');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot(`case-study-${caseStudy}-full.png`, {
        fullPage: true
      });
    });
  }
});

test.describe('Visual Regression - Responsive States', () => {
  test('mobile viewport matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true
    });
  });

  test('tablet viewport matches baseline', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true
    });
  });
});

test.describe('Visual Regression - Interactive States', () => {
  test('navigation hover state', async ({ page }) => {
    await page.goto('/');
    
    const navLink = page.getByRole('navigation').getByRole('link').first();
    await navLink.hover();
    
    // Wait for hover state to apply using CSS assertion
    await expect(navLink).toHaveCSS('color', /rgb\(\d+, \d+, \d+\)/);
    
    const nav = page.getByRole('navigation');
    await expect(nav).toHaveScreenshot('navigation-hover-state.png');
  });

  test('button focus state', async ({ page }) => {
    await page.goto('/');
    
    const button = page.getByRole('link').filter({ hasText: /view|download/i }).first();
    await button.focus();
    
    await expect(button).toHaveScreenshot('button-focus-state.png');
  });
});

test.describe('Visual Regression - Dark Mode', () => {
  test('homepage in dark mode matches baseline', async ({ page }) => {
    // Set dark mode via browser context
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      fullPage: true
    });
  });
});
