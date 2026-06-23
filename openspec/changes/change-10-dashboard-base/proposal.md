# 10 — Dashboard Base

## Summary

Admin dashboard with key performance indicators: total sales, received amount, and pending amount. Basic display without period filter.

## Functional Scope

### Backend

- `GET /v1/admin/dashboard` — returns dashboard metrics for default period (last 30 days):
  - `totalSales`: sum of non-cancelled orders
  - `totalReceived`: sum of confirmed payments
  - `totalPending`: sum of orders without payment
- Data source: Orders and Payments tables
- Admin-only guard

### Frontend

- Dashboard page with KPI cards:
  - Total Sales (R$)
  - Received (R$)
  - Pending (R$)
- Clean visual layout with cards/indicators
- Loading skeleton state
- Error state

## Dependencies

- Change 08 (Order Creation) — orders must exist
- Change 09 (Order Management) — payments must exist

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Query performance on large dataset | Low | Pagination not needed for KPIs; indexed columns |
| Incorrect aggregation logic | Medium | Test with known data sets |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- `DashboardService` — aggregation queries, edge cases: empty data, all cancelled, mixed statuses

### Integration Tests

- `GET /v1/admin/dashboard` — returns correct KPIs for seeded data
- 403 for non-admin / unauthenticated

### E2E Tests

- Admin views dashboard with correct KPI values
- KPIs update after new order is created and paid

## Out of Scope

- Period filter (covered in Change 11)
- Charts/graphs (future enhancement)
- Export to CSV/PDF (future)
- Real-time updates (future)
