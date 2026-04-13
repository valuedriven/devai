variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  type        = string
}

variable "ecs_service_name_frontend" {
  description = "Name of the frontend ECS service"
  type        = string
}

variable "ecs_service_name_backend" {
  description = "Name of the backend ECS service"
  type        = string
}
