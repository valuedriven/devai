## 1. Shared Test Helpers

- [x] 1.1 Create `test/integration/helpers/app.ts` — shared `getApp()` that bootstraps NestJS with `AppModule`, sets global prefix `api/v1`, adds `ValidationPipe` (whitelist + transform), adds `HttpExceptionFilter`, uses singleton pattern
- [x] 1.2 Create `test/integration/helpers/auth.ts` — shared `ClerkService` mock factory (`createMockClerkService`) and auth header factories (`adminAuthHeader`, `customerAuthHeader`, `unauthenticated`)
- [x] 1.3 Create `test/integration/helpers/database.ts` — shared `truncateAll()` using `TRUNCATE TABLE "AuditLog", "Payment", "OrderItem", "Order", "Product", "Category", "Customer" CASCADE`
- [x] 1.4 Create `test/integration/helpers/fixtures.ts` — builder factories: `makeCustomer(overrides)`, `makeProduct(overrides)`, `makeCategory(overrides)`, `makeOrder(overrides)`, `makeOrderItem(overrides)` — all with unique values using `Date.now()`

## 2. Bootstrap & Config

- [x] 2.1 Update `test/jest-e2e.json` — change `testRegex` to `integration/.*\.integration\.spec\.ts$` and update `rootDir`
- [x] 2.2 Create `test/integration/` directory structure (`auth/`, `customers/`, `orders/`, `products/`)

## 3. Migrate: Auth Integration Tests

- [x] 3.1 Create `test/integration/auth/auth.integration.spec.ts` — migrate from `test/auth.e2e-spec.ts` with improvements:
  - Use shared helpers (`getApp`, `truncateAll`, auth header factories)
  - Add RFC 9457 assertions to all error responses
  - Add `POST /auth/login` success scenario
  - Add `POST /auth/register` success scenario
  - Add 404 scenario (non-existent user?)
  - Add health check test (from `app.e2e-spec.ts`) since it's a core endpoint
- [x] 3.2 Delete old `test/app.e2e-spec.ts` and `test/auth.e2e-spec.ts`

## 4. NEW: Customers Integration Test Suite

- [x] 4.1 Create `test/integration/customers/customers.integration.spec.ts` covering all 7 endpoints per design matrix:
  - Happy path: create, list, get, update, delete
  - Validation (400): missing required fields on create/update
  - Unauthenticated (401): all endpoints without token
  - Forbidden (403): customer role accessing admin endpoints
  - Not found (404): get/update/delete non-existent customer
  - Conflict (409): duplicate email on create, delete customer with orders
  - Pagination shape: list endpoint
  - Audit log: create + delete operations

## 5. NEW: Admin Categories Integration Test Suite

- [x] 5.1 Create `test/integration/products/admin-categories.integration.spec.ts` covering all 5 admin category endpoints per design matrix:
  - Happy path: create, list, get, update, delete
  - Validation (400): missing name, empty body
  - Unauthenticated (401): all endpoints without token
  - Forbidden (403): customer role accessing admin endpoints
  - Not found (404): get/update/delete non-existent category
  - Conflict (409): duplicate category name
  - Soft-delete verification: deleted category excluded from public list
  - Pagination shape: list endpoint
  - `X-Total-Count` header assertion on list

## 6. Migrate: Orders Integration Tests

- [x] 6.1 Create `test/integration/orders/orders.integration.spec.ts` — migrate from `test/orders.e2e-spec.ts` with enhancements:
  - Use shared helpers
  - Add RFC 9457 assertions to all error responses (400, 401, 404, 422)
  - Add pagination shape assertion on list endpoint
  - Add 404 scenario for non-existent order
  - Add admin role test for admin-only endpoints on OrdersController
  - Add audit log assertions for create + cancel operations
  - Keep existing IDOR and stock validation tests
- [x] 6.2 Create `test/integration/orders/admin-orders.integration.spec.ts` — migrate from `test/admin-orders.e2e-spec.ts` with enhancements:
  - Use shared helpers
  - Add RFC 9457 assertions
  - Add pagination shape assertion on list endpoint
  - Add `X-Total-Count` header assertion
  - Add 404 for non-existent order
  - Add unauthenticated (401) and customer (403) scenarios
  - Expand audit log assertions
  - Add payment registration test with audit assertion
- [x] 6.3 Delete old `test/orders.e2e-spec.ts` and `test/admin-orders.e2e-spec.ts`

## 7. Migrate: Products Integration Tests

- [x] 7.1 Create `test/integration/products/admin-products.integration.spec.ts` — migrate from `test/admin-products.e2e-spec.ts` with enhancements:
  - Use shared helpers
  - Add RFC 9457 assertions to error responses
  - Add pagination shape assertion on list endpoint
  - Add `X-Total-Count` header assertion
  - Add 404 for non-existent product
  - Add 409 conflict (duplicate name?)
  - Add audit log assertions for create + delete
  - Ensure `afterEach` cleanup isolation
- [x] 7.2 Create `test/integration/products/public-catalog.integration.spec.ts` — migrate from `test/public-catalog.e2e-spec.ts` with enhancements:
  - Use shared helpers
  - Add pagination shape assertion on public products list
  - Add validation (400) for invalid pagination params
  - Add RFC 9457 assertions on 404 responses
- [x] 7.3 Delete old `test/admin-products.e2e-spec.ts` and `test/public-catalog.e2e-spec.ts`

## 8. Run & Validate

- [x] 8.1 Run integration tests: `npx jest --config test/jest-e2e.json` and fix any failures
- [x] 8.2 Run lint: `npm run lint --workspace=backend` and fix any issues
- [x] 8.3 Run full test suite: `npm run test --workspace=backend` and verify all pass
