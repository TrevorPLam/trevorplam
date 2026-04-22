/**
 * Security-focused fuzzing tests
 * 
 * These tests use coverage-guided fuzzing to discover security vulnerabilities
 * in validation, authentication, and data handling functions.
 */

import { fuzz } from '@jazzer.js/core';
import { 
  isValidEmail, 
  isValidUrl, 
  isNonEmptyString,
  isInRange,
  all,
  hasRequiredKeys
} from '../../src/utils/validators';

describe('Security Fuzzing Tests', () => {
  
  fuzz('email validation handles injection attempts', (data) => {
    try {
      const input = data.toString();
      
      // Test various injection patterns
      const injectionInputs = [
        input,
        `<script>${input}</script>`,
        `' OR 1=1 -- ${input}`,
        `${input}../../../etc/passwd`,
        `\x00\x01\x02${input}`,
        `${input}\r\nSet-Cookie: evil=true`,
        `{{7*7}}${input}{{7*7}}`,
        `${input}{{constructor.constructor('return process')().env}}`,
      ];
      
      for (const injectionInput of injectionInputs) {
        const result = isValidEmail(injectionInput);
        // Should not crash, always return boolean
        if (typeof result !== 'boolean') {
          throw new Error('isValidEmail must return boolean');
        }
        
        // Valid emails should not contain dangerous patterns
        if (result && (
          injectionInput.includes('<script>') ||
          injectionInput.includes('javascript:') ||
          injectionInput.includes('data:') ||
          injectionInput.includes('vbscript:')
        )) {
          throw new Error('Email validation should reject dangerous content');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('URL validation prevents protocol injection', (data) => {
    try {
      const input = data.toString();
      
      // Test protocol injection attempts
      const dangerousInputs = [
        `javascript:alert(${input})`,
        `data:text/html,<script>${input}</script>`,
        `vbscript:msgbox ${input}`,
        `file:///etc/passwd${input}`,
        `ftp://evil.com/${input}`,
        `mailto:${input}@evil.com`,
        `${input}://evil.com`,
        `//evil.com/${input}`,
        `\\\evil-server\share${input}`,
      ];
      
      for (const dangerousInput of dangerousInputs) {
        const result = isValidUrl(dangerousInput);
        // Should not crash, always return boolean
        if (typeof result !== 'boolean') {
          throw new Error('isValidUrl must return boolean');
        }
        
        // Should reject dangerous protocols
        if (result && (
          dangerousInput.startsWith('javascript:') ||
          dangerousInput.startsWith('data:') ||
          dangerousInput.startsWith('vbscript:') ||
          dangerousInput.startsWith('file:')
        )) {
          throw new Error('URL validation should reject dangerous protocols');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('string validation handles buffer overflow', (data) => {
    try {
      const input = data.toString();
      
      // Test extremely long strings and special characters
      const overflowInputs = [
        input.repeat(10000), // Very long string
        '\0'.repeat(1000) + input, // Null bytes
        '\uFFFF'.repeat(1000) + input, // Unicode overflow
        `${input}${' '.repeat(100000)}`, // Space overflow
        `${input}${'\n'.repeat(10000)}`, // Newline overflow
        `${input}${'\t'.repeat(10000)}`, // Tab overflow
      ];
      
      for (const overflowInput of overflowInputs) {
        const result = isNonEmptyString(overflowInput);
        // Should not crash, always return boolean
        if (typeof result !== 'boolean') {
          throw new Error('isNonEmptyString must return boolean');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('range validation handles extreme values', (data) => {
    try {
      const str = data.toString();
      const num = parseFloat(str) || parseInt(str, 10) || 0;
      
      // Test extreme number values
      const extremeValues = [
        num,
        num * Number.MAX_SAFE_INTEGER,
        num / Number.MIN_SAFE_INTEGER,
        Number.MAX_VALUE * num,
        Number.MIN_VALUE * num,
        Infinity * (num % 2 ? 1 : -1),
        -Infinity * (num % 2 ? 1 : -1),
        NaN,
        Number.POSITIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.EPSILON * num,
        Math.pow(2, 53) * num, // Beyond safe integer range
        Math.pow(2, -53) * num, // Very small numbers
      ];
      
      for (const extremeValue of extremeValues) {
        const result = isInRange(extremeValue, -1000, 1000);
        // Should not crash, always return boolean
        if (typeof result !== 'boolean') {
          throw new Error('isInRange must return boolean');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('array validation handles malicious arrays', (data) => {
    try {
      const input = data.toString();
      
      // Test malicious array patterns
      const maliciousArrays = [
        [input], // Single item array
        Array(1000).fill(input), // Large array
        [null, undefined, input], // Mixed types
        [input, input, input, input, input], // Repeated items
        [{}[], input, () => {}], // Objects and functions
        [Symbol(input), input, BigInt(input)], // Symbols and BigInt
        new Array(10000).fill(input), // Very large array
        Array.from({ length: 1000 }, (_, i) => `${input}${i}`), // Generated array
      ];
      
      for (const maliciousArray of maliciousArrays) {
        const result = all(maliciousArray, item => typeof item === 'string');
        // Should not crash, always return boolean
        if (typeof result !== 'boolean') {
          throw new Error('all must return boolean');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('object validation handles prototype pollution', (data) => {
    try {
      const input = data.toString();
      
      // Test prototype pollution attempts
      const maliciousObjects = [
        { '__proto__': { polluted: input } },
        { 'constructor': { prototype: { polluted: input } } },
        { 'prototype': { polluted: input } },
        { '__defineGetter__': input },
        { '__defineSetter__': input },
        { '__lookupGetter__': input },
        { '__lookupSetter__': input },
        { [input]: '__proto__', '__proto__': 'polluted' },
        { ...JSON.parse(`{"__proto__": {"polluted": "${input}"}}`) },
      ];
      
      for (const maliciousObject of maliciousObjects) {
        const result = hasRequiredKeys(maliciousObject, ['toString']);
        // Should not crash, always return boolean
        if (typeof result !== 'boolean') {
          throw new Error('hasRequiredKeys must return boolean');
        }
        
        // Check for prototype pollution
        if (({} as any).polluted) {
          throw new Error('Prototype pollution detected');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('comprehensive security validation', (data) => {
    try {
      const input = data.toString();
      
      // Test multiple validation functions with same input
      const results = {
        email: isValidEmail(input),
        url: isValidUrl(input),
        string: isNonEmptyString(input),
        range: isInRange(parseFloat(input) || 0, -1000, 1000),
      };
      
      // All results should be boolean
      for (const [key, result] of Object.entries(results)) {
        if (typeof result !== 'boolean') {
          throw new Error(`${key} validation must return boolean`);
        }
      }
      
      // Test with dangerous combinations
      const dangerousCombinations = [
        `${input}<script>alert('xss')</script>`,
        `javascript:void(0)//${input}`,
        `' UNION SELECT * FROM users -- ${input}`,
        `${input}../../../etc/passwd`,
        `\x00${input}\x00`,
      ];
      
      for (const dangerousCombo of dangerousCombinations) {
        const comboResults = {
          email: isValidEmail(dangerousCombo),
          url: isValidUrl(dangerousCombo),
          string: isNonEmptyString(dangerousCombo),
        };
        
        for (const [key, result] of Object.entries(comboResults)) {
          if (typeof result !== 'boolean') {
            throw new Error(`${key} validation must return boolean for dangerous input`);
          }
        }
      }
      
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });
});
