import { defineConfig } from 'vitest/config';
import { getViteConfig } from 'astro/config';

export default defineConfig(
  getViteConfig({
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
        exclude: ['node_modules/', 'tests/', '**/*.d.ts'],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      },
      sequence: {
        concurrent: true
      },
      reporters: ['verbose', 'json']
      // Note: Removed deprecated globals config - use explicit imports instead
    }
  })
);
