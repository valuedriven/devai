# Arquitetura de Software

## Contexto Arquitetural

### Objetivo

Este documento define a arquitetura de software do produto e-micro-commerce, estabelecendo diretrizes técnicas, restrições arquiteturais e requisitos não funcionais para implementação por equipes humanas e agentes de inteligência artificial.

### Escopo

A arquitetura contempla:

* Frontend Web
* Backend NestJS
* Banco de Dados PostgreSQL
* Infraestrutura baseada em containers
* Segurança, observabilidade e qualidade de software

### Arquitetura de Referência

* Estilo arquitetural: Aplicação Web com Backend desacoplado via APIs RESTful
* Comunicação: HTTP/HTTPS com payload JSON
* Infraestrutura: Containers compatíveis com OCI
* Observabilidade: OpenTelemetry
* Segurança: OpenID Connect (OIDC) e OAuth 2.0

### Stack Tecnológica

* Frontend:

  * TypeScript
  * Next.js 16+
  * App Router
  * Vanilla CSS

* Backend:

  * TypeScript
  * Node.js 24+
  * NestJS 11+
  * Prisma 7+

* Banco de Dados:

  * PostgreSQL 15+

* Observabilidade:

  * Grafana Cloud

* Identidade:

  * Clerk

* Desenvolvimento:

  * Google Antigravity
  * npm Workspaces
  * Docker

* DevOps:

  * Terraform
  * GitHub Actions

### Estrutura do Monorepo

```text
apps/
 ├── frontend/
       └── src/
            └── app/
            └── components/
            └── features/
            └── services/
            └── hooks/
            └── types/
 └── backend/
       └── src/
            └── /core/
                  ├── auth/
                  ├── database/
                  ├── observability/
                  └── audit/
            └── /modules/
                   ├── catalog/
                   ├── orders/
                   └── customers/
infra/
docs/
.env
```
---

## Adequação Funcional

### Backend como Fonte Única de Verdade

* Toda regra de negócio deve residir exclusivamente no backend NestJS.
* O backend é a única fonte de verdade do sistema.

### Política Backend for Frontend

Toda comunicação de negócio deve ocorrer através das APIs do backend NestJS.

É proibido:

* acesso direto ao PostgreSQL
* acesso direto ao Prisma
* acesso direto ao Supabase
* acesso direto a recursos administrativos

### APIs e Versionamento

Base URL:

```text
https://api.dominio.com/v1
```

Versionamento:

```text
/v1/recurso/id
```

### Endpoints Públicos

* Catálogo
* Produtos ativos

### Endpoints Protegidos

* Pedidos
* Administração
* Dashboards

### Contrato de API

- Backend expõe contratos HTTP versionados.
- APIs seguem semântica REST.
- Payloads JSON.
- Versionamento obrigatório.
- Paginação obrigatória para coleções.
- Filtros, ordenação e pesquisa textual são suportados quando aplicáveis.
- Backend é a única fonte de verdade.
- Nenhuma regra de negócio pode existir no frontend.

A definição detalhada dos endpoints será mantida em OpenAPI.

---


### Estratégia de Tenancy

- MVP
Sem tenancy

- Evolução futura

Existe tenant_id
Banco compartilhado com schemas separados por tenant

---

## Eficiência de Desempenho

### Comunicação entre Componentes

* Comunicação via APIs REST
* Payloads JSON
* HTTPS obrigatório

### Rate Limiting

* 100 requisições por minuto por IP
* 1000 requisições por minuto por usuário autenticado

### Transações e Persistência

* Utilizar transações Prisma para operações atômicas

### Estratégias Futuras de Escalabilidade

- Serviço gerenciado PostgreSQL
- Orquestrador Kubernetes
- Fila assíncrona
- Serviço de observabilidade
- Provedor de identidade
- Serviço de e-mail
- Armazenamento de objetos
---

## Compatibilidade

### Integração via APIs REST

* Comunicação baseada em HTTP/HTTPS
* APIs RESTful

### Formatos de Comunicação

* JSON como formato padrão de integração

### Versionamento de APIs

* Versionamento obrigatório via URI

### CORS

* Whitelist explícita de origens permitidas

### Portabilidade entre Provedores PostgreSQL

* É proibido utilizar recursos específicos de fornecedores SaaS
* A aplicação deve permanecer portável entre provedores PostgreSQL

---

## Usabilidade

### Diretrizes Frontend

* As páginas não devem conter regras de negócio
* Toda integração com APIs deve ocorrer através da camada services
* Componentes devem permanecer desacoplados da infraestrutura

### Experiência de Autenticação

Toda experiência visual deve ser implementada utilizando componentes próprios da aplicação.

### Consistência de Interfaces

Server Actions podem ser utilizadas apenas como camada de transporte.

Restrições:

* Não conter regras de negócio
* Não acessar banco de dados
* Não acessar Prisma
* Não acessar serviços protegidos

---

## Confiabilidade

### Tratamento de Erros

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

### Auditoria

Toda operação de Create, Update ou Delete em entidades críticas deve gerar auditoria.

Campos obrigatórios:

* Usuário
* Objeto
* Ação
* Payload
* Timestamp

### Migrations

Toda alteração em banco de dados deve gerar migration Prisma versionada.

É proibido:

* alterar tabelas manualmente
* alterar schema sem migration correspondente

### Testes Automatizados

Ferramentas:

* Lint: ESLint
* Unidade: Jest
* Integração: Jest + Supertest
* E2E: Playwright

### Cobertura Mínima

Backend:

* Linhas: 80%
* Branches: 80%

Frontend:

* Linhas: 70%
* Branches: 70%

### Critérios de Teste

Toda alteração de regra de negócio exige testes.

Devem ser cobertos:

* Happy Path
* Sad Path
* Edge Cases

---

## Segurança

### Princípios Gerais

* O frontend não implementa autenticação
* O frontend não implementa autorização
* O frontend não implementa gerenciamento de credenciais
* Toda decisão de autorização é responsabilidade exclusiva do backend

### Gestão de Identidade

Responsabilidades do provedor de identidade:

* Login
* Logout
* Recuperação de senha
* MFA
* Gestão de sessão

### Autenticação

#### Fluxo de autenticação

Frontend:
- Exibe formulários próprios

Backend:
- Atua como BFF
- Consome APIs do Clerk

Clerk:
- Responsável pela autenticação primária

Fluxo:
Frontend -> Backend -> Clerk

O backend:

* Integra-se ao provedor de identidade
* Valida tokens
* Executa sincronização de usuários

### Autorização e RBAC

- A autorização é responsabilidade exclusiva do backend
- Roles são armazenadas no provedor de identidade
- Guards e Decorators do NestJS devem proteger recursos e mutações

### Papéis e Permissões

#### ADMIN

Pode:

- Gerenciar categorias
- Gerenciar produtos
- Gerenciar clientes
- Gerenciar pedidos
- Registrar pagamentos
- Visualizar dashboard

#### CUSTOMER

Pode:

- Criar pedido
- Consultar seus próprios pedidos
- Cancelar pedido não pago

- Todo cliente corresponde a um usuário autenticado.
- A autenticação é gerenciada pelo provedor de identidade.

A consulta do catálogo pode ser feita por qualquer usuário não logado.


### Restrições do Frontend

É proibida a utilização:

* dos SDKs oficiais do Clerk
* dos componentes oficiais do Clerk

Incluindo:

* SignIn
* SignUp
* UserProfile
* UserButton
* equivalentes

### Proteção Contra Ameaças

Transporte:

* HTTPS obrigatório
* TLS 1.2+

Headers obrigatórios:

* CSP
* HSTS
* X-Content-Type-Options: nosniff

SQL Injection:

* Proibido uso de raw queries
* Utilizar Prisma com parâmetros

IDOR:

* Validar propriedade dos recursos utilizando identidade autenticada

### Segurança de Dados

O acesso aos dados deve ocorrer exclusivamente através do Prisma ORM.

### Segurança de APIs

* Endpoints protegidos devem exigir autenticação
* Autorização obrigatória no backend

---

## Manutenibilidade

### Organização de Código

Seguir convenções oficiais do NestJS.

### Convenções de Desenvolvimento

* Utilizar DTOs com class-validator
* Aplicar SOLID
* Aplicar Clean Architecture
* Decorar APIs para Swagger/OpenAPI

### Variáveis de Ambiente

* Utilizar apenas um arquivo `.env` na raiz do projeto
* Frontend e backend devem consumir o mesmo arquivo

É proibido:

* criar `.env.local`
* criar `.env` em módulos
* utilizar links simbólicos para arquivos de ambiente

### Diretrizes para Agentes de IA

Antes de qualquer alteração:

* Ler esta especificação integralmente
* Verificar impacto arquitetural
* Verificar impacto em autenticação
* Verificar impacto em autorização
* Verificar impacto em observabilidade
* Verificar impacto em testes

Ao finalizar:

* Executar lint
* Executar testes unitários
* Executar testes de integração afetados
* Atualizar documentação afetada
* Informar arquivos modificados

### Restrições Arquiteturais

* Não criar novas dependências sem justificativa
* Não alterar arquitetura definida
* Não duplicar lógica de negócio
* Não implementar autenticação própria
* Não acessar banco diretamente pelo frontend
* Não remover testes existentes

---

## Portabilidade

### Containers

* Todos os componentes devem ser compatíveis com OCI

### Banco de Dados

Ambiente local:

* PostgreSQL executado via Docker ou Docker Compose

Ambiente de produção:

* PostgreSQL fornecido por serviços gerenciados

Exemplos:

* Supabase
* AWS RDS

### Independência de Fornecedor

* Não utilizar extensões específicas de provedores
* Garantir compatibilidade PostgreSQL padrão

### Infraestrutura

Infraestrutura declarada através de Terraform.

---

## Observabilidade

### OpenTelemetry

Todo endpoint HTTP deve gerar traces OpenTelemetry.

Devem ser propagados:

* trace_id
* span_id
* request_id

### Tracing Distribuído

Logs, métricas e traces devem compartilhar o mesmo correlation id.

### Logs Estruturados

É proibido utilizar:

```ts
console.log()
```

Utilizar exclusivamente logging estruturado.

Campos mínimos:

* timestamp
* level
* service
* trace_id
* user_id

### Métricas

Toda instrumentação deve ser compatível com OpenTelemetry e Grafana Cloud.

---

## Evolução Planejada

### Infraestrutura

- Serviço gerenciado PostgreSQL
- Orquestrador Kubernetes
- Provedor de identidade
- Serviço de mensageria assíncrona
- Serviço de e-mail
- Plataforma de observabilidade

### Mídia

- Armazenamento de objetos compatível com S3

### Pagamentos

* Gateway de pagamento real

### Comunicação

* E-mail
* WhatsApp

### Plataformas

* Aplicativo mobile

### Funcionalidades Operacionais

* Cupons
* Importação CSV
* Relatórios PDF
* Relatórios Excel


## Limites de Implementação do MVP

É proibido implementar:

- Multi-tenancy
- Feature flags para tenancy
- Interfaces TenantProvider
- TenantContext
- TenantMiddleware
- tenant_id
- Banco por tenant
- Schema por tenant

Esses elementos pertencem exclusivamente a versões futuras.


