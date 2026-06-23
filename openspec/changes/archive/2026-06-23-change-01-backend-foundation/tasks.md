## 1. Prisma Schema — Add Missing Payment Entity

- [x] 1.1 Add `Payment` model to `src/database/prisma/schema.prisma` with fields:
  - `id` (BigInt, autoincrement, PK)
  - `orderId` (BigInt, FK → orders)
  - `value` (Decimal(10,2))
  - `method` (String)
  - `date` (DateTime)
  - `status` (String, default "Pendente")
  - `notes` (String?, optional)
  - `createdAt`, `updatedAt` (timestamps)
- [x] 1.2 Add relation on `orders` model: `payments Payment[]`
- [x] 1.3 Add index on `Payment.orderId`

## 2. Prisma Schema — Remove Tenancy Fields (MVP)

- [x] 2.1 Remove `tenantId` field from `Category` model
- [x] 2.2 Remove `tenantId` field from `Product` model
- [x] 2.3 Remove `tenantId` field from `customers` model
- [x] 2.4 Remove `tenantId` field from `orders` model
- [x] 2.5 Remove `tenantId` field from `order_items` model

## 3. Prisma Schema — Align with Spec

- [x] 3.1 Add `number` field (String, unique) to `orders` model (order number per spec)
- [x] 3.2 Remove `payment_date` and `payment_method` from `orders` model (now on Payment entity)
- [x] 3.3 Rename models to PascalCase convention: `customers` → `Customer`, `orders` → `Order`, `order_items` → `OrderItem` (with `@@map` for table names)
- [x] 3.4 Ensure `@@map` annotations preserve existing table names (`customers`, `orders`, `order_items`)

## 4. Generate Migration

- [x] 4.1 Run `npx prisma migrate dev --name add-payment-remove-tenancy` to create new migration
- [x] 4.2 Verify generated SQL correctly adds Payment table, drops tenantId columns, adds `number` column, removes `payment_date`/`payment_method`
- [x] 4.3 Generate Prisma client: `npx prisma generate`

## 5. Remove Tenancy Artifacts (MVP)

- [x] 5.1 Delete `src/core/interceptors/tenant.interceptor.ts`
- [x] 5.2 Remove `TenantInterceptor` import and provider from `src/app.module.ts`
- [x] 5.3 Remove `x-tenant-id` references from `src/modules/auth/auth.controller.ts`
- [x] 5.4 Remove `tenantId` references from `src/modules/auth/auth.service.ts`
- [x] 5.5 Remove `tenantId` parameter from `ClerkService.syncUserWithData` and all callers
- [x] 5.6 Remove `@map("tenant_id")` annotations from schema

## 6. Structured Logging — Pino

- [x] 6.1 Install dependencies: `npm install nestjs-pino pino-http` (backend workspace)
- [x] 6.2 Configure `LoggerModule.forRoot()` in `src/app.module.ts` with:
  - JSON output format
  - Correlation ID (generate if missing from request)
  - Auto-logging of HTTP requests
- [x] 6.3 Replace `console.log` in `src/main.ts` environment check with Pino logger calls
- [x] 6.4 Replace `console.log` in `src/database/prisma.service.ts` with Pino logger
- [x] 6.5 Replace `console.error` in `AuthGuard` with Pino logger

## 7. Error Handling — RFC 9457

- [x] 7.1 Implement `HttpExceptionFilter` in `src/core/filters/http-exception.filter.ts`:
  ```json
  { "type": "...", "title": "...", "status": 400, "detail": "...", "instance": "..." }
  ```
- [x] 7.2 Register filter globally in `src/main.ts` with `app.useGlobalFilters()`
- [x] 7.3 Handle common exception types: `BadRequestException`, `NotFoundException`, `UnauthorizedException`, `ForbiddenException`, `ValidationError`
- [x] 7.4 Ensure validation pipe errors also produce RFC 9457 format

## 8. Health Check Endpoint

- [x] 8.1 Create `src/core/health/health.controller.ts` with:
  - `GET /api/v1/health` → `{ status: "ok", timestamp: ISO, uptime: seconds }`
- [x] 8.2 Create `src/core/health/health.module.ts`
- [x] 8.3 Import `HealthModule` in `src/app.module.ts`
- [x] 8.4 Test with `curl http://localhost:3001/api/v1/health` (verified via e2e test)

## 9. OpenTelemetry Setup

- [x] 9.1 Install dependencies: `@opentelemetry/sdk-node`, `@opentelemetry/instrumentation-http`, `@opentelemetry/instrumentation-nestjs-core`, `@opentelemetry/exporter-trace-otlp-proto`
- [x] 9.2 Create `src/core/observability/opentelemetry.ts` with SDK initialization
- [x] 9.3 Import instrumentation before `NestFactory.create()` in `main.ts`
- [x] 9.4 Configure OTLP exporter endpoint via `OTEL_EXPORTER_OTLP_ENDPOINT` env var

## 10. CORS Whitelist

- [x] 10.1 Replace `app.enableCors()` in `src/main.ts` with explicit whitelist:
  ```ts
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  });
  ```
- [x] 10.2 Add `CORS_ORIGINS` to root `.env` with default value

## 11. Configuration Module

- [x] 11.1 Install `@nestjs/config` if not already present (already in deps)
- [x] 11.2 Configure `ConfigModule.forRoot({ envFilePath: resolve(__dirname, '../../../.env') })` in `AppModule`
- [x] 11.3 Implement `src/core/config/configuration.ts` with typed config object (port, database, clerk, cors)
- [x] 11.4 Replace hardcoded `process.env` reads in `main.ts` with `ConfigService`

## 12. Update E2E Test

- [x] 12.1 Update `test/app.e2e-spec.ts` to test `GET /api/v1/health` returning 200 with `{ status: "ok" }`
- [x] 12.2 Rename existing `Hello World` test to reflect health check

## 13. Run Linter

- [x] 13.1 Run `npm run lint` in backend workspace
- [x] 13.2 Fix all lint errors

## 14. Run Tests

- [x] 14.1 Run `npm test` for unit tests (verify PrismaService, HealthController)
- [x] 14.2 Run `npm run test:integration` for integration tests (health endpoint, DB connection)
- [x] 14.3 Fix all test failures
