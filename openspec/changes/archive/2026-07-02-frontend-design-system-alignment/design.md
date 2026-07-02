## Context

The current frontend project relies on standard tailwind-like custom utility classes and generic colors (e.g., custom blues and round borders on buttons) that are inconsistent with the brand style in `docs/design.md`. We need to systematically redefine global CSS values, button components, and card elements to follow the brand guidelines.

## Goals / Non-Goals

**Goals:**
- Update `apps/frontend/src/app/globals.css` with the exact colors, typography, border-radii, and spacing tokens.
- Restructure button classes (`.btn`, `.btn-primary`, `.btn-secondary`) to match height (48px), padding (16px 32px), and border-radius (30px/rounded.lg).
- Adjust product card styling to have zero border radius and ensure image backdrops sit on the `soft-cloud` surface.
- Integrate open-source font fallback pairing (Bebas Neue + Inter) for campaign hero sections and UI chrome.

**Non-Goals:**
- Rewriting backend API responses or changing catalog business logic.
- Adding database migrations.
- Adding non-standard visual components outside the scope of `docs/design.md`.

## Decisions

### Decision 1: Font Substitution Pairing
To achieve the typography contrast without proprietary Nike fonts, we will load **Bebas Neue** (via Google Fonts or system fallbacks) for campaign display-campaign lockups and **Inter** for all UI text, headings, and body copy.
- *Rationale*: Recommeded fallback in `docs/design.md`. We will add the font imports in `globals.css` or the main layout.

### Decision 2: Rebuilding CSS Variables in `globals.css`
We will rewrite the root HSL palette and custom design token variables to align with the specification:
- `--background`: `0 0% 100%` (#ffffff)
- `--foreground`: `0 0% 7%` (#111111)
- `--primary`: `0 0% 7%` (#111111)
- `--secondary`: `0 0% 96%` (#f5f5f5)
- `--radius`: `0px` (forcing flat cards)
- Define custom tokens for `--color-soft-cloud` (#f5f5f5), `--color-hairline` (#cacacb), `--color-sale` (#d30005), etc.

### Decision 3: Standardizing Buttons and Cards Classes
We will redefine:
- `.btn`: `border-radius: 30px` (`rounded.lg`), `height: 48px`, `font-family: var(--font-sans)`, `font-weight: 500`.
- `.btn-primary`: background `var(--color-ink)` (#111111), text `var(--color-on-primary)` (#ffffff).
- `.btn-secondary`: background `var(--color-soft-cloud)` (#f5f5f5), text `var(--color-ink)` (#111111).
- `.card`: `border-radius: 0px`, no drop-shadow, flat styling.

## Risks / Trade-offs

- **[Risk] Test Locators Breaking** → Playwright tests might rely on certain button styles or container class names.
  *Mitigation*: We will maintain semantic class names and only adjust styles (radii, color, spacing). We will run `npm run test` to verify.
