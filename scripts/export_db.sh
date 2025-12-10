#!/bin/bash

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="casevault_db_backup_${TIMESTAMP}.sql"

echo "Exporting database..."
pg_dump -U casevault_user -h localhost casevault_db > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "Database exported successfully to: $BACKUP_FILE"
    echo ""
    echo "To import on another machine:"
    echo "1. Setup PostgreSQL and create database/user (run setup_postgres.sh)"
    echo "2. Run: psql -U casevault_user -h localhost casevault_db < $BACKUP_FILE"
else
    echo "Export failed!"
fi
