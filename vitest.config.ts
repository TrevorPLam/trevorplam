import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    environment: 'happy-dom',
    testTimeout: 10000,
    hookTimeout: 10000,
    isolate: true,
    pool: 'threads',
    include: ['**/*.test.ts', '**/*.spec.ts'],
    exclude: ['node_modules/', 'dist/', 'tests/e2e/**', 'tests/a11y/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: 'tests/reports/coverage',
      exclude: ['node_modules/', 'tests/', '**/*.d.ts', '**/*.config.*'],
      thresholds: {
        // Global baseline
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        // Higher bar for utility functions
        'src/utils/**': {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90
        },
        // Moderate for UI components
        'src/components/**': {
          branches: 65,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    sequence: {
      concurrent: true
    },
    reporters: ['verbose', 'json'],
    outputFile: 'tests/reports/vitest-results.json'
    // Note: Removed deprecated globals config - use explicit imports instead
  }
}, {
  // Required for Astro 4.8+ - ensures proper Astro behavior in tests
  site: 'https://example.com/',
  trailingSlash: 'never'
});
