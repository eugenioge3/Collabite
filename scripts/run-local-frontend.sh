#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-5173}"

if ! command -v npm >/dev/null 2>&1; then
  echo "ERROR: npm is required." >&2
  exit 1
fi

cd "$FRONTEND_DIR"

if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
  npm ci
fi

npm run dev -- --host "$HOST" --port "$PORT"