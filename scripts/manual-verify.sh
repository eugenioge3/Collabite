#!/usr/bin/env bash
set -euo pipefail

# Manual social verification helper for Collabite operators.
#
# Required env vars:
#   API_BASE_URL   Example: https://api.example.com/api
#   ADMIN_TOKEN    Value of MANUAL_VERIFICATION_ADMIN_TOKEN
#
# Optional env vars:
#   PLATFORM       instagram | tiktok
#   CODE           Filter pending list by exact code (e.g. CBT-ABC123)
#
# Usage:
#   ./scripts/manual-verify.sh pending
#   PLATFORM=instagram ./scripts/manual-verify.sh pending
#   ./scripts/manual-verify.sh approve <verification_id> "optional note"
#   ./scripts/manual-verify.sh approve-code <platform> <code> [account_handle] [review_note]
#   ./scripts/manual-verify.sh reject <verification_id> "optional note"

if [[ -z "${API_BASE_URL:-}" ]]; then
  echo "ERROR: API_BASE_URL is required" >&2
  exit 1
fi

if [[ -z "${ADMIN_TOKEN:-}" ]]; then
  echo "ERROR: ADMIN_TOKEN is required" >&2
  exit 1
fi

ACTION="${1:-}"
if [[ -z "$ACTION" ]]; then
  echo "Usage: $0 <pending|approve|approve-code|reject> [args...]" >&2
  exit 1
fi

api_get() {
  curl -sS -X GET "$1" \
    -H "x-admin-token: ${ADMIN_TOKEN}" \
    -H "accept: application/json"
}

api_post() {
  curl -sS -X POST "$1" \
    -H "x-admin-token: ${ADMIN_TOKEN}" \
    -H "content-type: application/json" \
    -H "accept: application/json" \
    -d "$2"
}

json_string() {
  python3 -c 'import json,sys; print(json.dumps(sys.argv[1]))' "$1"
}

case "$ACTION" in
  pending)
    URL="${API_BASE_URL}/verify/admin/pending"
    SEP="?"

    if [[ -n "${PLATFORM:-}" ]]; then
      URL="${URL}${SEP}platform=${PLATFORM}"
      SEP="&"
    fi

    if [[ -n "${CODE:-}" ]]; then
      URL="${URL}${SEP}code=${CODE}"
    fi

    api_get "$URL"
    ;;

  approve)
    VERIFICATION_ID="${2:-}"
    REVIEW_NOTE="${3:-}"

    if [[ -z "$VERIFICATION_ID" ]]; then
      echo "Usage: $0 approve <verification_id> [review_note]" >&2
      exit 1
    fi

    JSON_PAYLOAD=$(printf '{"verification_id":"%s","review_notes":%s}' \
      "$VERIFICATION_ID" \
      "$(json_string "$REVIEW_NOTE")")

    api_post "${API_BASE_URL}/verify/admin/approve" "$JSON_PAYLOAD"
    ;;

  reject)
    VERIFICATION_ID="${2:-}"
    REVIEW_NOTE="${3:-}"

    if [[ -z "$VERIFICATION_ID" ]]; then
      echo "Usage: $0 reject <verification_id> [review_note]" >&2
      exit 1
    fi

    JSON_PAYLOAD=$(printf '{"verification_id":"%s","review_notes":%s}' \
      "$VERIFICATION_ID" \
      "$(json_string "$REVIEW_NOTE")")

    api_post "${API_BASE_URL}/verify/admin/reject" "$JSON_PAYLOAD"
    ;;

  approve-code)
    PLATFORM_ARG="${2:-}"
    CODE_ARG="${3:-}"
    ACCOUNT_HANDLE="${4:-}"
    REVIEW_NOTE="${5:-}"

    if [[ -z "$PLATFORM_ARG" || -z "$CODE_ARG" ]]; then
      echo "Usage: $0 approve-code <platform> <code> [account_handle] [review_note]" >&2
      exit 1
    fi

    JSON_PAYLOAD=$(printf '{"platform":"%s","code":"%s","account_handle":%s,"review_notes":%s}' \
      "$PLATFORM_ARG" \
      "$CODE_ARG" \
      "$(json_string "$ACCOUNT_HANDLE")" \
      "$(json_string "$REVIEW_NOTE")")

    api_post "${API_BASE_URL}/verify/admin/approve-by-code" "$JSON_PAYLOAD"
    ;;

  *)
    echo "Unknown action: $ACTION" >&2
    echo "Usage: $0 <pending|approve|approve-code|reject> [args...]" >&2
    exit 1
    ;;
esac

echo
