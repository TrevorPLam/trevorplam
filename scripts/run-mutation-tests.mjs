#!/usr/bin/env node

/**
 * Mutation Testing Script
 * 
 * Runs comprehensive mutation testing on critical business logic
 * with proper reporting and threshold validation.
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONFIG = {
  // Critical business logic files to test
  targetFiles: [
    'src/utils/formatters.ts',
    'src/utils/validators.ts', 
    'src/utils/date.ts'
  ],
  
  // Mutation thresholds
  thresholds: {
    high: 85,
    low: 70,
    break: 70
  },
  
  // Output directories
  reportsDir: 'reports/mutation',
  htmlReportDir: 'reports/mutation/html',
  jsonReportFile: 'reports/mutation/mutation-report.json'
};

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

/**
 * Log colored message
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Execute command with error handling
 */
function execCommand(command, description) {
  try {
    log(`\n${description}`, 'cyan');
    log(`Executing: ${command}`, 'blue');
    
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    return result;
  } catch (error) {
    log(`Error executing ${description}: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Check if required dependencies are available
 */
function checkDependencies() {
  log('Checking dependencies...', 'cyan');
  
  try {
    execCommand('npx stryker --version', 'Checking Stryker');
    log('Stryker is available', 'green');
  } catch (error) {
    log('Stryker not found. Installing...', 'yellow');
    execCommand('npm install --save-dev @stryker-mutator/core', 'Installing Stryker core');
  }
}

/**
 * Validate test coverage before mutation testing
 */
function validateTestCoverage() {
  log('Validating test coverage...', 'cyan');
  
  try {
    const result = execCommand('npm run test:coverage', 'Running coverage tests');
    log('Test coverage validation completed', 'green');
    return true;
  } catch (error) {
    log('Test coverage validation failed', 'red');
    log('Mutation testing requires passing tests', 'yellow');
    return false;
  }
}

/**
 * Run mutation tests with specific configuration
 */
function runMutationTests() {
  log('Starting mutation testing...', 'bright');
  log(`Target files: ${CONFIG.targetFiles.join(', ')}`, 'blue');
  
  // Create reports directory
  if (!existsSync(CONFIG.reportsDir)) {
    execCommand(`mkdir -p ${CONFIG.reportsDir}`, 'Creating reports directory');
  }
  
  // Run Stryker with timeout and specific configuration
  const strykerCommand = [
    'npx stryker run',
    '--timeoutFactor 1.5',
    '--maxTestTimeoutMs 30000',
    '--concurrency 3',
    `--threshold.high ${CONFIG.thresholds.high}`,
    `--threshold.low ${CONFIG.thresholds.low}`,
    `--threshold.break ${CONFIG.thresholds.break}`,
    '--reporters progress,clear-text,html,json',
    `--htmlReporter.baseDir ${CONFIG.htmlReportDir}`,
    `--jsonReporter.fileName ${CONFIG.jsonReportFile}`
  ].join(' ');
  
  try {
    execCommand(strykerCommand, 'Running mutation tests');
    log('Mutation testing completed successfully', 'green');
    return true;
  } catch (error) {
    log('Mutation testing failed or thresholds not met', 'red');
    return false;
  }
}

/**
 * Parse and analyze mutation report
 */
function analyzeMutationReport() {
  log('Analyzing mutation report...', 'cyan');
  
  try {
    if (!existsSync(CONFIG.jsonReportFile)) {
      log('Mutation report file not found', 'red');
      return null;
    }
    
    const report = JSON.parse(readFileSync(CONFIG.jsonReportFile, 'utf8'));
    const { mutationScore, totalMutants, killedMutants, survivedMutants, timedOutMutants } = report.schema;
    
    log('\n=== Mutation Testing Results ===', 'bright');
    log(`Mutation Score: ${mutationScore}%`, mutationScore >= CONFIG.thresholds.high ? 'green' : 
                                                  mutationScore >= CONFIG.thresholds.low ? 'yellow' : 'red');
    log(`Total Mutants: ${totalMutants}`, 'blue');
    log(`Killed Mutants: ${killedMutants}`, 'green');
    log(`Survived Mutants: ${survivedMutants}`, survivedMutants > 0 ? 'red' : 'green');
    log(`Timed Out Mutants: ${timedOutMutants}`, timedOutMutants > 0 ? 'yellow' : 'green');
    
    // Analyze by file
    if (report.schema.files) {
      log('\n=== Results by File ===', 'bright');
      for (const [filePath, fileResult] of Object.entries(report.schema.files)) {
        const fileName = filePath.split('/').pop();
        const score = fileResult.mutationScore;
        const color = score >= CONFIG.thresholds.high ? 'green' : 
                     score >= CONFIG.thresholds.low ? 'yellow' : 'red';
        log(`${fileName}: ${score}%`, color);
      }
    }
    
    return report.schema;
  } catch (error) {
    log(`Error analyzing mutation report: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Generate summary report
 */
function generateSummaryReport(results) {
  if (!results) return;
  
  const summary = {
    timestamp: new Date().toISOString(),
    thresholds: CONFIG.thresholds,
    results: {
      mutationScore: results.mutationScore,
      totalMutants: results.totalMutants,
      killedMutants: results.killedMutants,
      survivedMutants: results.survivedMutants,
      timedOutMutants: results.timedOutMutants
    },
    status: results.mutationScore >= CONFIG.thresholds.break ? 'PASSED' : 'FAILED',
    recommendations: generateRecommendations(results)
  };
  
  const summaryFile = join(CONFIG.reportsDir, 'mutation-summary.json');
  writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
  
  log(`\nSummary report saved to: ${summaryFile}`, 'cyan');
  
  return summary;
}

/**
 * Generate recommendations based on results
 */
function generateRecommendations(results) {
  const recommendations = [];
  
  if (results.mutationScore < CONFIG.thresholds.break) {
    recommendations.push({
      type: 'critical',
      message: 'Mutation score below threshold',
      action: 'Review and improve test coverage for survived mutants'
    });
  }
  
  if (results.survivedMutants > 0) {
    recommendations.push({
      type: 'warning',
      message: `${results.survivedMutants} mutants survived`,
      action: 'Add tests to kill surviving mutants'
    });
  }
  
  if (results.timedOutMutants > 0) {
    recommendations.push({
      type: 'info',
      message: `${results.timedOutMutants} mutants timed out`,
      action: 'Consider optimizing test performance or increasing timeouts'
    });
  }
  
  if (results.mutationScore >= CONFIG.thresholds.high) {
    recommendations.push({
      type: 'success',
      message: 'Excellent mutation score achieved',
      action: 'Maintain current test quality'
    });
  }
  
  return recommendations;
}

/**
 * Display recommendations
 */
function displayRecommendations(recommendations) {
  if (!recommendations || recommendations.length === 0) return;
  
  log('\n=== Recommendations ===', 'bright');
  
  for (const rec of recommendations) {
    const color = rec.type === 'critical' ? 'red' : 
                  rec.type === 'warning' ? 'yellow' : 
                  rec.type === 'success' ? 'green' : 'blue';
    
    log(`\u2022 ${rec.message}`, color);
    log(`  Action: ${rec.action}`, 'blue');
  }
}

/**
 * Main execution function
 */
function main() {
  log('=== Mutation Testing for Critical Business Logic ===', 'bright');
  log(`Started at: ${new Date().toISOString()}`, 'cyan');
  
  try {
    // Check dependencies
    checkDependencies();
    
    // Validate test coverage
    const coverageValid = validateTestCoverage();
    if (!coverageValid) {
      log('Skipping mutation testing due to coverage issues', 'yellow');
      process.exit(1);
    }
    
    // Run mutation tests
    const mutationSuccess = runMutationTests();
    
    // Analyze results
    const results = analyzeMutationReport();
    
    // Generate summary
    const summary = generateSummaryReport(results);
    
    // Display recommendations
    if (summary && summary.recommendations) {
      displayRecommendations(summary.recommendations);
    }
    
    // Final status
    log('\n=== Final Status ===', 'bright');
    if (summary && summary.status === 'PASSED') {
      log('\u2705 Mutation testing PASSED', 'green');
      log(`Mutation Score: ${results.mutationScore}%`, 'green');
      log(`HTML Report: ${CONFIG.htmlReportDir}/index.html`, 'cyan');
    } else {
      log('\u274c Mutation testing FAILED', 'red');
      log(`Mutation Score: ${results?.mutationScore || 'N/A'}%`, 'red');
      log('Check the HTML report for detailed results', 'yellow');
      process.exit(1);
    }
    
  } catch (error) {
    log(`\u274c Mutation testing failed with error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
