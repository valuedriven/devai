## 1. Backend: Catalog Public Controllers

- [x] 1.1 Create `public-products.controller.ts` and `public-categories.controller.ts` in the `products` module to handle public endpoints (`GET /api/v1/products` and `GET /api/v1/categories`).
- [x] 1.2 Implement integration tests for the public controllers to ensure active products and categories are correctly returned to unauthenticated users.
- [x] 1.3 Update `products.module.ts` to register the new public controllers.

## 2. Backend: Legacy Cleanup

- [x] 2.1 Delete legacy singular controllers (`category.controller.ts`, `product.controller.ts`).
- [x] 2.2 Delete legacy singular services (`category.service.ts`, `product.service.ts`).
- [x] 2.3 Delete legacy singular DTOs (`create-category.dto.ts`, `update-category.dto.ts`, `create-product.dto.ts`, `update-product.dto.ts`).
- [x] 2.4 Update `products.module.ts` to remove all references to the deleted files.
- [x] 2.5 Delete old spec files (`*.spec.ts`) for the removed singular controllers and services.

## 3. Frontend: Storefront API Integration

- [x] 3.1 Update `apps/frontend/src/lib/data.ts` to ensure `getProducts()`, `getProduct()`, and `getCategories()` hit the newly implemented public `/api/v1/products` and `/api/v1/categories` endpoints correctly.
- [x] 3.2 Update E2E test scripts (e.g., `api-endpoints-publicos.spec.ts`) to point to the correct public paths and ensure they pass.

## 4. Verification & E2E Testing

- [x] 4.1 Create test plan using `.agents/prompts/playwright-test-planner.md` based on the new `storefront-catalog` capabilities.
- [x] 4.2 Use `.agents/prompts/playwright-test-generator.md` to generate the required Playwright E2E tests for the new public routes.
- [x] 4.3 Run backend tests (`npm run test` and `npm run test:integration`) to ensure 80% coverage and all tests pass.
- [x] 4.4 Run backend lint (`npm run lint --workspace=backend`) and fix any identified issues.
- [x] 4.5 Run frontend lint (`npm run lint --workspace=frontend`) and E2E tests (`npx playwright test`) to ensure everything is functional and green.
