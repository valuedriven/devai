## 1. Setup & Configuration

- [x] 1.1 Update `playwright.config.ts` to configure distinct `admin` and `customer` projects depending on `setup` with their respective storage states.
- [x] 1.2 Refactor `tests/auth.setup.ts` to import from `fixtures/baseTest.ts` and use the `loginPage` Page Object for authentication.
 
## 2. Page Object Refactoring
 
- [x] 2.1 Update `LoginPage.ts` so that `login()` returns a promise that resolves to the destination page.
- [x] 2.2 Refactor and align locators in all Page Objects (`LoginPage.ts`, `ProductPage.ts`, `CategoryPage.ts`, `CustomerPage.ts`, `CartPage.ts`, `OrderPage.ts`, `StorefrontPage.ts`) using correct priority (e.g., `getByRole`, `getByLabel`) and ensuring transition methods return destination Page Objects.

## 3. Spec Files Refactoring

- [x] 3.1 Refactor all test spec files (`tests/*.spec.ts`) to always import `test` and `expect` from `fixtures/baseTest.ts`.
- [x] 3.2 Standardize test code: replace direct `page.goto` or selector operations with Page Object interactions.
- [x] 3.3 Ensure tests use the correct project/storageState contexts depending on role requirements.

## 4. Verification & Quality Gate

- [x] 4.1 Run the full Playwright E2E suite to ensure all tests pass cleanly.
- [x] 4.2 Run the linter (`npm run lint --workspace=frontend`) to verify code styling and quality compliance.
