## ADDED Requirements

### Requirement: Webhook signature verification

The system SHALL verify Clerk webhook signatures before processing.

#### Scenario: Valid webhook signature

- **WHEN** Clerk sends a webhook with valid Svix signature headers
- **THEN** the system SHALL verify the signature using the configured webhook secret
- **THEN** the system SHALL process the webhook payload

#### Scenario: Invalid webhook signature

- **WHEN** request with invalid or missing Svix signature reaches the webhook endpoint
- **THEN** the system SHALL return 401 Unauthorized
- **THEN** the system SHALL NOT process the payload

### Requirement: User synchronization on user.created

The system SHALL create a local user record when a user is created in Clerk.

#### Scenario: New user created in Clerk

- **WHEN** the system receives a `user.created` webhook from Clerk
- **THEN** the system SHALL create a local user record with Clerk user id, email, firstName, lastName, imageUrl
- **THEN** the system SHALL read the user's public_metadata.roles for role assignment
- **THEN** the system SHALL return 204 No Content

#### Scenario: Duplicate user.created webhook

- **WHEN** the system receives a `user.created` webhook for an already-synchronized user
- **THEN** the system SHALL treat it as an update (upsert behavior)

### Requirement: User synchronization on user.updated

The system SHALL update the local user record when a user is updated in Clerk.

#### Scenario: User profile updated

- **WHEN** the system receives a `user.updated` webhook from Clerk
- **THEN** the system SHALL update the local user record with new email, firstName, lastName, imageUrl
- **THEN** the system SHALL update roles from public_metadata.roles
- **THEN** the system SHALL return 204 No Content

#### Scenario: User not found for update

- **WHEN** the system receives a `user.updated` webhook for a user without a local record
- **THEN** the system SHALL create a new local user record (upsert)

### Requirement: User deactivation on user.deleted

The system SHALL mark the local user record as inactive when a user is deleted in Clerk.

#### Scenario: User deleted in Clerk

- **WHEN** the system receives a `user.deleted` webhook from Clerk
- **THEN** the system SHALL mark the local user as inactive (soft delete)
- **THEN** the system SHALL preserve existing orders and records linked to the user
- **THEN** the system SHALL return 204 No Content

#### Scenario: User not found on delete

- **WHEN** the system receives a `user.deleted` webhook for a user without a local record
- **THEN** the system SHALL return 204 No Content (no-op)
