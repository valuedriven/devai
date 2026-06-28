---
name: jest-unit-tests
description: >
  Defines architectural standards, constraints, and best practices for writing high-quality
  unit tests using Jest in the e-micro-commerce backend (NestJS 11+ / Node.js 24+ / TypeScript).
  Use this skill whenever implementing or modifying unit tests for services, use cases,
  domain entities, value objects, guards, pipes, interceptors, utility functions, shared
  libraries, or Jest test utilities inside apps/backend/src.
  Do NOT use for integration tests (use supertest-integration-tests skill),
  E2E tests (use playwright-e2e-tests skill), or frontend component tests.
---

# Jest Unit Testing Skill — e-micro-commerce

## Project Context

Stack: NestJS 11+ · Node.js 24+ · TypeScript · Prisma 7+ · PostgreSQL 15+
Monorepo root: `apps/backend/`

```text
apps/backend/src/
  core/
    auth/         ← authentication guards and strategies
    database/     ← Prisma service
    observability/← OpenTelemetry tracing
    audit/        ← audit log service
  modules/
    catalog/      ← public catalog (products, categories)
    orders/       ← protected (CUSTOMER / ADMIN)
    customers/    ← protected (ADMIN)
```

All business rules reside exclusively in the backend. The frontend is a pure consumer of REST APIs and must never be tested here.

---

## Purpose

Generate **high-quality, deterministic, maintainable unit tests** that validate observable behavior while keeping the System Under Test (SUT) completely isolated from infrastructure.

The goal is **behavior-driven testing**, not implementation testing.

---

## Core Principles

Every unit test must be:

1. **Isolated** — no real database, no filesystem, no HTTP, no external APIs, no Prisma, no message brokers, no real timers
2. **Deterministic** — independent from execution order, current date/time, randomness, and machine state
3. **Fast** — execute in milliseconds; no unnecessary module bootstrapping; no real I/O
4. **Expressive** — reads like a specification; clearly separates Arrange, Act, Assert; test names describe business behavior
5. **Maintainable** — one failing behavior breaks one test; no duplicated setup; minimal mocking required

---

## Testing Philosophy

### Test Behavior — Never Implementation

Always test the public API.

**Assert:**
- Returned value
- Thrown exception
- Observable side effects
- Calls to dependencies with correct arguments

**Never assert:**
- Private methods
- Internal variables
- Internal control flow
- Implementation details
- NestJS framework internals

```ts
// ✔ Good
expect(result).toEqual(expected);

// ✘ Bad
expect(service['calculateTotal']).toHaveBeenCalled();
```

---

### Never Mock the System Under Test (SUT)

The class or function under test must always execute its real implementation. Only mock its direct collaborators.

```ts
// ✔ Correct dependency graph
OrdersService (SUT)
  ↓
OrdersRepository    (mock)
AuditService        (mock)
PrismaService       (mock)
Logger              (mock)

// ✘ Wrong
jest.mock('./orders.service');
```

---

## Scope

**Use this skill for:**
- Services (`*.service.ts`)
- Use Cases / Command Handlers / Query Handlers
- Domain Entities and Value Objects
- Guards (business logic only — not auth framework wiring)
- Pipes (validation logic only)
- Interceptors (logic only)
- Utility functions
- Shared libraries (`core/`)

**Do NOT use this skill for:**
- Controllers (covered by integration tests)
- Database repositories (use real DB in integration tests)
- NestJS modules
- Frontend components

---

## File Organization

Place unit tests next to the source file.

```text
apps/backend/src/
  modules/
    orders/
      orders.service.ts
      orders.service.spec.ts
  core/
    audit/
      audit.service.ts
      audit.service.spec.ts
```

Naming convention: `<filename>.spec.ts`

---

## Architecture-Specific Mocking Rules

### Prisma

`PrismaService` is infrastructure. Always mock it completely in unit tests.

```ts
const prismaMock = {
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};

{
  provide: PrismaService,
  useValue: prismaMock,
}
```

Never import real `PrismaService` or connect to a database in a unit test.

---

### Audit Service

Every Create / Update / Delete operation on critical entities must call `AuditService`. Always mock it and assert it was called with the correct payload.

```ts
const auditMock = {
  log: jest.fn(),
};

// Assert audit was recorded
expect(auditMock.log).toHaveBeenCalledWith({
  userId: expect.any(String),
  entity: 'Order',
  action: 'CREATE',
  payload: expect.objectContaining({ orderId: expect.any(String) }),
  timestamp: expect.any(Date),
});
```

---

### Logger (Pino / nestjs-pino)

Always mock the logger. Never assert on its output — only verify it does not throw when called.

```ts
const loggerMock = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
```

Do not assert logger call counts in most tests — logging is infrastructure.

---

### Authentication / Authorization

Guards and strategies that wrap Clerk integration are infrastructure.

In unit tests for services:
- Do not instantiate guards.
- Do not call Clerk APIs.
- Tests for guards themselves mock the `ExecutionContext` and `Reflector` only.

---

## Test Module Setup (NestJS)

Prefer `Test.createTestingModule` for dependency injection.

```ts
let service: OrdersService;
let prisma: jest.Mocked<PrismaService>;
let audit: jest.Mocked<AuditService>;

beforeEach(async () => {
  const module = await Test.createTestingModule({
    providers: [
      OrdersService,
      {
        provide: PrismaService,
        useValue: {
          order: {
            create: jest.fn(),
            findUnique: jest.fn(),
          },
          $transaction: jest.fn(),
        },
      },
      {
        provide: AuditService,
        useValue: { log: jest.fn() },
      },
    ],
  }).compile();

  service = module.get(OrdersService);
  prisma  = module.get(PrismaService);
  audit   = module.get(AuditService);
});

afterEach(() => {
  jest.clearAllMocks();
});
```

---

## Mocking Rules

### Rule 1 — Mock Only Direct Dependencies

Never mock transitive dependencies.

### Rule 2 — Configure Mocks Per Test

Always configure behavior inside the individual test.

```ts
// ✔ Good — per-test configuration
it('returns the order', async () => {
  prisma.order.findUnique.mockResolvedValueOnce(orderFixture);
  ...
});

// ✘ Bad — shared state
beforeEach(() => {
  prisma.order.findUnique.mockResolvedValue(orderFixture);
});
```

### Rule 3 — Use `jest.spyOn()` for Partial Mocking

```ts
// Track calls
const spy = jest.spyOn(service, 'calculateTotal');
expect(spy).toHaveBeenCalledWith(items);

// Stub one method while preserving the rest
jest.spyOn(service, 'validateStock').mockResolvedValue(true);
```

Never spy on private methods.

### Rule 4 — Use `jest.mock()` Only for External Modules

```ts
jest.mock('axios');
const mockedAxios = jest.mocked(axios);
mockedAxios.get.mockResolvedValue({ data: {} });
```

### Rule 5 — Never Mock Pure Utilities

Keep deterministic helpers real: string helpers, mappers, mathematical functions, validators.

---

## Time and Randomness

Mandatory whenever code depends on `Date`, `setTimeout`, `setInterval`, or random values.

```ts
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));
});

afterAll(() => {
  jest.useRealTimers();
});
```

Never allow tests to depend on the machine clock.

---

## Test Structure

Every test must follow Arrange–Act–Assert with mandatory comments.

```ts
it('creates an order and records audit log', async () => {
  // Arrange
  prisma.order.create.mockResolvedValueOnce(orderFixture);

  // Act
  const result = await service.createOrder(createOrderDto, userId);

  // Assert
  expect(result.id).toBe(orderFixture.id);
  expect(audit.log).toHaveBeenCalledWith(
    expect.objectContaining({ action: 'CREATE', entity: 'Order' }),
  );
});
```

---

## Required Test Scenarios

Cover all applicable scenarios per public method:

- ✅ Happy path
- ✅ Not found (`NotFoundException`)
- ✅ Validation failure (`BadRequestException`)
- ✅ Unauthorized / Forbidden scenarios for protected operations
- ✅ Dependency failure (Prisma throws)
- ✅ Audit called / not called as appropriate
- ✅ Edge cases: empty collections, null, undefined, boundary values

---

## Error Format

The API exposes RFC 9457 Problem Details. When testing error scenarios, assert that the correct NestJS HTTP exception is thrown — not the raw error message string.

```ts
// ✔ Good
await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);

// ✘ Bad
await expect(service.findById('non-existent')).rejects.toThrow('User not found');
```

---

## Business Rules by Module

When generating tests, consider these domain invariants:

### `catalog/` (public)
- Products and categories are readable without authentication.
- Only ADMIN can create, update, or delete products or categories.
- Price and stock mutations must always produce an audit entry.

### `orders/` (protected)
- CUSTOMER can only read their own orders.
- CUSTOMER cannot access other customers' orders (IDOR prevention — assert ownership check).
- CUSTOMER can cancel only unpaid orders.
- ADMIN can read all orders.
- Order creation must be atomic (`$transaction`).

### `customers/` (protected)
- Only ADMIN can manage customers.

### `core/audit/`
- Must be called for every Create, Update, Delete on critical entities.
- Required fields: `userId`, `entity`, `action`, `payload`, `timestamp`.

---

## Coverage Requirements

| Metric     | Minimum |
|------------|---------|
| Lines      | 80%     |
| Branches   | 80%     |
| Functions  | 80%     |
| Statements | 80%     |

Enforce via `jest.config.ts`:

```ts
coverageThreshold: {
  global: {
    lines: 80,
    branches: 80,
    functions: 80,
    statements: 80,
  },
},
```

---

## Cleanup

```ts
afterEach(() => {
  jest.clearAllMocks();
});
```

Never share mock history, implementations, or return values between tests.

---

## Anti-Patterns

Never generate code that:

- Mocks the SUT
- Calls real Prisma or connects to PostgreSQL
- Calls Clerk APIs
- Tests implementation details or private methods
- Performs network requests or filesystem operations
- Depends on the current date or random values
- Shares mock state between tests
- Uses `--passWithNoTests`
- Relies on execution order
- Tests multiple behaviors in a single test
- Asserts on log output (logs are infrastructure)
- Asserts `console.log` (forbidden in production code anyway)

---

## AI Decision Tree

### Step 1 — Classify Every Dependency

| Dependency        | Category       |
|-------------------|----------------|
| PrismaService     | Infrastructure |
| AuditService      | Infrastructure |
| Logger (Pino)     | Infrastructure |
| Clerk client      | Infrastructure |
| HTTP clients      | Infrastructure |
| Domain entities   | Business       |
| Mappers / DTOs    | Business       |
| Validators        | Business       |
| Pure utilities    | Business       |

### Step 2 — Decide Mock Strategy

| Dependency        | Strategy        |
|-------------------|-----------------|
| PrismaService     | Mock            |
| AuditService      | Mock + Assert   |
| Logger            | Mock (no assert)|
| HTTP Client       | Mock            |
| External SDK      | Mock            |
| Domain Entity     | Keep Real       |
| Mapper            | Keep Real       |
| Pure Utility      | Keep Real       |

### Step 3 — Required Scenarios Per Method

1. Happy path
2. Error path (not found, conflict, forbidden)
3. Dependency failure
4. Audit recorded (when applicable)
5. IDOR / ownership check (when applicable)
6. Edge cases and boundary values

### Step 4 — Quality Checklist

Before considering a test complete:

- [ ] SUT is never mocked
- [ ] Only direct dependencies are mocked
- [ ] PrismaService is mocked — no real DB
- [ ] AuditService is mocked and asserted when relevant
- [ ] Every mock is explicitly configured per test
- [ ] AAA structure with mandatory comments is present
- [ ] `afterEach(jest.clearAllMocks)` exists
- [ ] Fake timers are used when time-dependent logic exists
- [ ] No implementation details are asserted
- [ ] Tests are deterministic and independent
- [ ] Coverage thresholds are achievable

---

## Quick Reference

```ts
// Mock PrismaService
const prismaMock = {
  order: { create: jest.fn(), findUnique: jest.fn() },
  $transaction: jest.fn(),
};

// Mock AuditService
const auditMock = { log: jest.fn() };

// Mock Logger
const loggerMock = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };

// Fake timers
jest.useFakeTimers();
jest.setSystemTime(new Date('2024-01-01T00:00:00Z'));

// Cleanup
afterEach(() => { jest.clearAllMocks(); });

// AAA template
it('description', async () => {
  // Arrange
  // Act
  // Assert
});
```