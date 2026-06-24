# AGENTS.md — Engineering Operating Constitution

## Purpose

This document defines the operational rules for AI coding agents working in this repository (Claude Code, Cursor Agent, Antigravity, OpenCode, Aider, and similar tools).

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

* Analyze the request.
* State assumptions when uncertainty exists.
* Present alternatives and tradeoffs when relevant.
* Ask for clarification if requirements are ambiguous.

Never start coding before understanding the problem.

---

## Simplicity First

Prefer:

* Simple solutions
* Existing patterns
* Minimal changes

Avoid:

* Premature abstractions
* Speculative features
* Unnecessary refactoring

Implement only what is required.

---

## Surgical Changes

Modify only files directly related to the task.

Do not:

* Reformat unrelated files
* Rename unrelated symbols
* Refactor adjacent code without explicit justification

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

* Next.js (App Router)
* TypeScript
* Vanilla CSS

Responsibilities:

* UI rendering
* User interaction
* API consumption

Forbidden:

* Business rules
* Authorization logic
* Database access
* Prisma usage

Frontend must remain a presentation layer.

---

## Backend

Technology:

* NestJS
* TypeScript
* Prisma
* PostgreSQL

Responsibilities:

* Business rules
* Authorization
* Validation
* Persistence

All business decisions must be enforced on the backend.

---

## Database

Primary database:

* PostgreSQL

Requirements:

* Use Prisma as the data access layer.
* All schema changes must be versioned through migrations.

Forbidden:

* Manual production schema changes
* Vendor-specific database features that reduce portability

The system must remain compatible with:

* Local PostgreSQL (Docker)
* Managed PostgreSQL providers:

  * Supabase
  * AWS RDS
  * Similar services

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

* Understand requirements.
* Inspect affected files.
* Identify risks.

## Phase 2 — Planning

Describe:

* Files to modify
* Expected behavior
* Validation strategy

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

* What changed
* Validation performed
* Remaining risks
* Assumptions made

---

# 5. Terminal Governance

## Safe Command Execution

Commands should:

* Be reproducible
* Be non-interactive
* Have predictable outcomes

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

* Use an explicit working directory.
* Avoid chained navigation commands.

Prefer:

```bash
cwd=apps/backend
```

over:

```bash
cd apps/backend && ...
```

---

## Long-Running Processes

Do not start processes that block execution unless explicitly requested.

Examples:

* Development servers
* Watch mode
* Interactive shells

---

## Port and Service Conflict Management

* **Conflict Detection**: Before starting services that bind to host ports (such as PostgreSQL on `5432`, Next.js on `3000`, or NestJS on `3001`), verify whether those ports are already in use.
* **Docker Container Management**: If a port is occupied by conflicting or legacy Docker containers (e.g., leftover containers such as `devai-db`), safely inspect (`docker ps`) and stop (`docker stop`) them to free the required resources.
* **Port Mapping Verification**: After starting containerized services, always verify port mappings (e.g., using `docker ps`) to ensure host ports are correctly bound and that no binding failures occurred.

---

## CLI Diagnostics

* **Error Output Analysis**: When CLI tools fail (such as database migrations or npm installations), carefully inspect command output to identify version-specific changes or constraints (e.g., Prisma 7 configuration structure updates) before attempting to rerun the command.

---

## Autonomy in File Operations and Validation

* **Proactive File Modifications**: The agent is fully authorized to proactively read, create, modify, and delete files within the workspace to complete tasks. It should apply edits directly rather than requesting permission before each operation.
* **Handling Permission Failures**: If file read/write permission errors occur, the agent must proactively request the minimum required permission scope using the appropriate system tools to continue without unnecessarily interrupting the user.
* **Autonomous Testing**: After modifying files, the agent should proactively run validation checks, tests, or linters without requiring prior user approval, report findings, and fix issues whenever possible.

---

# 6. Quality Standards

## Quality Gate

Never consider a task complete without:

* Creating or updating the necessary automated tests.
* Running lint, tests, and coverage checks.
* Fixing all detected failures.

Block task completion if any of the following exist:

* Lint errors.
* Failing tests.
* Coverage below the required minimum threshold.

### Testing Guidelines

* Never ignore and never change the linter config files. 
* Unit tests must be used exclusively in the backend to validate business rules, services, use cases, and components in isolation.
* Integration tests must be used exclusively for the backend REST API to validate endpoints, data persistence, authentication, authorization, and component integration.
* End-to-end (E2E) tests must validate the application's critical user journeys, covering the integration between frontend, backend, and any required supporting services.

Tests should cover, when applicable:

* Happy Path
* Failure Path
* Relevant edge cases

Every business rule change must be accompanied by automated tests appropriate to the affected layer.

---

## Definition of Done

A task is complete when:

* Requirements are satisfied.
* Relevant tests pass.
* Lint passes.
* Build succeeds.
* No known regression has been introduced.

---

# 7. Documentation Usage

Before implementing significant changes, review the relevant documents in `/docs`.

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

* Context7
* Official documentation
* Official RFCs
* Vendor documentation

Avoid relying on memory when documentation can be queried.

---

# 9. Continuous Improvement

At the end of significant tasks:

* Identify recurring issues.
* Identify obsolete rules.
* Suggest improvements to this AGENTS.md.

The operating constitution should evolve alongside the project.

---

# Environment Variables

* Both the frontend and backend modules must always load environment variables from the single `.env` file located at the project root.
* Creating `.env`, `.env.local`, or symbolic links to `.env` files within any workspace subdirectory or module directory (such as `apps/frontend/` or `apps/backend/`) is strictly prohibited.
* Environment variables must be loaded programmatically from the root directory (for example, using `process.loadEnvFile` in `next.config.ts` for Next.js, or NestJS `ConfigModule` with `envFilePath` explicitly resolved to the project root).

---
