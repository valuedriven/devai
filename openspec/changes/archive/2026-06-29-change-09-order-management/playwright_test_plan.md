# Playwright Test Plan: Order Management Lifecycle

This document defines the end-to-end (E2E) testing plan for the Order Management feature based on [order-management/spec.md](file:///home/junilson/projetos/devai/openspec/changes/change-09-order-management/specs/order-management/spec.md).

---

## 1. Test Setup and Assumptions

- **Starting State:** Clean environment (isolated database state or dynamic test data generated per test to avoid side effects).
- **Authentication:** 
  - Standard Admin user (authorized to view all orders, trigger transitions, register payments, and view audit logs).
  - Standard Customer user (to place orders, view own orders, and verify cancellation constraints).
- **Test Data Generation:** Uses `@faker-js/faker` to create unique customers, products, and order entities programmatically via backend API endpoints.

---

## 2. Test Scenarios

### Scenario 1: Happy Path - Complete Order Lifecycle
*Validate that an Admin can transition an order sequentially through the entire valid lifecycle.*

- **Assumptions:** 
  - A product with sufficient stock exists.
  - An order has been created with the initial status `Novo`.
- **Steps:**
  1. Login as **Admin**.
  2. Navigate to the Admin Order Details page (`/admin/orders/{id}`) for the newly created order.
  3. Verify the order status is currently **Novo**.
  4. Click "Registrar Pagamento" (Register Payment) to open the modal.
  5. Fill the payment value and select method (e.g., "Pix") and submit.
  6. **Assert:** The status automatically transitions to **Pago**.
  7. Transition the status to **Preparação** by clicking "Iniciar Preparação".
  8. **Assert:** The status updates to **Preparação**.
  9. Transition the status to **Faturado** by clicking "Emitir Nota Fiscal".
  10. **Assert:** The status updates to **Faturado**.
  11. Transition the status to **Despachado** by clicking "Despachar Pedido".
  12. **Assert:** The status updates to **Despachado**.
  13. Transition the status to **Entregue** by clicking "Confirmar Entrega".
  14. **Assert:** The status updates to **Entregue**.

---

### Scenario 2: Error Path - Reject Invalid Transition (Novo to Despachado)
*Ensure that invalid state transitions are rejected with a 422 Unprocessable Entity error.*

- **Assumptions:** 
  - An order with initial status `Novo` has been seeded.
- **Steps:**
  1. Make an API request as **Admin** attempting to patch the order status directly from `Novo` to `Despachado`.
  2. **Assert:** The server responds with `422 Unprocessable Entity`.
  3. Verify via the UI (Admin Order Details) that the order status remains `Novo`.

---

### Scenario 3: Happy Path - Order Cancellation
*Verify that an order in any state except 'Entregue' can be transitioned to 'Cancelado'.*

- **Assumptions:**
  - Multiple orders seeded: Order A (`Novo`), Order B (`Pago`), and Order C (`Entregue`).
- **Steps:**
  1. Navigate to Order A (`Novo`). Click "Cancelar Pedido".
     - **Assert:** The status changes to **Cancelado**.
  2. Navigate to Order B (`Pago`). Click "Cancelar Pedido".
     - **Assert:** The status changes to **Cancelado**.
  3. Navigate to Order C (`Entregue`). Check available action buttons.
     - **Assert:** The "Cancelar Pedido" option/button is disabled or not present.
     - Attempting to force status change to `Cancelado` via API for Order C results in a `422 Unprocessable Entity` or `400 Bad Request`.

---

### Scenario 4: Payment Registration Triggers Status Update
*Verify that registering a confirmed payment automatically moves the order to 'Pago'.*

- **Assumptions:**
  - An order is currently in the `Novo` state.
- **Steps:**
  1. Open the payment registration modal for the order.
  2. Complete payment registration with status "Confirmed".
  3. **Assert:** The linked order's status automatically updates to **Pago**.
  4. **Assert:** The payment record details (value, method) are visible under the payments table.

---

### Scenario 5: Audit Log Recording
*Verify that every successful status change records a corresponding audit event.*

- **Assumptions:**
  - An order undergoes multiple status transitions (e.g., `Novo` -> `Pago` -> `Preparação`).
- **Steps:**
  1. Trigger status transition `Novo` -> `Pago` via payment registration.
  2. Trigger status transition `Pago` -> `Preparação` via status transition button.
  3. Navigate to the Audit Log section of the Order Details page.
  4. **Assert:** An entry exists for transition `Novo` to `Pago` with correct user name, timestamp, and previous/new status.
  5. **Assert:** An entry exists for transition `Pago` to `Preparação` with correct details.

---

## 3. Automation Checklist

- [ ] Import `test` and `expect` from [baseTest.ts](file:///home/junilson/projetos/devai/apps/frontend/tests/fixtures/baseTest.ts)
- [ ] Use `storageState` for admin and customer sessions
- [ ] Seed prerequisite orders and products using the direct API helpers
- [ ] Implement locator actions inside [OrderPage.ts](file:///home/junilson/projetos/devai/apps/frontend/tests/pages/OrderPage.ts)
- [ ] Assert status elements and audit logs in tests via web-first assertions
