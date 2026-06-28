## Context

The current Playwright E2E test suite in `apps/frontend/tests/` interacts directly with page elements using the raw Playwright `page` instance inside test files. This approach makes tests brittle, verbose, and difficult to maintain. Additionally, the complete shopping cart flow test is disabled (`test.fixme`) due to the lack of programmatic product data seeding.

## Goals / Non-Goals

**Goals:**
- Implement the Page Object Model (POM) for major frontend pages to encapsulate selectors and page interactions.
- Implement Component Objects for shared UI elements such as the navigation sidebar.
- Register all POMs as custom fixtures in `baseTest.ts` to enable automatic injection and lifecycle management.
- Implement programmatic API seeding helpers for products in `tests/utils/api.ts`.
- Refactor all existing E2E spec files to use the new fixtures and POM methods.
- Fix and enable the disabled shopping cart test (`fluxo-completo-carrinho.spec.ts`).
- Standardize spec structure to follow the Arrange-Act-Assert pattern and utilize `test.step()`.

**Non-Goals:**
- Modifying production React components or NestJS API routes.
- Adding tests for features that are not currently implemented.

## Decisions

### Decision 1: Directory Structure for Page and Component Objects
We will organize Page Objects and Component Objects under `apps/frontend/tests/pages/` and `apps/frontend/tests/components/` respectively.
- Rationale: Aligns with the project's Playwright best practices skill document structure.

### Decision 2: Page Object registration in `baseTest.ts`
All page objects (e.g., `LoginPage`, `CategoryPage`, `ProductPage`, `CartPage`, `StorefrontPage`) will be declared in `Fixtures` type and extended in `test` inside `baseTest.ts`.
- Rationale: Avoids manual instantiation of POMs in tests (`new LoginPage(page)`) and ensures consistency.

### Decision 3: Product Seeding via Backend API
We will add a `createProduct` and `deleteProduct` helper to `tests/utils/api.ts` utilizing the `request` fixture and backend admin endpoints.
- Rationale: Allows tests requiring products to seed data instantly without UI navigation, solving the issue in the shopping cart test.

## Risks / Trade-offs

- **Risk**: Clerk authentication might change token handling.
  - **Mitigation**: The token extraction from cookies is already implemented and encapsulated in `getAuthToken(page)`. We will continue using it as a fixture.
