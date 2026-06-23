## Context

The system currently lacks a category management feature. Products need to be organized into categories for navigation, filtering, and display purposes. This change implements the full CRUD lifecycle for categories, available exclusively to admin users.

**Current State:**
- No category entity exists in the database
- No category management UI exists on the frontend
- Auth & Security (Change-03) is the dependency, providing admin authorization infrastructure

**Constraints:**
- NestJS modular architecture with strict separation of concerns
- Next.js as presentation layer only (no business logic)
- Clerk for authentication, custom admin guard for authorization
- Minimum 80% test coverage for all code
- Soft delete pattern for data retention and audit trails

## Goals / Non-Goals

**Goals:**
- Provide complete CRUD operations for categories via REST API
- Admin-only access to all category management endpoints
- Soft delete functionality (preserve data, mark as inactive)
- Search and pagination for list operations
- Input validation with meaningful error messages
- Admin UI for category management with form validation and toast notifications

**Non-Goals:**
- Category reordering or drag-and-drop (future enhancement)
- Bulk operations (batch create/update/delete)
- Category images or media attachments
- Public category listing (handled separately in Public Catalog change)
- Category hierarchy/parent-child relationships (flat structure only)

## Decisions

### 1. Soft Delete Pattern with `active` Flag

**Decision:** Use an `active` boolean flag on the Category model instead of physical deletion or a `deletedAt` timestamp.

**Rationale:**
- Simpler to implement and query
- Avoids NULL handling complexity
- Easy to restore by toggling the flag
- Sufficient for admin use cases

**Alternative Considered:** `deletedAt` timestamp (soft delete via nullable Date)
- Allows区分 active vs deleted vs never-created states
- More complex queries with `WHERE deletedAt IS NULL`
- Better for audit trails but adds unnecessary complexity for this use case

### 2. DTO Pattern with class-validator

**Decision:** Use Data Transfer Objects with `class-validator` decorators for input validation.

**Rationale:**
- TypeScript type safety at runtime
- Declarative validation rules (IsString, IsOptional, MaxLength, etc.)
- NestJS pipes integrate seamlessly for automatic validation
- Generates clear Swagger/OpenAPI documentation

**Implementation:**
- `CreateCategoryDto` for POST requests
- `UpdateCategoryDto` for PATCH requests (all fields optional)
- Shared validation pipe configured at module level

### 3. Service Layer with Transaction Support

**Decision:** All database operations go through `CategoriesService` with explicit transaction support.

**Rationale:**
- Business logic encapsulation
- Easy to mock for unit testing
- Centralized error handling and logging
- Prepared for future transactional operations (e.g., bulk updates)

### 4. Admin Authorization via Custom Guard

**Decision:** Use custom `@AdminGuard()` decorator (from Change-03) on all category endpoints.

**Rationale:**
- Consistent with auth architecture
- Declarative and readable
- Easy to extend if future roles are needed

### 5. Prisma Model with Unique Constraint on Name

**Decision:** Add unique constraint on category name to prevent duplicates.

**Rationale:**
- Database-level enforcement
- Catch duplicate names at creation time
- Clear error message via Prisma exception handling

### 6. Frontend Custom Components

**Decision:** Build custom UI components for category management instead of using Clerk SDK.

**Rationale:**
- Consistent with project rules (no official Clerk SDK components)
- Full control over styling and behavior
- Use design system tokens exclusively

## Risks / Trade-offs

| Risk | Level | Mitigation |
|------|-------|------------|
| Duplicate category name | Low | Unique constraint on name field; Prisma error code P2002 for graceful handling |
| Race conditions on concurrent edits | Low | Prisma transactions; optimistic locking not required for admin use |
| Large number of categories impacts performance | Low | Pagination (default 20 per page) with indexed `active` field |
| Tests require authenticated admin context | Medium | Create test fixtures with admin role; mock Clerk middleware in unit tests |
| Validation error messages expose internals | Low | Sanitize error responses in controller; map class-validator errors to user-friendly messages |

## Migration Plan

1. **Database Migration:**
   - Create `Category` model in Prisma schema
   - Run `npx prisma migrate dev` to generate migration
   - Apply migration to database

2. **Backend Deployment:**
   - Deploy with new `CategoriesModule`
   - No breaking changes to existing APIs

3. **Frontend Deployment:**
   - Deploy admin category pages
   - UI is hidden behind admin auth (no public exposure)

4. **Rollback:**
   - Revert database migration if issues arise
   - Revert module imports in `AppModule`

## Open Questions

1. **Pagination defaults:** Should default page size be 10, 20, or 50? → Decision: 20 (balanced for admin tables)

2. **Category name uniqueness:** Should name be case-insensitive? (e.g., "Electronics" vs "electronics") → Decision: Yes, normalize to lowercase in service layer before validation

3. **API response format:** Use envelope pattern `{ data, meta }` or direct array? → Decision: Direct array with `X-Total-Count` header for list responses (consistent with existing patterns)