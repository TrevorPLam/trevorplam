import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';
import { playwright } from '@vitest/browser-playwright';

export default getViteConfig({
  test: {
    environment: 'happy-dom',
    testTimeout: 3000, // 2026: Optimized from 5000ms for faster feedback
    hookTimeout: 3000,  // 2026: Optimized from 5000ms for faster feedback
    isolate: true,
    pool: 'threads',
    maxConcurrency: process.env.CI ? 4 : undefined,
    maxWorkers: process.env.CI ? 4 : undefined,
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: [
      'node_modules/', 
      'dist/', 
      'tests/e2e/**', 
      'tests/a11y/**', 
      'tests/browser/**', 
      'tests/visual/**', 
      '**/*.browser.{test,spec}.ts',
      'src/**/*.astro' // Exclude Astro components from direct parsing
    ],
    setupFiles: ['./tests/setup.ts'],
    deps: {
      inline: ['vitest/globals'] // Inline vitest globals to avoid import issues
    },
    bail: 1,
    fileParallelism: true,
    projects: [
      { 
        name: 'unit', 
        isolate: false, 
        include: ['tests/unit/**'],
        testTimeout: 2000, // 2026: Faster unit tests
        hookTimeout: 2000
      },
      { 
        name: 'components', 
        isolate: true, 
        include: ['tests/components/**'],
        testTimeout: 3000, // 2026: Optimized component tests
        hookTimeout: 3000,
        environment: 'browser' // Override for real browser testing
      },
      { 
        name: 'integration', 
        isolate: true, 
        include: ['tests/integration/**'],
        testTimeout: 5000, // 2026: Reduced integration test timeout
        hookTimeout: 5000
      },
      {
        name: 'property',
        isolate: true,
        include: ['tests/property/**'],
        testTimeout: 15000,
        hookTimeout: 5000
      },
      {
        name: 'contract',
        isolate: true,
        include: ['tests/contract/**'],
        testTimeout: 10000,
        hookTimeout: 5000
      },
      {
        name: 'browser',
        isolate: true,
        include: ['tests/browser/**/*.{test,spec}.ts', 'tests/**/*.browser.{test,spec}.ts'],
        testTimeout: 15000,
        hookTimeout: 10000,
        browser: {
          enabled: true,
          provider: playwright({
            launchOptions: {
              headless: process.env.CI ? true : false,
            },
            actionTimeout: 5000,
          }),
          instances: [
            { browser: 'chromium' },
            { browser: 'firefox' },
            { browser: 'webkit' }
          ],
          trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
          screenshot: process.env.CI ? 'only-on-failure' : 'off'
        }
      }
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'tests/reports/coverage',
      exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*', 'src/components/**'],
      thresholds: {
        // Global baseline
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Higher bar for utility functions only
        'src/utils/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        }
      }
    },
    sequence: {
      concurrent: true, // Enable concurrent execution for performance
      shuffle: false
    },
    reporters: ['default'],
    outputFile: 'tests/reports/vitest-results.json',
    watch: false,
    globals: false // Use explicit imports to prevent symbol conflicts
  }
}, {
  // Required for Astro 4.8+ - ensures proper Astro behavior in tests
  site: 'https://example.com/',
  trailingSlash: 'never'
});
