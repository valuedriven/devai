# Auth API Specification

## Purpose

(TBD)

## Requirements

### Requirement: User login

The system SHALL authenticate users via email and password through the Clerk BFF API.

#### Scenario: Successful login

- **WHEN** user submits valid email and password to `POST /v1/auth/login`
- **THEN** the system SHALL delegate authentication to Clerk's Backend API
- **THEN** the system SHALL create a local user record if one does not exist
- **THEN** the system SHALL return user profile with id, email, firstName, lastName, roles
- **THEN** the system SHALL set an HttpOnly session cookie

#### Scenario: Invalid credentials

- **WHEN** user submits invalid email or password to `POST /v1/auth/login`
- **THEN** the system SHALL return 401 Unauthorized
- **THEN** the system SHALL NOT create or modify any user record

#### Scenario: Missing email

- **WHEN** user submits login request without email
- **THEN** the system SHALL return 400 Bad Request

#### Scenario: Missing password

- **WHEN** user submits login request without password
- **THEN** the system SHALL return 400 Bad Request

### Requirement: User registration

The system SHALL allow new users to register via email and password through the Clerk BFF API.

#### Scenario: Successful registration

- **WHEN** user submits valid registration data to `POST /v1/auth/register`
- **THEN** the system SHALL delegate user creation to Clerk's Backend API
- **THEN** the system SHALL create a local user record synchronized with Clerk
- **THEN** the system SHALL return user profile with id, email, firstName, lastName
- **THEN** the system SHALL set an HttpOnly session cookie

#### Scenario: Duplicate email

- **WHEN** user submits registration with an email already registered in Clerk
- **THEN** the system SHALL return 409 Conflict
- **THEN** the system SHALL NOT create a duplicate local record

#### Scenario: Weak password

- **WHEN** user submits registration with a password that does not meet Clerk's password policy
- **THEN** the system SHALL return 422 Unprocessable Entity with validation details

### Requirement: Current user profile

The system SHALL expose the authenticated user's profile.

#### Scenario: Authenticated user

- **WHEN** authenticated user requests `GET /v1/auth/me`
- **THEN** the system SHALL return user profile with id, email, firstName, lastName, roles, imageUrl

#### Scenario: Unauthenticated user

- **WHEN** unauthenticated request reaches `GET /v1/auth/me`
- **THEN** the system SHALL return 401 Unauthorized

### Requirement: User logout

The system SHALL terminate the user session.

#### Scenario: Successful logout

- **WHEN** authenticated user requests `POST /v1/auth/logout`
- **THEN** the system SHALL revoke the Clerk session via Clerk API
- **THEN** the system SHALL clear the session cookie
- **THEN** the system SHALL return 204 No Content

#### Scenario: Logout without active session

- **WHEN** unauthenticated user requests `POST /v1/auth/logout`
- **THEN** the system SHALL return 401 Unauthorized