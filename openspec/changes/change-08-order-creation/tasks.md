## 1. Backend Implementation

- [x] 1.1 Update OrdersService with Prisma transactions, stock validation/decrement, server-side price lookup, and inactive product blocking
- [x] 1.2 Implement unit tests in orders.service.spec.ts to achieve at least 80% coverage
- [x] 1.3 Update OrdersController to secure endpoints and restrict customer view/cancel actions to their own orders
- [x] 1.4 Implement integration tests in orders.controller.spec.ts to cover authorization and checkout edge cases

## 2. Frontend Implementation

- [x] 2.1 Implement persistent cart state (localStorage) and add/remove/update quantity logic
- [x] 2.2 Build Checkout page with shipping address form and item review
- [x] 2.3 Create Order Confirmation page and Order History view with status filters
- [x] 2.4 Create Order Details page with order item list, status, and cancel action

## 3. End-to-End Testing & Validation

- [x] 3.1 Design E2E test plan using .agents/prompts/playwright-test-planner.md
- [x] 3.2 Implement E2E tests via Playwright following .agents/prompts/playwright-test-generator.md
- [x] 3.3 Run linting and full test suite via `npm run lint` and `npm run test` to verify zero errors and >80% coverage
