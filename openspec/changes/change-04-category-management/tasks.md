## 1. Database Setup

- [x] 1.1 Add Category model to Prisma schema (`id`, `name`, `slug`, `active`, `createdAt`, `updatedAt`)
- [x] 1.2 Add unique index on lowercase name for case-insensitive uniqueness
- [x] 1.3 Add index on `active` field for query optimization
- [x] 1.4 Run `npx prisma migrate dev` to create migration
- [x] 1.5 Generate Prisma client with `npx prisma generate`

## 2. Backend - DTOs and Validation

- [x] 2.1 Create `create-category.dto.ts` with `name` field (IsString, MaxLength(100), IsNotEmpty)
- [x] 2.2 Create `update-category.dto.ts` with optional `name` and `active` fields
- [x] 2.3 Create `list-categories-query.dto.ts` with optional `page`, `limit`, `search`, `includeInactive` params
- [x] 2.4 Configure ValidationPipe in the module

## 3. Backend - Service Layer

- [x] 3.1 Create `categories.service.ts` with CRUD methods
- [x] 3.2 Implement `slugify` utility for generating URL-safe slugs
- [x] 3.3 Implement `normalizeName` utility for case-insensitive uniqueness
- [x] 3.4 Implement `create` method with duplicate name handling (Prisma P2002 → 409 Conflict)
- [x] 3.5 Implement `findAll` method with pagination and search filters
- [x] 3.6 Implement `findOne` method with 404 handling
- [x] 3.7 Implement `update` method with slug regeneration
- [x] 3.8 Implement `remove` method for soft delete (set `active: false`)
- [x] 3.9 Write unit tests for `CategoriesService` (create, update, soft delete, list with filters, edge cases)
- [x] 3.10 Ensure 80% code coverage on service layer

## 4. Backend - Controller Layer

- [x] 4.1 Create `categories.controller.ts` with all CRUD endpoints
- [x] 4.2 Apply `@AdminGuard()` decorator to all endpoints
- [x] 4.3 Add Swagger decorators for API documentation
- [x] 4.4 Configure `X-Total-Count` header for list endpoint
- [x] 4.5 Create exception filter for Prisma P2002 error → 409 Conflict
- [x] 4.6 Write integration tests for CRUD endpoints (admin authenticated, non-admin → 403, validation errors)
- [ ] 4.7 Ensure lint passes: `npm run lint --workspace=backend`

## 5. Backend - Module Registration

- [x] 5.1 Create `categories.module.ts`
- [x] 5.2 Import `CategoriesModule` in `AppModule`
- [x] 5.3 Verify application starts without errors

## 6. Frontend - API Client

- [x] 6.1 Add category API functions to `lib/api/categories.ts`
- [x] 6.2 Implement `getCategories(params)` with pagination/search support
- [x] 6.3 Implement `getCategory(id)`, `createCategory(data)`, `updateCategory(id, data)`, `deleteCategory(id)`
- [x] 6.4 Add proper TypeScript types for category data

## 7. Frontend - UI Components

- [x] 7.1 Create `CategoryTable` component with columns (Name, Slug, Status, Created At, Actions)
- [x] 7.2 Create `CategoryForm` component (dialog with name input and active toggle)
- [x] 7.3 Create `DeleteConfirmDialog` component with category name display
- [x] 7.4 Create `Toast` component for success/error notifications
- [x] 7.5 Implement search with 300ms debounce
- [x] 7.6 Implement pagination controls
- [x] 7.7 Add "Show Inactive" toggle functionality

## 8. Frontend - Pages

- [x] 8.1 Create `/admin/categories/page.tsx` with category list page
- [x] 8.2 Add "Add Category" button that opens create dialog
- [x] 8.3 Connect Edit button to pre-filled edit dialog
- [x] 8.4 Connect Delete button to confirmation dialog
- [x] 8.5 Implement toast notifications on success/error
- [ ] 8.6 Add admin authorization check (redirect non-admins)
- [ ] 8.7 Ensure lint passes: `npm run lint --workspace=frontend`

## 9. End-to-End Tests

- [ ] 9.1 Create Playwright test for admin creates category successfully
- [ ] 9.2 Create Playwright test for admin edits category
- [ ] 9.3 Create Playwright test for admin deletes category
- [ ] 9.4 Create Playwright test for non-admin cannot access `/admin/categories`
- [ ] 9.5 Run `npx playwright test` and verify all tests pass

## 10. Final Verification

- [ ] 10.1 Run unit tests: `npm run test:unit`
- [ ] 10.2 Run integration tests: `npm run test:integration`
- [ ] 10.3 Run E2E tests: `npx playwright test`
- [ ] 10.4 Verify 80% code coverage on new code
- [ ] 10.5 Ensure all lint checks pass
- [ ] 10.6 Verify application starts and runs correctly