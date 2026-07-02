## Context

A comprehensive audit of the Playwright E2E suite identified ~40 violations of the `playwright-e2e-tests` skill across 15+ files. Violations span six categories: (1) inline navigation waits in test bodies, (2) missing POM guards (dialog, row, post-mutation), (3) anti-pattern usage (`press('Enter')`, `waitFor`, `waitForURL` inside POM methods), (4) manual test data teardown, (5) untyped Order/OrderItem data, (6) infrastructure gaps (missing ESLint rule, hardcoded API URLs, no `test.abort()` in fixtures).

## Goals / Non-Goals

**Goals:**
- Fix all identified violations so the suite passes the skill's Quality Checklist (SKILL.md L844-875).
- Add `OrderItemData`, `OrderData` interfaces and `makeOrderItem()`, `makeOrder()` factories to `data.ts`.
- Refactor `createOrderApi` to accept `OrderData`.
- Add `seededOrder` fixture to `baseTest.ts`.
- Fix all 7 Page Object violations (dialog guards, post-mutation guards, `press('Enter')`, `waitForURL` in POMs, missing `goTo()` anchor).
- Remove all inline `page.waitForURL` and `{ timeout }` overrides from test bodies.
- Replace all `try/finally` manual teardown with fixtures.
- Add `@typescript-eslint/no-floating-promises` ESLint rule.
- Replace hardcoded API URLs with shared `API_BASE` constant.
- Add `test.abort()` to seeding fixtures for broken preconditions.

**Non-Goals:**
- Moving pure API tests (api-auth-me, api-endpoints-publicos, api-token-validation) to backend integration tests. This is flagged as a future improvement.
- Changing application UI or backend logic.
- Adding new test scenarios — only refactoring existing ones.
- Forcing the `seededOrder` fixture onto multi-order tests — they'll use `makeOrder()` + `createOrderApi()` with typed data.

## Decisions

- **`OrderData` shape**: Contains `customerId`, `totalAmount`, `items: OrderItemData[]`. The `number` field stays generated inside `createOrderApi` (seeding concern, not test-data concern). `OrderData.items` maps to `order_items` only inside `createOrderApi`.
- **`seededOrder` fixture chain**: depends on `seededProduct` + `seededCustomer` → `seededCategory`. No `deleteOrder` teardown (orders are append-only in the API).
- **`press('Enter')` → `.click()`**: In `OrderPage.fillPaymentForm`, we need to identify or add a submit button in the payment modal. If no visible submit button exists, the frontend needs a small UI fix (out of scope — we'll add a `getByRole('button')` locator targeting whatever exists).
- **`waitForURL` inside POMs**: `CartPage.clickLogin` and `CustomerOrdersPage.cancelOrder` both leak navigation waits. These will be removed from the POM, and callers will assert the destination element visibility instead.
- **`gotoProductDetail` anchor**: Will add `await expect(this.heading).toBeVisible()` after `goto()` so it waits for the product data to load.
- **ESLint rule**: Added to the `tests/**` files block in `eslint.config.mjs`.
- **Hardcoded API URLs**: Tests that use `'http://localhost:3001/api/v1/...'` will import `API_BASE` from `utils/api.ts`.
- **`test.abort()`**: Seeding fixtures (`seededCategory`, `seededProduct`, `seededCustomer`, `seededOrder`) will wrap their API calls and call `test.abort('reason')` on failure, keeping triage signal clean.
- **Selenium-style `waitFor`**: `LoginPage.login` L28 and `ProductPage.fillProductDetails` L59 use `.waitFor()`. These will be replaced with `expect(locator).toBeVisible()` or `expect(locator).toBeAttached()`.

## Risks / Trade-offs

- **Risk**: Removing `waitForURL` from POM methods may break tests if the call-site doesn't add a visibility assertion.
  - **Mitigation**: Every refactored call-site will get an explicit `expect(destinationElement).toBeVisible()` assertion.
- **Risk**: Adding `test.abort()` in fixtures could mask real failures if the abort reason is wrong.
  - **Mitigation**: Abort messages will include the HTTP status and endpoint to aid debugging.
- **Risk**: The `press('Enter')` → `.click()` change in payment form requires a clickable submit button to exist in the modal.
  - **Mitigation**: Inspect the actual payment modal DOM during implementation. If no button exists, flag it.
- **Risk**: Deep fixture dependency chain (`seededOrder` → `seededProduct` → `seededCategory` + `seededCustomer`) may slow setup.
  - **Mitigation**: Only tests that opt into `seededOrder` pay this cost.
