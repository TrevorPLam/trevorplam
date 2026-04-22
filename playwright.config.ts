import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'tests/reports/playwright-html' }], ['json', { outputFile: 'tests/reports/playwright-results.json' }]],
  timeout: 30000,
  expect: {
    timeout: 10000,
    // Visual regression settings with 2026 best practices
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled'
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.02
    }
  },
  use: {
    // Use built static files - start preview server before tests
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    colorScheme: 'dark',
    actionTimeout: 15000,
    navigationTimeout: 15000
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Desktop Firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  // Add webServer to automatically start preview server
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'ignore',
    stderr: 'pipe'
  },
});
