import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true, // Enable full parallelization for performance
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // Allow retries in CI for flaky test handling
  workers: process.env.CI ? 4 : undefined, // Use 4 workers in CI, default locally
  reporter: [['list'], ['json', { outputFile: 'tests/reports/playwright-results.json' }]],
  timeout: 10000, // Shorter timeout
  expect: {
    timeout: 5000,
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
  
  // MCP (Model Context Protocol) Configuration for AI Integration
  globalSetup: './tests/ai/mcp-global-setup.ts',
  globalTeardown: './tests/ai/mcp-global-teardown.ts',
  use: {
    // Use built static files - start preview server before tests
    baseURL: 'http://127.0.0.1:4173',
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry', // Conditional tracing
    colorScheme: 'light',
    actionTimeout: 5000,
    navigationTimeout: 5000,
    video: process.env.CI ? 'retain-on-failure' : 'off', // Conditional video recording
    screenshot: process.env.CI ? 'only-on-failure' : 'off' // Conditional screenshots
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
    timeout: 30 * 1000, // Shorter timeout
    stdout: 'pipe',
    stderr: 'pipe'
  },
});
