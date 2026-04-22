#!/usr/bin/env node
const fs = require('fs');
const turboJson = { pipeline: { build: { dependsOn: ['^build'], outputs: ['dist/**'] }, test: { cache: true } } };
fs.writeFileSync('turbo.json', JSON.stringify(turboJson, null, 2));
console.log('🚀 Turbo pipeline ready. Set TURBO_TEAM and TURBO_TOKEN for remote cache.');
