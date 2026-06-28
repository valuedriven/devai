## Context

The backend currently maintains duplicate controllers for products and categories: legacy singular ones (`category.controller.ts`, `product.controller.ts`) and modern plural ones (`categories.controller.ts`, `products.controller.ts`). The modern plural controllers are mapped to `admin/` paths and secured with roles. We need to remove the singular ones to reduce technical debt while preserving the public endpoints for the storefront frontend.

## Goals / Non-Goals

**Goals:**
- Completely remove `category.controller.ts`, `product.controller.ts`, their services and DTOs.
- Provide a clean way for the storefront to access public catalog data (products and categories) without requiring an admin token.

**Non-Goals:**
- Refactor the database schema or Prisma models.
- Change the structure of the admin endpoints or their authentication mechanisms.

## Decisions

1. **Add Public Controllers to Products Module**
   - **Rationale**: Instead of creating a separate `catalog` module, we will add explicit public controllers (`public-products.controller.ts` and `public-categories.controller.ts`) to the existing `ProductsModule`. These controllers will be mapped to `api/v1/products` and `api/v1/categories`. This approach keeps all product-related logic cohesive within a single module while cleanly separating the Admin API from the Public API at the controller level.

2. **Frontend Updates**
   - **Rationale**: Update `src/lib/data.ts` to ensure it requests from the correct public API endpoints rather than accidentally requesting the `/admin/` paths.

## Risks / Trade-offs

- **Risk**: Test failures in existing E2E tests (`api-endpoints-publicos.spec.ts`) that rely on exact paths or data shapes.
  - **Mitigation**: Update the E2E tests to reflect the new endpoints and ensure all tests pass before completing the task.
