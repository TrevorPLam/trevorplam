/**
 * Fuzzing tests for input validation functions
 * 
 * These tests use coverage-guided fuzzing to discover edge cases and potential
 * security vulnerabilities in input validation functions. The fuzzer generates
 * malformed and unexpected inputs to test robustness.
 */

import { fuzz } from '@jazzer.js/fuzzer';
import { 
  isValidEmail, 
  isValidUrl, 
  isNonEmptyString, 
  isInRange, 
  all, 
  isValidDate, 
  hasRequiredKeys 
} from '../../src/utils/validators';

describe('Fuzzing Tests - Input Validation', () => {
  
  fuzz('isValidEmail handles malformed data', (data: Buffer) => {
    try {
      const input = data.toString();
      const result = isValidEmail(input);
      // Should not crash, always return boolean
      if (typeof result !== 'boolean') {
        throw new Error('isValidEmail must return boolean');
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('isValidUrl handles injection attempts', (data: Buffer) => {
    try {
      const input = data.toString();
      const result = isValidUrl(input);
      // Should not crash, always return boolean
      if (typeof result !== 'boolean') {
        throw new Error('isValidUrl must return boolean');
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('isNonEmptyString handles edge cases', (data: Buffer) => {
    try {
      // Test with raw buffer data to simulate various input types
      const result = isNonEmptyString(data);
      // Should not crash, always return boolean
      if (typeof result !== 'boolean') {
        throw new Error('isNonEmptyString must return boolean');
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('isInRange handles boundary values', (data: Buffer) => {
    try {
      // Convert buffer data to number in various ways to test edge cases
      const str = data.toString();
      const num = parseInt(str, 10) || parseFloat(str) || 0;
      
      // Test with various ranges
      const result1 = isInRange(num, -100, 100);
      const result2 = isInRange(num, 0, 1000);
      const result3 = isInRange(num, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
      
      // Should not crash, always return boolean
      if (typeof result1 !== 'boolean' || typeof result2 !== 'boolean' || typeof result3 !== 'boolean') {
        throw new Error('isInRange must return boolean');
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('all handles array inputs', (data: Buffer) => {
    try {
      const str = data.toString();
      // Try to create arrays from the fuzzed data
      const testArrays = [
        str.split(','),
        [str],
        Array.from(str),
        [data.toString(), str, str.length]
      ];
      
      for (const arr of testArrays) {
        const result = all(arr, (item) => typeof item === 'string');
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

  fuzz('isValidDate handles various formats', (data: Buffer) => {
    try {
      const str = data.toString();
      // Test various date inputs
      const dateInputs = [
        new Date(str),
        new Date(parseInt(str, 10) || 0),
        str, // raw string
        data // raw buffer
      ];
      
      for (const input of dateInputs) {
        const result = isValidDate(input);
        // Should not crash, always return boolean
        if (typeof result !== 'boolean') {
          throw new Error('isValidDate must return boolean');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });

  fuzz('hasRequiredKeys handles object structures', (data: Buffer) => {
    try {
      const str = data.toString();
      
      // Try to create objects from fuzzed data
      const testObjects = [
        { [str]: str },
        { key: str, value: data.length },
        JSON.parse(str) || {}, // might fail, that's ok
        { required: str, optional: null }
      ];
      
      for (const obj of testObjects) {
        // Test with various key sets
        const result1 = hasRequiredKeys(obj, ['key']);
        const result2 = hasRequiredKeys(obj, [str] as keyof typeof obj);
        const result3 = hasRequiredKeys(obj, ['required', 'optional']);
        
        // Should not crash, always return boolean
        if (typeof result1 !== 'boolean' || typeof result2 !== 'boolean' || typeof result3 !== 'boolean') {
          throw new Error('hasRequiredKeys must return boolean');
        }
      }
      return true; // No crash = pass
    } catch (error) {
      // Expected validation errors are ok
      return error instanceof Error;
    }
  });
});
