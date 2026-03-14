#!/bin/bash
# Deploy script for Collabite
# Usage: ./scripts/deploy.sh [dev|staging|prod]
set -euo pipefail

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1" >&2
    exit 1
  fi
}

ENVIRONMENT="${1:-dev}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$PROJECT_ROOT/backend"
TERRAFORM_DIR="$PROJECT_ROOT/terraform/environments/$ENVIRONMENT"

PYTHON_BIN="$BACKEND_DIR/.venv/bin/python"
if [[ ! -x "$PYTHON_BIN" ]]; then
  PYTHON_BIN="$(command -v python3 || true)"
fi

if [[ -z "$PYTHON_BIN" ]]; then
  echo "ERROR: Python interpreter not found. Create backend/.venv or install python3." >&2
  exit 1
fi

require_cmd aws
require_cmd terraform
require_cmd zip
"$PYTHON_BIN" -m pip --version >/dev/null

echo "=========================================="
echo "  Collabite Deploy — $ENVIRONMENT"
echo "=========================================="

# ── Step 1: Build Lambda package ──────────────────────────────────────────────
echo ""
echo "==> Building Lambda deployment package..."
cd "$BACKEND_DIR"

BUILD_DIR="$PROJECT_ROOT/.build/lambda"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"

# Install dependencies
"$PYTHON_BIN" -m pip install -r requirements.txt -t "$BUILD_DIR" --quiet

# Copy source code
cp -r api core models "$BUILD_DIR/"

# Create zip
cd "$BUILD_DIR"
ZIP_FILE="$PROJECT_ROOT/.build/api.zip"
rm -f "$ZIP_FILE"
zip -r "$ZIP_FILE" . -x "*.pyc" "__pycache__/*" "*.dist-info/*" > /dev/null

echo "    Lambda package: $(du -h "$ZIP_FILE" | cut -f1)"

# ── Step 2: Upload Lambda package to S3 ──────────────────────────────────────
echo ""
echo "==> Uploading Lambda package to S3..."
BUCKET_NAME="collabite-lambda-deploy-$ENVIRONMENT"
aws s3 cp "$ZIP_FILE" "s3://$BUCKET_NAME/lambda/api.zip"
echo "    Uploaded to s3://$BUCKET_NAME/lambda/api.zip"

# ── Step 3: Terraform apply ──────────────────────────────────────────────────
echo ""
echo "==> Running Terraform apply..."
cd "$TERRAFORM_DIR"
terraform init -input=false
terraform apply -auto-approve

# ── Step 4: Update Lambda function code ──────────────────────────────────────
echo ""
echo "==> Updating Lambda function..."
FUNCTION_NAME="collabite-api-$ENVIRONMENT"
aws lambda update-function-code \
  --function-name "$FUNCTION_NAME" \
  --s3-bucket "$BUCKET_NAME" \
  --s3-key "lambda/api.zip" \
  --publish > /dev/null

echo ""
echo "=========================================="
echo "  Deploy complete!"
echo "=========================================="
terraform output
