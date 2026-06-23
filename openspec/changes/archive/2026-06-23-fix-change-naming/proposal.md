# fix-change-naming

## Summary

Renomear os diretórios de change para usar o prefixo "change-" seguido do número sequencial, corrigindo o erro do CLI "Change name must start with a letter" que ocorre quando o nome começa com número.

## What Changes

- Renomear 10 diretórios de change ativos:
  - `02-frontend-foundation` → `change-02-frontend-foundation`
  - `03-auth-security` → `change-03-auth-security`
  - `04-category-management` → `change-04-category-management`
  - `05-product-management` → `change-05-product-management`
  - `06-customer-management` → `change-06-customer-management`
  - `07-public-catalog` → `change-07-public-catalog`
  - `08-order-creation` → `change-08-order-creation`
  - `09-order-management` → `change-09-order-management`
  - `10-dashboard-base` → `change-10-dashboard-base`
  - `11-dashboard-filter` → `change-11-dashboard-filter`

- Renomear 1 diretório de change arquivado:
  - `01-backend-foundation` → `change-01-backend-foundation`

- Nenhuma alteração em conteúdo interno dos diretórios (proposal.md, design.md, tasks.md permanecem intactos).

## Capabilities

- **New Capabilities**: Nenhuma
- **Modified Capabilities**: Nenhuma (mudança puramente estrutural/infra do OpenSpec)

## Impact

- Apenas renomeação de diretórios em `openspec/changes/` e `openspec/changes/archive/`
- Nenhum código de aplicação afetado
- Nenhuma referência externa conhecida a esses nomes (confirmado via grep)
