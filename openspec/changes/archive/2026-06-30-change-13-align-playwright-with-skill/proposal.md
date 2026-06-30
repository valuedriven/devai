## Why

The current Playwright E2E test suite has several deviations and inconsistencies compared to the guidelines set in `playwright-e2e-tests/SKILL.md`. Correcting these ensures test robustness, eliminates potential race conditions/flakiness, keeps the code clean and maintainable, and fully adheres to the project's engineering standards.

Additionally, this change addresses architectural improvements:
1. **Transitioning away from `globalSetup`**: The custom `globalSetup` checks ports redundantly, runs outside the test reporter, and fails opaque. Leveraging Playwright's native `webServer` and project-based setup is cleaner and more idiomatic.
2. **Web Component Robustness**: Preventing failures on custom elements or un-hydrated elements by implementing robust waiting/hydration strategies.

## What Changes

- **Decommission `globalSetup`**: Remove `globalSetup` from `playwright.config.ts`. Rely entirely on Playwright's native `webServer` URL waiting mechanism, which already performs the identical health check on backend and frontend endpoints.
- **Robust Web Component / Hydration Strategies**:
  - Use the CSS `:defined` pseudo-class (e.g., `my-custom-element:defined`) to ensure custom elements/web components are fully registered before locating or interacting.
  - Wait for explicit hydration state attributes (e.g., `[data-state="ready"]` or `[data-hydrated="true"]`) on forms or components before triggering click/fill actions.
- **Update Page Objects and Components**: Change direct imports of `expect` from `@playwright/test` to instead import from `../fixtures/baseTest` (or `../../fixtures/baseTest`).
- **Fix Navigation and Page Object Actions**: 
  - In `LoginPage.ts`:
    - Update `goTo()` to wait for a meaningful element (`this.emailInput` or `this.submitButton` being visible) instead of using `domcontentloaded` wait.
    - Change `login()` return type to `Promise<void>` to keep it single-responsibility, removing navigation wait and direct returns of `StorefrontPage` (which couples pages and makes testing failure paths harder). Await/assert navigation at call sites.
  - In `CartPage.ts`:
    - Refactor `clickLogin()` to not wait for navigation and return `Promise<void>` instead of `LoginPage`.
  - In `CustomerOrdersPage.ts`:
    - Add visibility guards (`expect(heading).toBeVisible()`) to `goTo()` and `goToOrderDetail()` to avoid race conditions when the page is loaded but API data hasn't finished rendering.
  - In `StorefrontPage.ts`:
    - Refactor `addToCart()` to avoid using `.first().click()` on arbitrary lists (which violates the "Scope Data-Dependent Actions to the Seeded Resource" guideline).
- **Fix Setup Hooks**:
  - In `login-flow.spec.ts`, add the mandatory `await page.reload()` after clearing cookies and localStorage to clean Next.js client-side router memory cache.
- **Remove Inline Timeouts**:
  - In `storefront-catalog.spec.ts`, remove the forbidden inline `{ timeout: 10000 }` from `expect(storefrontPage.notFoundMessage).toBeVisible(...)`.

## Capabilities

### Modified Capabilities
- None.

## Impact

- All Playwright test files in `apps/frontend/tests/`
- Playwright page objects and components in `apps/frontend/tests/pages/` and `apps/frontend/tests/components/`
- Playwright configuration file `apps/frontend/playwright.config.ts`
