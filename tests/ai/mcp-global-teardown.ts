/**
 * MCP Global Teardown for Playwright
 * Cleans up MCP server and AI components after test execution
 */

import { FullConfig } from '@playwright/test';
import { MCPIntegration } from './MCPIntegration';
import { AITestEnhancer } from './AITestEnhancer';

async function globalTeardown(config: FullConfig) {
  console.log('Starting MCP Global Teardown...');

  try {
    // Get session info from global setup
    const sessionId = (global as any).mcpSessionId || process.env.MCP_SESSION_ID;
    const browser = (global as any).mcpBrowser;

    if (sessionId) {
      // Close MCP session
      await MCPIntegration.closeSession(sessionId);
      console.log(`Closed MCP session: ${sessionId}`);
    }

    if (browser) {
      // Close browser
      await browser.close();
      console.log('Closed MCP browser');
    }

    // Cleanup AI components
    await AITestEnhancer.cleanup();

    // Clear environment variables
    delete process.env.MCP_SESSION_ID;
    delete process.env.MCP_BROWSER_ENDPOINT;

    console.log('MCP Global Teardown completed successfully');

  } catch (error) {
    console.error('MCP Global Teardown failed:', error);
    // Don't throw error to avoid blocking test completion
  }
}

export default globalTeardown;
