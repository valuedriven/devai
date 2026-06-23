# 11 — Dashboard Filter (Period)

## Summary

Add period filter to the admin dashboard, allowing the admin to select a custom date range and have all KPIs recalculated accordingly.

## Functional Scope

### Backend

- `GET /v1/admin/dashboard?startDate=...&endDate=...` — accepts optional `startDate` and `endDate` query parameters
- When provided, KPIs are calculated for the specified period
- When absent, defaults to last 30 days (existing behavior)
- Server-side validation: startDate must be before endDate

### Frontend

- Date range picker component (start date + end date)
- "Apply" button triggers KPI refresh
- Preset buttons: "Last 7 days", "Last 30 days", "This month", "This year"
- Loading state while fetching
- URL query param sync (shareable filtered view)

## Dependencies

- Change 10 (Dashboard Base)

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Client/server date mismatch | Low | Use UTC throughout |
| Large date range performance | Low | Ensure indexes on order.createdAt and payment.date |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- `DashboardService` — filter by date range, edge cases: future dates, zero-length range, very old dates

### Integration Tests

- `GET /v1/admin/dashboard?startDate=...&endDate=...` — returns filtered KPIs
- Invalid date parameters return 422
- Missing parameters default to 30 days

### E2E Tests

- Admin selects date range, applies filter, sees updated KPIs
- Admin uses preset buttons
- KPIs return to default when filter is cleared

## Out of Scope

- Charts/graphs over time (future)
- Comparison with previous period (future)
- Saved filters (future)
