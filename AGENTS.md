# AGENTS.md

Manual operacional para agentes de IA neste repositório. Este documento define a stack, fluxos de trabalho, convenções de código e regras de validação que devem ser seguidas rigorosamente.

---

## 🏗️ Project Overview

Monorepo estruturado com **npm workspaces**.

- **Apps:**
  - `apps/frontend`: Next.js 16+, React 19, TypeScript.
  - `apps/backend`: NestJS 11, TypeScript, Prisma ORM.
- **Tech Stack:**
  - **Frontend:** Lucide React, clsx, Vanilla CSS (Design System).
  - **Backend:** PostgreSQL, Clerk Auth.
  - **Infra:** Docker Compose (local), Vercel/AWS (deploy).

---

## 🛠️ Agent Skills

Abaixo estão os módulos de conhecimento específicos disponíveis em `.agent/skills/`. Ative-os conforme necessário:

| Skill | Purpose | When to Use |
|-------|---------|-------------|
| `clerk` | Auth Router | Configuração inicial de Auth, fluxos de login. |
| `clerk-webhooks` | Data Sync | Sincronizar usuários do Clerk com o banco de dados. |
| `nestjs-best-practices` | Backend Arch | Criação de módulos, serviços e validação DTO. |
| `next-best-practices` | Frontend Arch | Estrutura de App Router, Server Components e Performance. |
| `next-cache-components` | Next.js 16 Cache | Uso de `use cache`, PPR e estratégias de cache. |
| `design-md` | Design System | Análise de tokens e estilos semânticos. |
| `monorepo-management` | Workspaces | Gestão de dependências e scripts em monorepo. |
| `web-design-guidelines` | UX/UI Audit | Verificação de conformidade com boas práticas de design. |

---

## 🚀 Setup & Development

### 1. Setup Inicial
```bash
npm install
# O projeto utiliza npm workspaces, instale as dependências na raiz.
```

### 2. Comandos de Desenvolvimento
- **Frontend:** `npm run dev:frontend` (Raiz) ou `npm run dev` (`apps/frontend`)
- **Backend:** `npm run dev:backend` (Raiz) ou `npm run start:dev` (`apps/backend`)

### 3. Banco de Dados (Backend)
```bash
# Dentro de apps/backend
npx prisma generate
npx prisma migrate dev
```

---

## 🧪 Testing & Validation

### Regras de Ouro
1. **SEMPRE** execute o lint antes de finalizar uma tarefa.
2. **NUNCA** ignore erros de tipagem TypeScript.
3. Testes unitários são obrigatórios para novos serviços no backend.
4. **OBRIGATÓRIO:** Sempre use o MCP server `context7` (`query-docs`) para consultar documentação técnica atualizada (Next.js, NestJS, Clerk, etc.) antes de iniciar qualquer implementação.

### Comandos de Teste
- **Backend Unit:** `npm run test --workspace=backend`
- **Backend E2E:** `npm run test:e2e --workspace=backend`
- **Frontend Lint:** `npm run lint --workspace=frontend`

---

## 📋 Diretrizes de Comportamento do Agente

Baseado nas diretrizes de [CLAUDE.md](https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md), o agente deve seguir:

### 1. Pense antes de codar
- Declarar suposições explicitamente.
- Perguntar quando houver ambiguidades.
- Apresentar opções antes de escolher silenciosamente.

### 2. Simplicidade Primeiro
- Implementar o mínimo código necessário.
- Evitar abstrações desnecessárias e flexibilidade não requisitada.
- Refatorar se o código ficar excessivamente longo.

### 3. Mudanças Cirúrgicas
- Alterar apenas o que for necessário para atender ao pedido.
- Não mudar código adjacente ou estilo sem solicitação.
- Remover importações ou variáveis introduzidas que não são mais usadas.

### 4. Execução Orientada a Objetivo
- Definir critérios de sucesso claros.
- Verificar os critérios antes de considerar a tarefa concluída.
- Iterar até que os critérios sejam atendidos.

## 📚 Referências de Projeto

O agente deve considerar como fonte de verdade os documentos do projeto:

- `docs/prd.md` – Plano de produto.
- `docs/spec_tech.md` – Especificações técnicas.
- `docs/spec_ui.md` – Especificações de UI.
- `docs/design_system.md` – Sistema de design e tokens.

Sempre alinhar as decisões com essas referências.

---

## 📐 Coding Conventions

### Frontend (`apps/frontend`)
- **Estrutura de Rotas:** Use grupos de rotas `(admin)`, `(auth)`, `(shop)` para separação lógica.
- **Styling:** Use Vanilla CSS com variáveis do Design System (`src/app/globals.css`).
- **NUNCA** use TailwindCSS a menos que explicitamente solicitado.
- **Anti-Pattern:** Evite criar componentes genéricos em `src/app`. Use `src/components`.

### Backend (`apps/backend`)
- **Estrutura de Módulos:** Siga o padrão Feature Module em `src/modules/`.
  - Ex: `src/modules/customers/{customers.controller.ts, customers.service.ts, dto/}`
- **DTOs:** Valide todos os inputs usando `class-validator` e `Pipes`.
- **Database:** Acesse o banco apenas via serviços, abstraindo o Prisma quando possível.

---

## 🚫 Anti-Patterns & Defensive Rules

- **Não duplique códigos:** Verifique se utilitários já existem em `apps/backend/src/core` ou `apps/frontend/src/lib`.
- **Package.json:** Sempre leia o `package.json` do workspace específico antes de adicionar novos scripts ou dependências.
- **Respeite o Design System:** Não use cores hardcoded. Use as variáveis CSS definidas.
- **Docker:** Verifique se os containers necessários estão rodando antes de testar integrações.
- **Documentação OSO:** Nunca confie apenas no conhecimento interno para bibliotecas externas. Use o `context7` para validar assinaturas de métodos e novos recursos.

---

## 🔍 Validation Rules
Antes de submeter qualquer alteração, o agente DEVE validar:
1. `npm run lint` no workspace afetado.
2. Build local para garantir que não quebrou o monorepo.
3. Testes de unidade.
4. Consistência com `docs/prd.md` e `docs/spec_tech.md`.