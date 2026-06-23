# 02 — Frontend Foundation

## Summary

Setup of the Next.js frontend project with App Router, base layout (header, footer, navigation), API service layer, environment configuration, and global CSS setup.

## Functional Scope

- Next.js project scaffolding (`apps/frontend/`)
- App Router structure (`app/`, `components/`, `features/`, `services/`, `hooks/`, `types/`)
- Base layout component with header, footer, and navigation placeholder
- Global CSS setup (vanilla CSS, design tokens)
- HTTP client service layer (for backend API consumption)
- Environment variable loading from root `.env`
- Error boundary component
- Loading state component

## Dependencies

None (independent from backend; can run in parallel with Change 01).

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Incorrect project structure | Low | Follow architecture.md conventions |
| Missing env vars | Low | Document required vars clearly |

## Quality Gates

### Linter

- `npm run lint` (ESLint) — frontend workspace

### Unit Tests

- Layout component renders correctly
- HTTP service layer basic request/response

### Integration Tests

None (no API integration yet).

### E2E Tests

None (no user-facing functionality yet).

## Out of Scope

- Authentication UI
- Business logic
- Backend communication (beyond service layer skeleton)
- Styling beyond base layout
