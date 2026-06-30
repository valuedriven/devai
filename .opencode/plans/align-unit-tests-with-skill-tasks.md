## 1. Automation Script

- [ ] 1.1 Create `scripts/add-aaa-comments.mjs` — Node.js script that parses each spec file's `it(...)` blocks and inserts `// Arrange`, `// Act`, `// Assert` at heuristic boundaries

## 2. Structural Fixes (Service Specs)

- [ ] 2.1 Fix `products.service.spec.ts` — move `jest.clearAllMocks()` from `beforeEach` to `afterEach`, remove shared `mockResolvedValue` defaults from mock declaration, replace inline Prisma mock with `createMockPrismaService()`
- [ ] 2.2 Fix `products.service.spec.ts` — remove `eslint-disable @typescript-eslint/unbound-method`, fix underlying `this` context issues
- [ ] 2.3 Fix `categories.service.spec.ts` — replace inline Prisma mock with `createMockPrismaService()`
- [ ] 2.4 Fix `categories.service.spec.ts` and `customers.service.spec.ts` — remove error message string assertions (`toThrow('Category not found')`, `toThrow('Customer with ID...')`), keep only exception type assertions

## 3. Time & Private State Fixes

- [ ] 3.1 Fix `payment.service.spec.ts` — add `jest.useFakeTimers()` / `jest.setSystemTime()` in `beforeAll`, `jest.useRealTimers()` in `afterAll`, replace `new Date().toISOString()` with `'2024-01-01T00:00:00.000Z'`
- [ ] 3.2 Fix `clerk.service.spec.ts` — replace `(service as any).clerkClient` with a proper mock factory for Clerk SDK client

## 4. Remove Boilerplate

- [ ] 4.1 Delete `app.controller.spec.ts`
- [ ] 4.2 Remove `should be defined` tests from `orders.service.spec.ts`, `products.service.spec.ts`, `categories.service.spec.ts`, `customers.service.spec.ts`

## 5. Add Missing Test

- [ ] 5.1 Add `$transaction` failure test to `orders.service.spec.ts` — verify that when `$transaction` rejects, the error propagates correctly

## 6. Run AAA Automation Script

- [ ] 6.1 Run `node scripts/add-aaa-comments.mjs` against all spec files
- [ ] 6.2 Review diff for misclassified test blocks and fix manually

## 7. Validation

- [ ] 7.1 Fix `eslint-disable` in `products.controller.spec.ts` and `auth-decorators.spec.ts` if lint errors surface
- [ ] 7.2 Run `npm run test` across all workspaces — all tests pass
- [ ] 7.3 Run `npm run lint` — zero errors and warnings
- [ ] 7.4 Run `npm run build` — builds succeed
