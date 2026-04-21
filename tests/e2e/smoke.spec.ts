import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('homepage loads and Hero section renders', async ({ page }) => {
    await page.goto('/');
    
    // Check if main hero elements are present
    await expect(page.getByRole('heading', { name: 'Trevor Lam' })).toBeVisible();
    await expect(page.getByText('Operations Integrator · Forensic Stabilizer')).toBeVisible();
    await expect(page.getByText("I'm the person you call when the machine is breaking, the money is leaking, and the people are quitting.")).toBeVisible();
    
    // Check if CTAs are present
    await expect(page.getByRole('link', { name: 'View the Evidence' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Download Resume' })).toBeVisible();
    
    // Verify page title
    await expect(page).toHaveTitle(/Trevor Lam/);
  });
});
