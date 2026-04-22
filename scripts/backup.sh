#!/bin/bash
mkdir -p backups
pg_dump $DATABASE_URL > "backups/db_backup_$(date +%Y%m%d_%H%M%S).sql"
