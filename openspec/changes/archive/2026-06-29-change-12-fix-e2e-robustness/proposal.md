# 12 — Fix E2E Test Robustness

## Summary

The Playwright E2E test suite has 13 identified fragility patterns causing frequent, non-deterministic failures across six spec files. All failures stem from **race conditions** (interacting with elements before async data loads), **fragile locators**, and **missing network-synchronization waits** after mutations. This change hardens all page objects and test specs to eliminate these flaky failures without changing any tested behavior.

## Problem Statement

The following tests are broken frequently:

- `category-management.spec.ts` — tests 9.1, 9.2, 9.3, 9.5
- `fluxo-completo-carrinho.spec.ts` — test 10.1
- `logout-flow.spec.ts` — test 3.1
- `order-lifecycle.spec.ts` — lifecycle test
- `product-management.spec.ts` — create, edit, delete tests
- `redirect-pos-login.spec.ts` — tests 9.1, 9.2

Root cause analysis identified **13 distinct patterns** grouped into three categories:

### Category A — Race Conditions (highest impact)
1. **All page objects use `waitForLoadState('domcontentloaded')`** — fires before async API data loads; tests interact with elements that don't exist yet in Next.js pages.
2. **No wait for dialog visibility before filling inputs** (`CategoryPage.createCategory`, `editCategory`).
3. **No row-visibility wait before acting on table rows** (`CategoryPage`, `ProductPage` edit/delete methods).
4. **`LoginPage.login` returns before navigation completes** — tests that rely on the post-login URL race against the server redirect.
5. **No wait after status transitions in `OrderPage.transitionStatus`** — next assertion runs before the API response and badge re-render.
6. **`CustomerOrdersPage.cancelOrder` returns before UI confirms cancellation**.

### Category B — Fragile Locators
7. **`OrderPage.statusBadge` uses `getByText(status).first()`** — matches any text on page, non-deterministic under full page render.
8. **`StorefrontPage.addToCart` targets the first button** — adds a random product, not the seeded one.

### Category C — Bugs / Anti-Patterns
9. **`SeededOrder` interface missing `number` field** — `order.number` is `undefined` at runtime; order search always fails.
10. **Audit log assertions use wrong chaining** — `.getByText().filter({ hasText })` on separate-node text never matches.
11. **`CategoryPage.deleteCategory` uses `press('Enter')` on confirm button** — depends on focus, unreliable.
12. **`test.setTimeout` inside test body** instead of at `describe` level.
13. **Scattered hardcoded inline `{ timeout }` overrides** that shadow the global config.

## What Changes

- **`apps/frontend/tests/pages/`** — harden `CategoryPage`, `ProductPage`, `OrderPage`, `CartPage`, `CustomerOrdersPage`, `CheckoutPage`, `StorefrontPage`.
- **`apps/frontend/tests/components/NavigationComponent.ts`** — no changes needed.
- **`apps/frontend/tests/utils/api.ts`** — add `number` field to `SeededOrder` interface.
- **`apps/frontend/tests/`** — fix audit log assertions, `test.setTimeout` placement, and inline timeout overrides in all affected specs.
- **`apps/frontend/playwright.config.ts`** — no changes needed (global timeouts are already reasonable).

## Capabilities

### Modified Capabilities
- No spec-level behavior changes. This change exclusively improves test infrastructure reliability.

## Impact

- Affects only E2E test infrastructure under `apps/frontend/tests/`.
- Zero impact on production frontend or backend application code.
- No new test cases added or removed; existing assertions remain identical, only made more resilient.

## Dependencies

None. This change is independent and can be applied at any point.

## Quality Gates

### E2E

- `npx playwright test` — all tests in the failing list must pass consistently across 3 sequential runs with no retries.

### Linter

- `npm run lint --workspace=frontend` — no new lint errors introduced.
