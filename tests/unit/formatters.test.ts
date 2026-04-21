import { describe, test, expect } from 'vitest';
import {
  formatCurrency,
  formatPercentage,
  formatCompactNumber,
  slugify,
  truncate,
  toTitleCase
} from '../../src/utils/formatters';

describe('formatCurrency', () => {
  test('formats positive numbers as USD by default', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1234567)).toBe('$1,234,567');
  });

  test('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0');
  });

  test('formats negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-$500');
  });

  test('supports different currencies', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000');
    expect(formatCurrency(1000, 'GBP')).toBe('£1,000');
    expect(formatCurrency(1000, 'JPY')).toBe('¥1,000');
  });

  test('rounds decimals', () => {
    expect(formatCurrency(1000.99)).toBe('$1,001');
    expect(formatCurrency(1000.1)).toBe('$1,000');
  });
});

describe('formatPercentage', () => {
  test('formats whole numbers', () => {
    expect(formatPercentage(50)).toBe('50.0%');
    expect(formatPercentage(100)).toBe('100.0%');
  });

  test('formats decimal numbers', () => {
    expect(formatPercentage(50.5)).toBe('50.5%');
    expect(formatPercentage(33.333)).toBe('33.3%');
  });

  test('respects custom decimal places', () => {
    expect(formatPercentage(33.333, 0)).toBe('33%');
    expect(formatPercentage(33.333, 2)).toBe('33.33%');
  });

  test('formats zero and negative', () => {
    expect(formatPercentage(0)).toBe('0.0%');
    expect(formatPercentage(-25)).toBe('-25.0%');
  });
});

describe('formatCompactNumber', () => {
  test('formats thousands with K', () => {
    expect(formatCompactNumber(1500)).toBe('1.5K');
    expect(formatCompactNumber(1000)).toBe('1K');
  });

  test('formats millions with M', () => {
    expect(formatCompactNumber(1500000)).toBe('1.5M');
    expect(formatCompactNumber(1000000)).toBe('1M');
  });

  test('formats billions with B', () => {
    expect(formatCompactNumber(1500000000)).toBe('1.5B');
  });

  test('keeps small numbers as-is', () => {
    expect(formatCompactNumber(500)).toBe('500');
    expect(formatCompactNumber(999)).toBe('999');
  });

  test('handles zero', () => {
    expect(formatCompactNumber(0)).toBe('0');
  });
});

describe('slugify', () => {
  test('converts to lowercase', () => {
    expect(slugify('HELLO WORLD')).toBe('hello-world');
  });

  test('replaces spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world');
  });

  test('removes special characters', () => {
    expect(slugify('hello@world!')).toBe('hello-world');
    expect(slugify('test#123')).toBe('test-123');
  });

  test('removes leading/trailing hyphens', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
    expect(slugify('!hello!')).toBe('hello');
  });

  test('collapses multiple separators', () => {
    expect(slugify('hello   world')).toBe('hello-world');
    expect(slugify('a--b--c')).toBe('a-b-c');
  });

  test('handles empty string', () => {
    expect(slugify('')).toBe('');
  });
});

describe('truncate', () => {
  test('returns original if shorter than max', () => {
    expect(truncate('hello', 10)).toBe('hello');
  });

  test('truncates long strings', () => {
    expect(truncate('hello world', 8)).toBe('hello...');
  });

  test('uses custom suffix', () => {
    expect(truncate('hello world', 10, '…')).toBe('hello wor…');
  });

  test('handles exact length', () => {
    expect(truncate('hello', 5)).toBe('hello');
  });

  test('handles empty string', () => {
    expect(truncate('', 10)).toBe('');
  });
});

describe('toTitleCase', () => {
  test('capitalizes first letter of each word', () => {
    expect(toTitleCase('hello world')).toBe('Hello World');
  });

  test('handles single word', () => {
    expect(toTitleCase('hello')).toBe('Hello');
  });

  test('lowercases rest of word', () => {
    expect(toTitleCase('HELLO WORLD')).toBe('Hello World');
  });

  test('handles multiple spaces', () => {
    expect(toTitleCase('hello   world')).toBe('Hello   World');
  });

  test('handles empty string', () => {
    expect(toTitleCase('')).toBe('');
  });
});
