output "project_ref" {
  description = "Supabase project reference ID."
  value       = supabase_project.this.id
}

output "api_url" {
  description = "Base URL of the Supabase REST/Realtime/Auth API."
  value       = "https://${supabase_project.this.id}.supabase.co"
}

output "anon_key" {
  description = "Public anon key (safe to expose to browsers)."
  value       = data.supabase_apikeys.this.anon_key
}

output "service_role_key" {
  description = "Service role key (secret, full DB access)."
  value       = data.supabase_apikeys.this.service_role_key
  sensitive   = true
}

output "database_url" {
  description = "Direct Postgres connection string. For serverless/edge runtimes prefer the pooled connection (see README)."
  value       = "postgresql://postgres:${var.database_password}@db.${supabase_project.this.id}.supabase.co:5432/postgres"
  sensitive   = true
}
