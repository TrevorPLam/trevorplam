import { test, expect } from '@playwright/test';

test.describe('Trajectory Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/trajectory');
  });

  test('loads and displays timeline correctly', async ({ page }) => {
    // Check page title and header
    await expect(page).toHaveTitle(/Career Trajectory/);
    await expect(page.locator('h1')).toContainText('Career Trajectory');
    
    // Check that timeline nodes are present
    const timelineNodes = page.locator('[data-testid="timeline-node"]');
    await expect(timelineNodes.first()).toBeVisible();
    
    // Check for specific years in the timeline
    await expect(page.locator('text=2008')).toBeVisible();
    await expect(page.locator('text=2016')).toBeVisible();
    await expect(page.locator('text=2027')).toBeVisible();
  });

  test('displays constraint period explanation', async ({ page }) => {
    const constraintSection = page.locator('section[aria-labelledby="constraint-heading"]');
    await expect(constraintSection).toBeVisible();
    await expect(constraintSection).toContainText('Strategic Fortification Phase');
    await expect(constraintSection).toContainText('deliberate period');
  });

  test('horizontal scroll-snap works on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Check that horizontal scroll container is present
    const scrollContainer = page.locator('.overflow-x-auto');
    await expect(scrollContainer).toBeVisible();
    
    // Check that timeline nodes are arranged horizontally
    const timelineContainer = page.locator('.flex.gap-8');
    await expect(timelineContainer).toBeVisible();
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that vertical timeline is visible on mobile
    const verticalTimeline = page.locator('.md\\:hidden .space-y-6');
    await expect(verticalTimeline).toBeVisible();
    
    // Check that horizontal timeline is hidden on mobile
    const horizontalTimeline = page.locator('.hidden.md\\:block');
    await expect(horizontalTimeline).toBeHidden();
  });

  test('navigation from homepage works', async ({ page }) => {
    // Start from homepage
    await page.goto('/');
    
    // Click the "View Full Timeline" link
    await page.click('a[href="/trajectory"]');
    
    // Should navigate to trajectory page
    await expect(page).toHaveURL(/.*trajectory/);
    await expect(page.locator('h1')).toContainText('Career Trajectory');
  });
});
