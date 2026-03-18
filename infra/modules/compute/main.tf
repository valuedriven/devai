resource "aws_ecs_cluster" "main" {
  name = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name        = "${var.project_name}-ecs-cluster"
    Environment = var.environment
  }
}

resource "aws_cloudwatch_log_group" "ecs_frontend" {
  name              = "/ecs/${var.project_name}-frontend"
  retention_in_days = 7
}

resource "aws_cloudwatch_log_group" "ecs_backend" {
  name              = "/ecs/${var.project_name}-backend"
  retention_in_days = 7
}

resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project_name}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  task_role_arn            = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"

  container_definitions = jsonencode([
    {
      name      = "frontend"
      image     = var.frontend_image
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_frontend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project_name}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"
  task_role_arn            = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/LabRole"

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = var.backend_image
      essential = true
      portMappings = [
        {
          containerPort = 3001
          hostPort      = 3001
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3001" },
        { name = "BACKEND_PORT", value = "3001" }
      ]
      secrets = [
        { name = "DATABASE_URL", valueFrom = "${var.secret_arn}:DATABASE_URL::" },
        { name = "DIRECT_URL", valueFrom = "${var.secret_arn}:DIRECT_URL::" },
        { name = "CLERK_SECRET_KEY", valueFrom = "${var.secret_arn}:CLERK_SECRET_KEY::" },
        { name = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", valueFrom = "${var.secret_arn}:NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY::" },
        { name = "JWT_SECRET", valueFrom = "${var.secret_arn}:JWT_SECRET::" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.ecs_backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "frontend" {
  name            = "${var.project_name}-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [var.security_group_id]
    subnets          = var.private_subnets
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "frontend"
    container_port   = 3000
  }
}

resource "aws_ecs_service" "backend" {
  name            = "${var.project_name}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [var.security_group_id]
    subnets          = var.private_subnets
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "backend"
    container_port   = 3001
  }
}

data "aws_caller_identity" "current" {}
