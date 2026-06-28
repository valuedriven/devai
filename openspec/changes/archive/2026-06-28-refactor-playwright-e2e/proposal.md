## Why

The current E2E test suite in `apps/frontend/tests/` has several anti-patterns that violate the Playwright best practices:
- Tests directly navigate using `page.goto()` and manipulate DOM selectors inline, rather than encapsulating page structure in Page Objects or Component Objects.
- Page objects are instantiated manually (or not used at all), bypassing Playwright's fixture dependency injection.
- Some tests are marked as `fixme` (e.g., the complete shopping cart flow) because they lack programmatic data seeding (such as products), leading to potential flakiness or manual UI dependencies.
- Custom fixtures are not utilized effectively, leading to redundant login/logout sequences and manual cookie/localStorage manipulation in `beforeEach` hooks.

Refactoring the test suite will improve readability, simplify maintenance when the UI changes, run tests faster with parallel execution, and increase test reliability.

## What Changes

- **Page Object Model**: Implement Page Objects in `apps/frontend/tests/pages/` for key views:
  - `LoginPage`
  - `CategoryPage`
  - `ProductPage`
  - `CartPage`
  - `StorefrontPage` / Catalog
- **Component Objects**: Implement reusable component objects in `apps/frontend/tests/components/` for shared UI blocks (e.g., `NavigationComponent`).
- **Fixture Integration**: Register these POMs as custom fixtures in `apps/frontend/tests/fixtures/baseTest.ts` to allow dependency injection.
- **Programmatic Seeding**: Add backend product seeding helpers to `apps/frontend/tests/utils/api.ts` to enable proper prerequisite seeding and unblock the `fixme` tests.
- **Refactoring tests**: Update all test specs to import `test` and `expect` from the local `baseTest.ts`, utilize the custom page/component fixtures, eliminate direct `page.goto()`/raw selectors, and adopt `test.step()` for readability.

## Capabilities

### New Capabilities
- `refactor-playwright-e2e`: Complete E2E testing framework overhaul following modern Playwright design patterns (POM, Custom Fixtures, Web-first assertions, Programmatic data seeding).

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes.
-->

## Impact

- Affects all E2E test specs under `apps/frontend/tests/`.
- Affects test utility files in `apps/frontend/tests/utils/` and fixtures in `apps/frontend/tests/fixtures/`.
- No impact on production frontend/backend application code.
