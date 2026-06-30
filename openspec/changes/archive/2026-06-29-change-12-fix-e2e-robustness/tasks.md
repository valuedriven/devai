# Tasks — Fix E2E Test Robustness

## 1. Fix `SeededOrder` interface (pre-requisite for all order tests)

- [x] 1.1 In `apps/frontend/tests/utils/api.ts`, add `number: string` to the `SeededOrder` interface so `order.number` is typed and not `undefined` at runtime.

---

## 2. Harden page objects — replace `waitForLoadState` with web-first assertions

Apply Decision 1 from design.md to each page object's `goTo()` method.

- [x] 2.1 **`CategoryPage.ts`** — replace `waitForLoadState('domcontentloaded')` with:
  ```typescript
  await expect(this.heading).toBeVisible();
  await expect(this.categoryTable).toBeVisible();
  ```

- [x] 2.2 **`ProductPage.ts`** — replace `waitForLoadState` with:
  ```typescript
  await expect(this.heading.filter({ hasText: 'Produtos' })).toBeVisible();
  ```

- [x] 2.3 **`CartPage.ts`** — replace `waitForLoadState` with:
  ```typescript
  await expect(this.cartIcon).toBeVisible();
  ```

- [x] 2.4 **`CustomerOrdersPage.ts`** — replace `waitForLoadState` in both `goTo()` and `goToOrderDetail()` with:
  ```typescript
  await expect(this.heading).toBeVisible();
  ```

- [x] 2.5 **`StorefrontPage.ts`** — replace `waitForLoadState` with:
  ```typescript
  await expect(this.welcomeHeading).toBeVisible();
  ```
  Also replace in `gotoProductDetail()` with:
  ```typescript
  await expect(this.addToCartButton).toBeVisible();
  ```

- [x] 2.6 **`CheckoutPage.ts`** — replace `waitForLoadState` with:
  ```typescript
  await expect(this.addressInput).toBeVisible();
  ```

- [x] 2.7 **`OrderPage.ts`** — replace `waitForLoadState` in both `goTo()` and `goToOrderDetail()`:
  - In `goTo()`: `await expect(this.heading).toBeVisible();`
  - In `goToOrderDetail()`: `await expect(this.heading).toBeVisible();`

- [x] 2.8 **`CustomerPage.ts`** — replace `waitForLoadState` in `goTo()` with:
  ```typescript
  await expect(this.heading.filter({ hasText: 'Clientes' })).toBeVisible();
  ```

- [x] 2.9 **`AdminDashboardPage.ts`** — replace `waitForLoadState` in `goTo()` with:
  ```typescript
  await expect(this.heading).toBeVisible();
  ```

---

## 3. Add dialog guards before modal input interactions (`CategoryPage`)

- [x] 3.1 In `CategoryPage.createCategory()`, add `await expect(this.dialog).toBeVisible()` after clicking `newCategoryButton` and before calling `this.nameInput.fill(name)`.

- [x] 3.2 In `CategoryPage.editCategory()`, add `await expect(row).toBeVisible()` before clicking the edit button, then add `await expect(this.dialog).toBeVisible()` before filling the name input.

---

## 4. Add row-visibility guards before table-row actions

- [x] 4.1 In `CategoryPage.editCategory()`, add `await expect(row).toBeVisible()` before clicking the edit button (part of task 3.2).

- [x] 4.2 In `CategoryPage.deleteCategory()`, add `await expect(row).toBeVisible()` before clicking the delete button. Also replace `confirmDeleteButton.press('Enter')` with:
  ```typescript
  await expect(this.confirmDeleteButton).toBeVisible();
  await this.confirmDeleteButton.click();
  ```

- [x] 4.3 In `ProductPage.editProduct()`, add `await expect(row).toBeVisible()` before clicking the Editar button.

- [x] 4.4 In `ProductPage.deleteProduct()`, add `await expect(row).toBeVisible()` before clicking the Excluir button.

- [x] 4.5 In `CustomerPage.editCustomer()`, add `await expect(row).toBeVisible()` before clicking the Editar button:
  ```typescript
  const row = this.table.getByRole('row', { name: new RegExp(oldName) });
  await expect(row).toBeVisible();
  await row.getByTitle('Editar').click();
  ```

- [x] 4.6 In `CustomerPage.deleteCustomer()`, add `await expect(row).toBeVisible()` before clicking the Excluir button.

---

## 5. Fix `redirect-pos-login.spec.ts` — add reload and explicit navigation wait

**Do not modify `LoginPage.login()`** — adding a `waitForURL` guard inside it would break `login-flow.spec.ts` tests 1.3–1.6, which submit invalid credentials and assert the page stays on `/login`.

- [x] 5.1 In `apps/frontend/tests/redirect-pos-login.spec.ts`, in the `'clear authentication state'` step of **both** tests (9.1 and 9.2), add `await page.reload()` after `localStorage.clear()`:
  ```typescript
  await page.context().clearCookies();
  await storefrontPage.goTo();
  await page.evaluate(() => localStorage.clear());
  await page.reload();   // ← add this line; forces Next.js router to re-evaluate auth from cookies
  ```

- [x] 5.2 In the same file, after each `loginPage.login(...)` call, add an explicit navigation wait:
  ```typescript
  await loginPage.login(process.env.ADMIN_EMAIL!, process.env.ADMIN_PASSWORD!);
  await page.waitForURL(/^(?!.*login).*\/orders$/, { timeout: 15_000 });
  ```
  Apply the same pattern for the customer variant (test 9.2), pointing to the customer credentials.

---

## 6. Fix `OrderPage` — `statusBadge` locator and post-transition wait

- [x] 6.1 Inspect the order detail page in the browser to determine how the status badge is rendered. If the component has no unique structural parent, add `data-testid="order-status-badge"` to the badge element in the frontend React component (`apps/frontend/`).

- [x] 6.2 Update `OrderPage.statusBadge()`:
  ```typescript
  statusBadge(status: string): Locator {
    return this.page.getByTestId('order-status-badge').filter({ hasText: status });
  }
  ```

- [x] 6.3 Update `OrderPage.transitionStatus()` to wait for the action button to disappear after click (confirming the API round-trip completed):
  ```typescript
  async transitionStatus(actionName: string): Promise<this> {
    const button = this.page.getByRole('button', { name: actionName });
    this.page.once('dialog', dialog => dialog.accept());
    await button.click();
    await expect(button).toBeHidden();
    return this;
  }
  ```

---

## 7. Fix `CustomerOrdersPage.cancelOrder` — post-cancel wait

- [x] 7.1 In `CustomerOrdersPage.cancelOrder()`, after `cancelButton.click()`, add:
  ```typescript
  await expect(cancelButton).toBeHidden();
  ```
  This ensures the method only returns after the server confirms the cancellation and the button disappears.

---

## 8. Fix `StorefrontPage` — scope `addToCart` to the seeded product

- [x] 8.1 In `apps/frontend/tests/pages/StorefrontPage.ts`, add a new method:
  ```typescript
  async addToCartForProduct(productId: string): Promise<this> {
    await this.page.goto(`/products/${productId}`);
    await expect(this.addToCartButton).toBeVisible();
    await this.addToCartButton.click();
    return this;
  }
  ```

- [x] 8.2 In `apps/frontend/tests/fluxo-completo-carrinho.spec.ts`, replace the step `'add product to cart'`:
  ```typescript
  // Before
  await storefrontPage.addToCart();

  // After
  await storefrontPage.addToCartForProduct(product.id);
  ```
  Remove the intermediate `clear cookies / goTo / reload` steps that were needed only because the test was navigating to the homepage.

---

## 9. Fix audit log assertions (`order-lifecycle.spec.ts`)

- [x] 9.1 Inspect the audit log DOM in the browser to identify the container element for each entry (likely `<tr>`, `<li>`, or a `data-testid` div).

- [x] 9.2 Update `OrderPage.auditLog` accessor if needed. Then update the two broken assertions in `order-lifecycle.spec.ts`:
  ```typescript
  // Before
  await expect(orderPage.auditLog.getByText('Pago').filter({ hasText: 'Preparação' }).first()).toBeVisible();
  await expect(orderPage.auditLog.getByText('Despachado').filter({ hasText: 'Entregue' }).first()).toBeVisible();

  // After (assuming table rows)
  await expect(
    orderPage.auditLog.getByRole('row').filter({ hasText: 'Pago' }).filter({ hasText: 'Preparação' })
  ).toBeVisible();
  await expect(
    orderPage.auditLog.getByRole('row').filter({ hasText: 'Despachado' }).filter({ hasText: 'Entregue' })
  ).toBeVisible();
  ```

---

## 10. Fix `test.setTimeout` placement and remove inline timeout overrides

- [x] 10.1 In `order-lifecycle.spec.ts`, move `test.setTimeout(60000)` from inside the test body to the top of the `test.describe` block:
  ```typescript
  test.describe('Order Lifecycle', () => {
    test.setTimeout(60_000);
    test('Admin can manage order lifecycle...', async ({ ... }) => {
      // removed: test.setTimeout(60000)
  ```

- [x] 10.2 In `category-management.spec.ts`, remove all inline `{ timeout: 5000 }` overrides from `toBeHidden()` and `toBeVisible()` calls — these duplicate the global `expect.timeout: 5_000` already set in `playwright.config.ts`.

- [x] 10.3 In `product-management.spec.ts`, remove the inline `{ timeout: 10000 }` from `expect(productPage.dialog).toBeHidden()`.

- [x] 10.4 In `customer-management.spec.ts`, remove all five inline `{ timeout: 10000 }` overrides on `toastComponent.message(...)` and `customerPage.dialog.toBeHidden()` assertions.

---

## 11. Verification

- [x] 11.1 Run `npx playwright test --project=admin` and confirm all previously failing tests pass with zero retries.
- [x] 11.2 Run `npx playwright test --project=customer` and confirm `fluxo-completo-carrinho.spec.ts` passes.
- [x] 11.3 Explicitly run `npx playwright test order-management.spec.ts` and `npx playwright test customer-management.spec.ts` — both must pass (they benefit indirectly from page object fixes and are at risk from the same race patterns).
- [x] 11.4 Run the full suite 3 times consecutively to confirm stability (no non-deterministic failures).
- [x] 11.5 Run `npm run lint --workspace=frontend` and fix any new lint warnings.
