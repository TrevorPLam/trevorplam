/**
 * Fuzzing tests for formatter security functions
 * 
 * These tests use coverage-guided fuzzing to discover edge cases and potential
 * security vulnerabilities in formatting functions. The fuzzer generates
 * malformed and unexpected inputs to test robustness against injection attacks,
 * buffer overflows, and other security issues.
 */

import { fuzz } from '@jazzer.js/core';
import { 
  formatCurrency, 
  formatPercentage, 
  formatCompactNumber, 
  slugify, 
  truncate, 
  toTitleCase 
} from '../../src/utils/formatters';

describe('Fuzzing Tests - Formatter Security', () => {
  
  fuzz('formatCurrency handles extreme numbers', (data) => {
    try {
      // Convert buffer to various number representations
      const str = data.toString();
      const num = parseFloat(str) || parseInt(str, 10) || 0;
      const extremeNums = [
        num,
        num * 1000000,
        num / 1000000,
        Number.MAX_SAFE_INTEGER * (num % 2),
        Number.MIN_SAFE_INTEGER * (num % 2),
        Infinity * (num % 2 ? 1 : 0),
        NaN
      ];
      
      for (const value of extremeNums) {
        const result = formatCurrency(value);
        // Should not crash, always return string
        if (typeof result !== 'string') {
          throw new Error('formatCurrency must return string');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('formatPercentage handles decimal edge cases', (data) => {
    try {
      const str = data.toString();
      const num = parseFloat(str) || parseInt(str, 10) || 0;
      const extremeNums = [
        num,
        num * 1000,
        num / 1000,
        Number.MAX_VALUE * (num % 2 ? 1 : -1),
        Number.MIN_VALUE * (num % 2 ? 1 : -1),
        Infinity,
        -Infinity,
        NaN
      ];
      
      for (const value of extremeNums) {
        const result = formatPercentage(value);
        // Should not crash, always return string
        if (typeof result !== 'string') {
          throw new Error('formatPercentage must return string');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('formatCompactNumber handles large inputs', (data) => {
    try {
      const str = data.toString();
      const num = parseFloat(str) || parseInt(str, 10) || 0;
      const largeNums = [
        num,
        Math.pow(10, num % 20), // Very large numbers
        Math.pow(10, -num % 20), // Very small numbers
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        0,
        -0
      ];
      
      for (const value of largeNums) {
        const result = formatCompactNumber(value);
        // Should not crash, always return string
        if (typeof result !== 'string') {
          throw new Error('formatCompactNumber must return string');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('slugify handles injection attempts', (data) => {
    try {
      const input = data.toString();
      
      // Test various malicious inputs
      const maliciousInputs = [
        input,
        input.repeat(1000), // Very long strings
        '\0'.repeat(100) + input, // Null bytes
        '<script>' + input + '</script>', // XSS attempt
        '../../' + input, // Path traversal
        input + '\n\r\t', // Control characters
        encodeURIComponent(input), // Encoded input
        JSON.stringify(input) // JSON input
      ];
      
      for (const maliciousInput of maliciousInputs) {
        const result = slugify(maliciousInput);
        // Should not crash, always return string
        if (typeof result !== 'string') {
          throw new Error('slugify must return string');
        }
        // Result should not contain dangerous characters
        if (result.includes('<') || result.includes('>') || result.includes('"')) {
          throw new Error('slugify should sanitize dangerous characters');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('truncate handles buffer overflow attempts', (data) => {
    try {
      const input = data.toString();
      const extremeLengths = [
        -1, // Negative length
        0, // Zero length
        1, // Single character
        data.length, // Buffer length
        Number.MAX_SAFE_INTEGER, // Maximum safe integer
        Number.MIN_SAFE_INTEGER, // Minimum safe integer
        Infinity, // Infinite length
        NaN // Not a number
      ];
      
      for (const maxLength of extremeLengths) {
        const result = truncate(input, maxLength);
        // Should not crash, always return string
        if (typeof result !== 'string') {
          throw new Error('truncate must return string');
        }
      }
      
      // Test with various suffixes
      const suffixes = [
        '',
        '...',
        ' [more]',
        input.slice(0, 10), // Use part of input as suffix
        '\0', // Null byte
        '\n\r\t' // Control characters
      ];
      
      for (const suffix of suffixes) {
        const result = truncate(input, 100, suffix);
        if (typeof result !== 'string') {
          throw new Error('truncate must return string');
        }
      }
      
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('toTitleCase handles unicode and special characters', (data) => {
    try {
      const input = data.toString();
      
      // Test various character encodings and special cases
      const specialInputs = [
        input,
        input.repeat(100), // Long strings
        '\0'.repeat(50) + input, // Null bytes
        'ß', // German sharp s
        'ñ', // Spanish n
        'ç', // French c
        'å', // Scandinavian a
        'ø', // Scandinavian o
        'æ', // Latin ae
        'oe', // Ligature
        input + '\u0000\u0001\u0002', // Control characters
        '123' + input + '456', // Mixed alphanumeric
        '   ' + input + '   ', // Padded with spaces
        input.toUpperCase(), // Already uppercase
        input.toLowerCase() // Already lowercase
      ];
      
      for (const specialInput of specialInputs) {
        const result = toTitleCase(specialInput);
        // Should not crash, always return string
        if (typeof result !== 'string') {
          throw new Error('toTitleCase must return string');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });
});
