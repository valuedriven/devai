## Why

The backend ESLint config disables 7 core `@typescript-eslint` rules and demotes 1 to `warn`, effectively defeating the `recommendedTypeChecked` config it extends. 10 inline `eslint-disable` comments exist across frontend and backend. This means type safety holes, suppressed warnings, and `any` propagation pass silently. As the codebase grows, these gaps compound — each new `any` cast becomes harder to trace, and the config switches lose their deterrent value.

## What Changes

- **Remove 7 `'off'` and 1 `'warn'` rule overrides** from `apps/backend/eslint.config.mjs` — the `no-unsafe-*` family, `no-explicit-any`, `require-await`, and `no-floating-promises`
- **Fix 21 `: any` type annotations** and **35 `as any` casts** across the backend so those rules can pass at `error`
- **Fix 10 inline `eslint-disable` directives** across 9 frontend files — `@next/next/no-img-element` (5x), `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps`, `@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-require-imports`
- **Fix 1 inline `eslint-disable`** in the backend (`no-unused-vars` in `orders.service.ts`)
- **Properly scope `react-hooks/rules-of-hooks`** to only `.tsx`/`.jsx` files in the frontend ESLint flat config (not turning it off — confining it to file types where it applies)

No product behavior changes. This is purely an engineering quality change.

## Capabilities

### New Capabilities
None — this change does not introduce new product capabilities.

### Modified Capabilities
None — no spec-level behavior changes.

## Impact

**Backend** (`apps/backend/src/`):
- ~21 files touched across modules
- `orders.controller.ts` (7 `:any`), `admin-orders.controller.ts` (2), `clerk.service.ts` (3) — primary targets for typing
- `auth.guard.ts`, `payment.service.ts`, `order-management.service.ts` — production `as any` casts
- `admin-orders.controller.ts` (5x) and `admin-payments.controller.ts` (1x) — `async` keyword removal
- `orders.service.ts` — one destructuring pattern fix
- Test files: ~32 `as any` casts across specs, mostly in `orders.service.spec.ts` (17x)

**Frontend** (`apps/frontend/src/`):
- `data.ts` (~660 lines) — heavy `any` usage for API response mapping
- 5 components using `<img>` → `<Image />` from `next/image`
- `hooks/useApi.ts` — `exhaustive-deps` closure identity fix
- `tests/fixtures/baseTest.ts` — Playwright fixture pattern
- `tests/debug-run.cjs` — CJS → ESM conversion
- `apps/frontend/eslint.config.mjs` — rule scoping adjustment

**Config files**:
- `apps/backend/eslint.config.mjs` — remove 8 rule overrides
- `apps/frontend/eslint.config.mjs` — add file-type scoping for `react-hooks/rules-of-hooks`
