variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnets" {
  description = "List of private subnet IDs"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "frontend_image" {
  description = "ECR image for frontend"
  type        = string
}

variable "backend_image" {
  description = "ECR image for backend"
  type        = string
}

variable "frontend_target_group_arn" {
  description = "ALB target group ARN for frontend"
  type        = string
}

variable "backend_target_group_arn" {
  description = "ALB target group ARN for backend"
  type        = string
}

variable "secret_arn" {
  description = "Secrets Manager secret ARN"
  type        = string
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
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
