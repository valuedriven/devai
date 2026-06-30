## Context

The integration test suite at `apps/backend/test/*.e2e-spec.ts` was built incrementally without shared infrastructure. Six test files each define their own NestJS bootstrap, ClerkService mock, database cleanup, and fixture helpers — with subtle inconsistencies (different table cleanup orders, missing `HttpExceptionFilter`, inconsistent `beforeEach` isolation).

Meanwhile, `.agents/skills/supertest-integration-test/SKILL.md` defines a mature target pattern: shared helpers, `TRUNCATE CASCADE` cleanup, RFC 9457 assertions, pagination shape validation, audit log verification, and full RBAC/IDOR coverage per endpoint. The suite needs to align with this standard.

No API contract or production code changes are needed — only test infrastructure.

## Goals / Non-Goals

**Goals:**
- Extract shared test helpers: `app.ts`, `auth.ts`, `database.ts`, `fixtures.ts`
- Fix test app bootstrap to reproduce `main.ts` exactly
- Replace `deleteMany()` with `TRUNCATE ... CASCADE` in `beforeEach`
- Create integration test suite for Customers module (missing module coverage)
- Create integration test suite for admin Categories (missing endpoint group)
- Enhance all existing test suites to cover full scenario matrix
- Rename and restructure files per skill convention

**Non-Goals:**
- No API contract changes — routes, status codes, and response shapes stay identical
- No production code changes — only test files and config
- No database schema changes
- No frontend changes
- No unit test changes (those are governed by `test-standards` spec)

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth strategy | Mock `ClerkService` (status quo) | Clerk is an outbound third-party integration. Mocking it at the service boundary is pragmatic, avoids network dependency in CI, and matches the skill's "mock only outbound integrations" rule. The mock is extracted to `auth.ts` to eliminate duplication. |
| Cleanup mechanism | `TRUNCATE TABLE ... CASCADE` | Atomic, self-ordering (no FK ordering needed), faster than `deleteMany()`. Aligns with skill. |
| Bootstrap approach | Shared `getApp()` singleton | Boot once per suite, reuse across files. Avoids `beforeEach` app creation (slow). Singleton pattern from skill. |
| Module directory | `test/integration/<module>/<action>-<resource>.integration.spec.ts` | Groups tests by functional module. Naming convention from skill. |
| Old file handling | Old `*.e2e-spec.ts` files are deleted after migration | Keeps repo clean. Git history preserves originals. |
| Coverage assertion | RFC 9457 `toMatchObject` shape assertions | Validates the problem details format produced by `HttpExceptionFilter`. Avoids fragile snapshot assertions for dynamic fields (`instance`, `timestamp`). |
| Pagination shape | Varies by endpoint type — customer orders return `{ data, total }`, admin endpoints and public catalog return flat arrays with `X-Total-Count` header | Admin endpoints use `X-Total-Count` header; customer-facing endpoints embed pagination in the response body. `page`/`limit` are accepted as query params but not echoed in responses. |
| `X-Total-Count` | `.expect('X-Total-Count', /\d+/)` | Admin list endpoints and public catalog use this header for client-side pagination. |
| Audit log scope | Assertions in `admin-orders.integration.spec.ts` only (status transitions via `OrderManagementService`) | Only `OrderManagementService.transitionStatus()` emits `audit.log` events. Customer-facing `OrdersService`, `CustomersService`, and `ProductsService` do not emit audit events yet. Assertions can be added when those services are updated. |
| Audit log verification | Via API response — `GET /api/v1/admin/orders/:id` includes `auditLogs` | The `OrderManagementService.findOne()` returns audit logs. Other endpoints don't expose them, so assertions use response data where available. |

## Directory Layout

```
apps/backend/test/
├── jest-e2e.json                    # ← update testRegex
└── integration/
    ├── helpers/
    │   ├── app.ts                   # getApp() bootstrap singleton
    │   ├── auth.ts                  # mock ClerkService + auth header factories
    │   ├── database.ts              # truncateAll() using TRUNCATE CASCADE
    │   └── fixtures.ts              # makeCustomer, makeProduct, etc.
    ├── auth/
    │   └── auth.integration.spec.ts
    ├── customers/
    │   └── customers.integration.spec.ts    # NEW
    ├── orders/
    │   ├── orders.integration.spec.ts
    │   └── admin-orders.integration.spec.ts
    └── products/
        ├── admin-products.integration.spec.ts
        ├── admin-categories.integration.spec.ts   # NEW
        └── public-catalog.integration.spec.ts
```

## Scenario Matrix per Endpoint

Every protected endpoint gets these scenarios:

| Scenario | Expected | Required For |
|----------|----------|-------------|
| Happy path | 2xx | All endpoints |
| Validation failure (bad body/params) | 400 | All mutation endpoints |
| Unauthenticated (no token) | 401 | All protected endpoints |
| Insufficient role (non-admin) | 403 | All admin endpoints |
| Resource not found | 404 | All `:id` endpoints |
| Conflict (duplicate email, delete with orders) | 409 | Create/delete with FK constraints |
| IDOR (access other user's data) | 403 or 404 | Order + Customer user-owned resources |

Public endpoints only need: happy path (200), not found (404), and validation (400).

## Risks / Trade-offs

- **Restructuring will invalidate git blame for test files** — acceptable trade-off for long-term maintainability. Old files are deleted, not renamed, per skill convention.
- **Shared `getApp()` singleton** means a single test failure in app bootstrap breaks the entire suite — mitigated by careful bootstrap testing and CI feedback.
- **`beforeEach` truncation** adds ~10ms per test — negligible, but without it tests leak state and produce flaky failures.
- **Mocking ClerkService** means we don't test JWT token validation end-to-end — the AuthGuard integration with real JWT is tested implicitly through the mock verifying that `verifyToken` is called and its return value flows to `getUser`. Full JWT validation is an integration concern between NestJS and Clerk SDK, better tested at the Clerk SDK level.
