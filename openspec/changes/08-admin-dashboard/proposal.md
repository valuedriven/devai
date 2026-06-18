# Proposal: Admin Dashboard & Metrics (08-admin-dashboard)

## Why

Para que o administrador avalie a performance financeira e operacional da empresa, é necessário um painel consolidado com indicadores de vendas totais, valores recebidos e pendentes, filtrados por período, conforme o RF-07.

## What Changes

- **Backend**:
  - Novo serviço no módulo de pedidos (ou módulo exclusivo de dashboard) para agregar dados de vendas, pagamentos e valores pendentes a partir do banco de dados.
  - Endpoint `GET /dashboard/stats` com query params de `startDate` e `endDate`.
- **Frontend**:
  - Tela principal do dashboard `/admin/dashboard` com cards KPI e gráficos minimalistas, seletor de data (padrão 30 dias) e botões de atualização de dados.

## Capabilities

### New Capabilities
- Dashboard financeiro consolidado com filtros de período dinâmicos.

### Modified Capabilities
- Nenhuma.

## Impact

- **Backend**: `apps/backend/src/modules/orders/services/dashboard.service.ts`, `apps/backend/src/modules/orders/controllers/dashboard.controller.ts`
- **Frontend**: `apps/frontend/src/app/(admin)/dashboard/page.tsx`

## Escopo Funcional

- RF-07: Painel com Vendas Totais, Recebido e Pendente, atualizado por filtro de período.

## Dependências

- `07-payment-transitions-audit` (para que existam pagamentos válidos registrados).

## Riscos

- **Inconsistência nos Totais Financeiros**: Cálculos errados ao somar valores ou desconsiderar pedidos cancelados.
  - *Mitigação*: Lógica de agregação com filtros explícitos (excluir pedidos cancelados no cálculo de vendas totais) coberta por testes rigorosos.

## Plano de Testes

### Testes Unitários Necessários
- **DashboardService Calculations**:
  - Validar cálculo do total de vendas (ignorando cancelados).
  - Validar soma de valores recebidos (pagamentos confirmados).
  - Validar valores pendentes (pedidos sem pagamentos confirmados).

### Testes de Integração Necessários
- **Dashboard Endpoints**:
  - Testar resposta com dados válidos no range de datas correto.
  - Testar erro em parâmetros de data inválidos.

### Testes E2E Necessários
- Playwright E2E logando como administrador, acessando a tela de dashboard, alterando o filtro de data e verificando se os valores dos cards de KPI são atualizados dinamicamente.
