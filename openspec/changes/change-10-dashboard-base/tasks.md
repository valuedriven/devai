## 1. Backend Implementation

- [ ] 1.1 Create `DashboardService` with data aggregation logic for the default 30-day period
- [ ] 1.2 Create `AdminDashboardController` mapped to `GET /v1/admin/dashboard` and protect it with Admin role guard
- [ ] 1.3 Create `DashboardModule` and register it in `app.module.ts`

## 2. Backend Testing

- [ ] 2.1 Add unit tests for `DashboardService` covering all aggregation edge cases (coverage >= 80%)
- [ ] 2.2 Add integration tests for `GET /v1/admin/dashboard` covering success and authorization scenarios

## 3. Frontend Implementation

- [ ] 3.1 Create frontend fetch client service for fetching dashboard metrics
- [ ] 3.2 Create the admin dashboard page component at `/admin/dashboard` displaying Total Sales, Received, and Pending KPI cards
- [ ] 3.3 Add loading skeleton and error state components/layouts to the dashboard page

## 4. E2E Testing

- [ ] 4.1 Plan Playwright E2E test scenarios according to the test planner instructions
- [ ] 4.2 Generate and implement the Playwright E2E tests for dashboard visibility and dynamic updates

## 5. Verification

- [ ] 5.1 Run all unit, integration, and E2E tests and verify lint compliance
