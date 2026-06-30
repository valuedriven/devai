## Why

The existing Jest unit test suite (21 files, ~3700 lines) has drifted from the standards defined in the jest unit test skill at `.agents/skills/jest-unit-tests/SKILL.md`. While tests are functionally correct, they lack structural rigor — AAA comments missing in 100% of files, shared mock state in `products.service.spec.ts`, error message string assertions instead of exception types, no fake timers where Date is used, and scaffold boilerplate. Without alignment, new tests will compound these inconsistencies.

## What Changes

- Add `// Arrange` / `// Act` / `// Assert` comments to every test block (via automated script)
- Fix shared mock state in `products.service.spec.ts` — move `clearAllMocks` from `beforeEach` to `afterEach`, remove shared `mockResolvedValue` defaults
- Remove error message string assertions in `categories.service.spec.ts` and `customers.service.spec.ts`
- Add fake timers to `payment.service.spec.ts`
- Replace private property access (`(service as any).clerkClient`) in `clerk.service.spec.ts` with partial mock
- Delete `app.controller.spec.ts`
- Remove `should be defined` tests from all service specs
- Unify Prisma mock pattern — replace inline mocks in `products.service.spec.ts` and `categories.service.spec.ts` with `createMockPrismaService()` factory
- Add `$transaction` failure test to `orders.service.spec.ts`
- Remove unnecessary `eslint-disable` comments

## Capabilities

### New
- `test-standards`: Standardized unit test patterns (AAA comments, mock configuration, deterministic time handling, error assertion conventions)

## Impact

**20 spec files + 1 automation script.** No API, schema, dependency, or infrastructure changes.
