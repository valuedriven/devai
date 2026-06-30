## Why

The current Playwright E2E test suite has several deviations from the `playwright-e2e-tests` skill guidelines. These deviations include manual instantiation of Page Objects, raw page selectors and page navigation inside tests, direct imports from `@playwright/test` instead of the base fixture registry, and lack of destination page object returns on transitions. Aligning the test suite with the skill guarantees better maintenance, zero flakiness, and alignment with modern Playwright best practices.

## What Changes

- Refactor all existing E2E spec files under `apps/frontend/tests/` to always import `test` and `expect` from `fixtures/baseTest.ts`.
- Refactor `apps/frontend/tests/auth.setup.ts` to utilize the `loginPage` fixture and the Page Object Model instead of raw selectors and page actions.
- Update Page Object classes under `apps/frontend/tests/pages/` to follow the guideline (e.g. `login()` returning `CatalogPage` or equivalent destination pages, removing assertions/waits, etc.).
- Modernize the locator declarations inside Page Objects using standard modern selectors (e.g. `getByRole`, `getByLabel` rather than CSS/XPath when possible).
- Align Playwright configuration projects to run both customer-role and admin-role tests using the corresponding storage states rather than running all chromium tests with the admin context.

## Capabilities

### New Capabilities
<!-- Capabilities being introduced. Replace <name> with kebab-case identifier (e.g., user-auth, data-export, api-rate-limiting). Each creates specs/<name>/spec.md -->

### Modified Capabilities
<!-- Existing capabilities whose requirements are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes.
-->

## Impact

- All Playwright test files in `apps/frontend/tests/`
- Playwright page objects and components in `apps/frontend/tests/pages/` and `apps/frontend/tests/components/`
- Configuration files: `apps/frontend/playwright.config.ts` and `apps/frontend/tests/fixtures/baseTest.ts`
