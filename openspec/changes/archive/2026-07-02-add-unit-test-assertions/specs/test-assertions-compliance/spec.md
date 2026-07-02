## ADDED Requirements

### Requirement: Unit Test Isolation
All unit test scripts located under `apps/backend/src` MUST use only Jest and mock objects. They SHALL NOT use Supertest (`supertest`) or instantiate an HTTP server to test controller methods.

#### Scenario: Controller unit test method call
- **WHEN** a unit test for a controller is executed
- **THEN** it must call the controller's methods directly and assert the returned value or thrown exception, using Jest mocks for any injected dependency

### Requirement: Integration Test Completeness
All integration test scripts located under `apps/backend/test/integration` MUST use Jest and Supertest, and SHALL NOT mock any internal NestJS service, database component, or repository. Every test case MUST contain at least one explicit Jest `expect()` assertion on the Supertest response.

#### Scenario: Controller integration test HTTP request
- **WHEN** an integration test executes an HTTP request using Supertest
- **THEN** it must assert the response using a Jest expectation (e.g. `expect(response.status).toBe(200)`) against the real database without mocks
