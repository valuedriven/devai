# playwright-tests-refactor Specification

## Purpose
TBD - created by archiving change adjust-playwright-tests. Update Purpose after archive.
## Requirements
### Requirement: Page Object Guard Patterns
All Page Object action methods SHALL implement the guard patterns mandated by the skill: dialog-visibility guards before modal input, row-visibility guards before table-row actions, and post-mutation guards after async API calls.

#### Scenario: Dialog guard before modal input
- **WHEN** a Page Object method opens a modal and fills inputs
- **THEN** it MUST `await expect(this.dialog).toBeVisible()` before any `.fill()` call.

#### Scenario: Post-mutation guard after delete
- **WHEN** a Page Object method triggers a delete/mutation via API
- **THEN** it MUST wait for the confirmation dialog or action button to disappear before returning.

#### Scenario: Confirmation buttons use click not press
- **WHEN** a Page Object method submits a confirmation action
- **THEN** it MUST use `.click()` on the button, not `press('Enter')`.

### Requirement: POM Single Responsibility
Page Object action methods SHALL NOT contain navigation waits or URL assertions. Navigation verification belongs at the call site.

#### Scenario: No waitForURL inside POM methods
- **WHEN** a POM method performs an action (login, add to cart, cancel)
- **THEN** it MUST NOT call `page.waitForURL()` internally. Callers decide what to assert next.

### Requirement: goTo Anchor Assertion
Every `goTo()` and navigation method in Page Objects SHALL wait for meaningful post-fetch content, not just page load events.

#### Scenario: gotoProductDetail waits for content
- **WHEN** `StorefrontPage.gotoProductDetail(id)` is called
- **THEN** it MUST wait for a post-fetch element (e.g. heading) to be visible before returning.

### Requirement: Navigation Encapsulation in Tests
Test bodies SHALL NOT use `page.waitForURL()` or raw `page.goto()` directly. Navigation MUST go through Page Object methods and destination assertions.

#### Scenario: No inline waitForURL in test body
- **WHEN** a test needs to wait for navigation
- **THEN** it MUST assert visibility of a destination Page Object element, not call `page.waitForURL()`.

#### Scenario: No inline timeout overrides
- **WHEN** an assertion is made in a test
- **THEN** it MUST rely on global timeout or `test.slow()`, not pass `{ timeout: N }`.

#### Scenario: RBAC tests may use raw page.goto
- **WHEN** a test verifies redirect behavior for unauthorized routes
- **THEN** it MAY use `page.goto()` directly since the purpose is to test raw URL access.

### Requirement: Fixture-Based Data Lifecycle
Tests SHALL use Playwright fixtures for test data creation and automatic teardown instead of inline `try/finally` blocks.

#### Scenario: No try/finally cleanup in tests
- **WHEN** a test needs seeded data
- **THEN** it MUST use a fixture that handles teardown automatically.

#### Scenario: seededOrder fixture available
- **WHEN** a test needs a single pre-created order
- **THEN** it MUST use the `seededOrder` fixture which depends on `seededProduct` and `seededCustomer`.

#### Scenario: Fixtures abort on broken preconditions
- **WHEN** a fixture's API seeding call fails
- **THEN** it MUST call `test.abort('reason')` instead of letting the test fail as a false product bug.

### Requirement: Order and OrderItem Data Layer
The `data.ts` utility SHALL define typed interfaces and factories for Order and OrderItem entities.

#### Scenario: OrderItemData and makeOrderItem exist
- **WHEN** a test needs to construct order item data
- **THEN** it MUST use `OrderItemData` and `makeOrderItem()` from `data.ts`.

#### Scenario: OrderData and makeOrder exist
- **WHEN** a test needs to construct order data
- **THEN** it MUST use `OrderData` and `makeOrder()` from `data.ts`.

#### Scenario: createOrderApi accepts OrderData
- **WHEN** `createOrderApi` is called
- **THEN** its parameter MUST be typed as `OrderData`, not an anonymous inline type.

### Requirement: ESLint Floating Promises Rule
The frontend ESLint configuration SHALL enforce `@typescript-eslint/no-floating-promises` on test files.

#### Scenario: Missing await caught at lint time
- **WHEN** a test file has an unawaited async Playwright call
- **THEN** ESLint MUST report an error before the test reaches CI.

### Requirement: Centralized API Base URL
Test files SHALL NOT hardcode API URLs. All API calls MUST use the shared `API_BASE` constant from `utils/api.ts`.

#### Scenario: No hardcoded localhost URLs in tests
- **WHEN** a test makes a direct API call
- **THEN** it MUST import and use `API_BASE` from `utils/api.ts`.

### Requirement: Web-First Assertions Over waitFor
Page Objects SHALL use Playwright web-first assertions (`expect(locator).toBeVisible()`) instead of Selenium-style `locator.waitFor()`.

#### Scenario: Replace waitFor with expect
- **WHEN** a POM method needs to wait for an element
- **THEN** it MUST use `await expect(locator).toBeVisible()` or `.toBeAttached()`, not `locator.waitFor()`.

