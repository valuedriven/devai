# Task Checklist: Isolate Faker and Setup Teardown Strategies

- [x] Implement Seeding Faker Fixture
  - [x] Add the `faker` fixture in `apps/frontend/tests/fixtures/baseTest.ts`
  - [x] Update `seededCategory`, `seededProduct`, and `seededCustomer` fixtures to consume the seeded `faker` fixture
- [x] Refactor Data Generators
  - [x] Refactor `makeCategory`, `makeProduct`, and `makeCustomer` in `apps/frontend/tests/utils/data.ts` to accept the seeded `faker` instance
- [x] Replace Ad-hoc Random Value Generation in Specs
  - [x] Refactor `apps/frontend/tests/category-management.spec.ts` to use `makeCategory(faker)`
  - [x] Audit other specs under `apps/frontend/tests/` to replace `Date.now()` with seeded generators
- [x] Database Setup/Teardown Actions
  - [x] Set up a database clean/reset script in `apps/backend`
  - [x] Update testing tasks/scripts in root `package.json` to perform database reset before E2E tests run
- [x] Validation
  - [x] Run `npm run lint` and verify zero errors
  - [x] Run `npm run test:e2e` to verify all tests continue to pass and execute with deterministic inputs
