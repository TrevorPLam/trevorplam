#!/bin/bash
COMMIT=${1:-HEAD~1}; CMD=${2:-npm run test}
git worktree add ../timewarp $COMMIT
(cd ../timewarp && eval $CMD)
git worktree remove ../timewarp
