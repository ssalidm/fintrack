#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${PROJECT_ROOT}/.env"

if [[ ! -f "${ENV_FILE}" ]]; then
    echo "Error: ${ENV_FILE} does not exist."
    echo "Create it by copying .env.example and adding local credentials."
    exit 1
fi

cd "${PROJECT_ROOT}"

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a

required_variables=(
    POSTGRES_DB
    POSTGRES_USER
    FINTRACK_MIGRATION_PASSWORD
    FINTRACK_APPLICATION_PASSWORD
)

for variable_name in "${required_variables[@]}"; do
    if [[ -z "${!variable_name:-}" ]]; then
        echo "Error: ${variable_name} is missing or empty in .env."
        exit 1
    fi
done

if ! docker compose ps --status running db | grep -q "db"; then
    echo "Error: the FinTrack PostgreSQL container is not running."
    echo "Start it with: docker compose up -d db"
    exit 1
fi

echo "Creating and configuring FinTrack database roles..."

docker compose exec -T db \
    psql \
    --username "${POSTGRES_USER}" \
    --dbname postgres \
    --set ON_ERROR_STOP=1 \
    --set "migration_password=${FINTRACK_MIGRATION_PASSWORD}" \
    --set "application_password=${FINTRACK_APPLICATION_PASSWORD}" \
    < database/scripts/bootstrap/01_create_roles.sql

echo "Configuring FinTrack database ownership, schemas, and privileges..."

docker compose exec -T db \
    psql \
    --username "${POSTGRES_USER}" \
    --dbname "${POSTGRES_DB}" \
    --set ON_ERROR_STOP=1 \
    < database/scripts/bootstrap/02_secure_database.sql

echo "FinTrack database security bootstrap completed successfully."
