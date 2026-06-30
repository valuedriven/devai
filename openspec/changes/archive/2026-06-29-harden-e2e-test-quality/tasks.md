## 1. Security: Auth State & Credentials

- [x] 1.1 Fix `apps/frontend/.gitignore` to correctly ignore `tests/.auth/` directory (remove any malformed `\n` prefix)
- [x] 1.2 Fix root `.gitignore` to use correct path `apps/frontend/tests/.auth/` instead of `playwright/.auth/`
- [x] 1.3 Run `git rm --cached apps/frontend/tests/.auth/admin.json apps/frontend/tests/.auth/customer.json` to untrack auth state files
- [x] 1.4 Remove hardcoded credential fallbacks from `redirect-pos-login.spec.ts` — replace `process.env.X || 'email'` with `process.env.X!`
- [x] 1.5 Remove hardcoded credential fallbacks from `category-management.spec.ts` test 9.4
- [x] 1.6 Remove hardcoded credential fallbacks from `product-management.spec.ts` non-admin test
- [x] 1.7 Remove hardcoded credential fallbacks from `customer-management.spec.ts` non-admin test
- [x] 1.8 Add `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD` to root `.env.example` with placeholder values

## 2. Dependencies

- [x] 2.1 Install `@faker-js/faker` as devDependency in `apps/frontend`
- [x] 2.2 Remove `@clerk/testing` from `apps/frontend` devDependencies

## 3. Data Factories

- [x] 3.1 Rewrite `tests/utils/data.ts` to import and use `@faker-js/faker` for `makeCategory()`, `makeProduct()`, and `makeCustomer()` factories — remove the manual `uid()` function
- [ ] 3.2 Verify all existing tests pass with new faker-based factories (data shape must remain compatible with API contracts)

## 4. API Utilities

- [x] 4.1 Replace `expect()` calls in `tests/utils/api.ts` (`getAuthToken`, `createCategory`, `createProduct`, `createCustomerApi`, `createOrderApi`) with thrown `Error` objects that include the same diagnostic context (status + response body)
- [x] 4.2 Remove the `import { expect } from '@playwright/test'` from `utils/api.ts` after all `expect()` calls are replaced

## 5. Component Objects

- [x] 5.1 Create `tests/components/ProductCardComponent.ts` with user-facing locators: name (heading role), price (testId), addButton (button role `/adicionar/i`), outOfStockBadge (`getByText('Esgotado')`), unavailableButton (button role `/indisponível/i`)
- [x] 5.2 Update `StorefrontPage.ts` to compose `ProductCardComponent` via a `productCard(name)` method that returns a scoped component instance

## 6. Fixture Improvements

- [x] 6.1 Add `seededProduct` fixture to `tests/fixtures/baseTest.ts` — depends on `seededCategory` and `adminAuthToken`, creates product via API, deletes in teardown
- [x] 6.2 Add `seededCustomer` fixture to `tests/fixtures/baseTest.ts` — depends on `adminAuthToken`, creates customer via API, deletes in teardown
- [x] 6.3 Refactor `storefront-catalog.spec.ts` tests 2.2 and 2.4 to use `seededProduct` fixture instead of manual `try/finally` teardown where applicable
- [x] 6.4 Refactor `fluxo-completo-carrinho.spec.ts` test 10.0 to use `seededProduct` fixture instead of manual `try/finally` teardown

## 7. Locator Hygiene

- [x] 7.1 Replace CSS class selector `.badge` in `storefront-catalog.spec.ts` test 2.4 with `ProductCardComponent` locator methods
- [x] 7.2 Replace tag selector `button` in `storefront-catalog.spec.ts` test 2.4 with `ProductCardComponent` locator methods
- [x] 7.3 Review all remaining spec files for any CSS class or tag selectors and replace with user-facing locators

## 8. Structural Consistency

- [x] 8.1 Add `test.step()` blocks to `order-management.spec.ts` — both tests (seed, action, assert phases)
- [x] 8.2 Add `test.step()` blocks to `redirect-pos-login.spec.ts` — both tests (clear, navigate, login, verify phases)
- [x] 8.3 Add `test.step()` blocks to `storefront-catalog.spec.ts` tests 2.4 and 2.5 (seed, navigate, assert phases)

## 9. Verification & Quality Gate

- [x] 9.1 Run `npm run lint --workspace=frontend` and fix any linting errors
- [ ] 9.2 Run the full Playwright E2E suite (`npx playwright test`) and verify all tests pass
- [x] 9.3 Verify `git status` shows `tests/.auth/` files are untracked
- [x] 9.4 Verify no `expect()` imports remain in `utils/api.ts`
- [x] 9.5 Verify no hardcoded email/password strings remain in any spec file (grep for `@hotmail.com` and `@yahoo.com.br`)
