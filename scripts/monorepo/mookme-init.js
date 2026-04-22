#!/usr/bin/env node
const fs = require('fs');
const workspaces = fs.readdirSync('.').filter(d => fs.existsSync(`${d}/package.json`) && d !== 'node_modules');
workspaces.forEach(ws => {
  const hooks = { projects: [{ name: ws, path: ws, hooks: { preCommit: [`${ws}/node_modules/.bin/biome check .`, 'npm run test -- --changedSince=origin/main'] } }] };
  fs.writeFileSync(`mookme-${ws}.json`, JSON.stringify(hooks, null, 2));
});
console.log('✅ Mookme configured. Run: npx mookme pre-commit');
