#!/bin/bash
BASE=${1:-main}
echo "## What changed"
git log $BASE..HEAD --oneline --no-merges
echo "## Files modified"
git diff $BASE..HEAD --name-only | head -20
