terraform {
  required_providers {
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
  }
}

resource "supabase_project" "this" {
  organization_id   = var.organization_id
  name              = var.name
  database_password = var.database_password
  region            = var.region
  instance_size     = var.instance_size

  lifecycle {
    # The API never returns the password, so ignore it after creation to avoid perpetual diffs.
    ignore_changes = [database_password]
  }
}

resource "supabase_settings" "this" {
  project_ref = supabase_project.this.id

  api = jsonencode({
    db_schema            = var.api_db_schema
    db_extra_search_path = var.api_db_extra_search_path
    max_rows             = var.api_max_rows
  })
}

data "supabase_apikeys" "this" {
  project_ref = supabase_project.this.id
}
