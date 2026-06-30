## 1. Backend: Type `@CurrentUser()` user parameter

- [x] 1.1 Create `AuthUser` interface in `src/core/auth/interfaces/auth-user.interface.ts`
- [x] 1.2 Update `orders.controller.ts` — type 7 `@CurrentUser() user` params from `any` to `AuthUser`
- [x] 1.3 Update `admin-orders.controller.ts` — type 2 `@CurrentUser() user` params from `any` to `AuthUser`
- [x] 1.4 Update `ClerkService` — type `clerkClient` field using `@clerk/backend` types (not `any`)
- [x] 1.5 Fix `auth.guard.ts` — replace `error: any` with `unknown` in catch clause
- [x] 1.6 Fix `prisma.service.ts` — replace `as any` cast in Prisma adapter constructor with proper adapter type
- [x] 1.7 Fix `auth.controller.ts` — replace `(req as any).user` with typed access
- [x] 1.8 Fix `main.ts` — replace `BigInt.prototype as any` with `unknown` cast

## 2. Backend: Fix test `as any` casts

- [x] 2.1 Refactor `orders.service.spec.ts` — replace 17 `as any` casts with typed mock objects
- [x] 2.2 Refactor `auth.guard.spec.ts` — replace 4 `as any` casts with typed mock execution context
- [x] 2.3 Refactor `roles.guard.spec.ts` — replace 4 `as any` casts with typed mock execution context
- [x] 2.4 Refactor `products.controller.spec.ts` — replace 4 `as any` casts with typed mocks
- [x] 2.5 Refactor `admin-orders.controller.spec.ts` — replace `as any` status cast
- [x] 2.6 Refactor `payment.service.spec.ts` — replace `as any` mock cast
- [x] 2.7 Refactor `order-management.service.spec.ts` — replace `as any` mock cast
- [x] 2.8 Refactor `auth.controller.spec.ts` and `orders.controller.spec.ts` — type `req, _res, next` params

## 3. Backend: Fix `require-await` redundant async functions

- [x] 3.1 Remove `async` from 5 delegate functions in `admin-orders.controller.ts` (`getTransitions`, `findAll`, `findOne`, `transitionStatus`, `registerPayment`)
- [x] 3.2 Remove `async` from `findAll` in `admin-payments.controller.ts`

## 4. Backend: Fix remaining inline disables

- [x] 4.1 Fix `orders.service.ts` — replace `order_items: _` destructure with pattern that doesn't trigger `no-unused-vars` (e.g., `void` or use rest twice)

## 5. Backend: Remove config rule overrides

- [x] 5.1 Remove all 7 `'off'` and 1 `'warn'` rule overrides from `apps/backend/eslint.config.mjs`
- [x] 5.2 Run `npm run lint` on backend and verify zero errors

## 6. Frontend: Replace `<img>` with Next.js `<Image />`

- [x] 6.1 Fix `ProductCard.tsx` — replace `<img>` with `<Image />`
- [x] 6.2 Fix `ProductForm.tsx` — replace `<img>` with `<Image />`
- [x] 6.3 Fix `products/[id]/page.tsx` — replace `<img>` with `<Image />`
- [x] 6.4 Fix `orders/[id]/page.tsx` — replace `<img>` with `<Image />`
- [x] 6.5 Fix `cart/page.tsx` — replace `<img>` with `<Image />`
- [x] 6.6 Fix `admin/products/page.tsx` — replace `<img>` with `<Image />`

## 7. Frontend: Fix `react-hooks` disables

- [x] 7.1 Fix `useApi.ts` — use `useRef` to stabilize `fetcher` identity so `exhaustive-deps` passes
- [x] 7.2 Scope `react-hooks/rules-of-hooks` to `.tsx`/`.jsx` files in `apps/frontend/eslint.config.mjs`

## 8. Frontend: Fix type-level disables

- [x] 8.1 Fix `debug-run.cjs` — convert to ESM with `import` syntax (rename to `.mjs`)
- [x] 8.2 Audit `data.ts` — create response-type interfaces for each API endpoint, replace `fetchApi<any>` with typed calls
- [x] 8.3 Fix `data.ts` — replace `dto: any` patterns with proper DTO types

## 9. Final validation

- [x] 9.1 Run `npm run lint` on both frontend and backend — confirm zero errors
- [x] 9.2 Run `npm run test:unit` on backend — confirm all tests pass
- [x] 9.3 Run `npm run build` on both apps — confirm builds succeed
