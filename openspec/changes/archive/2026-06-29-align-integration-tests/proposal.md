## Why

The existing e2e test suite (`apps/backend/test/*.e2e-spec.ts`) has drifted from the architecture-defined integration testing standards. It lacks shared helpers, misses a full module (Customers), doesn't use `TRUNCATE CASCADE` for database isolation, omits RFC 9457 error assertions, and has no pagination or audit log coverage for most endpoints. This creates false confidence — tests pass but don't validate production behavior.

The `.agents/skills/supertest-integration-test/SKILL.md` defines the target state. This change aligns the suite with that standard.

## What Changes

- Restructure integration tests under `apps/backend/test/integration/<module>/` with `.integration.spec.ts` naming
- Extract shared helpers: `app.ts` (bootstrap), `auth.ts` (ClerkService mock), `database.ts` (truncation), `fixtures.ts` (builder factories)
- Fix test app bootstrap to reproduce `main.ts` exactly — add `HttpExceptionFilter`, `EventEmitterModule`, `LoggerModule`
- Replace `deleteMany()` with `TRUNCATE TABLE ... CASCADE` and move cleanup to `beforeEach`
- Create missing integration test suite for the **Customers** module (7 endpoints)
- Create missing integration test suite for **admin Categories** (5 endpoints)
- Enhance all existing suites to cover the full scenario matrix per the skill (200, 400, 401, 403, 404, 409, IDOR)
- Add RFC 9457 Problem Details assertions to all error responses
- Add pagination shape assertions (`data`, `total`, `page`, `limit`) to all list endpoints
- Add `X-Total-Count` header assertions for admin list endpoints
- Add audit log assertions for all CUD operations on critical entities
- Add 404 scenarios for all `:id` endpoints
- Expand IDOR scenarios to customer-owned resources beyond orders
- Update `jest-e2e.json` to match new directory structure

## Capabilities

### New Capabilities
- `customers-api`: Integration tests for the Customers module — CRUD, sync, and RBAC enforcement
- `admin-categories-api`: Integration tests for admin Categories CRUD endpoints

### Modified Capabilities
- `orders-api`: Expand existing tests to cover pagination, RFC 9457, audit logs, full RBAC matrix
- `products-api`: Expand existing tests to cover pagination, RFC 9457, audit logs, full RBAC matrix
- `public-catalog-api`: Expand existing tests to cover pagination and RFC 9457

## Impact

- `apps/backend/test/` — directory restructured: existing `.e2e-spec.ts` files will be migrated to `integration/<module>/` with new naming
- `apps/backend/test/jest-e2e.json` — `testRegex` updated to match new directory structure
- `apps/backend/src/modules/customers/` — no code changes needed (endpoints already exist)
- `apps/backend/src/modules/products/controllers/categories.controller.ts` — no code changes needed
- `apps/backend/src/core/filters/http-exception.filter.ts` — already implemented, just needs inclusion in test bootstrap
- No database schema, API contract, or production code changes required
