#!/usr/bin/env bash
set -euo pipefail

MODE="${1:-once}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:8000/api/health}"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-60}"
MAX_FAILURES="${MAX_FAILURES:-1}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"
ALERT_COMMAND="${ALERT_COMMAND:-}"

usage() {
  cat <<'EOF'
Usage:
  ./scripts/health-alert.sh [once|watch]

Environment variables:
  HEALTH_URL        URL to check (default: http://127.0.0.1:8000/api/health)
  INTERVAL_SECONDS  Interval for watch mode (default: 60)
  MAX_FAILURES      Consecutive failures before alerting (default: 1)
  ALERT_WEBHOOK     Optional webhook URL for alert notifications
  ALERT_COMMAND     Optional shell command executed on alert
EOF
}

send_alert() {
  local message="$1"
  local now
  now="$(date +"%Y-%m-%d %H:%M:%S")"

  echo "[$now] ALERT: $message" >&2

  if [[ -n "$ALERT_WEBHOOK" ]]; then
    curl -sS -X POST "$ALERT_WEBHOOK" \
      -H 'content-type: application/json' \
      -d "{\"text\":\"$message\"}" >/dev/null || true
  fi

  if [[ -n "$ALERT_COMMAND" ]]; then
    bash -lc "$ALERT_COMMAND" || true
  fi
}

check_health() {
  local code
  code=$(curl -sS -o /tmp/collabite-health-body.$$ -w "%{http_code}" "$HEALTH_URL" || echo "000")

  if [[ "$code" == "200" ]]; then
    echo "health_ok"
    rm -f /tmp/collabite-health-body.$$
    return 0
  fi

  echo "health_fail code=$code"
  rm -f /tmp/collabite-health-body.$$
  return 1
}

case "$MODE" in
  once)
    if check_health; then
      exit 0
    fi
    send_alert "Health check failed for $HEALTH_URL"
    exit 1
    ;;

  watch)
    failures=0
    while true; do
      if check_health; then
        failures=0
      else
        failures=$((failures + 1))
        if (( failures >= MAX_FAILURES )); then
          send_alert "Health check failed $failures times for $HEALTH_URL"
        fi
      fi

      sleep "$INTERVAL_SECONDS"
    done
    ;;

  -h|--help)
    usage
    exit 0
    ;;

  *)
    echo "ERROR: unknown mode: $MODE" >&2
    usage
    exit 1
    ;;
esac
