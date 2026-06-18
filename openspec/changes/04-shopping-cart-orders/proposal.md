# Proposal: Shopping Cart & Order Placement (04-shopping-cart-orders)

## Why

Para permitir que os clientes realizem compras, o sistema necessita de uma gestão local de carrinho de compras (carrinho de compras do cliente no frontend) e uma API robusta de checkout no backend que realize a validação de quantidade e estoque atômico de produtos antes de criar o pedido.

## What Changes

- **Frontend**:
  - Criação do estado e hook customizado de Carrinho de Compras (`useCart`) sincronizado com o LocalStorage.
  - Página `/cart` com listagem de itens selecionados, manipulação de quantidade, recálculo automático de total e botão para confirmação do pedido.
- **Backend**:
  - Rota de checkout `POST /orders` com validações críticas de estoque (usando transações Prisma para garantir atomicidade).
  - Atualização do estoque do produto após a confirmação bem-sucedida do pedido.

## Capabilities

### New Capabilities
- Carrinho de compras persistente.
- Processo de criação de pedido com validação atômica de estoque.

### Modified Capabilities
- Nenhuma.

## Impact

- **Frontend**: `apps/frontend/src/app/(shop)/cart/page.tsx`, `apps/frontend/src/hooks/useCart.ts`
- **Backend**: `apps/backend/src/modules/orders/services/orders.service.ts`

## Escopo Funcional

- RF-02: Criação de Pedidos e recálculo automático de totais.
- RN: Bloquear inclusão de quantidade superior ao estoque e validar novamente na confirmação do pedido.

## Dependências

- `03-storefront-catalog` (Vitrine de produtos com botões "Adicionar ao Carrinho").

## Riscos

- **Corrida de Estoque (Race Conditions)**: Dois clientes finalizando pedidos ao mesmo tempo com apenas uma unidade em estoque.
  - *Mitigação*: Uso de transações Prisma com bloqueio/validação no nível do banco e verificação atômica de estoque.

## Plano de Testes

### Testes Unitários Necessários
- **useCart Hook**:
  - Testar adição, alteração de quantidade e remoção de itens.
  - Verificar recálculo automático dos valores totais no cliente.

### Testes de Integração Necessários
- **OrdersService checkout**:
  - Testar criação de pedido válido (Happy Path).
  - Testar falha na criação de pedido por falta de estoque (Sad Path).
  - Testar transações concorrentes e integridade dos dados de estoque.

### Testes E2E Necessários
- Playwright E2E simulando a adição de produtos ao carrinho, ajuste de quantidade, navegação até a tela de carrinho e finalização do pedido.
