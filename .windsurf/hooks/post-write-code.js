#!/usr/bin/env node

/**
 * post_write_code hook
 * Runs ESLint after code writes
 * Logs linting results but does not block (post-hooks cannot block)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function main() {
  try {
    // Read JSON input from stdin
    const input = fs.readFileSync(0, 'utf-8');
    const data = JSON.parse(input);

    const agentActionName = data.agent_action_name;
    const toolInfo = data.tool_info || {};
    const filePath = toolInfo.file_path;

    console.error(`[post_write_code] Linting: ${filePath}`);

    // Run eslint on the specific file that was modified
    try {
      execSync(`npm run lint -- "${filePath}"`, { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.error('[post_write_code] Lint passed');
      process.exit(0);
    } catch (error) {
      console.error('[post_write_code] Lint found issues (non-blocking)');
      console.error('[post_write_code] Run "npm run lint" manually to see details');
      process.exit(0); // Post-hooks cannot block, so always exit 0
    }
  } catch (error) {
    console.error('[post_write_code] Error processing input:', error.message);
    process.exit(0); // Don't block on input errors
  }
}

main();
