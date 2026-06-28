## Context

The system has a partially implemented `CustomersModule` in the NestJS backend and corresponding pages/forms in the Next.js frontend. The deletion logic in the backend currently performs a hard database delete instead of the required soft-delete (`active: false`) and does not prevent deletion when a customer has associated orders. In addition, the frontend lacks integration with toast notifications, showing simple alerts instead.

## Goals / Non-Goals

**Goals:**
* Ensure full CRUD operations for customers are restricted to authenticated admin users on the backend.
* Update backend customer delete endpoint to soft-delete the customer (`active: false`).
* Validate that a customer has no orders before allowing soft-deletion, throwing an HTTP 409 Conflict if they do.
* Connect frontend toast context (`useToast`) to notify users of success or failure (e.g. blocking customer deletion when orders exist).

**Non-Goals:**
* Customer self-registration or login portals (handled by Clerk).
* Order history display within customer detail pages.

## Decisions

### 1. Soft-Delete and Deletion Guard on Backend
* **Decision**: Modify the `remove` method in `CustomersService` to first query `prisma.order.count` for the target `customerId`. If the count is greater than zero, throw a `ConflictException` (HTTP 409). Otherwise, update the customer's `active` field to `false` (soft delete) instead of running a hard `delete`.
* **Alternatives Considered**: 
  * Doing a hard delete and letting database foreign key constraints throw an error. However, we want to soft-delete (set `active: false`) instead of removing the record from the DB, and foreign keys do not protect against soft-deletes.

### 2. Guarding Endpoints with `@Roles('admin')`
* **Decision**: Keep the `@Roles('admin')` decorator on customer CRUD endpoints in `CustomersController`, except for the `/customers/sync` endpoint, which is used for storefront sync on checkout/login.
* **Alternatives Considered**: Using a global guard or scoping at module level, but method decorators are already established in this codebase.

### 3. Frontend Error Handling and Toast Notifications
* **Decision**: Update `CustomerForm.tsx` to use the `useToast` hook from `@/components/ui/toast-context` to display premium success/error messages instead of generic window `alert()`. Ensure frontend catches API error status codes (such as HTTP 409 on deletion) to display appropriate error messages.
* **Alternatives Considered**: Simple `alert()` popups, which fail the premium design guidelines.

## Risks / Trade-offs

* **Risk**: High-volume checkouts while deactivating a customer.
  * **Mitigation**: The deactivation check is performed atomically, and since inactive customers can still have historic orders, the soft-delete prevents future orders while preserving consistency.
