variable "project" {
  description = "Nome do projeto"
  type        = string
}

variable "subnet_ids" {
  description = "Lista de IDs das subnets de dados"
  type        = list(string)
}

variable "security_group_id" {
  description = "ID do Security Group para o Aurora"
  type        = string
}

variable "database_name" {
  description = "Nome do banco de dados inicial"
  type        = string
  default     = "devai"
}

variable "master_username" {
  description = "Usuário master do banco"
  type        = string
}

variable "master_password" {
  description = "Senha master do banco"
  type        = string
  sensitive   = true
}

variable "engine_version" {
  description = "Versão do PostgreSQL"
  type        = string
  default     = "15.7"
}

variable "instance_class" {
  description = "Classe da instância RDS"
  type        = string
  default     = "db.t3.micro"
}

variable "allocated_storage" {
  description = "Espaço em disco (GB)"
  type        = number
  default     = 20
}


variable "tags" {
  description = "Tags globais"
  type        = map(string)
  default     = {}
}
