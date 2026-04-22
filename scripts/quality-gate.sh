#!/bin/bash
set -e
npm run format:check || exit 1
npm run lint:strict || exit 1
npm run typecheck || exit 1
[ -f "ai-output.json" ] && node scripts/ai/validate.js || exit 1
npx gitleaks detect --source . --no-git || exit 1
npm run test:critical || exit 1
echo "✅ Quality gate passed!"
