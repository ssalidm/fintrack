#!/usr/bin/env bash

set -euo pipefail

CONTAINER=${DB_CONTAINER}
DEFAULT_USER=${POSTGRES_USER}
DEFAULT_DATABASE=${POSTGRES_DB}

usage() {
  echo "Usage: $0 [-u user] [-d database]"
  echo "  -u   Database user (default: ${DEFAULT_USER})"
  echo "  -d   Database name (default: ${DEFAULT_DATABASE})"
  exit 1
}

DATABASE_USER="${DEFAULT_USER}"
DATABASE="${DEFAULT_DATABASE}"

while getopts "u:d:h" opt; do
  case "${opt}" in
    u) DATABASE_USER="${OPTARG}" ;;
    d) DATABASE="${OPTARG}" ;;
    h) usage ;;
    *) usage ;;
  esac
done

echo "Connecting to database '${DATABASE}' as user '${DATABASE_USER}'..."

docker exec -it "${CONTAINER}" \
  psql -U "${DATABASE_USER}" -d "${DATABASE}"
