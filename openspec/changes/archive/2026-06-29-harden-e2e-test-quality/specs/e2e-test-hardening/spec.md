## ADDED Requirements

### Requirement: Auth state files SHALL NOT be committed to version control
Generated authentication state files containing JWTs and session data SHALL be excluded from version control via `.gitignore` rules. Previously tracked auth state files SHALL be removed from git tracking.

#### Scenario: Auth state excluded from git
- **WHEN** a developer runs `git status` after E2E test execution
- **THEN** files in `tests/.auth/` SHALL NOT appear as tracked or staged changes

#### Scenario: Gitignore covers all auth state paths
- **WHEN** the `.gitignore` rules are evaluated
- **THEN** both `apps/frontend/tests/.auth/` (from root) and `tests/.auth/` (from frontend) SHALL be correctly matched

### Requirement: Test credentials SHALL use environment variables without hardcoded fallbacks
All test files that reference authentication credentials SHALL use `process.env.<VAR>!` (non-null assertion) without `||` fallback values containing real email addresses or passwords.

#### Scenario: No hardcoded credentials in spec files
- **WHEN** any spec file references `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CUSTOMER_EMAIL`, or `CUSTOMER_PASSWORD`
- **THEN** the reference SHALL use `process.env.<VAR>!` pattern and MUST NOT include a `||` fallback with a literal string

#### Scenario: Required test credentials documented
- **WHEN** a developer reads `.env.example` at the repository root
- **THEN** all four credential variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`) SHALL be documented with placeholder values

### Requirement: Test data factories SHALL use @faker-js/faker
All test data generation in `utils/data.ts` SHALL use `@faker-js/faker` instead of manual `Date.now() + Math.random()` uid functions for producing unique, realistic test values.

#### Scenario: Category factory uses faker
- **WHEN** `makeCategory()` is called
- **THEN** it SHALL return a category name generated via `faker.commerce.department()` or equivalent, with a unique suffix to prevent collisions

#### Scenario: Product factory uses faker
- **WHEN** `makeProduct(categoryId)` is called
- **THEN** it SHALL return a product with name from `faker.commerce.productName()`, price from `faker.commerce.price()`, and stock from `faker.number.int()`

#### Scenario: Customer factory uses faker
- **WHEN** `makeCustomer()` is called
- **THEN** it SHALL return a customer with name from `faker.person.fullName()`, email from `faker.internet.email()`, phone from `faker.phone.number()`, and address from `faker.location.streetAddress()`

### Requirement: Fixture-based teardown for seeded products and customers
The test fixture registry (`baseTest.ts`) SHALL provide `seededProduct` and `seededCustomer` fixtures that create resources via API before the test and automatically delete them in teardown.

#### Scenario: seededProduct fixture creates and cleans up product
- **WHEN** a test declares `seededProduct` in its fixture arguments
- **THEN** the fixture SHALL create a product via `POST /admin/products` using `adminAuthToken` and `seededCategory`, make it available during the test, and delete it via `DELETE /admin/products/:id` after the test completes

#### Scenario: seededCustomer fixture creates and cleans up customer
- **WHEN** a test declares `seededCustomer` in its fixture arguments
- **THEN** the fixture SHALL create a customer via `POST /customers` using `adminAuthToken`, make it available during the test, and delete it via `DELETE /customers/:id` after the test completes

### Requirement: ProductCardComponent SHALL encapsulate product card locators
A Component Object (`ProductCardComponent`) SHALL encapsulate all locators for product cards displayed on the storefront, replacing CSS class selectors used directly in test files.

#### Scenario: Storefront tests use ProductCardComponent
- **WHEN** a test interacts with a product card on the storefront
- **THEN** it SHALL use `ProductCardComponent` methods and locators instead of raw CSS selectors like `.badge` or tag selectors like `button`

#### Scenario: Component uses user-facing locators
- **WHEN** `ProductCardComponent` defines its locators
- **THEN** all locators SHALL use `getByRole`, `getByText`, or `getByTestId` — MUST NOT use CSS class selectors

### Requirement: Multi-phase tests SHALL use test.step()
All E2E tests with three or more logical phases (e.g., seed → act → assert) SHALL wrap each phase in a `test.step()` call for trace viewer readability.

#### Scenario: Order management tests use steps
- **WHEN** `order-management.spec.ts` tests execute
- **THEN** each test SHALL have its seed, action, and assertion phases wrapped in named `test.step()` blocks

#### Scenario: Redirect post-login tests use steps
- **WHEN** `redirect-pos-login.spec.ts` tests execute
- **THEN** each test SHALL have its clear-state, navigate, login, and verify phases wrapped in named `test.step()` blocks

#### Scenario: Storefront catalog multi-phase tests use steps
- **WHEN** `storefront-catalog.spec.ts` tests with 3+ phases execute (tests 2.4, 2.5)
- **THEN** each phase SHALL be wrapped in a named `test.step()` block

### Requirement: API seeding utilities SHALL NOT contain test assertions
Helper functions in `utils/api.ts` SHALL NOT use `expect()` from Playwright. Seeding failures SHALL be communicated via thrown errors with diagnostic context.

#### Scenario: createProduct failure reporting
- **WHEN** `createProduct()` receives a non-OK response from the backend
- **THEN** it SHALL throw an `Error` with the response status and body text, and MUST NOT call `expect()`

#### Scenario: getAuthToken failure reporting
- **WHEN** `getAuthToken()` cannot find the `devai_auth_token` cookie
- **THEN** it SHALL throw an `Error` with a descriptive message, and MUST NOT call `expect()`

### Requirement: Unused dependencies SHALL be removed
The `@clerk/testing` package SHALL be removed from `apps/frontend/package.json` devDependencies since it is not imported by any test file.

#### Scenario: Clean dependency tree
- **WHEN** `package.json` devDependencies are inspected
- **THEN** `@clerk/testing` SHALL NOT be present
- **AND** `@faker-js/faker` SHALL be present
