# ============================================================
# Module: compute
# Recursos: ECS Cluster, Task Definitions, Services, CloudWatch, IAM
# ============================================================

# ------------------------------------------------------------
# Cluster ECS
# ------------------------------------------------------------
resource "aws_ecs_cluster" "main" {
  name = "${var.project}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = var.tags
}

# ------------------------------------------------------------
# CloudWatch Log Groups
# ------------------------------------------------------------
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "/ecs/${var.project}-frontend"
  retention_in_days = 7
  tags              = var.tags
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${var.project}-backend"
  retention_in_days = 7
  tags              = var.tags
}

# ------------------------------------------------------------
# IAM Roles para ECS (Usando LabRole fixa)
# ------------------------------------------------------------

data "aws_iam_role" "labrole" {
  name = "LabRole"
}


# ------------------------------------------------------------
# Task Definition: Backend (NestJS)
# ------------------------------------------------------------
resource "aws_ecs_task_definition" "backend" {
  family                   = "${var.project}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = data.aws_iam_role.labrole.arn
  task_role_arn            = data.aws_iam_role.labrole.arn

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "${var.backend_image}:latest"
    essential = true
    portMappings = [{
      containerPort = 3001
      hostPort      = 3001
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "backend"
      }
    }
    secrets = [
      { name = "DATABASE_URL", valueFrom = var.secret_database_url_arn },
      { name = "CLERK_SECRET_KEY", valueFrom = var.secret_clerk_secret_key_arn }
    ]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = "3001" }
    ]
  }])
}

# ------------------------------------------------------------
# Task Definition: Frontend (Next.js)
# ------------------------------------------------------------
resource "aws_ecs_task_definition" "frontend" {
  family                   = "${var.project}-frontend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.frontend_cpu
  memory                   = var.frontend_memory
  execution_role_arn       = data.aws_iam_role.labrole.arn
  task_role_arn            = data.aws_iam_role.labrole.arn

  container_definitions = jsonencode([{
    name      = "frontend"
    image     = "${var.frontend_image}:latest"
    essential = true
    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
    }]
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.frontend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "frontend"
      }
    }
    secrets = [
      { name = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", valueFrom = var.secret_clerk_pub_key_arn },
      { name = "NEXT_PUBLIC_API_URL", valueFrom = var.secret_api_url_arn }
    ]
    environment = [
      { name = "NODE_ENV", value = "production" },
      { name = "PORT", value = "3000" }
    ]
  }])
}

# ------------------------------------------------------------
# ECS Services
# ------------------------------------------------------------

resource "aws_ecs_service" "backend" {
  name            = "${var.project}-backend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.backend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.backend_target_group_arn
    container_name   = "backend"
    container_port   = 3001
  }
}

resource "aws_ecs_service" "frontend" {
  name            = "${var.project}-frontend-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.frontend.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.private_subnet_ids
    security_groups  = [var.security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = var.frontend_target_group_arn
    container_name   = "frontend"
    container_port   = 3000
  }
}
