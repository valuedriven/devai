## 1. Backend Implementation

- [x] 1.1 Update `CustomersService.remove` to check if a customer has associated orders and throw `ConflictException` (HTTP 409) if they do
- [x] 1.2 Update `CustomersService.remove` to perform a soft delete (update active to false) instead of a hard delete
- [x] 1.3 Update `CustomersService.findAll` to support filtering/searching by name, email, or phone
- [x] 1.4 Add unit tests in `customers.service.spec.ts` covering soft-delete, order validation conflict, and list filtering
- [x] 1.5 Add/update integration tests in `customers.controller.spec.ts` covering role-based access control, search filters, and delete conflicts
- [x] 1.6 Run backend tests and verify they pass with at least 80% coverage

## 2. Frontend Implementation

- [x] 2.1 Update `CustomerForm.tsx` to use the `useToast` hook from `toast-context` to display success and error messages
- [x] 2.2 Update customer edit and new pages to verify correct data handling and validation error messages
- [x] 2.3 Verify `deleteCustomerAction` / `deleteCustomer` handles API error codes (e.g. 409 Conflict) and displays an error toast instead of crashing

## 3. End-to-End Testing

- [x] 3.1 Create the Playwright E2E test plan using `.agents/prompts/playwright-test-planner.md`
- [x] 3.2 Generate and write the E2E tests using `.agents/prompts/playwright-test-generator.md`
- [x] 3.3 Run Playwright E2E tests to verify customer management flows (creation, editing, soft delete, delete protection)

## 4. Final Verification

- [x] 4.1 Run linter in both frontend and backend workspaces (`npm run lint`)
- [x] 4.2 Run all tests (`npm run test`) and ensure zero errors and full compliance
