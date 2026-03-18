terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # bucket passed via -backend-config in GitHub Actions
    key     = "dev/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = var.aws_region
}

module "network" {
  source       = "../../modules/network"
  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
}

module "registry" {
  source       = "../../modules/registry"
  project_name = var.project_name
  environment  = var.environment
}

module "loadbalancer" {
  source            = "../../modules/loadbalancer"
  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.network.vpc_id
  public_subnets    = module.network.public_subnets
  security_group_id = module.network.alb_security_group_id
}

module "database" {
  source            = "../../modules/database"
  project_name      = var.project_name
  environment       = var.environment
  subnet_ids        = module.network.data_subnets
  security_group_id = module.network.database_security_group_id
  db_name           = var.db_name
  db_username       = var.db_username
  db_password       = var.db_password
}

module "secrets" {
  source       = "../../modules/secrets"
  project_name = var.project_name
  environment  = var.environment
}

module "compute" {
  source            = "../../modules/compute"
  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.network.vpc_id
  private_subnets   = module.network.private_subnets
  security_group_id = module.network.ecs_tasks_security_group_id
  #frontend_image            = "${module.registry.frontend_repository_url}:${var.frontend_image_tag}"
  frontend_image = "${module.registry.frontend_repository_url}:latest"
  #backend_image             = "${module.registry.backend_repository_url}:${var.backend_image_tag}"
  backend_image             = "${module.registry.backend_repository_url}:latest"
  frontend_target_group_arn = module.loadbalancer.frontend_target_group_arn
  backend_target_group_arn  = module.loadbalancer.backend_target_group_arn
  secret_arn                = module.secrets.secret_arn
  aws_region                = var.aws_region
}

module "monitoring" {
  source                    = "../../modules/monitoring"
  project_name              = var.project_name
  environment               = var.environment
  ecs_cluster_name          = module.compute.cluster_name
  ecs_service_name_frontend = module.compute.frontend_service_name
  ecs_service_name_backend  = module.compute.backend_service_name
}
