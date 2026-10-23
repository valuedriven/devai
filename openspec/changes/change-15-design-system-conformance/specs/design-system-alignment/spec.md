## MODIFIED Requirements

### Requirement: Component Shape Vocabulary
The border-radius of all frontend UI components SHALL follow the role-based mapping defined by the design system scale {0, 18, 24, 30, 9999}px. Containers — cards, product cards, campaign tiles, image frames, dialogs, toasts, page sections, navigation headers, and footers — SHALL be completely flat at `0px`. Inputs and the search pill SHALL use `24px`. Call-to-action buttons, filter chips, badges, and inline alert surfaces SHALL use the `30px` pill radius. Icon-only circular buttons and color swatches SHALL use `9999px`. The `18px` tier SHALL be reserved for avatar/icon containers and SHALL NOT be used for CTAs or cards. The pill radius (`30px`) SHALL NOT be applied to containers, and no component SHALL introduce an intermediate radius (e.g. 6px, 8px, 12px) outside the documented scale.

#### Scenario: Product card border radius
- **WHEN** a product card or campaign tile is rendered
- **THEN** its CSS border-radius SHALL be `0px`

#### Scenario: CTA button border radius
- **WHEN** a primary or secondary CTA button is rendered
- **THEN** its CSS border-radius SHALL be `30px`

#### Scenario: Search input border radius
- **WHEN** the search pill input is rendered
- **THEN** its CSS border-radius SHALL be `24px`

#### Scenario: Icon button radius
- **WHEN** an icon-only control (cart, user, menu trigger, carousel paddle) is rendered
- **THEN** its CSS border-radius SHALL be `9999px` (fully round)

#### Scenario: No intermediate radii
- **WHEN** any interactive or container component is rendered
- **THEN** no border-radius value outside {0, 18, 24, 30, 9999}px SHALL be applied

#### Scenario: Containers are never pill-shaped
- **WHEN** a PDP image frame, empty state, modal/dialog, toast, or decorative icon container is rendered
- **THEN** its CSS border-radius SHALL be `0px`, never `30px`

### Requirement: Typography Scale Compliance
Typography across the frontend SHALL match the Helvetica Now Display / Inter typography hierarchy defined in the design system. The display tier (campaign hero headlines) SHALL use 96px on desktop (clamping to 64px tablet / 48px mobile), 0.9 line height, uppercase transformation, and SHALL be reserved exclusively for editorial campaign moments. The display weight SHALL follow the loaded display font: the proprietary tier is 500 weight, while the sanctioned open-source substitute Bebas Neue (single-weight, 400) SHALL use 400 (its only available weight), per the Font Substitutes note in docs/design.md. Body, product names, buttons, captions, and UI labels SHALL use the Inter scale: body-md 16px/400, body-strong 16px/500, button-md 16px/500, caption-md 14px/500, caption-sm 12px/500, heading-xl 32px/500, heading-lg 24px/500. Section headers SHALL use `heading-xl` (32px/500) without uppercase transformation, because uppercase is reserved for the display tier. Page and card headings SHALL use a documented tier (`heading-xl`, `heading-lg`, or `heading-md`) and SHALL NOT introduce off-scale sizes such as 28px or 18px for chrome text. Weights 600/700 SHALL NOT be used for chrome text.

#### Scenario: Campaign Display Headline
- **WHEN** a campaign hero banner is rendered
- **THEN** the display headline text SHALL use 96px size (desktop), 0.9 line height, uppercase transformation, and the weight supported by the loaded display font (500 for the proprietary tier, 400 for the Bebas Neue substitute)

#### Scenario: Button text typography
- **WHEN** a standard button is rendered
- **THEN** the button text SHALL use 16px size and 500 weight

#### Scenario: Product name typography
- **WHEN** a product name is rendered on a product card or PDP
- **THEN** it SHALL use 16px size and 500 weight (body-strong)

#### Scenario: Display tier reserved for hero
- **WHEN** a section header or product title is rendered outside the campaign hero
- **THEN** it SHALL NOT use the 96px display-campaign tier

#### Scenario: Section header typography
- **WHEN** a page section header (e.g. "Destaques") is rendered
- **THEN** it SHALL use the `heading-xl` tier (32px/500) and SHALL NOT apply uppercase transformation

#### Scenario: Auth and profile headings stay on scale
- **WHEN** an auth card heading or the profile page heading is rendered
- **THEN** it SHALL resolve to a documented tier (32px, 24px, or 16px) and SHALL NOT use 28px or 18px

### Requirement: Design System Sizing Consistency
The design system CSS tokens (`globals.css`) SHALL use a consistent token system for sizing and border-radius properties, avoiding hardcoded `px` overrides in component rules. Radius values SHALL map to the token scale {none: 0, sm: 18, md: 24, lg: 30, full: 9999}px and spacing SHALL map to the token scale {xxs: 2, xs: 4, sm: 8, md: 12, lg: 18, xl: 24, xxl: 30, section: 48}px. Component rules SHALL reference `--space-*` for padding, margin, gap, and height, and `--type-*` for font size, weight, and line height. Raw `rem`/`px` values SHALL be limited to 1px hairlines, focus-ring offsets, and values that the scale does not represent.

#### Scenario: Defining border radius
- **WHEN** the border-radius variables are defined
- **THEN** they MUST use the standard unit defined for the system (e.g., `rem`) without mixing absolute `px` values

#### Scenario: Component rules use tokens
- **WHEN** a component rule in globals.css specifies radius, spacing, or typography size
- **THEN** it MUST reference the corresponding token variable instead of a raw value

#### Scenario: Component spacing uses the space scale
- **WHEN** `.btn`, `.card-*`, `.login-card`, `.footer-container`, or `.container` define padding, gap, or height
- **THEN** they SHALL reference `--space-*` tokens (or a documented exception) instead of raw `rem` values

### Requirement: Button Component Compliance
Button components SHALL implement the documented variants with exact values: `button-primary` (ink #111111 background, white text, 16px/500, 30px radius, 48px height, 16px/32px padding, pressed state collapses the surface via scale with no background shift); `button-secondary` (soft-cloud #f5f5f5 background, ink text, same metrics); `button-outline-on-image` (canvas background, ink text, hairline border, 12px/24px padding, 30px radius); `button-icon-circular` (40px circle, 9999px radius, soft-cloud background or transparent, ink icon). No size variant SHALL exceed the documented 48px CTA height; the large size SHALL keep 48px and may only increase horizontal padding and type size within the scale. Icon-only controls SHALL be at least 40px square, and consumer code SHALL NOT shrink them with ad-hoc width/height utilities. Admin buttons SHALL use the shared `Button` component. Hover states SHALL NOT change background color or lift the button (translateY), per system policy documenting only Default and Active/Pressed.

#### Scenario: Primary button metrics
- **WHEN** a primary CTA button is rendered
- **THEN** it SHALL have ink background, 48px height, 30px border-radius, and NOT translate or change background on hover

#### Scenario: Sale red never on buttons
- **WHEN** any button variant is rendered
- **THEN** its background SHALL NOT use the Sale color

#### Scenario: Large CTA never exceeds 48px
- **WHEN** a CTA is rendered with the large size variant
- **THEN** its computed height SHALL be `48px`

#### Scenario: Icon control minimum target
- **WHEN** an icon-only button is rendered (cart quantity, table row actions, header controls)
- **THEN** its computed width and height SHALL be at least `40px`

#### Scenario: Admin uses the shared button
- **WHEN** an admin form, dialog, or toolbar renders an action button
- **THEN** it SHALL use the shared `Button` component/classes, NOT a raw `<button>` with a 24px radius

### Requirement: Badge Component Compliance
Badges SHALL follow the documented spec: `badge-promo` is canvas background with a 1px hairline border, ink text, 12px/500 (caption-sm), 30px radius, and 4px/12px padding, sitting on top of product imagery; `badge-sale-text` is inline price-row text in Sale color with no background. Badge backgrounds SHALL use canvas, soft-cloud, or success surfaces per documentation, never Sale red. Product availability states ("Esgotado", "Indisponível") SHALL use `badge-promo`, not an error tone, so that Sale red remains reserved for price signals.

#### Scenario: Promo badge style
- **WHEN** a promo badge ("Just In", "Coming Soon", "Esgotado", "Indisponível") is rendered
- **THEN** it SHALL have a canvas background with hairline border and SHALL NOT have a Sale-colored background or Sale-colored text

#### Scenario: Out-of-stock badge tone
- **WHEN** a product card renders the "Esgotado" or "Indisponível" badge
- **THEN** it SHALL use the promo badge treatment (canvas + hairline + ink) instead of the error tone

### Requirement: Admin Surfaces Follow the Same Design System
Admin surfaces (sidebar, header, tables, forms, dialogs, dashboard cards) SHALL use the same design.md tokens and component classes as the storefront. Hardcoded slate/red hex utilities in admin styles SHALL be replaced with palette tokens. No separate or parallel visual system SHALL exist for admin. Admin pages SHALL render on the canvas background. Admin dialogs, forms, and toolbars SHALL compose `Card`, `Button`, `Input`, and `Badge` instead of duplicating visual styles with raw elements, and duplicate legacy component variants (e.g. `components/admin/categories/*` dialogs/forms) SHALL be removed or migrated.

#### Scenario: Admin uses palette tokens
- **WHEN** admin pages are rendered
- **THEN** their colors SHALL resolve from the design.md token set, with no off-palette slate/red hex values

#### Scenario: Shared button and badge components
- **WHEN** admin buttons and badges are rendered
- **THEN** they SHALL use the same Button/Badge components and classes as the storefront

#### Scenario: Admin page surface
- **WHEN** an admin page layout is rendered
- **THEN** its page background SHALL be the canvas color (`#ffffff`)

#### Scenario: Admin dialog composition
- **WHEN** an admin confirmation or edit dialog is rendered
- **THEN** its surface SHALL use `Card` with `0px` radius, no shadow, and its actions SHALL use shared `Button` pills

## ADDED Requirements

### Requirement: Product Detail Page Compliance
The product detail page (PDP) SHALL follow the same flat, token-driven vocabulary as the catalog. The main product image frame SHALL be `0px` radius, use the `soft-cloud` surface with no border and no shadow, and keep a 1:1 ratio. The price SHALL use the `heading-lg` tier (24px/500), not the 32px section tier. Form controls on the PDP (shipping calculator, quantity) SHALL use the shared `Input`/`Button` components so radius, height, and focus ring match the system.

#### Scenario: PDP image frame is flat
- **WHEN** the PDP main image is rendered
- **THEN** its frame SHALL have `0px` border-radius, `soft-cloud` background, no border, and no shadow

#### Scenario: PDP price tier
- **WHEN** the PDP price is rendered
- **THEN** it SHALL use 24px/500 (`heading-lg`)

#### Scenario: PDP form controls are shared
- **WHEN** the shipping calculator input or its submit action is rendered
- **THEN** it SHALL use the shared `Input` and `Button` components with 24px input radius and 30px/48px CTA metrics

### Requirement: Interactive Element Composition
Interactive elements SHALL NOT be nested inside one another. Navigation links styled as buttons SHALL apply the button classes (`buttonVariants`) directly to the `Link`/`<a>` element instead of wrapping a `<button>`. Actions that submit a form SHALL remain `<button type="submit">`. Every interactive element SHALL be keyboard reachable and expose an accessible name.

#### Scenario: No nested interactive elements
- **WHEN** the rendered DOM is inspected on storefront or admin pages
- **THEN** no `<a>` element SHALL contain a `<button>` element (or vice versa)

#### Scenario: Link styled as primary CTA
- **WHEN** a navigation link looks like a primary CTA ("Ir para o Checkout", "Voltar para a loja", "Ver Detalhes")
- **THEN** the `Link` SHALL carry the `btn btn-primary` (or matching variant) classes and SHALL preserve the 48px/30px metrics

### Requirement: Design System Token Coverage
The `globals.css` token set SHALL cover every color, typography, radius, and spacing value documented in the `docs/design.md` front matter. This includes the category accent colors (`accent-pink`, `accent-pink-soft`, `accent-purple-soft`, `accent-purple-pale`, `accent-teal`, `accent-pink-deep`) and the typography tiers `button-md`, `button-lg`, and `link-md`. Accent tokens SHALL be defined but SHALL NOT be used in primary chrome; they remain available for swatches and editorial tiles.

#### Scenario: Accent tokens exist
- **WHEN** globals.css is inspected
- **THEN** the six category accent color variables SHALL be defined with the values from docs/design.md

#### Scenario: Typography tiers exist
- **WHEN** globals.css is inspected
- **THEN** `--type-button-md-*`, `--type-button-lg-*`, and `--type-link-md-*` variables SHALL exist and match the documented sizes, weights, and line heights

#### Scenario: Accents stay out of chrome
- **WHEN** storefront or admin chrome (nav, footer, buttons, badges, cards) is rendered
- **THEN** it SHALL NOT use any category accent color as background, text, or border

### Requirement: Computed-Style Regression Coverage
The Playwright design-system alignment specs SHALL verify computed styles for the components that encode the system's identity, not only the presence of class names. At minimum, the suite SHALL assert: product card `border-radius: 0px` and `box-shadow: none`; primary CTA `height: 48px` and `border-radius: 30px`; active chip inverted background; search pill `border-radius: 24px` and `height: 40px`; header icon control `40px` and `border-radius: 9999px`; promo badge canvas background; and the absence of pill radius on container surfaces.

#### Scenario: Computed product card styles
- **WHEN** the alignment suite evaluates a product card
- **THEN** it SHALL assert computed `border-radius` `0px` and `box-shadow` `none`

#### Scenario: Computed CTA metrics
- **WHEN** the alignment suite evaluates a primary CTA
- **THEN** it SHALL assert computed `height` `48px` and `border-radius` `30px`

#### Scenario: Container radius regression
- **WHEN** the alignment suite evaluates a PDP image frame or a dialog surface
- **THEN** it SHALL assert computed `border-radius` `0px`
