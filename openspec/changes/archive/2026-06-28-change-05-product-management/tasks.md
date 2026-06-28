## 1. Backend: Setup & Product Module

- [x] 1.1 Create `ProductModule`, `ProductController`, and `ProductService`
- [x] 1.2 Export `CategoryService` from `CategoryModule` and import `CategoryModule` into `ProductModule`
- [x] 1.3 Create DTOs (`CreateProductDto`, `UpdateProductDto`) with class-validator annotations (price > 0, stock >= 0)

## 2. Backend: CRUD Implementation

- [x] 2.1 Implement `ProductService` methods for CRUD (list with pagination/search, create, findOne, update, softDelete)
- [x] 2.2 Add category validation in `ProductService` create and update methods
- [x] 2.3 Implement `ProductController` endpoints, including admin authorization guard
- [x] 2.4 Implement image upload endpoint (`POST /v1/admin/products/upload`) saving to `public/uploads` and returning the URL stub

## 3. Backend: Tests

- [x] 3.1 Write Jest unit tests for `ProductService` (mocking Prisma and CategoryService)
- [x] 3.2 Write Jest+Supertest integration tests for `ProductController` (happy path, 403 non-admin, validation failures)
- [x] 3.3 Ensure test coverage meets the 80% minimum requirement (statements, branches, functions, lines)

## 4. Frontend: Core UI

- [x] 4.1 Create Admin Product List page (`/admin/products`) with table, pagination, search, and category filter
- [x] 4.2 Create Admin Product form components for creation and editing (`/admin/products/new`, `/admin/products/[id]/edit`)
- [x] 4.3 Implement generic or specific file upload component with image preview for the product form
- [x] 4.4 Connect frontend forms and lists to backend API endpoints

## 5. Frontend: Tests

- [x] 5.1 Run Playwright test planner (`.agents/prompts/playwright-test-planner.md`) to define E2E scenarios for product management
- [x] 5.2 Implement Playwright E2E tests based on the planner. You must explicitly use the `.agents/prompts/playwright-test-generator.md` prompt to generate these tests.
- [x] 5.3 Run linter (`npm run lint --workspace=frontend`) and verify passing

## 6. Review & Finalize

- [x] 6.1 Run all tests and linter (`npm run test` and `npm run lint`)
- [x] 6.2 Review code against `AGENTS.md` constitution and design system CSS tokens
