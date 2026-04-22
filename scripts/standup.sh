#!/bin/bash
echo "📋 YESTERDAY'S WORK"
git log --since="24 hours ago" --pretty="  - [%an] %s" --no-merges
git diff --stat HEAD~$(git log --since="24 hours ago" --oneline | wc -l) HEAD | tail -1
gh pr list --state open --json number,title,author --jq '.[] | "  #\(.number) \(.title) (@\(.author.login))"'
