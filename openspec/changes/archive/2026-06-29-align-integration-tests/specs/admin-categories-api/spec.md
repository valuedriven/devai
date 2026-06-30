## ADDED Requirements

### Requirement: Admin can create a category
The system SHALL allow admins to create product categories with unique name and slug generation.

#### Scenario: Create category successfully
- **WHEN** an admin submits a valid category name
- **THEN** the system returns HTTP 201 with the created category including generated slug

#### Scenario: Duplicate category name is rejected
- **WHEN** an admin submits a category name that already exists (case-insensitive)
- **THEN** the system returns HTTP 409 Conflict

### Requirement: Admin can list categories
The system SHALL provide an admin endpoint to list categories with pagination and search.

#### Scenario: List categories successfully
- **WHEN** an admin sends GET `/api/v1/admin/categories`
- **THEN** the system returns HTTP 200 with paginated category list

#### Scenario: Include inactive categories
- **WHEN** an admin sends GET `/api/v1/admin/categories?includeInactive=true`
- **THEN** the system returns inactive categories in the results

### Requirement: Admin can retrieve a single category
The system SHALL allow admins to view a category by ID.

#### Scenario: Get existing category
- **WHEN** an admin sends GET `/api/v1/admin/categories/:id` with a valid ID
- **THEN** the system returns HTTP 200 with the category

#### Scenario: Get non-existent category
- **WHEN** an admin sends GET `/api/v1/admin/categories/:id` with an invalid ID
- **THEN** the system returns HTTP 404

### Requirement: Admin can update a category
The system SHALL allow admins to edit a category's name or active status.

#### Scenario: Update category name
- **WHEN** an admin updates a category's name
- **THEN** the system returns HTTP 200 with the category (slug regenerated)

### Requirement: Admin can soft-delete a category
The system SHALL allow admins to soft-delete a category by setting active=false.

#### Scenario: Soft delete a category
- **WHEN** an admin deletes a category
- **THEN** the system returns HTTP 204 and sets active=false

#### Scenario: Deleted category excluded from public list
- **WHEN** the public requests categories after a category has been soft-deleted
- **THEN** the deleted category is not returned

### Requirement: Category admin endpoints enforce RBAC
The system SHALL restrict all admin category endpoints to admin role.

#### Scenario: Non-admin gets 403
- **WHEN** a non-admin user accesses any admin category endpoint
- **THEN** the system returns HTTP 403

#### Scenario: Unauthenticated gets 401
- **WHEN** an unauthenticated request accesses any admin category endpoint
- **THEN** the system returns HTTP 401
