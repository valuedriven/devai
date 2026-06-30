## MODIFIED Requirements

### Requirement: Programmatic Seeding and Clean Teardown
All prerequisite data required by E2E tests (e.g., categories, products, and customers) SHALL be seeded programmatically via API fixtures. Data factories SHALL use `@faker-js/faker` for generating unique, realistic values. The fixture registry SHALL provide pre-built fixtures for commonly seeded entities (categories, products, customers) with automatic teardown.

#### Scenario: Data Seeding and Cleanup
- **WHEN** tests require pre-existing catalog data
- **THEN** the framework SHALL seed the category, product, or customer using the backend API via Playwright's `request` fixture, and MUST teardown/delete that data after test completion

#### Scenario: Data factories use faker
- **WHEN** `makeCategory()`, `makeProduct()`, or `makeCustomer()` factories generate test data
- **THEN** they SHALL use `@faker-js/faker` for field values instead of manual `Date.now() + Math.random()` concatenation

#### Scenario: Fixture-based teardown for all entity types
- **WHEN** a test uses `seededCategory`, `seededProduct`, or `seededCustomer` fixtures
- **THEN** each fixture SHALL create the entity via API before the test and delete it via API after the test completes, without requiring manual `try/finally` blocks in the spec file

### Requirement: Structured Steps and Web-first Assertions
Test assertions SHALL reside solely in the spec files, utilize web-first (polling) assertions, and use `test.step()` for readability. API seeding utilities SHALL NOT contain `expect()` calls — seeding failures SHALL be communicated via thrown errors.

#### Scenario: Asserting UI Behavior
- **WHEN** checking application states and UI changes
- **THEN** tests SHALL use Playwright's web-first assertions (e.g., `expect(locator).toBeVisible()`) and MUST NOT contain hard-coded sleeps, raw page evaluates, or assertions inside POMs

#### Scenario: Multi-phase test readability
- **WHEN** a test has three or more logical phases
- **THEN** each phase SHALL be wrapped in a named `test.step()` block

#### Scenario: No assertions in utilities
- **WHEN** API seeding helper functions encounter failures
- **THEN** they SHALL throw descriptive errors instead of calling `expect()`
