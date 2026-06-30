## ADDED Requirements

### Requirement: Admin can list and search customers
The system SHALL provide an admin-only REST endpoint to list customers with pagination and search support.

#### Scenario: List customers successfully
- **WHEN** an admin sends GET `/api/v1/customers`
- **THEN** the system returns HTTP 200 with paginated customer list

#### Scenario: Search customers by name
- **WHEN** an admin sends GET `/api/v1/customers?search=term`
- **THEN** the system returns HTTP 200 with matching customers only

### Requirement: Admin can retrieve active customers only
The system SHALL provide an admin-only endpoint to list active customers.

#### Scenario: List active customers
- **WHEN** an admin sends GET `/api/v1/customers/active`
- **THEN** the system returns HTTP 200 with only active customers

### Requirement: Admin can create a customer
The system SHALL allow admins to register new customers with input validation.

#### Scenario: Create customer successfully
- **WHEN** an admin submits valid customer data
- **THEN** the system returns HTTP 201 with the created customer

#### Scenario: Validation fails with missing required fields
- **WHEN** an admin submits customer data without required fields
- **THEN** the system returns HTTP 400 with RFC 9457 error

#### Scenario: Duplicate email is rejected
- **WHEN** an admin submits a customer with an existing email
- **THEN** the system returns HTTP 409 Conflict

### Requirement: Admin can update a customer
The system SHALL allow admins to edit customer details.

#### Scenario: Update customer successfully
- **WHEN** an admin sends valid update data for an existing customer
- **THEN** the system returns HTTP 200 with updated customer

### Requirement: Admin can soft-delete a customer
The system SHALL support soft-deleting a customer by marking them as inactive, unless they have associated orders.

#### Scenario: Soft delete customer without orders
- **WHEN** an admin deletes a customer with no associations
- **THEN** the system returns HTTP 204 and sets active=false

#### Scenario: Prevent deletion of customer with orders
- **WHEN** an admin deletes a customer who has orders
- **THEN** the system returns HTTP 409 Conflict

### Requirement: Customer endpoints enforce RBAC
The system SHALL restrict all customer CRUD endpoints to admin role.

#### Scenario: Customer role gets 403
- **WHEN** a customer role user accesses any admin customer endpoint
- **THEN** the system returns HTTP 403 Forbidden

#### Scenario: Unauthenticated request gets 401
- **WHEN** an unauthenticated request accesses any customer endpoint
- **THEN** the system returns HTTP 401 Unauthorized
