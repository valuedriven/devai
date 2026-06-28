## Context

The system needs a way to manage products, which are the core items sold in the catalog. The `Product` model is already defined in the database schema (`apps/backend/src/database/prisma/schema.prisma`), including fields like `name`, `price`, `stock`, `imageUrl`, and a relation to `Category`. This change introduces the backend CRUD endpoints, input validations, image upload capabilities, and the frontend management interfaces for administrators.

## Goals / Non-Goals

**Goals:**
- Implement the `ProductModule` in the NestJS backend with CRUD endpoints for admins.
- Ensure strict input validation for products (e.g. `price > 0`, `stock >= 0`).
- Validate category references (the assigned category must exist and be active).
- Implement an image upload strategy (saving files locally and storing the URL stub in the database).
- Create the Next.js frontend pages for listing, creating, and editing products.
- Enforce admin-only access for all product management operations.

**Non-Goals:**
- Advanced image processing like cropping or resizing.
- Support for product variants (e.g., sizes, colors).
- Real-time inventory tracking and history logs.
- Bulk product imports via CSV.

## Decisions

**1. Image Storage Strategy**
- **Decision:** Implement a local file upload endpoint for the MVP (`/v1/admin/products/upload`).
- **Rationale:** Storing images locally as files and keeping a URL stub (e.g., `/uploads/product-image.jpg`) in the database keeps the database lightweight and performant. Base64 strings inflate database size and degrade performance over time. This approach sets up the necessary multipart/form-data handling on the frontend and backend, making a future transition to S3 relatively seamless.

**2. Category Validation**
- **Decision:** Inject `CategoryService` into `ProductService` to validate category assignment.
- **Rationale:** Products belong to Categories. To prevent orphans or invalid state, the backend must verify the category `id` exists and its `active` flag is true during product creation or updates. This ensures data integrity directly at the business logic layer without relying solely on foreign key constraints (which don't check for `active` status).

**3. Frontend Architecture**
- **Decision:** Use Next.js App Router with server actions and React state for image previews.
- **Rationale:** Separating the product list (`/admin/products`), creation form (`/admin/products/new`), and edit form (`/admin/products/[id]/edit`) provides clear distinct pages. The product form will use a generic file input and manage image preview state locally before submitting the multipart payload to the backend API.

## Risks / Trade-offs

- **Risk:** Local Image Storage limits horizontal scaling if the backend runs in multiple containers. 
  - **Mitigation:** Acknowledge this limitation for MVP. The `imageUrl` schema and upload endpoint abstraction isolate the storage logic, so transitioning to S3/Object Storage later will only require updating the `upload` endpoint implementation, not the core Product logic.
- **Risk:** Category deletions could affect products.
  - **Mitigation:** The database schema sets `onDelete: NoAction` for the relation, and we soft-delete categories (`active=false`), which prevents data integrity errors.

## Migration Plan

- No database migrations are required as the `Product` model is already mapped in Prisma.
- Deploy backend changes (ProductModule).
- Deploy frontend changes (Admin product pages).

## Open Questions

- Should we implement an image cleanup job for orphaned images (e.g., when a product is deleted, delete the file)? For MVP, we will leave the files on disk.
