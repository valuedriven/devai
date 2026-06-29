## ADDED Requirements

### Requirement: Customer can manage shopping cart items
The system SHALL allow customers to add products to a shopping cart, update item quantities, and remove items from the cart.

#### Scenario: Add product to cart
- **WHEN** the customer selects an active product with available stock and clicks add to cart
- **THEN** the product is added to the cart and the total cart quantity and price are updated

#### Scenario: Prevent adding out of stock product to cart
- **WHEN** the customer attempts to add a product that has 0 stock to the cart
- **THEN** the system prevents the action and shows an error message

### Requirement: Secure and validated checkout flow
The system SHALL require the customer to be authenticated to perform checkout, and MUST validate product status, stock availability, and recalculate prices on the backend before completing the transaction.

#### Scenario: Successful order placement
- **WHEN** an authenticated customer submits checkout with valid items, sufficient stock, and shipping address
- **THEN** the order is created with status "Novo", a unique order number, product stock is decremented, and the cart is cleared

#### Scenario: Checkout fails due to insufficient stock
- **WHEN** a customer attempts to submit checkout for an item whose quantity exceeds available stock
- **THEN** the system rejects order creation, returns a 422 status code, and leaves the product stock unchanged

#### Scenario: Checkout fails due to inactive product
- **WHEN** a customer attempts to submit checkout containing a product that has been deactivated
- **THEN** the system rejects order creation and returns an error

### Requirement: Customer order history and details
The system SHALL allow authenticated customers to view their own list of orders and retrieve detailed information about a specific order, while blocking them from viewing other customers' orders.

#### Scenario: Customer views own orders
- **WHEN** an authenticated customer requests their order history
- **THEN** the system returns only the orders associated with the customer's authenticated account, sorted by creation date

#### Scenario: Block viewing other customer's order details
- **WHEN** an authenticated customer attempts to access the detail page of an order belonging to another customer
- **THEN** the system returns a 404 NotFound error

### Requirement: Order cancellation
The system SHALL allow a customer to cancel their own order only if the order status is "Novo".

#### Scenario: Customer cancels unpaid order
- **WHEN** a customer requests cancellation of their own order which is in "Novo" status
- **THEN** the status of the order transitions to "Cancelado"

#### Scenario: Customer cannot cancel paid or delivered order
- **WHEN** a customer requests cancellation of their own order which is in "Pago", "Faturado", "Despachado", or "Entregue" status
- **THEN** the system rejects the request and returns an error
