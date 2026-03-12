variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "frontend_bucket_regional_domain_name" {
  type = string
}

variable "frontend_bucket_arn" {
  type = string
}

variable "frontend_bucket_name" {
  type = string
}

variable "api_gateway_url" {
  description = "API Gateway invoke URL (including stage)"
  type        = string
}
