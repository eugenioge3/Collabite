variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "master_username" {
  type      = string
  sensitive = true
}

variable "private_subnet_ids" {
  type = list(string)
}

variable "security_group_id" {
  type = string
}

variable "min_acu" {
  description = "Minimum Aurora Capacity Units (0.5 = minimum for Serverless v2)"
  type        = number
  default     = 0.5
}

variable "max_acu" {
  description = "Maximum Aurora Capacity Units"
  type        = number
  default     = 4
}
