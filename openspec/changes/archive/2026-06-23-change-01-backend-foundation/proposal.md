# 01 — Backend Foundation

## Summary

Setup of the NestJS backend project with all foundational layers: Prisma schema (all entities), database connection, first migration, structured logging (Pino), error handling (RFC 9457), health check endpoint, and OpenTelemetry instrumentation.

No business logic is implemented in this change.

## Functional Scope

- NestJS project scaffolding (`apps/backend/`)
- Prisma schema with all entities:
  - `Category` (name, active)
  - `Product` (name, description, price, stock, image, active, categoryId)
  - `Customer` (name, email, phone, address, active)
  - `Order` (number, customerId, deliveryAddress, status, total)
  - `OrderItem` (orderId, productId, unitPrice, quantity)
  - `Payment` (orderId, value, method, date, status, notes)
- First Prisma migration
- Pino structured logger (`nestjs-pino`)
- Global exception filter (Problem Details RFC 9457)
- Health check endpoint (`GET /v1/health`)
- OpenTelemetry tracing setup
- Environment variables via root `.env`
- CORS whitelist configuration

## Dependencies

None (foundation change).

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Incorrect Prisma schema | Low | Schema derived from spec.md entities |
| Migration failure | Low | Test locally before committing |
| Logger misconfiguration | Low | Follow NestJS+Pino docs |

## Quality Gates

### Linter

- `npm run lint` (ESLint) — backend workspace

### Unit Tests

- `PrismaService` — instantiation and connection
- `LoggerService` — structured log format
- `HealthController` — returns 200

### Integration Tests

- `GET /v1/health` — returns `{ status: "ok" }`
- Database connection via Prisma

### E2E Tests

None (no user-facing functionality yet).

## Out of Scope

- Business logic (services, validation rules)
- Authentication and authorization
- API endpoints beyond health check
- Frontend integration
