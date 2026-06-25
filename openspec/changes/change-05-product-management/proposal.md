# 05 — Product Management

## Summary

Full CRUD for products. Admin-only endpoints. Products reference categories and include image handling.

## Functional Scope

### Backend

- `GET /v1/admin/products` — list (pagination, search, category filter)
- `GET /v1/admin/products/:id` — get single product
- `POST /v1/admin/products` — create product
- `PATCH /v1/admin/products/:id` — update product
- `DELETE /v1/admin/products/:id` — soft delete (set active=false)
- Image upload endpoint (store as base64 or S3-compatible URL stub)
- Validate category exists and is active
- Validate stock >= 0
- Input validation via DTOs + `class-validator`
- Swagger/OpenAPI decorators
- Admin-only guard

### Frontend

- Product list page (table with search, category filter, pagination)
- Product create/edit form (name, description, price, stock, category dropdown, active toggle, image upload)
- Image preview on upload
- Delete confirmation dialog

## Dependencies

- Change 04 (Category Management)

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Image storage strategy | Low | Use base64 for MVP (S3 in future) |
| Category reference integrity | Low | Validate category exists before save |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- **Coverage**: Minimum 80% coverage (statements, branches, functions, lines).

- `ProductService` — CRUD, stock validation, category validation
- Edge cases: negative stock, inactive category reference, duplicate name

### Integration Tests

- **Coverage**: Minimum 80% coverage (statements, branches, functions, lines).

- CRUD endpoints — happy path (admin)
- 403 for non-admin
- Validation: price <= 0, stock < 0, missing category
- Image upload endpoint

### E2E Tests

- **Planning**: Use `.agents/prompts/playwright-test-planner.md`
- **Generation**: Use `.agents/prompts/playwright-test-generator.md`

- Admin creates product with image, edits price, deactivates
- Product appears/disappears correctly based on active flag

## Out of Scope

- Advanced image manipulation (resize, crop)
- Bulk product import (CSV — future)
- Product variants (future)
- Inventory history (future)
