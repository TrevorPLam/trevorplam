import { test, expect, describe } from '@playwright/test';

describe('Navigation Integration Tests', () => {
  test('mobile menu toggle functionality works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Initially menu should be hidden on desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeHidden();
    
    // Switch to mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileMenuButton = page.getByRole('button', { name: 'Toggle navigation menu' });
    
    // Click to open menu
    await mobileMenuButton.click();
    
    // Verify menu opens and ARIA state changes
    await expect(mobileMenu).toBeVisible();
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'true');
    
    // Verify hamburger icon is hidden and close icon is visible
    const hamburgerIcon = page.locator('#hamburger-icon');
    const closeIcon = page.locator('#close-icon');
    await expect(hamburgerIcon).toBeHidden();
    await expect(closeIcon).toBeVisible();
  });

  test('mobile menu closes when clicking links', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu first
    const mobileMenuButton = page.getByRole('button', { name: 'Toggle navigation menu' });
    await mobileMenuButton.click();
    
    // Click on a navigation link
    const homeLink = page.getByRole('link', { name: 'Home' });
    await homeLink.click();
    
    // Verify menu closes and icons reset
    const mobileMenu = page.locator('#mobile-menu');
    const hamburgerIcon = page.locator('#hamburger-icon');
    const closeIcon = page.locator('#close-icon');
    
    await expect(mobileMenu).toBeHidden();
    await expect(hamburgerIcon).toBeVisible();
    await expect(closeIcon).toBeHidden();
    
    // Verify ARIA state is reset
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('keyboard navigation works with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Open mobile menu
    const mobileMenuButton = page.getByRole('button', { name: 'Toggle navigation menu' });
    await mobileMenuButton.click();
    
    // Verify menu is open
    const mobileMenu = page.locator('#mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Press Escape key
    await page.keyboard.press('Escape');
    
    // Verify menu closes
    await expect(mobileMenu).toBeHidden();
    
    // Verify ARIA state is reset
    await expect(mobileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('desktop navigation links are accessible', async ({ page }) => {
    await page.goto('/');
    
    // Test all navigation links for accessibility
    const homeLink = page.getByRole('link', { name: 'Home' });
    const evidenceLink = page.getByRole('link', { name: 'Evidence' });
    const trajectoryLink = page.getByRole('link', { name: 'Trajectory' });
    const methodologyLink = page.getByRole('link', { name: 'Methodology' });
    const connectLink = page.getByRole('link', { name: 'Connect' });
    
    // Verify all links are present and accessible
    await expect(homeLink).toBeVisible();
    await expect(evidenceLink).toBeVisible();
    await expect(trajectoryLink).toBeVisible();
    await expect(methodologyLink).toBeVisible();
    await expect(connectLink).toBeVisible();
    
    // Verify proper ARIA attributes and hover states
    await expect(homeLink).toHaveAttribute('href', '/');
    await expect(homeLink).toHaveClass(/text-text-body.*hover.*text-text-heading/);
  });

  test('navigation is responsive across viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      
      // Desktop navigation should be visible on larger screens
      if (viewport.width >= 768) {
        const desktopNav = page.locator('.hidden.md\\:block');
        await expect(desktopNav).toBeVisible();
        
        // Mobile menu button should be hidden
        const mobileMenuButton = page.getByRole('button', { name: 'Toggle navigation menu' });
        await expect(mobileMenuButton).toBeHidden();
      } else {
        // Mobile menu button should be visible on smaller screens
        const mobileMenuButton = page.getByRole('button', { name: 'Toggle navigation menu' });
        await expect(mobileMenuButton).toBeVisible();
        
        // Desktop navigation should be hidden
        const desktopNav = page.locator('.hidden.md\\:block');
        await expect(desktopNav).toBeHidden();
      }
    }
  });

  test('ClientRouter navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Click on a navigation link
    const evidenceLink = page.getByRole('link', { name: 'Evidence' });
    await evidenceLink.click();
    
    // Wait for navigation and verify URL change
    await expect(page).toHaveURL(/\/evidence/);
    
    // Verify navigation still works after client-side routing
    const homeLink = page.getByRole('link', { name: 'Home' });
    await expect(homeLink).toBeVisible();
  });
});
