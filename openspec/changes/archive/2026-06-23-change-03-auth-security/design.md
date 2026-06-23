## Context

DevAI is a micro-commerce platform with two user profiles — ADMIN (entrepreneur) and CUSTOMER (buyer). Authentication is handled by Clerk as the external identity provider. The current codebase has basic auth scaffolding (`ClerkService`, `AuthContext`, `LoginForm`, `RegisterForm`) but lacks:

- Server-side JWT validation with proper BFF pattern
- Role-based authorization guards and decorators
- Protected route enforcement on the frontend
- Role-based UI visibility (admin vs customer menus)
- Integration tests for auth flows
- Webhook sync for user lifecycle events

The architecture mandates a BFF (Backend for Frontend) pattern where the backend validates all tokens and enforces authorization. Frontend must NOT use Clerk SDKs or components — all auth UI is custom-built.

## Goals / Non-Goals

**Goals:**
- Implement Clerk BFF pattern — backend proxies auth, validates JWTs, syncs users
- NestJS `@Roles()` decorator + `RolesGuard` for RBAC on endpoints
- Frontend `ProtectedRoute` wrapper and role-based UI visibility
- Auth endpoints: `POST /v1/auth/login`, `POST /v1/auth/logout`, `GET /v1/auth/me`
- Webhook endpoint for Clerk user.created/user.updated/user.deleted events
- Custom login, signup, and logout UI (zero Clerk SDK components)
- Unit + integration + E2E test coverage

**Non-Goals:**
- MFA (future)
- OAuth social login (Clerk supports this, deferred)
- Password recovery flow (handled by Clerk's hosted pages or future)
- Organization/tenancy (explicitly out of MVP scope)
- Rate limiting at the auth level (tracked separately)
- Session management beyond Clerk's JWT lifecycle

## Decisions

### 1. BFF Authentication Flow

**Decision:** Backend proxies login/signup to Clerk's Backend API. The backend issues signed session tokens (JWT_SECRET) and validates them on every protected request via local JWT verification.

**Rationale:**
- Clerk BFF SDK (`@clerk/clerk-sdk-node`) handles Clerk API calls (user creation, password verification)
- Local JWT tokens avoid coupling to Clerk session lifecycle
- Prevents direct Clerk API exposure from frontend
- Single point of token validation and user sync
- Aligned with existing `ClerkService` structure

**Alternatives considered:**
- Clerk Frontend SDK: Forbidden by architecture (no Clerk SDKs on frontend)
- Clerk JWK verification: Ties token lifecycle to Clerk sessions; adds latency on every request

### 2. Role Storage

**Decision:** Roles are stored as Clerk public metadata (`public_metadata.roles`). Backend reads them on token verification and attaches to request context.

**Rationale:**
- Clerk metadata is the source of truth — no role sync needed
- No additional database queries for role lookup
- Changes propagate immediately (no sync delay)

**Alternatives considered:**
- Database roles table: Extra sync complexity, stale data risk
- Hardcoded roles in env: Not scalable for multi-tenant future

### 3. NestJS Guards Pattern

**Decision:** Use NestJS `@SetMetadata` + `Reflector` for `@Roles()` decorator, with a global `RolesGuard` that checks the request's authenticated user roles.

**Rationale:**
- Standard NestJS pattern — familiar, well-documented, testable
- Can compose with existing `AuthGuard` for token validation
- Public endpoints use `@Public()` decorator to skip auth
- Clean separation: AuthGuard validates token, RolesGuard checks permissions

### 4. Frontend Auth State

**Decision:** Use React Context (`AuthContext`) with session token stored in HttpOnly cookie. Token is fetched from `GET /v1/auth/me` on app load via cookie.

**Rationale:**
- HttpOnly cookie (set by backend on login) prevents XSS token theft
- No client-side token storage — matches BFF pattern
- Existing `AuthContext` is already structured for this
- Refresh flow: backend sets new cookie, frontend re-reads from `/me`

### 5. Protected Routes

**Decision:** Frontend `ProtectedRoute` component checks `AuthContext.isAuthenticated` and optional `allowedRoles`. Unauthenticated users redirect to `/login`. Unauthorized users see a 403 page.

**Rationale:**
- Simple, composable wrapper for layout and page components
- Role filtering enables admin-only route groups
- Works within Next.js App Router without middleware complexity

## Risks / Trade-offs

| Risk | Level | Mitigation |
|------|-------|------------|
| Token validation dependency on Clerk availability | Medium | Backend caches JWK set; fallback to cached keys if Clerk unreachable |
| Session cookie not set during SSR initial page load | Medium | `AuthContext` loads user from `/me` on mount; brief loading state shown |
| Role metadata schema changes in Clerk | Low | Define roles using Clerk's public metadata API; document schema in specs |
| Frontend role check bypass (UI-only hiding) | Low | All business rules enforced on backend; frontend role checks are UX only |

## Open Questions

- Should logout invalidate the Clerk session server-side or just clear the local cookie? Decision: Both — call Clerk API to revoke session + clear cookie.
- Frontend caching of user roles — should `/me` poll or load once? Decision: Load once on mount, refresh on explicit action (logout/login).
