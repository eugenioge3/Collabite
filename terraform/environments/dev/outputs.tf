output "cognito_user_pool_id" {
  value = module.cognito.user_pool_id
}

output "cognito_client_id" {
  value = module.cognito.client_id
}

output "api_gateway_url" {
  value = module.api_gateway.api_endpoint
}

output "frontend_bucket" {
  value = module.s3.frontend_bucket_name
}

output "cloudfront_domain" {
  value = module.cloudfront.distribution_domain_name
}

output "media_bucket" {
  value = module.s3.media_bucket_name
}

output "aurora_endpoint" {
  value     = module.aurora.cluster_endpoint
  sensitive = true
}
