#!/usr/bin/env node

import { PerformanceMonitor } from '../tests/performance/performance-monitor.ts';
import { RegressionDetector } from '../tests/performance/regression-detector.ts';
import { TestExecutionDashboard } from '../tests/performance/dashboard.ts';
import { IntelligentTestScheduler } from '../tests/performance/test-scheduler.ts';
import { writeFileSync } from 'fs';

const command = process.argv[2];
const args = process.argv.slice(3);

async function main() {
  console.log('Performance Monitoring System - 2026 Enterprise Standards');
  console.log('==========================================================\n');

  try {
    switch (command) {
      case 'collect':
        await collectMetrics();
        break;
      
      case 'analyze':
        await analyzeRegressions();
        break;
      
      case 'dashboard':
        await generateDashboard();
        break;
      
      case 'schedule':
        await createSchedule();
        break;
      
      case 'optimize':
        await optimizeSchedule();
        break;
      
      case 'report':
        await generateReport();
        break;
      
      case 'full':
        await runFullAnalysis();
        break;
      
      default:
        showUsage();
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

async function collectMetrics() {
  console.log('Collecting test execution metrics...');
  
  const monitor = new PerformanceMonitor();
  const metrics = await monitor.collectTestMetrics();
  
  console.log(`\nCollected metrics for ${metrics.length} test files`);
  console.log(`Total duration: ${metrics.reduce((sum, m) => sum + m.duration, 0)}ms`);
  console.log(`Average duration: ${Math.round(metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length)}ms`);
  
  // Show category breakdown
  const categories = {};
  metrics.forEach(metric => {
    categories[metric.category] = (categories[metric.category] || 0) + 1;
  });
  
  console.log('\nCategory breakdown:');
  Object.entries(categories).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} tests`);
  });
}

async function analyzeRegressions() {
  console.log('Analyzing performance regressions...');
  
  const detector = new RegressionDetector();
  const analysis = await detector.analyzeRegressions();
  
  console.log(`\nRegression Analysis Results:`);
  console.log(`Current regressions: ${analysis.currentRegressions.length}`);
  console.log(`Critical regressions: ${analysis.currentRegressions.filter(r => r.severity === 'critical').length}`);
  console.log(`Detected patterns: ${analysis.patterns.length}`);
  console.log(`High-risk predictions: ${analysis.predictions.filter(p => p.riskScore > 0.7).length}`);
  
  if (analysis.currentRegressions.length > 0) {
    console.log('\nCurrent Regressions:');
    analysis.currentRegressions.slice(0, 5).forEach(regression => {
      console.log(`  ${regression.testFile}: ${regression.regressionPercentage.toFixed(1)}% increase`);
    });
  }
  
  if (analysis.recommendations.length > 0) {
    console.log('\nRecommendations:');
    analysis.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
  }
}

async function generateDashboard() {
  console.log('Generating test execution dashboard...');
  
  const dashboard = new TestExecutionDashboard();
  const initialized = await dashboard.initialize();
  
  // Generate HTML dashboard
  const html = dashboard.generateHtmlDashboard();
  const dashboardFile = 'tests/metrics/dashboard.html';
  writeFileSync(dashboardFile, html);
  
  console.log(`\nDashboard generated: ${dashboardFile}`);
  console.log(`Total tests: ${initialized.data.summary.totalTests}`);
  console.log(`Pass rate: ${(initialized.data.summary.passRate * 100).toFixed(1)}%`);
  console.log(`Health score: ${Math.round(initialized.data.summary.healthScore)}%`);
  console.log(`Active alerts: ${initialized.data.summary.activeAlerts}`);
  
  console.log('\nTo view the dashboard:');
  console.log(`  open ${dashboardFile} in your browser`);
  console.log('  Dashboard will auto-refresh every 30 seconds');
}

async function createSchedule() {
  console.log('Creating optimized test schedule...');
  
  const scheduler = new IntelligentTestScheduler();
  const scheduleName = args[0] || 'optimized-schedule';
  const strategy = args[1] || 'balanced';
  
  const optimization = {
    strategy,
    parallelismEnabled: true,
    intelligentSharding: true,
    adaptiveTimeouts: true,
    resourceAwareness: true,
    predictiveScheduling: true
  };
  
  const schedule = await scheduler.createOptimizedSchedule(scheduleName, optimization);
  
  console.log(`\nSchedule created: ${schedule.name}`);
  console.log(`Total phases: ${schedule.phases.length}`);
  console.log(`Estimated duration: ${Math.round(schedule.totalEstimatedDuration / 1000)}s`);
  console.log(`Optimization strategy: ${schedule.optimization.strategy}`);
  
  console.log('\nPhases:');
  schedule.phases.forEach(phase => {
    console.log(`  ${phase.order}. ${phase.name}: ${phase.tests.length} tests, ${Math.round(phase.estimatedDuration / 1000)}s`);
  });
}

async function optimizeSchedule() {
  console.log('Auto-optimizing test schedule...');
  
  const scheduler = new IntelligentTestScheduler();
  const scheduleId = args[0];
  
  if (!scheduleId) {
    console.error('Schedule ID required');
    process.exit(1);
  }
  
  const optimized = await scheduler.autoOptimizeSchedule(scheduleId);
  
  console.log(`\nSchedule optimized: ${optimized.name}`);
  console.log(`Updated: ${optimized.lastUpdated}`);
  
  // Show what changed
  const analysis = scheduler.analyzeSchedulePerformance(scheduleId);
  console.log(`\nPerformance improvements:`);
  console.log(`  Accuracy score: ${Math.round(analysis.accuracyScore * 100)}%`);
  console.log(`  Efficiency score: ${Math.round(analysis.efficiencyScore * 100)}%`);
  console.log(`  Reliability score: ${Math.round(analysis.reliabilityScore * 100)}%`);
}

async function generateReport() {
  console.log('Generating comprehensive performance report...');
  
  const monitor = new PerformanceMonitor();
  const report = monitor.generatePerformanceReport();
  
  console.log(`\nPerformance Report - Generated ${report.generated}`);
  console.log(`=====================================`);
  
  console.log(`\nSummary:`);
  console.log(`  Total tests: ${report.summary.totalTests}`);
  console.log(`  Total duration: ${Math.round(report.summary.totalDuration / 1000)}s`);
  console.log(`  Average duration: ${Math.round(report.summary.avgDuration)}ms`);
  console.log(`  Environment: ${report.summary.environment}`);
  
  console.log(`\nCategory Analysis:`);
  report.categoryAnalysis.forEach(category => {
    const status = category.healthScore > 80 ? 'Good' : category.healthScore > 60 ? 'Fair' : 'Poor';
    console.log(`  ${category.category}: ${category.testCount} tests, ${Math.round(category.avgDuration)}ms avg, ${status} (${Math.round(category.healthScore)}% health)`);
  });
  
  if (report.regressionAnalysis.totalRegressions > 0) {
    console.log(`\nRegression Analysis:`);
    console.log(`  Total regressions: ${report.regressionAnalysis.totalRegressions}`);
    console.log(`  Critical regressions: ${report.regressionAnalysis.criticalRegressions}`);
    console.log(`  Average regression: ${Math.round(report.regressionAnalysis.avgRegressionPercentage)}%`);
  }
  
  console.log(`\nTrends:`);
  report.trends.forEach(trend => {
    const icon = trend.trend === 'improving' ? 'up' : trend.trend === 'degrading' ? 'down' : 'stable';
    console.log(`  ${trend.category}: ${icon} ${trend.trendPercentage.toFixed(1)}% (${trend.dataPoints} data points)`);
  });
  
  if (report.recommendations.length > 0) {
    console.log(`\nRecommendations:`);
    report.recommendations.forEach(rec => {
      console.log(`  - ${rec}`);
    });
  }
  
  // Save detailed report
  const reportFile = 'tests/metrics/performance-report.json';
  writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\nDetailed report saved: ${reportFile}`);
}

async function runFullAnalysis() {
  console.log('Running full performance analysis...');
  console.log('This may take a few minutes...\n');
  
  // Step 1: Collect metrics
  console.log('1. Collecting metrics...');
  const monitor = new PerformanceMonitor();
  const metrics = await monitor.collectTestMetrics();
  
  // Step 2: Analyze regressions
  console.log('2. Analyzing regressions...');
  const detector = new RegressionDetector();
  const regressionAnalysis = await detector.analyzeRegressions();
  
  // Step 3: Generate dashboard
  console.log('3. Generating dashboard...');
  const dashboard = new TestExecutionDashboard();
  await dashboard.initialize();
  
  // Step 4: Create schedule
  console.log('4. Creating optimized schedule...');
  const scheduler = new IntelligentTestScheduler();
  const schedule = await scheduler.createOptimizedSchedule('full-analysis-schedule');
  
  // Step 5: Generate report
  console.log('5. Generating comprehensive report...');
  const report = monitor.generatePerformanceReport();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('FULL ANALYSIS COMPLETE');
  console.log('='.repeat(50));
  
  console.log(`\nMetrics Collected: ${metrics.length} tests`);
  console.log(`Regressions Found: ${regressionAnalysis.currentRegressions.length}`);
  console.log(`Schedule Phases: ${schedule.phases.length}`);
  console.log(`Dashboard Generated: tests/metrics/dashboard.html`);
  console.log(`Report Saved: tests/metrics/performance-report.json`);
  
  // Key insights
  console.log('\nKey Insights:');
  console.log(`  Overall health score: ${Math.round(report.summary.healthScore)}%`);
  console.log(`  Pass rate: ${(report.summary.passRate * 100).toFixed(1)}%`);
  console.log(`  Average test duration: ${Math.round(report.summary.avgDuration)}ms`);
  console.log(`  Critical issues: ${regressionAnalysis.currentRegressions.filter(r => r.severity === 'critical').length}`);
  
  if (report.recommendations.length > 0) {
    console.log('\nTop Recommendations:');
    report.recommendations.slice(0, 3).forEach(rec => {
      console.log(`  - ${rec}`);
    });
  }
  
  console.log('\nNext Steps:');
  console.log('  1. View the dashboard: open tests/metrics/dashboard.html');
  console.log('  2. Review detailed report: tests/metrics/performance-report.json');
  console.log('  3. Address critical regressions first');
  console.log('  4. Implement optimization recommendations');
}

function showUsage() {
  console.log('Performance Monitoring System - Usage');
  console.log('=====================================');
  console.log('');
  console.log('Commands:');
  console.log('  collect                    - Collect test execution metrics');
  console.log('  analyze                    - Analyze performance regressions');
  console.log('  dashboard                  - Generate HTML dashboard');
  console.log('  schedule [name] [strategy]  - Create optimized test schedule');
  console.log('  optimize [schedule-id]      - Auto-optimize existing schedule');
  console.log('  report                     - Generate comprehensive report');
  console.log('  full                       - Run complete analysis pipeline');
  console.log('');
  console.log('Examples:');
  console.log('  npm run performance:collect');
  console.log('  npm run performance:dashboard');
  console.log('  npm run performance:schedule my-schedule balanced');
  console.log('  npm run performance:optimize abc123');
  console.log('  npm run performance:full');
  console.log('');
  console.log('Schedule strategies:');
  console.log('  speed      - Optimize for fastest execution');
  console.log('  reliability - Optimize for maximum reliability');
  console.log('  balanced   - Balance speed and reliability (default)');
}

// Run main function
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
