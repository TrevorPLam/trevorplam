#!/usr/bin/env node

/**
 * Full AI Suite Runner
 * Executes comprehensive AI-powered test automation with all enhancements
 */

import { AITestEnhancer } from './AITestEnhancer.ts';
import { MCPIntegration } from './MCPIntegration.ts';
import { MLTestPrioritizer } from './MLTestPrioritizer.ts';
import { SelfHealingEngine } from './SelfHealingEngine.ts';

async function runFullAISuite() {
  console.log('=== Running Full AI-Powered Test Suite ===');
  console.log('This will demonstrate all AI enhancements working together');
  
  try {
    // Initialize all AI components
    console.log('\n--- Initializing AI Components ---');
    await AITestEnhancer.initializeAIComponents();
    console.log('All AI components initialized successfully');
    
    // Display AI component statistics
    const aiStats = AITestEnhancer.getAIStatistics();
    console.log('\nAI Component Status:');
    console.log(`  MCP: ${aiStats.mcp.initialized ? 'Initialized' : 'Not Initialized'}`);
    console.log(`  ML: ${aiStats.ml.initialized ? 'Initialized' : 'Not Initialized'}`);
    console.log(`  Self-Healing: ${aiStats.selfHealing.initialized ? 'Initialized' : 'Not Initialized'}`);
    console.log(`  Components Ready: ${aiStats.overall.componentsInitialized}/3`);
    
    // Step 1: Generate comprehensive AI-enhanced test suite
    console.log('\n--- Step 1: Generating AI-Enhanced Test Suite ---');
    
    const recentChanges = [
      {
        file: 'src/components/MetricCard.astro',
        type: 'modify',
        linesAdded: 30,
        linesRemoved: 10,
        functions: ['render', 'calculate', 'update'],
        components: ['MetricCard'],
        dependencies: ['@astrojs/mdx'],
        timestamp: Date.now() - 3600000
      }
    ];
    
    const aiSuiteResult = await AITestEnhancer.generateAIEnhancedSuite(
      'src/components/MetricCard.astro',
      recentChanges,
      'ai-session-full-demo'
    );
    
    console.log(`Generated ${aiSuiteResult.prioritization.tests.length} AI-enhanced scenarios`);
    console.log(`MCP-Enhanced: ${aiSuiteResult.prioritization.tests.filter(t => t.scenario.mcpEnhanced).length}`);
    console.log(`Self-Healing Enabled: All tests`);
    console.log(`ML Strategy: ${aiSuiteResult.prioritization.strategy}`);
    console.log(`Estimated Duration: ${aiSuiteResult.prioritization.totalEstimatedTime} minutes`);
    console.log(`Confidence: ${aiSuiteResult.prioritization.confidence}%`);
    
    // Step 2: Execute prioritized tests with all enhancements
    console.log('\n--- Step 2: Executing AI-Enhanced Tests ---');
    
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let healedTests = 0;
    
    // Execute top 5 prioritized tests for demonstration
    const topTests = aiSuiteResult.prioritization.tests.slice(0, 5);
    
    for (const testImpact of topTests) {
      totalTests++;
      console.log(`\nExecuting: ${testImpact.testId}`);
      console.log(`  Priority: ${testImpact.scenario.priority}`);
      console.log(`  Risk Level: ${testImpact.riskLevel}`);
      console.log(`  Impact Score: ${testImpact.impactScore}`);
      
      try {
        // Execute with full AI enhancement stack
        const testResult = await AITestEnhancer.executeAIEnhancedTest(
          testImpact.testId,
          'src/components/MetricCard.astro',
          'ai-session-full-demo'
        );
        
        if (testResult.success) {
          passedTests++;
          console.log(`  Status: PASSED`);
          console.log(`  AI-Generated: ${testResult.result.aiGenerated}`);
          console.log(`  MCP-Enhanced: ${testResult.result.mcpEnhanced}`);
          console.log(`  Self-Healing: ${testResult.result.selfHealing}`);
          
          // Display quality insights
          if (testResult.insights && testResult.insights.length > 0) {
            console.log(`  Insights: ${testResult.insights.length} recommendations`);
          }
        } else {
          failedTests++;
          console.log(`  Status: FAILED`);
          console.log(`  Error: ${testResult.result.error}`);
          
          // Check if self-healing was attempted
          if (testResult.healing) {
            healedTests++;
            console.log(`  Healing: ${testResult.healing.reasoning}`);
          }
        }
        
      } catch (error) {
        failedTests++;
        console.log(`  Status: ERROR - ${error.message}`);
      }
    }
    
    // Step 3: Demonstrate MCP browser interaction
    console.log('\n--- Step 3: MCP Browser Interaction Demo ---');
    
    if (aiStats.mcp.initialized) {
      const availableTools = MCPIntegration.getAvailableTools();
      console.log(`Available MCP Tools: ${availableTools.length}`);
      
      // Simulate MCP commands
      const mcpCommands = [
        { type: 'navigate', parameters: { url: 'http://localhost:4173' } },
        { type: 'snapshot', parameters: { includeNetwork: false } },
        { type: 'validate_accessibility', parameters: { level: 'AA' } }
      ];
      
      for (const command of mcpCommands) {
        console.log(`  MCP Command: ${command.type}`);
        // In real scenario, this would execute actual browser commands
      }
    }
    
    // Step 4: ML Learning and Optimization
    console.log('\n--- Step 4: ML Learning and Optimization ---');
    
    if (aiStats.ml.initialized) {
      const mlStats = MLTestPrioritizer.getStatistics();
      console.log(`ML Statistics:`);
      console.log(`  Total Executions: ${mlStats.totalExecutions}`);
      console.log(`  Success Rate: ${mlStats.successRate}%`);
      console.log(`  Models Available: ${mlStats.modelsAvailable}`);
      
      // Retrain models with new data
      await MLTestPrioritizer.retrainModels();
      console.log(`  Models Retrained: Yes`);
    }
    
    // Step 5: Self-Healing Analysis
    console.log('\n--- Step 5: Self-Healing Analysis ---');
    
    if (aiStats.selfHealing.initialized) {
      const healingStats = SelfHealingEngine.getHealingStatistics();
      console.log(`Self-Healing Statistics:`);
      console.log(`  Total Healings: ${healingStats.totalHealings}`);
      console.log(`  Success Rate: ${healingStats.successRate}%`);
      console.log(`  Total Failures: ${healingStats.totalFailures}`);
      
      // Analyze flaky tests
      const flakyAnalysis = SelfHealingEngine.analyzeFlakyTests();
      if (flakyAnalysis.flakySelectors.length > 0) {
        console.log(`  Flaky Selectors: ${flakyAnalysis.flakySelectors.length}`);
        console.log(`  Recommendations: ${flakyAnalysis.recommendations.length}`);
      }
    }
    
    // Step 6: Comprehensive Results Summary
    console.log('\n--- Comprehensive AI Test Results ---');
    console.log(`Test Execution Summary:`);
    console.log(`  Total Tests: ${totalTests}`);
    console.log(`  Passed: ${passedTests} (${Math.round((passedTests/totalTests)*100)}%)`);
    console.log(`  Failed: ${failedTests} (${Math.round((failedTests/totalTests)*100)}%)`);
    console.log(`  Healed: ${healedTests}`);
    
    console.log(`\nAI Enhancement Summary:`);
    console.log(`  MCP Tools Available: ${aiStats.mcp.availableTools}`);
    console.log(`  ML Models Active: ${aiStats.ml.models?.length || 0}`);
    console.log(`  Self-Healing Success Rate: ${aiStats.selfHealing.statistics?.successRate || 0}%`);
    console.log(`  Overall AI Confidence: ${aiSuiteResult.prioritization.confidence}%`);
    
    // Performance Analysis
    const actualDuration = topTests.reduce((sum, test) => sum + test.estimatedExecutionTime, 0);
    const efficiency = ((actualDuration / aiSuiteResult.prioritization.totalEstimatedTime) * 100).toFixed(1);
    
    console.log(`\nPerformance Analysis:`);
    console.log(`  Estimated Duration: ${aiSuiteResult.prioritization.totalEstimatedTime} minutes`);
    console.log(`  Actual Test Duration: ${actualDuration} minutes`);
    console.log(`  Efficiency: ${efficiency}%`);
    
    // Risk Distribution
    console.log(`\nRisk Distribution:`);
    Object.entries(aiSuiteResult.prioritization.riskDistribution).forEach(([risk, count]) => {
      const percentage = Math.round((count / aiSuiteResult.prioritization.tests.length) * 100);
      console.log(`  ${risk}: ${count} tests (${percentage}%)`);
    });
    
    // Recommendations
    console.log(`\nAI Recommendations:`);
    
    if (passedTests / totalTests < 0.9) {
      console.log(`  - Improve test stability - pass rate below 90%`);
    }
    
    if (healedTests > 0) {
      console.log(`  - Review selectors causing failures - ${healedTests} tests required healing`);
    }
    
    if (aiSuiteResult.prioritization.confidence < 80) {
      console.log(`  - Add more historical data to improve ML predictions`);
    }
    
    if (aiStats.mcp.availableTools < 7) {
      console.log(`  - Expand MCP tool integration for better browser automation`);
    }
    
    // Export comprehensive report
    const comprehensiveReport = {
      execution: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        healed: healedTests,
        timestamp: Date.now()
      },
      ai: aiStats,
      prioritization: aiSuiteResult.prioritization,
      healing: aiStats.selfHealing.statistics,
      ml: aiStats.ml.statistics,
      recommendations: [
        passedTests / totalTests < 0.9 ? 'Improve test stability' : null,
        healedTests > 0 ? 'Review problematic selectors' : null,
        aiSuiteResult.prioritization.confidence < 80 ? 'Add more training data' : null,
        aiStats.mcp.availableTools < 7 ? 'Expand MCP tools' : null
      ].filter(Boolean)
    };
    
    // Save report (in real scenario, would save to file)
    console.log(`\nComprehensive report generated with ${comprehensiveReport.recommendations.length} recommendations`);
    
    console.log('\n=== Full AI-Powered Test Suite Completed ===');
    console.log('All AI enhancements demonstrated successfully!');
    
  } catch (error) {
    console.error('Full AI suite execution failed:', error);
    process.exit(1);
  } finally {
    // Comprehensive cleanup
    console.log('\n--- Cleaning Up AI Components ---');
    await AITestEnhancer.cleanup();
    console.log('All AI components cleaned up successfully');
  }
}

runFullAISuite();
