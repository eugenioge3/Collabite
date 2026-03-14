#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
VENV_PYTHON="$BACKEND_DIR/.venv/bin/python"
VENV_ALEMBIC="$BACKEND_DIR/.venv/bin/alembic"
VENV_UVICORN="$BACKEND_DIR/.venv/bin/uvicorn"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"

if [[ ! -x "$VENV_PYTHON" || ! -x "$VENV_ALEMBIC" || ! -x "$VENV_UVICORN" ]]; then
  echo "ERROR: backend virtualenv not ready." >&2
  echo "Run these commands first:" >&2
  echo "  cd backend" >&2
  echo "  python3 -m venv .venv" >&2
  echo "  .venv/bin/python -m pip install -r requirements.txt" >&2
  exit 1
fi

if [[ ! -f "$BACKEND_DIR/.env" && -f "$BACKEND_DIR/.env.example" ]]; then
  cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  echo "Created backend/.env from backend/.env.example"
fi

cd "$BACKEND_DIR"

if [[ "${SKIP_MIGRATIONS:-0}" != "1" ]]; then
  "$VENV_ALEMBIC" upgrade head
fi

ENVIRONMENT=local "$VENV_UVICORN" api.handler:app --app-dir "$BACKEND_DIR" --host "$HOST" --port "$PORT"