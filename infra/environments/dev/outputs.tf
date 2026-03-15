output "alb_dns_name" {
  value = module.loadbalancer.lb_dns_name
}

output "ecr_frontend_url" {
  value = module.registry.frontend_repository_url
}

output "ecr_backend_url" {
  value = module.registry.backend_repository_url
}

output "rds_endpoint" {
  value = module.database.db_instance_endpoint
}

