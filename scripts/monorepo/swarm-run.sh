#!/bin/bash
TASK=${1:-test}
npx turbo run $TASK --parallel &
gh codespace list --json url | jq -r '.[] | "curl -X POST \(.url)/turbo/\($TASK)"' | xargs -P 4 -I {} bash -c "{}"
wait && echo "✅ Swarm complete"
