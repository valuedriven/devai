# Especificação Técnica

## Visão Geral

Este documento descreve como os requisitos não funcionais do produto e-micro-commerce serão implementados, fornecendo diretrizes de arquitetura, segurança, observabilidade e geração de código para desenvolvimento assistido por IA e implementação humana.

---

# Domínios e Entidades

| Domínio  | Entidade       | Atributos Principais                                                                                 |
| -------- | -------------- | ---------------------------------------------------------------------------------------------------- |
| Catálogo | Categoria      | Nome, Ativo                                                                                          |
| Catálogo | Produto        | Nome, Categoria, Imagem, Descrição, Estoque, Ativo                                                   |
| Pedidos  | Pedido         | Número, Valor Total, ID Cliente, Endereço de Entrega, Status, Data de Pagamento, Método de Pagamento |
| Pedidos  | Item de Pedido | ID Pedido, ID Produto, Preço Unitário, Quantidade                                                    |
| Clientes | Cliente        | Nome, Endereço, E-mail, Telefone, Ativo                                                              |

## Regras de Negócio: Pedidos

### Status Possíveis

* Novo
* Pago
* Preparação
* Faturado
* Despachado
* Entregue
* Cancelado

### Métodos de Pagamento

* Cartão de Crédito
* Cartão de Débito
* Pix
* Dinheiro

### Fluxo de Status

```text
Novo → Pago → Preparação → Faturado → Despachado → Entregue
```

### Cancelamento

A transição para Cancelado é permitida a partir de qualquer estado, exceto quando o pedido estiver Entregue ou Cancelado.

---

# Arquitetura de Referência

* Estilo arquitetural: Aplicação Web com Backend desacoplado via APIs RESTful.
* Componentes principais:

  * Frontend Web
  * Backend NestJS
  * Banco de Dados PostgreSQL
* Comunicação: HTTP/HTTPS com payload JSON.
* Infraestrutura: Containers compatíveis com OCI.
* Observabilidade: OpenTelemetry.
* Segurança: OpenID Connect (OIDC) e OAuth 2.0.

---

# Stack Tecnológica

| Camada          | Tecnologia                                       |
| --------------- | ------------------------------------------------ |
| Frontend        | TypeScript, Next.js 16+, App Router, Vanilla CSS |
| Backend         | TypeScript, Node.js 24+, NestJS 11+, Prisma 7+   |
| Banco de Dados  | PostgreSQL 15+                                   |
| Observabilidade | Grafana Cloud                                    |
| Identidade      | Clerk                                            |
| Desenvolvimento | Google Antigravity, npm Workspaces, Docker       |
| DevOps          | Terraform, GitHub Actions                        |

## Persistência

O banco de dados oficial da aplicação é PostgreSQL.

### Ambiente Local

* PostgreSQL executado via Docker ou Docker Compose.

### Ambiente de Produção

* PostgreSQL fornecido por serviços gerenciados (Supabase, AWS RDS ou equivalentes).

### Variáveis de Ambiente

* Tanto o módulo frontend quanto o backend devem sempre ler as variáveis de ambiente a partir do único arquivo `.env` localizado no diretório raiz do projeto.
* É estritamente proibido criar arquivos `.env`, `.env.local` ou links simbólicos apontando para arquivos `.env` em quaisquer subpastas ou diretórios de módulos do workspace (como `apps/frontend/` ou `apps/backend/`).
* As variáveis de ambiente devem ser carregadas de forma programática a partir da raiz (por exemplo, utilizando `process.loadEnvFile` no `next.config.ts` do Next.js, ou o `ConfigModule` do NestJS com o caminho do `envFilePath` resolvido para o diretório raiz).

---

### Restrições

* É proibido utilizar recursos específicos de qualquer fornecedor SaaS.
* O acesso aos dados deve ocorrer exclusivamente através do Prisma ORM.
* A aplicação deve permanecer portável entre provedores PostgreSQL.

---

# Estrutura do Monorepo

```text
apps/
 ├── frontend/
 └── backend/

infra/
docs/
```

---

# Estrutura Backend

```text
apps/backend/src

modules/
 ├── catalog/
 ├── orders/
 └── customers/

shared/
 ├── auth/
 ├── database/
 ├── observability/
 └── audit/
```

Cada módulo deve conter:

```text
controller/
service/
repository/
dto/
entity/
tests/
```

---

# Estrutura Frontend

```text
apps/frontend/src

app/
components/
features/
services/
hooks/
types/
```

### Regras

* As páginas não devem conter regras de negócio.
* Toda integração com APIs deve ocorrer através da camada services.
* Componentes devem permanecer desacoplados da infraestrutura.

---

# Diretrizes de Testes e Qualidade

| Tipo       | Ferramenta       |
| ---------- | ---------------- |
| Lint       | ESLint           |
| Unidade    | Jest             |
| Integração | Jest + Supertest |
| E2E        | Playwright       |

## Cobertura Mínima

### Backend

* Linhas: 80%
* Branches: 80%

### Frontend

* Linhas: 70%
* Branches: 70%

## Regras

* Toda alteração de regra de negócio exige testes.
* Devem ser cobertos:

  * Happy Path
  * Sad Path
  * Edge Cases

---

# Segurança, Autenticação e Autorização

## Gestão de Identidade (Clerk)

### Responsabilidade do IdP

* Login
* Logout
* Recuperação de senha
* MFA
* Gestão de sessão

### Restrições do Frontend

* É proibida a utilização dos SDKs oficiais do Clerk.
* É proibida a utilização dos componentes oficiais do Clerk:

  * SignIn
  * SignUp
  * UserProfile
  * UserButton
  * equivalentes

Toda experiência visual deve ser implementada utilizando componentes próprios da aplicação.

### Responsabilidades do Frontend

O frontend:

* Não implementa autenticação.
* Não implementa autorização.
* Não implementa gerenciamento de credenciais.
* Atua apenas como intermediário entre navegador e backend.

### Responsabilidades do Backend

O backend:

* Integra-se ao provedor de identidade.
* Valida tokens.
* Executa sincronização de usuários.
* Executa autorização.

Toda decisão de autorização é responsabilidade exclusiva do backend.

---

# Regras para Next.js

## Server Actions

Server Actions podem ser utilizadas apenas como camada de transporte.

Restrições:

* Não conter regras de negócio.
* Não acessar banco de dados.
* Não acessar Prisma.
* Não acessar serviços protegidos.

Toda regra de negócio deve residir exclusivamente no backend NestJS.

---

# Política Backend for Frontend

Toda comunicação de negócio deve ocorrer através das APIs do backend NestJS.

É proibido:

* acesso direto ao PostgreSQL
* acesso direto ao Prisma
* acesso direto ao Supabase
* acesso direto a recursos administrativos

O backend é a única fonte de verdade do sistema.

---

# Autorização e RBAC

* A autorização é responsabilidade exclusiva do backend.
* Roles são armazenadas no provedor de identidade.
* Guards e Decorators do NestJS devem proteger recursos e mutações.

---

# Proteção Contra Ameaças

## Transporte

* HTTPS obrigatório
* TLS 1.2+

## Headers

* CSP
* HSTS
* X-Content-Type-Options: nosniff

## Rate Limiting

* 100 requisições/minuto por IP
* 1000 requisições/minuto por usuário autenticado

## SQL Injection

* Proibido uso de raw queries.
* Utilizar Prisma com parâmetros.

## IDOR

Validar propriedade dos recursos utilizando identidade autenticada.

---

# Observabilidade

## OpenTelemetry

Todo endpoint HTTP deve gerar traces OpenTelemetry.

Devem ser propagados:

* trace_id
* span_id
* request_id

Logs, métricas e traces devem compartilhar o mesmo correlation id.

---

# Política de Logs

É proibido utilizar:

```ts
console.log()
```

em código de produção.

Utilizar exclusivamente logging estruturado.

Campos mínimos:

* timestamp
* level
* service
* trace_id
* user_id

---

# Tratamento de Erros

Todos os erros expostos pela API devem seguir RFC 9457 Problem Details.

Formato:

```json
{
  "type": "...",
  "title": "...",
  "status": 400,
  "detail": "...",
  "instance": "..."
}
```

---

# Banco de Dados

## Metadados Obrigatórios

Todas as tabelas devem conter:

| Campo      | Tipo                     |
| ---------- | ------------------------ |
| created_at | TIMESTAMP WITH TIME ZONE |
| updated_at | TIMESTAMP WITH TIME ZONE |

---

## Migrations

Toda alteração em banco de dados deve gerar migration Prisma versionada.

É proibido:

* alterar tabelas manualmente
* alterar schema sem migration correspondente

---

# Auditoria

Toda operação de Create, Update ou Delete em entidades críticas deve gerar auditoria.

Campos obrigatórios:

* Usuário
* Objeto
* Ação
* Payload
* Timestamp

---

# APIs

## Base URL

```text
https://api.dominio.com/v1
```

## Versionamento

```text
/v1/recurso/id
```

## CORS

Whitelist explícita.

## Endpoints Públicos

* Catálogo
* Produtos ativos

## Endpoints Protegidos

* Pedidos
* Administração
* Dashboards

---

# Estratégia de Tenancy

## MVP

* Operação exclusivamente mono-tenant.
* Nenhuma lógica de tenant deve ser implementada.
* Apenas abstrações mínimas podem ser criadas para futura evolução.

## Evolução Futura

Banco compartilhado com schemas separados por tenant.

---

# Diretrizes de Desenvolvimento

1. Seguir convenções oficiais do NestJS.
2. Utilizar DTOs com class-validator.
3. Utilizar transações Prisma para operações atômicas.
4. Aplicar SOLID.
5. Aplicar Clean Architecture.
6. Decorar APIs para Swagger/OpenAPI.

---

# Regras Operacionais para Agentes de IA

## Antes de qualquer alteração

1. Ler esta especificação integralmente.
2. Verificar impacto arquitetural.
3. Verificar impacto em autenticação.
4. Verificar impacto em autorização.
5. Verificar impacto em observabilidade.
6. Verificar impacto em testes.

## Ao finalizar

1. Executar lint.
2. Executar testes unitários.
3. Executar testes de integração afetados.
4. Atualizar documentação afetada.
5. Informar arquivos modificados.

## Restrições

* Não criar novas dependências sem justificativa.
* Não alterar arquitetura definida.
* Não duplicar lógica de negócio.
* Não implementar autenticação própria.
* Não acessar banco diretamente pelo frontend.
* Não remover testes existentes.

---

# Evolução Futura Planejada

## Infraestrutura

* AWS RDS
* EKS
* Cognito
* SQS
* SES
* CloudWatch

## Mídia

* Upload direto para S3 ou R2

## Pagamentos

* Gateway de pagamento real

## Comunicação

* E-mail
* WhatsApp

## Plataformas

* Aplicativo mobile

## Operacional

* Cupons
* Importação CSV
* Relatórios PDF
* Relatórios Excel

