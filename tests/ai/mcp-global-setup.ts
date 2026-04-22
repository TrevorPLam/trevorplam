/**
 * MCP Global Setup for Playwright
 * Initializes MCP server and AI components before test execution
 */

import { chromium, FullConfig } from '@playwright/test';
import { MCPIntegration } from './MCPIntegration';
import { MLTestPrioritizer } from './MLTestPrioritizer';
import { SelfHealingEngine } from './SelfHealingEngine';
import { AITestEnhancer } from './AITestEnhancer';

async function globalSetup(config: FullConfig) {
  console.log('Starting MCP Global Setup...');

  try {
    // Initialize AI components
    await AITestEnhancer.initializeAIComponents();

    // Start MCP server for browser sessions
    const browser = await chromium.launch({
      headless: !process.env.MCP_HEADLESS?.includes('false'),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection'
      ]
    });

    // Create MCP session for AI interaction
    const sessionId = `mcp-session-${Date.now()}`;
    await MCPIntegration.createSession(sessionId, browser);

    // Store session info for tests to use
    process.env.MCP_SESSION_ID = sessionId;
    process.env.MCP_BROWSER_ENDPOINT = browser.browserContext().browser().wsEndpoint();

    console.log('MCP Global Setup completed successfully');
    console.log(`Session ID: ${sessionId}`);
    console.log(`Browser endpoint: ${process.env.MCP_BROWSER_ENDPOINT}`);

    // Export session info for test access
    (global as any).mcpSessionId = sessionId;
    (global as any).mcpBrowser = browser;

  } catch (error) {
    console.error('MCP Global Setup failed:', error);
    throw error;
  }
}

export default globalSetup;
