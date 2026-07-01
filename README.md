# DevAI - Framework Educacional & E-commerce Orientado por IA

O **DevAI** é um projeto de natureza mista: uma plataforma de e-commerce robusta para microempreendedores e um **framework educacional** projetado para o ensino de engenharia de software moderna utilizando Inteligência Artificial.

Este repositório serve como laboratório para o ciclo completo de desenvolvimento de software, desde a concepção (Discovery) até a entrega contínua (Delivery), utilizando agentes de IA como parceiros de codificação.

---

## 🎓 O Framework de Engenharia (Metodologia)

O projeto segue um fluxo de trabalho rigoroso orientado por especificações (Spec-Driven Development), documentado no diretório [`.fluxo/`](./.fluxo/):

### 1. Discovery (Descoberta)
Focado na redução de ambiguidade e clareza de escopo:
- **Definição do Problema:** [`problem.md`](./docs/problem.md)
- **Refinamento:** [`prd.md`](./docs/prd.md) e [`spec.md`](./docs/spec.md)
- **Arquitetura:** [`architecture.md`](./docs/architecture.md)
- **Design:** Prototipagem via [Stitch](https://stitch.withgoogle.com/) e [`design.md`](./docs/design.md)

### 2. Delivery (Entrega)
Focado na implementação incremental e qualidade automatizada:
- **Spec-Driven Development:** Uso do [`Openspec`](https://openspec.dev/) para gerenciar mudanças.
- **AI Agents:** Automação via Opencode, Antigravity e Claude Code.
- **Verificação Contínua:** Testes E2E gerados e "curados" por agentes de IA usando Playwright.

---

## 🏗️ Estrutura do Projeto

Este repositório utiliza **npm workspaces** para gerenciar as aplicações de forma integrada:

```text
devai/
├── apps/
│   ├── frontend/       # Next.js 16.1 (App Router, React 19, Vanilla CSS)
│   └── backend/        # NestJS 11 (Prisma ORM, PostgreSQL)
├── docs/               # Documentação (PRD, Spec Técnica, Architecture)
├── .fluxo/             # Manuais de Discovery e Delivery (Core Educacional)
├── .agents/            # Skills e Workflows para agentes de IA
├── docker-compose.yml  # Orquestração de serviços locais (DB, API, Web)
└── package.json        # Configuração de workspaces e scripts globais
```

---

## 🛠️ Stack Tecnológica

### Aplicação (O Produto)
- **Frontend:** [Next.js 16.1+](https://nextjs.org/) (App Router), React 19, Vanilla CSS.
- **Backend:** [NestJS 11+](https://nestjs.com/), Prisma 7.5, PostgreSQL 15.
- **Autenticação:** [Clerk Auth](https://clerk.com/) (Multi-tenancy pronto).

### IA & Engenharia (O Framework)
- **Agentes:** Opencode, Antigravity, Claude Code.
- **Orquestração de Specs:** [Openspec](https://openspec.dev/).
- **Documentação Dinâmica:** [Context7 MCP](https://context7.com/) para consulta de documentação atualizada.
- **Design & Prototipagem:** [Stitch](https://stitch.withgoogle.com/).
- **Qualidade:** Playwright (Agentes de teste), SonarQube (Inspeção de código).

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

---

## 🚀 Como Iniciar

### 1. Setup do Desenvolvedor
Siga o [**Roteiro de Delivery**](./.fluxo/roteiro_delivery.md) para configurar seu ambiente local, incluindo as variáveis de ambiente (`.env`) e os servidores MCP necessários para os agentes.

### 2. Comandos Base
Na raiz do projeto:
```bash
npm install          # Instalar dependências
docker-compose up -d # Subir infraestrutura (Docker)
npm run dev          # Iniciar frontend e backend
```

---

## 📄 Documentação Adicional

Para detalhes técnicos e de produto, consulte a pasta `docs/`:
- [PRD](./docs/prd.md) | [Spec Técnica](./docs/spec.md) | [Arquitetura](./docs/architecture.md) | [Design System](./docs/design.md)

---

> [!IMPORTANT]
> **Convenções de Código:** Siga rigorosamente as diretrizes em [AGENTS.md](./AGENTS.md) ao realizar contribuições automáticas ou manuais.


---
TODO:
npm exec -w backend -- stryker run

