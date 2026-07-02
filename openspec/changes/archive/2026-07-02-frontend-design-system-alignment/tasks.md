## 1. Global Styles and Tokens Setup

- [x] 1.1 Update `apps/frontend/src/app/globals.css` with Google Fonts imports for Inter and Bebas Neue
- [x] 1.2 Update CSS custom properties (variables) in `apps/frontend/src/app/globals.css` to match design system colors (canvas, soft-cloud, ink, mute, sale, success) and spacing/border-radius tokens
- [x] 1.3 Update layout and typography configurations to pair Bebas Neue and Inter correctly

## 2. Component Styling Refactoring

- [x] 2.1 Refactor button styles (`.btn`, `.btn-primary`, `.btn-secondary`) inside `globals.css` to enforce 48px height, 30px pill-shape border-radius (`rounded.lg`), 16px 32px padding, and correct font-family/weight
- [x] 2.2 Adjust product cards (`.card` and product grid components) to set border-radius to 0px (`rounded.none`), remove default drop-shadows, and align metadata padding/margins with the 8px spacing system
- [x] 2.3 Style search inputs and pills (`.search-pill`, `.input`) to match the 24px border-radius and focused halo styling
- [x] 2.4 Verify badges (`.badge`, `.badge-promo`) and inline sales labels (`.badge-sale-text`) to align colors (sale red, canvas background, hairline borders) and pill geometries

## 3. Quality Gate and Verification

- [x] 3.1 Run `npm run lint` and verify there are no frontend styling/code warnings or errors
- [x] 3.2 Run Playwright E2E tests (`npm run test`) to verify all storefront flows pass and locators are unaffected by styling adjustments
