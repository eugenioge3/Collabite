# =============================================================================
# Collabite — Dev Environment
# Wires all Terraform modules together
# =============================================================================

locals {
  project_name = var.project_name
  environment  = var.environment
}

# --- VPC ---
module "vpc" {
  source = "../../modules/vpc"

  project_name = local.project_name
  environment  = local.environment
  aws_region   = var.aws_region
}

# --- Cognito ---
module "cognito" {
  source = "../../modules/cognito"

  project_name = local.project_name
  environment  = local.environment
}

# --- Aurora Serverless v2 (PostgreSQL) ---
module "aurora" {
  source = "../../modules/aurora"

  project_name       = local.project_name
  environment        = local.environment
  master_username    = var.db_master_username
  private_subnet_ids = module.vpc.private_subnet_ids
  security_group_id  = module.vpc.aurora_security_group_id
  min_acu            = 0.5
  max_acu            = 4
}

# --- S3 Buckets ---
module "s3" {
  source = "../../modules/s3"

  project_name = local.project_name
  environment  = local.environment
}

# --- IAM ---
module "iam" {
  source = "../../modules/iam"

  project_name          = local.project_name
  environment           = local.environment
  cognito_user_pool_arn = module.cognito.user_pool_arn
  media_bucket_arn      = module.s3.media_bucket_arn
  aurora_secret_arn     = module.aurora.master_user_secret_arn
}

# --- Lambda (Monolambda with FastAPI + Mangum) ---
module "lambda" {
  source = "../../modules/lambda"

  project_name           = local.project_name
  environment            = local.environment
  lambda_role_arn        = module.iam.lambda_exec_role_arn
  s3_bucket              = module.s3.lambda_deploy_bucket_name
  s3_key                 = "lambda/api.zip"
  vpc_subnet_ids         = module.vpc.private_subnet_ids
  vpc_security_group_ids = [module.vpc.lambda_security_group_id]
  memory_size            = 512
  timeout                = 30

  environment_variables = {
    ENVIRONMENT           = local.environment
    COGNITO_USER_POOL_ID  = module.cognito.user_pool_id
    COGNITO_CLIENT_ID     = module.cognito.client_id
    DB_SECRET_ARN         = module.aurora.master_user_secret_arn
    DB_HOST               = module.aurora.cluster_endpoint
    DB_PORT               = tostring(module.aurora.cluster_port)
    DB_NAME               = module.aurora.database_name
    MEDIA_BUCKET          = module.s3.media_bucket_name
    CORS_ALLOWED_ORIGINS  = "*" # Will be CloudFront domain in production
  }
}

# --- API Gateway ---
module "api_gateway" {
  source = "../../modules/api-gateway"

  project_name         = local.project_name
  environment          = local.environment
  lambda_invoke_arn    = module.lambda.invoke_arn
  lambda_function_name = module.lambda.function_name
}

# --- CloudFront ---
module "cloudfront" {
  source = "../../modules/cloudfront"

  project_name                         = local.project_name
  environment                          = local.environment
  frontend_bucket_regional_domain_name = module.s3.frontend_bucket_regional_domain_name
  frontend_bucket_arn                  = module.s3.frontend_bucket_arn
  frontend_bucket_name                 = module.s3.frontend_bucket_name
  api_gateway_url                      = module.api_gateway.api_endpoint
}
