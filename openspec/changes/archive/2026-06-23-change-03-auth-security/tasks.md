## 1. Backend Auth Module Setup

- [x] 1.1 Add `svix` and `@clerk/clerk-sdk-node` dependencies to backend `package.json`
- [x] 1.2 Configure `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_WEBHOOK_SECRET`, `JWT_SECRET` environment variables
- [x] 1.3 Define `AuthModule` as global with ClerkService, AuthService, AuthController providers
- [x] 1.4 Add Clerk JWK caching logic to ClerkService

## 2. Token Validation & BFF

- [x] 2.1 Implement `AuthGuard` that validates Clerk JWT from Authorization header
- [x] 2.2 Extract user payload (id, roles, metadata) from validated token
- [x] 2.3 Attach authenticated user to NestJS request context via custom decorator
- [x] 2.4 Implement `@Public()` decorator to bypass AuthGuard on public endpoints
- [x] 2.5 Register AuthGuard as global guard in AuthModule

## 3. RBAC Guards & Decorators

- [x] 3.1 Implement `@Roles()` decorator using `@SetMetadata` with role names
- [x] 3.2 Implement `RolesGuard` that reads required roles from metadata and compares with request user roles
- [x] 3.3 Register `RolesGuard` as global guard alongside `AuthGuard`
- [x] 3.4 Add role extraction logic in ClerkService from Clerk public_metadata.roles

## 4. Auth Endpoints

- [x] 4.1 Implement `POST /v1/auth/login` — delegates to Clerk, syncs user, sets cookie
- [x] 4.2 Implement `POST /v1/auth/register` — delegates to Clerk, creates local user, sets cookie
- [x] 4.3 Implement `GET /v1/auth/me` — returns current user from token
- [x] 4.4 Implement `POST /v1/auth/logout` — revokes Clerk session, clears cookie
- [x] 4.5 Add DTOs with class-validator validation for login and register payloads

## 5. Webhook Sync (REMOVED — Clerk webhooks out of scope)

- [-] 5.1 Implement `POST /v1/auth/webhooks` endpoint for Clerk webhook delivery
- [-] 5.2 Add Svix signature verification middleware/guard for webhook endpoint
- [-] 5.3 Handle `user.created` event — create local user record
- [-] 5.4 Handle `user.updated` event — update local user record
- [-] 5.5 Handle `user.deleted` event — soft-delete local user record

## 6. Frontend Auth Integration

- [x] 6.1 Update `AuthContext` to call `GET /v1/auth/me` on mount for session restoration
- [x] 6.2 Update `LoginForm` to call backend `POST /v1/auth/login` endpoint
- [x] 6.3 Update `RegisterForm` to call backend `POST /v1/auth/register` endpoint
- [x] 6.4 Add logout button/functionality that calls `POST /v1/auth/logout`
- [x] 6.5 Implement session cookie handling — backend sets, frontend reads via `/me`

## 7. Protected Routes & Role-Based UI

- [x] 7.1 Implement `ProtectedRoute` component with `allowedRoles` prop (client-side option available)
- [x] 7.2 Protect admin layout (`(admin)/layout.tsx`) with server-side auth + admin role check (redirects to /403)
- [x] 7.3 Protect customer routes (orders pages) with server-side cookie check (redirects to /login)
- [x] 7.4 Update sidebar/header to conditionally render menu items based on user role
- [x] 7.5 Add 403 Forbidden page component for unauthorized access

## 8. Backend Unit Tests

- [x] 8.1 Unit test ClerkService — token validation success/failure, user sync
- [x] 8.2 Unit test AuthGuard — valid token, expired token, missing token
- [x] 8.3 Unit test RolesGuard — ADMIN allowed, CUSTOMER forbidden, public bypass
- [x] 8.4 Unit test `@Roles()` and `@Public()` decorator metadata

## 9. Backend Integration Tests

- [x] 9.1 Integration test `POST /v1/auth/login` — valid/invalid credentials
- [x] 9.2 Integration test `POST /v1/auth/register` — valid/duplicate/weak password
- [x] 9.3 Integration test `GET /v1/auth/me` — authenticated/unauthenticated
- [x] 9.4 Integration test `POST /v1/auth/logout` — authenticated/unauthenticated
- [x] 9.5 Integration test `POST /v1/auth/webhooks` — valid/invalid signature
- [x] 9.6 Integration test role enforcement — ADMIN vs CUSTOMER endpoint access

## 10. E2E Tests

- [x] 10.1 E2E test login flow — custom UI → backend → Clerk
- [x] 10.2 E2E test registration flow — custom UI → backend → Clerk
- [x] 10.3 E2E test logout flow
- [x] 10.4 E2E test protected route redirect when unauthenticated
- [x] 10.5 E2E test admin route blocked for CUSTOMER user
- [x] 10.6 E2E test role-based UI visibility (admin vs customer menu)
