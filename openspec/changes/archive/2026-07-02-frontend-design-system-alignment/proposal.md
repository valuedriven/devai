## Why

The current frontend implementation uses generic styling, colors, and border-radii that do not adhere to the project's premium design system specified in `docs/design.md`. By aligning the global CSS rules, color tokens, typography settings, and UI components with the Nike-inspired design guidelines (neutral tones, pill-shaped CTAs, 0px border-radius product cards, and editorial type scales), we ensure a cohesive, professional, and immersive visual experience across the entire storefront and admin views.

## What Changes

- **Global Design Tokens**: Update the CSS custom properties in `globals.css` to precisely reflect the color palette, spacing scale, border-radii, and elevation levels defined in `docs/design.md`.
- **Typography and Fonts**: Configure font families, weights, line heights, and letter spacing to match the display campaign, heading, and body typography specifications.
- **UI Components Styling**: Refactor common UI components (e.g., buttons, badges, product cards, inputs/search pills, utility bar, footer, and navigation) to follow the exact styling instructions.
- **Card and Image Layout**: Reset border-radii on product cards to `rounded.none` (0px) and place card backgrounds strictly on `colors.soft-cloud` (#f5f5f5).
- **CTA Hierarchy**: Ensure only pill-shaped buttons with `rounded.lg` (30px) are used, applying a two-tone hierarchy (primary black pill vs secondary soft-cloud pill).

## Capabilities

### New Capabilities
- `design-system-alignment`: Establishes styling rules on the frontend to align global CSS, typography, components (buttons, badges, product cards), and spacing with the Nike-inspired design system in docs/design.md.

### Modified Capabilities
<!-- None. The functional behavior of the application remains unchanged; this is a purely visual/styling alignment. -->

## Impact

- **Frontend Styling**: Modifies `apps/frontend/src/app/globals.css` and potentially common CSS module files or page/component layouts (like header, footer, product grid, buttons) to apply the corrected class names and styles.
- **Test Alignment**: Verifies that class names or element selectors used in Playwright tests continue to pass correctly, adjust locators if needed.
