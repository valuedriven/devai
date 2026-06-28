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

```ts
// ✔ Good
readonly emailInput    = this.page.getByRole('textbox', { name: /email/i });
readonly submitButton  = this.page.getByRole('button', { name: /entrar/i });

// ✘ Bad — brittle
readonly emailInput = this.page.locator('input[data-id="email-1"]');
```

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

### Navigation Returns the Destination Page Object

```ts
async login(email: string, password: string): Promise<CatalogPage> {
  await this.emailInput.fill(email);
  await this.passwordInput.fill(password);
  await this.submitButton.click();
  await this.page.waitForLoadState('networkidle');
  return new CatalogPage(this.page);
}
```

Never call `page.goto()` directly in a test — encapsulate it in the Page Object.

```ts
// ✔ Good
async goTo(): Promise<void> {
  await this.page.goto('/login');
  await this.page.waitForLoadState('domcontentloaded');
}

// ✘ Bad
test('login', async ({ page }) => {
  await page.goto('/login'); // leaks page internals
});
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

Use `test.step()` whenever a test has more than two logical phases. Steps appear in the HTML report and Playwright trace viewer.

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

### Soft Assertions

Use `expect.soft()` when validating multiple independent properties of a single state.

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

Use `page.route()` to stub flaky or slow third-party integrations. This does not replace backend integration tests — use it to simulate edge cases in the UI only.

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

---

## Best Practices

- Each test starts from a clean state and creates its own data
- Never depend on another test's side effects or execution order
- Never use `page.waitForTimeout()` — use web-first assertions instead
- Never use `page.waitForSelector()` — use `locator.waitFor()`
- Never use `page.evaluate()` for DOM state that a locator can express
- Use `expect(locator).toHaveText(...)` — not `const t = await locator.textContent(); expect(t).toBe(...)`
- Keep each test to a single user behavior

---

## Anti-Patterns

| Anti-pattern                               | Correct Approach                                    |
|--------------------------------------------|-----------------------------------------------------|
| `expect()` inside Page Objects             | All assertions in `*.spec.ts` files                 |
| `import { test } from '@playwright/test'`  | Always import from `baseTest.ts`                    |
| `new LoginPage(page)` inside tests         | Use `test.extend` fixtures                          |
| UI flows to create prerequisite data       | Seed via backend API using `request` fixture        |
| `page.waitForTimeout()` / `sleep()`        | Web-first assertions or `locator.waitFor()`         |
| Hardcoded emails or product names          | `@faker-js/faker` generated unique values           |
| Tests that depend on execution order       | Each test owns its full data lifecycle              |
| Raising global timeout for one slow test   | Use `test.slow()` locally                           |
| Accessing `/catalog` without `/v1` (API)   | Only applies to page routes, not API calls          |
| Using Clerk SDK components                 | Use custom form Page Objects only                   |
| Creating `.env.test` or per-app env files  | Single `.env` at monorepo root                      |
| Skipping RBAC redirect tests               | Mandatory for all protected routes                  |

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
- [ ] Uses `test.step()` for multi-phase tests
- [ ] Uses web-first assertions — no `waitForTimeout`
- [ ] Fixture teardown cleans up created resources
- [ ] Does not rely on execution order
- [ ] Does not assert business logic — only UI behavior
- [ ] Critical workflows covered: catalog browsing, order creation, admin product management