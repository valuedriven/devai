## Context

O catálogo de produtos possui a estrutura básica de tabelas no banco de dados e arquivos de controller/service no backend. Para garantir a segurança operacional e robustez nas regras de negócio exigidas no PRD e Especificação Funcional, precisamos definir as validações de entrada (DTOs) e a visibilidade de produtos inativos ou de categorias inativas na listagem pública do catálogo.

## Goals / Non-Goals

**Goals:**
- Validar o campo de estoque (`stock >= 0`) e de preço (`price > 0`) de produtos no backend.
- Garantir que a listagem de produtos oculte produtos e categorias marcadas como `active = false` quando acessada publicamente.
- Atingir a cobertura de testes Jest de pelo menos 80% do módulo de catálogo (`apps/backend/src/modules/catalog/`).

**Non-Goals:**
- Upload real de imagens de produtos (S3/Cloudinary) está fora de escopo para este MVP.
- Desenvolvimento ou alteração de componentes no frontend.

## Decisions

### 1. Validação no nível do DTO via class-validator
- **Decisão**: Utilizar os decorators do `class-validator` nos DTOs de criação e atualização de produtos e categorias no NestJS.
- **Alternativas consideradas**: Validação direta no service. Escolhemos DTOs pois o NestJS fornece interceptação automática de erros de validação antes mesmo que a requisição chegue ao service, mantendo o controller limpo.

### 2. Filtro de visibilidade ativa no Prisma ORM
- **Decisão**: Implementar cláusulas `where` adicionais no Prisma query (`ProductService.findAll`): `{ active: true, category: { active: true } }` caso a chamada seja pública.
- **Alternativas consideradas**: Trazer todos os dados e filtrar em memória no backend. Rejeitado por problemas de performance e paginação incorreta no banco de dados.

## Risks / Trade-offs

- **[Risco]** Falhas na validação de DTOs travarem requisições legítimas se os tipos não forem compatíveis.
  - *Mitigação*: Uso de transformações de dados explícitas com `ValidationPipe` do NestJS (`transform: true`).
- **[Risco]** Mudança na visibilidade pública afetar outras listagens do admin.
  - *Mitigação*: Manter endpoints e métodos de listagem separados para o fluxo de administração e o fluxo de vitrine pública.
