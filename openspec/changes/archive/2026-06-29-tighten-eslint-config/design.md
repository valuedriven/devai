## Context

The backend ESLint config (`apps/backend/eslint.config.mjs`) extends `tseslint.configs.recommendedTypeChecked`, which enables strict `@typescript-eslint` rules for type-safe code. However, 7 of those rules are immediately overridden to `'off'`:

- `no-explicit-any` — 21 explicit `: any` annotations exist
- `no-unsafe-argument`, `no-unsafe-call`, `no-unsafe-member-access`, `no-unsafe-assignment`, `no-unsafe-return` — 35 `as any` casts exist
- `require-await` — 6 `async` functions that never `await`
- `no-floating-promises` — set to `warn` (clean, 0 warnings)

The frontend has no config-level disabled rules but has 10 inline `eslint-disable` directives across 9 files.

The root cause is `any` propagation: controller handlers type `@CurrentUser()` as `any`, API response mappers use `any` generically, and Clerk client is untyped. Each `any` flows through to callers, creating the `no-unsafe-*` violations.

## Goals / Non-Goals

**Goals:**
- Remove all 7 `'off'` and 1 `'warn'` rule overrides from `backend/eslint.config.mjs`
- Remove all 10 inline `eslint-disable` directives from frontend + 1 from backend
- Produce zero lint errors at `error` severity in both apps after the change
- Properly scope `react-hooks/rules-of-hooks` to React files only (not "off", just confined to relevant file types)

**Non-Goals:**
- Not introducing type perfection across the entire codebase — only fixing what's needed to pass the previously-off rules at `error`
- Not changing product behavior, API contracts, or database schemas
- Not restructuring components beyond what's needed for type correctness

## Decisions

### Decision 1: `AuthUser` interface over inline `any` for `@CurrentUser()`

**Problem:** 9 controller methods annotate `@CurrentUser() user: any`. This is the single largest source of `any` in production code.

**Option A — Express `Request['user']` extend:** Use `declare module 'express' { interface Request { user: AuthUser } }` — couples to Express types, which NestJS abstracts.

**Option B — Custom `AuthUser` interface:** Create a shared `AuthUser` interface in `src/core/auth/` and use it everywhere.

**Chosen: B** — Cleaner, framework-agnostic, explicit. The interface mirrors what Clerk actually returns.

**Pattern:**
```typescript
// src/core/auth/interfaces/auth-user.interface.ts
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'CUSTOMER';
  clerkId: string;
}
```

### Decision 2: `ClerkClient` types from `@clerk/backend`

**Problem:** `clerkClient` field in `ClerkService` is typed as `any`.

**Option A — Use `@clerk/backend` types directly** — import `clerkClient` from `@clerk/backend` which has full types.

**Option B — Wrap in a typed interface** — add thin abstraction.

**Chosen: A** — The SDK already provides proper types. Import and use `import { clerkClient, type ClerkClient } from '@clerk/backend'` instead of a raw constructor.

### Decision 3: Prisma adapter constructor cast

**Problem:** `src/database/prisma.service.ts` uses `super({ adapter } as any)` to bypass a type mismatch in the Prisma adapter.

**Chosen:** Cast to the specific Prisma adapter type (`PrismaPostgresAdapter` or equivalent) instead of `any`. If the types don't align perfectly, use a targeted `as unknown as TargetType` double-cast — still explicit about intent, not a blanket `any`.

### Decision 4: Replace `<img>` with `<Image />` from `next/image`

**Pattern:**
```tsx
import Image from 'next/image';

// For fixed-size product thumbnails:
<Image src={product.image} alt={product.name} width={160} height={160} className="object-cover" />

// For fill-parent containers:
<Image src={product.image} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
```

5 components need this. Each is a simple `<img>` tag replacement with explicit dimensions.

### Decision 5: Fix `react-hooks/exhaustive-deps` in `useApi.ts`

Use `useRef` to stabilize the `fetcher` identity, then add it to deps:
```typescript
const fetcherRef = useRef(fetcher);
fetcherRef.current = fetcher;
```
Then the `useCallback` depends on `fetcherRef` (stable identity) and `deps` array for logical re-execution.

### Decision 6: Scope `react-hooks/rules-of-hooks` to React files

In `apps/frontend/eslint.config.mjs`, add two targeted file patterns: `error` for `.tsx`/`.jsx` files, and `off` for `.ts`/`.js` files. `nextVitals`/`nextTs` enable the rule globally, so an explicit `off` for non-React file types is required to suppress the false positive in Playwright fixtures (`baseTest.ts`). The rule is not turned off globally — it remains active and enforced for all React component files.

### Decision 7: Test `as any` casts → typed mock factories

Test files use `as any` extensively (32 occurrences). Replace with typed mock factories or inline objects matching the expected interface. This is preferable to `as any` because type mismatches become test failures instead of runtime surprises.

### Decision 8: `data.ts` `any` → typed response interfaces

`src/lib/data.ts` uses `fetchApi<any>(url, ...)` pervasively. Create per-endpoint response interfaces and type `fetchApi` calls with those interfaces instead of `any`. This also improves IDE autocompletion in the frontend.

## Risks / Trade-offs

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Removing `'off'` rules reveals new lint errors not caught today | Medium | Medium | Run `npm run lint` iteratively during implementation, not just at the end |
| `data.ts` typing breaks runtime behavior if response shapes mismatch | Low | Medium | Types are compile-time only — no runtime impact. Test the affected pages after change |
| `<img>` → `<Image />` changes layout due to different sizing semantics | Low | Medium | Use `fill` with `sizes` prop for responsive images; use explicit `width`/`height` for thumbnails. Visually verify each component |
| Test mock refactoring (32 `as any` casts) could change test behavior if types are wrong | Low | Medium | Each mock already structurally matches the expected object — typing just validates this |
| `useApi.ts` refetch behavior changes if `fetcher` identity handling is wrong | Medium | High | Existing tests cover this hook. Run full test suite before completing |
| `ClerkClient` type from `@clerk/backend` might not match the runtime constructor behavior | Low | Low | The SDK's own types match its runtime by definition. Test authentication flows after change |
