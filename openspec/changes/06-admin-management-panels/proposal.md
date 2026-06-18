# Proposal: Admin Management Panels (06-admin-management-panels)

## Why

Para gerenciar o comércio, o administrador precisa de painéis administrativos. Esta mudança implementa os CRUDs completos e interfaces de gestão de categorias, produtos e clientes sob a proteção da role `admin`.

## What Changes

- **Frontend**:
  - Layout e barra lateral administrativa diferenciada para a rota `/admin`.
  - Telas de CRUD de categorias: `/admin/categories` (listagem, formulário de cadastro/edição e inativação).
  - Telas de CRUD de produtos: `/admin/products` (listagem, formulário de cadastro/edição, controle de estoque e upload fictício de URL de imagem).
  - Telas de listagem e edição de clientes: `/admin/customers`.
- **Backend**:
  - Proteção com `RolesGuard` (`@Roles('admin')`) em todas as rotas de mutação de catálogo e gerenciamento de clientes.

## Capabilities

### New Capabilities
- Painel Administrativo de gestão cadastral.
- Controle centralizado de estoque e status do catálogo.

### Modified Capabilities
- Segurança de acesso às rotas `/admin` do frontend através de middleware Next.js integrado com o token do BFF.

## Impact

- **Frontend**: `apps/frontend/src/app/(admin)/` (categories, products, customers pages)
- **Backend**: `apps/backend/src/modules/catalog/`, `apps/backend/src/modules/customers/`

## Escopo Funcional

- RF-03: Gestão de Categorias por administradores.
- RF-04: Gestão de Produtos por administradores.
- RF-05: Gestão de Clientes por administradores.
- Regra de negócio: Clientes com pedidos associados não podem ser excluídos, apenas desativados.

## Dependências

- `02-auth-clerk-integration` (para controle de roles e acesso).

## Riscos

- **Falha de Autorização no Frontend**: Administrador sem permissões adequadas ou cliente comum conseguindo visualizar dados sensíveis nas páginas `/admin`.
  - *Mitigação*: Verificação de Claims do token JWT tanto no Middleware do Next.js quanto nos Guards do NestJS.

## Plano de Testes

### Testes Unitários Necessários
- **CustomerService CRUD validations**:
  - Garantir que clientes com pedidos associados lancem exceções ao tentar deletar.

### Testes de Integração Necessários
- **Catalog/Customers Admin Endpoints**:
  - Testar acesso negado (403 Forbidden) para usuários sem role `admin` nas rotas POST/PATCH/DELETE.

### Testes E2E Necessários
- Playwright E2E logando como admin, acessando o menu de produtos, inserindo um novo produto e verificando se ele aparece na listagem principal.
