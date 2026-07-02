## 1. Documentation Updates

- [x] 1.1 Update `AGENTS.md` to formally restrict the use of `.first()` in Playwright E2E tests and establish locators uniqueness constraints.
- [x] 1.2 Update `.agents/skills/playwright-e2e-tests/SKILL.md` with explicit guidelines and examples on avoiding `.first()` and using robust, scoped locators.
- [x] 1.3 Add constraints in `AGENTS.md` for consistent design system tokens (avoiding mixing `px` and `rem` for border radii).

## 2. Design System Alignment

- [x] 2.1 Refactor `apps/frontend/src/app/globals.css` to use a consistent unit (e.g., `rem` or correctly structured design tokens) for border-radius and spacing, replacing hardcoded `px` overrides where appropriate.
- [x] 2.2 Visually verify the frontend to ensure no layout regressions occurred after the CSS standardization.

## 3. Playwright Locators Refactoring

- [x] 3.1 Refactor `OrderPage.ts` to replace `.first()` with robust locators.
- [x] 3.2 Refactor `ProductCardComponent.ts` to scope elements uniquely and avoid `.first()`.
- [x] 3.3 Refactor `StorefrontPage.ts` to remove `.first()` usage.
- [x] 3.4 Refactor `CustomerPage.ts` to remove `.first()` usage.
- [x] 3.5 Check and sanitize any Regex-based locators to ensure exact matches or escaped strings.

## 4. Verification

- [x] 4.1 Run `npm run lint --workspace=frontend` to ensure code quality.
- [x] 4.2 Run `npx playwright test` to validate all E2E tests pass reliably without strict mode violations.
