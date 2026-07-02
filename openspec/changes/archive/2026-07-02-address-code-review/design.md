## Context

A recent test refactoring resolved several Playwright strict mode violations by appending `.first()` to locators. While this "fixes" the immediate error, it is an anti-pattern that introduces test fragility by assuming the exact sequence of DOM nodes. Concurrently, a design system update in `globals.css` introduced mixed units (`rem` and `px`) and hardcoded values instead of using centralized design tokens.

## Goals / Non-Goals

**Goals:**
- Replace all instances of `.first()` in Playwright E2E tests with robust, specifically-scoped locators that guarantee uniqueness.
- Ensure dynamic string inputs in Playwright locators are properly escaped or exactly matched to prevent Regex evaluation errors.
- Standardize CSS sizing variables in `globals.css` to use a unified scale (e.g., all `rem` or correctly structured design tokens).
- Formally document the `.first()` anti-pattern restriction in `AGENTS.md` and the Playwright SKILL file.

**Non-Goals:**
- Major architectural changes to the frontend or backend.
- Overhauling the entire Playwright test suite beyond fixing the targeted anti-patterns.
- Changing the actual visual design (the goal is unit/token consistency, not aesthetic changes).

## Decisions

- **Locator Strategy:** We will enforce scoping locators to parent containers (e.g., `page.locator('.table-container').getByPlaceholder('Pesquisar')`) or using filtering criteria (`hasText`) combined with distinct components rather than blindly chaining `.first()`.
- **CSS Standardization:** We will adopt `rem` or consistent CSS variables for all sizing and radius variables to avoid mixed units.
- **Regex Handling:** We will use Playwright's exact match option or manual string escaping for dynamic variables in locators instead of `new RegExp()`.

## Risks / Trade-offs

- **Risk:** Removing `.first()` might expose underlying DOM structural issues where unique locators are difficult to construct.
  - **Mitigation:** If a unique locator is truly impossible to build with the existing DOM, we will add descriptive `data-testid` attributes to the frontend components.
- **Risk:** Modifying `globals.css` might inadvertently affect component rendering.
  - **Mitigation:** Changes will be strictly a 1:1 translation of visual intent to the standardized unit format, verified by visual checks.
