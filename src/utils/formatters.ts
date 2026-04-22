/**
 * Data formatting utilities
 * 
 * Provides helper functions for formatting numbers, text, and strings
 * commonly used throughout the application for displaying metrics,
 * currency values, URLs, and user-facing text content.
 * 
 * @example
 * ```typescript
 * import { formatCurrency, slugify, truncate } from './formatters';
 * 
 * console.log(formatCurrency(1234.56)); // "$1,235"
 * console.log(slugify('Hello World!')); // "hello-world"
 * console.log(truncate('Long text here', 10)); // "Long te..."
 * ```
 * 
 * @since 1.0.0
 */

/**
 * Formats a number as a currency string
 * 
 * Uses Intl.NumberFormat to format numbers as currency with proper
 * locale-specific formatting. Defaults to USD with no decimal places.
 * 
 * @param value - The numeric value to format
 * @param currency - The ISO 4217 currency code (default: 'USD')
 * @returns The formatted currency string
 * 
 * @example
 * ```typescript
 * formatCurrency(1234.56); // "$1,235"
 * formatCurrency(1234.56, 'EUR'); // "¥1,235" (depends on locale)
 * formatCurrency(1000000); // "$1,000,000"
 * ```
 * 
 * @since 1.0.0
 */
export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formats a number as a percentage string
 * 
 * Converts a decimal number to a percentage string with specified
 * decimal precision. Useful for displaying growth rates, completion
 * percentages, and other ratio-based metrics.
 * 
 * @param value - The decimal value to format (e.g., 0.45 for 45%)
 * @param decimals - Number of decimal places to include (default: 1)
 * @returns The formatted percentage string
 * 
 * @example
 * ```typescript
 * formatPercentage(0.45); // "45.0%"
 * formatPercentage(0.456, 2); // "45.60%"
 * formatPercentage(1); // "100.0%"
 * formatPercentage(0); // "0.0%"
 * ```
 * 
 * @since 1.0.0
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formats a number with compact notation
 * 
 * Uses Intl.NumberFormat to display large numbers in compact form
 * with K, M, B suffixes for thousands, millions, and billions.
 * Useful for displaying large metrics in limited space.
 * 
 * @param value - The number to format
 * @returns The compactly formatted number string
 * 
 * @example
 * ```typescript
 * formatCompactNumber(1500); // "1.5K"
 * formatCompactNumber(2500000); // "2.5M"
 * formatCompactNumber(1000000000); // "1B"
 * formatCompactNumber(999); // "999"
 * ```
 * 
 * @since 1.0.0
 */
export function formatCompactNumber(value: number): string {
  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value);
}

/**
 * Converts a string to a URL-friendly slug
 * 
 * Transforms text into a lowercase, hyphen-separated string suitable
 * for use in URLs. Removes special characters and multiple consecutive
 * hyphens, and trims leading/trailing hyphens.
 * 
 * @param text - The text to slugify
 * @returns The slugified string
 * 
 * @example
 * ```typescript
 * slugify('Hello World!'); // "hello-world"
 * slugify('My Awesome Project 2024'); // "my-awesome-project-2024"
 * slugify('  Multiple   Spaces  '); // "multiple-spaces"
 * slugify('Special & Characters! @#$'); // "special-characters"
 * ```
 * 
 * @since 1.0.0
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncates text to a specified maximum length
 * 
 * Shortens text to fit within a specified character limit, adding
 * a suffix (default: '...') when truncation occurs. Useful for
 * previews, summaries, and UI elements with limited space.
 * 
 * @param text - The text to truncate
 * @param maxLength - Maximum number of characters to keep
 * @param suffix - String to append when truncation occurs (default: '...')
 * @returns The truncated text
 * 
 * @example
 * ```typescript
 * truncate('This is a very long text', 15); // "This is a very..."
 * truncate('Short text', 20); // "Short text"
 * truncate('Long text here', 10, ' [more]'); // "Long te [more]"
 * truncate('Exact length', 12); // "Exact length"
 * ```
 * 
 * @since 1.0.0
 */
export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Converts text to title case
 * 
 * Capitalizes the first letter of each word while converting
 * the remaining letters to lowercase. Useful for formatting
 * titles, headings, and display text.
 * 
 * @param text - The text to convert to title case
 * @returns The title-cased text
 * 
 * @example
 * ```typescript
 * toTitleCase('hello world'); // "Hello World"
 * toTitleCase('THIS IS A TEST'); // "This Is A Test"
 * toTitleCase('mixed CASE text'); // "Mixed Case Text"
 * toTitleCase('single'); // "Single"
 * ```
 * 
 * @since 1.0.0
 */
export function toTitleCase(text: string): string {
  return text.replace(/\w\S*/g, (word) => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  );
}
