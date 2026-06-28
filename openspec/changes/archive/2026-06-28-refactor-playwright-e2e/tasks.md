## 1. Setup API Seeding Helpers

- [x] 1.1 Add `createProduct` and `deleteProduct` API helpers to `apps/frontend/tests/utils/api.ts` to support programmatic seeding of catalog items.

## 2. Implement Page and Component Objects

- [x] 2.1 Create `NavigationComponent` in `apps/frontend/tests/components/NavigationComponent.ts` to encapsulate top-bar, sidebar, and dropdown navigation links.
- [x] 2.2 Create `LoginPage` in `apps/frontend/tests/pages/LoginPage.ts` to encapsulate the login form inputs and submissions.
- [x] 2.3 Create `CategoryPage` in `apps/frontend/tests/pages/CategoryPage.ts` to encapsulate category creation, editing, and deletion modal flows.
- [x] 2.4 Create `ProductPage` in `apps/frontend/tests/pages/ProductPage.ts` to encapsulate product creation and deletion.
- [x] 2.5 Create `CartPage` in `apps/frontend/tests/pages/CartPage.ts` to encapsulate cart badge assertion, cart list, login routing, and order confirmation.
- [x] 2.6 Create `StorefrontPage` in `apps/frontend/tests/pages/StorefrontPage.ts` to encapsulate browsing catalogs and adding products to the cart.

## 3. Register Fixtures

- [x] 3.1 Update `apps/frontend/tests/fixtures/baseTest.ts` to import and expose LoginPage, CategoryPage, ProductPage, CartPage, StorefrontPage, and NavigationComponent as injection fixtures.

## 4. Refactor Spec Files

- [x] 4.1 Refactor `login-flow.spec.ts` using the new POMs and fixtures.
- [x] 4.2 Refactor `logout-flow.spec.ts` to run logout actions via encapsulated navigation POM.
- [x] 4.3 Refactor `category-management.spec.ts` to utilize the CategoryPage POM and API seeding.
- [x] 4.4 Refactor `fluxo-completo-carrinho.spec.ts` to seed products programmatically, use CartPage/StorefrontPage/LoginPage POMs, and change `test.fixme` to an active test.
- [x] 4.5 Audit and refactor remaining E2E test specs (e.g., `product-management.spec.ts`, `storefront-catalog.spec.ts`) to ensure strict adherence to POM and local baseTest imports.

## 5. Verification and Quality Gate

- [x] 5.1 Run `npm run lint` and fix all linting warnings or errors in the workspace.
- [x] 5.2 Run `npx playwright test` to verify that all refactored E2E test scripts run and pass successfully in the local environments.
