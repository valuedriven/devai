output "alb_dns_name" {
  value = aws_alb.main.dns_name
}

output "frontend_target_group_arn" {
  value = aws_alb_target_group.frontend.arn
}

output "backend_target_group_arn" {
  value = aws_alb_target_group.backend.arn
}
