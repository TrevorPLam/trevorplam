#!/usr/bin/env node

/**
 * Self-Healing Test Runner
 * Demonstrates automatic selector adaptation and test maintenance
 */

import { SelfHealingEngine } from './SelfHealingEngine.ts';
import { AITestEnhancer } from './AITestEnhancer.ts';

async function runSelfHealingTests() {
  console.log('=== Running Self-Healing Tests ===');
  
  try {
    // Initialize AI components
    await AITestEnhancer.initializeAIComponents();
    
    // Simulate test failures for self-healing demonstration
    const testFailures = [
      {
        testId: 'metric-card-basic-test',
        selector: 'button[type="submit"]',
        errorType: 'selector-not-found',
        errorMessage: 'Element with selector "button[type="submit"]" not found',
        pageUrl: 'http://localhost:4173',
        timestamp: Date.now()
      },
      {
        testId: 'metric-card-accessibility-test',
        selector: '.metric-value',
        errorType: 'element-not-visible',
        errorMessage: 'Element with selector ".metric-value" is not visible',
        pageUrl: 'http://localhost:4173',
        timestamp: Date.now()
      },
      {
        testId: 'metric-card-interaction-test',
        selector: '#metric-button',
        errorType: 'stale-element',
        errorMessage: 'Element with selector "#metric-button" is stale',
        pageUrl: 'http://localhost:4173',
        timestamp: Date.now()
      }
    ];
    
    console.log(`Simulating ${testFailures.length} test failures for self-healing demo...\n`);
    
    // Record failures and attempt healing
    for (const failure of testFailures) {
      console.log(`--- Processing Failure: ${failure.testId} ---`);
      console.log(`Selector: ${failure.selector}`);
      console.log(`Error Type: ${failure.errorType}`);
      
      // Record the failure
      SelfHealingEngine.recordFailure(failure);
      
      // Simulate page analysis (in real scenario, this would use actual page)
      const mockPageAnalysis = {
        url: failure.pageUrl,
        title: 'Test Page',
        elements: [
          {
            selector: 'button.submit-btn',
            text: 'Submit',
            attributes: { type: 'button', class: 'submit-btn' },
            xpath: '//button[@class="submit-btn"]',
            cssPath: 'body > main > form > button.submit-btn',
            visible: true,
            enabled: true,
            tagName: 'button',
            className: 'submit-btn',
            id: ''
          },
          {
            selector: '.metric-display .value',
            text: '42',
            attributes: { class: 'value' },
            xpath: '//div[@class="value"]',
            cssPath: 'body > main > .metric-display > .value',
            visible: true,
            enabled: true,
            tagName: 'div',
            className: 'value',
            id: ''
          },
          {
            selector: '#metrics-action',
            text: 'Click Me',
            attributes: { id: 'metrics-action', type: 'button' },
            xpath: '//button[@id="metrics-action"]',
            cssPath: 'body > main > #metrics-action',
            visible: true,
            enabled: true,
            tagName: 'button',
            className: '',
            id: 'metrics-action'
          }
        ],
        structure: '<html><body><main>...</main></body></html>',
        timestamp: Date.now()
      };
      
      // Get healing suggestions
      const suggestions = await SelfHealingEngine.getHealingSuggestions(failure, null);
      
      if (suggestions.length > 0) {
        console.log(`Found ${suggestions.length} healing suggestions:`);
        
        suggestions.forEach((suggestion, index) => {
          console.log(`  ${index + 1}. ${suggestion.suggestedSelector}`);
          console.log(`     Method: ${suggestion.method}`);
          console.log(`     Confidence: ${suggestion.confidence}%`);
          console.log(`     Reasoning: ${suggestion.reasoning}`);
        });
        
        // Simulate successful healing with the best suggestion
        const bestSuggestion = suggestions[0];
        console.log(`\n   Self-healing successful!`);
        console.log(`   Healed selector: ${bestSuggestion.suggestedSelector}`);
        console.log(`   Method: ${bestSuggestion.method}`);
        console.log(`   Confidence: ${bestSuggestion.confidence}%`);
        
      } else {
        console.log('   No healing suggestions available');
      }
      
      console.log('');
    }
    
    // Display self-healing statistics
    const healingStats = SelfHealingEngine.getHealingStatistics();
    console.log('=== Self-Healing Statistics ===');
    console.log(`Total Healings: ${healingStats.totalHealings}`);
    console.log(`Successful Healings: ${healingStats.successfulHealings}`);
    console.log(`Success Rate: ${healingStats.successRate}%`);
    console.log(`Total Failures: ${healingStats.totalFailures}`);
    console.log(`Cache Size: ${healingStats.cacheSize}`);
    
    if (healingStats.methodStats) {
      console.log('\nHealing Methods:');
      Object.entries(healingStats.methodStats).forEach(([method, count]) => {
        console.log(`  ${method}: ${count}`);
      });
    }
    
    // Analyze flaky tests
    const flakyAnalysis = SelfHealingEngine.analyzeFlakyTests();
    if (flakyAnalysis.flakySelectors.length > 0) {
      console.log('\n=== Flaky Test Analysis ===');
      console.log(`Found ${flakyAnalysis.flakySelectors.length} potentially flaky selectors:`);
      
      flakyAnalysis.flakySelectors.slice(0, 3).forEach(flaky => {
        console.log(`  ${flaky.selector}: ${Math.round(flaky.failureRate * 100)}% failure rate`);
      });
      
      console.log('\nRecommendations:');
      flakyAnalysis.recommendations.slice(0, 2).forEach(rec => {
        console.log(`  ${rec.recommendation} (Priority: ${rec.priority})`);
      });
    }
    
    // Export healing data for analysis
    const healingData = SelfHealingEngine.exportHealingData();
    console.log(`\nHealing data exported: ${healingData.healingHistory.length} records`);
    
    console.log('\n=== Self-Healing Tests Completed ===');
    
  } catch (error) {
    console.error('Self-healing test execution failed:', error);
    process.exit(1);
  } finally {
    // Cleanup
    SelfHealingEngine.clearHistory();
    await AITestEnhancer.cleanup();
  }
}

runSelfHealingTests();
