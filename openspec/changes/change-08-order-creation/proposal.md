# 08 — Order Creation (Customer)

## Summary

Customer-facing order flow: shopping cart, order creation with stock validation, price calculation, and order history view. Customer must be authenticated.

## Functional Scope

### Backend

- `POST /v1/orders` — create order (items, customer info, delivery address)
- `GET /v1/orders` — list customer's own orders (with filters by status)
- `GET /v1/orders/:id` — order detail
- `POST /v1/orders/:id/cancel` — cancel unpai order (any status except "Entregue")
- Business rules:
  - Recalculate total on item changes
  - Validate stock at confirmation
  - Block inactive products
  - Minimum 1 item per order
  - Customer must be authenticated
- Order number auto-generation
- Stock decrement on order creation
- Input validation via DTOs

### Frontend

- Shopping cart component (add/remove items, update quantities)
- Checkout flow (review items, confirm delivery address, submit)
- Order confirmation page
- Customer order history (list with status filter, pagination)
- Order detail page (items, status, total)
- Cancel order button (for unpaid orders)

## Dependencies

- Change 05 (Product Management) — products must exist
- Change 06 (Customer Management) — customers must exist
- Change 07 (Public Catalog) — cart interaction via catalog

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Stock race condition | Medium | Use Prisma transactions + stock lock |
| Price inconsistency | Medium | Recalculate on server, never trust client price |
| Cart lost on refresh | Low | Store cart in backend session or local state |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- `OrderService` — order creation, stock validation, price calculation, cancel rules
- Edge cases: empty order (rejected), inactive product (rejected), insufficient stock (rejected), duplicate SKU
- Order state transitions (New → Cancelled)

### Integration Tests

- `POST /v1/orders` — happy path (authenticated customer)
- `POST /v1/orders` — unauthenticated (401)
- Stock validation (insufficient stock returns 422)
- Cancel order (unpaid → cancelled)
- Cancel paid order (blocked)

### E2E Tests

- Customer browses catalog → adds to cart → creates order → sees confirmation
- Customer views order history
- Customer cancels unpaid order
- Attempt to order out-of-stock product

## Out of Scope

- Payment integration (covered in Change 09)
- Guest checkout (all customers must be registered)
- Shipping cost calculation (future)
- Coupon/discount (future)
