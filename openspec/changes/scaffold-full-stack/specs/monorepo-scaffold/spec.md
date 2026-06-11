## ADDED Requirements

### Requirement: Monorepo workspace layout
O repositório SHALL gerenciar múltiplos pacotes isolados utilizando npm workspaces, organizados nos diretórios `apps/frontend` para o frontend Next.js 16 e `apps/backend` para o backend NestJS 11.

#### Scenario: Estrutura do workspace configurada
- **WHEN** as dependências do monorepo forem instaladas na raiz do projeto
- **THEN** a raiz SHALL conter referências corretas de workspaces apontando para `apps/*` no package.json

### Requirement: Tokens do CSS no Design System
O frontend SHALL exportar e tornar globalmente acessíveis os tokens semânticos de cores, tipografia, bordas e elevação especificados no design system por meio do arquivo globals.css.

#### Scenario: CSS variáveis declaradas
- **WHEN** o frontend for compilado ou iniciado
- **THEN** o arquivo `apps/frontend/src/app/globals.css` SHALL expor as variáveis CSS semânticas correspondentes (ex: `--brand-primary`, `--neutral-surface`, etc.)
