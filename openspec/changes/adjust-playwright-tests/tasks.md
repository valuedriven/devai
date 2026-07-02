# Implementation Tasks

## Phase 1 — Infrastructure

### 1.1 ESLint: Add `no-floating-promises` rule
- [x] Add `@typescript-eslint/no-floating-promises: 'error'` to `eslint.config.mjs` for `tests/**` files

### 1.2 Data Layer: Order/OrderItem factories
- [x] In `data.ts`, add `OrderItemData` interface (`productId`, `quantity`, `unitPrice?`)
- [x] In `data.ts`, add `OrderData` interface (`customerId`, `totalAmount`, `items: OrderItemData[]`)
- [x] In `data.ts`, add `makeOrderItem(productId, ...)` factory
- [x] In `data.ts`, add `makeOrder(customerId, items, ...)` factory

### 1.3 API Layer: Refactor `createOrderApi`
- [x] In `api.ts`, replace anonymous inline type with `OrderData`
- [x] Map `OrderData.items` -> `order_items` internally in `createOrderApi`
- [x] Export `API_BASE` so test files can import it

### 1.4 Fixtures: `seededOrder` + `test.abort()`
- [x] In `baseTest.ts`, add `seededOrder` fixture (depends on `seededProduct` + `seededCustomer`)
- [x] Add `test.abort('reason')` guards to `seededCategory`, `seededProduct`, `seededCustomer`, `seededOrder` fixtures

---

## Phase 2 — Page Object Fixes

### 2.1 OrderPage.ts
- [x] `openPaymentModal()`: Add `await expect(dialog).toBeVisible()` after clicking
- [x] `fillPaymentForm()`: Replace `press('Enter')` -> `.click()` on submit button
- [x] `fillPaymentForm()`: Replace `waitFor({ state: 'visible' })` -> `expect(...).toBeVisible()`
- [x] `viewOrder()`: Remove `.first()` — scope to specific seeded resource

### 2.2 ProductPage.ts
- [x] `deleteProduct()`: Add dialog guard (`await expect(this.dialog).toBeVisible()`) before confirm click
- [x] `deleteProduct()`: Add post-mutation guard (`await expect(this.dialog).toBeHidden()`) after confirm
- [x] `fillProductDetails()`: Replace `waitFor({ state: 'attached' })` -> `expect(...).toBeAttached()`

### 2.3 CustomerPage.ts
- [x] `deleteCustomer()`: Add dialog guard before confirm click
- [x] `deleteCustomer()`: Add post-mutation guard after confirm

### 2.4 CartPage.ts
- [x] `clickLogin()`: Remove `waitForURL` — callers will assert destination

### 2.5 CustomerOrdersPage.ts
- [x] `cancelOrder()`: Remove `waitForURL` — callers will assert destination
- [x] `cancelOrder()`: Remove inline `page.goto('/orders')` — callers navigate

### 2.6 StorefrontPage.ts
- [x] `gotoProductDetail()`: Add anchor assertion (e.g. `expect(this.heading).toBeVisible()`)
- [x] Review `.first()` usage on `outOfStockBadge`, `price`, `productCardByName`

### 2.7 LoginPage.ts
- [x] `login()`: Replace `locator('form.login-form[data-state="ready"]').waitFor()` with web-first assertion

---

## Phase 3 — Test File Refactoring

### 3.1 product-management.spec.ts
- [x] Remove `page.waitForURL('**/admin/products', { timeout: 15000 })` (2 occurrences)
- [x] Replace with `expect(productPage.heading.filter({...})).toBeVisible()`
- [x] Remove `page.waitForURL('/')` after login
- [x] Remove `page.goto('/admin/products')` — use `productPage.goTo()`
- [x] Use seeded product fixture where applicable

### 3.2 customer-management.spec.ts
- [x] Remove `page.waitForURL('**/admin/customers', { timeout: 15000 })` (2 occurrences)
- [x] Remove `page.waitForURL(...)` with timeout in search test (L136)
- [x] Remove `page.waitForURL('**/admin/customers/${id}/edit', { timeout: 10000 })` (L161)
- [x] Remove `try/finally` manual cleanup (L93-117)
- [x] Replace inline anonymous order data (L95-99) with `makeOrder()`
- [x] Remove `page.waitForURL('/')` after login (L216)
- [x] Remove raw `page.goto('/admin/customers')` (L220) — use POM
- [x] Replace hardcoded values (`'Duplicate Name'`, `'11999999999'`) with faker

### 3.3 storefront-catalog.spec.ts
- [x] Remove hardcoded `API_BASE` constant (L6) — import from `api.ts`
- [x] Use `seededProduct` fixture for product tests (L13, 27)
- [x] Remove inline teardown (`deleteProduct`/`deleteCategory` at test end)
- [x] Remove `page.waitForURL` (L150)
- [x] Use `seededProduct`/`seededCategory` fixtures where applicable

### 3.4 fluxo-completo-carrinho.spec.ts
- [x] Remove `try/finally` manual cleanup (2 blocks)
- [x] Remove `page.waitForURL` (4 occurrences: L95, L104, L115, L123)
- [x] Replace with visibility assertions on destination elements
- [x] Use `seededProduct` fixture
- [x] Replace `localStorage.removeItem('devai_auth_token')` with `localStorage.clear()`

### 3.5 order-lifecycle.spec.ts
- [x] Replace inline anonymous order data (L26-30) with `makeOrder()` + `makeOrderItem()`
- [x] Consider using `seededOrder` fixture for the single-order case
- [x] Add teardown for seeded customer/product (or use fixtures)

### 3.6 order-management.spec.ts
- [x] Replace inline anonymous order data (3 occurrences) with `makeOrder()` + `makeOrderItem()`
- [x] Remove hardcoded `API_BASE` (L14) — import from `api.ts`
- [x] Add teardown for seeded entities (or use fixtures where applicable)

### 3.7 redirect-pos-login.spec.ts
- [x] Remove `page.waitForURL` with `{ timeout: 15_000 }` (L26, L55)
- [x] Replace with visibility assertion on `customerOrdersPage.heading`

### 3.8 category-management.spec.ts
- [x] Remove `page.waitForURL('/')` after login (L78)
- [x] The raw `page.goto('/admin/categories')` (L82) is in a RBAC test — this is acceptable per skill
- [x] Add teardown for seeded categories in tests 9.2 and 9.3 (or use fixture)

### 3.9 API test files (hardcoded URLs)
- [x] `api-auth-me.spec.ts`: Replace `'http://localhost:3001/api/v1/auth/me'` with `API_BASE`
- [x] `api-endpoints-publicos.spec.ts`: Replace hardcoded URLs with `API_BASE`
- [x] `api-token-validation.spec.ts`: Replace hardcoded URLs with `API_BASE`

### 3.10 auth.setup.ts
- [x] Replace `page.waitForURL('/')` (L22, L43) with visibility assertion on post-login element
- [x] Replace raw `page.getByTestId('user-dropdown-container')` with NavigationComponent locator (nice-to-have)
