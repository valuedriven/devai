## Context

The public catalog (Vitrine) provides a storefront for guest users and authenticated customers to browse active products, search for items, filter by category, and view detailed product specifications. Authentication is not required for these operations.

## Goals / Non-Goals

**Goals:**
* Provide a public, high-performance product browsing grid with support for category filters, search queries, and pagination.
* Enable full public access to product detail pages showing inventory status (flagging out-of-stock items with distinct styling).
* Implement appropriate unit tests for business logic (`CatalogService` equivalent services in `apps/backend/src/modules/products/services/`) and integration/E2E test suites with at least 80% coverage.

**Non-Goals:**
* Add-to-cart state management or checkout flow integration (reserved for Change 08).
* Advanced product recommendation engines or user-specific rating features.

## Decisions

### 1. Reuse Existing Public API Endpoints
* **Decision**: We will utilize the existing backend endpoints `/api/v1/products` and `/api/v1/categories` exposed by `PublicProductsController` and `PublicCategoriesController`.
* **Rationale**: These endpoints already enforce that only active products/categories are returned and are fully configured for public (unauthenticated) access. No additional controller refactoring is required.
* **Alternatives Considered**: Creating new paths like `/api/v1/catalog/...`. This was rejected because it introduces route duplication and increases maintenance overhead without operational benefits.

### 2. Frontend Filter, Search, and Pagination Integration
* **Decision**: Enhance `(shop)/page.tsx` to handle `searchParams` for categories and pagination, linking them to backend parameters.
* **Rationale**: This adheres to Next.js server-side data fetching standards by reading query params directly in RSCs, ensuring search engine indexability and shareable URLs.

## Risks / Trade-offs

* **Risk**: Performance degradation under high traffic since public endpoints are unauthenticated.
  * **Mitigation**: Rely on query-based pagination (`limit` and `page` parameters) and verify database indexing on `Product(active, categoryId, name)`.
