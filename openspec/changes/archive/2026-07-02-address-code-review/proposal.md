## Why

A recent monorepo code review identified Playwright anti-patterns, specifically the overuse of `.first()` to resolve locator strict mode violations, which introduces long-term test brittleness. The review also found inconsistencies in the design system tokens (`globals.css`), mixing `rem` and `px` and zeroing out radii unreliably. Finally, the engineering constitution (`AGENTS.md`) and related `SKILL.md` (Playwright) need to be updated to explicitly forbid the use of `.first()` in Playwright E2E tests and enforce strict scoping and valid design token usage. This change aims to improve test resilience, documentation clarity, and design system consistency.

## What Changes

- Replace the use of `.first()` with properly scoped and unique locators across Playwright page objects and test files.
- Standardize border radii and other sizing tokens in `globals.css` to use a consistent unit (e.g., `rem` or CSS variables) instead of mixing `px` and `rem`.
- Update the `AGENTS.md` and `playwright-e2e-tests` SKILL.md to establish a rule against the `.first()` anti-pattern in locators and enforce valid token usage in the design system.
- Ensure any dynamic inputs used in regular expressions for Playwright locators are safely handled or converted to exact matches where possible.

## Capabilities

### New Capabilities
- `playwright-locator-standards`: Establishes rules against using `.first()` for resolving Playwright strict mode violations, ensuring robust DOM scoping.

### Modified Capabilities
- `playwright-tests-refactor`: Refactoring POMs and tests to avoid `.first()` and use robust selectors.
- `design-system-alignment`: Ensuring consistent unit structures (`rem`/variable vs `px`) in CSS tokens.

## Impact

- `apps/frontend/tests/*`: Affected E2E test files and Page Objects.
- `apps/frontend/src/app/globals.css`: Affected design system file.
- `AGENTS.md` and `.agents/skills/playwright-e2e-tests/SKILL.md`: Affected documentation.
