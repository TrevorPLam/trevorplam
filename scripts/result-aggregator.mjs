#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const AGGREGATED_RESULTS_PATH = join(process.cwd(), 'data', 'aggregated-results.json');
const SHARD_RESULTS_PATH = join(process.cwd(), 'data', 'shard-results');

class ResultAggregator {
  constructor() {
    this.ensureDataDirectory();
    this.aggregatedData = this.loadAggregatedResults();
  }

  ensureDataDirectory() {
    const dataDir = join(process.cwd(), 'data');
    const shardDir = join(process.cwd(), 'data', 'shard-results');
    
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    
    if (!existsSync(shardDir)) {
      mkdirSync(shardDir, { recursive: true });
    }
  }

  loadAggregatedResults() {
    if (existsSync(AGGREGATED_RESULTS_PATH)) {
      try {
        return JSON.parse(readFileSync(AGGREGATED_RESULTS_PATH, 'utf8'));
      } catch (error) {
        console.warn('Warning: Could not parse aggregated results, starting fresh');
        return {};
      }
    }
    return {};
  }

  saveAggregatedResults(data) {
    writeFileSync(AGGREGATED_RESULTS_PATH, JSON.stringify(data, null, 2));
  }

  collectShardResults(sessionId) {
    const results = {
      sessionId,
      timestamp: Date.now(),
      shards: {},
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        totalDuration: 0,
        successRate: 0
      },
      testTypes: {},
      performance: {},
      issues: []
    };

    try {
      // Find all result files
      const resultFiles = this.findResultFiles();
      
      // Process each result file
      resultFiles.forEach(file => {
        const shardResult = this.processResultFile(file);
        if (shardResult) {
          results.shards[shardResult.shardId] = shardResult;
          this.updateSummary(results, shardResult);
        }
      });

      // Calculate test type summaries
      this.calculateTestTypeSummaries(results);
      
      // Analyze performance
      this.analyzePerformance(results);
      
      // Identify issues
      this.identifyIssues(results);

      // Save aggregated results
      this.aggregatedData[sessionId] = results;
      this.saveAggregatedResults(this.aggregatedData);

      console.log(`Aggregated results for session ${sessionId}:`);
      console.log(`- Total Tests: ${results.summary.totalTests}`);
      console.log(`- Success Rate: ${results.summary.successRate.toFixed(2)}%`);
      console.log(`- Duration: ${results.summary.totalDuration}ms`);

      return results;

    } catch (error) {
      console.error('Error collecting shard results:', error.message);
      throw error;
    }
  }

  findResultFiles() {
    const resultFiles = [];
    const patterns = [
      'results-*.json',
      'tests/reports/**/*.json',
      'data/shard-results/**/*.json'
    ];

    patterns.forEach(pattern => {
      try {
        const files = this.globFiles(pattern);
        resultFiles.push(...files);
      } catch (error) {
        console.warn(`Could not find files matching pattern ${pattern}:`, error.message);
      }
    });

    return resultFiles;
  }

  globFiles(pattern) {
    // Simple glob implementation - in a real scenario, use a proper glob library
    const files = [];
    const parts = pattern.split('/');
    const baseDir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.';
    const filePattern = parts[parts.length - 1];

    if (existsSync(baseDir)) {
      const items = readdirSync(baseDir, { withFileTypes: true });
      
      items.forEach(item => {
        if (item.isFile() && this.matchesPattern(item.name, filePattern)) {
          files.push(join(baseDir, item.name));
        } else if (item.isDirectory() && pattern.includes('**')) {
          // Recursive search for ** patterns
          const subFiles = this.globFiles(join(baseDir, item.name, '**', filePattern));
          files.push(...subFiles);
        }
      });
    }

    return files;
  }

  matchesPattern(filename, pattern) {
    // Simple pattern matching - supports * wildcard
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(filename);
  }

  processResultFile(filePath) {
    try {
      const content = readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);
      
      const shardInfo = this.extractShardInfo(filePath);
      
      return {
        shardId: shardInfo.id,
        testType: shardInfo.testType,
        shardNumber: shardInfo.shardNumber,
        filePath,
        timestamp: this.getFileTimestamp(filePath),
        results: this.normalizeTestResults(data),
        performance: this.extractPerformanceData(data),
        coverage: this.extractCoverageData(data),
        issues: this.extractIssues(data)
      };

    } catch (error) {
      console.warn(`Could not process result file ${filePath}:`, error.message);
      return null;
    }
  }

  extractShardInfo(filePath) {
    const filename = basename(filePath, extname(filePath));
    
    // Parse filename patterns like "results-unit-1.json" or "results-components-2-chrome.json"
    const match = filename.match(/results?-(\w+)-(\d+)(?:-(\w+))?/);
    
    if (match) {
      return {
        id: filename,
        testType: match[1],
        shardNumber: parseInt(match[2]),
        browser: match[3] || 'chrome'
      };
    }
    
    // Fallback pattern
    return {
      id: filename,
      testType: 'unknown',
      shardNumber: 0,
      browser: 'chrome'
    };
  }

  getFileTimestamp(filePath) {
    try {
      const stats = readFileSync(filePath, { encoding: 'utf8' });
      // Try to extract timestamp from file content first
      const data = JSON.parse(stats);
      return data.timestamp || Date.now();
    } catch {
      // Fallback to file modification time
      return Date.now();
    }
  }

  normalizeTestResults(data) {
    // Normalize different test result formats to a common structure
    const normalized = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0,
      duration: 0,
      testResults: []
    };

    // Vitest format
    if (data.numTotalTests !== undefined) {
      normalized.totalTests = data.numTotalTests;
      normalized.passed = data.numPassedTests;
      normalized.failed = data.numFailedTests;
      normalized.skipped = data.numPendingTests;
      normalized.duration = data.testResults?.reduce((sum, test) => sum + (test.duration || 0), 0) || 0;
      normalized.testResults = data.testResults || [];
    }
    
    // Playwright format
    else if (data.suites !== undefined) {
      data.suites.forEach(suite => {
        suite.specs?.forEach(spec => {
          spec.tests?.forEach(test => {
            normalized.totalTests++;
            if (test.results?.[0]?.status === 'passed') normalized.passed++;
            else if (test.results?.[0]?.status === 'failed') normalized.failed++;
            else if (test.results?.[0]?.status === 'skipped') normalized.skipped++;
            
            normalized.duration += test.results?.[0]?.duration || 0;
            
            normalized.testResults.push({
              title: test.title,
              status: test.results?.[0]?.status,
              duration: test.results?.[0]?.duration
            });
          });
        });
      });
    }
    
    // Generic format
    else if (data.tests !== undefined) {
      normalized.totalTests = data.tests.length;
      data.tests.forEach(test => {
        if (test.status === 'passed') normalized.passed++;
        else if (test.status === 'failed') normalized.failed++;
        else if (test.status === 'skipped') normalized.skipped++;
        
        normalized.duration += test.duration || 0;
        
        normalized.testResults.push({
          title: test.title || test.name,
          status: test.status,
          duration: test.duration
        });
      });
    }

    return normalized;
  }

  extractPerformanceData(data) {
    return {
      executionTime: data.duration || 0,
      memoryUsage: data.memoryUsage || 0,
      cpuUsage: data.cpuUsage || 0,
      setupTime: data.setupTime || 0,
      teardownTime: data.teardownTime || 0
    };
  }

  extractCoverageData(data) {
    if (data.coverageMap) {
      return {
        lines: this.calculateCoverage(data.coverageMap, 'lines'),
        functions: this.calculateCoverage(data.coverageMap, 'functions'),
        branches: this.calculateCoverage(data.coverageMap, 'branches'),
        statements: this.calculateCoverage(data.coverageMap, 'statements')
      };
    }
    
    return null;
  }

  calculateCoverage(coverageMap, type) {
    // Simplified coverage calculation
    const entries = Object.values(coverageMap);
    if (entries.length === 0) return 0;
    
    let covered = 0;
    let total = 0;
    
    entries.forEach(entry => {
      if (entry[type]) {
        covered += entry[type].covered || 0;
        total += entry[type].total || 0;
      }
    });
    
    return total > 0 ? (covered / total) * 100 : 0;
  }

  extractIssues(data) {
    const issues = [];
    
    // Extract failed tests as issues
    if (data.testResults) {
      data.testResults.forEach(test => {
        if (test.status === 'failed') {
          issues.push({
            type: 'test_failure',
            severity: 'high',
            title: `Failed test: ${test.title}`,
            details: test.error || test.failureMessage || 'Unknown failure',
            testFile: test.file || 'unknown'
          });
        }
      });
    }
    
    // Extract timeouts
    if (data.timeout) {
      issues.push({
        type: 'timeout',
        severity: 'medium',
        title: 'Test execution timeout',
        details: `Test timed out after ${data.timeout}ms`
      });
    }
    
    return issues;
  }

  updateSummary(results, shardResult) {
    const shardData = shardResult.results;
    
    results.summary.totalTests += shardData.totalTests;
    results.summary.totalPassed += shardData.passed;
    results.summary.totalFailed += shardData.failed;
    results.summary.totalSkipped += shardData.skipped;
    results.summary.totalDuration += shardData.duration;
    
    // Add issues
    results.issues.push(...shardResult.issues);
  }

  calculateTestTypeSummaries(results) {
    const typeGroups = {};
    
    Object.values(results.shards).forEach(shard => {
      const type = shard.testType;
      
      if (!typeGroups[type]) {
        typeGroups[type] = {
          totalTests: 0,
          passed: 0,
          failed: 0,
          skipped: 0,
          duration: 0,
          shards: [],
          successRate: 0
        };
      }
      
      const group = typeGroups[type];
      const shardData = shard.results;
      
      group.totalTests += shardData.totalTests;
      group.passed += shardData.passed;
      group.failed += shardData.failed;
      group.skipped += shardData.skipped;
      group.duration += shardData.duration;
      group.shards.push(shard.shardNumber);
      
      group.successRate = group.totalTests > 0 
        ? (group.passed / group.totalTests) * 100 
        : 0;
    });
    
    results.testTypes = typeGroups;
  }

  analyzePerformance(results) {
    const performance = {
      totalExecutionTime: results.summary.totalDuration,
      averageTestDuration: results.summary.totalTests > 0 
        ? results.summary.totalDuration / results.summary.totalTests 
        : 0,
      shardVariance: this.calculateShardVariance(results),
      slowestShards: this.findSlowestShards(results),
      fastestShards: this.findFastestShards(results),
      resourceUtilization: this.calculateResourceUtilization(results)
    };
    
    results.performance = performance;
  }

  calculateShardVariance(results) {
    const shardDurations = Object.values(results.shards).map(shard => shard.results.duration);
    
    if (shardDurations.length === 0) return 0;
    
    const mean = shardDurations.reduce((sum, duration) => sum + duration, 0) / shardDurations.length;
    const variance = shardDurations.reduce((sum, duration) => sum + Math.pow(duration - mean, 2), 0) / shardDurations.length;
    
    return Math.sqrt(variance);
  }

  findSlowestShards(results, limit = 3) {
    return Object.values(results.shards)
      .sort((a, b) => b.results.duration - a.results.duration)
      .slice(0, limit)
      .map(shard => ({
        shardId: shard.shardId,
        testType: shard.testType,
        duration: shard.results.duration,
        testCount: shard.results.totalTests
      }));
  }

  findFastestShards(results, limit = 3) {
    return Object.values(results.shards)
      .sort((a, b) => a.results.duration - b.results.duration)
      .slice(0, limit)
      .map(shard => ({
        shardId: shard.shardId,
        testType: shard.testType,
        duration: shard.results.duration,
        testCount: shard.results.totalTests
      }));
  }

  calculateResourceUtilization(results) {
    const utilization = {
      cpu: 0,
      memory: 0,
      diskIO: 0
    };
    
    const shards = Object.values(results.shards);
    if (shards.length === 0) return utilization;
    
    shards.forEach(shard => {
      const perf = shard.performance;
      utilization.cpu += perf.cpuUsage || 0;
      utilization.memory += perf.memoryUsage || 0;
      utilization.diskIO += 0; // Placeholder
    });
    
    // Average across shards
    Object.keys(utilization).forEach(key => {
      utilization[key] = utilization[key] / shards.length;
    });
    
    return utilization;
  }

  identifyIssues(results) {
    const issues = [...results.issues];
    
    // Performance issues
    if (results.performance.shardVariance > 30000) { // 30 seconds
      issues.push({
        type: 'performance',
        severity: 'medium',
        title: 'High shard variance detected',
        details: `Shard variance is ${results.performance.shardVariance}ms. Consider rebalancing.`
      });
    }
    
    // Quality issues
    const successRate = results.summary.totalTests > 0 
      ? (results.summary.totalPassed / results.summary.totalTests) * 100 
      : 0;
    
    if (successRate < 95) {
      issues.push({
        type: 'quality',
        severity: 'high',
        title: 'Low success rate',
        details: `Overall success rate is ${successRate.toFixed(2)}%. Target is 95%.`
      });
    }
    
    // Test type issues
    Object.entries(results.testTypes).forEach(([type, data]) => {
      if (data.successRate < 90) {
        issues.push({
          type: 'quality',
          severity: 'medium',
          title: `Low success rate in ${type} tests`,
          details: `${type} tests have ${data.successRate.toFixed(2)}% success rate.`
        });
      }
    });
    
    results.issues = issues;
  }

  generateReport(sessionId) {
    const results = this.aggregatedData[sessionId];
    
    if (!results) {
      throw new Error(`No results found for session: ${sessionId}`);
    }
    
    const report = {
      sessionId,
      timestamp: results.timestamp,
      executiveSummary: {
        totalTests: results.summary.totalTests,
        successRate: results.summary.successRate,
        totalDuration: results.summary.totalDuration,
        issuesCount: results.issues.length
      },
      testTypeBreakdown: Object.entries(results.testTypes).map(([type, data]) => ({
        type,
        tests: data.totalTests,
        successRate: data.successRate,
        duration: data.duration,
        shards: data.shards.length
      })),
      performanceAnalysis: {
        averageTestDuration: results.performance.averageTestDuration,
        shardVariance: results.performance.shardVariance,
        slowestShards: results.performance.slowestShards,
        fastestShards: results.performance.fastestShards
      },
      issues: results.issues.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      }),
      recommendations: this.generateRecommendations(results)
    };
    
    return report;
  }

  generateRecommendations(results) {
    const recommendations = [];
    
    // Performance recommendations
    if (results.performance.shardVariance > 30000) {
      recommendations.push({
        category: 'performance',
        priority: 'high',
        title: 'Rebalance shard distribution',
        description: 'High variance between shards indicates uneven distribution. Consider redistributing tests.',
        action: 'Run load balancer optimization'
      });
    }
    
    // Quality recommendations
    const successRate = results.summary.successRate;
    if (successRate < 95) {
      recommendations.push({
        category: 'quality',
        priority: 'high',
        title: 'Improve test stability',
        description: `Success rate is ${successRate.toFixed(2)}%. Address failing tests to improve reliability.`,
        action: 'Review and fix failing tests'
      });
    }
    
    // Test type recommendations
    Object.entries(results.testTypes).forEach(([type, data]) => {
      if (data.successRate < 90) {
        recommendations.push({
          category: 'quality',
          priority: 'medium',
          title: `Fix ${type} test issues`,
          description: `${type} tests have ${data.successRate.toFixed(2)}% success rate.`,
          action: `Investigate ${type} test failures`
        });
      }
    });
    
    return recommendations;
  }

  exportResults(sessionId, format = 'json') {
    const report = this.generateReport(sessionId);
    
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(report, null, 2);
        
      case 'markdown':
        return this.generateMarkdownReport(report);
        
      case 'html':
        return this.generateHtmlReport(report);
        
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  generateMarkdownReport(report) {
    let markdown = `# Test Execution Report\n\n`;
    markdown += `**Session ID:** ${report.sessionId}\n`;
    markdown += `**Timestamp:** ${new Date(report.timestamp).toISOString()}\n\n`;
    
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Total Tests:** ${report.executiveSummary.totalTests}\n`;
    markdown += `- **Success Rate:** ${report.executiveSummary.successRate.toFixed(2)}%\n`;
    markdown += `- **Duration:** ${report.executiveSummary.totalDuration}ms\n`;
    markdown += `- **Issues:** ${report.executiveSummary.issuesCount}\n\n`;
    
    markdown += `## Test Type Breakdown\n\n`;
    markdown += `| Type | Tests | Success Rate | Duration | Shards |\n`;
    markdown += `|------|-------|-------------|----------|--------|\n`;
    
    report.testTypeBreakdown.forEach(type => {
      markdown += `| ${type.type} | ${type.tests} | ${type.successRate.toFixed(2)}% | ${type.duration}ms | ${type.shards} |\n`;
    });
    
    markdown += `\n## Performance Analysis\n\n`;
    markdown += `- **Average Test Duration:** ${report.performanceAnalysis.averageTestDuration.toFixed(2)}ms\n`;
    markdown += `- **Shard Variance:** ${report.performanceAnalysis.shardVariance}ms\n\n`;
    
    if (report.issues.length > 0) {
      markdown += `## Issues\n\n`;
      report.issues.forEach(issue => {
        markdown += `### [${issue.severity.toUpperCase()}] ${issue.title}\n`;
        markdown += `${issue.details}\n\n`;
      });
    }
    
    if (report.recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      report.recommendations.forEach(rec => {
        markdown += `### [${rec.priority.toUpperCase()}] ${rec.title}\n`;
        markdown += `${rec.description}\n\n`;
        markdown += `**Action:** ${rec.action}\n\n`;
      });
    }
    
    return markdown;
  }

  generateHtmlReport(report) {
    // Simple HTML report generation
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Test Execution Report - ${report.sessionId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; }
        .issue { margin: 10px 0; padding: 10px; border-left: 4px solid; }
        .high { border-color: #d32f2f; background: #ffebee; }
        .medium { border-color: #f57c00; background: #fff3e0; }
        .low { border-color: #388e3c; background: #e8f5e8; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Test Execution Report</h1>
    <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Session ID:</strong> ${report.sessionId}</p>
        <p><strong>Total Tests:</strong> ${report.executiveSummary.totalTests}</p>
        <p><strong>Success Rate:</strong> ${report.executiveSummary.successRate.toFixed(2)}%</p>
        <p><strong>Duration:</strong> ${report.executiveSummary.totalDuration}ms</p>
        <p><strong>Issues:</strong> ${report.executiveSummary.issuesCount}</p>
    </div>
    
    <h2>Test Type Breakdown</h2>
    <table>
        <tr><th>Type</th><th>Tests</th><th>Success Rate</th><th>Duration</th><th>Shards</th></tr>
        ${report.testTypeBreakdown.map(type => 
            `<tr><td>${type.type}</td><td>${type.tests}</td><td>${type.successRate.toFixed(2)}%</td><td>${type.duration}ms</td><td>${type.shards}</td></tr>`
        ).join('')}
    </table>
    
    ${report.issues.length > 0 ? `
    <h2>Issues</h2>
        ${report.issues.map(issue => 
            `<div class="issue ${issue.severity}">
                <h3>${issue.title}</h3>
                <p>${issue.details}</p>
            </div>`
        ).join('')}
    ` : ''}
    
    ${report.recommendations.length > 0 ? `
    <h2>Recommendations</h2>
        ${report.recommendations.map(rec => 
            `<div class="issue ${rec.priority}">
                <h3>${rec.title}</h3>
                <p>${rec.description}</p>
                <p><strong>Action:</strong> ${rec.action}</p>
            </div>`
        ).join('')}
    ` : ''}
</body>
</html>`;
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const aggregator = new ResultAggregator();
  
  switch (command) {
    case 'collect': {
      const sessionId = args.find(arg => arg.startsWith('--session='))?.split('=')[1] || `session-${Date.now()}`;
      
      try {
        const results = aggregator.collectShardResults(sessionId);
        console.log('Results collection completed successfully');
        console.log(`Session: ${sessionId}`);
        console.log(`Tests: ${results.summary.totalTests}`);
        console.log(`Success Rate: ${results.summary.successRate.toFixed(2)}%`);
        
      } catch (error) {
        console.error('Results collection failed:', error.message);
        process.exit(1);
      }
      break;
    }
      
    case 'report': {
      const sessionId = args.find(arg => arg.startsWith('--session='))?.split('=')[1];
      const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'json';
      
      if (!sessionId) {
        console.error('Error: --session is required for report command');
        process.exit(1);
      }
      
      try {
        const report = aggregator.exportResults(sessionId, format);
        console.log(report);
        
      } catch (error) {
        console.error('Report generation failed:', error.message);
        process.exit(1);
      }
      break;
    }
      
    case 'list': {
      const sessions = Object.keys(aggregator.aggregatedData);
      console.log('Available sessions:');
      sessions.forEach(session => {
        const data = aggregator.aggregatedData[session];
        console.log(`  ${session} - ${data.summary.totalTests} tests, ${data.summary.successRate.toFixed(2)}% success`);
      });
      break;
    }
      
    case 'clean': {
      const olderThan = args.find(arg => arg.startsWith('--older-than='))?.split('=')[1] || '7d';
      
      // Clean old results (placeholder implementation)
      console.log(`Cleaning results older than ${olderThan}`);
      console.log('Clean operation completed');
      break;
    }
      
    default:
      console.log('Usage:');
      console.log('  node result-aggregator.mjs collect [--session=<session-id>]');
      console.log('  node result-aggregator.mjs report --session=<session-id> [--format=<json|markdown|html>]');
      console.log('  node result-aggregator.mjs list');
      console.log('  node result-aggregator.mjs clean [--older-than=<duration>]');
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default ResultAggregator;
