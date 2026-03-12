#!/bin/bash
# Bootstrap script: Creates the S3 bucket and DynamoDB table for Terraform state
# Run this ONCE before the first `terraform init`
set -euo pipefail

REGION="us-east-1"
ENVIRONMENT="${1:-dev}"
BUCKET_NAME="collabite-terraform-state-${ENVIRONMENT}"
TABLE_NAME="collabite-terraform-locks-${ENVIRONMENT}"

echo "==> Bootstrapping Terraform state backend for '${ENVIRONMENT}'"

# Create S3 bucket for state
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
  echo "    Bucket '$BUCKET_NAME' already exists"
else
  echo "    Creating S3 bucket: $BUCKET_NAME"
  aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$REGION"
  aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled
  aws s3api put-bucket-encryption --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
      "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}}]
    }'
  aws s3api put-public-access-block --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
fi

# Create DynamoDB table for state locking
if aws dynamodb describe-table --table-name "$TABLE_NAME" --region "$REGION" >/dev/null 2>&1; then
  echo "    DynamoDB table '$TABLE_NAME' already exists"
else
  echo "    Creating DynamoDB table: $TABLE_NAME"
  aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions AttributeName=LockID,AttributeType=S \
    --key-schema AttributeName=LockID,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --region "$REGION"
  aws dynamodb wait table-exists --table-name "$TABLE_NAME" --region "$REGION"
fi

echo "==> Bootstrap complete. You can now run: cd terraform/environments/${ENVIRONMENT} && terraform init"
