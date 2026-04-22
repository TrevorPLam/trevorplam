#!/bin/bash
set -e
npm run test:lint || exit 1
npm run test:unit || exit 1
npm run test:component || exit 1
npm run test:e2e || exit 1
[ "$1" = "--full" ] && npm run test:mutation
echo "✅ Pyramid passed"
