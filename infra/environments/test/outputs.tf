output "frontend_url" {
  description = "Default production URL of the Next.js frontend."
  value       = module.frontend.production_url
}

output "backend_url" {
  description = "Default production URL of the NestJS backend."
  value       = module.backend.production_url
}

output "frontend_project_id" {
  value = module.frontend.project_id
}

output "backend_project_id" {
  value = module.backend.project_id
}

output "supabase_project_ref" {
  description = "Supabase project reference ID."
  value       = module.database.project_ref
}

output "supabase_api_url" {
  value = module.database.api_url
}

output "database_url" {
  description = "Postgres connection string."
  value       = module.database.database_url
  sensitive   = true
}
