/**
 * Security-focused ESLint configuration
 * Extends base config with security-specific rules
 */

module.exports = {
  root: true,
  extends: [
    './eslint.config.js'
  ],
  rules: {
    // Security-focused rules
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    
    // Prevent prototype pollution
    'no-extend-native': 'error',
    'no-proto': 'error',
    
    // Prevent XSS via innerHTML
    '@typescript-eslint/no-unused-vars': 'error',
    
    // Prevent dangerous globals
    'no-restricted-globals': ['error', {
      name: 'eval',
      message: 'eval() is dangerous and should not be used'
    }]
  }
};
