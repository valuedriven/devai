## Why

A deep audit of the Playwright E2E test suite against the `playwright-e2e-tests` skill revealed **~40 violations** across 15 files. These span inline navigation waits, manual timeouts, missing POM guards (dialog, post-mutation), `press('Enter')` instead of `.click()`, manual teardown via `try/finally`, untyped Order/OrderItem data, hardcoded API URLs, missing ESLint rule for floating promises, and `waitForURL` leaking inside POM action methods. Left unchecked, these cause flaky tests, obscure triage, and high maintenance cost.

## What Changes

### Test Infrastructure
- **ESLint**: Add `@typescript-eslint/no-floating-promises` rule to `eslint.config.mjs`.
- **Fixtures**: Add `seededOrder` fixture to `baseTest.ts`. Add `test.abort()` guards to seeding fixtures.

### Data Layer (`data.ts` / `api.ts`)
- **Add** `OrderItemData`, `OrderData` interfaces and `makeOrderItem()`, `makeOrder()` factories.
- **Refactor** `createOrderApi` to accept `OrderData` instead of anonymous inline type.
- **Centralize** `API_BASE` — remove hardcoded URLs from test files.

### Page Objects
- **OrderPage**: Replace `press('Enter')` with `.click()` in `fillPaymentForm`. Add dialog guard in `openPaymentModal`.
- **ProductPage**: Add post-mutation guard in `deleteProduct` (wait for dialog hidden).
- **CustomerPage**: Add dialog guard before confirm in `deleteCustomer`. Add post-mutation guard after delete.
- **CartPage**: Remove `waitForURL` from `clickLogin` (move to call site).
- **CustomerOrdersPage**: Remove `waitForURL` from `cancelOrder` (move to call site).
- **StorefrontPage**: Add anchor assertion in `gotoProductDetail`.
- **LoginPage**: Replace `waitFor` with web-first assertion.
- **ProductPage**: Replace `waitFor` with web-first assertion in `fillProductDetails`.

### Test Files
- **All files with inline `page.waitForURL`**: Replace with Page Object navigation or visibility assertions (~15 occurrences across 6 files).
- **All files with `{ timeout }` overrides**: Remove inline timeouts (~6 occurrences).
- **All files with `try/finally`**: Replace with fixture-based teardown (4 files).
- **All files with inline anonymous order data**: Use `makeOrder()`/`makeOrderItem()` (4 files).
- **customer-management.spec.ts**: Fix hardcoded test values, use faker.
- **redirect-pos-login.spec.ts**: Remove inline `waitForURL` + timeout.
- **Hardcoded API URLs**: Replace with shared `API_BASE` from `api.ts` (4 files).

## Capabilities

### New Capabilities
- `playwright-tests-refactor`: Comprehensive refactoring of the E2E suite to comply with the playwright-e2e-tests skill standards — covering POM guards, navigation encapsulation, fixture lifecycle, data factories, ESLint rules, and hardcoded constants.

### Modified Capabilities

## Impact

- `apps/frontend/eslint.config.mjs`
- `apps/frontend/tests/utils/data.ts`
- `apps/frontend/tests/utils/api.ts`
- `apps/frontend/tests/fixtures/baseTest.ts`
- `apps/frontend/tests/pages/OrderPage.ts`
- `apps/frontend/tests/pages/ProductPage.ts`
- `apps/frontend/tests/pages/CustomerPage.ts`
- `apps/frontend/tests/pages/CartPage.ts`
- `apps/frontend/tests/pages/CustomerOrdersPage.ts`
- `apps/frontend/tests/pages/StorefrontPage.ts`
- `apps/frontend/tests/pages/LoginPage.ts`
- `apps/frontend/tests/product-management.spec.ts`
- `apps/frontend/tests/customer-management.spec.ts`
- `apps/frontend/tests/fluxo-completo-carrinho.spec.ts`
- `apps/frontend/tests/order-lifecycle.spec.ts`
- `apps/frontend/tests/order-management.spec.ts`
- `apps/frontend/tests/storefront-catalog.spec.ts`
- `apps/frontend/tests/redirect-pos-login.spec.ts`
- `apps/frontend/tests/category-management.spec.ts`
- `apps/frontend/tests/api-auth-me.spec.ts`
- `apps/frontend/tests/api-endpoints-publicos.spec.ts`
- `apps/frontend/tests/api-token-validation.spec.ts`
