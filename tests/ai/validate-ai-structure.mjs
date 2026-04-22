#!/usr/bin/env node

/**
 * AI Structure Validation
 * Validates the AI implementation by checking file structure and basic functionality
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function validateAIStructure() {
  console.log('=== Validating AI Implementation Structure ===');
  
  const validationResults = {
    fileStructure: { status: 'pending', checks: [], errors: [] },
    packageJson: { status: 'pending', checks: [], errors: [] },
    playwrightConfig: { status: 'pending', checks: [], errors: [] },
    ciWorkflow: { status: 'pending', checks: [], errors: [] },
    overall: { status: 'pending', score: 0 }
  };
  
  try {
    // Validate file structure
    console.log('\n--- Validating File Structure ---');
    
    const requiredFiles = [
      'tests/ai/AITestEnhancer.ts',
      'tests/ai/MCPIntegration.ts',
      'tests/ai/MLTestPrioritizer.ts',
      'tests/ai/SelfHealingEngine.ts',
      'tests/ai/mcp-global-setup.ts',
      'tests/ai/mcp-global-teardown.ts',
      'tests/ai/run-ai-generated-tests.mjs',
      'tests/ai/run-self-healing-tests.mjs',
      'tests/ai/run-mcp-tests.mjs',
      'tests/ai/run-ml-prioritized-tests.mjs',
      'tests/ai/run-full-ai-suite.mjs',
      'tests/ai/validate-ai-components.mjs',
      'tests/ai/collect-ai-metrics.mjs'
    ];
    
    let filesFound = 0;
    for (const file of requiredFiles) {
      if (existsSync(join(__dirname, '..', '..', file))) {
        validationResults.fileStructure.checks.push(`Found: ${file}`);
        filesFound++;
      } else {
        validationResults.fileStructure.errors.push(`Missing: ${file}`);
      }
    }
    
    validationResults.fileStructure.status = filesFound === requiredFiles.length ? 'PASSED' : 'FAILED';
    console.log(`File Structure: ${filesFound}/${requiredFiles.length} files found`);
    
    // Validate package.json
    console.log('\n--- Validating package.json ---');
    
    try {
      const packageJsonPath = join(__dirname, '..', '..', 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      
      // Check AI test scripts
      const aiScripts = [
        'test:ai',
        'test:ai:generated',
        'test:ai:self-healing',
        'test:ai:mcp',
        'test:ai:ml',
        'test:ai:full',
        'test:ai:validate',
        'test:ai:metrics',
        'test:ai:cleanup'
      ];
      
      let scriptsFound = 0;
      for (const script of aiScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          validationResults.packageJson.checks.push(`Found script: ${script}`);
          scriptsFound++;
        } else {
          validationResults.packageJson.errors.push(`Missing script: ${script}`);
        }
      }
      
      // Check AI dependencies
      const aiDependencies = [
        '@modelcontextprotocol/sdk',
        'ws',
        'ml-matrix',
        'simple-statistics',
        'ml-regression'
      ];
      
      let depsFound = 0;
      for (const dep of aiDependencies) {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          validationResults.packageJson.checks.push(`Found dependency: ${dep}`);
          depsFound++;
        } else {
          validationResults.packageJson.errors.push(`Missing dependency: ${dep}`);
        }
      }
      
      validationResults.packageJson.status = (scriptsFound >= 7 && depsFound >= 4) ? 'PASSED' : 'FAILED';
      console.log(`Package.json: ${scriptsFound}/${aiScripts.length} scripts, ${depsFound}/${aiDependencies.length} dependencies`);
      
    } catch (error) {
      validationResults.packageJson.errors.push(`Failed to read package.json: ${error.message}`);
      validationResults.packageJson.status = 'FAILED';
    }
    
    // Validate playwright.config.ts
    console.log('\n--- Validating Playwright Configuration ---');
    
    try {
      const playwrightConfigPath = join(__dirname, '..', '..', 'playwright.config.ts');
      const playwrightConfig = readFileSync(playwrightConfigPath, 'utf8');
      
      // Check MCP configuration
      if (playwrightConfig.includes('globalSetup') && playwrightConfig.includes('globalTeardown')) {
        validationResults.playwrightConfig.checks.push('Found MCP global setup/teardown');
      } else {
        validationResults.playwrightConfig.errors.push('Missing MCP global setup/teardown');
      }
      
      if (playwrightConfig.includes('mcp-global-setup.ts') && playwrightConfig.includes('mcp-global-teardown.ts')) {
        validationResults.playwrightConfig.checks.push('Found MCP setup file references');
      } else {
        validationResults.playwrightConfig.errors.push('Missing MCP setup file references');
      }
      
      validationResults.playwrightConfig.status = validationResults.playwrightConfig.errors.length === 0 ? 'PASSED' : 'FAILED';
      console.log(`Playwright Config: ${validationResults.playwrightConfig.status}`);
      
    } catch (error) {
      validationResults.playwrightConfig.errors.push(`Failed to read playwright.config.ts: ${error.message}`);
      validationResults.playwrightConfig.status = 'FAILED';
    }
    
    // Validate CI workflow
    console.log('\n--- Validating CI Workflow ---');
    
    try {
      const ciWorkflowPath = join(__dirname, '..', '..', '.github', 'workflows', 'ai-tests.yml');
      const ciWorkflow = readFileSync(ciWorkflowPath, 'utf8');
      
      // Check workflow structure
      const requiredJobs = ['ai-test-generation', 'ai-test-execution', 'ai-test-analysis'];
      let jobsFound = 0;
      
      for (const job of requiredJobs) {
        if (ciWorkflow.includes(job)) {
          validationResults.ciWorkflow.checks.push(`Found job: ${job}`);
          jobsFound++;
        } else {
          validationResults.ciWorkflow.errors.push(`Missing job: ${job}`);
        }
      }
      
      // Check AI-specific features
      const aiFeatures = ['MCP_ENABLED', 'SELF_HEALING_ENABLED', 'TEST_STRATEGY'];
      let featuresFound = 0;
      
      for (const feature of aiFeatures) {
        if (ciWorkflow.includes(feature)) {
          validationResults.ciWorkflow.checks.push(`Found feature: ${feature}`);
          featuresFound++;
        }
      }
      
      validationResults.ciWorkflow.status = (jobsFound >= 2 && featuresFound >= 2) ? 'PASSED' : 'FAILED';
      console.log(`CI Workflow: ${jobsFound}/${requiredJobs.length} jobs, ${featuresFound}/${aiFeatures.length} features`);
      
    } catch (error) {
      validationResults.ciWorkflow.errors.push(`Failed to read AI workflow: ${error.message}`);
      validationResults.ciWorkflow.status = 'FAILED';
    }
    
    // Calculate overall score
    const categories = ['fileStructure', 'packageJson', 'playwrightConfig', 'ciWorkflow'];
    let passedCategories = 0;
    
    for (const category of categories) {
      if (validationResults[category].status === 'PASSED') {
        passedCategories++;
      }
    }
    
    validationResults.overall.score = Math.round((passedCategories / categories.length) * 100);
    validationResults.overall.status = passedCategories === categories.length ? 'PASSED' : 'FAILED';
    
    // Display results
    console.log('\n=== Validation Results ===');
    
    categories.forEach(category => {
      const result = validationResults[category];
      console.log(`\n${category.toUpperCase()}: ${result.status}`);
      
      if (result.checks.length > 0) {
        console.log('  Checks Passed:');
        result.checks.forEach(check => console.log(`    ${check}`));
      }
      
      if (result.errors.length > 0) {
        console.log('  Errors:');
        result.errors.forEach(error => console.log(`    ${error}`));
      }
    });
    
    console.log(`\n--- Overall Assessment ---`);
    console.log(`Categories Passed: ${passedCategories}/${categories.length}`);
    console.log(`Overall Score: ${validationResults.overall.score}/100`);
    console.log(`Overall Status: ${validationResults.overall.status}`);
    
    if (validationResults.overall.status === 'PASSED') {
      console.log('\n AI implementation structure validation PASSED!');
      console.log('All required files, configurations, and dependencies are in place.');
    } else {
      console.log('\n AI implementation structure validation FAILED!');
      console.log('Some components are missing or misconfigured. Please review the errors above.');
    }
    
    // Generate recommendations
    const recommendations = [];
    
    if (validationResults.fileStructure.status === 'FAILED') {
      recommendations.push('Ensure all AI component files are present in tests/ai/ directory');
    }
    
    if (validationResults.packageJson.status === 'FAILED') {
      recommendations.push('Add missing AI test scripts and dependencies to package.json');
    }
    
    if (validationResults.playwrightConfig.status === 'FAILED') {
      recommendations.push('Configure MCP global setup and teardown in playwright.config.ts');
    }
    
    if (validationResults.ciWorkflow.status === 'FAILED') {
      recommendations.push('Complete AI-specific CI workflow configuration');
    }
    
    if (recommendations.length > 0) {
      console.log('\n--- Recommendations ---');
      recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    return validationResults.overall.status === 'PASSED';
    
  } catch (error) {
    console.error('AI structure validation failed:', error);
    return false;
  }
}

// Run validation
validateAIStructure().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Validation script failed:', error);
  process.exit(1);
});
