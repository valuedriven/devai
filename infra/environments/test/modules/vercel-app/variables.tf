variable "name" {
  description = "Name of the Vercel project."
  type        = string
}

variable "framework" {
  description = "Vercel framework preset (e.g. \"nextjs\"). Use null for frameworks without a preset, such as NestJS."
  type        = string
  default     = null
}

variable "git_type" {
  description = "Git provider type: github, gitlab, or bitbucket."
  type        = string
  default     = "github"
}

variable "git_repo" {
  description = "Connected git repository in \"owner/repo\" form."
  type        = string
}

variable "production_branch" {
  description = "Branch that triggers production deployments."
  type        = string
  default     = "main"
}

variable "root_directory" {
  description = "Directory within the repo that holds the app. Null = repo root."
  type        = string
  default     = null
}

variable "build_command" {
  description = "Override build command. Null = auto-detect / framework default."
  type        = string
  default     = null
}

variable "install_command" {
  description = "Override install command. Null = auto-detect."
  type        = string
  default     = null
}

variable "output_directory" {
  description = "Override output directory. Null = auto-detect / framework default."
  type        = string
  default     = null
}

variable "serverless_function_region" {
  description = "Region where serverless functions run (e.g. iad1)."
  type        = string
  default     = "iad1"
}

variable "team_id" {
  description = "Vercel team ID. Null = rely on the provider-level team setting."
  type        = string
  default     = null
}

variable "environment_variables" {
  description = "Environment variables to attach to the project."
  type = list(object({
    key       = string
    value     = string
    target    = list(string) # subset of: production, preview, development
    sensitive = bool
  }))
  default = []
}
