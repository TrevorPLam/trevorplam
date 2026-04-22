import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  slugify,
  truncate,
  toTitleCase
} from '../../src/utils/formatters';

describe('Property-Based Tests - Formatters', () => {
  describe('formatCurrency', () => {
    test('always returns string with currency symbol', () => {
      fc.assert(
        fc.property(fc.integer(), (value) => {
          const result = formatCurrency(value);
          return typeof result === 'string' && /\$/.test(result);
        })
      );
    });

    test('handles negative numbers correctly', () => {
      fc.assert(
        fc.property(fc.integer({ max: -1 }), (value) => {
          const result = formatCurrency(value);
          return result.startsWith('-$');
        })
      );
    });

    test('zero formats correctly', () => {
      const result = formatCurrency(0);
      expect(result).toBe('$0');
    });

    test('is idempotent for same input', () => {
      fc.assert(
        fc.property(fc.integer(), (value) => {
          const first = formatCurrency(value);
          const second = formatCurrency(value);
          return first === second;
        })
      );
    });
  });

  describe('formatPercentage', () => {
    test('always ends with percent sign', () => {
      fc.assert(
        fc.property(fc.float(), (value) => {
          const result = formatPercentage(value);
          return typeof result === 'string' && result.endsWith('%');
        })
      );
    });

    test('respects decimal precision', () => {
      fc.assert(
        fc.property(fc.float({ min: -1000, max: 1000 }), fc.integer({ min: 0, max: 5 }), (value, decimals) => {
          const result = formatPercentage(value, decimals);
          const parts = result.split('%')[0].split('.');
          return parts.length <= 2 && (parts.length === 1 || parts[1].length <= decimals);
        })
      );
    });

    test('is idempotent for same input', () => {
      fc.assert(
        fc.property(fc.float(), fc.integer({ min: 0, max: 5 }), (value, decimals) => {
          const first = formatPercentage(value, decimals);
          const second = formatPercentage(value, decimals);
          return first === second;
        })
      );
    });
  });

  describe('formatCompactNumber', () => {
    test('always returns string', () => {
      fc.assert(
        fc.property(fc.integer(), (value) => {
          const result = formatCompactNumber(value);
          return typeof result === 'string';
        })
      );
    });

    test('handles zero correctly', () => {
      const result = formatCompactNumber(0);
      expect(result).toBe('0');
    });

    test('is idempotent for same input', () => {
      fc.assert(
        fc.property(fc.integer(), (value) => {
          const first = formatCompactNumber(value);
          const second = formatCompactNumber(value);
          return first === second;
        })
      );
    });
  });

  describe('slugify', () => {
    test('always returns lowercase alphanumeric with hyphens', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const result = slugify(text);
          return /^[a-z0-9-]*$/.test(result);
        })
      );
    });

    test('is idempotent - applying slugify twice yields same result', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const first = slugify(text);
          const second = slugify(first);
          return first === second;
        })
      );
    });

    test('never starts or ends with hyphen', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const result = slugify(text);
          return result.length === 0 || (result[0] !== '-' && result[result.length - 1] !== '-');
        })
      );
    });

    test('collapses consecutive hyphens', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const result = slugify(text);
          return !/--/.test(result);
        })
      );
    });

    test('preserves numbers', () => {
      fc.assert(
        fc.property(fc.stringMatching(/[0-9]+/), (text) => {
          const result = slugify(text);
          const numbersInOriginal = text.match(/[0-9]/g);
          const numbersInResult = result.match(/[0-9]/g);
          return numbersInOriginal === null || numbersInResult !== null;
        })
      );
    });
  });

  describe('truncate', () => {
    test('never exceeds max length including suffix', () => {
      fc.assert(
        fc.property(fc.string(), fc.integer({ min: 5, max: 100 }), fc.string({ maxLength: 2 }), (text, maxLength, suffix) => {
          const result = truncate(text, maxLength, suffix);
          return result.length <= maxLength;
        })
      );
    });

    test('returns original text when shorter than max', () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 10 }), fc.integer({ min: 15, max: 50 }), (text, maxLength) => {
          const result = truncate(text, maxLength);
          return result === text;
        })
      );
    });

    test('ends with suffix when truncated', () => {
      fc.assert(
        fc.property(fc.string({ minLength: 10 }), fc.integer({ min: 0, max: 9 }), fc.string({ minLength: 1, maxLength: 3 }), (text, maxLength, suffix) => {
          const result = truncate(text, maxLength, suffix);
          return text.length <= maxLength || result.endsWith(suffix);
        })
      );
    });
  });

  describe('toTitleCase', () => {
    test('always capitalizes first letter of each word', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const result = toTitleCase(text);
          const words = result.split(/\s+/);
          return words.every(word => word.length === 0 || word[0] === word[0].toUpperCase());
        })
      );
    });

    test('lowercases rest of each word', () => {
      fc.assert(
        fc.property(fc.string().filter(s => /^[a-zA-Z\s]+$/.test(s)), (text) => {
          const result = toTitleCase(text);
          const words = result.split(/\s+/);
          return words.every(word => 
            word.length <= 1 || word.slice(1) === word.slice(1).toLowerCase()
          );
        })
      );
    });

    test('is idempotent', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const first = toTitleCase(text);
          const second = toTitleCase(first);
          return first === second;
        })
      );
    });

    test('preserves word boundaries', () => {
      fc.assert(
        fc.property(fc.string(), (text) => {
          const result = toTitleCase(text);
          const originalWordCount = text.split(/\s+/).length;
          const resultWordCount = result.split(/\s+/).length;
          return originalWordCount === resultWordCount;
        })
      );
    });
  });
});
