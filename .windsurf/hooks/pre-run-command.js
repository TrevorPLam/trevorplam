#!/usr/bin/env node

/**
 * pre_run_command hook
 * Validates Node version >=22.12.0 before running commands
 * Blocks commands if Node version is invalid (exit code 2)
 */

import { execSync } from 'child_process';
import fs from 'fs';

const REQUIRED_NODE_VERSION = '22.12.0';

function main() {
  try {
    // Read JSON input from stdin
    const input = fs.readFileSync(0, 'utf-8');
    const data = JSON.parse(input);

    const agentActionName = data.agent_action_name;
    const toolInfo = data.tool_info || {};
    const commandLine = toolInfo.command_line;
    const cwd = toolInfo.cwd;

    console.error(`[pre_run_command] Validating Node version for: ${commandLine}`);

    // Get current Node version
    let nodeVersion;
    try {
      nodeVersion = execSync('node --version', { 
        encoding: 'utf-8',
        cwd: cwd || process.cwd()
      }).trim();
    } catch (error) {
      console.error('[pre_run_command] Failed to get Node version');
      process.exit(2); // Block if we can't determine version
    }

    // Remove 'v' prefix and compare
    const versionNumber = nodeVersion.replace('v', '');
    
    console.error(`[pre_run_command] Current Node version: ${nodeVersion}`);
    console.error(`[pre_run_command] Required Node version: >=${REQUIRED_NODE_VERSION}`);

    // Compare versions (simple string comparison for major.minor.patch)
    if (versionNumber < REQUIRED_NODE_VERSION) {
      console.error(`[pre_run_command] Node version ${nodeVersion} is below required ${REQUIRED_NODE_VERSION}`);
      console.error('[pre_run_command] Command blocked - please upgrade Node.js');
      process.exit(2); // Exit code 2 blocks the action
    }

    console.error('[pre_run_command] Node version validated');
    process.exit(0);
  } catch (error) {
    console.error('[pre_run_command] Error processing input:', error.message);
    process.exit(2); // Block on input errors for safety
  }
}

main();
