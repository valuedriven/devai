## Context

The current state of the application includes public catalog, customer management, and authentication foundations. However, customers cannot yet place orders, view order histories, or manage their shopping carts. This change introduces a secure, verified, transactional order creation flow.

## Goals / Non-Goals

**Goals:**
- Implement a shopping cart state (add, remove, update quantities) saved locally (localStorage) for persistent sessions.
- Provide a multi-step checkout flow (review cart items, input/confirm shipping address, submit order).
- Enforce strict NestJS backend business logic: validate stock levels, check product status (active only), recalculate order totals dynamically on the backend (do not trust client-side prices), and decrement product stock upon order creation.
- Ensure all customer order endpoints require authentication and restrict customer operations to their own orders (i.e. listing history, viewing details, cancelling unpaid orders).
- Implement order cancellation for orders in the "Novo" state.

**Non-Goals:**
- Payment processing or gateway integration (handled in change-09).
- Guest checkout (all checkout users must be registered customers).
- Real-time shipping costs calculation.
- Coupon or discount code processing.

## Decisions

### Decision 1: Prisma Transaction for Stock Validation and Order Creation
- **Rationale:** To prevent race conditions (e.g. two customers buying the last item simultaneously), we will execute the stock validation, stock decrement, and order/item records within a single database transaction (`prisma.$transaction`).
- **Alternatives Considered:** Client-side pre-check (vulnerable to timing attacks and race conditions).

### Decision 2: Server-Side Price & Active-Status Validation
- **Rationale:** We will fetch the actual active products and their current prices from the database during order creation rather than relying on prices sent by the client. Any inactive product or pricing mismatch will fail the transaction.
- **Alternatives Considered:** Using client-provided totals (insecure, allows malicious price manipulation).

### Decision 3: Order Number Generation
- **Rationale:** Standard format `ORD-<timestamp>-<random>` generated on the server to prevent predictability and collisions.

## Risks / Trade-offs

- **Risk:** High concurrent checkouts could cause database lock contention on products table during transaction.
  - **Mitigation:** Database operations will be fast, and stock is decremented immediately using fine-grained updates on `Product` records.
- **Risk:** Cart out-of-sync with real-time stock/prices prior to checkout.
  - **Mitigation:** Re-validate stock and fetch fresh prices at the exact moment of order submission.
