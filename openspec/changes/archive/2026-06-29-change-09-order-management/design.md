## Context

The current system implements basic order creation. This change focuses on the administrative lifecycle of an order, requiring a robust state machine, manual payment registration for the MVP, and a comprehensive audit trail for compliance and support. 

The system uses NestJS, Prisma, and PostgreSQL. State transitions must be strictly enforced to prevent invalid business flows.

## Goals / Non-Goals

**Goals:**
- Implement a strict order state machine (New → Paid → Preparation → Invoiced → Shipped → Delivered).
- Enable manual payment registration by admins.
- Automated status transition to "Paid" when a payment is confirmed.
- Centralized audit logging for all order status changes using NestJS events.
- Admin UI for managing order lifecycle and viewing history.

**Non-Goals:**
- Automatic payment gateway (Stripe/Pix) integration.
- Automated invoicing (PDF generation).
- Shipping carrier API integration.
- Customer-facing payment portal.

## Decisions

### 1. State Machine Enforcement
**Choice**: Service-level validation in `OrderManagementService`.
**Rationale**: Explicit service validation provides the best balance of type-safety and flexibility. We will define a valid transition map to prevent invalid jumps.
**Alternatives**: Database triggers (harder to maintain) or XState (overkill for this linear flow).

### 2. Audit Log Implementation
**Choice**: Dedicated `AuditLog` table with a generic structure (`entityType`, `entityId`, `action`, `payload`, `userId`). Use NestJS `EventEmitter2` to decouple auditing from business logic.
**Rationale**: Allows auditing any future entity without bloating the Order domain logic.

### 3. Payment to Order Coupling
**Choice**: Explicit `Payment` entity linked to `Order`.
**Rationale**: Supports auditability and keeps a clear history of transaction attempts.

## Risks / Trade-offs

- **[Risk] Race conditions in payment confirmation** → **Mitigation**: Use Prisma interactive transactions (`$transaction`) to ensure order status and payment status are updated atomically.
- **[Risk] Audit log growth** → **Mitigation**: Ensure the audit log is indexed correctly by `entityId` and `createdAt`.
- **[Risk] Complex state jumps** → **Mitigation**: The transition map will explicitly forbid any "To" state that isn't the direct successor or "Cancelled".
