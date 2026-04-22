import eslintPluginAstro from 'eslint-plugin-astro';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      'tests/reports/',
      '**/*.d.ts'
    ]
  },
  
  // Astro files
  ...eslintPluginAstro.configs.recommended,
  {
    files: ['**/*.astro'],
    plugins: {
      'jsx-a11y': jsxA11y,
    },
    rules: {
      // Security: Require rel="noopener noreferrer" on target="_blank" links
      'jsx-a11y/anchor-has-valid-rel': ['error', { components: ['a'], requireSelf: false }],
    },
  },

  // TypeScript files — security-focused rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Prevent code injection
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      // Prevent prototype pollution
      'no-extend-native': 'error',
      'no-proto': 'error',
      // TypeScript quality rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
