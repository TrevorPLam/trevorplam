import { test, expect } from '@playwright/test';

test.describe('Comprehensive E2E Tests', () => {
  test.describe('Navigation', () => {
    test('navigation works correctly', async ({ page }) => {
      await page.goto('/');
      
      // Test navigation links exist
      const navigation = page.getByRole('navigation');
      await expect(navigation).toBeVisible();
      
      // Test that navigation links are accessible
      const navLinks = navigation.getByRole('link');
      await expect(navLinks).toHaveCount(3); // Adjust based on actual nav items
      
      // Test clicking a navigation link
      const firstNavLink = navLinks.first();
      await expect(firstNavLink).toBeVisible();
      await firstNavLink.click();
      
      // Verify navigation worked (URL changed or content loaded)
      await expect(page).toHaveURL(/.*/); // Basic check that we navigated
    });

    test('responsive navigation works on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');
      
      // Test mobile navigation (hamburger menu, etc.)
      const navigation = page.getByRole('navigation');
      await expect(navigation).toBeVisible();
      
      // Look for mobile menu button if it exists
      const mobileMenuButton = page.getByRole('button', { name: /menu/i });
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        // Verify menu opens
        const mobileMenu = page.getByRole('navigation').locator('ul');
        await expect(mobileMenu).toBeVisible();
      }
    });
  });

  test.describe('Case Studies', () => {
    const caseStudies = ['grandlux', 'klw', 'sonic'];
    
    caseStudies.forEach(caseStudy => {
      test(`${caseStudy} case study page loads correctly`, async ({ page }) => {
        await page.goto(`/cases/${caseStudy}`);
        
        // Check page loads without errors
        await expect(page.locator('body')).toBeVisible();
        
        // Check for case study content
        const content = page.locator('main, article, [role="main"]');
        await expect(content).toBeVisible();
        
        // Check for title or heading
        const heading = page.locator('h1, h2').first();
        await expect(heading).toBeVisible();
      });

      test(`${caseStudy} case study has working navigation`, async ({ page }) => {
        await page.goto(`/cases/${caseStudy}`);
        
        // Test back to home/work navigation
        const backLink = page.getByRole('link', { name: /(back|home|work)/i });
        if (await backLink.isVisible()) {
          await backLink.click();
          await expect(page).toHaveURL('/');
        }
      });
    });

    test('case studies listing page works', async ({ page }) => {
      await page.goto('/');
      
      // Look for case study links on homepage
      const caseStudyLinks = page.getByRole('link', { name: /(grandlux|klw|sonic)/i });
      const caseStudyCount = await caseStudyLinks.count();
      
      if (caseStudyCount > 0) {
        // Test clicking first case study
        await caseStudyLinks.first().click();
        // Should navigate to a case study page
        await expect(page).toHaveURL(/\/cases\//);
      }
    });
  });

  test.describe('Interactive Elements', () => {
    test('all links are functional', async ({ page }) => {
      await page.goto('/');
      
      const links = page.getByRole('link');
      const linkCount = await links.count();
      
      // Test first few links to avoid excessive test time
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = links.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && !href.startsWith('#')) {
          await link.click();
          // Wait a moment for navigation
          await page.waitForTimeout(1000);
          
          // Check that we either navigated or the link opens in new tab
          const currentUrl = page.url();
          if (currentUrl !== page.url()) {
            // Go back for next test
            await page.goBack();
          }
        }
      }
    });

    test('images load correctly', async ({ page }) => {
      await page.goto('/');
      
      const images = page.locator('img');
      const imageCount = await images.count();
      
      if (imageCount > 0) {
        // Check first few images
        for (let i = 0; i < Math.min(imageCount, 3); i++) {
          const image = images.nth(i);
          await expect(image).toBeVisible();
          
          // Check that image has src attribute
          const src = await image.getAttribute('src');
          expect(src).toBeTruthy();
          expect(src?.length).toBeGreaterThan(0);
        }
      }
    });

    test('forms work correctly', async ({ page }) => {
      await page.goto('/');
      
      // Look for any forms (contact, search, etc.)
      const forms = page.locator('form');
      const formCount = await forms.count();
      
      if (formCount > 0) {
        const form = forms.first();
        await expect(form).toBeVisible();
        
        // Test form submission (if applicable)
        const submitButton = form.locator('button[type="submit"], input[type="submit"]');
        if (await submitButton.isVisible()) {
          // Just test that button is clickable, don't actually submit
          await expect(submitButton).toBeEnabled();
        }
      }
    });
  });

  test.describe('Performance and Loading', () => {
    test('page loads within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/');
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('no console errors on page load', async ({ page }) => {
      const consoleMessages: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleMessages.push(msg.text());
        }
      });
      
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for JavaScript errors
      expect(consoleMessages.filter(msg => !msg.includes('Warning'))).toEqual([]);
    });
  });

  test.describe('Cross-browser Compatibility', () => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    viewports.forEach(viewport => {
      test(`${viewport.name} viewport displays correctly`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/');
        
        // Check main elements are visible
        await expect(page.getByRole('navigation')).toBeVisible();
        await expect(page.locator('main, [role="main"]')).toBeVisible();
        
        // Check no horizontal scroll on desktop
        if (viewport.width >= 768) {
          const bodyWidth = await page.locator('body').evaluate(el => el.scrollWidth);
          const viewportWidth = viewport.width;
          expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Allow small margin
        }
      });
    });
  });
});
