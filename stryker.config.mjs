export default {
  // Test runner configuration
  testRunner: 'vitest',
  testRunnerOptions: {
    configFile: 'vitest.config.ts',
  },

  // TypeScript checker configuration
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',

  // Mutation testing configuration
  mutate: [
    'src/**/*.ts',
    'src/**/*.js',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
  ],

  // Files to include
  files: [
    'src/**/*.ts',
    'src/**/*.js',
    'tests/**/*.test.ts',
    'tests/**/*.spec.ts',
    'package.json',
    'tsconfig.json',
    'vitest.config.ts',
  ],

  // Reporter configuration
  reporters: [
    'progress',
    'clear-text',
    'html',
    'json',
  ],

  // Output directories
  htmlReporter: {
    baseDir: 'reports/mutation/html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/mutation-report.json',
  },

  // Thresholds for mutation score
  thresholds: {
    high: 80,
    low: 60,
    break: 60,
  },

  // Timeout settings
  timeoutFactor: 1.5,
  maxTestTimeoutMs: 30000,

  // Concurrency settings
  concurrency: 2,
  maxConcurrentTestRunners: 2,

  // Mutator settings
  mutator: 'javascript',
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
  ],

  // Coverage analysis
  coverageAnalysis: 'perTest',

  // Clean temp files
  cleanTempDir: true,
};
