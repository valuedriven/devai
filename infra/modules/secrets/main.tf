resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "${var.project_name}-app-secrets"
  description = "Application secrets for ${var.project_name}"
  recovery_window_in_days = 0

  tags = {
    Name        = "${var.project_name}-secrets"
    Environment = var.environment
  }
}

resource "aws_secretsmanager_secret_version" "app_secrets_initial" {
  secret_id     = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    DATABASE_URL                      = "placeholder"
    DIRECT_URL                        = "placeholder"
    CLERK_SECRET_KEY                  = "placeholder"
    CLERK_JWT_KEY                     = "placeholder"
    JWT_SECRET                        = "placeholder"
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = "placeholder"
    NEXT_PUBLIC_API_URL               = "placeholder"
  })

  lifecycle {
    ignore_changes = [secret_string]
  }
}
