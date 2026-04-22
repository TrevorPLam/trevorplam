import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import {
  isValidEmail,
  isValidUrl,
  isNonEmptyString,
  isInRange,
  all,
  isValidDate,
  hasRequiredKeys
} from '../../src/utils/validators';

describe('Property-Based Tests - Validators', () => {
  describe('isValidEmail', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(fc.string(), (email) => {
          const result = isValidEmail(email);
          return typeof result === 'boolean';
        })
      );
    });

    test('valid email patterns return true', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
          (validEmail) => {
            return isValidEmail(validEmail);
          }
        )
      );
    });

    test('rejects emails without @ symbol', () => {
      fc.assert(
        fc.property(fc.string().filter(s => !s.includes('@')), (invalidEmail) => {
          return !isValidEmail(invalidEmail);
        })
      );
    });

    test('rejects emails without domain', () => {
      fc.assert(
        fc.property(fc.stringMatching(/^[^\s@]+@$/), (invalidEmail) => {
          return !isValidEmail(invalidEmail);
        })
      );
    });

    test('rejects emails without local part', () => {
      fc.assert(
        fc.property(fc.stringMatching(/^@[^\s@]+\.[^\s@]+$/), (invalidEmail) => {
          return !isValidEmail(invalidEmail);
        })
      );
    });

    test('handles complex valid email patterns', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
          (complexEmail) => {
            return isValidEmail(complexEmail);
          }
        )
      );
    });
  });

  describe('isValidUrl', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(fc.string(), (url) => {
          const result = isValidUrl(url);
          return typeof result === 'boolean';
        })
      );
    });

    test('valid URLs with allowed protocols return true', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('https:', 'http:', 'mailto:', 'ftp:'),
          fc.domain(),
          fc.option(fc.webPath()),
          (protocol, domain, path) => {
            const url = `${protocol}//${domain}${path || ''}`;
            return isValidUrl(url);
          }
        )
      );
    });

    test('rejects URLs with disallowed protocols', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('file:', 'javascript:', 'data:', 'blob:'),
          fc.string(),
          (protocol, rest) => {
            const url = `${protocol}${rest}`;
            return !isValidUrl(url);
          }
        )
      );
    });

    test('rejects malformed URLs', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => !s.includes('://')),
          (malformedUrl) => {
            return !isValidUrl(malformedUrl);
          }
        )
      );
    });

    test('handles custom allowed protocols', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('https:', 'custom:'),
          fc.domain(),
          (protocol, domain) => {
            const url = `${protocol}//${domain}`;
            return isValidUrl(url, ['https:', 'custom:']);
          }
        )
      );
    });
  });

  describe('isNonEmptyString', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(fc.anything(), (value) => {
          const result = isNonEmptyString(value);
          return typeof result === 'boolean';
        })
      );
    });

    test('non-empty strings return true', () => {
      fc.assert(
        fc.property(
          fc.string().filter(s => s.trim().length > 0),
          (nonEmptyString) => {
            return isNonEmptyString(nonEmptyString);
          }
        )
      );
    });

    test('empty strings return false', () => {
      fc.assert(
        fc.property(fc.constantFrom('', '   ', '\n\t  '), (emptyString) => {
          return !isNonEmptyString(emptyString);
        })
      );
    });

    test('non-string values return false', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float(),
            fc.boolean(),
            fc.object(),
            fc.array(fc.anything()),
            fc.constantFrom(null),
            fc.constantFrom(undefined)
          ),
          (nonStringValue) => {
            return !isNonEmptyString(nonStringValue);
          }
        )
      );
    });

    test('type guard narrows type correctly', () => {
      fc.assert(
        fc.property(fc.string(), (value) => {
          if (isNonEmptyString(value)) {
            return typeof value === 'string' && value.trim().length > 0;
          }
          return true;
        })
      );
    });
  });

  describe('isInRange', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(fc.float(), fc.integer(), fc.integer(), (value, min, max) => {
          const result = isInRange(value, Math.min(min, max), Math.max(min, max));
          return typeof result === 'boolean';
        })
      );
    });

    test('values within range return true', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: 100 }),
          fc.integer({ min: -50, max: 50 }),
          fc.integer({ min: -49, max: 51 }),
          (min, middle, max) => {
            return isInRange(middle, min, max);
          }
        )
      );
    });

    test('boundary values return true', () => {
      fc.assert(
        fc.property(fc.integer(), fc.integer(), (min, max) => {
          const [actualMin, actualMax] = min <= max ? [min, max] : [max, min];
          return isInRange(actualMin, actualMin, actualMax) && 
                 isInRange(actualMax, actualMin, actualMax);
        })
      );
    });

    test('values outside range return false', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -100, max: -1 }),
          fc.integer({ min: 1, max: 100 }),
          fc.integer({ min: -200, max: -101 }),
          (min, max, outside) => {
            return !isInRange(outside, min, max);
          }
        )
      );
    });

    test('handles reversed min/max', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 100 }),
          (a, b) => {
            const value = Math.min(a, b);
            return isInRange(value, Math.max(a, b), Math.min(a, b));
          }
        )
      );
    });
  });

  describe('all', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(fc.array(fc.anything()), fc.func(fc.boolean()), (items, predicate) => {
          const result = all(items, predicate);
          return typeof result === 'boolean';
        })
      );
    });

    test('empty arrays return false', () => {
      fc.assert(
        fc.property(
          fc.func(fc.boolean()),
          (predicate) => {
            return !all([], predicate);
          }
        )
      );
    });

    test('null/undefined arrays return false', () => {
      fc.assert(
        fc.property(
          fc.func(fc.boolean()),
          (predicate) => {
            return !all(null, predicate) && !all(undefined, predicate);
          }
        )
      );
    });

    test('all items passing predicate return true', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 1, max: 100 })),
          (positiveNumbers) => {
            return all(positiveNumbers, n => n > 0);
          }
        )
      );
    });

    test('any item failing predicate returns false', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer()),
          (numbers) => {
            // Add a negative number to ensure at least one fails
            const withNegative = numbers.concat([-1]);
            return !all(withNegative, n => n >= 0);
          }
        )
      );
    });

    test('preserves predicate logic', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string()),
          fc.constantFrom(
            (s: string) => s.length > 0,
            (s: string) => s.includes('a'),
            (s: string) => s.startsWith('test'),
            (s: string) => /^[a-z]+$/.test(s)
          ),
          (strings, predicate) => {
            const result = all(strings, predicate);
            const manualResult = strings.every(predicate);
            return result === manualResult;
          }
        )
      );
    });
  });

  describe('isValidDate', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(fc.anything(), (value) => {
          const result = isValidDate(value);
          return typeof result === 'boolean';
        })
      );
    });

    test('valid Date objects return true', () => {
      fc.assert(
        fc.property(fc.date(), (date) => {
          return isValidDate(date);
        })
      );
    });

    test('non-Date values return false', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.string(),
            fc.float(),
            fc.boolean(),
            fc.object(),
            fc.array(fc.anything()),
            fc.constantFrom(null),
            fc.constantFrom(undefined)
          ),
          (nonDateValue) => {
            return !isValidDate(nonDateValue);
          }
        )
      );
    });

    test('invalid Date objects return false', () => {
      fc.assert(
        fc.property(fc.constantFrom(
          new Date('invalid'),
          new Date(''),
          new Date(NaN)
        ), (invalidDate) => {
          return !isValidDate(invalidDate);
        })
      );
    });

    test('type guard narrows type correctly', () => {
      fc.assert(
        fc.property(fc.anything(), (value) => {
          if (isValidDate(value)) {
            return value instanceof Date && !isNaN(value.getTime());
          }
          return true;
        })
      );
    });
  });

  describe('hasRequiredKeys', () => {
    test('always returns boolean', () => {
      fc.assert(
        fc.property(
          fc.dictionary(fc.string(), fc.anything()),
          fc.array(fc.string()),
          (obj, keys) => {
            const result = hasRequiredKeys(obj, keys as (keyof typeof obj)[]);
            return typeof result === 'boolean';
          }
        )
      );
    });

    test('objects with all required keys return true', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            email: fc.string(),
            age: fc.integer()
          }),
          (obj) => {
            return hasRequiredKeys(obj, ['name', 'email', 'age']);
          }
        )
      );
    });

    test('objects missing required keys return false', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string()
          }),
          (obj) => {
            return !hasRequiredKeys(obj, ['name'] as (keyof typeof obj)[]);
          }
        )
      );
    });

    test('null/undefined values for required keys return false', () => {
      fc.assert(
        fc.property(
          fc.record({
            name: fc.string(),
            email: fc.constantFrom(null, undefined),
            age: fc.integer()
          }),
          (obj) => {
            return !hasRequiredKeys(obj, ['name', 'email', 'age']);
          }
        )
      );
    });

    test('empty required keys array returns true', () => {
      fc.assert(
        fc.property(fc.dictionary(fc.string(), fc.anything()), (obj) => {
          return hasRequiredKeys(obj, []);
        })
      );
    });

    test('handles complex object structures', () => {
      fc.assert(
        fc.property(
          fc.record({
            user: fc.record({
              id: fc.integer(),
              profile: fc.record({
                name: fc.string(),
                settings: fc.record({
                  theme: fc.constantFrom('light', 'dark'),
                  notifications: fc.boolean()
                })
              })
            })
          }),
          (complexObj) => {
            const hasUser = hasRequiredKeys(complexObj, ['user']);
            const hasUserAndId = hasRequiredKeys(complexObj, ['user']);
            return hasUser && hasUserAndId;
          }
        )
      );
    });
  });
});
