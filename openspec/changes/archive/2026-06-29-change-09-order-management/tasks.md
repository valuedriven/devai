## 1. Database Schema

- [x] 1.1 Update Prisma schema with `Payment` and `AuditLog` models
- [x] 1.2 Create and run migration `add_order_management_tables`

## 2. Backend Implementation

- [x] 2.1 Implement `AuditService` with Event Listeners
- [x] 2.2 Implement `OrderManagementService` with state machine logic
- [x] 2.3 Implement `PaymentService` for manual registration
- [x] 2.4 Add Admin controllers for Order and Payment management
- [x] 2.5 Add unit tests for `OrderManagementService` state transitions
- [x] 2.6 Add integration tests for Order Admin endpoints

## 3. Frontend Implementation

- [x] 3.1 Create Admin Order List page with filters (Status, Date)
- [x] 3.2 Create Order Detail page with status timeline and payment history
- [x] 3.3 Implement Status Transition buttons with logic validation
- [x] 3.4 Create Payment Registration modal/form
- [x] 3.5 Add E2E tests for order lifecycle (New → Paid → Delivered)

## 4. Verification

- [x] 4.1 Create or update tests to ensure full coverage of new logic
- [x] 4.2 Run `npm run lint`
- [x] 4.3 Run `npm run test:unit` and `npm run test:integration`
- [x] 4.4 Verify 80% test coverage for new modules
