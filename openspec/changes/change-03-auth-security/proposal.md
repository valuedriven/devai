# 03 — Authentication & Authorization

## Summary

Integrate Clerk as the identity provider following the BFF (Backend for Frontend) pattern. Backend validates tokens, enforces RBAC via NestJS guards/decorators, and syncs users. Frontend implements custom auth UI (login, signup, logout) without using Clerk SDK components.

## Functional Scope

### Backend

- Clerk BFF integration (backend consumes Clerk APIs)
- JWT validation middleware/guard
- Role-based authorization guards (`@Roles(ADMIN)`, `@Roles(CUSTOMER)`)
- User synchronization on first login
- Current user endpoint (`GET /v1/auth/me`)
- Logout endpoint

### Frontend

- Custom login page (email + password)
- Custom signup page
- Custom logout button
- Auth context/provider (manages session state)
- Protected route wrapper component
- Role-based UI visibility (admin menu items, customer menu items)

## Dependencies

- Change 01 (Backend Foundation)
- Change 02 (Frontend Foundation)

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Security misconfiguration (token validation) | High | Follow Clerk docs + OWASP guidelines |
| Session handling bugs | Medium | Thorough test coverage of edge cases |
| Users out of sync | Low | Sync on every authenticated request |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- **Backend**: `AuthService`, auth guards (`@Roles`, `@Public`), token validation
- **Frontend**: auth context, protected route logic

### Integration Tests

- `POST /v1/auth/login` — valid/invalid credentials
- `POST /v1/auth/logout` — session termination
- `GET /v1/auth/me` — authenticated/unauthenticated
- Role enforcement (admin vs customer endpoints)

### E2E Tests

- Full login flow (custom UI → backend → Clerk)
- Signup flow
- Logout flow
- Protected route redirect when unauthenticated

## Out of Scope

- MFA (future)
- Password recovery (handled by Clerk)
- OAuth social login (can be added later)
- Organization/tenancy (future)
