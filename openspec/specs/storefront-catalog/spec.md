# storefront-catalog Specification

## Purpose
TBD - created by archiving change clean-products-module. Update Purpose after archive.
## Requirements
### Requirement: Public products retrieval
The system SHALL provide a public API endpoint to retrieve active products for the storefront without authentication, supporting search, pagination, and category filtering.

#### Scenario: User visits the storefront page and views products
- **WHEN** a GET request is made to `/api/v1/products` with optional search, page, limit, and categoryId query parameters
- **THEN** the system returns a paginated list of active products matching the criteria with HTTP 200 OK

### Requirement: Public single product retrieval
The system SHALL provide a public API endpoint to retrieve details of a single active product by ID, regardless of stock level.

#### Scenario: User views an active product page with stock available
- **WHEN** a GET request is made to `/api/v1/products/:id` with a valid active product ID that is in stock
- **THEN** the system returns the product details with HTTP 200 OK and stock level greater than 0

#### Scenario: User views an active product page that is out of stock
- **WHEN** a GET request is made to `/api/v1/products/:id` with a valid active product ID that has 0 stock
- **THEN** the system returns the product details with HTTP 200 OK and stock level equal to 0

#### Scenario: User attempts to view an inactive product page
- **WHEN** a GET request is made to `/api/v1/products/:id` with an inactive product ID
- **THEN** the system returns HTTP 404 Not Found

### Requirement: Public categories retrieval
The system SHALL provide a public API endpoint to retrieve active categories for the storefront navigation.

#### Scenario: Storefront loads the category menu
- **WHEN** a GET request is made to `/api/v1/categories`
- **THEN** the system returns a list of active categories with HTTP 200 OK

