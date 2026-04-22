/**
 * Vitest setup file to prevent hanging and symbol conflicts
 */

// Note: Removed global Astro Container mock to enable real component rendering
// Individual tests should use experimental_AstroContainer from 'astro/container'

// Note: Removed individual Astro component mocks to enable real component rendering
// Tests should import and test actual components using experimental_AstroContainer

// Global test timeout
vi.setConfig({ testTimeout: 5000 });
