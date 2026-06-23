# Category Entity Specification

## Purpose

Defines the database schema and data model for product categories.

## Requirements

### Requirement: Category data model

The system SHALL store categories with the following attributes:

#### Scenario: Category creation

- **WHEN** an admin creates a category
- **THEN** the system SHALL store a unique `id` (UUID)
- **THEN** the system SHALL store a `name` string (max 100 characters)
- **THEN** the system SHALL store a `slug` string (URL-friendly identifier)
- **THEN** the system SHALL store an `active` boolean flag (default: true)
- **THEN** the system SHALL store a `createdAt` timestamp (auto-generated)
- **THEN** the system SHALL store an `updatedAt` timestamp (auto-updated)

#### Scenario: Category name uniqueness

- **WHEN** the system stores a category name
- **THEN** the name SHALL be unique across all categories (case-insensitive)
- **THEN** the system SHALL normalize name to lowercase before storage

#### Scenario: Category slug generation

- **WHEN** an admin creates a category with name "Electronics & Gadgets"
- **THEN** the system SHALL generate slug "electronics-gadgets"
- **THEN** the slug SHALL be unique and URL-safe

### Requirement: Soft delete behavior

The system SHALL implement soft delete by toggling the `active` flag.

#### Scenario: Soft delete a category

- **WHEN** an admin deletes a category via `DELETE /v1/admin/categories/:id`
- **THEN** the system SHALL set `active` to `false`
- **THEN** the system SHALL NOT remove the database record
- **THEN** the system SHALL update the `updatedAt` timestamp

#### Scenario: Soft deleted categories are hidden by default

- **WHEN** a list query is executed without explicit `includeInactive` parameter
- **THEN** the system SHALL return only categories where `active` equals `true`

### Requirement: Category indexing

The system SHALL optimize query performance with appropriate indexes.

#### Scenario: Index usage for active filter

- **WHEN** a list query filters by `active` status
- **THEN** the system SHALL use an index on the `active` column
- **THEN** query response time SHALL remain under 100ms for up to 10,000 categories

#### Scenario: Index usage for name uniqueness

- **WHEN** creating or updating a category name
- **THEN** the system SHALL use a unique index on the lowercase `name` column
- **THEN** duplicate name attempts SHALL fail with a database constraint error