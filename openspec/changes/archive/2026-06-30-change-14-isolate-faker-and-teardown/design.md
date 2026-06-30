## Context

To address non-deterministic test data and cleanup issues in our Playwright E2E tests, this design provides a detailed plan to isolate Faker instances per test run and establish database state management routines.

## Goals / Non-Goals

**Goals:**
- Implement a deterministically seeded Faker fixture for E2E tests.
- Refactor the data utility `data.ts` to support local seeded Faker instances.
- Standardize all ad-hoc random values in test specs to use Faker.
- Establish a database cleanup/setup strategy to avoid dirty states.

**Non-Goals:**
- Changing actual frontend application components or behavior.
- Altering the backend API business logic.

---

## Decisions

### 1. Seeded Faker Fixture
We will extend Playwright's base test in [baseTest.ts](file:///home/junilson/projetos/devai/apps/frontend/tests/fixtures/baseTest.ts) to provide a custom `faker` instance.
The fixture will calculate a deterministic hash based on:
1. The test file path (`testInfo.file`)
2. The project name (`testInfo.project.name`)
3. The test title (`testInfo.title`)

```typescript
import { faker } from '@faker-js/faker';

// In baseTest.ts
export const test = base.extend<Fixtures & { faker: typeof faker }>({
  faker: async ({}, use, testInfo) => {
    const seedInput = `${testInfo.file}:${testInfo.title}:${testInfo.project.name}`;
    let hash = 0;
    for (let i = 0; i < seedInput.length; i++) {
      hash = (hash << 5) - hash + seedInput.charCodeAt(i);
      hash |= 0;
    }
    faker.seed(Math.abs(hash));
    await use(faker);
  },
  // Update other seeded fixtures to consume this local seeded faker
  seededCategory: async ({ request, adminAuthToken, faker }, use) => {
    // Pass the local seeded faker to the generator
    ...
  }
});
```

### 2. Update data.ts Generators
We will refactor [data.ts](file:///home/junilson/projetos/devai/apps/frontend/tests/utils/data.ts) to accept the custom `faker` instance, falling back to the global singleton if none is provided:
```typescript
import { faker as globalFaker } from '@faker-js/faker';

export const makeCategory = (faker = globalFaker) => ({
  name: `${faker.commerce.department()} ${faker.string.alphanumeric(6)}`,
});
```

### 3. Replace Ad-Hoc `Date.now()` String Generation
All test specs (such as `category-management.spec.ts` and others) will be refactored to use these functions. Instead of:
`const catName = "Eletrônicos Teste " + Date.now();`
We will use:
`const catName = makeCategory(faker).name;`

### 4. Database Reset and Global Teardown Strategy
To prevent test pollution from aborted tests:
- Introduce a pre-test execution step in the root or backend workspace to reset the database schema (e.g. `npx prisma db push --force-reset` or running a clean-up script via prisma).
- Add a script `db:clean` in the backend workspace to clear out E2E-seeded database records (with prefix/identifiers like `E2E-`) or run it on global teardown.

---

## Risks / Trade-offs

- Seeding faker ensures reproducibility but means tests will generate the same values every run. While this helps reproduce bugs, it might hide edge cases that are only caught by completely random inputs. To mitigate this, the seed changes whenever the test title or path changes.
