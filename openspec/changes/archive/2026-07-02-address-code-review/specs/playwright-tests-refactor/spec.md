## MODIFIED Requirements

### Requirement: Web-First Assertions Over waitFor
Page Objects SHALL use Playwright web-first assertions (`expect(locator).toBeVisible()`) instead of Selenium-style `locator.waitFor()`, and they SHALL NOT use `.first()` to bypass strict mode.

#### Scenario: Replace waitFor with expect and remove first
- **WHEN** a POM method needs to wait for an element or locate an element
- **THEN** it MUST use strict locators and `await expect(locator).toBeVisible()` or `.toBeAttached()`, not `locator.waitFor()` and not `.first()`.
