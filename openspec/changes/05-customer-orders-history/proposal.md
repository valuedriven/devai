# Proposal: Customer Orders & History (05-customer-orders-history)

## Why

Uma vez que o cliente pode realizar pedidos, ele necessita de transparência para acompanhar o andamento dos mesmos. Esta mudança implementa as telas de listagem de histórico e detalhe do pedido para o cliente autenticado, além de habilitar a regra de negócio que permite ao cliente cancelar um pedido caso este ainda não tenha sido pago.

## What Changes

- **Frontend**:
  - Tela `/orders` contendo a lista dos pedidos vinculados ao e-mail do usuário autenticado.
  - Tela `/orders/[id]` com detalhes do pedido (produtos, quantidades, preços históricos e status atual).
  - Botão "Cancelar Pedido" visível apenas para pedidos com status "Novo" (aguardando pagamento).
- **Backend**:
  - API de cancelamento de pedidos pelo cliente (`PATCH /orders/:id/cancel`).
  - Restrição de segurança: clientes só podem ver ou alterar seus próprios pedidos.

## Capabilities

### New Capabilities
- Histórico de pedidos do cliente.
- Cancelamento autônomo de pedidos não pagos pelo cliente.

### Modified Capabilities
- Segurança aprimorada na consulta de detalhes de pedidos no BFF.

## Impact

- **Frontend**: `apps/frontend/src/app/(shop)/orders/page.tsx`, `apps/frontend/src/app/(shop)/orders/[id]/page.tsx`
- **Backend**: `apps/backend/src/modules/orders/controllers/orders.controller.ts`, `apps/backend/src/modules/orders/services/orders.service.ts`

## Escopo Funcional

- RF-02: Visualizar histórico de pedidos e cancelar pedidos ainda não pagos.
- Regra de negócio: Pedidos cancelados não podem voltar ao fluxo operacional e o estoque reservado correspondente deve ser liberado (devolvido ao produto).

## Dependências

- `04-shopping-cart-orders` (criação de pedidos funcional).

## Riscos

- **Vazamento de Informação (IDOR)**: Um cliente acessando dados do pedido de outro cliente alterando o ID na URL.
  - *Mitigação*: Validação estrita no BFF NestJS (`orders.controller.ts`), rejeitando requisições cujo e-mail do pedido não coincida com o e-mail do JWT do Clerk.

## Plano de Testes

### Testes Unitários Necessários
- **OrdersService.cancel**:
  - Testar se o cancelamento de um pedido "Novo" funciona e repõe o estoque do produto.
  - Testar se tentar cancelar um pedido "Pago" lança erro.

### Testes de Integração Necessários
- **OrdersController permissions**:
  - Validar que requisição com e-mail incompatível retorna erro 404/403.
  - Validar o filtro correto de listagem de pedidos baseado no usuário logado.

### Testes E2E Necessários
- Playwright E2E realizando login, acessando a listagem de pedidos, verificando o status e testando o cancelamento de um pedido recém-criado.
