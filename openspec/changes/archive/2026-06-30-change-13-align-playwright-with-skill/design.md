## Context

A thorough inspection of `apps/frontend/tests` and `apps/frontend/playwright.config.ts` against `.agents/skills/playwright-e2e-tests/SKILL.md` identified several inconsistencies. This design details the necessary code refactorings to ensure compliance.

## Goals / Non-Goals

**Goals:**
- Decommission `globalSetup` in favor of native `webServer` URL checks.
- Address web component / custom element mounting and hydration issues.
- Correct direct `expect` imports from `@playwright/test` inside Page Objects and Components.
- Implement proper page navigation visibility guards and single-responsibility action methods in Page Objects (e.g. `LoginPage`, `CartPage`, `CustomerOrdersPage`, `StorefrontPage`).
- Add the required `await page.reload()` after manual session invalidation/cleanup in `login-flow.spec.ts`.
- Eliminate forbidden inline `{ timeout }` overrides in assertions.

**Non-Goals:**
- Writing new functional tests or altering backend logic.

## Decisions

### 1. `globalSetup` vs `webServer` URL Waiting & Project Dependencies
- **Analysis**: The current `globalSetup` executes a manual fetch loop to verify if ports `3000` and `3001` are up. However, Playwright's `webServer` config already does this out of the box using the `url` property:
  ```ts
  webServer: [
    {
      command: 'npm run prisma:generate && nest start',
      url: 'http://127.0.0.1:3001/api/v1/products',
      // ...
    },
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:3000',
      // ...
    }
  ]
  ```
  If a server fails to start, the `webServer` configuration raises a clear timeout error directly in the test runner output. Manual check in `globalSetup` is redundant and runs outside the reporter lifecycle.
- **Decision**: Remove `globalSetup` config and delete `tests/server.setup.ts`.

### 2. Web Component & Hydration Robustness
- **Analysis**: Web components and React-rendered SSR components can suffer from "headless" action issues:
  1. The element appears in the DOM (SSR HTML) but isn't hydrated yet (event listeners not bound).
  2. The custom element isn't defined/upgraded yet.
- **Strategies**:
  - **Defined Wait**: For custom elements, use the CSS `:defined` pseudo-class (e.g., `await page.locator('my-component:defined').waitFor()`) before clicking or filling.
  - **Hydration State Guard**: Wait for the React state readiness indicators (e.g., `form[data-state="ready"]` or specific hydration tags) before interacting. This is already implemented in `LoginPage.ts` via `form.login-form[data-state="ready"]`, which we will preserve and reinforce.
  - **Implicit Shadow DOM**: Playwright locators automatically traverse Shadow DOM. We will avoid deep CSS paths or XPath that might bypass shadow roots incorrectly.

### 3. Fix POM Imports
All imports of `expect` in the page objects and components will be redirected to the centralized `baseTest` fixture file.

### 4. Standardize `LoginPage` and `CartPage` Methods
- `LoginPage.goTo()` will await `expect(this.emailInput).toBeVisible()` instead of `domcontentloaded`.
- `LoginPage.login()` will return `Promise<void>` instead of `Promise<StorefrontPage>`.
- `CartPage.clickLogin()` will return `Promise<void>` instead of `Promise<LoginPage>`.

### 5. Ensure Client-Side Cache Reset
In `login-flow.spec.ts`, the `beforeEach` hook will call `await page.reload()` after clearing cookies and local storage.

### 6. Remove Inline Timeouts
The inline `{ timeout: 10000 }` will be removed from `storefront-catalog.spec.ts`.

## Risks / Trade-offs

- Refactoring POM method signatures (like `login()` and `clickLogin()`) might impact tests that chain these calls. We will adjust the call sites in spec files accordingly.
