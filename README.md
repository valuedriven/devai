# DevAI - Gestão Inteligente para Microempreendedores

O **DevAI** é uma plataforma monorepo estruturada para oferecer controle total sobre pedidos, clientes e catálogo de produtos para microempreendedores. Com uma vitrine digital para clientes e um painel administrativo robusto, o DevAI elimina a desorganização financeira e operacional.

---

## 🏗️ Estrutura do Projeto

Este repositório utiliza **npm workspaces** para gerenciar as aplicações de forma integrada:

```text
devai/
├── apps/
│   ├── frontend/       # Next.js 16.1 (App Router, React 19, Vanilla CSS)
│   └── backend/        # NestJS 11 (Prisma ORM, PostgreSQL)
├── docs/               # Documentação (PRD, Spec Técnica, Design System)
├── .agent/             # Skills e Workflows para agentes de IA
├── docker-compose.yml  # Orquestração de serviços locais (DB, API, Web)
└── package.json        # Configuração de workspaces e scripts globais
```

---

## 🛠️ Stack Tecnológica

### Frontend (`apps/frontend`)
- **Framework:** [Next.js 16.1+](https://nextjs.org/) (App Router)
- **Biblioteca UI:** [React 19](https://react.dev/)
- **Estilização:** Vanilla CSS (Design System semântico)
- **Iconografia:** Lucide React
- **Estado/Utilitários:** clsx

### Backend (`apps/backend`)
- **Framework:** [NestJS 11+](https://nestjs.com/)
- **ORM:** [Prisma 7.5.0](https://www.prisma.io/)
- **Banco de Dados:** PostgreSQL 15
- **Autenticação:** [Clerk Auth](https://clerk.com/)
- **Validação:** class-validator & class-transformer

---

## 📋 Módulos do Sistema

### 🛒 Catálogo & Vitrine
- Gestão de categorias e produtos.
- Vitrine digital responsiva para clientes finalizarem pedidos.

### 👥 Gestão de Clientes
- Cadastro e histórico de interações por cliente.
- Associação automática de pedidos à base de clientes.

### 📦 Pedidos (Orders)
- Fluxo completo de status: `Novo`, `Pago`, `Preparação`, `Entregue`.
- Registro de métodos de pagamento e datas de recebimento.

### 🔐 Autenticação & Multi-tenancy
- Integração nativa com Clerk para segurança.
- Estrutura preparada para multi-tenancy via `tenant_id`.

---

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js 24+
- Docker & Docker Compose
- Variáveis de ambiente configuradas (`.env`)

### Setup do Ambiente
1. **Instalar dependências (Raiz):**
   ```bash
   npm install
   ```
2. **Subir Infraestrutura (Docker):**
   ```bash
   docker-compose up -d
   ```
3. **Migrações do Banco de Dados:**
   ```bash
   npm run prisma:generate --workspace=backend
   ```

### Comandos de Desenvolvimento
Na raiz do projeto, você pode usar os scripts mapeados:

- **Frontend:** `npm run dev:frontend`
- **Backend:** `npm run dev:backend`
- **Build Geral:**
  - `npm run build:frontend`
  - `npm run build:backend`

---

## 📄 Documentação Adicional

Para detalhes técnicos e de produto, consulte a pasta `docs/`:
- [Product Requirements Document (PRD)](./docs/prd.md)
- [Especificação Técnica](./docs/spec_tech.md)
- [Design System](./docs/design_system.md)

---

> [!IMPORTANT]
> **Convenções de Código:** Siga rigorosamente as diretrizes em [AGENTS.md](./AGENTS.md) ao realizar contribuições automáticas ou manuais.