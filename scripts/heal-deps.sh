#!/bin/bash
VULNS=$(npm audit --json | jq -r '.vulnerabilities.high[] | "\(.name):\(.version)"')
[ -n "$VULNS" ] && gh pr create --title "Heal deps: $VULNS" --body "Auto-detected vulnerabilities"
