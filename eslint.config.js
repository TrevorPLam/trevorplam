import eslintPluginAstro from 'eslint-plugin-astro';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import secureCoding from 'eslint-plugin-secure-coding';
import browserSecurity from 'eslint-plugin-browser-security';

export default [
  // Global ignores
  {
    ignores: [
      'dist/',
      'node_modules/',
      '.astro/',
      '*.config.js',
      '*.config.mjs'
    ]
  },
  
  // JavaScript/TypeScript files
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'secure-coding': secureCoding,
      'browser-security': browserSecurity
    },
    rules: {
      ...typescriptPlugin.configs.recommended.rules,
      ...secureCoding.configs.recommended.rules,
      ...browserSecurity.configs.recommended.rules,
      // Testing-specific rules
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      'prefer-const': 'error',
      'no-console': 'warn'
    }
  },
  
  // Astro files
  ...eslintPluginAstro.configs.recommended,
  
  // Additional rules for all files
  {
    rules: {
      // Add any custom rules here
      'astro/no-set-html-directive': 'error'
    }
  }
];
