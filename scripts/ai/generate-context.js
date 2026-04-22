#!/usr/bin/env node
import fs from 'fs/promises';
const map = JSON.parse(await fs.readFile('ai-control/context-map.json', 'utf8'));
console.log('## AI CONTEXT SUMMARY');
for (const [k, v] of Object.entries(map)) console.log(`**${k}**: ${v.summary}`);
