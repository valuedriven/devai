## 1. CSS Token Replacement

- [x] 1.1 Replace indigo/violet HSL variables in globals.css with monochrome tokens from docs/design.md (--color-primary: #111111, --color-canvas: #ffffff, --color-soft-cloud: #f5f5f5, --color-ink: #111111, --color-charcoal: #39393b, --color-ash: #4b4b4d, --color-mute: #707072, --color-stone: #9e9ea0, --color-hairline: #cacacb, --color-hairline-soft: #e5e5e5, --color-sale: #d30005, --color-sale-deep: #780700, --color-success: #007d48)
- [x] 1.2 Update utility classes in globals.css (--primary, --primary-foreground, --background, --foreground, --muted, --border, etc.) to reference new tokens
- [x] 1.3 Add font-family tokens: --font-sans (Inter), --font-display (Space Grotesk / display fallback)

## 2. Directory Structure

- [x] 2.1 Create `features/` directory with subdirectories: products/, cart/, orders/
- [x] 2.2 Create `services/` directory
- [x] 2.3 Create `hooks/` directory
- [x] 2.4 Create `types/` directory
- [x] 2.5 Create `components/ui/` directory for primitive components

## 3. Service Layer

- [x] 3.1 Create `types/api.ts` with API response envelope and ServiceError type
- [x] 3.2 Create `types/models.ts` with domain model interfaces
- [x] 3.3 Create `services/api.ts` — base HTTP client using fetch, base URL, auth token injection, error normalization
- [x] 3.4 Create `services/products.ts` — typed product API functions
- [x] 3.5 Create `services/orders.ts` — typed order API functions
- [x] 3.6 Create `services/categories.ts` — typed category API functions
- [x] 3.7 Create `hooks/useApi.ts` — generic data-fetching hook

## 4. Base Layout

- [x] 4.1 Update root `app/layout.tsx` with new font and color tokens
- [x] 4.2 Verify and update Header component integration
- [x] 4.3 Verify and update Footer component integration
- [x] 4.4 Verify navigation/sidebar structure
- [x] 4.5 Verify Header, Footer, Navigation integration in route group layouts

## 5. Error & Loading Components

- [x] 5.1 Create `components/ErrorBoundary.tsx`
- [x] 5.2 Create `components/Loading.tsx`
- [x] 5.3 Add `app/error.tsx`
- [x] 5.4 Add `app/loading.tsx`

## 6. Environment Configuration

- [x] 6.1 Update `next.config.ts` to load root `.env` using `process.loadEnvFile`
- [x] 6.2 Verify `NEXT_PUBLIC_API_URL` exists in root `.env`
- [x] 6.3 Verify no `.env.local` files in apps/frontend/

## 7. Tests

- [x] 7.1 Write Playwright test for service layer module exports
- [x] 7.2 Write Playwright test for layout rendering (header, footer, body)

## 8. Validation

- [x] 8.1 Run `npm run lint --workspace=frontend` (2 pre-existing errors in auth.fixture.ts)
- [x] 8.2 Run `npm run build --workspace=frontend` — build succeeded
- [x] 8.3 Verify frontend dev server starts without errors
