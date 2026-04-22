#!/bin/bash
check(){ command -v $1 &>/dev/null && echo "✅ $1 $(eval $2 | head -1 | grep -oE '[0-9]+\.[0-9]+')" || { echo "❌ $1 missing"; exit 1; }; }
check node "node --version"
check git "git --version"
check docker "docker --version"
echo "✅ All prerequisites met."
