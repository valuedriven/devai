# E2E Test Plan - Order Creation (Customer)

Test plan to verify the customer-facing order creation, cart persistence, checkout, and cancellation flows.

## Scenarios

### Scenario 1: Complete Checkout Flow (Happy Path)
1. **Starting State**: Blank state, unauthenticated, cart is empty.
2. **Steps**:
   - Seed an active product with stock = 5.
   - User goes to home page, adds product to cart.
   - User goes to cart page, verifies item is present.
   - User clicks checkout, redirects to login, logs in.
   - User redirects to checkout page.
   - User inputs shipping address "Rua Teste, 123" and reviews the items.
   - User submits checkout.
   - User verifies redirection to success page displaying "Pedido Confirmado!".
   - User verifies that the cart is cleared.
3. **Success Criteria**: Order is created, status is "Novo", cart is empty, stock is decremented to 4.

### Scenario 2: View Order History and Details
1. **Starting State**: Customer has at least one order created in "Novo" status.
2. **Steps**:
   - Customer navigates to `/orders`.
   - Customer filters orders by status (e.g. clicks "Novo" filter, verifies order is shown; clicks "Cancelado" filter, verifies order is not shown).
   - Customer clicks "Ver Detalhes" for their order.
   - Customer verifies that they can see order items, total, and shipping address on details page.
3. **Success Criteria**: Correct orders are listed, filtered, and detail view displays all fields.

### Scenario 3: Order Cancellation
1. **Starting State**: Order exists in "Novo" status.
2. **Steps**:
   - Customer navigates to the order details page.
   - Customer clicks "Cancelar Pedido".
   - Customer confirms the cancellation prompt.
   - Customer verifies the status badge changes to "Cancelado".
   - Customer verifies that the "Cancelar Pedido" button is no longer visible.
3. **Success Criteria**: Order status transitions to "Cancelado" in DB, product stock is restored.

### Scenario 4: Out of Stock Validation
1. **Starting State**: Product exists with stock = 0.
2. **Steps**:
   - Customer tries to add the out-of-stock product to cart or checkout.
   - Verify that UI prevents adding/buying out-of-stock products, or returns appropriate error message.
3. **Success Criteria**: Prevent purchasing products with insufficient stock.
