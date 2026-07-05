# AGENTS.md

# Rule Precedence

When instructions conflict, apply them in the following order:

1. Security
2. Architecture
3. Correctness
4. Simplicity
5. Developer Experience

---

# Purpose

This document contains the permanent operating rules that apply to nearly every development task in this repository.

Task-specific procedures (testing, Playwright, Docker, Prisma, infrastructure, etc.) must be loaded from dedicated skill files only when required.

---

# 1. Core Principles

## Think Before Acting

Before implementing:

- Understand the request.
- Identify assumptions.
- Present alternatives when meaningful.
- Ask for clarification when requirements are ambiguous.

Never begin implementation without understanding the problem.

---

## Simplicity First

Always prefer:

- Existing patterns
- Small changes
- Straightforward implementations

Avoid:

- Premature abstraction
- Speculative features
- Unnecessary refactoring

---

## Surgical Changes

Modify only the files directly related to the requested work.

Avoid unrelated:

- formatting
- renaming
- refactoring

Keep pull requests focused.

---

## Goal-Oriented Development

Whenever practical:

1. Understand the problem.
2. Update or create automated tests.
3. Implement the solution.
4. Validate the result.

---

# 2. Architecture

## Frontend

Technology

- Next.js (App Router)
- TypeScript
- Vanilla CSS

Responsibilities

- Rendering
- User interaction
- API consumption

Forbidden

- Business rules
- Authorization
- Database access
- Prisma

The frontend is a presentation layer only.

---

## Backend

Technology

- NestJS
- Prisma
- PostgreSQL

Responsibilities

- Business rules
- Validation
- Authorization
- Persistence

All business decisions belong to the backend.

---

## Database

Requirements

- PostgreSQL
- Prisma migrations
- Versioned schema changes

Never:

- modify production schemas manually
- introduce database-specific features that reduce portability

The application must remain portable across local Docker environments and managed PostgreSQL providers.

---

# 3. Repository Structure

```text
apps/
    frontend/
    backend/

docs/
```

Follow existing project conventions before introducing new structures.

---

# 4. Development Workflow

For non-trivial tasks:

## Analysis

- Understand requirements
- Inspect affected files
- Identify risks

## Planning

Describe:

- files to modify
- implementation strategy
- validation approach

## Implementation

Make the smallest change that satisfies the requirement.

## Validation

Run only the validation steps applicable to the modified code.

## Report

Summarize:

- implemented changes
- validation performed
- remaining risks
- assumptions

---

# 5. Terminal Operations

Commands should be:

- reproducible
- deterministic
- non-interactive

Prefer explicit working directories instead of chained `cd` commands.

Avoid starting long-running processes unless explicitly requested.

---

# 6. Quality Standards

A task is complete only when:

- requirements are satisfied
- relevant automated validation succeeds
- no known regression has been introduced

Whenever applicable:

- update automated tests
- execute the project's validation commands
- resolve validation failures before completion

---

# 7. Documentation

Before implementing significant changes, consult the relevant project documentation.

Typical references include:

| Document | Purpose |
|-----------|---------|
| Product Requirements | Business behavior |
| Technical Specification | Architecture and implementation decisions |
| UI Specification | Interface behavior |
| Design System | Visual consistency |

Project documentation always takes precedence over assumptions.

---

# 8. External Knowledge

When framework or library behavior is uncertain, consult authoritative documentation instead of relying on memory.

Preferred sources:

- Context7 for framework APIs
- Official documentation
- Official RFCs
- Vendor documentation

---

# 9. Continuous Improvement

If you identify recurring corrections, outdated guidance, or missing project conventions, propose improvements to this AGENTS.md.

The configuration should evolve together with the project.

---

# Skill Loading

Load specialized skills only when required by the current task.

Examples:

| Skill | When to Load |
|--------|--------------|
| backend-testing | Implementing backend tests |
| playwright-testing | Writing or modifying E2E tests |
| docker | Container or infrastructure work |
| prisma | Database schema or migration changes |
| environment | Environment configuration |
| architecture | Large architectural modifications |

---

# Environment

This repository uses a single `.env` file located at the project root.

Frontend and backend must load configuration from this shared file.

Do not create module-specific `.env` files unless the project architecture explicitly changes.