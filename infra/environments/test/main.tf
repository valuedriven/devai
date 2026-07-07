###############################################################################
# Database — Supabase (Postgres)
###############################################################################

module "database" {
  source = "./modules/supabase-db"

  organization_id   = var.supabase_org_id
  name              = "${var.project_name}-db"
  database_password = var.supabase_db_password
  region            = var.supabase_region
}

###############################################################################
# Backend — NestJS on Vercel
#
# NestJS has no Vercel framework preset, so framework is null and the build is
# configured explicitly. Adjust build_command / output_directory to match your
# repo (many NestJS-on-Vercel setups also add a vercel.json in the repo).
###############################################################################

module "backend" {
  source = "./modules/vercel-app"
  
  name                       = "${var.project_name}-api"
  framework                  = null
  git_type                   = var.git_provider
  git_repo                   = var.backend_repo
  production_branch          = var.production_branch
  build_command              = "npm run build"
  output_directory           = "dist"
  serverless_function_region = var.vercel_region

  environment_variables = [
    {
      key       = "DATABASE_URL"
      value     = module.database.database_url
      target    = ["production", "preview"]
      sensitive = true
    },
    {
      key       = "SUPABASE_URL"
      value     = module.database.api_url
      target    = ["production", "preview"]
      sensitive = false
    },
    {
      key       = "SUPABASE_SERVICE_ROLE_KEY"
      value     = module.database.service_role_key
      target    = ["production", "preview"]
      sensitive = true
    },
  ]
}

###############################################################################
# Frontend — Next.js on Vercel
#
# NEXT_PUBLIC_* variables are exposed to the browser, so they are not marked
# sensitive. They point at the Supabase public API and the backend URL.
###############################################################################

module "frontend" {

  source = "./modules/vercel-app"
  name                       = "${var.project_name}-web"
  framework                  = "nextjs"
  git_type                   = var.git_provider
  git_repo                   = var.frontend_repo
  production_branch          = var.production_branch
  serverless_function_region = var.vercel_region

  environment_variables = [
    {
      key       = "NEXT_PUBLIC_SUPABASE_URL"
      value     = module.database.api_url
      target    = ["production", "preview", "development"]
      sensitive = false
    },
    {
      key       = "NEXT_PUBLIC_SUPABASE_ANON_KEY"
      value     = module.database.anon_key
      target    = ["production", "preview", "development"]
      sensitive = false
    },
    {
      key       = "NEXT_PUBLIC_API_URL"
      value     = module.backend.production_url
      target    = ["production", "preview", "development"]
      sensitive = false
    },
  ]
}
