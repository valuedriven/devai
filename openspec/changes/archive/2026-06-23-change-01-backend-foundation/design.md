## Context

The backend NestJS project is partially scaffolded. This change completes the foundational layer: Prisma schema (add missing entities, remove MVP-prohibited tenancy fields), structured logging (Pino), RFC 9457 error handling, proper health check endpoint, OpenTelemetry instrumentation, and CORS whitelist.

## Goals / Non-Goals

**Goals:**
- Prisma schema with all entities exactly as specified in `docs/spec.md`, without `tenantId` fields
- Structured logging with Pino (`nestjs-pino`)
- Global exception filter implementing Problem Details (RFC 9457)
- Health check endpoint at `GET /api/v1/health`
- OpenTelemetry tracing on all HTTP endpoints
- CORS whitelist instead of wide-open
- Configuration loaded from root `.env` via `@nestjs/config`
- Single Prisma migration covering all schema changes
- Remove tenancy artifacts (TenantInterceptor, tenantId fields) from MVP

**Non-Goals:**
- Business logic services
- Authentication/authorization (Change 03)
- API endpoints beyond health check
- Frontend integration

## Decisions

### Decisão 1: Prisma Schema — Complete Entities Without Tenancy
- **Escolha**: All 6 entities (Category, Product, Customer, Order, OrderItem, Payment) mapped in `schema.prisma`. No `tenantId` fields. Payment entity added with fields: value, method, date, status, notes, orderId.
- **Alternativa Considerada**: Incremental schema with just the tables needed for foundation.
- **Razão da Escolha**: Single schema with all entities avoids multiple migrations later and matches the spec completely.
- **Consequência**: New migration generated from updated schema.

### Decisão 2: Structured Logging with `nestjs-pino`
- **Escolha**: `nestjs-pino` as the logging framework with JSON output, correlation ID propagation, and Pino as the underlying logger.
- **Alternativa Considerada**: Winston (`nest-winston`), raw `console.log`.
- **Razão da Escolha**: Required by `docs/architecture.md` (§ Observabilidade). Pino is faster than Winston, and `nestjs-pino` integrates natively with NestJS lifecycle.
- **Consequência**: All HTTP requests are logged automatically with correlation IDs.

### Decisão 3: Error Handling — Global Exception Filter (RFC 9457)
- **Escolha**: Single `HttpExceptionFilter` implementing Problem Details JSON format for all HTTP errors.
- **Alternativa Considerada**: Per-controller error handling, NestJS built-in exception filters.
- **Razão da Escolha**: Required by `docs/architecture.md` (§ Confiabilidade). Centralized handling ensures consistent API error responses.
- **Consequência**: Every error response follows `{ type, title, status, detail, instance }` format.

### Decisão 4: Health Check — Separate Controller
- **Escolha**: `GET /api/v1/health` returning `{ status: "ok", timestamp, uptime }` via a dedicated `HealthController`.
- **Alternativa Considerada**: Keeping the existing root `GET /` returning "Hello World!".
- **Razão da Escolha**: Proper versioned health endpoint for monitoring/load balancers. Follows API versioning convention (`/v1/`).
- **Consequência**: `AppController` is simplified; health logic is isolated.

### Decisão 5: OpenTelemetry via `@nestjs/opentelemetry`
- **Escolha**: `@opentelemetry/sdk-node` with `@opentelemetry/instrumentation-http` and `@opentelemetry/instrumentation-nestjs-core` for automatic tracing.
- **Alternativa Considerada**: Manual span creation, no tracing.
- **Razão da Escolha**: Required by `docs/architecture.md` (§ Observabilidade). Automatic instrumentation requires minimal code.
- **Consequência**: All HTTP endpoints generate traces with trace_id and span_id propagated.

### Decisão 6: Configuration via `@nestjs/config`
- **Escolha**: `@nestjs/config` (already installed) loading from root `.env` file via `ConfigModule.forRoot()`.
- **Alternativa Considerada**: Manual `process.env` reads, `dotenv` directly.
- **Razão da Escolha**: Native NestJS configuration module with validation support, aligns with architecture.md requirement of single root `.env`.

### Decisão 7: CORS Whitelist
- **Escolha**: Explicit whitelist of allowed origins (frontend domain) instead of `app.enableCors()` with no options.
- **Alternativa Considerada**: Wide-open CORS for MVP.
- **Razão da Escolha**: Security best practice. Origins configured via `CORS_ORIGINS` env var.

### Decisão 8: Remove Tenancy Artifacts
- **Escolha**: Delete `TenantInterceptor`, remove `tenantId` from all Prisma models, remove `x-tenant-id` references from auth module.
- **Alternativa Considerada**: Keep tenancy stubs for future.
- **Razão da Escolha**: Architecture.md § Limites de Implementação do MVP explicitly prohibits any tenancy artifacts.
- **Consequência**: A future tenancy change will need to re-add these.

## Risks / Trade-offs

- **[Risk]** Schema migration may fail if existing DB has data with tenancy fields.
  - **Mitigation**: Migration safely drops `tenantId` columns (no dependent data in MVP).
- **[Risk]** `nestjs-pino` version compatibility with NestJS 11.
  - **Mitigation**: Pin to version compatible with NestJS 11 range.
- **[Risk]** OpenTelemetry adds startup latency.
  - **Mitigation**: Acceptable for MVP; can be optimized later.
