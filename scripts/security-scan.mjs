#!/usr/bin/env node

/**
 * Security Scanning Script
 * Performs comprehensive security analysis using multiple tools and patterns
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Security patterns to check for
const SECURITY_PATTERNS = {
  // Dangerous functions
  dangerousFunctions: [
    /eval\s*\(/,
    /Function\s*\(/,
    /setTimeout\s*\(\s*["']/,
    /setInterval\s*\(\s*["']/,
    /document\.write\s*\(/,
    /innerHTML\s*=/,
    /outerHTML\s*=/,
    /insertAdjacentHTML\s*=/,
  ],
  
  // XSS vulnerabilities
  xssPatterns: [
    /location\.href\s*=/,
    /location\.assign\s*\(/,
    /location\.replace\s*\(/,
    /open\s*\(/,
    /postMessage\s*\(/,
  ],
  
  // Hardcoded secrets
  secretsPatterns: [
    /password\s*=\s*["'][^"']+["']/,
    /secret\s*=\s*["'][^"']+["']/,
    /token\s*=\s*["'][^"']+["']/,
    /api[_-]?key\s*=\s*["'][^"']+["']/,
    /private[_-]?key\s*=\s*["'][^"']+["']/,
  ],
  
  // Insecure HTTP usage
  insecureHttp: [
    /http:\/\//,
  ],
  
  // Debug code
  debugCode: [
    /console\.log/,
    /console\.debug/,
    /console\.warn/,
    /console\.error/,
  ],
};

// File extensions to scan
const SCAN_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.astro', '.mdx'];

/**
 * Recursively get all files to scan
 */
function getFilesToScan(dir, extensions = SCAN_EXTENSIONS) {
  const files = [];
  
  if (!existsSync(dir)) return files;
  
  const items = readdirSync(dir);
  
  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other common exclusions
      if (!['node_modules', '.git', 'dist', '.astro', '.next'].includes(item)) {
        files.push(...getFilesToScan(fullPath, extensions));
      }
    } else if (extensions.includes(extname(item))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

/**
 * Scan a single file for security patterns
 */
function scanFile(filePath) {
  const issues = [];
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
      // Check each security pattern
      for (const [category, patterns] of Object.entries(SECURITY_PATTERNS)) {
        for (const pattern of patterns) {
          const matches = line.match(pattern);
          if (matches) {
            issues.push({
              type: category,
              line: index + 1,
              column: line.indexOf(matches[0]) + 1,
              match: matches[0],
              severity: getSeverity(category),
            });
          }
        }
      }
    });
  } catch (error) {
    console.warn(`Warning: Could not read file ${filePath}: ${error.message}`);
  }
  
  return issues;
}

/**
 * Get severity level for issue type
 */
function getSeverity(category) {
  const severityMap = {
    dangerousFunctions: 'HIGH',
    xssPatterns: 'HIGH',
    secretsPatterns: 'CRITICAL',
    insecureHttp: 'MEDIUM',
    debugCode: 'LOW',
  };
  
  return severityMap[category] || 'MEDIUM';
}

/**
 * Main security scan function
 */
function runSecurityScan() {
  console.log('Starting security scan...\n');
  
  const filesToScan = getFilesToScan(projectRoot);
  console.log(`Scanning ${filesToScan.length} files...\n`);
  
  const allIssues = [];
  const issueCounts = {};
  
  filesToScan.forEach(filePath => {
    const issues = scanFile(filePath);
    
    if (issues.length > 0) {
      console.log(`\n${filePath}:`);
      issues.forEach(issue => {
        console.log(`  [${issue.severity}] Line ${issue.line}: ${issue.type} - ${issue.match}`);
        
        // Count issues by type
        issueCounts[issue.type] = (issueCounts[issue.type] || 0) + 1;
      });
      
      allIssues.push(...issues);
    }
  });
  
  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('SECURITY SCAN SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total files scanned: ${filesToScan.length}`);
  console.log(`Total issues found: ${allIssues.length}`);
  
  // Count by severity
  const severityCounts = {};
  allIssues.forEach(issue => {
    severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
  });
  
  console.log('\nIssues by severity:');
  Object.entries(severityCounts).forEach(([severity, count]) => {
    console.log(`  ${severity}: ${count}`);
  });
  
  console.log('\nIssues by type:');
  Object.entries(issueCounts).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Recommendations
  console.log('\nRECOMMENDATIONS:');
  if (severityCounts.CRITICAL > 0) {
    console.log('  - CRITICAL: Remove hardcoded secrets immediately');
  }
  if (severityCounts.HIGH > 0) {
    console.log('  - HIGH: Review dangerous functions and XSS patterns');
  }
  if (severityCounts.MEDIUM > 0) {
    console.log('  - MEDIUM: Use HTTPS instead of HTTP');
  }
  if (severityCounts.LOW > 0) {
    console.log('  - LOW: Remove debug console statements before production');
  }
  
  // Exit with appropriate code
  const exitCode = severityCounts.CRITICAL > 0 ? 1 : 0;
  process.exit(exitCode);
}

// Run the scan
runSecurityScan();
