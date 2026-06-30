## Why

Currently, the E2E test suite has two architectural limitations that affect testing reliability, reproducibility, and local environment purity:

1. **Non-deterministic Faker Data**:
   Faker is imported as a global singleton from `@faker-js/faker` in `tests/utils/data.ts`. Because there is no seed initialization for individual tests, every execution generates different strings, emails, and prices. If a test fails due to a edge case in the generated data, it is impossible to reproduce it deterministically.
2. **Missing Global Database Cleanup / Teardown**:
   Although tests clean up their seeded data via custom fixtures on success, a test that is cancelled, timed out, or crashes leaves behind orphaned database records. There is no automated pre-run database reset or post-run global cleanup.
3. **Ad-hoc Data Generation**:
   Some tests manually construct unique test values using `Date.now()` (e.g. in `category-management.spec.ts`) rather than using standard, centralized generators.

Addressing these issues guarantees a completely clean test database slate, prevents tests from polluting subsequent runs, and makes any test failures fully reproducible.

## What Changes

- **Seeded Faker Fixture**: 
  Introduce a custom `faker` fixture in `tests/fixtures/baseTest.ts` that deterministically seeds Faker before each test using a hash generated from the test file path, project name, and test title.
- **Update Data Generators**:
  Refactor `tests/utils/data.ts` to use the seeded faker instance, ensuring that test data generation is fully isolated and reproducible.
- **Refactor Ad-hoc String Generation**:
  Replace occurrences of `Date.now()` with standard data generator functions (`makeCategory`, `makeProduct`, etc.).
- **Global Teardown / DB Reset Setup**:
  Define a global setup/teardown strategy for database clean-up (e.g. running Prisma migration resets or a clean-up script before and after E2E execution).

## Capabilities

### Modified Capabilities
- None.

## Impact

- All Playwright test files in `apps/frontend/tests/`
- Data utilities in `apps/frontend/tests/utils/data.ts`
- Playwright base fixtures in `apps/frontend/tests/fixtures/baseTest.ts`
