import { describe, test, expect, beforeAll, afterAll, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  formatDate,
  getRelativeTime,
  isPast,
  isFuture,
  getYearRange
} from '../../src/utils/date';

describe('Property-Based Tests - Date Utilities', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('formatDate', () => {
    test('always returns string', () => {
      fc.assert(
        fc.property(fc.date(), (date) => {
          const result = formatDate(date);
          return typeof result === 'string';
        })
      );
    });

    test('handles date string input', () => {
      fc.assert(
        fc.property(fc.date().filter(date => !isNaN(date.getTime())), (date) => {
          const dateString = date.toISOString();
          const result = formatDate(dateString);
          return typeof result === 'string';
        })
      );
    });

    test('is idempotent for same input', () => {
      fc.assert(
        fc.property(fc.date(), (date) => {
          const first = formatDate(date);
          const second = formatDate(date);
          return first === second;
        })
      );
    });

    test('respects custom formatting options', () => {
      fc.assert(
        fc.property(fc.date(), fc.record({
          year: fc.constantFrom('numeric', '2-digit'),
          month: fc.constantFrom('numeric', '2-digit', 'long', 'short', 'narrow'),
          day: fc.constantFrom('numeric', '2-digit')
        }), (date, options) => {
          const result = formatDate(date, options);
          return typeof result === 'string';
        })
      );
    });
  });

  describe('getRelativeTime', () => {
    test('always returns string', () => {
      fc.assert(
        fc.property(fc.date(), (date) => {
          const result = getRelativeTime(date);
          return typeof result === 'string';
        })
      );
    });

    test('handles date string input', () => {
      fc.assert(
        fc.property(fc.date().filter(date => !isNaN(date.getTime())), (date) => {
          const dateString = date.toISOString();
          const result = getRelativeTime(dateString);
          return typeof result === 'string';
        })
      );
    });

    test('returns "just now" for very recent dates', () => {
      fc.assert(
        fc.property(fc.integer({ min: -59, max: -1 }), (secondsOffset) => {
          const recentDate = new Date('2024-01-15T12:00:00Z');
          recentDate.setSeconds(recentDate.getSeconds() + secondsOffset);
          const result = getRelativeTime(recentDate);
          return result === 'just now';
        })
      );
    });

    test('future dates do not contain "ago"', () => {
      fc.assert(
        fc.property(fc.date().filter(date => date.getTime() > Date.now()), (futureDate) => {
          const result = getRelativeTime(futureDate);
          return !result.includes('ago');
        })
      );
    });

    test('very old dates return formatted date', () => {
      fc.assert(
        fc.property(fc.date({ max: new Date('2023-12-15') }), (oldDate) => {
          // Pre-condition: only test valid dates
          if (isNaN(oldDate.getTime())) return true;
          const result = getRelativeTime(oldDate);
          return /\d{3,4}/.test(result); // Contains a 3 or 4 digit year
        })
      );
    });
  });

  describe('isPast', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(fc.date(), (date) => {
          const result = isPast(date);
          return typeof result === 'boolean';
        })
      );
    });

    test('handles date string input', () => {
      fc.assert(
        fc.property(fc.date().filter(date => !isNaN(date.getTime())), (date) => {
          const dateString = date.toISOString();
          const result = isPast(dateString);
          return typeof result === 'boolean';
        })
      );
    });

    test('past dates return true', () => {
      fc.assert(
        fc.property(fc.date({ max: new Date('2024-01-15T11:59:59Z') }), (pastDate) => {
          return isPast(pastDate);
        })
      );
    });

    test('future dates return false', () => {
      fc.assert(
        fc.property(fc.date({ min: new Date('2024-01-15T12:00:01Z') }), (futureDate) => {
          return !isPast(futureDate);
        })
      );
    });

    test('current moment returns false', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      expect(isPast(now)).toBe(false);
    });
  });

  describe('isFuture', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(fc.date(), (date) => {
          const result = isFuture(date);
          return typeof result === 'boolean';
        })
      );
    });

    test('handles date string input', () => {
      fc.assert(
        fc.property(fc.date().filter(date => !isNaN(date.getTime())), (date) => {
          const dateString = date.toISOString();
          const result = isFuture(dateString);
          return typeof result === 'boolean';
        })
      );
    });

    test('future dates return true', () => {
      fc.assert(
        fc.property(fc.date({ min: new Date('2024-01-15T12:00:01Z') }), (futureDate) => {
          // Pre-condition: only test valid dates
          if (isNaN(futureDate.getTime())) return true;
          return isFuture(futureDate);
        })
      );
    });

    test('past dates return false', () => {
      fc.assert(
        fc.property(fc.date({ max: new Date('2024-01-15T11:59:59Z') }), (pastDate) => {
          // Pre-condition: only test valid dates
          if (isNaN(pastDate.getTime())) return true;
          return !isFuture(pastDate);
        })
      );
    });

    test('current moment returns false', () => {
      const now = new Date('2024-01-15T12:00:00Z');
      expect(isFuture(now)).toBe(false);
    });
  });

  describe('getYearRange', () => {
    test('always returns string', () => {
      fc.assert(
        fc.property(fc.date(), fc.option(fc.date()), (startDate, endDateOption) => {
          const result = getYearRange(startDate, endDateOption);
          return typeof result === 'string';
        })
      );
    });

    test('handles date string input', () => {
      fc.assert(
        fc.property(
          fc.date().filter(date => !isNaN(date.getTime())), 
          fc.option(fc.date().filter(date => !isNaN(date.getTime()))), 
          (startDate, endDateOption) => {
            const startDateString = startDate.toISOString();
            const endDateString = endDateOption ? endDateOption.toISOString() : undefined;
            const result = getYearRange(startDateString, endDateString);
            return typeof result === 'string';
          }
        )
      );
    });

    test('returns single year when start and end are same year', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2000, max: 2030 }), (year) => {
          const startDate = new Date(`${year}-06-15T12:00:00Z`);
          const endDate = new Date(`${year}-12-15T12:00:00Z`);
          const result = getYearRange(startDate, endDate);
          return result === year.toString();
        })
      );
    });

    test('returns range when years differ', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 2000, max: 2020 }),
          fc.integer({ min: 2021, max: 2030 }),
          (startYear, endYear) => {
            const startDate = new Date(`${startYear}-06-15T12:00:00Z`);
            const endDate = new Date(`${endYear}-06-15T12:00:00Z`);
            const result = getYearRange(startDate, endDate);
            return result === `${startYear}-${endYear}`;
          }
        )
      );
    });

    test('uses current year when no end date provided', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2000, max: 2023 }), (startYear) => {
          const startDate = new Date(`${startYear}-06-15T12:00:00Z`);
          const result = getYearRange(startDate);
          return result.startsWith(startYear.toString()) && result.includes('2024');
        })
      );
    });

    test('is idempotent for same inputs', () => {
      fc.assert(
        fc.property(fc.date(), fc.option(fc.date()), (startDate, endDateOption) => {
          const first = getYearRange(startDate, endDateOption);
          const second = getYearRange(startDate, endDateOption);
          return first === second;
        })
      );
    });
  });
});
