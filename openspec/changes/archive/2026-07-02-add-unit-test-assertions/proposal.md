## Why

Currently, some controller tests located under `apps/backend/src` use Supertest (`request(app.getHttpServer())...`) and mock providers. These are hybrid tests.
To enforce a clean architectural boundary and ensure code quality:
1. **Unit tests** (located under `apps/backend/src`) must use ONLY Jest and mocks. They must instantiate/retrieve controllers/services and invoke methods directly. They must NOT use Supertest or spin up an HTTP server wrapper.
2. **Integration tests** (located under `apps/backend/test/integration`) must use Jest and Supertest to validate the full HTTP request lifecycle against a real database. They must NOT mock internal collaborators or databases (no mocks for internal providers, only for outbound third-party integrations). Every test case here must include explicit Jest `expect()` assertions on the Supertest responses.

This architecture satisfies SonarQube's assertion rules while maintaining clean isolation between unit and integration test layers.

## What Changes

- Refactor all controller test scripts in `apps/backend/src` to call the controller methods directly with mocks. Remove all Supertest imports and `request(...)` calls from `apps/backend/src`.
- Refactor all integration test scripts in `apps/backend/test/integration` to use explicit Jest assertions (`expect(response.status).toBe(STATUS_CODE)`) in their Supertest suites.
- Update `jest-unit-tests` skill guidelines to explicitly forbid the use of Supertest inside `apps/backend/src` (only Jest and mocks allowed).
- Update `supertest-integration-tests` skill guidelines to explicitly require Jest `expect()` assertions on Supertest responses, and reinforce that no internal mocks should be used.

## Capabilities

### New Capabilities
- `test-assertions-compliance`: Enforce clean testing boundaries: pure unit tests (using only Jest/mocks in `src/`) and complete integration tests (using Jest/Supertest/no-internal-mocks in `test/integration/`) with explicit Jest assertions.

### Modified Capabilities
