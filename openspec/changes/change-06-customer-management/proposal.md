# 06 — Customer Management

## Summary

Full CRUD for customers. Admin-only endpoints. Customers represent the people who place orders.

## Functional Scope

### Backend

- `GET /v1/admin/customers` — list (pagination, search by name/email/phone)
- `GET /v1/admin/customers/:id` — get single customer
- `POST /v1/admin/customers` — create customer
- `PATCH /v1/admin/customers/:id` — update customer
- `DELETE /v1/admin/customers/:id` — soft delete (set active=false)
- Prevent deletion if customer has orders
- Input validation via DTOs + `class-validator`
- Swagger/OpenAPI decorators
- Admin-only guard

### Frontend

- Customer list page (table with search, pagination)
- Customer create/edit form (name, email, phone, address)
- Delete confirmation with order-check warning
- Success/error toast notifications

## Dependencies

- Change 03 (Auth & Security)

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Customer with orders cannot be deleted | Low | Validate at service level |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- `CustomerService` — create, update, soft delete, list with search
- Edge cases: duplicate email, delete with orders (blocked), delete without orders (allowed)

### Integration Tests

- CRUD endpoints — happy path (admin)
- 403 for non-admin
- Validation: invalid email, missing required fields
- Delete endpoint: customer with orders returns 409

### E2E Tests

- Admin creates, edits, and deactivates a customer
- Attempt to delete customer with orders (blocked)

## Out of Scope

- Customer self-registration (handled via auth/signup in Change 03)
- Customer order history view (covered in Change 08)
- Address validation (future)
