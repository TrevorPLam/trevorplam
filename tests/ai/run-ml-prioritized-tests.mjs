#!/usr/bin/env node

/**
 * ML-Prioritized Test Runner
 * Demonstrates machine learning-based test impact analysis and prioritization
 */

import { MLTestPrioritizer } from './MLTestPrioritizer.ts';
import { AITestEnhancer } from './AITestEnhancer.ts';

async function runMLPrioritizedTests() {
  console.log('=== Running ML-Prioritized Tests ===');
  
  try {
    // Initialize AI components
    await AITestEnhancer.initializeAIComponents();
    
    // Generate test scenarios
    console.log('Generating test scenarios for ML analysis...');
    const scenarios = await AITestEnhancer.generateTestScenarios('src/components/MetricCard.astro');
    
    // Simulate recent code changes
    const recentChanges = [
      {
        file: 'src/components/MetricCard.astro',
        type: 'modify',
        linesAdded: 25,
        linesRemoved: 8,
        functions: ['renderMetric', 'calculateValue', 'updateDisplay'],
        components: ['MetricCard', 'MetricValue'],
        dependencies: ['@astrojs/mdx', 'tailwindcss'],
        timestamp: Date.now() - 3600000 // 1 hour ago
      },
      {
        file: 'src/utils/formatters.ts',
        type: 'modify',
        linesAdded: 15,
        linesRemoved: 3,
        functions: ['formatNumber', 'formatCurrency'],
        components: [],
        dependencies: [],
        timestamp: Date.now() - 7200000 // 2 hours ago
      },
      {
        file: 'src/components/Header.astro',
        type: 'add',
        linesAdded: 40,
        linesRemoved: 0,
        functions: ['navigate', 'toggleMenu'],
        components: ['Header', 'Navigation'],
        dependencies: ['astro:prefetch'],
        timestamp: Date.now() - 10800000 // 3 hours ago
      }
    ];
    
    console.log(`Found ${recentChanges.length} recent code changes`);
    console.log(`Generated ${scenarios.length} test scenarios`);
    
    // Test different ML prioritization strategies
    const strategies = ['risk-based', 'coverage-based', 'historical', 'hybrid'];
    
    for (const strategy of strategies) {
      console.log(`\n--- ${strategy.toUpperCase()} Strategy ---`);
      
      const prioritization = await MLTestPrioritizer.prioritizeTests(
        scenarios,
        recentChanges,
        strategy
      );
      
      console.log(`Strategy: ${prioritization.strategy}`);
      console.log(`Total Tests: ${prioritization.tests.length}`);
      console.log(`Estimated Duration: ${prioritization.totalEstimatedTime} minutes`);
      console.log(`Overall Confidence: ${prioritization.confidence}%`);
      
      // Display risk distribution
      console.log('\nRisk Distribution:');
      Object.entries(prioritization.riskDistribution).forEach(([risk, count]) => {
        console.log(`  ${risk}: ${count} tests`);
      });
      
      // Show top 5 prioritized tests
      console.log('\nTop 5 Prioritized Tests:');
      prioritization.tests.slice(0, 5).forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.testId}`);
        console.log(`     Impact Score: ${test.impactScore}`);
        console.log(`     Risk Level: ${test.riskLevel}`);
        console.log(`     Confidence: ${test.confidence}%`);
        console.log(`     Duration: ${test.estimatedExecutionTime} min`);
        
        if (test.reasoning && test.reasoning.length > 0) {
          console.log(`     Reasoning: ${test.reasoning.slice(0, 2).join(', ')}`);
        }
        console.log('');
      });
      
      // Calculate efficiency metrics
      const criticalTests = prioritization.tests.filter(t => t.riskLevel === 'critical');
      const highTests = prioritization.tests.filter(t => t.riskLevel === 'high');
      const efficiency = ((criticalTests.length + highTests.length) / prioritization.tests.length) * 100;
      
      console.log(`Prioritization Efficiency: ${efficiency.toFixed(1)}% (critical + high tests)`);
    }
    
    // Demonstrate ML model information
    console.log('\n--- ML Models Information ---');
    const models = MLTestPrioritizer.getModelInfo();
    models.forEach(model => {
      console.log(`Model: ${model.name} v${model.version}`);
      console.log(`  Accuracy: ${Math.round(model.accuracy * 100)}%`);
      console.log(`  Features: ${model.features.join(', ')}`);
      console.log(`  Last Trained: ${new Date(model.lastTrained).toLocaleString()}`);
      console.log('');
    });
    
    // Add some execution results to improve ML learning
    console.log('--- Simulating Test Execution Results ---');
    
    const executionResults = [
      {
        testId: 'Basic functionality',
        scenario: scenarios[0],
        executionTime: 12,
        success: true,
        failureReason: undefined,
        coverage: 85,
        timestamp: Date.now(),
        changes: recentChanges
      },
      {
        testId: 'Accessibility compliance',
        scenario: scenarios[1],
        executionTime: 8,
        success: false,
        failureReason: 'Selector not found',
        coverage: 70,
        timestamp: Date.now(),
        changes: recentChanges.slice(0, 1)
      },
      {
        testId: 'Performance validation',
        scenario: scenarios[2],
        executionTime: 15,
        success: true,
        failureReason: undefined,
        coverage: 90,
        timestamp: Date.now(),
        changes: recentChanges.slice(1, 2)
      }
    ];
    
    executionResults.forEach(result => {
      MLTestPrioritizer.addExecutionResult(result);
    });
    
    console.log(`Added ${executionResults.length} execution results to ML training data`);
    
    // Retrain models with new data
    console.log('\n--- Retraining ML Models ---');
    await MLTestPrioritizer.retrainModels();
    
    const updatedModels = MLTestPrioritizer.getModelInfo();
    console.log('Models retrained successfully');
    updatedModels.forEach(model => {
      console.log(`  ${model.name}: ${Math.round(model.accuracy * 100)}% accuracy`);
    });
    
    // Display final statistics
    const stats = MLTestPrioritizer.getStatistics();
    console.log('\n--- ML Statistics ---');
    console.log(`Total Executions: ${stats.totalExecutions}`);
    console.log(`Success Rate: ${stats.successRate}%`);
    console.log(`Average Execution Time: ${stats.avgExecutionTime} minutes`);
    console.log(`Models Available: ${stats.modelsAvailable}`);
    console.log(`Code Changes Analyzed: ${stats.codeChanges}`);
    
    // Demonstrate predictive capabilities
    console.log('\n--- Predictive Analysis ---');
    
    // Predict execution time for new test
    const predictedTime = stats.avgExecutionTime * 1.2; // Simple prediction
    console.log(`Predicted execution time for new tests: ${Math.round(predictedTime)} minutes`);
    
    // Predict failure probability based on recent changes
    const recentFailureRate = stats.totalExecutions > 0 ? 
      (executionResults.filter(r => !r.success).length / executionResults.length) * 100 : 0;
    console.log(`Predicted failure probability: ${Math.round(recentFailureRate)}%`);
    
    // Generate recommendations
    console.log('\n--- ML Recommendations ---');
    
    if (stats.successRate < 85) {
      console.log('Recommendation: Consider improving test stability - success rate below 85%');
    }
    
    if (stats.avgExecutionTime > 20) {
      console.log('Recommendation: Optimize test execution - average time above 20 minutes');
    }
    
    if (stats.modelsAvailable < 3) {
      console.log('Recommendation: Train additional ML models for better predictions');
    }
    
    console.log('\n=== ML-Prioritized Tests Completed ===');
    
  } catch (error) {
    console.error('ML-prioritized test execution failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    await AITestEnhancer.cleanup();
  }
}

runMLPrioritizedTests();
