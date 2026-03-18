#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  ./scripts/release-readiness.sh [dev|staging|prod] [--local-only]

Examples:
  ./scripts/release-readiness.sh dev
  ./scripts/release-readiness.sh prod --local-only

Description:
  - Runs the manual quality gate (make qa)
  - Checks deploy scripts syntax
  - Validates Terraform config for the selected environment (unless --local-only)
EOF
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1" >&2
    exit 1
  fi
}

ENVIRONMENT="dev"
LOCAL_ONLY=0

for arg in "$@"; do
  case "$arg" in
    dev|staging|prod)
      ENVIRONMENT="$arg"
      ;;
    --local-only)
      LOCAL_ONLY=1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "ERROR: unknown argument: $arg" >&2
      usage
      exit 1
      ;;
  esac
done

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TERRAFORM_DIR="$PROJECT_ROOT/terraform/environments/$ENVIRONMENT"

echo "=========================================="
echo "  Release Readiness — $ENVIRONMENT"
echo "=========================================="

echo ""
echo "==> Running quality gate (make qa)..."
cd "$PROJECT_ROOT"
make qa

echo ""
echo "==> Checking deploy scripts syntax..."
bash -n "$PROJECT_ROOT/scripts/deploy.sh"
bash -n "$PROJECT_ROOT/scripts/deploy-frontend.sh"

if [[ "$LOCAL_ONLY" -eq 0 ]]; then
  echo ""
  echo "==> Running remote readiness checks..."
  require_cmd aws
  require_cmd terraform

  if [[ ! -d "$TERRAFORM_DIR" ]]; then
    echo "ERROR: terraform environment not found: $TERRAFORM_DIR" >&2
    exit 1
  fi

  terraform -chdir="$TERRAFORM_DIR" init -backend=false -input=false -no-color >/dev/null
  terraform -chdir="$TERRAFORM_DIR" validate -no-color >/dev/null
fi

echo ""
echo "=========================================="
echo "  Release readiness: OK"
echo "=========================================="
echo "Next steps:"
echo "  ./scripts/deploy.sh $ENVIRONMENT"
echo "  ./scripts/deploy-frontend.sh $ENVIRONMENT"
echo ""
echo "Rollback (known good commit):"
echo "  git checkout <KNOWN_GOOD_SHA>"
echo "  make qa"
echo "  ./scripts/deploy.sh $ENVIRONMENT"
echo "  ./scripts/deploy-frontend.sh $ENVIRONMENT"
echo "  git checkout -"
