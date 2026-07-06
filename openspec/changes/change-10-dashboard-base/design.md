## Context

The administrative user needs a dashboard to monitor key business performance metrics. This change implements the basic KPIs: Total Sales, Received Amount, and Pending Amount, calculated over the default period (last 30 days).

## Goals / Non-Goals

**Goals:**
- Implement `GET /v1/admin/dashboard` returning `totalSales`, `totalReceived`, and `totalPending` for the last 30 days.
- Sum non-cancelled orders (`status != 'Cancelado'`) for `totalSales`.
- Sum confirmed payments (`status == 'Confirmed'`) for `totalReceived`.
- Sum total amount of orders that are not cancelled and have no confirmed payments for `totalPending`.
- Secure the endpoint with the Admin guard (requiring admin role authentication).
- Build the frontend dashboard page with KPI cards, skeleton loading, and error states.

**Non-Goals:**
- Custom period filtering (deferred to Change 11).
- Charts/graphs.
- PDF/CSV export.

## Decisions

### 1. Data Aggregation Strategy
We will query `Order` and `Payment` models using Prisma.
- `totalSales`: We sum `totalAmount` of all `Order` records where `status != 'Cancelado'` and `createdAt >= 30 days ago`.
- `totalReceived`: We sum `value` of all `Payment` records where `status == 'Confirmed'` and `date >= 30 days ago` (or `createdAt >= 30 days ago`). To align with Change 11 which filters by period, we will filter payments by their transaction `date` within the last 30 days.
- `totalPending`: We sum `totalAmount` of all `Order` records where `status != 'Cancelado'`, `createdAt >= 30 days ago`, and there is no associated payment with `status == 'Confirmed'`.

### 2. NestJS Module Placement
We will create a new `DashboardModule` inside the backend app to keep dashboard metrics separated from ordering logic.
- Service: `DashboardService`
- Controller: `AdminDashboardController` (mapped under `GET /v1/admin/dashboard`)

### 3. Frontend Layout
We will create a new dashboard page in the Next.js app route `/admin/dashboard`. It will fetch data from `/v1/admin/dashboard` and display 3 clean KPI cards using CSS grid and variables from `globals.css`.

## Risks / Trade-offs

- **Risk**: Time zone discrepancies between backend and frontend.
  - **Mitigation**: Standardize on UTC dates when calculating the 30-day cutoff on the backend.
- **Risk**: Performance degradation.
  - **Mitigation**: Ensure indexes exist on `Order.createdAt`, `Order.status`, and `Payment.date` (or `Payment.createdAt`).
