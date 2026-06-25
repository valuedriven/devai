# 07 — Public Catalog (Vitrine)

## Summary

Public-facing product showcase. No authentication required. Products can be browsed by category, searched, and viewed in detail. Inactive or out-of-stock products are handled according to business rules.

## Functional Scope

### Backend

- `GET /v1/catalog/products` — list active products (pagination, search, category filter)
- `GET /v1/catalog/products/:id` — product detail (public)
- `GET /v1/catalog/categories` — list active categories
- Only active products are returned
- Out-of-stock products are visible but flagged
- Public endpoint (no auth guard)

### Frontend

- Product grid/list view with cards (image, name, price)
- Category sidebar or filter
- Search bar
- Product detail page (image, description, price, stock status)
- "Out of stock" badge on product cards
- Responsive layout (mobile + desktop)

## Dependencies

- Change 05 (Product Management) — products must exist

## Risks

| Risk | Level | Mitigation |
|------|-------|------------|
| Performance with many products | Low | Pagination is mandatory |
| No auth — safe | Low | Read-only public data |

## Quality Gates

### Linter

- `npm run lint` — both workspaces

### Unit Tests

- **Coverage**: Minimum 80% coverage (statements, branches, functions, lines).

- `CatalogService` — product listing, filtering by category, search
- Edge cases: empty catalog, only inactive products, out-of-stock flag

### Integration Tests

- **Coverage**: Minimum 80% coverage (statements, branches, functions, lines).

- `GET /v1/catalog/products` — returns only active products
- `GET /v1/catalog/products/:id` — returns product detail
- `GET /v1/catalog/categories` — returns only active categories
- No auth required (public access)

### E2E Tests

- **Planning**: Use `.agents/prompts/playwright-test-planner.md`
- **Generation**: Use `.agents/prompts/playwright-test-generator.md`

- Browse catalog as unauthenticated user
- Search for products
- Filter by category
- View product detail
- Out-of-stock product shows correct badge

## Out of Scope

- "Add to cart" button (covered in Change 08)
- Product recommendations (future)
- Advanced search/faceted search (future)
- Product reviews/ratings (future)
