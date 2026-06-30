## ADDED Requirements

### Requirement: Playwright E2E Skill Alignment
All E2E spec files and page objects SHALL strictly align with the Playwright E2E skill guidelines.

#### Scenario: Verify baseTest imports
- **WHEN** any E2E spec file is checked
- **THEN** it SHALL import test and expect from baseTest.ts

#### Scenario: Verify page object returns
- **WHEN** action methods inside Page Objects perform navigation
- **THEN** they SHALL return the destination Page Object
