# 09 — Order Management & Payments (Admin)

## Summary

Admin-facing order and payment management: list/filter orders, transition order states, register payments manually, and audit all status changes.

## Functional Scope

### Backend

Order management:
- `GET /v1/admin/orders` — list all orders (filters by status, date, customer)
- `GET /v1/admin/orders/:id` — order detail with items and payments
- `PATCH /v1/admin/orders/:id/status` — transition order status
- Order state machine enforcement:

  | From | To |
  |------|----|
  | New | Paid |
  | Paid | Preparation |
  | Preparation | Invoiced |
  | Invoiced | Shipped |
  | Shipped | Delivered |
  | Any (except Delivered) | Cancelled |

- Audit log for every status change (user, action, payload, timestamp)

Payment registration:
- `POST /v1/admin/orders/:id/payments` — register payment (value, method, date, notes)
- `GET /v1/admin/payments` — list payments (with filters)
- Payment statuses: Pending, Confirmed, Refunded
- Order auto-transitions to "Paid" when payment is confirmed

### Frontend

- Admin order list (table with status filter, date range, pagination)
- Order detail page (items, status timeline, payments)
- Status transition buttons (enabled/disabled based on valid transitions)
- Payment registration form (value, method, date, notes)
- Payment history on order detail
- Activity/audit log on order detail

## Dependencies

- Change 08 (Order Creation) — orders must exist

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Invalid state transition | Medium | State machine validation at service + DB level |
| Data integrity (payment ↔ order) | Medium | Use Prisma transactions |
| Audit log missing entries | Low | Use NestJS event system for audit |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- `OrderManagementService` — all valid/invalid state transitions
- `PaymentService` — register, confirm, refund
- `AuditService` — log creation with all required fields
- Edge cases: transition from invalid state, duplicate payment, payment > order total

### Integration Tests

- `PATCH /v1/admin/orders/:id/status` — valid transitions
- `PATCH /v1/admin/orders/:id/status` — invalid transitions (422)
- `POST /v1/admin/orders/:id/payments` — register payment
- Payment confirmation triggers order "Paid" status
- 403 for non-admin users
- Audit entries created on every mutation

### E2E Tests

- Admin lists orders, filters by status
- Admin advances order through full state chain
- Admin registers payment, verifies order auto-transitions to "Paid"
- Admin attempts invalid transition (blocked)

## Out of Scope

- Automatic payment gateway integration (future)
- Refund workflow (future — MVP: manual)
- Invoice generation (future)
- Shipping tracking integration (future)
