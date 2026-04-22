#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ORCHESTRATION_LOG_PATH = join(process.cwd(), 'logs', 'test-orchestration.json');
const PERFORMANCE_DATA_PATH = join(process.cwd(), 'data', 'performance-metrics.json');

class TestOrchestrator {
  constructor() {
    this.ensureLogDirectory();
    this.startTime = Date.now();
    this.sessionId = this.generateSessionId();
  }

  ensureLogDirectory() {
    const logsDir = join(process.cwd(), 'logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }
  }

  generateSessionId() {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  logEvent(event, data = {}) {
    const logEntry = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      event,
      data,
      elapsed: Date.now() - this.startTime
    };

    const logs = this.loadLogs();
    logs.push(logEntry);
    this.saveLogs(logs);
    
    console.log(`[ORCHESTRATOR] ${event}:`, JSON.stringify(data, null, 2));
  }

  loadLogs() {
    if (existsSync(ORCHESTRATION_LOG_PATH)) {
      try {
        return JSON.parse(readFileSync(ORCHESTRATION_LOG_PATH, 'utf8'));
      } catch (error) {
        console.warn('Warning: Could not parse orchestration logs, starting fresh');
        return [];
      }
    }
    return [];
  }

  saveLogs(logs) {
    writeFileSync(ORCHESTRATION_LOG_PATH, JSON.stringify(logs, null, 2));
  }

  async executeTestSuite(config) {
    this.logEvent('suite_start', { config });
    
    const results = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      config,
      testTypes: {},
      summary: {
        totalTests: 0,
        totalPassed: 0,
        totalFailed: 0,
        totalSkipped: 0,
        totalDuration: 0
      }
    };

    try {
      for (const [testType, typeConfig] of Object.entries(config.testTypes)) {
        const typeResult = await this.executeTestType(testType, typeConfig);
        results.testTypes[testType] = typeResult;
        
        // Update summary
        results.summary.totalTests += typeResult.totalTests || 0;
        results.summary.totalPassed += typeResult.passed || 0;
        results.summary.totalFailed += typeResult.failed || 0;
        results.summary.totalSkipped += typeResult.skipped || 0;
        results.summary.totalDuration += typeResult.duration || 0;
      }

      results.endTime = Date.now();
      results.success = true;
      
      this.logEvent('suite_complete', { summary: results.summary });
      return results;

    } catch (error) {
      results.endTime = Date.now();
      results.success = false;
      results.error = error.message;
      
      this.logEvent('suite_error', { error: error.message });
      throw error;
    }
  }

  async executeTestType(testType, config) {
    this.logEvent('test_type_start', { testType, config });
    
    const startTime = Date.now();
    const result = {
      testType,
      startTime,
      shards: {},
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0
      }
    };

    try {
      // Execute tests in parallel if configured
      if (config.parallel) {
        const shardPromises = config.shards.map(shard => 
          this.executeShard(testType, shard, config)
        );
        
        const shardResults = await Promise.allSettled(shardPromises);
        
        shardResults.forEach((shardResult, index) => {
          const shardNum = config.shards[index];
          if (shardResult.status === 'fulfilled') {
            result.shards[shardNum] = shardResult.value;
          } else {
            result.shards[shardNum] = {
              shard: shardNum,
              success: false,
              error: shardResult.reason.message,
              duration: 0
            };
          }
        });
      } else {
        // Execute sequentially
        for (const shard of config.shards) {
          const shardResult = await this.executeShard(testType, shard, config);
          result.shards[shard] = shardResult;
        }
      }

      // Calculate summary
      Object.values(result.shards).forEach(shard => {
        result.summary.totalTests += shard.totalTests || 0;
        result.summary.passed += shard.passed || 0;
        result.summary.failed += shard.failed || 0;
        result.summary.skipped += shard.skipped || 0;
      });

      result.duration = Date.now() - startTime;
      result.success = true;
      
      this.logEvent('test_type_complete', { testType, summary: result.summary });
      return result;

    } catch (error) {
      result.duration = Date.now() - startTime;
      result.success = false;
      result.error = error.message;
      
      this.logEvent('test_type_error', { testType, error: error.message });
      throw error;
    }
  }

  async executeShard(testType, shardNum, config) {
    this.logEvent('shard_start', { testType, shard: shardNum });
    
    const startTime = Date.now();
    const result = {
      testType,
      shard: shardNum,
      startTime,
      resourceLevel: config.resourceLevel || 'standard'
    };

    try {
      // Build command based on test type
      const command = this.buildTestCommand(testType, shardNum, config);
      
      // Execute with timeout and resource monitoring
      const executionResult = await this.executeCommand(command, {
        timeout: config.timeout || 300000, // 5 minutes default
        monitorResources: true
      });

      result.endTime = Date.now();
      result.duration = result.endTime - startTime;
      result.success = executionResult.success;
      result.exitCode = executionResult.exitCode;
      result.stdout = executionResult.stdout;
      result.stderr = executionResult.stderr;
      
      // Parse test results if available
      if (executionResult.success) {
        const testResults = this.parseTestResults(testType, shardNum);
        Object.assign(result, testResults);
      }

      // Collect performance metrics
      result.performance = executionResult.performance;

      this.logEvent('shard_complete', { 
        testType, 
        shard: shardNum, 
        duration: result.duration,
        success: result.success 
      });

      return result;

    } catch (error) {
      result.endTime = Date.now();
      result.duration = result.endTime - startTime;
      result.success = false;
      result.error = error.message;
      
      this.logEvent('shard_error', { testType, shard: shardNum, error: error.message });
      throw error;
    }
  }

  buildTestCommand(testType, shardNum, config) {
    const baseCommands = {
      unit: `npm run test:unit -- --shard=${shardNum} --reporter=json --outputFile=results-unit-${shardNum}.json`,
      components: `npx vitest run tests/components/ --no-coverage --reporter=json --outputFile=results-components-${shardNum}.json --shard=${shardNum}`,
      integration: `npx vitest run tests/integration/ --no-coverage --reporter=json --outputFile=results-integration-${shardNum}.json --shard=${shardNum}`,
      e2e: `npm run test:e2e -- --project="Desktop Chrome" --reporter=json --outputFile=results-e2e-${shardNum}.json`,
      accessibility: `npm run test:a11y -- --project="Desktop Chrome" --reporter=json --outputFile=results-a11y-${shardNum}.json`,
      performance: `npm run test:browser:performance -- --reporter=json --outputFile=results-performance-${shardNum}.json`,
      security: `npm run test:fuzz:security -- --timeout=30 --max-iterations=1000`,
      contract: `npm run test:contract -- --reporter=json --outputFile=results-contract-${shardNum}.json`
    };

    return baseCommands[testType] || `echo "Unknown test type: ${testType}"`;
  }

  async executeCommand(command, options = {}) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      let stdout = '';
      let stderr = '';
      let child;

      try {
        // Set resource limits based on configuration
        const resourceLimits = this.getResourceLimits(options.resourceLevel);
        
        child = execSync(command, {
          encoding: 'utf8',
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          timeout: options.timeout / 1000, // Convert to seconds
          stdio: 'pipe'
        });

        stdout = child;
        const endTime = Date.now();

        resolve({
          success: true,
          exitCode: 0,
          stdout,
          stderr: '',
          duration: endTime - startTime,
          performance: this.collectPerformanceMetrics(startTime, endTime)
        });

      } catch (error) {
        const endTime = Date.now();
        
        resolve({
          success: false,
          exitCode: error.status || 1,
          stdout: error.stdout || '',
          stderr: error.stderr || error.message,
          duration: endTime - startTime,
          performance: this.collectPerformanceMetrics(startTime, endTime)
        });
      }
    });
  }

  getResourceLimits(level = 'standard') {
    const limits = {
      standard: {
        maxWorkers: 2,
        memory: '2GB',
        timeout: 300000 // 5 minutes
      },
      enhanced: {
        maxWorkers: 3,
        memory: '4GB',
        timeout: 600000 // 10 minutes
      },
      high: {
        maxWorkers: 4,
        memory: '6GB',
        timeout: 900000 // 15 minutes
      }
    };

    return limits[level] || limits.standard;
  }

  collectPerformanceMetrics(startTime, endTime) {
    return {
      startTime,
      endTime,
      duration: endTime - startTime,
      // In a real implementation, these would be collected from system monitoring
      cpuUsage: Math.random() * 100, // Placeholder
      memoryUsage: Math.random() * 100, // Placeholder
      diskIO: Math.random() * 100 // Placeholder
    };
  }

  parseTestResults(testType, shardNum) {
    const resultFile = `results-${testType}-${shardNum}.json`;
    
    try {
      if (existsSync(resultFile)) {
        const data = readFileSync(resultFile, 'utf8');
        const results = JSON.parse(data);
        
        return {
          totalTests: results.numTotalTests || results.testResults?.length || 0,
          passed: results.numPassedTests || 0,
          failed: results.numFailedTests || 0,
          skipped: results.numPendingTests || 0,
          coverage: results.coverageMap || null
        };
      }
    } catch (error) {
      console.warn(`Could not parse test results for ${testType} shard ${shardNum}:`, error.message);
    }

    return {
      totalTests: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    };
  }

  generateReport(results) {
    const report = {
      sessionId: results.sessionId,
      timestamp: Date.now(),
      summary: results.summary,
      performance: this.analyzePerformance(results),
      recommendations: this.generateRecommendations(results),
      testTypes: Object.keys(results.testTypes).map(type => ({
        type,
        duration: results.testTypes[type].duration,
        success: results.testTypes[type].success,
        testCount: results.testTypes[type].summary?.totalTests || 0,
        passRate: this.calculatePassRate(results.testTypes[type])
      }))
    };

    const reportPath = join(process.cwd(), 'logs', `test-report-${results.sessionId}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));

    return report;
  }

  analyzePerformance(results) {
    const performance = {
      totalDuration: results.summary.totalDuration,
      averageTestDuration: results.summary.totalTests > 0 
        ? results.summary.totalDuration / results.summary.totalTests 
        : 0,
      shardVariance: this.calculateShardVariance(results),
      resourceUtilization: this.calculateResourceUtilization(results)
    };

    return performance;
  }

  calculateShardVariance(results) {
    const shardDurations = [];
    
    Object.values(results.testTypes).forEach(testType => {
      Object.values(testType.shards).forEach(shard => {
        if (shard.duration) {
          shardDurations.push(shard.duration);
        }
      });
    });

    if (shardDurations.length === 0) return 0;

    const mean = shardDurations.reduce((sum, duration) => sum + duration, 0) / shardDurations.length;
    const variance = shardDurations.reduce((sum, duration) => sum + Math.pow(duration - mean, 2), 0) / shardDurations.length;
    
    return Math.sqrt(variance);
  }

  calculateResourceUtilization(results) {
    // Placeholder for resource utilization calculation
    // In a real implementation, this would analyze CPU/memory usage patterns
    return {
      cpu: 75, // percentage
      memory: 60, // percentage
      diskIO: 45 // percentage
    };
  }

  generateRecommendations(results) {
    const recommendations = [];
    const variance = this.calculateShardVariance(results);
    
    if (variance > 30000) { // 30 seconds variance
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'High variance detected between shards. Consider rebalancing test distribution.',
        action: 'Run timing optimization to improve shard balance'
      });
    }

    if (results.summary.totalFailed > 0) {
      recommendations.push({
        type: 'quality',
        priority: 'medium',
        message: `${results.summary.totalFailed} tests failed. Review failing tests for stability issues.`,
        action: 'Investigate failing tests and fix underlying issues'
      });
    }

    const avgDuration = results.summary.totalDuration / Object.keys(results.testTypes).length;
    Object.entries(results.testTypes).forEach(([type, data]) => {
      if (data.duration > avgDuration * 1.5) {
        recommendations.push({
          type: 'optimization',
          priority: 'medium',
          message: `${type} tests are taking significantly longer than average.`,
          action: `Consider optimizing ${type} test suite or increasing resource allocation`
        });
      }
    });

    return recommendations;
  }

  calculatePassRate(testTypeData) {
    const summary = testTypeData.summary;
    if (!summary || summary.totalTests === 0) return 0;
    
    return (summary.passed / summary.totalTests) * 100;
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const orchestrator = new TestOrchestrator();
  
  switch (command) {
    case 'run':
      const configPath = args.find(arg => arg.startsWith('--config='))?.split('=')[1];
      
      if (!configPath) {
        console.error('Error: --config is required for run command');
        process.exit(1);
      }
      
      try {
        const config = JSON.parse(readFileSync(configPath, 'utf8'));
        const results = await orchestrator.executeTestSuite(config);
        const report = orchestrator.generateReport(results);
        
        console.log('\n=== Test Execution Complete ===');
        console.log(`Session: ${results.sessionId}`);
        console.log(`Duration: ${results.summary.totalDuration}ms`);
        console.log(`Tests: ${results.summary.totalPassed}/${results.summary.totalTests} passed`);
        console.log(`Report saved to: logs/test-report-${results.sessionId}.json`);
        
      } catch (error) {
        console.error('Test execution failed:', error.message);
        process.exit(1);
      }
      break;
      
    case 'report':
      const sessionId = args.find(arg => arg.startsWith('--session='))?.split('=')[1];
      
      if (!sessionId) {
        console.error('Error: --session is required for report command');
        process.exit(1);
      }
      
      const reportPath = join(process.cwd(), 'logs', `test-report-${sessionId}.json`);
      
      if (existsSync(reportPath)) {
        const report = JSON.parse(readFileSync(reportPath, 'utf8'));
        console.log('Test Execution Report:');
        console.log(JSON.stringify(report, null, 2));
      } else {
        console.error(`No report found for session: ${sessionId}`);
        process.exit(1);
      }
      break;
      
    case 'status':
      const logs = orchestrator.loadLogs();
      const recentLogs = logs.filter(log => Date.now() - log.timestamp < 3600000); // Last hour
      
      console.log('Recent Orchestration Activity:');
      recentLogs.forEach(log => {
        console.log(`${new Date(log.timestamp).toISOString()} - ${log.event}: ${JSON.stringify(log.data)}`);
      });
      break;
      
    default:
      console.log('Usage:');
      console.log('  node test-orchestrator.mjs run --config=<config-file>');
      console.log('  node test-orchestrator.mjs report --session=<session-id>');
      console.log('  node test-orchestrator.mjs status');
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default TestOrchestrator;
