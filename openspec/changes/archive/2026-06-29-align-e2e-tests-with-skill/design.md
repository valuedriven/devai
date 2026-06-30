## Context

The current Playwright E2E suite lives under `apps/frontend/tests/`. It includes 7 Page Objects under `tests/pages/`, 1 Component Object under `tests/components/`, and 1 base test fixture under `tests/fixtures/baseTest.ts`. While functional, several tests import from `@playwright/test` directly, use raw locator logic, or do not leverage custom fixtures properly.

## Goals / Non-Goals

**Goals:**
- Ensure all test spec files (`*.spec.ts`) import `test` and `expect` exclusively from `fixtures/baseTest.ts`.
- Refactor `tests/auth.setup.ts` to use `LoginPage` Page Object.
- Refactor Page Object classes to adhere to the return type standard (returning the next Page Object on transition).
- Standardize configuration in `playwright.config.ts` to have clean project profiles for `admin` and `customer` using their respective storage states.
- Clean up raw selector and page actions in spec files to go through Page Objects/Component Objects.

**Non-Goals:**
- Moving POM/fixture files under `apps/frontend/src/` is explicitly out of scope, to avoid compilation and configuration issues with Next.js App Router and production bundler, keeping E2E dependencies completely isolated within the `tests/` workspace directory.

## Decisions

### 1. Location of E2E Infrastructure
- **Choice**: Keep E2E page objects, fixtures, and utilities inside `apps/frontend/tests/` (specifically `tests/pages/`, `tests/fixtures/`, etc.).
- **Rationale**: Keeps application code in `src/` clean of test-only code. Next.js bundler will not process these files.

### 2. Multi-Role Project Configuration
- **Choice**: Set up two main projects in `playwright.config.ts`: `admin` and `customer`, each depending on the `setup` project and using their respective storage states.
- **Rationale**: Restoring the respective login session prevents tests from having to log in via the UI every time and allows correct RBAC testing.

### 3. POM Page Transitions
- **Choice**: All action methods that trigger navigation must return an instance of the destination Page Object.
- **Rationale**: Matches the standard defined in the skill: `login()` returns the destination page (e.g. `CatalogPage`/`StorefrontPage`), allowing method chaining or clean test steps.

## Risks / Trade-offs

- **[Risk]** Next.js local server may not be started or might have port conflicts.
  - **Mitigation** Use the webServer config in Playwright to reuse running instances or launch them on different ports safely.
