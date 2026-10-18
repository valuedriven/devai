---
name: quality-gate
description: >
  Ensures every implementation meets mandatory quality criteria before being considered complete
  in the e-micro-commerce monorepo (Next.js 16+ frontend / NestJS 11+ backend / Prisma 7+ / PostgreSQL 15+).
  Trigger this skill when: implementing a new feature, fixing a bug, refactoring existing code,
  modifying business logic, or when the user asks to "finish", "commit", "open a PR", "review",
  or "complete" any task. This skill is MANDATORY — never declare a task done without executing
  the full pipeline described here.
---

# Quality Gate — e-micro-commerce

## Absolute Rule

A task is considered complete **only** when all stages of the pipeline below have been successfully executed and all checklist items are satisfied.

---

## Project Context

```text
apps/
  frontend/   ← Next.js 16+ / App Router / TypeScript / Vanilla CSS
  backend/    ← NestJS 11+ / Node.js 24+ / TypeScript / Prisma 7+
infra/
.env          ← single env file at monorepo root
```

Package manager: `npm` with Workspaces. Verify lockfile before running commands.
Single `.env` at the monorepo root — never create `.env.test`, `.env.local`, or per-module env files.

---

## Mandatory Pipeline

Execute in this exact order:

```text
1. ESLint                      → zero errors in affected workspace
2. Unit Tests (Jest)           → all passing — backend only
3. Integration Tests (Supertest) → all passing — backend REST API
4. E2E Tests (Playwright)      → zero critical failures — when applicable
5. Coverage Verification       → minimum thresholds achieved per layer
```

---

## Step 0 — Detect Project Scripts

Always inspect `package.json` first. Prefer project scripts over raw `npx` calls.

```bash
# Root
cat package.json | grep -E '"(lint|test|test:unit|test:integration|test:e2e|coverage)"'

# Backend workspace
cat apps/backend/package.json | grep -E '"(lint|test|test:unit|test:integration|coverage)"'

# Frontend workspace
cat apps/frontend/package.json | grep -E '"(lint|test|test:e2e|coverage)"'
```

### Preferred Commands (npm Workspaces)

```bash
# Run from monorepo root — target specific workspace
npm run lint            --workspace=apps/backend
npm run lint            --workspace=apps/frontend

npm run test:unit       --workspace=apps/backend
npm run test:integration --workspace=apps/backend

npm run test:e2e        --workspace=apps/frontend

npm run coverage        --workspace=apps/backend
npm run coverage        --workspace=apps/frontend
```

### Fallbacks (when no script is configured)

```bash
# Backend
cd apps/backend
npx eslint .
npx jest --testPathPattern="\.spec\.ts$" --coverage
npx jest --testPathPattern="\.integration\.spec\.ts$" --coverage

# Frontend
cd apps/frontend
npx eslint .
npx playwright test
npx jest --coverage --coverageReporters=text-summary
```

---

## Minimum Coverage Requirements

| Layer    | Lines | Branches | Functions | Statements |
|----------|-------|----------|-----------|------------|
| Backend  | 80%   | 80%      | 80%       | 80%        |
| Frontend | 70%   | 70%      | 70%       | 70%        |

### Enforce via Jest Config

Add to `apps/backend/jest.config.ts`:

```ts
coverageThreshold: {
  global: {
    lines:      80,
    branches:   80,
    functions:  80,
    statements: 80,
  },
},
```

Add to `apps/frontend/jest.config.ts` (for component tests):

```ts
coverageThreshold: {
  global: {
    lines:      70,
    branches:   70,
    functions:  70,
    statements: 70,
  },
},
```

**`--passWithNoTests` is forbidden.** A suite with zero tests must fail.

---

## Testing Guidelines by Layer

### Backend Unit Tests (`apps/backend`)

- Validate business rules, services, use cases, and pure functions **in isolation**
- Mock all infrastructure: `PrismaService`, `AuditService`, Clerk client, HTTP clients, logger
- Never connect to a real database
- Mandatory for all service and use case classes in `core/` and `modules/`
- Tool: Jest

### Backend Integration Tests (`apps/backend`)

- Validate REST API endpoints end-to-end: routing, validation, auth, authz, persistence, serialization
- Use a **real PostgreSQL test database** (configured via `DATABASE_URL` in the single `.env`)
- Use real Clerk-compatible JWTs — never mock `JwtStrategy` or `AuthGuard`
- Truncate all tables in `beforeEach`; bootstrap application once per suite
- Required scenarios per endpoint: 2xx, 400, 401, 403, 404, and IDOR check for user-owned resources
- Assert RFC 9457 Problem Details shape for all error responses
- Assert audit log creation for every Create / Update / Delete on critical entities
- Tool: Jest + Supertest

### Frontend E2E Tests (`apps/frontend`)

E2E tests are required when **any** of the following changed:
- A new page, route, or user-facing workflow
- An authentication or authorization flow (custom forms — no Clerk SDK components)
- A multi-step workflow (catalog browsing, order creation, checkout)
- A frontend ↔ backend integration path

- Seed data via backend API — never through UI flows
- Use `storageState` for CUSTOMER and ADMIN sessions
- Cover public (unauthenticated), CUSTOMER, and ADMIN roles
- Cover RBAC redirect behavior for protected routes
- Tool: Playwright

### What Every Test Must Cover

- ✅ Happy Path — primary flow working correctly
- ✅ Failure Path — expected errors handled and surfaced correctly
- ✅ Relevant Edge Cases — boundaries, empty states, IDOR

---

## When to Create or Update Tests

| Situation                        | Required Action                                                     |
|----------------------------------|---------------------------------------------------------------------|
| New business rule (backend)      | Unit tests for the affected service or use case                     |
| New REST endpoint                | Integration tests for all HTTP scenarios (2xx, 4xx, IDOR)           |
| New or modified user workflow    | E2E tests for the affected page or workflow                         |
| New CUD operation on critical entity | Integration test asserting audit log creation                   |
| Business rule modification       | Update existing unit tests in the affected layer                    |
| Bug fix                          | Add a test that reproduces the bug **before** fixing it             |
| Refactoring                      | All existing tests must continue to pass without modification        |
| RBAC change                      | Integration tests (401/403) + E2E redirect tests                   |

---

## Architecture-Specific Validation Rules

### Backend

- Every Create / Update / Delete on a critical entity must have an integration test asserting that an `AuditLog` row was created.
- All error responses must match RFC 9457 Problem Details (`type`, `title`, `status`, `detail`, `instance`).
- All list endpoints must return a paginated shape (`data`, `total`, `page`, `limit`).
- All API paths must be prefixed with `/v1/`.
- `PrismaService` must never be mocked in integration tests.
- `JwtStrategy` / `AuthGuard` / `RolesGuard` must never be bypassed in integration tests.

### Frontend

- No business logic in pages or components — if a test breaks because of logic in the frontend, the logic must be moved to the backend.
- Authentication and authorization flows use custom forms — no Clerk SDK components.
- All backend communication goes through `services/` — E2E tests must not bypass this layer.
- Environment variables come from the single `.env` at the monorepo root.

---

## Blocking Conditions and Recovery Actions

Do not complete the task while any of these conditions exist:

| Blocking Condition          | Required Recovery Action                                                        |
|-----------------------------|---------------------------------------------------------------------------------|
| ❌ Lint errors              | Run `npm run lint --fix`; manually fix remaining; re-run until zero errors      |
| ❌ Failing unit tests       | Read full failure; fix source or test; re-run until all pass                    |
| ❌ Failing integration tests| Read full failure; fix source, migration, or test; re-run until all pass        |
| ❌ Coverage below threshold | Run `--coverageReporters=lcov`; identify uncovered lines; write targeted tests  |
| ❌ E2E critical failures    | Open Playwright trace (`npx playwright show-trace`); fix page object or app code|
| ❌ Missing audit log test   | Add integration test asserting `AuditLog` row after CUD on critical entity      |
| ❌ Missing IDOR test        | Add integration test asserting 403/404 when accessing another user's resource   |

**Never suppress, skip, or comment out a failing test to make the pipeline pass.**

---

## Completion Checklist

### General

- [ ] ESLint executed in all affected workspaces — **zero errors**
- [ ] All tests passing — **zero failures**
- [ ] `--passWithNoTests` is not present anywhere in scripts or CI config

### Backend

- [ ] Unit tests created or updated for all affected services and use cases
- [ ] Integration tests created or updated for all affected REST endpoints
- [ ] Integration tests cover: 2xx, 400, 401, 403, 404, and IDOR scenarios
- [ ] Integration test asserts RFC 9457 Problem Details shape for all error responses
- [ ] Integration test asserts `AuditLog` row creation for every CUD on critical entities
- [ ] Integration test asserts paginated response shape for all list endpoints
- [ ] All API paths use `/v1/` prefix
- [ ] Backend coverage ≥ 80% lines, branches, functions, statements

### Frontend

- [ ] E2E tests created or updated for all impacted pages and workflows (when applicable)
- [ ] E2E tests cover unauthenticated, CUSTOMER, and ADMIN roles (when applicable)
- [ ] E2E tests cover RBAC redirects for protected routes (when applicable)
- [ ] Frontend coverage ≥ 70% lines, branches, functions, statements (component tests)

---

## Agent Workflow

```text
implement change
       ↓
step 0: detect project scripts from package.json (root + affected workspace)
       ↓
create or update tests for every affected layer
       ↓
run lint (affected workspace) → fix all errors → repeat until zero errors
       ↓
run unit tests → fix all failures → repeat until all pass
       ↓
run integration tests → fix all failures → repeat until all pass
       ↓
run E2E tests (when applicable) → fix critical failures → re-run
       ↓
verify coverage → if below threshold: identify uncovered lines, write tests, re-run
       ↓
confirm all checklist items above are satisfied
       ↓
✅ task completed
```

---

## Quick Tool Reference

| Category    | Tool                       | Workspace  |
|-------------|----------------------------|------------|
| Lint        | ESLint                     | Both       |
| Unit        | Jest                       | Backend    |
| Integration | Jest + Supertest           | Backend    |
| Component   | Jest / Vitest + Testing Library | Frontend |
| E2E         | Playwright                 | Frontend   |
| Coverage    | Jest `--coverage`          | Both       |
