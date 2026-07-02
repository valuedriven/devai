## Context

We need to enforce strict test classification across the backend project:
- **Unit tests (`apps/backend/src`)**: Should only verify classes (controllers, services, guards, pipes) in isolation. They must use Jest mocks and call methods directly. They must NOT bootstrap a NestJS HTTP server using Supertest.
- **Integration tests (`apps/backend/test/integration`)**: Verify the HTTP endpoints, database persistence, and lifecycle. They use Jest and Supertest, but must NOT mock internal dependencies. They must assert statuses and bodies using explicit Jest `expect()` matchers.

## Goals / Non-Goals

**Goals:**
- Eliminate Supertest from all controller tests inside `apps/backend/src`, converting them into pure Jest unit tests calling methods directly.
- Ensure all integration tests in `apps/backend/test/integration` have explicit Jest `expect()` assertions on Supertest response properties.
- Update both skill instructions (`jest-unit-tests` and `supertest-integration-tests`) with these strict architectural rules.

**Non-Goals:**
- Modifying business logic or controller behavior.

## Decisions

### Decision 1: Pure Unit Tests for Controllers inside `apps/backend/src`
Instead of using Supertest to hit the controller via an HTTP wrapper:
```typescript
// ✘ Forbiden in apps/backend/src
const response = await request(app.getHttpServer()).post('/auth/login').send(dto);
expect(response.status).toBe(201);
```
We will call the controller method directly and assert the result or thrown error:
```typescript
// ✔ Allowed in apps/backend/src
const result = await controller.login(dto);
expect(result).toEqual(expectedResult);
```
If we test validation pipes or guard logic inside unit tests, we test the class instance directly (e.g., `pipe.transform(value)`).

### Decision 2: Pure Integration Tests in `apps/backend/test/integration`
All integration tests using Supertest must use explicit Jest expectations:
```typescript
const response = await request(app.getHttpServer()).get('/v1/catalog/products');
expect(response.status).toBe(200);
expect(response.body.data).toBeDefined();
```
No mock objects of NestJS services, Prisma, or repositories are allowed here.

### Decision 3: Update Skill Guides
- **`jest-unit-tests/SKILL.md`**: Update to explicitly state that unit tests inside `apps/backend/src` must never use Supertest or boot HTTP servers. They must use direct method invocation with mocks.
- **`supertest-integration-test/SKILL.md`**: Update to specify that integration tests inside `apps/backend/test/integration` must use Supertest with native Jest `expect()` assertions and must never mock internal dependencies/databases.

## Risks / Trade-offs

- **Risk**: Rewriting unit tests to call methods directly could miss HTTP-specific validation/pipes if those are not tested elsewhere.
- **Mitigation**: Integration tests in `test/integration` already cover the full HTTP stack (pipes, filters, routing) against the real database.
