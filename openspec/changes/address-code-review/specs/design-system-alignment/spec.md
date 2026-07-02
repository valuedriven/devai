## MODIFIED Requirements

### Requirement: Design System Sizing Consistency
The design system CSS tokens (`globals.css`) SHALL use a consistent unit system (e.g., exclusively `rem` or strictly defined variables) for sizing and border-radius properties, avoiding hardcoded `px` overrides.

#### Scenario: Defining border radius
- **WHEN** the border-radius variables are defined
- **THEN** they MUST use the standard unit defined for the system (e.g., `rem`) without mixing absolute `px` values.
