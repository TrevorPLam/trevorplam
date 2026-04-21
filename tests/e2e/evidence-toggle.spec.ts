import { test, expect } from '@playwright/test';

test('evidence page toggle functionality', async ({ page }) => {
  await page.goto('/evidence');

  // Check initial state - Narrative view should be visible, Dashboard hidden
  const narrativeView = page.locator('#narrative-view');
  const forensicDashboard = page.locator('#forensic-dashboard');
  const narrativeLabel = page.locator('#narrative-label');
  const dashboardLabel = page.locator('#dashboard-label');
  const toggleSwitch = page.locator('[data-toggle-switch]');

  await expect(narrativeView).toBeVisible();
  await expect(forensicDashboard).toBeHidden();
  await expect(narrativeLabel).toHaveClass(/text-accent/);
  await expect(dashboardLabel).toHaveClass(/text-text-body/);
  await expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');

  // Test toggle to Dashboard view
  await toggleSwitch.click();
  
  await expect(narrativeView).toBeHidden();
  await expect(forensicDashboard).toBeVisible();
  await expect(narrativeLabel).toHaveClass(/text-text-body/);
  await expect(dashboardLabel).toHaveClass(/text-accent/);
  await expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');

  // Test toggle back to Narrative view
  await toggleSwitch.click();
  
  await expect(narrativeView).toBeVisible();
  await expect(forensicDashboard).toBeHidden();
  await expect(narrativeLabel).toHaveClass(/text-accent/);
  await expect(dashboardLabel).toHaveClass(/text-text-body/);
  await expect(toggleSwitch).toHaveAttribute('aria-checked', 'false');

  // Test keyboard accessibility (Space key)
  await toggleSwitch.focus();
  await page.keyboard.press('Space');
  
  await expect(narrativeView).toBeHidden();
  await expect(forensicDashboard).toBeVisible();
  await expect(toggleSwitch).toHaveAttribute('aria-checked', 'true');

  // Test ARIA attributes
  await expect(toggleSwitch).toHaveAttribute('role', 'switch');
  await expect(toggleSwitch).toHaveAttribute('aria-label', 'Toggle between Narrative and Dashboard views');

  // Test that content is properly structured
  await expect(narrativeView.locator('h2')).toContainText('Case Studies');
  await expect(forensicDashboard.locator('h2')).toContainText('Performance Metrics');

  // Test that MetricCard links work in Dashboard view
  await toggleSwitch.click(); // Switch to Dashboard view
  const firstMetricCard = forensicDashboard.locator('a').first();
  await expect(firstMetricCard).toHaveAttribute('href', '/cases/sonic');
});

test('evidence page accessibility', async ({ page }) => {
  await page.goto('/evidence');

  // Check for proper heading structure
  const h1 = page.locator('h1');
  await expect(h1).toBeVisible();
  await expect(h1).toContainText('Evidence of Impact');

  // Check ARIA switch is properly configured
  const toggleSwitch = page.locator('[data-toggle-switch]');
  await expect(toggleSwitch).toHaveAttribute('role', 'switch');
  await expect(toggleSwitch).toHaveAttribute('tabindex', '0');

  // Check that hidden content has proper aria-hidden
  const narrativeView = page.locator('#narrative-view');
  const forensicDashboard = page.locator('#forensic-dashboard');
  
  await expect(narrativeView).toHaveAttribute('aria-hidden', 'false');
  await expect(forensicDashboard).toHaveAttribute('aria-hidden', 'true');

  // Toggle and check aria-hidden updates
  await toggleSwitch.click();
  await expect(narrativeView).toHaveAttribute('aria-hidden', 'true');
  await expect(forensicDashboard).toHaveAttribute('aria-hidden', 'false');
});
