variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "lambda_role_arn" {
  type = string
}

variable "s3_bucket" {
  description = "S3 bucket for Lambda deployment package"
  type        = string
}

variable "s3_key" {
  description = "S3 key for Lambda deployment package"
  type        = string
  default     = "lambda/api.zip"
}

variable "vpc_subnet_ids" {
  type = list(string)
}

variable "vpc_security_group_ids" {
  type = list(string)
}

variable "environment_variables" {
  type    = map(string)
  default = {}
}

variable "memory_size" {
  type    = number
  default = 512
}

variable "timeout" {
  type    = number
  default = 30
}
