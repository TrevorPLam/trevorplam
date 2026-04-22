export default {
  // Test runner configuration
  testRunner: 'vitest',
  testRunnerOptions: {
    configFile: 'vitest.config.ts',
  },

  // TypeScript checker configuration
  checkers: ['typescript'],
  tsconfigFile: 'tsconfig.json',

  // Mutation testing configuration - focus on critical business logic
  mutate: [
    'src/utils/formatters.ts',
    'src/utils/validators.ts',
    'src/utils/date.ts',
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

  // Thresholds for mutation score - stricter for critical business logic
  thresholds: {
    high: 85,
    low: 70,
    break: 70,
  },

  // Timeout settings
  timeoutFactor: 1.5,
  maxTestTimeoutMs: 30000,

  // Concurrency settings
  concurrency: 3,
  maxConcurrentTestRunners: 3,

  // Mutator settings - focused on business logic mutations
  mutator: {
    'javascript': {
      'mutators': [
        'ArithmeticOperators',
        'ArrayOperators', 
        'BitwiseOperators',
        'BooleanSubstitution',
        'ConditionalExpression',
        'EqualityOperators',
        'LogicalOperators',
        'ObjectLiteral',
        'StringLiteral',
        'UnaryOperators',
        'UpdateOperators'
      ],
      'excludedMutations': [
        'ArrayPush', // Too basic
        'ArrayPop',  // Too basic
        'RegexLiteral' // Formatters use complex regex
      ]
    }
  },
  plugins: [
    '@stryker-mutator/vitest-runner',
    '@stryker-mutator/typescript-checker',
  ],

  // Coverage analysis
  coverageAnalysis: 'perTest',

  // Clean temp files
  cleanTempDir: true,
};
