# Order Management Specification

## ADDED Requirements

### Requirement: Order State Machine
The system SHALL strictly enforce order state transitions according to the defined lifecycle.

| From | To |
|------|----|
| Novo | Pago |
| Pago | Preparação |
| Preparação | Faturado |
| Faturado | Despachado |
| Despachado | Entregue |
| Qualquer (exceto Entregue) | Cancelado |

#### Scenario: Valid Transition
- **WHEN** admin transitions order from "Pago" to "Preparação"
- **THEN** system SHALL update order status and record an audit event.

#### Scenario: Invalid Transition
- **WHEN** admin transitions order from "Novo" to "Despachado"
- **THEN** system SHALL reject the request with a 422 Unprocessable Entity error.

### Requirement: Payment Registration
The system SHALL allow admins to manually register payments for an order.

#### Scenario: Payment triggers status update
- **WHEN** admin registers a payment with status "Confirmed"
- **THEN** the linked order SHALL automatically transition to "Pago" status.

### Requirement: Audit Log
The system SHALL record an audit entry for every order status change.

#### Scenario: Audit entry creation
- **WHEN** any order status transition occurs
- **THEN** an audit record MUST be created containing the user, timestamp, previous status, and new status.
