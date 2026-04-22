#!/usr/bin/env node

/**
 * MCP-Enhanced Test Runner
 * Demonstrates Playwright MCP integration for AI browser interaction
 */

import { MCPIntegration } from './MCPIntegration.ts';
import { AITestEnhancer } from './AITestEnhancer.ts';

async function runMCPTests() {
  console.log('=== Running MCP-Enhanced Tests ===');
  
  try {
    // Initialize AI components
    await AITestEnhancer.initializeAIComponents();
    
    // Initialize MCP integration
    const mcpConfig = {
      endpoint: process.env.MCP_ENDPOINT || 'ws://localhost:3000/mcp',
      timeout: 30000,
      retryAttempts: 3
    };
    
    await MCPIntegration.initialize(mcpConfig);
    console.log(`MCP initialized with endpoint: ${mcpConfig.endpoint}`);
    
    // Display available MCP tools
    const availableTools = MCPIntegration.getAvailableTools();
    console.log(`\nAvailable MCP Tools: ${availableTools.length}`);
    availableTools.forEach((tool, index) => {
      console.log(`  ${index + 1}. ${tool.name}: ${tool.description}`);
    });
    
    // Simulate browser session creation (in real scenario, this would use actual Playwright browser)
    console.log('\n--- Simulating MCP Browser Session ---');
    
    const mockBrowser = {
      newContext: async () => ({
        newPage: async () => ({
          url: () => 'http://localhost:4173',
          title: () => async () => 'Test Page',
          goto: async (url) => console.log(`Navigating to: ${url}`),
          click: async (selector) => console.log(`Clicking: ${selector}`),
          fill: async (selector, text) => console.log(`Filling ${selector} with: ${text}`),
          waitForSelector: async (selector) => console.log(`Waiting for: ${selector}`),
          accessibility: { snapshot: async () => ({ role: 'document', name: 'Test Page' }) },
          content: async () => '<html><body><h1>Test Page</h1></body></html>',
          evaluate: async (fn) => ({ url: 'http://localhost:4173', title: 'Test Page' })
        })
      })
    };
    
    // Create MCP session
    const sessionId = `mcp-test-session-${Date.now()}`;
    const session = await MCPIntegration.createSession(sessionId, mockBrowser);
    console.log(`Created MCP session: ${sessionId}`);
    
    // Demonstrate MCP commands
    console.log('\n--- Executing MCP Commands ---');
    
    const mcpCommands = [
      {
        type: 'navigate',
        parameters: { url: 'http://localhost:4173', waitUntil: 'networkidle' }
      },
      {
        type: 'snapshot',
        parameters: { includeNetwork: true, includeConsole: true }
      },
      {
        type: 'validate_accessibility',
        parameters: { level: 'AA', rules: ['wcag-2.1'] }
      },
      {
        type: 'analyze_performance',
        parameters: { metrics: ['FCP', 'LCP', 'CLS'] }
      }
    ];
    
    for (const command of mcpCommands) {
      console.log(`\nExecuting: ${command.type}`);
      
      const result = await MCPIntegration.executeCommand(sessionId, command);
      
      if (result.success) {
        console.log(`   Status: SUCCESS`);
        console.log(`   Execution Time: ${result.executionTime}ms`);
        
        if (command.type === 'snapshot' && result.snapshot) {
          console.log(`   Page URL: ${result.snapshot.url}`);
          console.log(`   Page Title: ${result.snapshot.title}`);
          console.log(`   Elements Analyzed: ${result.snapshot.accessibilityTree ? 'Yes' : 'No'}`);
        }
        
        if (command.type === 'validate_accessibility') {
          console.log(`   Accessibility Result: ${result.data?.passed ? 'PASSED' : 'FAILED'}`);
          console.log(`   Violations: ${result.data?.violations || 0}`);
        }
        
        if (command.type === 'analyze_performance') {
          console.log(`   Performance Metrics: ${result.data?.requestedMetrics?.join(', ') || 'N/A'}`);
        }
        
      } else {
        console.log(`   Status: FAILED`);
        console.log(`   Error: ${result.error}`);
      }
    }
    
    // Generate AI test scenario using MCP
    console.log('\n--- Generating AI Test Scenario via MCP ---');
    
    const aiScenario = await MCPIntegration.generateTestScenario(
      sessionId,
      'component-analysis-metric-card'
    );
    
    console.log(`Generated Scenario: ${aiScenario.name}`);
    console.log(`Priority: ${aiScenario.priority}`);
    console.log(`Risk Level: ${aiScenario.riskLevel}`);
    console.log(`Estimated Duration: ${aiScenario.estimatedDuration} minutes`);
    console.log(`Tags: ${aiScenario.tags.join(', ')}`);
    console.log(`Parallelizable: ${aiScenario.parallelizable}`);
    
    // Get session status
    const sessionStatus = MCPIntegration.getSessionStatus(sessionId);
    console.log(`\n--- Session Status ---`);
    console.log(`Session ID: ${sessionStatus?.id}`);
    console.log(`Duration: ${Math.round(sessionStatus?.duration || 0)}ms`);
    console.log(`Current URL: ${sessionStatus?.url}`);
    
    // Demonstrate AI-enhanced test execution with MCP
    console.log('\n--- AI-Enhanced Test Execution with MCP ---');
    
    const testResult = await AITestEnhancer.executeAIEnhancedTest(
      'mcp-browser-test',
      'src/components/MetricCard.astro',
      sessionId
    );
    
    if (testResult.success) {
      console.log(`Test Execution: SUCCESS`);
      console.log(`AI-Generated: ${testResult.result.aiGenerated}`);
      console.log(`MCP-Enhanced: ${testResult.result.mcpEnhanced}`);
      console.log(`Self-Healing: ${testResult.result.selfHealing}`);
      
      if (testResult.insights && testResult.insights.length > 0) {
        console.log(`\nQuality Insights:`);
        testResult.insights.forEach((insight, index) => {
          console.log(`  ${index + 1}. ${insight.message} (${insight.severity})`);
          if (insight.autoFixable) {
            console.log(`     Auto-fixable: Yes`);
          }
        });
      }
    } else {
      console.log(`Test Execution: FAILED`);
      console.log(`Error: ${testResult.result.error}`);
    }
    
    // Display MCP statistics
    console.log('\n--- MCP Statistics ---');
    const aiStats = AITestEnhancer.getAIStatistics();
    console.log(`MCP Initialized: ${aiStats.mcp.initialized}`);
    console.log(`Available Tools: ${aiStats.mcp.availableTools}`);
    console.log(`Active Sessions: ${MCPIntegration.getSessionStatus ? '1' : '0'}`);
    
    // Cleanup MCP session
    await MCPIntegration.closeSession(sessionId);
    console.log(`\nClosed MCP session: ${sessionId}`);
    
    console.log('\n=== MCP-Enhanced Tests Completed ===');
    
  } catch (error) {
    console.error('MCP test execution failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await MCPIntegration.cleanup();
    await AITestEnhancer.cleanup();
  }
}

runMCPTests();
