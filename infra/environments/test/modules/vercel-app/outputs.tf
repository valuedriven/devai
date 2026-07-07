output "project_id" {
  description = "Vercel project ID."
  value       = vercel_project.this.id
}

output "name" {
  description = "Vercel project name."
  value       = vercel_project.this.name
}

output "production_url" {
  description = "Default production URL. Note: this is the default *.vercel.app domain derived from the project name; a custom or auto-suffixed domain may differ."
  value       = "https://${vercel_project.this.name}.vercel.app"
}
