terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = ">= 3.0.0, < 5.0.0"
    }
  }
}

resource "vercel_project" "this" {
  name      = var.name
  framework = var.framework
  team_id   = var.team_id

  # Connecting a git repository enables automatic deployments on push.
  # Requires the matching Vercel git integration (GitHub/GitLab/Bitbucket) to be installed.
  git_repository = {
    type              = var.git_type
    repo              = var.git_repo
    production_branch = var.production_branch
  }

  root_directory             = var.root_directory
  build_command              = var.build_command
  install_command            = var.install_command
  output_directory           = var.output_directory
  serverless_function_region = var.serverless_function_region
}

# One resource per environment variable. Keyed by the variable name (static),
# so values that are only known after apply (e.g. Supabase keys) don't break for_each.
resource "vercel_project_environment_variable" "this" {
  for_each = { for env in var.environment_variables : env.key => env }

  project_id = vercel_project.this.id
  team_id    = var.team_id
  key        = each.value.key
  value      = each.value.value
  target     = each.value.target
  sensitive  = each.value.sensitive
}
