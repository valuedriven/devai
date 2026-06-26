# Category UI Specification

## Purpose

Defines the frontend admin interface for category management.

## Requirements

### Requirement: Category list page

The system SHALL provide an admin page displaying all categories in a table format.

#### Scenario: Display category table

- **WHEN** admin navigates to `/admin/categories`
- **THEN** the system SHALL display a table with columns: Name, Slug, Status, Created At, Actions
- **THEN** the table SHALL show only active categories by default
- **THEN** each row SHALL have Edit and Delete action buttons

#### Scenario: Pagination controls

- **WHEN** admin is on the category list page
- **THEN** the system SHALL display pagination controls at the bottom
- **THEN** admin SHALL be able to navigate between pages
- **THEN** admin SHALL be able to change items per page (10, 20, 50)

#### Scenario: Search functionality

- **WHEN** admin types in the search input field
- **THEN** the system SHALL filter the table to show matching category names
- **THEN** search SHALL be case-insensitive
- **THEN** results SHALL update after 300ms debounce

#### Scenario: Toggle inactive visibility

- **WHEN** admin clicks "Show Inactive" toggle
- **THEN** the table SHALL display both active and inactive categories
- **THEN** inactive categories SHALL be visually distinguished (e.g., grayed out)

### Requirement: Category create form

The system SHALL provide a form for creating new categories.

#### Scenario: Open create dialog

- **WHEN** admin clicks the "Add Category" button
- **THEN** the system SHALL display a modal dialog with a form
- **THEN** the form SHALL contain a Name input field
- **THEN** the form SHALL contain an Active toggle (default: true)

#### Scenario: Submit valid create form

- **WHEN** admin fills in a valid category name and submits
- **THEN** the system SHALL send `POST /v1/admin/categories`
- **THEN** the system SHALL display a success toast notification "Category created successfully"
- **THEN** the dialog SHALL close
- **THEN** the category list SHALL refresh to show the new category

#### Scenario: Submit invalid create form

- **WHEN** admin submits an empty category name
- **THEN** the system SHALL display validation error under the input field
- **THEN** the system SHALL NOT close the dialog
- **THEN** the system SHALL NOT send the API request

#### Scenario: Duplicate name error

- **WHEN** admin submits a category name that already exists
- **THEN** the system SHALL display error toast "Category with this name already exists"
- **THEN** the dialog SHALL remain open for correction

### Requirement: Category edit form

The system SHALL provide a form for editing existing categories.

#### Scenario: Open edit dialog

- **WHEN** admin clicks the Edit button on a category row
- **THEN** the system SHALL display a modal dialog pre-filled with category data
- **THEN** the dialog SHALL show the current name and active status

#### Scenario: Submit valid edit form

- **WHEN** admin modifies the category name and submits
- **THEN** the system SHALL send `PATCH /v1/admin/categories/:id`
- **THEN** the system SHALL display a success toast "Category updated successfully"
- **THEN** the dialog SHALL close
- **THEN** the category list SHALL refresh to show updated data

### Requirement: Category delete confirmation

The system SHALL provide a confirmation dialog before deleting a category.

#### Scenario: Confirm delete

- **WHEN** admin clicks the Delete button on a category row
- **THEN** the system SHALL display a confirmation dialog
- **THEN** the dialog SHALL show the category name being deleted
- **THEN** the dialog SHALL have "Cancel" and "Delete" buttons

#### Scenario: Execute delete

- **WHEN** admin confirms deletion by clicking "Delete"
- **THEN** the system SHALL send `DELETE /v1/admin/categories/:id`
- **THEN** the system SHALL display a success toast "Category deleted successfully"
- **THEN** the dialog SHALL close
- **THEN** the category SHALL be marked as inactive in the list (not removed)

#### Scenario: Cancel delete

- **WHEN** admin clicks "Cancel" in the confirmation dialog
- **THEN** the system SHALL close the dialog
- **THEN** no API call SHALL be made

### Requirement: Toast notifications

The system SHALL display toast notifications for user feedback.

#### Scenario: Success notification

- **WHEN** an API operation completes successfully
- **THEN** the system SHALL display a green success toast
- **THEN** the toast SHALL auto-dismiss after 3 seconds

#### Scenario: Error notification

- **WHEN** an API operation fails
- **THEN** the system SHALL display a red error toast
- **THEN** the error toast SHALL display the error message from the API
- **THEN** the toast SHALL remain visible for 5 seconds

### Requirement: Unauthorized access handling

The system SHALL handle unauthorized access gracefully.

#### Scenario: Non-admin attempts to access category page

- **WHEN** a non-admin user navigates to `/admin/categories`
- **THEN** the system SHALL redirect to the home page or show 403 page
- **THEN** the system SHALL NOT display the category management UI