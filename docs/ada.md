# Architecture Decision Analysis (ADA)

## DevAI — Plataforma de Micro-Commerce

**Versão:** 1.0  
**Data:** 2026-03-15  
**Autor:** Arquitetura Cloud  
**Status:** Active

---

## Contexto

O **DevAI** é uma plataforma de micro-commerce full-stack composta por:

- **Frontend:** Next.js 16+ (App Router, TypeScript, Vanilla CSS)
- **Backend:** NestJS 11+ (TypeScript, Node 24+, RESTful API)
- **Banco de Dados:** PostgreSQL 15+ via Prisma ORM
- **Autenticação:** Clerk (OpenID Connect / OAuth 2.0)
- **Containerização:** Docker / OCI-compliant
- **IaC:** Terraform
- **CI/CD:** GitHub Actions

A plataforma serve dois perfis de usuário — **Administrador** (empreendedor) e **Cliente** — com funcionalidades de vitrine digital, gestão de pedidos, catálogo de produtos, gestão de clientes e dashboard de KPIs.

A arquitetura deve operar inicialmente em **mono-tenant com baixo tráfego**, ser compatível com **AWS Learner Labs**, e evoluir incrementalmente para suportar multi-tenancy e alta disponibilidade.

---

## Premissas e Restrições

| Restrição | Detalhe |
|-----------|---------|
| Ambiente | AWS Learner Labs (serviços limitados) |
| Containerização | Docker OCI obrigatório |
| IaC | Terraform obrigatório |
| CI/CD | GitHub Actions |
| Tráfego inicial | Baixo (MVP mono-tenant) |
| Equipe | Pequena (2–5 desenvolvedores) |
| Custo | Minimizar ao máximo no cenário 1 |
| Registry | ECR obrigatório em todos os cenários |
| Auth | Clerk (serviço externo gerenciado) |
| BD | PostgreSQL 15+ |

---

## Cenário 1 — Arquitetura Básica (Low Cost / MVP)

### 1. Visão Geral

**Objetivo:** Menor custo possível com deploy rápido para MVP educacional. Prioriza simplicidade operacional em detrimento de resiliência.

**Princípios Arquiteturais:**
- Single-instance: toda a stack em uma EC2
- Containers gerenciados via Docker Compose no host
- RDS em instância mínima (free-tier elegível)
- ECR para centralizar imagens

**Trade-offs:**
- ✅ Custo mínimo (~$15–25/mês)
- ✅ Deploy simples (SSH + docker compose up)
- ❌ Sem alta disponibilidade (single point of failure)
- ❌ Escalabilidade manual via SSH
- ❌ Rollbacks manuais

---

### 2. Diagrama Arquitetural (C4 — Container Level)

```
Internet
  │
  ▼
[Route 53 - DNS]
  │
  ▼
[EC2 t3.micro]
  ├── [Docker: Next.js Frontend :3000]
  │       └── Serve páginas SSR + static assets
  ├── [Docker: NestJS Backend :3001]
  │       └── API RESTful /v1/*
  │       └── Clerk JWT validation
  │       └── Prisma ORM
  └── [Docker: Nginx Reverse Proxy :80/443]
          └── Roteia /api/* → Backend
          └── Roteia /* → Frontend
  │
  ▼
[RDS PostgreSQL t3.micro - Single AZ]
  │
  ▼
[ECR - Container Registry]
  │
  ▼
[S3 - Static assets / imagens de produtos]
  │
  ▼
[CloudWatch - Logs básicos]
  │
  ▼
[Clerk - Auth externo SaaS]
```

---

### 3. Serviços AWS Utilizados

| Serviço | Uso | Tier |
|---------|-----|------|
| **EC2 t3.micro** | Host único para toda a stack containerizada | Free-tier elegível |
| **RDS PostgreSQL t3.micro** | Banco de dados relacional, Single AZ | Free-tier elegível |
| **ECR** | Registry de imagens Docker | Pago por armazenamento |
| **S3** | Assets estáticos e imagens de produtos | Free-tier elegível |
| **Route 53** | DNS e roteamento | ~$0.50/hosted zone |
| **CloudWatch** | Logs e métricas básicas | Free-tier (5GB logs) |
| **IAM** | Controle de acesso entre serviços | Gratuito |
| **VPC** | Isolamento de rede | Gratuito |
| **Security Groups** | Firewall de instâncias | Gratuito |

> **Nota Learner Labs:** EC2, RDS t3.micro, S3, ECR, CloudWatch e IAM estão disponíveis no AWS Learner Labs.

---

### 4. Fluxo de Deploy

```
1. Developer → git push → GitHub
2. GitHub Actions:
   a. Checkout código
   b. Build imagem: docker build -t frontend .
   c. Build imagem: docker build -t backend .
   d. aws ecr get-login-password | docker login
   e. docker push → ECR (frontend:latest, backend:latest)
   f. SSH na EC2:
      - docker compose pull
      - docker compose up -d --no-deps
3. Nginx recarrega configuração
4. Health check via CloudWatch agent
```

**Pipeline GitHub Actions:**
```yaml
# .github/workflows/deploy-basic.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    steps:
      - Build e push imagens → ECR
      - SSH EC2 → docker compose pull && up -d
```

---

### 5. Estrutura Terraform

```
infra/
├── modules/
│   ├── network/          # VPC, Subnets, Security Groups
│   ├── compute/          # EC2 instance, Key Pair
│   ├── database/         # RDS PostgreSQL
│   └── registry/         # ECR repositories
└── environments/
    └── dev/
        ├── main.tf
        ├── variables.tf
        ├── outputs.tf
        └── terraform.tfvars
```

---

### 6. Estratégia de Observabilidade

| Camada | Ferramenta | Configuração |
|--------|-----------|--------------|
| **Logs de App** | CloudWatch Logs via CloudWatch Agent | Grupos: `/devai/frontend`, `/devai/backend` |
| **Métricas EC2** | CloudWatch Metrics | CPU, Memória, Disco (via agent) |
| **Métricas RDS** | CloudWatch Métricas nativas | Connections, CPU, Storage |
| **Alertas** | CloudWatch Alarms → SNS Email | CPU > 80%, RDS > 90% storage |
| **Logs Nginx** | CloudWatch Logs | Access + error logs |

**Health Check:** Endpoint `/health` no backend verificado a cada 5min via CloudWatch Synthetic (ou cron simples).

---

### 7. Estratégia de Segurança

| Aspecto | Implementação |
|---------|--------------|
| **IAM** | Role EC2 com permissões mínimas: ECR pull, S3 read/write, CloudWatch put |
| **Rede** | VPC com subnets públicas/privadas; RDS em subnet privada |
| **Security Groups** | EC2: ingress 80/443 de 0.0.0.0/0; RDS: ingress 5432 apenas do Security Group da EC2 |
| **Segredos** | Variáveis de ambiente no docker-compose (production) + AWS Secrets Manager |
| **Auth** | Clerk JWT validado no backend; HttpOnly cookies no frontend |
| **TLS** | Certificado via Let's Encrypt (Certbot) no Nginx |
| **HTTPS** | Forçado no Nginx; HSTS habilitado |

---

### 8. Estimativa de Custos (Mensal)

| Serviço | Instância | Custo Estimado |
|---------|-----------|---------------|
| EC2 | t3.micro (On-Demand) | ~$8.47 |
| RDS PostgreSQL | t3.micro, 20GB, Single AZ | ~$14.00 |
| ECR | 5GB storage | ~$0.50 |
| S3 | 10GB + transferência | ~$0.30 |
| Route 53 | 1 hosted zone | ~$0.50 |
| CloudWatch | Logs 5GB free + métricas | ~$0.00–$2.00 |
| Data Transfer | Baixo tráfego | ~$1.00 |
| **Total Estimado** | | **~$25–30/mês** |

> ✅ **AWS Learner Labs:** EC2 e RDS t3.micro são free-tier elegíveis no primeiro ano, reduzindo custo para ~$5–10/mês.

---

### 9. Vantagens e Trade-offs

| Critério | Avaliação |
|----------|-----------|
| **Custo** | ⭐⭐⭐⭐⭐ Mínimo possível |
| **Complexidade Operacional** | ⭐⭐⭐⭐⭐ Muito simples |
| **Escalabilidade** | ⭐ Manual e limitada |
| **Disponibilidade** | ⭐⭐ Sem redundância (single AZ) |
| **Segurança** | ⭐⭐⭐ Básica, suficiente para MVP |
| **Manutenção** | ⭐⭐⭐⭐ Fácil para equipe pequena |

---

## Cenário 2 — Arquitetura Intermediária (Production Ready)

### 1. Visão Geral

**Objetivo:** Maior confiabilidade com separação de camadas, alta disponibilidade básica (Multi-AZ) e capacidade de escalabilidade moderada. Adequada para Versão 1.0.

**Princípios Arquiteturais:**
- ECS Fargate elimina gerenciamento de servidores
- ALB para roteamento inteligente e health checks
- RDS Multi-AZ para failover automático
- Auto Scaling básico para picos de tráfego

**Trade-offs:**
- ✅ Alta disponibilidade (Multi-AZ)
- ✅ Auto scaling automático
- ✅ Sem gerenciamento de EC2
- ✅ Deploy sem downtime (rolling updates)
- ❌ Custo maior (~$120–180/mês)
- ❌ Maior complexidade de configuração inicial

---

### 2. Diagrama Arquitetural (C4 — Container Level)

```
Internet
  │
  ▼
[CloudFront CDN]
  │
  ├──→ [S3 - Static Assets]
  │
  └──→ [ALB - Application Load Balancer]
          │
          ├──→ /api/* → [ECS Fargate Service: NestJS Backend]
          │               ├── Task: backend:latest (ECR)
          │               ├── Min 1 / Max 4 tasks
          │               └── Auto Scaling por CPU/Request Count
          │
          └──→ /* → [ECS Fargate Service: Next.js Frontend]
                      ├── Task: frontend:latest (ECR)
                      ├── Min 1 / Max 4 tasks
                      └── Auto Scaling por CPU
  │
  ▼
[RDS PostgreSQL t3.small - Multi-AZ]
  │
  ▼
[ECR] ←── [GitHub Actions CI/CD]
  │
  ▼
[Secrets Manager - DATABASE_URL, CLERK_SECRET, etc.]
  │
  ▼
[CloudWatch - Logs, Métricas, Alarms]
  │
  ▼
[Clerk - Auth externo SaaS]
```

---

### 3. Serviços AWS Utilizados

| Serviço | Uso |
|---------|-----|
| **ECS Fargate** | Orquestração de containers sem gerenciar EC2 |
| **ECR** | Registry de imagens Docker |
| **ALB** | Load balancer com roteamento por path, health checks |
| **CloudFront** | CDN para assets estáticos e cache de páginas |
| **RDS PostgreSQL t3.small** | Banco relacional Multi-AZ com failover automático |
| **S3** | Assets estáticos, imagens de produtos |
| **Secrets Manager** | Gerenciamento seguro de credenciais |
| **CloudWatch** | Logs, métricas, alarmes e dashboards |
| **IAM** | Roles e policies granulares por serviço |
| **VPC** | Isolamento com subnets públicas, privadas e de dados |
| **Route 53** | DNS com health checks |
| **ACM** | Certificados SSL/TLS gerenciados (auto-renovação) |

---

### 4. Fluxo de Deploy

```
1. Developer → git push → GitHub (branch main)
2. GitHub Actions:
   a. CI: lint, type-check, unit tests
   b. Build imagens Docker multi-stage
   c. Push → ECR (tagged com SHA do commit + latest)
   d. Terraform plan/apply (infra changes)
   e. aws ecs update-service --force-new-deployment
   f. Aguarda ECS rolling update (health checks via ALB)
   g. Notificação Slack/email em caso de falha
3. ECS substitui tasks gradualmente (rolling update)
4. ALB redireciona tráfego apenas para tasks healthy
5. CloudWatch monitora métricas pós-deploy
```

**Pipeline GitHub Actions:**
```yaml
# .github/workflows/deploy-intermediate.yml
on:
  push:
    branches: [main]
jobs:
  test:
    # lint, type-check, unit tests
  build-push:
    # docker build + push ECR
  deploy:
    # terraform apply + ecs update-service
```

---

### 5. Estrutura Terraform

```
infra/
├── modules/
│   ├── network/          # VPC, Subnets (pub/priv/data), NAT Gateway, IGW
│   ├── compute/          # ECS Cluster, Task Definitions, Services, Auto Scaling
│   ├── loadbalancer/     # ALB, Target Groups, Listeners, SSL
│   ├── database/         # RDS Multi-AZ, Parameter Group, Subnet Group
│   ├── registry/         # ECR repositories, lifecycle policies
│   ├── cdn/              # CloudFront, S3 Origin
│   ├── secrets/          # Secrets Manager
│   └── observability/    # CloudWatch Log Groups, Dashboards, Alarms
└── environments/
    ├── dev/
    │   ├── main.tf
    │   ├── variables.tf
    │   └── terraform.tfvars   # t3.micro, 1 AZ, min tasks
    └── prod/
        ├── main.tf
        ├── variables.tf
        └── terraform.tfvars   # t3.small, Multi-AZ, auto scaling
```

---

### 6. Estratégia de Observabilidade

| Camada | Ferramenta | Detalhe |
|--------|-----------|---------|
| **Logs de App** | CloudWatch Logs | ECS log driver → `/devai/frontend`, `/devai/backend` |
| **Métricas ECS** | CloudWatch Container Insights | CPU, Memória, Task count por serviço |
| **Métricas RDS** | CloudWatch nativo | Connections, Latency, IOPS |
| **Métricas ALB** | CloudWatch nativo | Request count, 5xx errors, Latency p99 |
| **Tracing** | AWS X-Ray (opcional) | Distributed tracing entre frontend e backend |
| **Dashboards** | CloudWatch Dashboards | KPIs de infra em tempo real |
| **Alertas** | CloudWatch Alarms → SNS | CPU > 70%, Error rate > 1%, RDS conexões > 80% |
| **Uptime** | CloudWatch Synthetics | Canary a cada 5min verificando `/health` |

---

### 7. Estratégia de Segurança

| Aspecto | Implementação |
|---------|--------------|
| **IAM** | Task Roles ECS com permissões mínimas; sem IAM User com chaves estáticas |
| **Rede** | Frontend/Backend em subnets privadas; RDS em subnet de dados; ALB na pública |
| **Security Groups** | ALB → ECS (somente portas app); ECS → RDS (somente 5432) |
| **Segredos** | Secrets Manager integrado ao ECS Task Definition via `secrets` |
| **TLS** | ACM gerencia certificados; ALB termina TLS; comunicação interna via HTTP |
| **Auth** | Clerk JWT validado no NestJS Guard; sem estado de sessão no backend |
| **CORS** | Lista de origens whitelist (domínios tenant) |
| **Rate Limiting** | NestJS Throttler Guard + ALB WAF rules (opcional) |
| **VPC** | NAT Gateway para saída de internet (ECS tasks em subnet privada) |

---

### 8. Estimativa de Custos (Mensal)

| Serviço | Configuração | Custo Estimado |
|---------|-------------|---------------|
| ECS Fargate | 2 serviços × 0.5 vCPU × 1GB RAM | ~$25–40 |
| RDS PostgreSQL | t3.small Multi-AZ, 20GB | ~$55 |
| ALB | 1 ALB + LCU baixo tráfego | ~$20 |
| CloudFront | 10GB/mês transferência | ~$1–3 |
| ECR | 5GB storage | ~$0.50 |
| S3 | 20GB + transferência | ~$1 |
| NAT Gateway | 1 AZ | ~$35 |
| Secrets Manager | 5 segredos | ~$2 |
| CloudWatch | Logs + métricas + dashboards | ~$5–10 |
| Route 53 + ACM | 1 hosted zone | ~$0.50 |
| **Total Estimado** | | **~$145–170/mês** |

---

### 9. Vantagens e Trade-offs

| Critério | Avaliação |
|----------|-----------|
| **Custo** | ⭐⭐⭐ Moderado |
| **Complexidade Operacional** | ⭐⭐⭐ Moderada (Fargate elimina EC2) |
| **Escalabilidade** | ⭐⭐⭐⭐ Auto scaling horizontal |
| **Disponibilidade** | ⭐⭐⭐⭐ Multi-AZ, rolling updates |
| **Segurança** | ⭐⭐⭐⭐ Secrets Manager, rede isolada |
| **Manutenção** | ⭐⭐⭐⭐ Serviços gerenciados |

---

## Cenário 3 — Arquitetura Avançada (Cloud Native)

### 1. Visão Geral

**Objetivo:** Escalabilidade elástica, alta disponibilidade (99.9%+), desacoplamento de serviços via mensageria e preparação para multi-tenancy e crescimento de longo prazo.

**Princípios Arquiteturais:**
- ECS Fargate com múltiplas AZs e auto scaling agressivo
- SQS para processamento assíncrono de pedidos
- ElastiCache para cache de sessão e catálogo
- RDS com Read Replica para consultas pesadas
- S3 + CloudFront para imagens otimizadas
- Cognito substituindo Clerk para integração nativa AWS

**Trade-offs:**
- ✅ Alta disponibilidade e escalabilidade elástica
- ✅ Desacoplamento de serviços (event-driven)
- ✅ Performance otimizada (cache, CDN, read replicas)
- ✅ Preparado para multi-tenancy
- ❌ Custo significativamente maior (~$350–500/mês)
- ❌ Alta complexidade operacional
- ❌ Curva de aprendizado

---

### 2. Diagrama Arquitetural (C4 — Container Level)

```
Internet
  │
  ▼
[Route 53 - Latency-based routing]
  │
  ▼
[CloudFront CDN - Multi-origin]
  ├──→ [S3 - Static Assets + Imagens]
  └──→ [WAF - Web Application Firewall]
            │
            ▼
       [ALB - Application Load Balancer]
          Multi-AZ (us-east-1a, 1b, 1c)
          │
          ├──→ /api/* → [ECS Fargate: NestJS Backend]
          │               ├── 3 AZs, Min 2 / Max 20 tasks
          │               ├── Target Tracking Auto Scaling (CPU + ReqCount)
          │               └── [ElastiCache Redis: Session Cache]
          │
          └──→ /* → [ECS Fargate: Next.js Frontend]
                      ├── 3 AZs, Min 2 / Max 10 tasks
                      └── Auto Scaling por CPU
  │
  ├──→ [SQS Queue: order-processing]
  │         └── [ECS Fargate: Order Worker] ←── Processa pedidos assíncronos
  │
  ├──→ [SES - Notificações por e-mail]
  │
  ▼
[RDS PostgreSQL r6g.small]
  ├── Primary (escrita) - Multi-AZ
  └── Read Replica (leitura intensiva: dashboard, relatórios)
  │
  ▼
[ECR] ←── [GitHub Actions CI/CD]
  │
  ▼
[Secrets Manager | Parameter Store]
  │
  ▼
[CloudWatch + X-Ray + Container Insights]
  │
  ▼
[Cognito - Auth nativa AWS]
  (migração futura do Clerk)
```

---

### 3. Serviços AWS Utilizados

| Serviço | Uso |
|---------|-----|
| **ECS Fargate** | Orquestração containers frontend, backend e workers |
| **ECR** | Registry de imagens com lifecycle policies |
| **ALB** | Load balancer Multi-AZ, roteamento path-based |
| **CloudFront** | CDN global com WAF integrado |
| **WAF** | Proteção contra SQLi, XSS, rate limiting por IP |
| **RDS PostgreSQL r6g.small** | Primary Multi-AZ + Read Replica |
| **ElastiCache Redis** | Cache de sessão, catálogo e resultados de query |
| **SQS** | Fila de processamento de pedidos (desacoplado) |
| **SES** | Notificações transacionais por e-mail |
| **S3** | Assets, imagens, exports, backups |
| **Secrets Manager** | Credenciais e segredos rotativos |
| **Parameter Store** | Configurações de ambiente por tenant |
| **CloudWatch** | Logs, métricas, dashboards, alarms |
| **X-Ray** | Distributed tracing end-to-end |
| **IAM** | Roles granulares com least privilege |
| **VPC** | 3 AZs, subnets públicas/privadas/dados |
| **Route 53** | DNS com health checks e failover routing |
| **ACM** | Certificados TLS gerenciados |
| **Cognito** | Auth nativa AWS (migração planejada do Clerk) |

---

### 4. Fluxo de Deploy

```
1. Developer → Pull Request → GitHub
2. GitHub Actions - CI Pipeline:
   a. Lint, type-check
   b. Unit tests (NestJS + React)
   c. Integration tests
   d. Security scan (Trivy para imagens)
3. Merge em main → CD Pipeline:
   a. Build imagens multi-stage (otimizadas)
   b. Push → ECR (SHA + latest)
   c. Terraform plan → requer aprovação manual para prod
   d. Terraform apply (infra changes)
   e. ECS Blue/Green Deployment via CodeDeploy
   f. Smoke tests automáticos
   g. Rollback automático se health checks falharem
4. Notificação no Slack + CloudWatch EventBridge
```

---

### 5. Estrutura Terraform

```
infra/
├── modules/
│   ├── network/          # VPC, 3 AZs, NAT Gateways, Flow Logs
│   ├── compute/          # ECS Cluster, Task Defs, Services, Auto Scaling
│   ├── worker/           # ECS Worker Service + SQS consumer
│   ├── loadbalancer/     # ALB, Target Groups, WAF association
│   ├── database/         # RDS Multi-AZ + Read Replica, subnet groups
│   ├── cache/            # ElastiCache Redis cluster
│   ├── messaging/        # SQS queues, DLQ, policies
│   ├── registry/         # ECR + lifecycle policies
│   ├── cdn/              # CloudFront, S3 origins, WAF
│   ├── auth/             # Cognito User Pool (migração planejada)
│   ├── secrets/          # Secrets Manager, Parameter Store
│   └── observability/    # CloudWatch, X-Ray, alarms, dashboards
└── environments/
    ├── dev/
    │   ├── main.tf
    │   └── terraform.tfvars   # Instâncias menores, 1-2 AZs
    └── prod/
        ├── main.tf
        └── terraform.tfvars   # Instâncias maiores, 3 AZs, HA
```

---

### 6. Estratégia de Observabilidade

| Camada | Ferramenta | Detalhe |
|--------|-----------|---------|
| **Logs estruturados** | CloudWatch Logs Insights | JSON structured logs com correlation ID |
| **Métricas de negócio** | CloudWatch Custom Metrics | Pedidos/min, conversão, receita |
| **Container Insights** | CloudWatch Container Insights | ECS task-level CPU, memória, rede |
| **Distributed Tracing** | AWS X-Ray | Trace request → ALB → Backend → RDS → SQS |
| **Cache Hits** | ElastiCache CloudWatch | Hit/Miss ratio, latência |
| **RDS Performance** | Performance Insights | Slow queries, wait events |
| **Dashboards** | CloudWatch Dashboards | Infra + Negócio em um único painel |
| **Alertas** | CloudWatch Alarms → SNS | PagerDuty/Slack para alertas críticos |
| **Synthetics** | CloudWatch Synthetics | Canary a cada 1min em todos endpoints |
| **Audit Trail** | CloudTrail | Rastreabilidade de chamadas de API AWS |

---

### 7. Estratégia de Segurança

| Aspecto | Implementação |
|---------|--------------|
| **WAF** | CloudFront WAF: regras OWASP Top 10, rate limiting, geo-blocking |
| **IAM** | Roles ECS task com scope mínimo; sem long-term credentials |
| **Rede** | 3-tier subnet (pública/privada/dados); Security Groups stateful |
| **Segredos** | Secrets Manager com rotação automática a cada 30 dias |
| **Criptografia** | RDS encrypted at rest (AES-256); ElastiCache in-transit TLS |
| **TLS** | ACM + CloudFront; TLS 1.2+ enforced; HSTS |
| **Auth** | Cognito ou Clerk; JWT RS256; refresh token rotation |
| **RBAC** | Guards NestJS verificando roles (Admin/Customer) por rota |
| **Auditoria** | CloudTrail + tabela de audit_log no PostgreSQL |
| **DDoS** | CloudFront + WAF + Shield Standard (gratuito) |
| **Privacidade** | Dados em repouso criptografados; RDS em subnet privada |

---

### 8. Estimativa de Custos (Mensal)

| Serviço | Configuração | Custo Estimado |
|---------|-------------|---------------|
| ECS Fargate | 3 serviços × 1 vCPU × 2GB, min 2 tasks | ~$80–120 |
| RDS PostgreSQL | r6g.small Multi-AZ + 1 Read Replica | ~$130 |
| ElastiCache Redis | cache.t3.micro, 1 nó | ~$15 |
| ALB | 1 ALB + WAF | ~$25–35 |
| CloudFront | 50GB/mês + WAF | ~$10–20 |
| NAT Gateway | 3 AZs | ~$100 |
| SQS | Baixo volume | ~$1 |
| SES | 1.000 emails/mês | ~$0.10 |
| ECR | 10GB | ~$1 |
| S3 | 50GB + replication | ~$2–5 |
| Secrets Manager | 10 segredos | ~$4 |
| CloudWatch + X-Ray | Full observability | ~$20–30 |
| Route 53 | 1 zone + health checks | ~$3 |
| **Total Estimado** | | **~$390–470/mês** |

---

### 9. Vantagens e Trade-offs

| Critério | Avaliação |
|----------|-----------|
| **Custo** | ⭐⭐ Alto |
| **Complexidade Operacional** | ⭐⭐ Alta (multi-serviço) |
| **Escalabilidade** | ⭐⭐⭐⭐⭐ Elástica e automática |
| **Disponibilidade** | ⭐⭐⭐⭐⭐ 99.9%+ Multi-AZ |
| **Segurança** | ⭐⭐⭐⭐⭐ WAF, rotação de segredos, audit |
| **Manutenção** | ⭐⭐⭐ Requer expertise em AWS |

---

## Comparação Entre Arquiteturas

| Critério | Básica (MVP) | Intermediária (v1.0) | Avançada (Cloud Native) |
|----------|:-----------:|:-------------------:|:----------------------:|
| **Custo mensal** | ~$25–30 | ~$145–170 | ~$390–470 |
| **Disponibilidade** | ~95% (single AZ) | ~99.5% (Multi-AZ) | ~99.9%+ (Multi-AZ 3+ AZs) |
| **Complexidade** | Baixa | Moderada | Alta |
| **Escalabilidade** | Manual (SSH) | Auto scaling (ECS) | Elástica + Workers |
| **Deploy** | docker compose up | ECS rolling update | Blue/Green deployment |
| **Gerenciamento EC2** | Sim (SSH) | Não (Fargate) | Não (Fargate) |
| **Banco de dados** | Single AZ | Multi-AZ | Multi-AZ + Read Replica |
| **Cache** | Não | Não | ElastiCache Redis |
| **Mensageria** | Não | Não | SQS |
| **CDN** | Não | CloudFront | CloudFront + WAF |
| **Segredos** | Env vars | Secrets Manager | Secrets Manager + rotação |
| **Observabilidade** | CloudWatch básico | Container Insights | X-Ray + Container Insights |
| **IaC** | Terraform | Terraform | Terraform |
| **CI/CD** | GitHub Actions | GitHub Actions | GitHub Actions + Blue/Green |
| **Registry** | ECR | ECR | ECR + lifecycle policies |
| **Learner Labs** | ✅ Compatível | ✅ Compatível | ⚠️ Parcialmente (NAT Gateway pode ser limitado) |

---

## Plano de Evolução Incremental

### Fase 1 → Fase 2: Básica para Intermediária

**Quando migrar:** Tráfego crescente, necessidade de zero-downtime deploys, requisito de high availability.

| Componente | Mudança |
|-----------|---------|
| **Compute** | EC2 + Docker Compose → ECS Fargate |
| **Load Balancer** | Nginx no host → ALB gerenciado |
| **CDN** | Sem CDN → CloudFront |
| **Banco** | RDS Single AZ → RDS Multi-AZ |
| **Segredos** | Env vars → Secrets Manager |
| **CI/CD** | SSH deploy → `ecs update-service` |
| **Rede** | VPC simples → NAT Gateway para subnets privadas |

**Passos de Migração:**
1. Provisionar ECS Cluster via Terraform (sem afetar EC2 ativa)
2. Criar Task Definitions apontando para mesmas imagens ECR
3. Subir ECS Services com 0 tasks; testar conectividade com RDS
4. Migrar RDS para Multi-AZ (downtime ~1-2min para failover promotion)
5. Criar ALB e configurar Target Groups
6. Smoke tests no novo ambiente
7. Atualizar Route 53 para apontar para ALB
8. Desligar EC2 após validação (manter por 1 semana como fallback)

---

### Fase 2 → Fase 3: Intermediária para Avançada

**Quando migrar:** Tráfego elevado, multi-tenancy, processamento assíncrono necessário.

| Componente | Mudança |
|-----------|---------|
| **Banco** | RDS t3.small → RDS r6g.small + Read Replica |
| **Cache** | Sem cache → ElastiCache Redis |
| **Mensageria** | Síncrono → SQS + Worker ECS |
| **CDN + Segurança** | CloudFront → CloudFront + WAF |
| **Observabilidade** | Container Insights → X-Ray + Performance Insights |
| **Auth** | Clerk (externo) → AWS Cognito (nativo) [opcional] |
| **Deploy** | Rolling update → Blue/Green (CodeDeploy) |

**Passos de Migração:**
1. Provisionar ElastiCache; integrar cache no NestJS (Redis adapter)
2. Criar SQS queues e Dead Letter Queues
3. Refatorar lógica de pedidos para publicar eventos no SQS
4. Deploy Worker ECS Service consumindo SQS
5. Adicionar Read Replica ao RDS; configurar queries pesadas para replica
6. Ativar WAF no CloudFront; configurar regras OWASP
7. Ativar X-Ray no backend (NestJS AWS X-Ray SDK)
8. Migrar RDS para instância r-series se necessário

---

## Recomendação para o DevAI

Dado o contexto atual do projeto (MVP mono-tenant, equipe pequena, fins educacionais com AWS Learner Labs):

| Momento | Cenário Recomendado |
|---------|-------------------|
| **MVP / Aprendizado** | 🟢 **Cenário 1 — Básico** |
| **Versão 1.0 / Produção** | 🟡 **Cenário 2 — Intermediário** |
| **Crescimento / Multi-tenant** | 🔴 **Cenário 3 — Avançado** |

> **Stack Futura documentada em `spec_tech.md`** já prevê migração para: AWS RDS PostgreSQL, AWS EKS (poderia ser ECS Fargate), AWS Cognito, AWS SQS, AWS SES e AWS CloudWatch — alinhados diretamente com os Cenários 2 e 3 desta análise.
