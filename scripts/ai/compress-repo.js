#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
const summary = {
  structure: execSync('tree -L 2 -I node_modules').toString(),
  issues: execSync('gh issue list --limit 5 --json title').toString(),
  coverage: execSync('npm run test -- --coverage --silent | tail -1').toString(),
  commits: execSync('git log --oneline -10').toString()
};
fs.writeFileSync('ai/repo-brain.json', JSON.stringify(summary));
