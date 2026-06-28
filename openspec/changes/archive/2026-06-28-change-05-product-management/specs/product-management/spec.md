## ADDED Requirements

### Requirement: Admin Product List
The system SHALL provide an admin endpoint and UI to list products with pagination, search by name, and filter by category.

#### Scenario: Admin views products
- **WHEN** an admin navigates to the products page
- **THEN** they see a paginated list of products

#### Scenario: Admin searches products
- **WHEN** an admin enters a term in the search box
- **THEN** the list is filtered to products whose names match the term

#### Scenario: Admin filters products by category
- **WHEN** an admin selects a category from the filter dropdown
- **THEN** the list is filtered to products belonging to that category

### Requirement: Admin Create Product
The system SHALL allow admins to create a new product, validating input such as price (>= 0), stock (>= 0), and ensuring the selected category is active.

#### Scenario: Successful creation
- **WHEN** an admin submits valid product details and an active category
- **THEN** the product is created and appears in the list

#### Scenario: Validation fails for negative stock
- **WHEN** an admin submits a product with negative stock
- **THEN** the system rejects the request with a validation error

#### Scenario: Category is invalid or inactive
- **WHEN** an admin submits a product with a category ID that does not exist or is inactive
- **THEN** the system rejects the request with an error

### Requirement: Admin Edit Product
The system SHALL allow admins to update existing product details, using the same validation rules as product creation.

#### Scenario: Successful update
- **WHEN** an admin updates the price or stock of a product
- **THEN** the product details are updated successfully

### Requirement: Admin Soft Delete Product
The system SHALL allow admins to soft delete a product by setting its `active` flag to false, instead of hard-deleting the record from the database.

#### Scenario: Admin soft deletes product
- **WHEN** an admin confirms the deletion of a product through the UI
- **THEN** the product is marked as inactive

### Requirement: Admin Image Upload
The system SHALL provide an endpoint for admins to upload product images, saving the file and returning a URL stub.

#### Scenario: Successful image upload
- **WHEN** an admin uploads a valid image file during product creation or editing
- **THEN** the system saves the file and returns a URL stub for the `imageUrl` field

### Requirement: Admin Authorization
The system SHALL restrict all product management endpoints to authenticated administrators only.

#### Scenario: Unauthorized access attempt
- **WHEN** a non-admin user attempts to access a product management endpoint
- **THEN** the system responds with a 403 Forbidden error
