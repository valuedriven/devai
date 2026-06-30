# Design — Fix E2E Test Robustness

## Context

The test suite follows the Page Object Model (POM) with custom fixtures (`baseTest.ts`). All page objects live under `apps/frontend/tests/pages/`, components under `tests/components/`, and API helpers in `tests/utils/api.ts`. The root cause of all failures is insufficient synchronization between browser state and async data — a common Playwright anti-pattern documented in the [Playwright best practices guide](https://playwright.dev/docs/best-practices#use-web-first-assertions).

## Goals / Non-Goals

**Goals**
- Replace every `waitForLoadState('domcontentloaded')` call with a web-first assertion that retries until meaningful page content is visible.
- Add explicit dialog-visibility guards before any modal input interaction.
- Add row-visibility guards before any table-row action.
- Fix the `SeededOrder` type gap so `order.number` is typed correctly.
- Fix the audit log assertion chain.
- Replace `press('Enter')` with `.click()` on confirmation buttons.
- Move `test.setTimeout` from test body to `describe` scope.
- Remove inline `{ timeout }` overrides that shadow global config.
- Scope `addToCart` to the seeded product's detail page.
- Add a post-mutation visibility guard in `OrderPage.transitionStatus` and `CustomerOrdersPage.cancelOrder`.

**Non-Goals**
- Changing any tested behavior or assertion logic.
- Adding new test cases.
- Modifying production application code.
- Adding `data-testid` attributes to frontend components (we prefer role/label locators first; `data-testid` is only added for `statusBadge` if no scoped alternative exists).

---

## Decisions

### Decision 1: `waitForLoadState` replacement strategy

**Replace** `await this.page.waitForLoadState('domcontentloaded')` with `await expect(<contentElement>).toBeVisible()` in each page object's `goTo()` method. The content element must be one that only renders after the page's primary data fetch completes.

| Page object | `goTo()` anchor element |
|---|---|
| `CategoryPage` | `this.heading` + `this.categoryTable` |
| `ProductPage` | `this.heading.filter({ hasText: 'Produtos' })` |
| `CartPage` | `this.cartIcon` |
| `CustomerOrdersPage` | `this.heading` |
| `StorefrontPage` | `this.welcomeHeading` |
| `CheckoutPage` | `this.addressInput` |

**Rationale**: `expect(...).toBeVisible()` is a web-first assertion — it polls with retries until the element appears or times out. This guarantees the page's async data fetch has completed before the test proceeds. `domcontentloaded` only guarantees HTML parsing.

---

### Decision 2: Dialog guard pattern

Every page object method that opens a modal MUST await the dialog being visible before interacting with its inputs:

```typescript
// Pattern applied to createCategory, editCategory, and their ProductPage equivalents
await this.newCategoryButton.click();
await expect(this.dialog).toBeVisible();   // ← guard
await this.nameInput.fill(name);
```

**Rationale**: Modal animations and React state updates are asynchronous. Without the guard, `fill()` targets an element that is not yet in the DOM.

---

### Decision 3: Row-visibility guard before table-row actions

Every method that locates a row and then clicks an action inside it MUST first assert the row is visible:

```typescript
const row = this.categoryTable.getByRole('row', { name: new RegExp(name) });
await expect(row).toBeVisible();           // ← guard
await row.getByTitle('Edit category').click();
```

**Rationale**: After `goTo()` the table may still be loading its data from the API. Without this guard, `getByRole('row', ...)` finds no matching row and times out with an ambiguous error.

---

### Decision 4: `redirect-pos-login.spec.ts` — add reload and explicit navigation wait

**Do NOT add a navigation wait inside `LoginPage.login()`.**

`login-flow.spec.ts` contains four tests (1.3, 1.4, 1.5, 1.6) that submit invalid credentials and then assert the page *stays* on `/login`. Adding `waitForURL(!startsWith('/login'))` inside `login()` would cause those tests to timeout on a navigation that never happens, breaking them.

`LoginPage.login()` is a single-responsibility action — it fills and submits. Keep it that way.

The actual root cause of `redirect-pos-login.spec.ts` flakiness is different: both tests clear cookies and localStorage but **do not reload the page**. Without a reload, Next.js's client-side router retains the authenticated state in memory. The subsequent navigation to `/orders` is served by the in-memory router which still treats the user as logged in, so no redirect to `/login` occurs.

Fix at the call site in `redirect-pos-login.spec.ts`:

```typescript
// Before — missing reload
await page.context().clearCookies();
await storefrontPage.goTo();
await page.evaluate(() => localStorage.clear());
// ← no reload; Next.js router still has auth state in memory

// After — force Next.js to re-evaluate auth from cookies
await page.context().clearCookies();
await storefrontPage.goTo();
await page.evaluate(() => localStorage.clear());
await page.reload();   // ← clears the in-memory router state
```

Also add an explicit `page.waitForURL` after `loginPage.login()` in both redirect tests — `toHaveURL` is web-first and retries, but the explicit wait makes the intent clear:

```typescript
await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
await page.waitForURL(/^(?!.*login).*\/orders$/, { timeout: 15_000 });
```

**Rationale**: `logout-flow.spec.ts` already has `await page.reload()` after clearing localStorage and is stable. `redirect-pos-login.spec.ts` is missing exactly this step.

---

### Decision 5: Post-transition wait in `OrderPage.transitionStatus`

After clicking a status-transition button, wait for that button to disappear — which only happens after the API responds and the component re-renders:

```typescript
const button = this.page.getByRole('button', { name: actionName });
this.page.once('dialog', dialog => dialog.accept());
await button.click();
await expect(button).toBeHidden();        // ← confirms API round-trip complete
```

**Rationale**: Each transition is an async API call. Without waiting for the button to disappear, the subsequent `statusBadge` assertion races against the server response.

---

### Decision 6: `statusBadge` locator — scope to order detail header

Replace the page-wide `getByText(status).first()` with a scoped locator. The order detail header section is the only part of the page that shows the authoritative current status badge. Scoping with a parent `getByTestId` is the cleanest option if the component exposes a `data-testid`; otherwise scope via `getByRole('region')` or a named landmark.

```typescript
// Preferred if data-testid exists on the status badge component:
statusBadge(status: string): Locator {
  return this.page.getByTestId('order-status-badge').filter({ hasText: status });
}
// Fallback — scope to the page header region:
statusBadge(status: string): Locator {
  return this.page.getByRole('main').getByText(status, { exact: true }).first();
}
```

If neither approach is scoped enough, add `data-testid="order-status-badge"` to the frontend badge component. The data-testid approach is explicitly endorsed by Playwright best practices for state indicators that cannot be distinguished by role/label.

---

### Decision 7: Fix `SeededOrder` type — add `number: string`

```typescript
export interface SeededOrder {
  id: string;
  number: string;   // order number displayed in UI (e.g. "E2E-1234-5678")
  customerId: string;
  totalAmount: number;
  status: string;
}
```

**Rationale**: `createOrderApi` embeds `number` in the POST body and the API echoes it back. The missing field causes TypeScript to silently infer `any`, returning `undefined` at runtime. Every downstream assertion against `orderNumber` then fails.

---

### Decision 8: Fix audit log assertions — filter on row container

Chain two `.filter()` calls on the **row-level container**, not on a text-level node:

```typescript
// Before (broken): getByText returns a leaf node; filter on a leaf finds nothing
orderPage.auditLog.getByText('Pago').filter({ hasText: 'Preparação' })

// After: filter the row container that holds both values as child nodes
orderPage.auditLog.getByRole('row').filter({ hasText: 'Pago' }).filter({ hasText: 'Preparação' })
```

If the audit log renders items in `<div>` blocks rather than `<tr>` rows, use `getByTestId('audit-entry')` or `getByRole('listitem')` as the container selector.

---

### Decision 9: `addToCart` — navigate to product detail page

Replace the storefront-homepage `addToCart()` call in `fluxo-completo-carrinho.spec.ts` with a direct navigation to the seeded product's detail page:

```typescript
// StorefrontPage — new method
async addToCartForProduct(productId: string): Promise<this> {
  await this.page.goto(`/products/${productId}`);
  await expect(this.addToCartButton).toBeVisible();
  await this.addToCartButton.click();
  return this;
}
```

**Rationale**: The homepage shows multiple products in non-deterministic order. Calling `.first()` adds whichever product renders first, which may not be the seeded one.

---

### Decision 10: `press('Enter')` → `.click()` on confirmation buttons

```typescript
// Before
await this.confirmDeleteButton.press('Enter');

// After
await expect(this.confirmDeleteButton).toBeVisible();
await this.confirmDeleteButton.click();
```

**Rationale**: `press('Enter')` dispatches a keyboard event to the element but requires it to be focused. Focus can be lost to the dialog overlay or animation. `.click()` is unconditional and matches user intent.

---

### Decision 11: `test.setTimeout` — move to `describe` scope

```typescript
// Before — inside the test body
test('Admin can manage order lifecycle...', async () => {
  test.setTimeout(60000);

// After — at the describe level
test.describe('Order Lifecycle', () => {
  test.setTimeout(60_000);
  test('Admin can manage order lifecycle...', async () => {
```

**Rationale**: Per Playwright docs, `test.setTimeout` inside the test body resets the timer from that point — not from test start — which can silently allow the test to exceed the intended limit. Setting it at the `describe` scope applies the timeout from the beginning of each test.

---

### Decision 12: Remove inline `{ timeout }` overrides

The global config (`playwright.config.ts`) already sets `expect.timeout: 5_000` and `navigationTimeout: 15_000`. Inline overrides (`{ timeout: 5000 }`, `{ timeout: 10000 }`) on individual assertions are noise and become inconsistent if the global is changed.

Remove all inline `{ timeout }` from `category-management.spec.ts`, `product-management.spec.ts`, and `customer-management.spec.ts`. The only legitimate override is on assertions in `order-lifecycle.spec.ts` where the test legitimately needs more time (handled by Decision 11).

---

### Decision 13: `CustomerPage.ts` — same fixes as other admin list pages

`CustomerPage` has the same three problems as `CategoryPage` and `ProductPage`:

1. `goTo()` uses `waitForLoadState('domcontentloaded')` — replace with `await expect(this.heading.filter({ hasText: 'Clientes' })).toBeVisible()`.
2. `editCustomer()` reaches directly into a table row without confirming the row exists:
   ```typescript
   // Before
   await this.table.getByRole('row', { name: new RegExp(oldName) }).getByTitle('Editar').click();

   // After
   const row = this.table.getByRole('row', { name: new RegExp(oldName) });
   await expect(row).toBeVisible();
   await row.getByTitle('Editar').click();
   ```
3. `deleteCustomer()` same missing row-visibility guard before clicking the Excluir button.

`customer-management.spec.ts` is not currently in the failing list but carries the same race-condition risk as the other admin management specs. Its five inline `{ timeout: 10000 }` overrides are also cleaned up under Decision 12.

---

### Decision 14: `AdminDashboardPage.ts` — replace `waitForLoadState`

```typescript
// Before
async goTo(): Promise<this> {
  await this.page.goto('/admin');
  await this.page.waitForLoadState('domcontentloaded');
  return this;
}

// After
async goTo(): Promise<this> {
  await this.page.goto('/admin');
  await expect(this.heading).toBeVisible();
  return this;
}
```

**Rationale**: Consistency with all other page objects; `rotas-protegidas.spec.ts` test 4.2 navigates to `/admin` and checks a URL redirect, which currently races against the page load state.

---

### Decision 15: Post-cancel wait in `CustomerOrdersPage.cancelOrder`

After accepting the cancel dialog, wait for the cancel button to disappear before returning:

```typescript
const cancelButton = this.page.getByTestId('cancel-order-button');
await cancelButton.click();
await expect(cancelButton).toBeHidden();   // API confirmed, UI re-rendered
```

**Rationale**: `cancelOrder` currently returns immediately after the click. The spec then asserts `orderCard(orderId).getByText('Cancelado')` — which races against the server response.

---

## File Change Map

| File | Change type | Decisions applied |
|---|---|---|
| `tests/pages/CategoryPage.ts` | Modify | 1, 2, 3, 10 |
| `tests/pages/ProductPage.ts` | Modify | 1, 3 |
| `tests/pages/OrderPage.ts` | Modify | 1, 5, 6 |
| `tests/pages/CartPage.ts` | Modify | 1 |
| `tests/pages/CustomerOrdersPage.ts` | Modify | 1, 15 |
| `tests/pages/CheckoutPage.ts` | Modify | 1 |
| `tests/pages/StorefrontPage.ts` | Modify | 1, 9 |
| `tests/pages/CustomerPage.ts` | Modify | 1, 13 |
| `tests/pages/AdminDashboardPage.ts` | Modify | 14 |
| `tests/utils/api.ts` | Modify | 7 |
| `tests/category-management.spec.ts` | Modify | 12 |
| `tests/product-management.spec.ts` | Modify | 12 |
| `tests/customer-management.spec.ts` | Modify | 12 |
| `tests/order-lifecycle.spec.ts` | Modify | 8, 11 |
| `tests/order-management.spec.ts` | Verify | Benefits from OrderPage fixes (6); no direct edits required |
| `tests/fluxo-completo-carrinho.spec.ts` | Modify | 9 |
| `tests/redirect-pos-login.spec.ts` | Modify | 4 |

## Risks / Trade-offs

| Risk | Level | Mitigation |
|---|---|---|
| `data-testid="order-status-badge"` doesn't exist in the frontend component | Low | Inspect component first; add attribute if needed (single-line change to a React component). |
| Audit log uses `<div>` containers instead of `<tr>` rows | Low | Inspect DOM in devtools first; adjust container selector accordingly in `OrderPage`. |
| `page.reload()` in redirect tests clears all in-flight requests, adding ~200ms | Very Low | The reload is one-time per test in the setup step, not on the hot path. |
| `order-management.spec.ts` benefits indirectly — not explicitly tested | Low | Add to verification checklist in tasks to confirm no regressions. |
