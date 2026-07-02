# Capability: Design System Alignment

## Purpose
TBD: This capability covers the implementation of the core brand design system in the frontend, defining styling rules and constants.
## Requirements
### Requirement: Color Palette Compliance
The frontend implementation SHALL restrict colors strictly to the palette defined in docs/design.md. The primary colors include Nike Black (#111111) for primary text and CTAs, Pure White (#ffffff) for canvas, and Soft Cloud (#f5f5f5) for product backgrounds and secondary CTAs.

#### Scenario: Global background color
- **WHEN** the storefront or admin page is rendered
- **THEN** the canvas background color SHALL be `#ffffff` and default text color SHALL be `#111111`

#### Scenario: Product card background color
- **WHEN** product card images are rendered
- **THEN** the background color of the image container SHALL be `#f5f5f5`

### Requirement: Component Shape Vocabulary
The border-radius of all frontend UI components SHALL strictly match the values defined in the design system. Product cards, campaign tiles, navigation headers, and footers must be completely flat (0px). Every call-to-action button, filter chip, and badge must be fully rounded / pill-shaped (30px).

#### Scenario: Product card border radius
- **WHEN** a product card or campaign tile is rendered
- **THEN** its CSS border-radius SHALL be `0px`

#### Scenario: CTA button border radius
- **WHEN** a primary or secondary CTA button is rendered
- **THEN** its CSS border-radius SHALL be `30px`

#### Scenario: Search input border radius
- **WHEN** the search pill input is rendered
- **THEN** its CSS border-radius SHALL be `24px`

### Requirement: Typography Scale Compliance
Typography across the frontend SHALL match the Helvetica Now Display / Inter typography hierarchy defined in the design system.

#### Scenario: Campaign Display Headline
- **WHEN** a campaign hero banner is rendered
- **THEN** the display headline text SHALL use 96px size, 500 weight, 0.9 line height, and uppercase transformation

#### Scenario: Button text typography
- **WHEN** a standard button is rendered
- **THEN** the button text SHALL use 16px size and 500 weight

### Requirement: Design System Sizing Consistency
The design system CSS tokens (`globals.css`) SHALL use a consistent unit system (e.g., exclusively `rem` or strictly defined variables) for sizing and border-radius properties, avoiding hardcoded `px` overrides.

#### Scenario: Defining border radius
- **WHEN** the border-radius variables are defined
- **THEN** they MUST use the standard unit defined for the system (e.g., `rem`) without mixing absolute `px` values.

