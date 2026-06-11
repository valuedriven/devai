## Why

Este scaffold inicial estabelece a estrutura de monorepo, dependências e configurações compartilhadas essenciais para o desenvolvimento coordenado e padronizado do DevAI (NestJS no backend e Next.js no frontend), garantindo de imediato a base para testes e desenvolvimento ágil.

## What Changes

- Configuração e verificação do layout de diretórios do monorepo (`apps/frontend`, `apps/backend`) utilizando npm workspaces.
- Ajuste das variáveis do Design System em `src/app/globals.css` no frontend de acordo com os tokens do projeto.
- Boilerplate inicial integrado com suporte a TypeScript, Jest para testes unitários/integração no backend, e Next.js padrão no frontend.

## Capabilities

### New Capabilities
- `monorepo-scaffold`: Estrutura do workspace do monorepo, contendo a base do frontend Next.js 16 e backend NestJS 11 configurados com suporte a TypeScript, lint e testes.

### Modified Capabilities
<!-- Nenhuma modificação a capacidades existentes -->

## Impact

- Afeta a raiz do repositório (`package.json`, workspaces).
- Cria as estruturas de diretórios bases de `apps/frontend` e `apps/backend`.
- Impacta o setup de compilação, scripts de execução simultânea (`dev:frontend`, `dev:backend`) e configurações de lint/teste globais.
