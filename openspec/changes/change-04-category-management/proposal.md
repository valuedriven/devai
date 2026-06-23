# 04 — Category Management

## Summary

Full CRUD for product categories. Admin-only endpoints on the backend and admin management pages on the frontend.

## Functional Scope

### Backend

- `GET /v1/admin/categories` — list all categories (with pagination, search)
- `GET /v1/admin/categories/:id` — get single category
- `POST /v1/admin/categories` — create category
- `PATCH /v1/admin/categories/:id` — update category
- `DELETE /v1/admin/categories/:id` — soft delete (set active=false)
- Input validation via DTOs + `class-validator`
- Swagger/OpenAPI decorators
- Admin-only authorization guard

### Frontend

- Category list page (table with search, pagination)
- Category create/edit form (name, active toggle)
- Delete confirmation dialog
- Success/error toast notifications

## Dependencies

- Change 03 (Auth & Security)

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Simple CRUD — low risk | Low | Standard NestJS patterns |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- `CategoryService` — create, update, soft delete, list with filters
- Edge cases: duplicate name, inactive categories

### Integration Tests

- CRUD endpoints — happy path (admin authenticated)
- CRUD endpoints — 403 for non-admin users
- Validation errors (empty name, missing fields)

### E2E Tests

- Admin creates, edits, and deletes a category
- Non-admin cannot access category management

## Out of Scope

- Category reordering (future)
- Bulk operations (future)
- Category image (future)
