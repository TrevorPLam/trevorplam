/**
 * Validation utilities
 * 
 * Provides helper functions for validating common data types and structures
 * used throughout the application for form validation, data integrity checks,
 * and type safety assertions.
 * 
 * @example
 * ```typescript
 * import { isValidEmail, isValidUrl, isNonEmptyString } from './validators';
 * 
 * if (isValidEmail('user@example.com')) {
 *   // Process valid email
 * }
 * 
 * if (isNonEmptyString(input)) {
 *   // Process non-empty string
 * }
 * ```
 * 
 * @since 1.0.0
 */

/**
 * Validates email address format
 * 
 * Uses a regular expression to validate that an email string follows
 * the basic format of local-part@domain. This is a simple validation
 * that checks for the structure but doesn't guarantee deliverability.
 * 
 * @param email - The email address to validate
 * @returns True if the email format is valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com'); // true
 * isValidEmail('user.name+tag@domain.co.uk'); // true
 * isValidEmail('invalid-email'); // false
 * isValidEmail('user@'); // false
 * isValidEmail('@domain.com'); // false
 * isValidEmail(''); // false
 * ```
 * 
 * @since 1.0.0
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 * 
 * Uses the URL constructor to validate that a string can be parsed
 * as a valid URL. This checks for proper URL structure including
 * protocol, domain, and path components.
 * 
 * @param url - The URL string to validate
 * @returns True if the URL format is valid, false otherwise
 * 
 * @example
 * ```typescript
 * isValidUrl('https://example.com'); // true
 * isValidUrl('https://example.com/path?query=value'); // true
 * isValidUrl('ftp://files.example.com'); // true
 * isValidUrl('not-a-url'); // false
 * isValidUrl(''); // false
 * isValidUrl('example.com'); // false (missing protocol)
 * ```
 * 
 * @since 1.0.0
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validates that a value is a non-empty string
 * 
 * Type guard that checks if a value is a string with content
 * after trimming whitespace. Useful for form validation and
 * ensuring required string fields are provided.
 * 
 * @param value - The value to validate
 * @returns True if the value is a non-empty string, false otherwise
 * 
 * @example
 * ```typescript
 * isNonEmptyString('hello'); // true
 * isNonEmptyString('  hello  '); // true
 * isNonEmptyString('   '); // false
 * isNonEmptyString(''); // false
 * isNonEmptyString(123); // false
 * isNonEmptyString(null); // false
 * isNonEmptyString(undefined); // false
 * ```
 * 
 * @since 1.0.0
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates that a number is within a specified range
 * 
 * Checks if a numeric value falls between minimum and maximum
 * values inclusive. Useful for validating numeric inputs, ages,
 * percentages, and other bounded values.
 * 
 * @param value - The number to validate
 * @param min - The minimum allowed value (inclusive)
 * @param max - The maximum allowed value (inclusive)
 * @returns True if the number is within range, false otherwise
 * 
 * @example
 * ```typescript
 * isInRange(5, 1, 10); // true
 * isInRange(1, 1, 10); // true
 * isInRange(10, 1, 10); // true
 * isInRange(0, 1, 10); // false
 * isInRange(11, 1, 10); // false
 * isInRange(-5, -10, -1); // true
 * ```
 * 
 * @since 1.0.0
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validates that all items in an array pass a predicate function
 * 
 * Generic utility that applies a predicate function to every item
 * in an array and returns true only if all items pass the test.
 * Useful for validating collections of data.
 * 
 * @template T - The type of items in the array
 * @param items - The array of items to validate
 * @param predicate - The function to test each item against
 * @returns True if all items pass the predicate, false otherwise
 * 
 * @example
 * ```typescript
 * // Check if all numbers are positive
 * all([1, 2, 3], n => n > 0); // true
 * all([1, -2, 3], n => n > 0); // false
 * 
 * // Check if all strings are non-empty
 * all(['hello', 'world'], str => str.length > 0); // true
 * all(['hello', ''], str => str.length > 0); // false
 * 
 * // Check if all objects have a property
 * const users = [{ name: 'Alice' }, { name: 'Bob' }];
 * all(users, user => 'name' in user); // true
 * ```
 * 
 * @since 1.0.0
 */
export function all<T>(items: T[], predicate: (item: T) => boolean): boolean {
  return items.every(predicate);
}

/**
 * Validates that a value is a valid Date object
 * 
 * Type guard that checks if a value is a Date instance and represents
 * a valid date (not NaN). Useful for validating date inputs and
 * ensuring date objects are properly initialized.
 * 
 * @param value - The value to validate
 * @returns True if the value is a valid Date, false otherwise
 * 
 * @example
 * ```typescript
 * isValidDate(new Date()); // true
 * isValidDate(new Date('2024-01-01')); // true
 * isValidDate(new Date('invalid')); // false
 * isValidDate('2024-01-01'); // false (string, not Date)
 * isValidDate(null); // false
 * isValidDate(undefined); // false
 * ```
 * 
 * @since 1.0.0
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Validates that an object has all required keys
 * 
 * Generic utility that checks if an object contains all specified keys
 * with non-null, non-undefined values. Useful for validating data
 * structures and ensuring required fields are present.
 * 
 * @template T - The type of the object
 * @param obj - The object to validate
 * @param keys - Array of required keys that must exist in the object
 * @returns True if all required keys exist and have values, false otherwise
 * 
 * @example
 * ```typescript
 * interface User {
 *   name: string;
 *   email: string;
 *   age?: number;
 * }
 * 
 * const validUser = { name: 'Alice', email: 'alice@example.com' };
 * hasRequiredKeys(validUser, ['name', 'email']); // true
 * 
 * const invalidUser = { name: 'Bob' };
 * hasRequiredKeys(invalidUser, ['name', 'email']); // false
 * 
 * const userWithNull = { name: 'Charlie', email: null };
 * hasRequiredKeys(userWithNull, ['name', 'email']); // false
 * ```
 * 
 * @since 1.0.0
 */
export function hasRequiredKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[]
): boolean {
  return keys.every(key => key in obj && obj[key] !== undefined && obj[key] !== null);
}
