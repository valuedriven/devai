## Why

The existing Jest unit test suite (21 files, ~3700 lines) has drifted from the standards defined in the jest unit test skill (`.agents/skills/jest-unit-tests/SKILL.md`). While functionally correct, it lacks structural rigor — AAA comments missing in 100% of files, shared mock state in `products.service.spec.ts`, error message string assertions instead of exception types, no fake timers where Date is used, scaffold boilerplate, and private property access. Without alignment, new tests compound these inconsistencies, making the suite harder to review, debug, and maintain.

## What Changes

- Add `// Arrange` / `// Act` / `// Assert` comments to every test block via automated script
- Fix shared mock state in `products.service.spec.ts` — move `clearAllMocks` to `afterEach`, remove shared `mockResolvedValue` defaults
- Remove error message string assertions in `categories.service.spec.ts` and `customers.service.spec.ts` — assert exception types only
- Add fake timers to `payment.service.spec.ts` for deterministic date handling
- Replace private property access (`(service as any).clerkClient`) in `clerk.service.spec.ts` with partial mock
- Remove scaffold boilerplate `app.controller.spec.ts`
- Remove `should be defined` tests from all service specs
- Unify Prisma mock pattern — replace inline mocks in `products.service.spec.ts` and `categories.service.spec.ts` with `createMockPrismaService()` factory
- Add `$transaction` failure test to `orders.service.spec.ts`
- Remove unnecessary `eslint-disable` directives from 3 files

## Capabilities

### New Capabilities
- `test-standards`: Standardized unit test patterns (AAA comments, per-test mock configuration, deterministic time handling, exception-type-only error assertions)

### Modified Capabilities
<!-- No existing spec-level requirements are changing — this is a test infrastructure improvement -->

## Impact

**20 spec files + 1 automation script** under `apps/backend/src/`. No API, schema, dependency, or infrastructure changes. Test behavior preserved — only structure and conventions change.
