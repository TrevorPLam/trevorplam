#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';

const METRICS_FILE = 'tests/metrics/test-timings.json';
const REPORTS_DIR = 'tests/metrics';

// Ensure metrics directory exists
if (!existsSync(dirname(METRICS_FILE))) {
  mkdirSync(dirname(METRICS_FILE), { recursive: true });
}

// Load existing timing data
let timingData = {};
if (existsSync(METRICS_FILE)) {
  try {
    timingData = JSON.parse(readFileSync(METRICS_FILE, 'utf8'));
  } catch (error) {
    console.warn('Warning: Could not parse existing timing data, starting fresh');
    timingData = {};
  }
}

// Test categories for intelligent distribution
const TEST_CATEGORIES = {
  unit: { weight: 1, timeout: 3000 },
  components: { weight: 2, timeout: 5000 },
  integration: { weight: 3, timeout: 10000 },
  property: { weight: 4, timeout: 15000 },
  contract: { weight: 3, timeout: 10000 },
  accessibility: { weight: 3, timeout: 8000 },
  e2e: { weight: 5, timeout: 20000 }
};

function collectTestMetrics() {
  console.log('Collecting test execution metrics...');
  
  try {
    // Run tests with timing output
    const output = execSync('npm test -- --reporter=json --reportFile=/tmp/test-results.json', { 
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Parse test results and extract timing data
    const testResults = JSON.parse(readFileSync('/tmp/test-results.json', 'utf8'));
    
    testResults.testFiles?.forEach(testFile => {
      const filePath = testFile.file;
      const duration = testFile.duration || 0;
      
      // Categorize test based on file path
      let category = 'unit';
      if (filePath.includes('components/')) category = 'components';
      else if (filePath.includes('integration/')) category = 'integration';
      else if (filePath.includes('property/')) category = 'property';
      else if (filePath.includes('contract/')) category = 'contract';
      else if (filePath.includes('a11y/')) category = 'accessibility';
      else if (filePath.includes('e2e/')) category = 'e2e';
      
      // Update timing data with exponential moving average
      const existingData = timingData[filePath] || { duration: 0, runs: 0, category };
      const alpha = 0.3; // Smoothing factor
      const newDuration = alpha * duration + (1 - alpha) * existingData.duration;
      
      timingData[filePath] = {
        duration: newDuration,
        runs: existingData.runs + 1,
        category,
        lastRun: new Date().toISOString(),
        weight: TEST_CATEGORIES[category]?.weight || 1
      };
    });
    
    // Save updated timing data
    writeFileSync(METRICS_FILE, JSON.stringify(timingData, null, 2));
    console.log(`Updated timing data for ${Object.keys(timingData).length} test files`);
    
  } catch (error) {
    console.error('Error collecting test metrics:', error.message);
    process.exit(1);
  }
}

function generateShardDistribution(totalShards = 4) {
  console.log('Generating intelligent shard distribution...');
  
  // Group tests by category
  const testsByCategory = {};
  Object.entries(timingData).forEach(([filePath, data]) => {
    const category = data.category;
    if (!testsByCategory[category]) {
      testsByCategory[category] = [];
    }
    testsByCategory[category].push({ filePath, ...data });
  });
  
  // Sort tests within each category by duration (descending)
  Object.values(testsByCategory).forEach(tests => {
    tests.sort((a, b) => b.duration - a.duration);
  });
  
  // Initialize shards
  const shards = Array.from({ length: totalShards }, () => ({
    tests: [],
    estimatedDuration: 0,
    categories: new Set()
  }));
  
  // Distribute tests using longest processing time (LPT) algorithm
  const allTests = Object.values(testsByCategory).flat();
  
  allTests.forEach(test => {
    // Find shard with minimum estimated duration
    let minShardIndex = 0;
    let minDuration = shards[0].estimatedDuration;
    
    for (let i = 1; i < shards.length; i++) {
      if (shards[i].estimatedDuration < minDuration) {
        minDuration = shards[i].estimatedDuration;
        minShardIndex = i;
      }
    }
    
    // Assign test to optimal shard
    shards[minShardIndex].tests.push(test.filePath);
    shards[minShardIndex].estimatedDuration += test.duration * test.weight;
    shards[minShardIndex].categories.add(test.category);
  });
  
  // Calculate variance and balance metrics
  const durations = shards.map(shard => shard.estimatedDuration);
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
  const variance = durations.reduce((sum, duration) => sum + Math.pow(duration - avgDuration, 2), 0) / durations.length;
  const stdDev = Math.sqrt(variance);
  const variancePercent = (stdDev / avgDuration) * 100;
  
  console.log(`Shard distribution variance: ${variancePercent.toFixed(2)}%`);
  
  if (variancePercent > 20) {
    console.warn('Warning: High shard variance detected. Consider adjusting test distribution.');
  }
  
  // Save shard distribution
  const distribution = {
    generated: new Date().toISOString(),
    totalShards,
    variancePercent,
    shards: shards.map((shard, index) => ({
      shard: index + 1,
      testCount: shard.tests.length,
      estimatedDuration: shard.estimatedDuration,
      categories: Array.from(shard.categories),
      tests: shard.tests
    }))
  };
  
  writeFileSync(join(REPORTS_DIR, 'shard-distribution.json'), JSON.stringify(distribution, null, 2));
  
  return distribution;
}

function generateTimingReport() {
  console.log('Generating timing report...');
  
  const report = {
    generated: new Date().toISOString(),
    totalTests: Object.keys(timingData).length,
    categories: {}
  };
  
  // Aggregate data by category
  Object.entries(TEST_CATEGORIES).forEach(([category, config]) => {
    const categoryTests = Object.entries(timingData).filter(([_, data]) => data.category === category);
    
    if (categoryTests.length > 0) {
      const durations = categoryTests.map(([_, data]) => data.duration);
      const totalDuration = durations.reduce((a, b) => a + b, 0);
      const avgDuration = totalDuration / durations.length;
      const maxDuration = Math.max(...durations);
      const minDuration = Math.min(...durations);
      
      report.categories[category] = {
        testCount: categoryTests.length,
        totalDuration,
        avgDuration,
        maxDuration,
        minDuration,
        timeout: config.timeout
      };
    }
  });
  
  writeFileSync(join(REPORTS_DIR, 'timing-report.json'), JSON.stringify(report, null, 2));
  
  return report;
}

// Main execution
const command = process.argv[2] || 'collect';

switch (command) {
  case 'collect':
    collectTestMetrics();
    break;
  case 'distribute':
    generateShardDistribution(parseInt(process.argv[3]) || 4);
    break;
  case 'report':
    generateTimingReport();
    break;
  case 'all':
    collectTestMetrics();
    generateShardDistribution(parseInt(process.argv[3]) || 4);
    generateTimingReport();
    break;
  default:
    console.log('Usage: node collect-test-metrics.mjs [collect|distribute|report|all] [shards]');
    process.exit(1);
}

console.log('Test metrics collection completed successfully!');
