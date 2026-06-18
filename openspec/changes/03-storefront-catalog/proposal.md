# Proposal: Storefront Catalog & Vitrine (03-storefront-catalog)

## Why

A vitrine de produtos atual é um esqueleto básico. Precisamos implementar a interface da vitrine de acordo com o design system minimalista/corporativo ("estilo Nike/Stripe" definido em `docs/design.md`), permitindo que clientes busquem produtos, filtrem por categorias e visualizem detalhes de estoque.

## What Changes

- **Frontend**:
  - Nova estilização global baseada nos CSS tokens de `globals.css` (sem Tailwind, apenas Vanilla CSS de alta fidelidade).
  - Implementação dos componentes de catálogo: grid de produtos com cards responsivos, barra lateral de categorias e barra de busca integrada.
  - Exibição de tags/badges (ex: "Sem estoque", "Últimas unidades").

## Capabilities

### New Capabilities
- Filtro interativo por categorias e busca por texto integrada na URL (Search Params).
- Exibição visual de status do produto (estoque, inativo, promoção).

### Modified Capabilities
- Página principal `(shop)/page.tsx` totalmente atualizada com o novo layout do design system.

## Impact

- **Frontend**: `apps/frontend/src/app/(shop)/page.tsx`, `apps/frontend/src/components/ui/ProductCard.tsx`, `apps/frontend/src/app/globals.css`

## Escopo Funcional

- RF-01 Vitrine de Produtos: Visualização e navegação de produtos.
- Regra de negócio: Produtos sem estoque podem ser vistos, mas exibem sinalização visual e botão desabilitado.

## Dependências

- `01-catalog-management` (para APIs corretas do catálogo).
- `02-auth-clerk-integration` (para navegação e identificação do perfil de usuário).

## Riscos

- **Problemas de Performance no Carregamento**: Imagens pesadas podem lentificar a página inicial.
  - *Mitigação*: Uso do componente `<Image>` do Next.js com otimização e lazy-loading ativado.

## Plano de Testes

### Testes Unitários Necessários
- **ProductCard Component**:
  - Testar renderização de produtos ativos, com estoque e sem estoque.
  - Testar exibição correta dos preços formatados.

### Testes de Integração Necessários
- **(shop)/page.tsx Page Wrapper**:
  - Validar a passagem correta de `searchParams` do Next.js para o helper de busca e listagem de produtos.

### Testes E2E Necessários
- Playwright E2E validando se o usuário consegue acessar a vitrine, digitar na barra de busca e ver a lista de produtos filtrar corretamente.
