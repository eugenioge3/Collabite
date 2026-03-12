variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "collabite"
}

variable "db_master_username" {
  description = "Master username for Aurora PostgreSQL"
  type        = string
  default     = "collabite_admin"
  sensitive   = true
}

variable "domain_name" {
  description = "Domain name for the application (optional, leave empty for dev)"
  type        = string
  default     = ""
}

variable "stripe_secret_key_arn" {
  description = "ARN of the Stripe secret key in Secrets Manager"
  type        = string
  default     = ""
}
