## 1. Configuração do Monorepo

- [ ] 1.1 Verificar e ajustar workspaces de pacotes na raiz do `package.json` para mapear `apps/frontend` e `apps/backend`
- [ ] 1.2 Garantir os scripts de atalho globais no root package.json para `dev:frontend`, `dev:backend`, `build:frontend` e `build:backend`

## 2. Scaffold e Estilização do Frontend

- [ ] 2.1 Mapear e injetar variáveis de cores semânticas, tipografia, bordas e elevação (Design System) em `apps/frontend/src/app/globals.css`
- [ ] 2.2 Implementar estrutura básica de layout do App Router com carregamento do CSS global

## 3. Scaffold do Backend

- [ ] 3.1 Iniciar estrutura base do NestJS com configuração de módulo raiz
- [ ] 3.2 Configurar arquivos do Jest e dependências locais de testes unitários no subprojeto `apps/backend`

## 4. Testes e Validação

- [ ] 4.1 Rodar testes de unidade base para garantir funcionamento do Jest
- [ ] 4.2 Executar build de produção do frontend (`npm run build:frontend`) para validação de compilador
