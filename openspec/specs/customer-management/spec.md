# Customer Management Specification

## Purpose
The purpose of this specification is to define the requirements and scenarios for managing customers, including searching, retrieving, creating, updating, deleting (with soft-delete and dependency protection), and authorizing access.

## Requirements

### Requirement: Admin can list and search customers
The system SHALL provide a list of all customers to authenticated administrators with support for pagination and filtering.

#### Scenario: List customers successfully
- **WHEN** an administrator requests the customer list
- **THEN** the system returns a paginated list of customers sorted by creation date

#### Scenario: Filter customers by name, email, or phone
- **WHEN** an administrator searches for a customer by name, email, or phone number
- **THEN** the system returns only matching customers

### Requirement: Admin can retrieve a single customer
The system SHALL allow authenticated administrators to view details of a specific customer by ID.

#### Scenario: Get customer details successfully
- **WHEN** an administrator requests the details of an existing customer by ID
- **THEN** the system returns the customer details

### Requirement: Admin can create a customer
The system SHALL allow authenticated administrators to register new customers with input validation.

#### Scenario: Create customer successfully
- **WHEN** an administrator submits a valid customer registration form
- **THEN** the system saves the customer and returns the created customer profile

#### Scenario: Block duplicate emails on creation
- **WHEN** an administrator submits customer details with an email already in use
- **THEN** the system rejects the request with a conflict error

### Requirement: Admin can update a customer
The system SHALL allow authenticated administrators to edit details of an existing customer.

#### Scenario: Update customer successfully
- **WHEN** an administrator submits updated details for a customer
- **THEN** the system saves the changes and returns the updated customer profile

### Requirement: Admin can delete a customer
The system SHALL support soft deleting a customer (marking them as inactive) while preventing hard deletion if the customer has associated orders.

#### Scenario: Soft delete customer without orders
- **WHEN** an administrator requests to delete a customer who has no associated orders
- **THEN** the system performs a soft delete by setting the customer's active status to false

#### Scenario: Prevent deletion of customer with orders
- **WHEN** an administrator requests to delete a customer who has at least one associated order
- **THEN** the system rejects the request with a conflict error (HTTP 409)

### Requirement: Authenticate and authorize customer management endpoints
The backend system SHALL restrict all customer CRUD operations to authenticated users with the "admin" role, except for customer syncing which can be accessed by the shop application.

#### Scenario: Prevent non-admin access to customer CRUD
- **WHEN** a user without the "admin" role attempts to access customer CRUD endpoints
- **THEN** the system rejects the request with a forbidden error (HTTP 403)
