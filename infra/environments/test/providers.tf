provider "vercel" {
  # If api_token is null, the provider falls back to the VERCEL_API_TOKEN env var.
  api_token = var.vercel_api_token

  # Team slug or team ID. Leave null to create resources in your personal account.
  team = var.vercel_team_id
}

provider "supabase" {
  # If access_token is null, the provider falls back to the SUPABASE_ACCESS_TOKEN env var.
  access_token = var.supabase_access_token
}
