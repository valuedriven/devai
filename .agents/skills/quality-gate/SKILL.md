---

name: quality-gate
description: >
Ensures that every implementation meets the mandatory quality criteria before being considered complete.
Use this skill whenever implementing any feature, fixing bugs, refactoring code, or making any change involving business rules.
It must also be triggered when the user asks to "finish a task", "commit", "create a PR", "review code", or any variation of "complete" an implementation.
This skill is MANDATORY and must be consulted for every development task — never consider a task completed without executing the full pipeline described here.
--------------------------------------------------------------------------------------------------------------------------------------------------------------

# Quality Gate

This skill defines the mandatory quality pipeline that every AI agent must follow before considering any task complete.

> **Absolute rule:** A task is considered complete **only** when all stages of the pipeline below have been successfully executed.

---

## Mandatory Pipeline

Always execute in the following order:

```text
1. ESLint                  → zero errors allowed
2. Unit Tests              → all passing
3. Integration Tests       → all passing
4. E2E Tests (when applicable) → zero critical failures
5. Coverage Verification   → minimum thresholds achieved
```

### Reference Commands

```bash
# Lint
npx eslint .

# Unit tests
npx jest --testPathPattern="unit|spec" --coverage

# Integration tests
npx jest --testPathPattern="integration" --coverage

# E2E tests
npx playwright test

# Consolidated coverage
npx jest --coverage --coverageReporters=text-summary
```

> Exact commands may vary by project. Check `package.json` for the configured scripts (e.g., `npm run test`, `npm run test:unit`, `npm run lint`).

---

## Minimum Coverage Requirements

| Layer    | Lines | Branches |
| -------- | ----- | -------- |
| Backend  | 80%   | 80%      |
| Frontend | 70%   | 70%      |

If coverage is below the minimum threshold, **write more tests** before completing the task.

---

## Testing Guidelines by Layer

### Unit Tests (Backend Only)

* Validate business rules, services, use cases, and components **in isolation**
* Use mocks for external dependencies (databases, APIs, etc.)
* **Must not** be created for the frontend

### Integration Tests (Backend REST API Only)

* Validate endpoints, data persistence, authentication, and authorization
* Validate integration between backend components
* Use a real test database or an in-memory database
* Tools: Jest + Supertest

### E2E Tests (Critical User Flows)

* Validate the application from the user's perspective
* Cover frontend ↔ backend ↔ external service integrations
* Tool: Playwright
* Focus on the most important business workflows

### What Every Test Should Cover (When Applicable)

* ✅ Happy Path — primary flow working correctly
* ✅ Failure Path — expected errors handled correctly
* ✅ Relevant Edge Cases — boundaries and extreme values

---

## When to Create or Update Tests

| Situation                  | Required Action                             |
| -------------------------- | ------------------------------------------- |
| New business rule          | Create unit tests (backend)                 |
| New REST endpoint          | Create integration tests                    |
| New critical user workflow | Create/update E2E tests                     |
| Business rule modification | Update existing tests in the affected layer |
| Bug fix                    | Add a test that reproduces the fixed bug    |
| Refactoring                | Ensure existing tests continue to pass      |

---

### Mocking Rules for Unit Tests

- Unit tests MUST execute in complete isolation from external systems.
- All infrastructure dependencies MUST be mocked, including:
  - Databases and repositories
  - External APIs and SDKs
  - Message brokers and queues
  - Cache providers
  - File storage services
  - Email and notification services
- Use NestJS Dependency Injection to replace providers with mocks in the testing module.
- Use Jest (`jest.fn`, `jest.spyOn`, `jest.mock`) as the standard mocking framework.
- Unit tests MUST NOT perform network calls, database access, file system operations, or communication with external services.
- Mock only direct dependencies of the unit under test.
- Avoid complex mocks that replicate production behavior; integration between components must be validated through integration tests.
- Mocks should be deterministic and explicitly configured within each test scenario.

## Completion Checklist

Before declaring a task complete, confirm:

* [ ] ESLint executed — **zero errors**
* [ ] Unit tests created/updated for the affected layer
* [ ] Integration tests created/updated for affected APIs
* [ ] E2E tests created/updated for impacted critical workflows
* [ ] All tests passing — **zero failures**
* [ ] Backend coverage ≥ 80% lines and branches
* [ ] Frontend coverage ≥ 70% lines and branches
* [ ] No critical failures in applicable E2E tests

---

## Blocking Conditions — Do Not Complete If:

* ❌ Lint errors exist
* ❌ Any test is failing
* ❌ Coverage is below the required minimum
* ❌ Critical failures exist in E2E tests

**Fix all identified issues before finalizing.**

---

## Agent Workflow

```text
implement change
       ↓
create/update tests for the affected layer
       ↓
run lint → fix errors → repeat until zero errors
       ↓
run unit tests → fix failures → repeat until all pass
       ↓
run integration tests → fix failures → repeat until all pass
       ↓
run E2E tests (when applicable) → fix critical failures
       ↓
verify coverage → write additional tests if below threshold
       ↓
✅ task completed
```

---

## Quick Tool Reference

| Category    | Tool             | Layer         |
| ----------- | ---------------- | ------------- |
| Lint        | ESLint           | All           |
| Unit        | Jest             | Backend       |
| Integration | Jest + Supertest | Backend (API) |
| E2E         | Playwright       | Full-stack    |
