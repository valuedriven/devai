output "db_instance_endpoint" {
  description = "Endpoint da instancia RDS"
  value       = aws_db_instance.postgres.endpoint
}

output "database_name" {
  value = aws_db_instance.postgres.db_name
}

