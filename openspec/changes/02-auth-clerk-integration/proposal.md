# Proposal: Authentication & Clerk BFF Integration (02-auth-clerk-integration)

## Why

A arquitetura do DevAI proíbe o uso dos SDKs/Componentes oficiais do Clerk no frontend Next.js. Toda a autenticação e verificação de tokens/papeis deve passar pelo backend NestJS agindo como BFF. É necessária uma interface própria de login/cadastro no Next.js acoplada a rotas protegidas no BFF NestJS.

## What Changes

- **Backend**:
  - Implementação completa do `AuthGuard` e `RolesGuard` consumindo as APIs do Clerk e decodificando JWTs.
  - Rota de autenticação `/auth/login`, `/auth/register` e `/auth/me` no BFF backend.
- **Frontend**:
  - Página de Login e Registro customizada em Next.js utilizando formulários HTML padrão com Vanilla CSS.
  - Implementação de session cookie/token handling seguro.

## Capabilities

### New Capabilities
- Fluxo completo de login e registro de usuários via BFF.
- RBAC (Role-Based Access Control) diferenciando `admin` e `customer`.

### Modified Capabilities
- Nenhuma.

## Impact

- **Backend**: `apps/backend/src/core/guards/`, `apps/backend/src/modules/auth/`
- **Frontend**: `apps/frontend/src/app/(auth)/login/page.tsx`, `apps/frontend/src/app/(auth)/register/page.tsx`

## Escopo Funcional

- Autenticação e autorização para rotas de usuário e administração.
- Sincronização básica de usuários autenticados com a tabela de clientes no banco.

## Dependências

- Provedor do Clerk configurado via variáveis de ambiente.

## Riscos

- **Falha de Comunicação com Clerk**: Latência ou indisponibilidade da API do Clerk pode travar logins.
  - *Mitigação*: Cache local de tokens/sessões temporárias e tratamento robusto de erros RFC 9457.

## Plano de Testes

### Testes Unitários Necessários
- **AuthGuard / RolesGuard**:
  - Validar a validação de JWTs válidos e inválidos.
  - Verificar a extração e validação do papel (role) do usuário.

### Testes de Integração Necessários
- **Auth Endpoint**:
  - Mock da API do Clerk para testar login, registro e sincronização de dados de cliente.

### Testes E2E Necessários
- Playwright E2E testando a jornada de login com credenciais de teste válidas e exibição de mensagens de erro em credenciais inválidas.
