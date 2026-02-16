# Especificação Técnica

## 1. Visão Geral Técnica

Este documento descreve como os requisitos não funcionais do produto e-micro-commerce serão implementados, fornecendo diretrizes de arquitetura e stack tecnológica para desenvolvimento assistido por IA e implementação humana.

---

## 2. Arquitetura de Referência

- **Estilo arquitetural:** aplicação web com backend desacoplado via APIs RESTful.
- **Componentes principais:** Frontend Web, Backend de Aplicação e Banco de Dados.
- **Serviço de observabilidade:** aderente ao padrão OpenTelemetry (backend e frontend).
- **Serviço de segurança:** aderente aos padrões OpenID Connect e OAuth 2.0.
- **Comunicação:** HTTP/HTTPS com payloads JSON.
- **Infraestrutura:** utilização de contêineres no padrão OCI.

---

## 3. Stack Tecnológica Recomendada

### Stack Base

- **Frontend:** Next.js 16+ (App Router).
- **Backend:** NestJS 11+; API RESTful.
- **Persistência:** PostgreSQL 15+.
- **ORM:** Prisma 5+.

### Integrações

- **Pipeline CI/CD:** GitHub Actions.
- **Persistência:** Supabase.
- **Deployment:** Vercel.
- **Segurança (autenticação e autorização):** Clerk.
- **Notificações:** Resender.
- **Observabilidade:** Grafana Cloud.

### Integrações - Stack Futura

- **Persistência:** AWS RDS PostgreSQL.
- **Deployment:** AWS EKS (Kubernetes) com Terraform.
- **Segurança (autenticação e autorização):** AWS Cognito.
- **Mensagens:** AWS SQS.
- **Notificações:** AWS SES.
- **Observabilidade:** AWS Cloudwatch.


---

### 4. Segurança

- Mecanismo de autenticação: JWT Authentication
- Algoritmo: RS256 ou ES256 para assinatura
- Access Token: 15 minutos
- Refresh token: 7 dias.
- Rotação: Emitir novo refresh token a cada uso
- Armazenamento: HttpOnly cookies (seguro, SameSite=strict)
- Validação: Cada requisito deve validar a assinatura, exp (expiration), iss (issuer) e aud (audience)
- O processo de autenticação será realizado via frontend, com validação de tokens no backend por meio de middleware/guards.

---

### 5. Auditoria

- Todas as tabelas de banco de dados deverão ter registro de data de criação e data de atualização.
- Todos eventos de atualiação de dados deverão ter registro incluindo usuário, objeto, ação, data e hora.

---

## 6. APIs

- Endpoint principal: (<https://api.dominio.com/v1/>).
- Versionamento: URI path versioning (ex: /v1/products).
- Padrão de nomenclatura: /v1/{resource}/{id}.
- Autenticação: Bearer JWT no header `Authorization`.
- Rate limiting: 100 requisições/minuto por IP, 1000 requisições/minuto por usuário autenticado.
- CORS: Permitir apenas origens whitelist (domínios do tenant).
- Endpoints públicos: vitrine, produtos ativos.
- Endpoints protegidos: pedidos, gestão, dashboard.

---

## 7. Tenancy

- **Estratégia:** Banco de dados compartilhado com schema separado por tenant.
- **Isolamento:** Cada tenant possui schema próprio (ex: `tenant_abc123`).
- **Identificação:** Tenant ID extraído do subdomain (`tenant.dominio.com`) ou header `X-Tenant-ID`.
- **Migrações:** Prisma migrations devem ser executadas para todos os schemas ativos.
- **Segurança:** Row Level Security (RLS) habilitado em todas as tabelas, filtrando automaticamente pelo tenant_id.

MVP mono-tenant com evolução planejada

---

## 8. Diretrizes para Desenvolvimento Assistido por IA

- Respeitar padrões definidos neste documento.
- Gerar código compatível com a arquitetura descrita.
- Seguir padrões de código do NestJS (controllers, services, repositories, DTOs).
- Utilizar interceptors para tenant resolution e logging.
- Implementar guards para autorização baseada em roles (Admin/Customer).
- Utilizar transactions para operações que envolvem múltiplas tabelas (ex: criar pedido + itens).
- Seguir princípios SOLID e Clean Architecture.
- Documentar APIs com Swagger/OpenAPI.

--

## 9. Evolução Futura

- Upload de imagens via Storage (S3/R2) - *Atualmente apenas URL*.
- Integração real com gateway de pagamentos (Stripe, Pagar.me).
- Notificações por e-mail (SendGrid) e WhatsApp (Twilio).
- Aplicativo mobile nativo (React Native/Flutter).
- Relatórios avançados (exportação PDF/Excel).
- Importação em massa de produtos (CSV/Excel).
- Sistema de cupons e descontos..
