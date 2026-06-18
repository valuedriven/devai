## 1. DTO Validation Refinement

- [ ] 1.1 Add validators (`Min(0)`, `IsNotEmpty`, etc.) to `CreateProductDto` and `UpdateProductDto`
- [ ] 1.2 Add validators to `CreateCategoryDto` and `UpdateCategoryDto`
- [ ] 1.3 Ensure NestJS validation pipe transforms and validates inputs automatically in `main.ts` or controllers

## 2. Service Filtering & business logic

- [ ] 2.1 Update `ProductService.findAll` to accept a `publicView` flag and filter `active = true` and `category.active = true`
- [ ] 2.2 Adjust `ProductController` routes to map public vs admin search/list routes

## 3. Testing & Coverage

- [ ] 3.1 Implement unit tests in `product.service.spec.ts` for validation and visibility filtering logic
- [ ] 3.2 Implement integration tests in `product.controller.spec.ts` and `category.controller.spec.ts` verifying API HTTP codes
- [ ] 3.3 Run `npm run test:unit` and `npm run test:integration` to ensure 80% coverage on catalog module
