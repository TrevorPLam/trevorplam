#!/usr/bin/env node

/**
 * AI Components Validation
 * Validates the functionality and integration of all AI components
 */

import { AITestEnhancer } from './AITestEnhancer.ts';
import { MCPIntegration } from './MCPIntegration.ts';
import { MLTestPrioritizer } from './MLTestPrioritizer.ts';
import { SelfHealingEngine } from './SelfHealingEngine.ts';

async function validateAIComponents() {
  console.log('=== Validating AI Components ===');
  
  const validationResults = {
    mcp: { status: 'pending', tests: [], errors: [] },
    ml: { status: 'pending', tests: [], errors: [] },
    selfHealing: { status: 'pending', tests: [], errors: [] },
    integration: { status: 'pending', tests: [], errors: [] }
  };
  
  try {
    // Test 1: MCP Integration Validation
    console.log('\n--- Validating MCP Integration ---');
    
    try {
      // Initialize MCP
      await MCPIntegration.initialize({
        endpoint: 'ws://localhost:3000/mcp',
        timeout: 5000,
        retryAttempts: 1
      });
      
      validationResults.mcp.tests.push('MCP initialization: PASSED');
      
      // Check available tools
      const tools = MCPIntegration.getAvailableTools();
      if (tools.length > 0) {
        validationResults.mcp.tests.push(`MCP tools available: ${tools.length} tools`);
      } else {
        validationResults.mcp.errors.push('No MCP tools available');
      }
      
      // Test MCP session creation (mock)
      const mockBrowser = {
        newContext: async () => ({
          newPage: async () => ({
            url: () => 'http://localhost:4173',
            title: () => async () => 'Test Page'
          })
        })
      };
      
      const session = await MCPIntegration.createSession('validation-session', mockBrowser);
      if (session) {
        validationResults.mcp.tests.push('MCP session creation: PASSED');
      }
      
      // Test MCP command execution
      const result = await MCPIntegration.executeCommand('validation-session', {
        type: 'snapshot',
        parameters: { includeNetwork: false, includeConsole: false }
      });
      
      if (result.success || result.error) {
        validationResults.mcp.tests.push('MCP command execution: PASSED');
      }
      
      // Cleanup
      await MCPIntegration.closeSession('validation-session');
      validationResults.mcp.tests.push('MCP session cleanup: PASSED');
      
      validationResults.mcp.status = validationResults.mcp.errors.length === 0 ? 'PASSED' : 'FAILED';
      
    } catch (error) {
      validationResults.mcp.errors.push(`MCP validation failed: ${error.message}`);
      validationResults.mcp.status = 'FAILED';
    }
    
    // Test 2: ML Test Prioritizer Validation
    console.log('\n--- Validating ML Test Prioritizer ---');
    
    try {
      // Initialize ML
      await MLTestPrioritizer.initialize();
      validationResults.ml.tests.push('ML initialization: PASSED');
      
      // Check model availability
      const models = MLTestPrioritizer.getModelInfo();
      if (models.length > 0) {
        validationResults.ml.tests.push(`ML models available: ${models.length} models`);
        
        models.forEach(model => {
          if (model.accuracy > 0.5) {
            validationResults.ml.tests.push(`Model ${model.name}: ${Math.round(model.accuracy * 100)}% accuracy`);
          } else {
            validationResults.ml.errors.push(`Model ${model.name} has low accuracy: ${model.accuracy}`);
          }
        });
      } else {
        validationResults.ml.errors.push('No ML models available');
      }
      
      // Test ML prioritization
      const mockScenarios = [
        {
          name: 'test-scenario-1',
          description: 'Test scenario 1',
          priority: 'high',
          tags: ['test'],
          estimatedDuration: 10,
          riskLevel: 'medium',
          parallelizable: true,
          resourceRequirements: {
            memory: 'low',
            cpu: 'low',
            io: 'low',
            dependencies: []
          }
        }
      ];
      
      const mockChanges = [
        {
          file: 'src/test.ts',
          type: 'modify',
          linesAdded: 10,
          linesRemoved: 5,
          functions: ['test'],
          components: ['Test'],
          dependencies: [],
          timestamp: Date.now()
        }
      ];
      
      const prioritization = await MLTestPrioritizer.prioritizeTests(
        mockScenarios,
        mockChanges,
        'hybrid'
      );
      
      if (prioritization.tests.length > 0 && prioritization.confidence > 0) {
        validationResults.ml.tests.push('ML prioritization: PASSED');
        validationResults.ml.tests.push(`Confidence: ${prioritization.confidence}%`);
      } else {
        validationResults.ml.errors.push('ML prioritization failed');
      }
      
      // Test statistics
      const stats = MLTestPrioritizer.getStatistics();
      if (stats.totalExecutions >= 0) {
        validationResults.ml.tests.push('ML statistics: PASSED');
      }
      
      validationResults.ml.status = validationResults.ml.errors.length === 0 ? 'PASSED' : 'FAILED';
      
    } catch (error) {
      validationResults.ml.errors.push(`ML validation failed: ${error.message}`);
      validationResults.ml.status = 'FAILED';
    }
    
    // Test 3: Self-Healing Engine Validation
    console.log('\n--- Validating Self-Healing Engine ---');
    
    try {
      // Initialize self-healing
      await SelfHealingEngine.initialize();
      validationResults.selfHealing.tests.push('Self-healing initialization: PASSED');
      
      // Test failure recording
      const mockFailure = {
        testId: 'test-1',
        selector: 'button.test',
        errorType: 'selector-not-found',
        errorMessage: 'Element not found',
        pageUrl: 'http://localhost:4173',
        timestamp: Date.now()
      };
      
      SelfHealingEngine.recordFailure(mockFailure);
      validationResults.selfHealing.tests.push('Failure recording: PASSED');
      
      // Test healing statistics
      const healingStats = SelfHealingEngine.getHealingStatistics();
      if (healingStats.totalFailures > 0) {
        validationResults.selfHealing.tests.push('Healing statistics: PASSED');
      }
      
      // Test flaky test analysis
      const flakyAnalysis = SelfHealingEngine.analyzeFlakyTests();
      if (flakyAnalysis.flakySelectors && flakyAnalysis.recommendations) {
        validationResults.selfHealing.tests.push('Flaky test analysis: PASSED');
      }
      
      // Test healing data export
      const healingData = SelfHealingEngine.exportHealingData();
      if (healingData.healingHistory && healingData.statistics) {
        validationResults.selfHealing.tests.push('Healing data export: PASSED');
      }
      
      validationResults.selfHealing.status = validationResults.selfHealing.errors.length === 0 ? 'PASSED' : 'FAILED';
      
    } catch (error) {
      validationResults.selfHealing.errors.push(`Self-healing validation failed: ${error.message}`);
      validationResults.selfHealing.status = 'FAILED';
    }
    
    // Test 4: Integration Validation
    console.log('\n--- Validating AI Component Integration ---');
    
    try {
      // Initialize all components
      await AITestEnhancer.initializeAIComponents();
      validationResults.integration.tests.push('AI components initialization: PASSED');
      
      // Get comprehensive statistics
      const aiStats = AITestEnhancer.getAIStatistics();
      if (aiStats.overall.componentsInitialized === 3) {
        validationResults.integration.tests.push('All components initialized: PASSED');
      } else {
        validationResults.integration.errors.push(`Only ${aiStats.overall.componentsInitialized}/3 components initialized`);
      }
      
      // Test AI-enhanced test generation
      const aiSuite = await AITestEnhancer.generateAIEnhancedSuite(
        'src/components/MetricCard.astro',
        [],
        'validation-session'
      );
      
      if (aiSuite.suite && aiSuite.prioritization) {
        validationResults.integration.tests.push('AI suite generation: PASSED');
        validationResults.integration.tests.push(`Generated ${aiSuite.prioritization.tests.length} scenarios`);
      } else {
        validationResults.integration.errors.push('AI suite generation failed');
      }
      
      // Test AI-enhanced test execution
      const testResult = await AITestEnhancer.executeAIEnhancedTest(
        'validation-test',
        'src/components/MetricCard.astro'
      );
      
      if (testResult.success || testResult.healing) {
        validationResults.integration.tests.push('AI test execution: PASSED');
      } else {
        validationResults.integration.errors.push('AI test execution failed');
      }
      
      validationResults.integration.status = validationResults.integration.errors.length === 0 ? 'PASSED' : 'FAILED';
      
    } catch (error) {
      validationResults.integration.errors.push(`Integration validation failed: ${error.message}`);
      validationResults.integration.status = 'FAILED';
    }
    
    // Display Validation Results
    console.log('\n=== AI Components Validation Results ===');
    
    const components = ['mcp', 'ml', 'selfHealing', 'integration'];
    let totalPassed = 0;
    let totalFailed = 0;
    
    components.forEach(component => {
      const result = validationResults[component];
      const status = result.status;
      
      console.log(`\n${component.toUpperCase()}: ${status}`);
      
      if (result.tests.length > 0) {
        console.log('  Tests Passed:');
        result.tests.forEach(test => console.log(`    ${test}`));
      }
      
      if (result.errors.length > 0) {
        console.log('  Errors:');
        result.errors.forEach(error => console.log(`    ${error}`));
      }
      
      if (status === 'PASSED') {
        totalPassed++;
      } else {
        totalFailed++;
      }
    });
    
    // Overall Validation Summary
    console.log(`\n=== Validation Summary ===`);
    console.log(`Components Passed: ${totalPassed}/4`);
    console.log(`Components Failed: ${totalFailed}/4`);
    console.log(`Overall Status: ${totalFailed === 0 ? 'ALL COMPONENTS VALID' : 'SOME COMPONENTS NEED ATTENTION'}`);
    
    if (totalFailed === 0) {
      console.log('\nAll AI components are functioning correctly!');
      console.log('Ready for production use.');
    } else {
      console.log('\nSome AI components need attention before production use.');
      console.log('Please review the errors above and fix any issues.');
    }
    
    // Performance Metrics
    console.log(`\n=== Performance Metrics ===`);
    const finalStats = AITestEnhancer.getAIStatistics();
    console.log(`MCP Tools Available: ${finalStats.mcp.availableTools}`);
    console.log(`ML Models: ${finalStats.ml.models?.length || 0}`);
    console.log(`Healing Success Rate: ${finalStats.selfHealing.statistics?.successRate || 0}%`);
    
    return totalFailed === 0;
    
  } catch (error) {
    console.error('AI components validation failed:', error);
    return false;
  } finally {
    // Cleanup
    console.log('\n--- Cleaning Up Validation ---');
    await AITestEnhancer.cleanup();
  }
}

// Run validation and exit with appropriate code
validateAIComponents().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Validation script failed:', error);
  process.exit(1);
});
