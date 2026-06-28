## ADDED Requirements

### Requirement: Public products retrieval
The system SHALL provide a public API endpoint to retrieve active products for the storefront without authentication.

#### Scenario: User visits the storefront page
- **WHEN** a GET request is made to `/api/v1/products`
- **THEN** the system returns a paginated list of active products with HTTP 200 OK

### Requirement: Public single product retrieval
The system SHALL provide a public API endpoint to retrieve details of a single active product by ID.

#### Scenario: User views a product details page
- **WHEN** a GET request is made to `/api/v1/products/:id` with a valid active product ID
- **THEN** the system returns the product details with HTTP 200 OK

### Requirement: Public categories retrieval
The system SHALL provide a public API endpoint to retrieve active categories for the storefront navigation.

#### Scenario: Storefront loads the category menu
- **WHEN** a GET request is made to `/api/v1/categories`
- **THEN** the system returns a list of active categories with HTTP 200 OK
