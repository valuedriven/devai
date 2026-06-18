## Why

O banco de dados e a API básica para categorias e produtos já possuem um rascunho de implementação, porém é necessário validar as regras de negócio especificadas (ocultar produtos inativos da vitrine, validar preços e controle básico de estoque) e garantir uma cobertura de testes unitários e de integração de no mínimo 80% antes de prosseguirmos com a integração de interface gráfica.

## What Changes

- **Backend (Modules/Catalog)**:
  - Validação e enriquecimento de DTOs com regras como `Min(0)` para estoques e preços de produtos.
  - Ajuste nas consultas do `ProductService` para garantir que produtos inativos ou de categorias inativas não sejam listados no catálogo público.
  - Implementação de uma suíte completa de testes unitários com Jest e testes de integração com Jest+Supertest para validação das regras de negócio e cobertura de endpoints de categorias e produtos.

## Capabilities

### New Capabilities
- `catalog-management`: Regras de negócio, validações de DTOs, filtros de visibilidade pública e testes de cobertura para a gestão de categorias e produtos no backend.

### Modified Capabilities
- Nenhuma.

## Impact

- **Backend**: `apps/backend/src/modules/catalog/` (services, controllers, DTOs).
- **Testes**: Arquivos `.spec.ts` associados aos controladores e serviços do catálogo.
