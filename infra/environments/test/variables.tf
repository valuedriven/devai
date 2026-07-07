###############################################################################
# Global
###############################################################################

variable "project_name" {
  description = "Base name used to prefix all created resources (e.g. \"acme\" -> acme-web, acme-api, acme-db)."
  type        = string
}

variable "production_branch" {
  description = "Git branch that maps to production deployments on Vercel."
  type        = string
  default     = "main"
}

###############################################################################
# Vercel
###############################################################################

variable "vercel_api_token" {
  description = "Vercel API token. Leave null to read from the VERCEL_API_TOKEN environment variable."
  type        = string
  default     = null
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team slug or ID. Leave null to use your personal account."
  type        = string
  default     = null
}

variable "vercel_region" {
  description = "Default serverless function region for Vercel projects (e.g. iad1, sfo1, gru1)."
  type        = string
  default     = "iad1"
}

variable "frontend_repo" {
  description = "Git repository for the Next.js frontend, in \"owner/repo\" form."
  type        = string
}

variable "backend_repo" {
  description = "Git repository for the NestJS backend, in \"owner/repo\" form."
  type        = string
}

variable "git_provider" {
  description = "Git provider connected to Vercel (github, gitlab, or bitbucket)."
  type        = string
  default     = "github"
}

###############################################################################
# Supabase
###############################################################################

variable "supabase_access_token" {
  description = "Supabase personal access token. Leave null to read from the SUPABASE_ACCESS_TOKEN environment variable."
  type        = string
  default     = null
  sensitive   = true
}

variable "supabase_org_id" {
  description = "Supabase organization slug (Organization Settings > Organization slug)."
  type        = string
}

variable "supabase_db_password" {
  description = "Password for the Supabase Postgres database."
  type        = string
  sensitive   = true
}

variable "supabase_region" {
  description = "Region for the Supabase project (e.g. us-east-1, eu-central-1, ap-southeast-1)."
  type        = string
  default     = "us-east-1"
}
