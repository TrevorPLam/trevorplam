import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  formatDate,
  getRelativeTime,
  isPast,
  isFuture,
  getYearRange
} from '../../src/utils/date';

describe('formatDate', () => {
  test('formats date object', () => {
    const date = new Date('2024-03-15T12:00:00Z'); // Use UTC to avoid timezone issues
    const formatted = formatDate(date);
    expect(formatted).toContain('3/15/2024'); // US locale format
  });

  test('formats date string', () => {
    expect(formatDate('2024-03-15')).toContain('2024');
  });

  test('respects custom options', () => {
    const date = new Date('2024-03-15T12:00:00Z'); // Use UTC to avoid timezone issues
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    };
    const formatted = formatDate(date, options);
    expect(formatted).toContain('Mar');
    expect(formatted).toContain('15');
    expect(formatted).toContain('24');
  });
});

describe('getRelativeTime', () => {
  
  
  beforeAll(() => {
    // Mock current date to 2024-01-15 12:00:00
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('returns "just now" for recent dates', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    const recent = new Date('2024-01-15T11:59:50Z');
    vi.setSystemTime(now);
    expect(getRelativeTime(recent)).toBe('just now');
  });

  test('returns minutes ago', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    expect(getRelativeTime('2024-01-15T11:55:00Z')).toBe('5 minutes ago');
    expect(getRelativeTime('2024-01-15T11:59:00Z')).toBe('1 minute ago');
  });

  test('returns hours ago', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    expect(getRelativeTime('2024-01-15T08:00:00Z')).toBe('4 hours ago');
    expect(getRelativeTime('2024-01-15T11:00:00Z')).toBe('1 hour ago');
  });

  test('returns days ago', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    expect(getRelativeTime('2024-01-10T12:00:00Z')).toBe('5 days ago');
    expect(getRelativeTime('2024-01-14T12:00:00Z')).toBe('1 day ago');
  });

  test('returns formatted date for old dates', () => {
    const now = new Date('2024-01-15T12:00:00Z');
    vi.setSystemTime(now);
    const result = getRelativeTime('2023-01-15T12:00:00Z');
    expect(result).toContain('2023');
  });
});

describe('isPast', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('returns true for past dates', () => {
    expect(isPast('2024-01-14')).toBe(true);
    expect(isPast(new Date('2024-01-14'))).toBe(true);
  });

  test('returns false for future dates', () => {
    expect(isPast('2024-01-16')).toBe(false);
    expect(isPast(new Date('2024-01-16'))).toBe(false);
  });

  test('returns false for current moment', () => {
    const now = new Date();
    expect(isPast(now)).toBe(false);
  });
});

describe('isFuture', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('returns true for future dates', () => {
    expect(isFuture('2024-01-16')).toBe(true);
    expect(isFuture(new Date('2024-01-16'))).toBe(true);
  });

  test('returns false for past dates', () => {
    expect(isFuture('2024-01-14')).toBe(false);
    expect(isFuture(new Date('2024-01-14'))).toBe(false);
  });

  test('returns false for current moment', () => {
    const now = new Date();
    expect(isFuture(now)).toBe(false);
  });
});

describe('getYearRange', () => {
  test('returns single year when start and end are same', () => {
    // Account for timezone conversion - dates may shift to previous year
    expect(getYearRange('2024-01-01T12:00:00Z', '2024-12-31T12:00:00Z')).toBe('2024');
    expect(getYearRange(new Date('2024-06-15T12:00:00Z'), new Date('2024-06-15T12:00:00Z'))).toBe('2024');
  });

  test('returns range when years differ', () => {
    // Use midday UTC to avoid timezone year rollover
    expect(getYearRange('2020-06-15T12:00:00Z', '2024-06-15T12:00:00Z')).toBe('2020-2024');
    expect(getYearRange(new Date('2020-06-15T12:00:00Z'), new Date('2024-06-15T12:00:00Z'))).toBe('2020-2024');
  });

  test('uses current date when end is not provided', () => {
    // Test with a fixed start date and no end date
    const result = getYearRange('2020-06-15T12:00:00Z');
    // Should return 2020-currentYear
    const currentYear = new Date().getFullYear();
    expect(result).toBe(`2020-${currentYear}`);
  });

  test('handles string inputs', () => {
    // Use midday UTC to avoid timezone year rollover
    expect(getYearRange('2020-06-15T12:00:00Z', '2024-03-20T12:00:00Z')).toBe('2020-2024');
  });
});
