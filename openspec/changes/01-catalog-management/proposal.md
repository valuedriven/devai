# Proposal: Catalog Management (01-catalog-management)

## Why

Embora as entidades de Category e Product já estejam mapeadas no Prisma schema e controllers parciais existam, é necessário validar, refinar e garantir o correto funcionamento das regras de negócio do catálogo (produtos inativos omitidos da vitrine, validação de preços e estoques), além de configurar a cobertura de testes Jest de 80% do backend para este domínio.

## What Changes

- **Backend**:
  - Refinamento do `ProductService` e `CategoryService` para as regras de negócio de ativação/inativação de produtos e categorias.
  - Implementação de DTOs refinados com `class-validator` para cadastro/edição de produtos e categorias.
  - Adição de testes unitários para os serviços e testes de integração com `supertest` para os controllers.

## Capabilities

### New Capabilities
- Validação automática de estoque de produto e preços positivos via DTOs na criação/atualização.

### Modified Capabilities
- Listagem pública de produtos agora omite produtos inativos ou categorias inativas.

## Impact

- **Backend**: `apps/backend/src/modules/catalog/` (services, controllers, DTOs).

## Escopo Funcional

- RF-03: CRUD de categorias (permitido apenas para administrador).
- RF-04: CRUD de produtos e controle de visibilidade/estoque.

## Dependências

- Nenhuma.

## Riscos

- **Inconsistência de Dados**: Se a migração ou seed falhar, o catálogo pode ficar vazio.
  - *Mitigação*: Uso de scripts de seed robustos (`seed-catalog.ts`) e rollback de migrations.

## Plano de Testes

### Testes Unitários Necessários
- **CategoryService / ProductService**:
  - Validar a criação/edição/remoção lógica.
  - Garantir que produtos inativos não sejam exibidos no catálogo público.
  - Garantir que preços e estoques inválidos lancem erro de validação.

### Testes de Integração Necessários
- **Controllers HTTP**:
  - `GET /categories` e `GET /products` públicos.
  - `POST`, `PATCH`, `DELETE` para `/categories` e `/products` bloqueados para não-admin.

### Testes E2E Necessários
- Nível de E2E não é estritamente aplicável nesta etapa, pois o frontend da vitrine será construído na etapa 03.
