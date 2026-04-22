#!/bin/bash
set -e
git pull --rebase
git diff HEAD@{1} --name-only | grep -q "package-lock.json\|package.json" && npm ci
git diff HEAD@{1} --name-only | grep -q "migrations/" && npm run db:migrate
git diff HEAD@{1} --name-only | grep -q ".env.example" && echo "⚠️ New env vars detected. Check .env.example"
echo "✅ Repo synced."
