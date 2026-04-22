#!/bin/bash
while IFS= read -r line; do
  [[ "$line" =~ ^# || -z "$line" ]] && continue
  VAR=$(echo "$line" | cut -d'=' -f1)
  grep -q "^$VAR=" .env 2>/dev/null || echo "❌ Missing: $VAR"
  grep -q "^$VAR=$" .env && echo "⚠️ Empty: $VAR"
done < .env.example
