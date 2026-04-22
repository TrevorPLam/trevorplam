#!/bin/bash
COMMIT=${1:-HEAD}
git checkout $COMMIT -- .
docker-compose -f docker-compose.prod.yml up -d
curl -f http://localhost:3000/health || echo "🚨 Deploy would fail"
