# Proposal: Payment Registry & Status Transitions with Audit (07-payment-transitions-audit)

## Why

Para operar as vendas, o administrador precisa atualizar o status dos pedidos e registrar manualmente os pagamentos dos clientes. Conforme a especificação, as transações de status devem seguir regras estritas e todas as mudanças operacionais devem registrar um log de auditoria completo.

## What Changes

- **Backend**:
  - Máquina de Estados no `OrdersService` para validar as transações de status permitidas (Novo -> Pago -> Preparação -> Faturado -> Despachado -> Entregue).
  - Tabela `AuditLog` no banco e serviço de auditoria para capturar e registrar toda operação crítica (Mudança de status, registro de pagamento).
  - Endpoint de registro de pagamento `POST /orders/:id/payments`.
- **Frontend**:
  - Tela de detalhe de pedido do administrador `/admin/orders/[id]` com controles para registrar pagamento e avançar o status.

## Capabilities

### New Capabilities
- Registro manual de pagamento (dinheiro, pix, cartão).
- Transições de estados de pedido auditadas automaticamente.

### Modified Capabilities
- Controle de status do pedido pelo administrador.

## Impact

- **Backend**: `apps/backend/src/modules/orders/`, `apps/backend/src/core/audit/`
- **Frontend**: `apps/frontend/src/app/(admin)/orders/`

## Escopo Funcional

- RF-06 Gestão de Pedidos: Acompanhar pedidos por status e registrar pagamentos associados.
- RNF-02 Auditoria: Toda alteração de status deve registrar quem fez, o que foi alterado e o timestamp.

## Dependências

- `05-customer-orders-history` e `06-admin-management-panels`.

## Riscos

- **Transição de Status Inválida**: Pedido pulando etapas sem passar pelo fluxo correto (ex: ir de Novo direto para Despachado sem confirmação de pagamento).
  - *Mitigação*: Lógica centralizada de validação de máquina de estados no `OrdersService.updateStatus` lançando erro em transações inválidas.

## Plano de Testes

### Testes Unitários Necessários
- **State Machine Validator**:
  - Testar transições válidas (Novo -> Pago).
  - Testar transições inválidas (Novo -> Despachado) e garantir o lançamento de exceção.
- **AuditService**:
  - Verificar se a criação do log de auditoria popula corretamente usuário, objeto, ação e payload.

### Testes de Integração Necessários
- **Payment API**:
  - Testar o fluxo de registro de pagamento e garantia de que o pedido passa para o status "Pago".

### Testes E2E Necessários
- Playwright E2E simulando a alteração de status de um pedido no painel de administração e o subsequente registro de pagamento, confirmando a atualização visual na tela.
