#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:8000}"
FRONTEND_URL="${FRONTEND_URL:-http://127.0.0.1:5173}"
BACKEND_PID=""
FRONTEND_PID=""

wait_for_url() {
  local url="$1"
  local attempts="${2:-30}"
  local delay="${3:-1}"

  for ((i=1; i<=attempts; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done

  echo "ERROR: $url did not become ready in time" >&2
  return 1
}

cleanup() {
  if [[ -n "$BACKEND_PID" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID" 2>/dev/null || true
    wait "$BACKEND_PID" 2>/dev/null || true
  fi

  if [[ -n "$FRONTEND_PID" ]] && kill -0 "$FRONTEND_PID" 2>/dev/null; then
    kill "$FRONTEND_PID" 2>/dev/null || true
    wait "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

cd "$ROOT_DIR"

if ! lsof -ti tcp:8000 >/dev/null 2>&1; then
  ./scripts/run-local-backend.sh > /tmp/collabite-smoke-backend.log 2>&1 &
  BACKEND_PID=$!
fi

if ! lsof -ti tcp:5173 >/dev/null 2>&1; then
  ./scripts/run-local-frontend.sh > /tmp/collabite-smoke-frontend.log 2>&1 &
  FRONTEND_PID=$!
fi

wait_for_url "$BACKEND_URL/api/health"
wait_for_url "$FRONTEND_URL/api/health"
wait_for_url "$FRONTEND_URL/login"

TOKEN=$(curl -fsS -X POST "$BACKEND_URL/api/auth/dev-login" \
  -H 'content-type: application/json' \
  -d '{"email":"smoke.business@example.com","role":"business"}' | \
  /Users/eugenioge3/Projects/Collabite/backend/.venv/bin/python -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')

curl -fsS "$BACKEND_URL/api/auth/me" \
  -H "Authorization: Bearer ${TOKEN}" >/dev/null

echo "smoke_ok"