# AGENTS.md — Engineering Operating Constitution

## Purpose

This document defines the operational rules for AI coding agents working in this repository (Claude Code, Cursor Agent, Antigravity, OpenCode, Aider and similar tools).

When rules conflict, follow the order of precedence:

1. Security
2. Architecture
3. Correctness
4. Simplicity
5. Developer Experience

---

# 1. Core Principles

## Think Before Acting

Before implementing:

- Analyze the request.
- State assumptions when uncertainty exists.
- Present alternatives and tradeoffs when relevant.
- Ask for clarification if requirements are ambiguous.

Never start coding before understanding the problem.

---

## Simplicity First

Prefer:

- Simple solutions
- Existing patterns
- Minimal changes

Avoid:

- Premature abstractions
- Speculative features
- Unnecessary refactoring

Implement only what is required.

---

## Surgical Changes

Modify only files directly related to the task.

Do not:

- Reformat unrelated files
- Rename unrelated symbols
- Refactor adjacent code without explicit justification

Keep diffs small and focused.

---

## Goal-Oriented Development

Whenever possible:

1. Reproduce the problem.
2. Create or update tests.
3. Implement the fix.
4. Validate the solution.

---

# 2. Architecture Constraints

## Frontend

Technology:

- Next.js (App Router)
- TypeScript
- Vanilla CSS

Responsibilities:

- UI rendering
- User interaction
- API consumption

Forbidden:

- Business rules
- Authorization logic
- Database access
- Prisma usage

Frontend must remain a presentation layer.

---

## Backend

Technology:

- NestJS
- TypeScript
- Prisma
- PostgreSQL

Responsibilities:

- Business rules
- Authorization
- Validation
- Persistence

All business decisions must be enforced on the backend.

---

## Database

Primary database:

- PostgreSQL

Requirements:

- Use Prisma as the access layer.
- All schema changes must be versioned through migrations.

Forbidden:

- Manual production schema changes
- Vendor-specific database features that reduce portability

The system must remain compatible with:

- Local PostgreSQL (Docker)
- Managed PostgreSQL providers

  - Supabase
  - AWS RDS
  - Similar services

---

# 3. Repository Structure

```text
apps/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── services/
│   ├── hooks/
│   └── types/

└── backend/
    └── modules/
        ├── catalog/
        ├── customers/
        └── orders/

docs/
```

Follow existing project conventions before introducing new structure.

---

# 4. Development Workflow

For every non-trivial task:

## Phase 1 — Analysis

- Understand requirements.
- Inspect affected files.
- Identify risks.

## Phase 2 — Planning

Describe:

- Files to modify
- Expected behavior
- Validation strategy

## Phase 3 — Implementation

Apply the smallest change that satisfies the requirement.

## Phase 4 — Validation

Run applicable checks:

```bash
npm run lint
npm run test
npm run build
```

Execute only what is relevant to the scope of the change.

## Phase 5 — Report

Summarize:

- What changed
- Validation performed
- Remaining risks
- Assumptions made

---

# 5. Terminal Governance

## Safe Command Execution

Commands should:

- Be reproducible
- Be non-interactive
- Have predictable outcomes

Prefer:

```bash
--yes
-y
--force-with-lease
```

when appropriate.

---

## Working Directory

When the tool supports it:

- Use an explicit working directory.
- Avoid chained navigation commands.

Prefer:

```bash
cwd=apps/backend
```

over:

```bash
cd apps/backend && ...
```

---

## Long Running Processes

Do not start processes that block execution unless explicitly requested.

Examples:

- Development servers
- Watch mode
- Interactive shells

---

## Port and Service Conflict Management

- **Conflict Detection**: Before starting services that bind to host ports (such as PostgreSQL on `5432`, Next.js on `3000`, or NestJS on `3001`), verify if these ports are already in use.
- **Docker Container Management**: If a port is occupied by conflicting or legacy Docker containers (e.g., leftover containers like `devai-db`), safely check (`docker ps`), inspect, and stop them (`docker stop`) to free up resource ports.
- **Port Mapping Verification**: After starting containerized services, always verify the port mapping (e.g., via `docker ps`) to ensure the host port is mapped correctly and no binding failures occurred.

---

## Tool CLI Diagnostics

- **Error Output Analysis**: When CLI tools fail (such as database migrations or npm installations), inspect the command output carefully to identify version-specific constraint changes (e.g., Prisma 7 config structure updates) before attempting to re-run the command.

---

## Autonomy in File Operations and Validation

- **Proactive File Modifications**: The agent is fully authorized to proactively read, create, modify, and delete files in the workspace to complete tasks. It should apply edits directly rather than asking for permission before each operation.
- **Handling Permission Failures**: In case of file read/write permission errors, the agent must proactively request the narrowest required permission scope using the appropriate system tools to proceed without interrupting the user.
- **Autonomous Testing**: After modifying files, the agent should proactively run validation tests or linters without requiring prior user consent, reporting findings and fixing errors dynamically.

---

# 6. Quality Standards

## Quality Gate

Nunca considere uma tarefa concluída sem:

* Atualizar ou criar os testes automatizados necessários.
* Executar lint, testes e cobertura.
* Corrigir todas as falhas encontradas.

Bloqueie a conclusão da tarefa se houver:

* Erros de lint.
* Testes falhando.
* Cobertura abaixo do mínimo exigido.

### Diretrizes de Teste

* Testes unitários devem ser utilizados apenas no backend para validar regras de negócio, serviços, casos de uso e componentes de forma isolada.
* Testes de integração devem ser utilizados apenas na API REST do backend para validar endpoints, persistência de dados, autenticação, autorização e integração entre componentes.
* Testes E2E devem validar os fluxos críticos da aplicação do ponto de vista do usuário, cobrindo a integração entre frontend, backend e demais serviços necessários.

Os testes devem contemplar, quando aplicável:

* Happy Path
* Failure Path
* Casos limite relevantes

Toda alteração de regra de negócio deve possuir testes automatizados compatíveis com a camada afetada.

---

## Definition of Done

A task is complete when:

- Requirements are satisfied.
- Relevant tests pass.
- Lint passes.
- Build succeeds.
- No known regression was introduced.

---

# 7. Documentation Usage

Before implementing significant changes, review relevant documents in `/docs`.

Priority order:

1. PRD
2. Technical Specification
3. UI Specification
4. Design System
5. Problem Definition

Project documentation takes precedence over assumptions.

---

# 8. External Documentation

When framework or library behavior is uncertain:

Use MCP tools to retrieve authoritative documentation.

Preferred sources:

- Context7
- Official documentation
- Official RFCs
- Vendor documentation

Avoid relying on memory when documentation can be queried.

---

# 9. Continuous Improvement

At the end of significant tasks:

- Identify recurring issues.
- Identify obsolete rules.
- Suggest improvements to this AGENTS.md.

The operating constitution should evolve with the project.s

---

## Variáveis de Ambiente

* Tanto o módulo frontend quanto o backend devem sempre ler as variáveis de ambiente a partir do único arquivo `.env` localizado no diretório raiz do projeto.
* É estritamente proibido criar arquivos `.env`, `.env.local` ou links simbólicos apontando para arquivos `.env` em quaisquer subpastas ou diretórios de módulos do workspace (como `apps/frontend/` ou `apps/backend/`).
* As variáveis de ambiente devem ser carregadas de forma programática a partir da raiz (por exemplo, utilizando `process.loadEnvFile` no `next.config.ts` do Next.js, ou o `ConfigModule` do NestJS com o caminho do `envFilePath` resolvido para o diretório raiz).

---