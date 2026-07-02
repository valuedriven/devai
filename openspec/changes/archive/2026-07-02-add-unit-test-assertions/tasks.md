## 1. Skill Guidelines Update

- [x] 1.1 Update `jest-unit-tests/SKILL.md` to explicitly specify that unit tests located in `apps/backend/src` (including controller tests) must use only Jest and mocks, invoking methods directly without using Supertest or bootstrapping HTTP servers.
- [x] 1.2 Update `supertest-integration-test/SKILL.md` to specify that integration tests in `apps/backend/test/integration` must use Jest and Supertest with explicit Jest `expect()` assertions, and must not mock internal dependencies/databases.

## 2. Refactor Unit Tests (apps/backend/src)

- [x] 2.1 Refactor `apps/backend/src/modules/auth/auth.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.
- [x] 2.2 Refactor `apps/backend/src/modules/customers/controllers/customers.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.
- [x] 2.3 Refactor `apps/backend/src/modules/orders/controllers/orders.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.
- [x] 2.4 Refactor `apps/backend/src/modules/orders/controllers/admin-orders.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.
- [x] 2.5 Refactor `apps/backend/src/modules/orders/controllers/admin-payments.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.
- [x] 2.6 Refactor `apps/backend/src/modules/products/controllers/categories.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.
- [x] 2.7 Refactor `apps/backend/src/modules/products/controllers/products.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.
- [x] 2.8 Refactor `apps/backend/src/modules/products/controllers/public-categories.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.
- [x] 2.9 Refactor `apps/backend/src/modules/products/controllers/public-products.controller.spec.ts` to call controller methods directly using Jest mocks, completely removing Supertest.

## 3. Refactor Integration Tests (apps/backend/test/integration)

- [x] 3.1 Refactor Supertest calls in `apps/backend/test/integration/customers/customers.integration.spec.ts` to use explicit Jest expectations.
- [x] 3.2 Refactor Supertest calls in `apps/backend/test/integration/orders/admin-orders.integration.spec.ts` to use explicit Jest expectations.
- [x] 3.3 Refactor Supertest calls in `apps/backend/test/integration/products/admin-products.integration.spec.ts` to use explicit Jest expectations.
- [x] 3.4 Refactor Supertest calls in `apps/backend/test/integration/products/public-catalog.integration.spec.ts` to use explicit Jest expectations.

## 4. Verification & Validation

- [x] 4.1 Run unit tests using `npm run test:unit` inside `apps/backend` to verify all unit tests pass.
- [x] 4.2 Run integration tests using `npm run test:integration` inside `apps/backend` to verify all integration tests pass.
- [x] 4.3 Run the linter check using `npm run lint` in `apps/backend` to ensure there are no errors or warnings.
