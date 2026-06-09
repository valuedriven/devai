# Especificação Técnica

## Visão Geral Técnica

Este documento descreve como os requisitos não funcionais do produto e-micro-commerce serão implementados, fornecendo diretrizes de arquitetura e stack tecnológica para desenvolvimento assistido por IA e implementação humana.

---

## Domínios e Entidades

### Domínio Catálogo

#### Entidades

- Categoria: Nome da Categoria, Ativo.
- Produto: Nome do Produto, Categoria, Imagem, Descrição, Estoque, Ativo.

### Domínio Pedidos

#### Entidades

- Pedido: Número do Pedido, Valor Total, Identificação do Cliente, Endereço de entrega, Status do Pedido, Data de pagamento, Método de pagamento.
- Item de Pedido: Identificação do Pedido, Identificação do Produto, Preço Unitário, Quantidade.

#### Detalhes

- Status do Pedido: Novo, Pago, Preparação, Faturado, Despachado, Entregue, Cancelado.
- Métodos de Pagamento: Cartão de Crédito, Cartão de Débito, Pix, Dinheiro.

**Regras de Transição do Status do Pedido:**
- `Novo` → `Cancelado` (permitido)
- `Novo` → `Pago` → `Preparação` → `Faturado` → `Despachado` → `Entregue` (sequencial)
- Qualquer estado (exceto `Entregue` e `Cancelado`) → `Cancelado` (permitido)


### Domínio Clientes

#### Entidades

- Cliente: Nome do cliente, Endereço, e-mail, Telefone, Ativo.

## Arquitetura de Referência

- **Estilo arquitetural:** aplicação web com backend desacoplado via APIs RESTful.
- **Componentes principais:** Frontend Web, Backend de Aplicação e Banco de Dados.
- **Serviço de observabilidade:** aderente ao padrão OpenTelemetry (backend e frontend).
- **Serviço de segurança:** aderente aos padrões OpenID Connect e OAuth 2.0.
- **Comunicação:** HTTP/HTTPS com payloads JSON.
- **Infraestrutura:** utilização de contêineres no padrão OCI.

---

## Stack Tecnológica

### Frontend

- **Linguagem**: TypeScript
- **Framework web**: Next.js 16+ (App Router)
- **EStilização**: Vanila CSS

### Backend

- **Linguagem**: TypeScript
- **Runtime**: Node 24+
- **Framework**: NestJS 11+
- **Persistência**: PostgreSQL 15+
- **ORM**: Prisma 7+

### Stack de Desenvolvimento

- **IDE:** Google Antigravity.
- **Gerenciamento de pacotes:** npm 10+.
- **Ambiente de desenvolvimento local:** Docker; Docker Compose.
- **Infraestrutura como Código (IaC):** Terraform.
- **Pipeline CI/CD:** GitHub Actions.

### Repositório

- **Estrutura**: monorepo
- **Gerenciamento de workspaces**: npm workspaces
- **Diretórios**: apps/frontend/, apps/backend/, infra/, docs/

### Testes

- **Unidade**: jest
- **Integração**: jest+supertest
- **E2E**: playwright

### Integrações

- **Persistência:** Supabase.
- **Deployment:** Vercel.
- **Segurança (autenticação e autorização):** Clerk.
- **Observabilidade:** Grafana Cloud.

### Integrações - Stack Futura

- **Persistência:** AWS RDS PostgreSQL.
- **Deployment:** AWS EKS.
- **Segurança (autenticação e autorização):** AWS Cognito.
- **Mensageria:** AWS SQS.
- **Notificações:** AWS SES.
- **Observabilidade:** AWS Cloudwatch.

---

# Especificação Técnica: Segurança e Auditoria

Este documento define os padrões de implementação para os módulos de segurança e rastreabilidade do sistema. Deve ser utilizado como guia de contexto para geração de código, middlewares e esquemas de banco de dados.

---

## Segurança e Autenticação

### Autenticação

- O sistema utiliza um provedor externo de identidade (Clerk).
- Todo processo de login, logout, recuperação de senha, MFA e gestão de sessão é responsabilidade exclusiva do provedor de identidade.
- O frontend não implementa lógica de autenticação.
- O frontend apenas encaminha credenciais para o provedor de identidade.
- O backend valida tokens emitidos pelo provedor utilizando OpenID Connect (OIDC).
- Não é permitido implementar autenticação própria baseada em JWT customizado.

### Autorização

- A autorização é responsabilidade exclusiva do backend.
- Roles são armazenadas localmente na aplicação.
- O token de identidade é utilizado apenas para autenticação.
- Permissões de negócio são avaliadas pelo backend através de Guards.

## Sincronização de Usuários

- O backend é responsável pela sincronização dos usuários do provedor de identidade.
- Eventos de criação, atualização e exclusão devem ser analisados pela lógica do backend, sem uso de Webhooks.
- O usuário local deve manter referência ao identificador externo do provedor.
- O frontend não acessa diretamente informações de usuários do provedor.

### Diretriz Arquitetural

- É proibida a utilizaão de componentes de autenticação providos pelo serviço de autenticação.
- É proibida a replicação de fluxos de login, logout, recuperação de senha ou cadastro no frontend.
- Devem ser utilizados exclusivamente os componentes oficiais disponibilizados pelo provedor de identidade.
- O frontend não possui regras de autenticação ou autorização.


### Proteção de Dados e Infraestrutura

- **Hashing de Senhas:** Utilizar algoritmos resistentes a GPU (ex: **Argon2id** ou **bcrypt** com salt robusto).
- **Camada de Transporte:** Comunicação exclusiva via **HTTPS (TLS 1.2+)**.
- **Rate Limiting:** Limitação de tentativas por IP em endpoints sensíveis (`/login`, `/register`, `/forgot-password`).
- **Prevenção de Injeção:** Proibido o uso de queries brutas (raw queries). Utilizar exclusivamente **Parameterized Queries** via ORM/Query Builder.
- **Headers de Segurança:** Implementação de `Content-Security-Policy` (CSP), `X-Content-Type-Options: nosniff` e `Strict-Transport-Security` (HSTS).

---

### Controle de Acesso (RBAC & IDOR)

- **Modelo de Autorização:** Baseado em funções (**Role-Based Access Control**). As permissões devem ser verificadas via Guards/Decorators antes da execução da lógica de negócio.
- **Prevenção de IDOR (Insecure Direct Object Reference):** Validação de propriedade obrigatória. O sistema deve garantir que o `user_id` extraído do token JWT tenha permissão explícita para acessar ou modificar o recurso (ID) solicitado na requisição.

---

### Auditoria e Observabilidade

#### Esquema de Banco de Dados

Todas as tabelas do sistema devem conter os seguintes metadados de ciclo de vida:

| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `created_at` | `TIMESTAMP WITH TIME ZONE` | Data de criação (default: `now()`). |
| `updated_at` | `TIMESTAMP WITH TIME ZONE` | Data da última modificação (atualizada via trigger). |

### Log de Eventos de Dados

Toda operação de mutação (Create, Update, Delete) em entidades críticas deve gerar um registro de auditoria.

- **Estrutura do Registro de Auditoria:**
    * **Usuário:** ID do ator da ação (recuperado do contexto da requisição).
    * **Objeto:** Identificador da entidade e ID do registro afetado.
    * **Ação:** Tipo da operação (ex: `UPDATE_USER_PROFILE`, `DELETE_ORDER`).
    * **Payload (Diff):** Snapshot dos dados alterados (opcional, dependendo da criticidade).
    * **Timestamp:** Data e hora exata da transação.
- **Implementação:** Preferencialmente via Interceptors ou Hooks de Ciclo de Vida do ORM para garantir que a auditoria ocorra de forma transparente.

---

## APIs

- Endpoint principal: (<https://api.dominio.com/v1/>).
- Versionamento: URI path versioning (ex: /v1/products).
- Padrão de nomenclatura: /v1/{resource}/{id}.
- Autenticação: Bearer JWT no header `Authorization`.
- Rate limiting: 100 requisições/minuto por IP, 1000 requisições/minuto por usuário autenticado.
- CORS: Permitir apenas origens whitelist (domínios do tenant).
- Endpoints públicos: vitrine, produtos ativos.
- Endpoints protegidos: pedidos, gestão, dashboard.

---

## Tenancy

- **Estratégia:** Banco de dados compartilhado com schema separado por tenant.
- **Isolamento:** Cada tenant possui schema próprio (ex: `tenant_abc123`).
- **Identificação:** Tenant ID extraído exclusivamente do contexto autenticado do usuário ou do subdomínio. O sistema não deve confiar em headers enviados pelo cliente para definição de tenant..
- **Migrações:** Prisma migrations devem ser executadas para todos os schemas ativos.

MVP mono-tenant com evolução planejada

---

## Diretrizes para Desenvolvimento Assistido por IA

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

