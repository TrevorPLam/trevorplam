import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads and Hero section renders', async ({ page }) => {
    await page.goto('/');
    
    // Check main hero heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText('I Scale and Optimize Operations');
    
    // Check hero body text
    await expect(page.getByText('17 years of documented results')).toBeVisible();
    
    // Check CTAs are present
    await expect(page.getByRole('link', { name: 'View My Impact' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Connect on LinkedIn' }).first()).toBeVisible();
    
    // Verify page title
    await expect(page).toHaveTitle(/Trevor Lam/);
  });
});
