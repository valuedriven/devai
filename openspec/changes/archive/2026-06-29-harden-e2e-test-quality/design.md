## Context

The E2E test suite (`apps/frontend/tests/`) went through a structural alignment in the `align-e2e-tests-with-skill` change, which established Page Object Models, fixture-based DI, `baseTest.ts` imports, and `storageState` caching. The current suite has 16 spec files, 11 POMs, 2 Component Objects, and ~55 tests covering auth, RBAC, CRUD admin, storefront, and order lifecycle flows.

A gap analysis against the `playwright-e2e-tests` skill definition and Playwright's official best practices guide (https://playwright.dev/docs/best-practices) identified 10 issues across security, data quality, fixture coverage, locator hygiene, and structural consistency.

**Current state issues:**
- `tests/.auth/admin.json` and `tests/.auth/customer.json` are tracked by git and contain live JWTs
- 4 spec files contain hardcoded email fallbacks (`process.env.X || 'real@email.com'`)
- `data.ts` uses `Date.now() + Math.random()` instead of `@faker-js/faker`
- Only `seededCategory` fixture exists; products and customers use manual `try/finally`
- `storefront-catalog.spec.ts` uses CSS class selectors (`.badge`)
- `test.step()` usage is inconsistent across spec files
- `utils/api.ts` contains `expect()` calls inside seeding helpers
- `@clerk/testing` is installed but never imported
- `.env.example` lacks `TEST_*` credential variables

## Goals / Non-Goals

**Goals:**
- Eliminate security vulnerabilities (committed auth state, hardcoded credentials)
- Achieve full compliance with the `playwright-e2e-tests` skill quality checklist
- Adopt `@faker-js/faker` for realistic, collision-resistant test data
- Reduce boilerplate with `seededProduct` and `seededCustomer` fixtures
- Replace all CSS class selectors with user-facing locators
- Make `test.step()` usage consistent across all multi-phase tests
- Clean up unused dependencies and document required env vars

**Non-Goals:**
- Rewriting test logic or changing what tests validate
- Adding new test coverage (no new spec files or test cases)
- Changing backend endpoints or API contracts
- Adding multi-browser testing (currently Desktop Chrome only)
- Restructuring the directory layout or project configuration
- Moving API-only tests to backend integration tests (separate concern)

## Decisions

### Decision 1: Use `@faker-js/faker` with deterministic seeds per worker

**Choice**: Replace `Date.now() + Math.random()` in `data.ts` with `@faker-js/faker`.

**Alternatives considered**:
- Keep `Date.now()` pattern: Functional but produces unreadable names (`Cat E2E 1719666234567-4823`). Faker produces natural names (`Eletrônicos Artesanais`) while maintaining uniqueness.
- Use `crypto.randomUUID()`: Unique but not readable. Faker provides both uniqueness and realistic data shapes.

**Rationale**: Faker is the standard recommended by the skill. Its deterministic seeding per Playwright worker (`faker.seed(workerIndex)`) ensures reproducibility in parallel runs while preventing collisions.

### Decision 2: Fixture-based teardown for products and customers

**Choice**: Add `seededProduct` and `seededCustomer` to `baseTest.ts` with automatic teardown in the fixture's `use()` callback.

**Design**:
- `seededProduct` depends on `seededCategory` (uses its `id` as `categoryId`) and `adminAuthToken`
- `seededCustomer` depends on `adminAuthToken`
- Both follow the existing `seededCategory` pattern: create via API before test, delete in teardown
- Tests that need custom data configurations can still use manual `createProduct()`/`createCustomerApi()` with `try/finally`

**Alternatives considered**:
- Database-level cleanup (TRUNCATE tables): Too aggressive, would break parallel execution and shared test accounts
- Keep manual teardown: More flexible but error-prone; 6+ files already show duplicated cleanup patterns

### Decision 3: `ProductCardComponent` as a Component Object

**Choice**: Create `tests/components/ProductCardComponent.ts` to encapsulate product card locators.

**Design**:
```
ProductCardComponent (scoped to root Locator)
  ├── name: Locator (heading role)
  ├── price: Locator (getByTestId)
  ├── addButton: Locator (button role, /adicionar/i)
  ├── outOfStockBadge: Locator (getByText 'Esgotado')
  └── unavailableButton: Locator (button role, /indisponível/i)
```

`StorefrontPage` will compose it via `productCard(name)` method returning a `ProductCardComponent` instance.

**Rationale**: Encapsulates the CSS class selectors (`card.locator('.badge')`) currently in `storefront-catalog.spec.ts` behind user-facing locators, aligning with Playwright's "prefer user-facing attributes" guidance.

### Decision 4: Error handling in API seeding helpers

**Choice**: Replace `expect()` calls inside `utils/api.ts` with thrown errors that include diagnostic context.

**Design**: Instead of:
```ts
expect(res.ok(), `createProduct failed: ${res.status()}`).toBeTruthy();
```
Use:
```ts
if (!res.ok()) {
  throw new Error(`createProduct failed: ${res.status()} ${await res.text()}`);
}
```

**Rationale**: `expect()` in utilities conflates seeding failures with test assertions. A thrown error surfaces the same diagnostic info but keeps assertion logic exclusively in spec files, as required by the skill.

### Decision 5: Auth state gitignore fix

**Choice**: Fix both `.gitignore` files and run `git rm --cached` on the auth state files.

**Design**:
- Fix `apps/frontend/.gitignore`: ensure `tests/.auth/` is a clean line without `\n` prefix artifacts
- Fix root `.gitignore`: change `playwright/.auth/` to `apps/frontend/tests/.auth/`
- Run `git rm --cached apps/frontend/tests/.auth/` to untrack without deleting local files
- Not purging git history (tokens expire and rotate naturally via Clerk)

### Decision 6: Consistent `test.step()` adoption

**Choice**: Add `test.step()` to all tests with 3+ logical phases. Keep simple 1-2 phase tests without steps.

**Files to update**:
- `order-management.spec.ts` — both tests have seed → act → assert phases
- `redirect-pos-login.spec.ts` — both tests have clear → navigate → login → assert phases
- `storefront-catalog.spec.ts` — tests 2.4 and 2.5 have seed → navigate → assert phases

**Not updating**: API-only tests (`api-auth-me`, `api-token-validation`, `api-endpoints-publicos`) with simple request → assert patterns.

## Risks / Trade-offs

- **[Risk] Faker uniqueness in parallel workers** → Mitigation: Use `faker.seed()` with Playwright's `test.info().parallelIndex` to ensure deterministic but worker-unique values. Also append a short random suffix to names.
- **[Risk] `seededProduct` fixture coupling to `seededCategory`** → Mitigation: Design the fixture to accept optional overrides; tests needing custom category/product combos can still use manual seeding.
- **[Risk] Changing API utility error handling could alter test failure messages** → Mitigation: The thrown Error contains the same diagnostic info (`status + body`). Test reports will show the error in the fixture/setup phase rather than as an assertion failure, which is actually more accurate.
- **[Risk] git rm --cached could confuse other developers with local auth state** → Mitigation: Auth state is regenerated on every test run by `auth.setup.ts`. Documenting this in the `.gitignore` comment.
