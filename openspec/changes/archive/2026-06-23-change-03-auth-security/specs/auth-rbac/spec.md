## ADDED Requirements

### Requirement: Token validation on protected endpoints

The system SHALL validate authentication tokens on every protected endpoint request.

#### Scenario: Valid token

- **WHEN** request with a valid authentication token is sent to a protected endpoint
- **THEN** the system SHALL decode and verify the token using the local JWT_SECRET
- **THEN** the system SHALL extract user id and roles from token claims
- **THEN** the system SHALL attach user context to the request
- **THEN** the system SHALL process the request normally

#### Scenario: Expired token

- **WHEN** request with an expired authentication token is sent to a protected endpoint
- **THEN** the system SHALL return 401 Unauthorized
- **THEN** the system SHALL NOT process the request

#### Scenario: Invalid token

- **WHEN** request with a malformed or invalid authentication token is sent to a protected endpoint
- **THEN** the system SHALL return 401 Unauthorized
- **THEN** the system SHALL NOT process the request

#### Scenario: Missing token

- **WHEN** request without Authorization header is sent to a protected endpoint
- **THEN** the system SHALL return 401 Unauthorized

### Requirement: Role-based access control

The system SHALL enforce role-based access using the `@Roles()` decorator.

#### Scenario: ADMIN access to admin endpoint

- **WHEN** user with role ADMIN requests an endpoint decorated with `@Roles('ADMIN')`
- **THEN** the system SHALL allow the request
- **THEN** the system SHALL process the request normally

#### Scenario: CUSTOMER access to admin endpoint

- **WHEN** user with role CUSTOMER requests an endpoint decorated with `@Roles('ADMIN')`
- **THEN** the system SHALL return 403 Forbidden

#### Scenario: Unauthenticated access to protected endpoint

- **WHEN** unauthenticated user requests an endpoint decorated with `@Roles('ADMIN')`
- **THEN** the system SHALL return 401 Unauthorized

### Requirement: Public endpoints bypass auth

The system SHALL allow unauthenticated access to endpoints decorated with `@Public()`.

#### Scenario: Public catalog access

- **WHEN** unauthenticated user requests a public endpoint decorated with `@Public()`
- **THEN** the system SHALL process the request without authentication

#### Scenario: Public with valid token

- **WHEN** authenticated user requests a public endpoint decorated with `@Public()`
- **THEN** the system SHALL process the request normally (no auth enforcement)

### Requirement: Role metadata

The system SHALL read user roles from Clerk public metadata.

#### Scenario: User has ADMIN role in Clerk metadata

- **WHEN** user logs in and their Clerk public_metadata.roles contains "ADMIN"
- **THEN** the system SHALL include "ADMIN" in the user's roles array

#### Scenario: User has no roles in Clerk metadata

- **WHEN** user logs in and their Clerk public_metadata.roles is undefined or empty
- **THEN** the system SHALL default to roles containing only "CUSTOMER"
