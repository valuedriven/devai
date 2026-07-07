variable "organization_id" {
  description = "Supabase organization slug."
  type        = string
}

variable "name" {
  description = "Name of the Supabase project."
  type        = string
}

variable "database_password" {
  description = "Postgres database password."
  type        = string
  sensitive   = true
}

variable "region" {
  description = "Supabase region (e.g. us-east-1)."
  type        = string
  default     = "us-east-1"
}

variable "instance_size" {
  description = "Desired instance/compute size. Null = Supabase default."
  type        = string
  default     = null
}

variable "api_db_schema" {
  description = "Schemas exposed through the auto-generated API."
  type        = string
  default     = "public,storage,graphql_public"
}

variable "api_db_extra_search_path" {
  description = "Extra schemas added to the Postgres search path."
  type        = string
  default     = "public,extensions"
}

variable "api_max_rows" {
  description = "Maximum rows returned by a single API request."
  type        = number
  default     = 1000
}
