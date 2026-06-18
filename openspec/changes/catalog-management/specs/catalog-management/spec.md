## ADDED Requirements

### Requirement: Product visibility on storefront
The backend system SHALL filter out inactive products or products belonging to inactive categories when listing products for the public storefront.

#### Scenario: Listing public products
- **WHEN** a client requests all products from `/products` without admin privileges
- **THEN** the system SHALL return only products where `active = true` and `category.active = true`

### Requirement: Stock and price validation
The backend system MUST validate that a product's price is a positive number and stock is a non-negative integer upon creation and update.

#### Scenario: Creating a product with invalid stock
- **WHEN** an admin posts to `/products` with stock less than 0
- **THEN** the system SHALL throw a validation error

#### Scenario: Creating a product with invalid price
- **WHEN** an admin posts to `/products` with price less than or equal to 0
- **THEN** the system SHALL throw a validation error
