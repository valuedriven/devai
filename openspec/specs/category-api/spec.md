# Category API Specification

## Purpose

Defines the REST API endpoints for category management. All endpoints require admin authentication.

## Requirements

### Requirement: List categories

The system SHALL provide an endpoint to list all categories with pagination and search.

#### Scenario: List active categories

- **WHEN** admin requests `GET /v1/admin/categories`
- **THEN** the system SHALL return an array of category objects
- **THEN** the response SHALL include a `X-Total-Count` header with total count
- **THEN** by default, only active categories SHALL be returned
- **THEN** pagination SHALL default to page 1 with 20 items per page

#### Scenario: Pagination parameters

- **WHEN** admin requests `GET /v1/admin/categories?page=2&limit=10`
- **THEN** the system SHALL return items 11-20
- **THEN** the response SHALL include pagination metadata

#### Scenario: Search by name

- **WHEN** admin requests `GET /v1/admin/categories?search=electronics`
- **THEN** the system SHALL return categories where name contains "electronics" (case-insensitive)

#### Scenario: Include inactive categories

- **WHEN** admin requests `GET /v1/admin/categories?includeInactive=true`
- **THEN** the system SHALL return both active and inactive categories

#### Scenario: Non-admin cannot list categories

- **WHEN** non-admin user requests `GET /v1/admin/categories`
- **THEN** the system SHALL return 403 Forbidden

### Requirement: Get single category

The system SHALL provide an endpoint to retrieve a single category by ID.

#### Scenario: Get existing category

- **WHEN** admin requests `GET /v1/admin/categories/:id`
- **THEN** the system SHALL return the category object with all attributes
- **THEN** the response SHALL include `createdAt` and `updatedAt` timestamps

#### Scenario: Get non-existent category

- **WHEN** admin requests `GET /v1/admin/categories/:id` with invalid ID
- **THEN** the system SHALL return 404 Not Found
- **THEN** the response SHALL include error message "Category not found"

### Requirement: Create category

The system SHALL provide an endpoint to create a new category.

#### Scenario: Create with valid data

- **WHEN** admin sends `POST /v1/admin/categories` with valid `{ "name": "Electronics" }`
- **THEN** the system SHALL create the category with auto-generated slug
- **THEN** the system SHALL return 201 Created with the created category object
- **THEN** the category SHALL have `active: true` by default

#### Scenario: Create with duplicate name

- **WHEN** admin sends `POST /v1/admin/categories` with a name that already exists
- **THEN** the system SHALL return 409 Conflict
- **THEN** the response SHALL include error message "Category with this name already exists"

#### Scenario: Create with empty name

- **WHEN** admin sends `POST /v1/admin/categories` with empty or missing `name`
- **THEN** the system SHALL return 400 Bad Request
- **THEN** the response SHALL include validation error details

#### Scenario: Create with name exceeding max length

- **WHEN** admin sends `POST /v1/admin/categories` with name longer than 100 characters
- **THEN** the system SHALL return 400 Bad Request
- **THEN** the response SHALL include "name must not exceed 100 characters"

### Requirement: Update category

The system SHALL provide an endpoint to update an existing category.

#### Scenario: Update name

- **WHEN** admin sends `PATCH /v1/admin/categories/:id` with `{ "name": "New Name" }`
- **THEN** the system SHALL update the category name
- **THEN** the system SHALL regenerate the slug
- **THEN** the system SHALL update the `updatedAt` timestamp
- **THEN** the system SHALL return the updated category object

#### Scenario: Toggle active status

- **WHEN** admin sends `PATCH /v1/admin/categories/:id` with `{ "active": false }`
- **THEN** the system SHALL update the `active` flag to false
- **THEN** the system SHALL return the updated category object

#### Scenario: Update non-existent category

- **WHEN** admin sends `PATCH /v1/admin/categories/:id` with invalid ID
- **THEN** the system SHALL return 404 Not Found

#### Scenario: Update with duplicate name

- **WHEN** admin sends `PATCH /v1/admin/categories/:id` with a name that belongs to another category
- **THEN** the system SHALL return 409 Conflict

### Requirement: Delete category

The system SHALL provide an endpoint to soft delete a category.

#### Scenario: Soft delete category

- **WHEN** admin requests `DELETE /v1/admin/categories/:id`
- **THEN** the system SHALL set `active` to `false`
- **THEN** the system SHALL return 204 No Content

#### Scenario: Delete already inactive category

- **WHEN** admin requests `DELETE /v1/admin/categories/:id` for an already inactive category
- **THEN** the system SHALL return 204 No Content (idempotent)

#### Scenario: Delete non-existent category

- **WHEN** admin requests `DELETE /v1/admin/categories/:id` with invalid ID
- **THEN** the system SHALL return 404 Not Found

### Requirement: API documentation

The system SHALL provide OpenAPI/Swagger documentation for all endpoints.

#### Scenario: Swagger UI availability

- **WHEN** accessing `/docs` or `/api/docs`
- **THEN** the Swagger UI SHALL display all category endpoints
- **THEN** each endpoint SHALL show request/response schemas
- **THEN** authentication requirements SHALL be documented