#!/usr/bin/env bash

set -euo pipefail

CONTAINER=${DB_CONTAINER}
DATABASE=${POSTGRES_DB}
DATABASE_USER=${POSTGRES_USER}
BACKUP_ROOT="database/backups"
DAY_STAMP="$(date +%Y-%m-%d)"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

BACKUP_DIRECTORY="${BACKUP_ROOT}/${DAY_STAMP}-bak"

DATABASE_BACKUP="${BACKUP_DIRECTORY}/${DATABASE}_${TIMESTAMP}.dump"
GLOBALS_BACKUP="${BACKUP_DIRECTORY}/postgres_globals_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIRECTORY}"

echo "Creating database backup..."

docker exec "${DB_CONTAINER}" \
  pg_dump \
  -U "${POSTGRES_USER}" \
  -d "${DATABASE}" \
  --format=custom \
  --no-owner \
  > "${DATABASE_BACKUP}"

echo "Creating PostgreSQL globals backup..."

docker exec "${DB_CONTAINER}" \
  pg_dumpall \
  -U "${POSTGRES_USER}" \
  --globals-only \
  > "${GLOBALS_BACKUP}"

echo "Backup completed:"
echo "  Database: ${DATABASE_BACKUP}"
echo "  Globals: ${GLOBALS_BACKUP}"
