variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "devai"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "db_name" {
  description = "Name of the database"
  type        = string
  default     = "devai"
}

variable "db_username" {
  description = "Username for the database"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Password for the database"
  type        = string
  sensitive   = true
}

variable "frontend_image_tag" {
  description = "Tag for the frontend ECR image"
  type        = string
  default     = "latest"
}

variable "backend_image_tag" {
  description = "Tag for the backend ECR image"
  type        = string
  default     = "latest"
}
