#!/bin/bash
# Build and deploy frontend to S3 + invalidate CloudFront cache
set -euo pipefail

ENVIRONMENT="${1:-dev}"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "==> Building frontend..."
cd "$FRONTEND_DIR"
npm ci
npm run build

echo "==> Uploading to S3..."
BUCKET_NAME="collabite-frontend-$ENVIRONMENT"
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete

echo "==> Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(cd "$PROJECT_ROOT/terraform/environments/$ENVIRONMENT" && terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" > /dev/null
  echo "    CloudFront invalidation created"
else
  echo "    Skipping CloudFront invalidation (no distribution ID found)"
fi

echo "==> Frontend deploy complete!"
