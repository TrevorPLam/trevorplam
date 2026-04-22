#!/bin/bash
echo "## 🤖 AI Task Briefing"
echo "Branch: $(git branch --show-current)"
git diff main --stat | head -10
npm run test:unit 2>&1 | grep "FAIL" | head -5
gh issue list --state open --limit 5 --json number,title --jq '.[] | "  #\(.number): \(.title)"'
