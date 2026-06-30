## Context

The unit test suite at `apps/backend/src/` was built incrementally and lacks the structural conventions defined in `.agents/skills/jest-unit-tests/SKILL.md`. The skill mandates:
- AAA comments in every test (Arrange/Act/Assert)
- Per-test mock configuration with `mockResolvedValueOnce`
- Fake timers for time-dependent logic
- Exception type assertions (not message strings)
- No implementation detail assertions
- `afterEach(jest.clearAllMocks())` cleanup
- No scaffold boilerplate

The current suite has accumulated 7 categories of non-compliance (listed in What Changes). The fix requires mechanical edits across 20 files plus one automation script.

## Goals / Non-Goals

**Goals:**
- Every test block across all spec files has `// Arrange` / `// Act` / `// Assert` section headers
- All mock configuration uses per-test `mockResolvedValueOnce` (no shared defaults)
- All error assertions check exception **types** only (not message strings)
- Date-dependent tests use `jest.useFakeTimers()` / `jest.setSystemTime()`
- No `(service as any)` private property access in tests
- No `app.controller.spec.ts` scaffold
- No `should be defined` tests
- No unnecessary `eslint-disable` directives

**Non-Goals:**
- Adding new test coverage for uncovered business rules
- Refactoring production code
- Changing test runner configuration or Jest config
- Modifying integration tests or E2E tests
- Adding AuditService assertions (architecture uses EventEmitter for audit, not AuditService)
- Converting controller unit tests to integration tests (user decision: keep as-is)

## Decisions

### D1: Automation script for AAA comments
**Decision**: Write a Node.js script (`scripts/add-aaa-comments.mjs`) that heuristically identifies Arrange/Act/Assert boundaries in each `it(...)` block and inserts comments.
**Rationale**: Adding ~150 AAA comment blocks across 20 files manually is tedious and error-prone. A script covers ~90% of cases correctly; the remaining 10% get fixed during review.
**Pattern**:
- After `it('...', ... {` → insert blank + `// Arrange`
- Before first `const result = await service.` or `await service.` call → insert blank + `// Act`
- Before first `expect(` or `await expect(` after the Act → insert blank + `// Assert`

### D2: All fixes applied per-file, not globally
**Decision**: Each non-compliant pattern gets fixed individually per file rather than running a global codemod. The script handles only AAA comments.
**Rationale**: Mock state fix, error message asserts, Prisma mock unification, and `eslint-disable` removal each require judgment. A single-pass global script would miss edge cases.

### D3: Unify Prisma mock pattern
**Decision**: Replace inline Prisma mocks in `products.service.spec.ts` and `categories.service.spec.ts` with the existing `createMockPrismaService()` factory from `database/__mocks__/prisma-service.mock.ts`.
**Rationale**: Already have a shared factory — using it reduces boilerplate, ensures all service specs follow the same pattern, and makes upgrades easier.

### D4: Fake timers for payment.service.spec.ts
**Decision**: Add `jest.useFakeTimers()` / `jest.setSystemTime(new Date('2024-01-01T00:00:00Z'))` in `beforeAll`, restore real timers in `afterAll`. Replace `new Date().toISOString()` calls in test data with `'2024-01-01T00:00:00.000Z'`.
**Rationale**: Per skill: "Mandatory whenever code depends on Date." The `register()` DTO uses `date: string` which the SUT converts via `new Date(data.date)` — deterministic now.

## Risks / Trade-offs

- **[Low] AAA script may misclassify edge cases**: Tests with no clear Act (pure assertions tests) or unusual control flow may get misplaced comments. Mitigation: manually review the diff after running the script.
- **[Low] `eslint-disable` removal may expose lint errors**: The `@typescript-eslint/unbound-method` disable hints at `this` context issues. Mitigation: fix the underlying pattern rather than re-adding the disable.
- **[Medium] Removing `should be defined` tests may drop coverage below 80%**: These tests are trivial, but their line count contributes to the denominator. Mitigation: run coverage check after removal; if thresholds are threatened, keep them but mark as `test.skip`.
