#!/bin/bash
set -e
echo "🚀 Bootstrapping repository..."
npm ci
npx husky install
npm run lint:fix
npm run test:setup
[ ! -f "ai-control/context-map.json" ] && npm run ai:context -- --init
echo "✅ Ready. Run 'npm run quality-gate' to verify."
