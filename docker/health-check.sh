#!/bin/sh

# Health check script for distributed test containers

# Check if the main process is running
if ! pgrep -f "node.*distributed-runner.mjs" > /dev/null; then
    echo "Main process not running"
    exit 1
fi

# Check API endpoint based on role
if [ "$ROLE" = "master" ]; then
    # Check master API port
    if ! curl -f -s http://localhost:3001/health > /dev/null; then
        echo "Master API health check failed"
        exit 1
    fi
else
    # Check worker API port
    if ! curl -f -s http://localhost:3002/health > /dev/null; then
        echo "Worker API health check failed"
        exit 1
    fi
fi

# Check Redis connection
if ! redis-cli -u "$REDIS_URL" ping > /dev/null 2>&1; then
    echo "Redis connection failed"
    exit 1
fi

# Check PostgreSQL connection (master only)
if [ "$ROLE" = "master" ]; then
    if ! pg_isready -U test_user -h postgres -p 5432 > /dev/null 2>&1; then
        echo "PostgreSQL connection failed"
        exit 1
    fi
fi

echo "Health check passed"
exit 0
