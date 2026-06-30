# Test Standards

## Purpose

Define structural conventions and patterns for Jest unit tests in the backend to ensure consistency, readability, and maintainability across all spec files.

## Requirements

### Requirement: Unit tests follow AAA comment pattern
Every test block (`it(...)`) across all spec files SHALL have `// Arrange`, `// Act`, and `// Assert` section header comments separating the three phases.

#### Scenario: Script inserts AAA comments in a typical service test
- **WHEN** a test block contains mock setup, a `service.` method call, and `expect()` assertions
- **THEN** `// Arrange` is inserted before mock setup, `// Act` before the service call, `// Assert` before the first assertion

#### Scenario: Script handles tests with no Act phase
- **WHEN** a test block has no explicit `service.` or `await service.` call (e.g., `expect(service).toBeDefined()`)
- **THEN** `// Arrange` is inserted after the opening brace, `// Assert` before the assertion

### Requirement: Mock state is per-test, not shared
All mock configurations SHALL use `mockResolvedValueOnce()` or equivalent per-test setup. No shared `mockResolvedValue()` defaults on mock declarations.

#### Scenario: products.service.spec.ts mock defaults removed
- **WHEN** `mockPrismaService` is declared with `.mockResolvedValue(mockProduct)` on each method
- **THEN** those defaults are removed, and each test uses `mockResolvedValueOnce()`

### Requirement: Error assertions check exception types only
Error assertions SHALL use `rejects.toThrow(ExceptionType)` without asserting on the exception message string.

#### Scenario: categories and customers specs remove message assertions
- **WHEN** a test asserts both `toThrow(NotFoundException)` and `toThrow('Category not found')`
- **THEN** the message-only assertion is removed

### Requirement: Date-dependent tests use fake timers
Spec files where test data contains `new Date()` or `Date.now()` SHALL use `jest.useFakeTimers()` with `jest.setSystemTime()`.

#### Scenario: payment.service.spec.ts uses deterministic dates
- **WHEN** `payment.service.spec.ts` tests provide `date` field in payment DTOs
- **THEN** `beforeAll` sets fake timers to `2024-01-01T00:00:00Z`, test data uses `'2024-01-01T00:00:00.000Z'`

### Requirement: No private property access in tests
No spec file SHALL access `(service as any).internalProperty` to stub or assert on private state.

#### Scenario: clerk.service.spec.ts uses proper mock
- **WHEN** `clerk.service.spec.ts` currently does `(service as any).clerkClient = ...`
- **THEN** the clerkClient is injected or mocked via a proper partial mock

### Requirement: No scaffold boilerplate
Spec files that test NestJS scaffold defaults SHALL be removed.

#### Scenario: app.controller.spec.ts deleted
- **WHEN** `app.controller.spec.ts` tests `getHello()` returning `'Hello World!'`
- **THEN** the file is deleted

### Requirement: No `should be defined` tests
No spec file SHALL contain `it('should be defined', ...)` tests that only assert `expect(service).toBeDefined()`.

#### Scenario: service specs remove definition checks
- **WHEN** service spec files contain `should be defined` tests
- **THEN** those tests are removed

### Requirement: Single Prisma mock pattern across service specs
All service spec files SHALL use the shared `createMockPrismaService()` factory from `database/__mocks__/prisma-service.mock.ts`.

#### Scenario: products and categories specs use the factory
- **WHEN** `products.service.spec.ts` and `categories.service.spec.ts` define inline `mockPrismaService` objects
- **THEN** they are replaced with `createMockPrismaService()` calls
