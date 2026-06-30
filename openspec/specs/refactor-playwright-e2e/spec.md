# Refactor Playwright E2E Spec

## Purpose
This specification defines the standards and architectural requirements for frontend E2E browser tests implemented using Playwright.

## Requirements

### Requirement: Page Object Model Encapsulation
All E2E test scripts SHALL isolate selector definitions and interaction methods inside Page Objects and Component Objects.

#### Scenario: Page Interaction
- **WHEN** a test performs interactions like clicking or filling inputs
- **THEN** it SHALL call encapsulation methods on a Page Object and MUST NOT perform direct `page` operations with raw selectors inside the spec file.

### Requirement: Fixture-based Dependency Injection
Page Objects and helper utilities SHALL be registered and injected into tests as custom fixtures rather than manually instantiated.

#### Scenario: Fixture injection
- **WHEN** a test needs a Page Object or auth state
- **THEN** the test script SHALL request the page object or helper via the test arguments, importing `test` and `expect` from the local `baseTest.ts`.

### Requirement: Programmatic Seeding and Clean Teardown
All prerequisite data required by E2E tests (e.g., categories and products) SHALL be seeded programmatically via API fixtures.

#### Scenario: Data Seeding and Cleanup
- **WHEN** tests require pre-existing catalog data
- **THEN** the framework SHALL seed the category or product using the backend API via Playwright's `request` fixture, and MUST teardown/delete that data after test completion.

### Requirement: Structured Steps and Web-first Assertions
Test assertions SHALL reside solely in the spec files, utilize web-first (polling) assertions, and use `test.step()` for readability.

#### Scenario: Asserting UI Behavior
- **WHEN** checking application states and UI changes
- **THEN** tests SHALL use Playwright's web-first assertions (e.g., `expect(locator).toBeVisible()`) and MUST NOT contain hard-coded sleeps, raw page evaluates, or assertions inside POMs.

### Requirement: Playwright E2E Skill Alignment
All E2E spec files and page objects SHALL strictly align with the Playwright E2E skill guidelines.

#### Scenario: Verify baseTest imports
- **WHEN** any E2E spec file is checked
- **THEN** it SHALL import test and expect from baseTest.ts

#### Scenario: Verify page object returns
- **WHEN** action methods inside Page Objects perform navigation
- **THEN** they SHALL return the destination Page Object
