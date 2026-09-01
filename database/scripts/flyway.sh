#!/usr/bin/env bash

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

cd "${PROJECT_ROOT}"

command_name="${1:-info}"
shift || true

case "${command_name}" in
    info | migrate | validate)
        ;;
    clean)
        echo "Error: Flyway clean is disabled for this project."
        exit 1
        ;;
    *)
        echo "Unsupported command: ${command_name}"
        echo "Supported commands: info, migrate, validate"
        exit 1
        ;;
esac

docker compose \
    --profile tools \
    run \
    --rm \
    flyway \
    "${command_name}" \
    "$@"
