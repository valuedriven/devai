output "alb_dns_name" {
  value = aws_alb.main.dns_name
}

output "frontend_target_group_arn" {
  value      = aws_alb_target_group.frontend.arn
  depends_on = [aws_alb_listener.http]
}

output "backend_target_group_arn" {
  value      = aws_alb_target_group.backend.arn
  depends_on = [aws_alb_listener_rule.backend]
}
