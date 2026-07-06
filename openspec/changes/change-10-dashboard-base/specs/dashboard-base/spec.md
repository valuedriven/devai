## ADDED Requirements

### Requirement: Admin Dashboard Backend API
The system SHALL provide a backend endpoint `GET /v1/admin/dashboard` returning metrics for the default 30-day period:
- `totalSales`: sum of totalAmount of all non-cancelled orders.
- `totalReceived`: sum of value of all confirmed payments.
- `totalPending`: sum of totalAmount of all non-cancelled orders that have no confirmed payments.

#### Scenario: Metrics are aggregated correctly for orders and payments in the last 30 days
- **WHEN** a GET request is made to `/v1/admin/dashboard` by an authenticated admin
- **THEN** the system returns a 200 response with `totalSales`, `totalReceived`, and `totalPending` calculated based on orders and payments created within the last 30 days.

### Requirement: Authorization and Authentication Guard
The admin dashboard endpoint `/v1/admin/dashboard` SHALL be restricted to authenticated users with the `Admin` role.

#### Scenario: Unauthenticated request to dashboard metrics
- **WHEN** a GET request is made to `/v1/admin/dashboard` without a valid authentication token
- **THEN** the system returns a 401 Unauthorized status code.

#### Scenario: Unauthorized request to dashboard metrics
- **WHEN** a GET request is made to `/v1/admin/dashboard` by a user with the `Customer` role
- **THEN** the system returns a 403 Forbidden status code.

### Requirement: Frontend KPI Cards display
The admin frontend dashboard page SHALL display three cards: "Total Sales" (vendas totais), "Received" (valores recebidos), and "Pending" (valores pendentes).

#### Scenario: Admin views dashboard metrics
- **WHEN** an admin navigates to `/admin/dashboard` and metrics load successfully
- **THEN** the page displays the KPI cards with values formatted in Brazilian Real (R$).

### Requirement: Frontend Loading Skeleton State
The admin frontend dashboard page SHALL display a loading skeleton state while fetching metrics from the backend.

#### Scenario: Metric data is loading
- **WHEN** the dashboard page is requested and API call is pending
- **THEN** a skeleton animation is rendered instead of empty metrics or cards.

### Requirement: Frontend Error Handling
The admin frontend dashboard page SHALL display an error message if the backend metrics endpoint fails or is unreachable.

#### Scenario: Metric API call fails
- **WHEN** the API call to `/v1/admin/dashboard` returns an error status code
- **THEN** the page displays a user-friendly error message with a retry option.
