## Why

The backend `products` module currently contains legacy singular controllers, DTOs, and services (`category.controller.ts`, `product.controller.ts`, etc.) which are redundant since the application now uses plural controllers (`categories.controller.ts` and `products.controller.ts`). This change removes the legacy code to clean up the backend architecture while ensuring the storefront frontend remains functional by updating the required public API endpoints.

## What Changes

- Remove legacy singular controllers (`category.controller.ts`, `product.controller.ts`) and their corresponding services and DTOs.
- Update `products.module.ts` to remove references to the deleted files.
- Introduce explicit public endpoints in the backend (e.g. `PublicProductsController` and `PublicCategoriesController`) to replace the lost `GET /api/v1/products` and `GET /api/v1/categories` routes, allowing the storefront to fetch active products and categories.
- Update frontend data fetching (`src/lib/data.ts`) to point to the new public endpoints.
- Update E2E tests (`api-endpoints-publicos.spec.ts`) to match the new endpoints.

## Capabilities

### New Capabilities
- `storefront-catalog`: Expose public endpoints for querying active products and categories for the storefront, replacing the legacy singular controller endpoints.

### Modified Capabilities
- `category-api`: Define explicit public routes and ensure plural endpoints remain intact.

## Impact

- **Backend**: Removed legacy files in `src/modules/products`. Added new public controllers to handle storefront requests.
- **Frontend**: Updated `src/lib/data.ts` to use correct public API endpoints for `getProducts()`, `getProduct()`, and `getCategories()`. E2E tests in `api-endpoints-publicos.spec.ts` will be updated.
