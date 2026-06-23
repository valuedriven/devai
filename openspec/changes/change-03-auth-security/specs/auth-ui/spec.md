## MODIFIED Requirements

### Requirement: Login page

The system SHALL provide a custom login page with email and password form.

#### Scenario: Render login form

- **WHEN** unauthenticated user navigates to `/login`
- **THEN** the system SHALL display a form with email and password fields
- **THEN** the system SHALL NOT display any Clerk SDK components

#### Scenario: Successful login redirect

- **WHEN** user submits valid credentials on the login form
- **THEN** the system SHALL redirect to the home page
- **THEN** the system SHALL update the auth context with user profile

#### Scenario: Login error display

- **WHEN** user submits invalid credentials on the login form
- **THEN** the system SHALL display an inline error message
- **THEN** the system SHALL NOT redirect

### Requirement: Registration page

The system SHALL provide a custom registration page.

#### Scenario: Render registration form

- **WHEN** unauthenticated user navigates to `/register`
- **THEN** the system SHALL display a form with email, password, firstName, lastName fields
- **THEN** the system SHALL NOT display any Clerk SDK components

#### Scenario: Successful registration redirect

- **WHEN** user submits valid registration data
- **THEN** the system SHALL redirect to the home page
- **THEN** the system SHALL update the auth context with user profile

### Requirement: Protected route access

The system SHALL restrict access to authenticated users.

#### Scenario: Authenticated user accessing protected route

- **WHEN** authenticated user navigates to a protected route
- **THEN** the system SHALL render the page content

#### Scenario: Unauthenticated user accessing protected route

- **WHEN** unauthenticated user navigates to a protected route
- **THEN** the system SHALL redirect to `/login`
- **THEN** the system SHALL preserve the original URL for post-login redirect

### Requirement: Role-based route access

The system SHALL restrict admin routes to ADMIN users.

#### Scenario: ADMIN accessing admin route

- **WHEN** user with ADMIN role navigates to `/admin/*`
- **THEN** the system SHALL render the admin page

#### Scenario: CUSTOMER accessing admin route

- **WHEN** user with CUSTOMER role navigates to `/admin/*`
- **THEN** the system SHALL display a 403 Forbidden page
- **THEN** the system SHALL NOT redirect to login (user is authenticated but unauthorized)

### Requirement: Role-based UI visibility

The system SHALL conditionally render UI elements based on user role.

#### Scenario: Admin sidebar menu items

- **WHEN** user with ADMIN role views the sidebar
- **THEN** the system SHALL display admin menu items (Products, Categories, Customers, Orders, Dashboard)

#### Scenario: Customer sidebar menu items

- **WHEN** user with CUSTOMER role views the sidebar
- **THEN** the system SHALL display customer menu items (My Orders, Profile)
- **THEN** the system SHALL NOT display admin menu items
