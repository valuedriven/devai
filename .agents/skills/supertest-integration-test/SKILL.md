---
name: supertest-integration-tests
description: >
  Defines architecture, standards, patterns, and best practices for writing backend
  integration tests for the e-micro-commerce NestJS application using Jest, Supertest,
  and a real PostgreSQL database via Prisma 7+.
  Use whenever implementing or modifying REST API integration tests, HTTP endpoint validation,
  authentication (Clerk JWT), authorization (RBAC: ADMIN / CUSTOMER), database lifecycle,
  or integration test helpers inside apps/backend.
  Do NOT use for unit tests — use the jest-unit-tests skill instead.
  Do NOT use for Playwright E2E browser tests — use the playwright-e2e-tests skill instead.
---

# Supertest Integration Testing Skill — e-micro-commerce

## Project Context

Stack: NestJS 11+ · Node.js 24+ · TypeScript · Prisma 7+ · PostgreSQL 15+
Identity: Clerk (OIDC / OAuth 2.0)
Monorepo path: `apps/backend/`

```text
apps/backend/src/
  core/
    auth/         ← JwtStrategy, AuthGuard, RolesGuard
    database/     ← PrismaService
    observability/
    audit/
  modules/
    catalog/      ← public endpoints
    orders/       ← CUSTOMER + ADMIN
    customers/    ← ADMIN only
```

Integration tests validate the **complete HTTP request lifecycle** — routing, validation pipes, authentication guards, authorization guards, controllers, services, Prisma persistence, and response serialization — against a **real database**.

---

## Core Principles

1. **Real** — execute the complete NestJS application stack; never mock Prisma or repositories
2. **Isolated** — each test owns and cleans its own database state
3. **Deterministic** — execution order never matters; unique fixture values always
4. **Fast** — bootstrap the application once per suite; truncate between tests instead of re-migrating
5. **Production-like** — reproduce the same pipeline as `main.ts` exactly

---

## Scope

**Use this skill for:**
- REST Controllers in `catalog/`, `orders/`, `customers/`, `core/auth/`
- HTTP status codes, response body and headers
- Clerk JWT authentication (real token generation)
- RBAC authorization (ADMIN vs CUSTOMER)
- ValidationPipe behavior (400s)
- Exception filter behavior (RFC 9457 Problem Details)
- Prisma persistence (assert database state after mutations)
- Audit log creation for CUD operations

**Do NOT use this skill for:**
- Unit tests (business logic in isolation)
- Frontend / Next.js tests
- Playwright browser workflows

---

## Directory Structure

```text
apps/backend/
  test/
    integration/
      helpers/
        app.ts          ← bootstrap NestJS once
        auth.ts         ← JWT generation using Clerk secret
        database.ts     ← truncate helpers
        fixtures.ts     ← builder factories (makeUser, makeProduct, makeOrder)

      catalog/
        list-products.integration.spec.ts
        get-product.integration.spec.ts

      orders/
        create-order.integration.spec.ts
        get-order.integration.spec.ts
        cancel-order.integration.spec.ts

      customers/
        list-customers.integration.spec.ts
```

Naming convention: `<action>-<resource>.integration.spec.ts`

---

## Application Bootstrap

Boot once per suite — never inside `beforeEach`.

```ts
// test/integration/helpers/app.ts
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../src/app.module';

let app: INestApplication;

export async function getApp(): Promise<INestApplication> {
  if (app) return app;

  const module = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = module.createNestApplication();

  // Reproduce main.ts exactly
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // RFC 9457 Problem Details exception filter
  // app.useGlobalFilters(new ProblemDetailsFilter());

  await app.init();
  return app;
}
```

Usage in each suite:

```ts
let app: INestApplication;

beforeAll(async () => {
  app = await getApp();
});

afterAll(async () => {
  await app.close();
});
```

---

## HTTP Requests

Always use `app.getHttpServer()`. Never pass the Nest application directly to Supertest.

```ts
import * as request from 'supertest';

await request(app.getHttpServer())
  .get('/v1/catalog/products')
  .expect(200);
```

All requests use the versioned base path `/v1/`.

---

## Authentication

### Never disable or bypass authentication

Never mock `JwtStrategy`, `AuthGuard`, or `RolesGuard`. They are part of the integration under test.

### Generate real JWTs signed with Clerk secret

```ts
// test/integration/helpers/auth.ts
import * as jwt from 'jsonwebtoken';

export interface TokenPayload {
  sub: string;
  email: string;
  roles: ('ADMIN' | 'CUSTOMER')[];
}

export function createAuthHeader(payload: TokenPayload): Record<string, string> {
  const token = jwt.sign(payload, process.env.CLERK_SECRET_KEY!, {
    expiresIn: '1h',
  });
  return { Authorization: `Bearer ${token}` };
}

// Convenience factories
export const adminAuthHeader  = () => createAuthHeader({ sub: 'user-admin-1',  email: 'admin@test.com',    roles: ['ADMIN']    });
export const customerAuthHeader = (sub = 'user-customer-1') =>
  createAuthHeader({ sub, email: `customer-${sub}@test.com`, roles: ['CUSTOMER'] });
```

Usage:

```ts
await request(app.getHttpServer())
  .post('/v1/orders')
  .set(customerAuthHeader())
  .send(dto)
  .expect(201);
```

---

## Database

### Dedicated test database

Configure in `.env` at the monorepo root (single env file — never create `.env.test` or per-module env files):

```env
DATABASE_URL=postgresql://localhost/e_micro_commerce_test
NODE_ENV=test
```

Never use the development or production database.

### Cleanup between tests (truncate — not re-migrate)

```ts
// test/integration/helpers/database.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export async function truncateAll(): Promise<void> {
  const tables = [
    'AuditLog',
    'OrderItem',
    'Order',
    'Customer',
    'Product',
    'Category',
    'User',
  ];

  for (const table of tables) {
    await prisma.$executeRawUnsafe(
      `TRUNCATE TABLE "${table}" CASCADE;`
    );
  }
}
```

```ts
beforeEach(async () => {
  await truncateAll();
});

afterAll(async () => {
  await prisma.$disconnect();
  await app.close();
});
```

Avoid `prisma migrate reset` or dropping schemas inside tests — they are orders of magnitude slower.

---

## Test Data

Each test seeds its own data. Never depend on another test.

Always generate unique values to prevent collisions during parallel execution.

```ts
// test/integration/helpers/fixtures.ts
export function makeProduct(overrides: Partial<Product> = {}): CreateProductDto {
  return {
    name:        `Product-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    description: 'Test product',
    price:       99.90,
    stock:       10,
    ...overrides,
  };
}

export function makeOrder(overrides = {}): CreateOrderDto {
  return {
    items: [{ productId: 'product-id', quantity: 1 }],
    ...overrides,
  };
}
```

Seed directly with Prisma in `beforeEach` or at the top of each test:

```ts
const product = await prisma.product.create({ data: makeProduct() });
```

---

## Outbound Integration Mocking

The NestJS application is real. Mock **only outbound third-party integrations** that are external to the system boundary.

| Integration          | Strategy                         |
|----------------------|----------------------------------|
| Prisma / PostgreSQL  | Real — never mock                |
| Clerk (token validation) | Real JWT signing with secret |
| Payment gateway      | Mock via `overrideProvider`      |
| Email provider       | Mock via `overrideProvider`      |
| SMS / WhatsApp       | Mock via `overrideProvider`      |
| OpenTelemetry exporter | Mock or suppress in test env  |

```ts
.overrideProvider(PaymentGateway)
.useValue({ charge: jest.fn().mockResolvedValue({ status: 'approved' }) })
```

---

## Audit Log Verification

Every Create, Update, Delete operation on critical entities must produce an audit log entry. Assert it was persisted.

```ts
it('records an audit entry when an order is created', async () => {
  // Arrange — seeded product and customer

  // Act
  await request(app.getHttpServer())
    .post('/v1/orders')
    .set(customerAuthHeader())
    .send(dto)
    .expect(201);

  // Assert persistence + audit
  const audit = await prisma.auditLog.findFirst({
    where: { entity: 'Order', action: 'CREATE' },
  });

  expect(audit).not.toBeNull();
  expect(audit!.userId).toBeDefined();
});
```

---

## Error Response Assertions

The API follows RFC 9457 Problem Details for all errors. Assert the full problem shape:

```ts
const response = await request(app.getHttpServer())
  .post('/v1/orders')
  .set(customerAuthHeader())
  .send(invalidDto)
  .expect(400);

expect(response.body).toMatchObject({
  type:   expect.any(String),
  title:  expect.any(String),
  status: 400,
  detail: expect.any(String),
});
```

---

## Required Scenarios per Endpoint

| Scenario                       | Expected Status |
|-------------------------------|-----------------|
| Happy path                    | 2xx             |
| Validation failure            | 400             |
| Unauthenticated request       | 401             |
| Insufficient role (forbidden) | 403             |
| Resource not found            | 404             |
| Conflict (duplicate)          | 409             |
| IDOR — access other user's data | 403 or 404    |

### IDOR — mandatory for order and customer endpoints

```ts
it('returns 403 when a customer requests another customer\'s order', async () => {
  const ownerHeader  = customerAuthHeader('customer-owner');
  const attackerHeader = customerAuthHeader('customer-attacker');

  const order = await prisma.order.create({ data: makeOrderForCustomer('customer-owner') });

  await request(app.getHttpServer())
    .get(`/v1/orders/${order.id}`)
    .set(attackerHeader)
    .expect(403);
});
```

---

## Role-Based Access (RBAC)

Test both roles explicitly:

```ts
describe('DELETE /v1/catalog/products/:id', () => {
  it('returns 204 when called by ADMIN', async () => { ... });
  it('returns 403 when called by CUSTOMER', async () => { ... });
  it('returns 401 when unauthenticated', async () => { ... });
});
```

### Public endpoints (no auth required)

Catalog endpoints must return 200 without any Authorization header:

```ts
it('lists active products without authentication', async () => {
  await request(app.getHttpServer())
    .get('/v1/catalog/products')
    .expect(200);
});
```

---

## Pagination

All list endpoints must support pagination. Assert the response shape:

```ts
expect(response.body).toMatchObject({
  data:  expect.any(Array),
  total: expect.any(Number),
  page:  expect.any(Number),
  limit: expect.any(Number),
});
```

---

## Assertions

**Assert observable behavior:**
- HTTP status code
- Response body (explicit field assertions — avoid snapshots for dynamic fields)
- Response headers when relevant
- Persisted database state after mutations
- Audit log entry for CUD operations

**Never assert:**
- Private methods or internal variables
- Framework internals
- Log output

---

## Resource Cleanup

```ts
afterAll(async () => {
  await prisma.$disconnect();
  await app.close();
});
```

Never leave open database pools, open sockets, or running HTTP servers. Unclosed resources cause hanging Jest workers in CI.

---

## API Versioning

All requests must use the `/v1/` prefix as defined in the architecture.

```ts
// ✔ Correct
await request(app.getHttpServer()).get('/v1/catalog/products');

// ✘ Wrong
await request(app.getHttpServer()).get('/catalog/products');
```

---

## Anti-Patterns

| Avoid                                          | Correct Approach                                   |
|------------------------------------------------|----------------------------------------------------|
| Mocking Prisma or repositories                 | Use real PostgreSQL test database                  |
| Mocking `JwtStrategy` or `AuthGuard`           | Generate real Clerk-compatible JWTs                |
| Calling `/v1/auth/login` before every test     | Generate JWT programmatically in `auth.ts`         |
| Creating the application inside `beforeEach`   | Bootstrap once per suite via `getApp()`            |
| Shared test fixtures across tests              | Independent builder factories with unique values   |
| Dirty database state between tests             | Truncate all tables in `beforeEach`                |
| Snapshot assertions for dynamic fields         | Explicit `expect(field).toBe(value)` assertions    |
| Using the development or production database   | Dedicated test database via `DATABASE_URL` in `.env` |
| Static seed values (`admin@test.com`)          | Unique builders (`user-${Date.now()}@test.com`)    |
| Not closing Prisma                             | `await prisma.$disconnect()`                       |
| Not closing Nest app                           | `await app.close()`                                |
| Using `--passWithNoTests`                      | Forbidden — empty test suite must fail             |
| Creating `.env.test` or per-module env files   | Single `.env` at monorepo root                     |
| Accessing unversioned endpoints (`/products`)  | Always use `/v1/products`                          |
| Skipping IDOR scenarios                        | Mandatory for orders and customers endpoints       |

---

## Quality Checklist

Before considering an integration test complete:

- [ ] Uses a real NestJS application bootstrapped once per suite
- [ ] Uses Supertest through `app.getHttpServer()`
- [ ] Reproduces the `main.ts` pipeline (ValidationPipe, filters, guards)
- [ ] Uses the dedicated test PostgreSQL database
- [ ] Truncates all tables in `beforeEach`
- [ ] Uses real JWT authentication (Clerk-compatible, not bypassed)
- [ ] Mocks only outbound third-party integrations
- [ ] Seeds its own data with unique builders
- [ ] Covers success (2xx), validation (400), auth (401), authz (403), not found (404)
- [ ] Covers IDOR scenarios for user-owned resources
- [ ] Verifies persisted database state after CUD operations
- [ ] Verifies audit log creation for CUD on critical entities
- [ ] Asserts RFC 9457 Problem Details shape for error responses
- [ ] Asserts pagination shape for list endpoints
- [ ] Disconnects Prisma and closes Nest app in `afterAll`
- [ ] Does not rely on execution order
- [ ] Does not use `--passWithNoTests`
- [ ] Uses versioned API paths (`/v1/...`)