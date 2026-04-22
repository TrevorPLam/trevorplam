import { describe, test, expect } from 'vitest';
import {
  isValidEmail,
  isValidUrl,
  isNonEmptyString,
  isInRange,
  all,
  isValidDate,
  hasRequiredKeys
} from '../../src/utils/validators';

describe('isValidEmail', () => {
  test('returns true for valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  test('returns false for invalid emails', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test@.com')).toBe(false);
    expect(isValidEmail('test@@example.com')).toBe(false);
  });

  test('returns false for non-strings', () => {
    expect(isValidEmail(null as unknown as string)).toBe(false);
    expect(isValidEmail(undefined as unknown as string)).toBe(false);
    expect(isValidEmail(123 as unknown as string)).toBe(false);
  });
});

describe('isValidUrl', () => {
  test('returns true for valid URLs with allowed protocols', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('https://example.com/path?query=1')).toBe(true);
    expect(isValidUrl('ftp://example.com')).toBe(true);
    expect(isValidUrl('mailto:user@example.com')).toBe(true);
  });

  test('returns false for invalid URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('//example.com')).toBe(false); // needs protocol
  });

  test('blocks dangerous protocols', () => {
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isValidUrl('vbscript:msgbox(1)')).toBe(false);
  });

  test('respects custom allowedProtocols list', () => {
    expect(isValidUrl('ftp://example.com', ['https:', 'http:'])).toBe(false);
    expect(isValidUrl('https://example.com', ['https:'])).toBe(true);
  });
});

describe('isNonEmptyString', () => {
  test('returns true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true);
    expect(isNonEmptyString('a')).toBe(true);
    expect(isNonEmptyString('  hello  ')).toBe(true); // whitespace counts
  });

  test('returns false for empty strings', () => {
    expect(isNonEmptyString('')).toBe(false);
    expect(isNonEmptyString('   ')).toBe(false);
  });

  test('returns false for non-strings', () => {
    expect(isNonEmptyString(null)).toBe(false);
    expect(isNonEmptyString(undefined)).toBe(false);
    expect(isNonEmptyString(123)).toBe(false);
    expect(isNonEmptyString([])).toBe(false);
    expect(isNonEmptyString({})).toBe(false);
  });
});

describe('isInRange', () => {
  test('returns true for numbers within range', () => {
    expect(isInRange(5, 0, 10)).toBe(true);
    expect(isInRange(0, 0, 10)).toBe(true); // boundary
    expect(isInRange(10, 0, 10)).toBe(true); // boundary
  });

  test('returns false for numbers outside range', () => {
    expect(isInRange(-1, 0, 10)).toBe(false);
    expect(isInRange(11, 0, 10)).toBe(false);
  });

  test('works with negative ranges', () => {
    expect(isInRange(-5, -10, 0)).toBe(true);
    expect(isInRange(-15, -10, 0)).toBe(false);
  });

  test('works with decimal ranges', () => {
    expect(isInRange(0.5, 0, 1)).toBe(true);
    expect(isInRange(1.1, 0, 1)).toBe(false);
  });
});

describe('all', () => {
  test('returns true when all items pass predicate', () => {
    expect(all([1, 2, 3], n => n > 0)).toBe(true);
    expect(all(['a', 'b', 'c'], s => s.length === 1)).toBe(true);
  });

  test('returns false when any item fails predicate', () => {
    expect(all([1, 2, -3], n => n > 0)).toBe(false);
    expect(all([1, 2, 3], n => n > 1)).toBe(false);
  });

  test('returns true for empty array', () => {
    expect(all([], () => false)).toBe(true);
  });

  test('works with complex predicates', () => {
    const users = [{ active: true }, { active: true }];
    expect(all(users, u => u.active)).toBe(true);
  });
});

describe('isValidDate', () => {
  test('returns true for valid dates', () => {
    expect(isValidDate(new Date())).toBe(true);
    expect(isValidDate(new Date('2024-01-01'))).toBe(true);
  });

  test('returns false for invalid dates', () => {
    expect(isValidDate(new Date('invalid'))).toBe(false);
    expect(isValidDate(new Date(''))).toBe(false);
  });

  test('returns false for non-dates', () => {
    expect(isValidDate(null)).toBe(false);
    expect(isValidDate(undefined)).toBe(false);
    expect(isValidDate('2024-01-01')).toBe(false);
    expect(isValidDate(1234567890)).toBe(false);
  });
});

describe('hasRequiredKeys', () => {
  test('returns true when all keys exist and have values', () => {
    const obj = { a: 1, b: 2, c: 3 };
    expect(hasRequiredKeys(obj, ['a', 'b'])).toBe(true);
  });

  test('returns false when any key is missing', () => {
    const obj = { a: 1, b: 2 } as Record<string, unknown>;
    expect(hasRequiredKeys(obj, ['a', 'c'])).toBe(false);
  });

  test('returns false for null or undefined values', () => {
    const obj = { a: 1, b: null, c: undefined } as Record<string, unknown>;
    expect(hasRequiredKeys(obj, ['a', 'b'])).toBe(false);
    expect(hasRequiredKeys(obj, ['a', 'c'])).toBe(false);
  });

  test('returns true for falsy but non-null values', () => {
    const obj = { a: 0, b: '', c: false };
    expect(hasRequiredKeys(obj, ['a', 'b', 'c'])).toBe(true);
  });

  test('returns true for empty keys array', () => {
    const obj = { a: 1 };
    expect(hasRequiredKeys(obj, [])).toBe(true);
  });
});
