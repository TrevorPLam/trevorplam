/**
 * Date manipulation utilities
 * 
 * Provides helper functions for formatting, comparing, and manipulating dates
 * commonly used throughout the application for timeline displays, metadata,
 * and user-facing date representations.
 * 
 * @example
 * ```typescript
 * import { formatDate, getRelativeTime, isPast } from './date';
 * 
 * const date = new Date('2024-01-15');
 * console.log(formatDate(date)); // "1/15/2024"
 * console.log(getRelativeTime(date)); // "6 months ago" (depending on current date)
 * console.log(isPast(date)); // true
 * ```
 * 
 * @since 1.0.0
 */

/**
 * Formats a date to a locale-specific string representation
 * 
 * Converts either a Date object or ISO string to a formatted date string
 * using US English locale conventions. Accepts optional Intl.DateTimeFormatOptions
 * for custom formatting.
 * 
 * @param date - The date to format (Date object or ISO string)
 * @param options - Optional formatting options from Intl.DateTimeFormatOptions
 * @returns The formatted date string
 * 
 * @example
 * ```typescript
 * formatDate(new Date('2024-01-15')); // "1/15/2024"
 * formatDate('2024-01-15T00:00:00Z'); // "1/15/2024"
 * formatDate(new Date('2024-01-15'), { 
 *   year: 'numeric', 
 *   month: 'long', 
 *   day: 'numeric' 
 * }); // "January 15, 2024"
 * ```
 * 
 * @since 1.0.0
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', options);
}

/**
 * Returns a human-readable relative time string
 * 
 * Calculates the time difference between the provided date and the current time,
 * returning a user-friendly string like "2 days ago" or "3 hours ago".
 * For dates more than 30 days old, returns the formatted date instead.
 * 
 * @param date - The date to compare (Date object or ISO string)
 * @returns A relative time string in human-readable format
 * 
 * @example
 * ```typescript
 * // Assuming current date is 2024-07-15
 * getRelativeTime(new Date('2024-07-13')); // "2 days ago"
 * getRelativeTime(new Date('2024-07-15T10:00:00')); // "4 hours ago"
 * getRelativeTime(new Date('2024-06-01')); // "June 1, 2024"
 * getRelativeTime(new Date()); // "just now"
 * ```
 * 
 * @since 1.0.0
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return formatDate(d);
}

/**
 * Determines if a given date is in the past
 * 
 * Compares the provided date with the current time to determine if it
 * represents a past moment. Useful for conditional rendering of dates,
 * expiration checks, and timeline status indicators.
 * 
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is in the past, false otherwise
 * 
 * @example
 * ```typescript
 * isPast(new Date('2020-01-01')); // true (assuming current date is after 2020)
 * isPast(new Date('2050-01-01')); // false
 * isPast(new Date()); // false (current date is not in the past)
 * ```
 * 
 * @since 1.0.0
 */
export function isPast(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() < Date.now();
}

/**
 * Determines if a given date is in the future
 * 
 * Compares the provided date with the current time to determine if it
 * represents a future moment. Useful for upcoming events, deadlines,
 * and future planning features.
 * 
 * @param date - The date to check (Date object or ISO string)
 * @returns True if the date is in the future, false otherwise
 * 
 * @example
 * ```typescript
 * isFuture(new Date('2050-01-01')); // true
 * isFuture(new Date('2020-01-01')); // false (assuming current date is after 2020)
 * isFuture(new Date()); // false (current date is not in the future)
 * ```
 * 
 * @since 1.0.0
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.getTime() > Date.now();
}

/**
 * Generates a year range string from start and end dates
 * 
 * Creates a formatted string representing a period between two dates.
 * If the start and end years are the same, returns just the year.
 * If no end date is provided, uses the current year as the end date.
 * 
 * @param startDate - The start date of the range (Date object or ISO string)
 * @param endDate - Optional end date of the range (Date object or ISO string)
 * @returns A formatted year range string
 * 
 * @example
 * ```typescript
 * getYearRange(new Date('2020-01-01'), new Date('2023-12-31')); // "2020-2023"
 * getYearRange('2020-01-01', '2020-12-31'); // "2020"
 * getYearRange(new Date('2020-01-01')); // "2020-2024" (assuming current year is 2024)
 * getYearRange('2020-01-01', '2024-06-15'); // "2020-2024"
 * ```
 * 
 * @since 1.0.0
 */
export function getYearRange(startDate: Date | string, endDate?: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = endDate 
    ? (typeof endDate === 'string' ? new Date(endDate) : endDate)
    : new Date();
  
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();
  
  return startYear === endYear 
    ? startYear.toString() 
    : `${startYear}-${endYear}`;
}
