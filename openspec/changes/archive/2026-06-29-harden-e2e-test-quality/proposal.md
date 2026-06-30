## Why

The previous `align-e2e-tests-with-skill` change established the structural foundation for E2E tests (Page Objects, fixtures, baseTest imports). However, a gap analysis against the `playwright-e2e-tests` skill and Playwright's official best practices reveals 10 remaining issues ranging from a security vulnerability (committed auth state with real JWTs) to inconsistent patterns (hardcoded credentials, missing faker, incomplete fixture teardown). These gaps reduce test reliability, maintainability, and security posture.

## What Changes

- **Fix .gitignore and remove committed auth state files** containing real JWT tokens from the repository
- **Remove hardcoded credential fallbacks** from 4 spec files that leak real email addresses as `||` defaults
- **Replace `Date.now() + Math.random()` data factories** with `@faker-js/faker` for realistic, collision-resistant test data generation
- **Add `seededProduct` and `seededCustomer` fixtures** to `baseTest.ts` with automatic API teardown, replacing manual `try/finally` blocks in 6+ spec files
- **Replace CSS class selectors** (`.badge`, `button` tag) with user-facing locators (`getByRole`, `getByText`, `getByTestId`) in `storefront-catalog.spec.ts`
- **Add `ProductCardComponent`** to encapsulate product card queries currently scattered across test files
- **Add `test.step()` to multi-phase tests** that are currently missing it (`order-management.spec.ts`, `redirect-pos-login.spec.ts`, `storefront-catalog.spec.ts`)
- **Move `expect()` calls out of `utils/api.ts`** seeding helpers to decouple assertion logic from data utilities
- **Remove unused `@clerk/testing` dependency**
- **Document `TEST_*` environment variables** in `.env.example`

## Capabilities

### New Capabilities

- `e2e-test-hardening`: Covers all adjustments to align E2E test infrastructure with the `playwright-e2e-tests` skill and Playwright official best practices — security fixes, data factories, fixture improvements, locator hygiene, and structural consistency.

### Modified Capabilities

- `refactor-playwright-e2e`: The existing spec's requirement for "Programmatic Seeding and Clean Teardown" is extended to mandate fixture-based teardown for products and customers (not just categories), and to require `@faker-js/faker` for data generation instead of manual uid functions.

## Impact

- **Files modified**: ~20 files in `apps/frontend/tests/` (fixtures, utils, pages, components, specs)
- **New files**: `tests/components/ProductCardComponent.ts`
- **Dependencies**: Add `@faker-js/faker` to `apps/frontend/devDependencies`; remove `@clerk/testing`
- **Config files**: `apps/frontend/.gitignore`, root `.gitignore`, root `.env.example`
- **Git history**: Auth state files (`tests/.auth/*.json`) removed from tracking
- **No backend changes**: All modifications are scoped to the frontend E2E test infrastructure
- **No breaking changes**: Test behavior is preserved; only implementation quality improves
