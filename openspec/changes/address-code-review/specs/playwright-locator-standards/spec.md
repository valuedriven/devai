## ADDED Requirements

### Requirement: Playwright Strict Locators
The test suite SHALL use strict locators that uniquely identify elements in the DOM without relying on the `.first()` or `.nth()` methods for disambiguation.

#### Scenario: Element appears multiple times
- **WHEN** an element is queried that exists multiple times on the page
- **THEN** the locator MUST be refined using parent scoping (`.locator('parent').getBy...`) or `.filter({ hasText: ... })` to ensure exactly one element is matched.

### Requirement: Playwright Regex Safety
The test suite SHALL safely evaluate dynamic strings in locators to prevent regular expression evaluation errors.

#### Scenario: Dynamic text in locator
- **WHEN** dynamic text is used to locate an element
- **THEN** it MUST use exact string matching or properly escape the input before passing it to `new RegExp()`.
