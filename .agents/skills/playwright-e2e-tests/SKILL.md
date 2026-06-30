---
name: playwright-e2e-tests
description: >
  Defines architectural standards, design patterns, and best practices for building
  scalable, maintainable, and reliable end-to-end tests using Playwright for the
  e-micro-commerce frontend (Next.js 16+ / App Router / TypeScript / Vanilla CSS).
  Use whenever implementing or modifying Playwright tests, Page Objects, Component Objects,
  fixtures, or supporting test infrastructure inside apps/frontend.
  Do NOT use for unit tests or backend integration tests.
---

# Playwright E2E Testing Skill — e-micro-commerce

## Project Context

Stack: Next.js 16+ · App Router · TypeScript · Vanilla CSS
Backend: NestJS REST API at `https://api.dominio.com/v1`
Identity: Clerk (custom UI — no Clerk SDK components allowed in frontend)
Monorepo path: `apps/frontend/`

```text
apps/frontend/src/
  app/           ← Next.js App Router pages
  components/    ← shared UI components
  features/      ← feature-specific components
  services/      ← API communication layer (only place that calls backend)
  hooks/
  types/
```

E2E tests validate **user-facing workflows** from the browser perspective. All business rules live in the backend — E2E tests must never try to test or replicate business logic; they validate what the user sees and can do.

---

## When E2E Tests Are Required

E2E tests are mandatory when **any** of the following is true:

- A new page, route, or user-facing workflow was added or modified
- An authentication or authorization flow was changed (custom login/logout forms — no Clerk components)
- A multi-step business workflow was affected (checkout, order creation, catalog browsing)
- A frontend ↔ backend integration path changed

---

## Core Principles

1. **Reliability** — deterministic tests that never flake
2. **Readability** — tests read like user stories
3. **Maintainability** — Page Objects isolate all UI change
4. **Test isolation** — no shared mutable state between tests
5. **Parallel execution** — no ordering dependencies
6. **Fast execution** — seed via API, not through UI flows

Prefer Playwright-native features. Never use Selenium-inspired patterns (`waitForSelector`, `waitForTimeout`, polling).

Always import `test` and `expect` from `baseTest.ts` — never directly from `@playwright/test`.

```ts
// ✔ Good
import { test, expect } from '../fixtures/baseTest';
// ✘ Bad — bypasses all custom fixtures
import { test, expect } from '@playwright/test';
```

### E2E Coverage Scope

E2E tests are expensive to write and run. Reserve them for **core business actions**
(login, checkout, order lifecycle, admin product management) — as a rule of thumb,
core-flow E2E coverage should sit around **30% of the total test suite**, with the
remainder handled by unit and component tests. Push purely visual/aesthetic checks
(spacing, font sizes, color contrast) to unit or visual-regression tooling, not Playwright
E2E specs.

---

## Directory Structure

```text
apps/frontend/
  playwright.config.ts
  .auth/
    customer.json      ← storageState cache (gitignored)
    admin.json
  src/
    fixtures/
      baseTest.ts      ← always import test/expect from here
    pages/
      LoginPage.ts
      CatalogPage.ts
      OrderPage.ts
      CheckoutPage.ts
      DashboardPage.ts    ← ADMIN dashboard
    components/
      NavigationComponent.ts
      OrderListComponent.ts
      ProductCardComponent.ts
    utils/
      data.ts            ← faker factories
      api.ts             ← API seeding helpers (calls backend directly)
    types/
      index.ts
  tests/
    auth/
      auth.setup.ts      ← storageState setup (customer + admin)
      login.spec.ts
      logout.spec.ts
    catalog/
      browse-products.spec.ts
    orders/
      create-order.spec.ts
      cancel-order.spec.ts
    admin/
      manage-products.spec.ts
      manage-orders.spec.ts
    smoke/
      smoke.spec.ts
```

---

## Page Object Model (POM)

### Responsibilities

A Page Object is responsible **only** for:
- UI locators (as `readonly` Playwright `Locator` properties)
- UI interaction methods
- Navigation methods
- Composing Component Objects for reusable fragments

A Page Object is **not** responsible for:
- Assertions or test validation
- Test data creation or API seeding
- Business logic or conditional test logic
- Raw DOM queries via `page.evaluate()`

### Locator Priority

Use user-facing selectors in this order:
1. `getByRole`
2. `getByLabel`
3. `getByPlaceholder`
4. `getByTestId`
5. `getByText`
6. CSS selectors (last resort only)

`getByRole()` is the most important locator in this list — it tracks the accessibility
tree rather than markup, so it survives DOM/CSS churn and doubles as an implicit
accessibility check. If deleting an element's `class` attribute wouldn't break the
user experience, it shouldn't break the locator either.

```ts
// ✔ Good
readonly emailInput    = this.page.getByRole('textbox', { name: /email/i });
readonly submitButton  = this.page.getByRole('button', { name: /entrar/i });
// ✘ Bad — brittle
readonly emailInput = this.page.locator('input[data-id="email-1"]');
```

Prefer chaining and `.filter()` to narrow a search instead of writing a single complex
selector — see "Chaining `.filter()`" below for the row-container rule.

### Assertions Stay in Tests

Never use `expect()` inside a Page Object.

```ts
// ✔ Good — assertion in the test
await loginPage.login(user.email, user.password);
await expect(catalogPage.heading).toBeVisible();
// ✘ Bad — assertion inside Page Object
async login() {
  await this.submitButton.click();
  await expect(this.page).toHaveURL('/catalog'); // never do this
}
```

### ARIA Snapshots for Whole-View Assertions

When a test needs to validate the overall structure of a view (e.g. a full order
summary panel, a dashboard sidebar) rather than one specific field, prefer
`toMatchAriaSnapshot()` over asserting individual DOM nodes one by one. It captures
the accessibility tree, so it catches meaningful semantic regressions (a button
becoming a link, a missing heading) while ignoring purely cosmetic CSS changes that
don't matter to a screen reader or to real users.

```ts
// ✔ Good — guards the whole region's structure resiliently
await expect(orderPage.summaryPanel).toMatchAriaSnapshot();
```

Use this for structural/regression coverage of a region; still use targeted
`toHaveText()` / `toBeVisible()` assertions (or `expect.soft()`, see below) when the
test cares about a specific value.

### Navigation Returns the Destination Page Object

`login()` is a single-responsibility action — it fills and submits. Never add navigation waits inside it. Tests that submit invalid credentials must be able to assert the page stays on `/login`.

```ts
// ✔ Good — single-responsibility action method
async login(email: string, password: string): Promise<void> {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.submitButton.click();
  // no waitForURL here — callers decide what to assert next
}
```

Never call `page.goto()` directly in a test — encapsulate it in the Page Object.

```ts
// ✔ Good — goTo() waits for meaningful content, not just HTML parse
async goTo(): Promise<this> {
  await this.page.goto('/login');
  await expect(this.heading).toBeVisible(); // web-first; retries until data loads
  return this;
}
// ✘ Bad — domcontentloaded fires before async API data loads
async goTo(): Promise<void> {
  await this.page.goto('/login');
  await this.page.waitForLoadState('domcontentloaded'); // ← race condition
}
// ✘ Bad — leaks page internals into the test
test('login', async ({ page }) => {
  await page.goto('/login');
});
```

The anchor element for `goTo()` must be one that only renders after the page's primary data fetch completes (e.g. a table, a heading that includes loaded data, or an input that is only mounted post-fetch).

### Dialog Guard Pattern

Every page object method that opens a modal MUST await the dialog being visible before interacting with its inputs. Modal animations and React state updates are asynchronous.

```ts
// ✔ Good — guard before filling
async createCategory(name: string): Promise<this> {
  await this.newCategoryButton.click();
  await expect(this.dialog).toBeVisible(); // ← guard
  await this.nameInput.fill(name);
  await this.saveButton.click();
  return this;
}
// ✘ Bad — fill() may target an element not yet in the DOM
async createCategory(name: string): Promise<this> {
  await this.newCategoryButton.click();
  await this.nameInput.fill(name); // race condition
}
```

### Row-Visibility Guard Before Table-Row Actions

Every method that locates a row and clicks an action inside it MUST first assert the row is visible. After `goTo()` the table may still be loading its data from the API.

```ts
// ✔ Good
async editCategory(name: string, newName: string): Promise<this> {
  const row = this.categoryTable.getByRole('row', { name: new RegExp(name) });
  await expect(row).toBeVisible();           // ← guard
  await row.getByTitle('Edit category').click();
  await expect(this.dialog).toBeVisible();   // ← dialog guard
  await this.nameInput.fill(newName);
  return this;
}
```

### Post-Mutation Visibility Guard

After any method that triggers an async API call (status transition, cancellation, delete), wait for the UI to confirm the round-trip completed — typically by waiting for the action button to disappear.

```ts
// ✔ Good — confirms API round-trip before returning
async transitionStatus(actionName: string): Promise<this> {
  const button = this.page.getByRole('button', { name: actionName });
  this.page.once('dialog', dialog => dialog.accept());
  await button.click();
  await expect(button).toBeHidden(); // ← confirms server responded and UI re-rendered
  return this;
}
// ✔ Good — cancel confirmation
async cancelOrder(): Promise<this> {
  const cancelButton = this.page.getByTestId('cancel-order-button');
  await cancelButton.click();
  await expect(cancelButton).toBeHidden(); // ← don't return until cancellation confirmed
  return this;
}
```

### Confirmation Buttons — Use `.click()` Not `press('Enter')`

`press('Enter')` dispatches a keyboard event and requires the element to be focused. Focus can be lost to dialog overlays or animations. Always use `.click()` on confirmation buttons, preceded by a visibility guard.

```ts
// ✔ Good
await expect(this.confirmDeleteButton).toBeVisible();
await this.confirmDeleteButton.click();
// ✘ Bad — depends on focus state
await this.confirmDeleteButton.press('Enter');
```

---

## Authentication

### Custom Forms — No Clerk SDK Components

The frontend implements its own login/logout forms. No Clerk `<SignIn>`, `<SignUp>`, `<UserButton>`, or equivalent components are used. E2E tests interact with those custom forms.

### Cache Sessions with `storageState`

Avoid logging in on every test. Generate one session per role.

```ts
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: '**/auth.setup.ts' },
    {
      name: 'customer',
      dependencies: ['setup'],
      use: { storageState: '.auth/customer.json' },
    },
    {
      name: 'admin',
      dependencies: ['setup'],
      use: { storageState: '.auth/admin.json' },
    },
  ],
});
```

```ts
// tests/auth/auth.setup.ts
import { test as setup } from '../../src/fixtures/baseTest';

setup('authenticate as customer', async ({ loginPage }) => {
  await loginPage.login(
    process.env.TEST_CUSTOMER_EMAIL!,
    process.env.TEST_CUSTOMER_PASSWORD!,
  );
  await loginPage.page.context().storageState({ path: '.auth/customer.json' });
});

setup('authenticate as admin', async ({ loginPage }) => {
  await loginPage.login(
    process.env.TEST_ADMIN_EMAIL!,
    process.env.TEST_ADMIN_PASSWORD!,
  );
  await loginPage.page.context().storageState({ path: '.auth/admin.json' });
});
```

Use `scope: 'worker'` for fixtures that consume cached auth state. Never use worker scope for fixtures that mutate state.

### Clearing Auth State — Always Reload After

When a test clears cookies and localStorage to simulate logout, always follow with `page.reload()`. Without it, Next.js's client-side router retains authenticated state in memory and subsequent navigations are served from the in-memory cache, bypassing the auth check.

```ts
// ✔ Good — forces Next.js router to re-evaluate auth from cookies
await page.context().clearCookies();
await storefrontPage.goTo();
await page.evaluate(() => localStorage.clear());
await page.reload(); // ← clears in-memory router state
// ✘ Bad — Next.js router still thinks the user is logged in
await page.context().clearCookies();
await page.evaluate(() => localStorage.clear());
// missing reload; redirect assertions will fail non-deterministically
```

---

## Fixtures and Dependency Injection

### Use `test.extend` — Never Instantiate Page Objects Manually

```ts
// ✘ Bad
beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page);
});
// ✔ Good
export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    const p = new LoginPage(page);
    await p.goTo();
    await use(p);
  },
});
```

### Base Fixture File

```ts
// src/fixtures/baseTest.ts
import { test as base } from '@playwright/test';
import { LoginPage }   from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { OrderPage }   from '../pages/OrderPage';

type Fixtures = {
  loginPage:   LoginPage;
  catalogPage: CatalogPage;
  orderPage:   OrderPage;
};

export const test = base.extend<Fixtures>({
  loginPage:   async ({ page }, use) => { const p = new LoginPage(page);   await p.goTo(); await use(p); },
  catalogPage: async ({ page }, use) => { await use(new CatalogPage(page)); },
  orderPage:   async ({ page }, use) => { await use(new OrderPage(page));   },
});

export { expect } from '@playwright/test';
```

### Fixture Teardown

Always clean up resources created in fixtures.

```ts
seededProduct: async ({ request }, use) => {
  const product = await createProductViaApi(request);
  await use(product);
  await deleteProductViaApi(request, product.id); // teardown
},
```

### Aborting on Broken Preconditions

If a fixture or `beforeEach` setup step fails (e.g. a required seed API call returns an
unexpected status, or an environment variable is missing), call `test.abort("reason")`
rather than letting the test fail naturally. This marks the run as an environment/setup
problem in the report instead of a product regression, which keeps triage signal clean.

```ts
test.beforeEach(async ({ request }) => {
  const health = await request.get('/v1/health');
  if (!health.ok()) {
    test.abort('Backend health check failed — environment is not ready for E2E run');
  }
});
```

---

## Test Data

### Seed via API — Never via UI

Never navigate through the UI just to create prerequisite data. Call the backend API directly using Playwright's `request` fixture.

```ts
// src/utils/api.ts
export async function createProductViaApi(
  request: APIRequestContext,
  overrides = {},
): Promise<Product> {
  const response = await request.post('/v1/catalog/products', {
    headers: { Authorization: `Bearer ${process.env.TEST_ADMIN_TOKEN}` },
    data: makeProduct(overrides),
  });
  return response.json();
}
```

### Seeded Resource Types Must Be Fully Typed

Every interface returned by API helpers must include all fields the test will reference. A missing field silently infers `any` and returns `undefined` at runtime — causing assertion failures that appear as locator mismatches.

```ts
// ✔ Good — all fields that tests reference are present
export interface SeededOrder {
  id: string;
  number: string;   // e.g. "E2E-1234-5678" — displayed in UI; must be typed
  customerId: string;
  totalAmount: number;
  status: string;
}
// ✘ Bad — missing number field; order.number is undefined at runtime
export interface SeededOrder {
  id: string;
  customerId: string;
  totalAmount: number;
  status: string;
}
```

### Scope Data-Dependent Actions to the Seeded Resource

Never use `.first()` or positional selectors on lists that may contain multiple items. Navigate directly to the seeded resource's detail or use its ID to scope the interaction.

```ts
// ✔ Good — navigates to the specific seeded product's detail page
async addToCartForProduct(productId: string): Promise<this> {
  await this.page.goto(`/products/${productId}`);
  await expect(this.addToCartButton).toBeVisible();
  await this.addToCartButton.click();
  return this;
}
// ✘ Bad — adds whichever product renders first; non-deterministic
async addToCart(): Promise<this> {
  await this.addToCartButton.first().click();
  return this;
}
```

### Unique Values

Use `@faker-js/faker` for all generated values. Never hardcode values that could collide across parallel workers.

```ts
// src/utils/data.ts
import { faker } from '@faker-js/faker';

export const makeProduct = (overrides = {}) => ({
  name:  faker.commerce.productName(),
  price: parseFloat(faker.commerce.price({ min: 1, max: 500 })),
  stock: faker.number.int({ min: 1, max: 100 }),
  ...overrides,
});
```

### Reset State Between Runs

Test data lifecycle should be self-contained per test (create → use → teardown via
fixture teardown, see above). For any data that can't be cleaned up per-test — e.g.
shared seed/reference data — rely on database snapshots or scheduled teardown jobs so
runs do not inherit dirty state from a previous suite execution.

---

## Test Structure

### Arrange–Act–Assert

```ts
test('customer can place an order', async ({ request, catalogPage, orderPage }) => {
  // Arrange
  const product = await createProductViaApi(request, { stock: 5 });

  // Act
  await catalogPage.goTo();
  const checkout = await test.step('add to cart and checkout', async () => {
    await catalogPage.addToCart(product.name);
    return catalogPage.goToCheckout();
  });

  // Assert
  await expect(checkout.orderConfirmation).toBeVisible();
});
```

### `test.step()` for Readability

Use `test.step()` whenever a test has more than two logical phases. Steps appear in the HTML report and Playwright trace viewer. Name tests and steps for the specific failure they'd surface — write them so the trace viewer reads like a sentence describing the behavior under test (e.g. `"checkout charges the card and shows the order number"`), not a vague phase label.

```ts
test('admin creates a product', async ({ adminPage }) => {
  await test.step('fill product form', async () => {
    await adminPage.fillProductForm(makeProduct());
  });
  await test.step('submit and verify', async () => {
    await adminPage.submitProductForm();
    await expect(adminPage.successMessage).toBeVisible();
  });
});
```

### `test.describe()` Grouping

`describe` names the feature or page; `test` names the specific user behavior.

```ts
test.describe('Catalog page', () => {
  test('displays active products to unauthenticated users', async ({ catalogPage }) => { ... });
  test('shows product details on click', async ({ catalogPage }) => { ... });
});
```

### `test.setTimeout` — Declare at `describe` Scope, Never Inside the Test Body

`test.setTimeout()` inside the test body resets the timer from that point — not from test start — which can silently allow the test to run longer than intended.

```ts
// ✔ Good — timeout applies from the start of every test in this describe
test.describe('Order Lifecycle', () => {
  test.setTimeout(60_000);

  test('Admin can manage order lifecycle...', async ({ ... }) => {
    // no test.setTimeout here
  });
});
// ✘ Bad — timer resets mid-test; first N seconds are unguarded
test('Admin can manage order lifecycle...', async ({ ... }) => {
  test.setTimeout(60_000); // too late; doesn't cover setup time
});
```

Use `test.slow()` as an alternative when you don't need a precise value — it triples the global timeout automatically.

### Inline `{ timeout }` Overrides — Remove Them

Never pass `{ timeout }` to individual `expect()` calls. The global `expect.timeout` in `playwright.config.ts` already covers normal assertions. Inline overrides create inconsistency and silently shadow the global config.

```ts
// ✔ Good — trusts global config
await expect(dialog).toBeHidden();
// ✘ Bad — duplicates or overrides global; becomes stale when config changes
await expect(dialog).toBeHidden({ timeout: 5000 });
```

The only legitimate per-assertion timeout override is in tests that genuinely require extra time (e.g. an order lifecycle test with `test.setTimeout` set at the `describe` level).

### Chaining `.filter()` — Always Filter the Row Container, Not a Text Node

`.getByText()` returns a leaf text node. Calling `.filter({ hasText })` on a leaf finds nothing because the sibling text is not a descendant. Always chain `.filter()` calls on the container element that holds both values as children.

```ts
// ✔ Good — filter on the row container
await expect(
  orderPage.auditLog.getByRole('row').filter({ hasText: 'Pago' }).filter({ hasText: 'Preparação' })
).toBeVisible();
// ✘ Bad — getByText returns a leaf node; filter on a leaf never matches sibling text
await expect(
  orderPage.auditLog.getByText('Pago').filter({ hasText: 'Preparação' }).first()
).toBeVisible();
```

If the list renders `<div>` blocks instead of `<tr>` rows, use `getByTestId('audit-entry')` or `getByRole('listitem')` as the container selector.

### Soft Assertions

Use `expect.soft()` when validating multiple independent properties of a single state, so the test reports every failing field in one run instead of stopping at the first.

```ts
test('order summary shows correct details', async ({ orderPage }) => {
  await expect.soft(orderPage.productName).toHaveText(product.name);
  await expect.soft(orderPage.total).toHaveText(`R$ ${product.price}`);
  await expect.soft(orderPage.status).toHaveText('Aguardando pagamento');
});
```

---

## Critical Workflows to Cover

### Public (unauthenticated)
- Browse catalog (list products, view product detail)

### CUSTOMER
- Login with custom form → redirected to catalog
- Place an order (catalog → cart → checkout → confirmation)
- View own orders
- Cancel an unpaid order
- Logout

### ADMIN
- Login → dashboard
- Create / edit / delete a product
- View all orders
- Register a payment

---

## RBAC Validation in E2E

Test that protected routes redirect unauthenticated and unauthorized users correctly.

```ts
test('unauthenticated user is redirected from orders page', async ({ page }) => {
  await page.goto('/orders');
  await expect(page).toHaveURL('/login');
});

test('customer cannot access admin dashboard', async ({ page }) => {
  // Uses customer storageState
  await page.goto('/admin/dashboard');
  await expect(page).toHaveURL(/\/403|\/login/);
});
```

---

## Network Interception

Use `page.route()` to stub flaky or slow third-party integrations (payment gateways,
shipping/weather lookups, etc.). E2E tests should validate *our* UI behavior, not the
reliability of a third-party service — mocking lets you assert how the frontend reacts
to specific responses (success, timeout, 5xx) deterministically, without depending on
the real provider being up. This does not replace backend integration tests — use it to
simulate edge cases in the UI only.

```ts
test('shows payment error when gateway is unavailable', async ({ page, checkoutPage }) => {
  await page.route('**/v1/payments', (route) =>
    route.fulfill({ status: 503, body: JSON.stringify({ title: 'Service unavailable', status: 503 }) }),
  );
  await checkoutPage.submitPayment(makeCard());
  await expect(checkoutPage.errorMessage).toBeVisible();
});
```

---

## Component Objects

For reusable UI fragments (navigation, modals, order list, product cards), create Component Objects scoped to a root locator.

```ts
export class ProductCardComponent {
  constructor(private readonly root: Locator) {}

  readonly name      = this.root.getByRole('heading');
  readonly price     = this.root.getByTestId('price');
  readonly addButton = this.root.getByRole('button', { name: /adicionar/i });

  async addToCart(): Promise<void> {
    await this.addButton.click();
  }
}
```

Page Objects compose Component Objects:

```ts
export class CatalogPage {
  productCard = (name: string) =>
    new ProductCardComponent(this.page.getByTestId(`product-card-${name}`));
}
```

---

## Configuration

```ts
// playwright.config.ts
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL:    process.env.TEST_BASE_URL ?? 'http://localhost:3000',
    trace:      'on-first-retry',
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
  },
});
```

Environment variables used by E2E tests come from the single `.env` at the monorepo root — never from a local `.env.test` or per-app env file.

### Slow Tests

Use `test.slow()` instead of raising the global timeout.

```ts
test('large order export', async ({ adminPage }) => {
  test.slow();
  await adminPage.exportOrders();
  await expect(adminPage.downloadLink).toBeVisible();
});
```

### Lint Enforcement for Async Safety

A missing `await` on an async Playwright call is one of the most common causes of
flaky tests — the test moves on before the action or assertion has actually settled.
Enforce this at the repo level rather than relying on review: add the
`@typescript-eslint/no-floating-promises` ESLint rule to the frontend's lint config so
floating promises fail CI before a flaky test ever lands.

```jsonc
// .eslintrc (relevant excerpt)
{
  "rules": {
    "@typescript-eslint/no-floating-promises": "error"
  }
}
```

---

## Best Practices

- Each test starts from a clean state and creates its own data
- Never depend on another test's side effects or execution order
- Never use `page.waitForTimeout()` — use web-first assertions instead
- Never use `page.waitForSelector()` — use `locator.waitFor()`
- Never use `page.evaluate()` for DOM state that a locator can express
- Use `expect(locator).toHaveText(...)` — not `const t = await locator.textContent(); expect(t).toBe(...)`
- Keep each test to a single user behavior
- `goTo()` must wait for meaningful content, not just `domcontentloaded` — the anchor element must only render after the page's primary data fetch completes
- Add dialog visibility guards before any modal input interaction
- Add row visibility guards before any table-row action
- Add post-mutation guards (wait for button/element to disappear) after async API calls
- After clearing auth state, always call `page.reload()` before asserting navigation behavior
- Action methods (e.g. `login()`) are single-responsibility — add navigation waits at the call site, not inside the method
- All seeded resource interfaces must type every field the test references — never rely on implicit `any`
- Chain `.filter()` on row containers, not on leaf text nodes
- Navigate to a seeded resource by ID — never use `.first()` on multi-item lists
- Prefer `toMatchAriaSnapshot()` for whole-view structural assertions over asserting many individual DOM nodes
- Mock third-party dependencies with `page.route()` rather than letting tests depend on a live external provider
- Call `test.abort("reason")` when a fixture/precondition fails, instead of letting setup failures masquerade as product bugs
- Enforce `@typescript-eslint/no-floating-promises` in CI to catch missing `await`s before they cause flake
- Keep E2E coverage focused on core business flows (~30% of total suite); push aesthetic checks to unit tests

---

## Anti-Patterns

| Anti-pattern                                           | Correct Approach                                                      |
|--------------------------------------------------------|-------------------------------------------------------------------------|
| `expect()` inside Page Objects                         | All assertions in `*.spec.ts` files                                   |
| `import { test } from '@playwright/test'`              | Always import from `baseTest.ts`                                      |
| `new LoginPage(page)` inside tests                     | Use `test.extend` fixtures                                            |
| UI flows to create prerequisite data                   | Seed via backend API using `request` fixture                          |
| `page.waitForTimeout()` / `sleep()`                    | Web-first assertions or `locator.waitFor()`                           |
| `waitForLoadState('domcontentloaded')` in `goTo()`     | `await expect(<contentElement>).toBeVisible()` after `page.goto()`   |
| No dialog-visibility guard before modal inputs         | `await expect(this.dialog).toBeVisible()` before any `.fill()`       |
| No row-visibility guard before table-row actions       | `await expect(row).toBeVisible()` before clicking row actions        |
| No post-mutation wait after async API call             | `await expect(button).toBeHidden()` to confirm round-trip complete   |
| `press('Enter')` on confirmation buttons               | `await expect(btn).toBeVisible(); await btn.click()`                 |
| `.getByText().filter({ hasText })` on leaf text nodes  | `.getByRole('row').filter({…}).filter({…})` on row container         |
| `addToCart()` with `.first()` on product lists         | Navigate to seeded product's detail page by ID                       |
| Missing fields in seeded resource interfaces           | Type every field the test references; never rely on implicit `any`   |
| `test.setTimeout()` inside the test body                | Declare at `test.describe` scope                                      |
| Inline `{ timeout }` overrides on `expect()` calls      | Trust global `expect.timeout`; remove overrides                      |
| Clearing cookies/localStorage without `page.reload()`   | Always call `await page.reload()` after clearing auth state          |
| Navigation waits inside `login()` action method          | Keep `login()` single-responsibility; add waits at the call site     |
| Hardcoded emails or product names                       | `@faker-js/faker` generated unique values                            |
| Tests that depend on execution order                    | Each test owns its full data lifecycle                               |
| Raising global timeout for one slow test                | Use `test.slow()` locally                                            |
| Using Clerk SDK components                               | Use custom form Page Objects only                                    |
| Creating `.env.test` or per-app env files                | Single `.env` at monorepo root                                       |
| Skipping RBAC redirect tests                              | Mandatory for all protected routes                                   |
| Asserting many raw DOM nodes for a whole view             | `toMatchAriaSnapshot()` for structural/regression coverage           |
| Letting tests hit live third-party providers              | Mock with `page.route()`                                             |
| Letting broken fixtures fail tests silently as "bugs"     | `test.abort("reason")` to flag environment/setup failures clearly    |
| Missing `await` on async Playwright calls                 | Enforce `@typescript-eslint/no-floating-promises` in CI              |

---

## Quality Checklist

Before considering an E2E test complete:

- [ ] Imports `test` and `expect` from `baseTest.ts`
- [ ] Uses Page Objects — no raw `page.goto()` or `page.locator()` in tests
- [ ] Seeds data via API — not through UI flows
- [ ] Uses `@faker-js/faker` for unique test data
- [ ] Uses `storageState` for authenticated sessions — not UI login per test
- [ ] Covers happy path, failure path, and relevant edge cases
- [ ] Covers RBAC: unauthenticated redirect, role-based access
- [ ] Uses `test.step()` for multi-phase tests, named for the behavior under test
- [ ] Uses web-first assertions — no `waitForTimeout`
- [ ] Fixture teardown cleans up created resources
- [ ] Does not rely on execution order
- [ ] Does not assert business logic — only UI behavior
- [ ] Critical workflows covered: catalog browsing, order creation, admin product management
- [ ] `goTo()` uses web-first assertion (not `waitForLoadState`) anchored on post-fetch content
- [ ] Every modal-open method has a dialog-visibility guard before input interaction
- [ ] Every table-row action method has a row-visibility guard before clicking
- [ ] Every async API call method has a post-mutation guard (wait for button/indicator to disappear)
- [ ] Confirmation buttons use `.click()`, not `press('Enter')`
- [ ] Chained filter assertions use row containers, not leaf text nodes
- [ ] `addToCart` (and similar) navigates to the seeded resource by ID — no `.first()` on product lists
- [ ] All seeded resource interfaces type every field referenced in tests
- [ ] `test.setTimeout` declared at `describe` scope, not inside test body
- [ ] No inline `{ timeout }` overrides on individual `expect()` calls
- [ ] Auth-state-clearing tests call `page.reload()` after clearing cookies/localStorage
- [ ] Whole-view structural checks use `toMatchAriaSnapshot()` rather than many discrete DOM assertions
- [ ] Third-party integrations (payments, external lookups) are mocked via `page.route()`, not hit live
- [ ] Fixtures abort with `test.abort("reason")` on broken preconditions instead of failing as a product bug
- [ ] Repo's ESLint config enforces `@typescript-eslint/no-floating-promises`