# Harness de teste

Como aumentar a maturidade dos testes no contexto dos agentes de IA

## Especificação técnica

- Incluir definições básicas sobre testes na documentação base (architecture.md).
- Usar o exemplo a seguir como referência:

```
### Testes e Qualidade

#### Ferramentas

| Categoria  | Ferramenta       |
| ---------- | ---------------- |
| Lint       | ESLint           |
| Unidade    | Jest             |
| Integração | Jest + Supertest |
| E2E        | Playwright       |

#### Cobertura Mínima

| Camada   | Linhas | Branches |
| -------- | ------ | -------- |
| Backend  | 80%    | 80%      |
| Frontend | 70%    | 70%      |

#### Diretrizes

* Toda alteração de regra de negócio deve incluir testes automatizados.
* Testes unitários devem validar regras de negócio de forma isolada.
* Testes de integração devem validar APIs, persistência e integração entre componentes.
* Testes E2E devem cobrir os fluxos críticos da aplicação.
* Os testes devem contemplar:

  * Happy Path
  * Failure Path
  * Casos limite relevantes

#### Critérios de Conclusão

Uma alteração somente pode ser considerada concluída quando:

* Não existirem erros de lint.
* Todos os testes estiverem aprovados.
* A cobertura mínima exigida for atingida.
* Não existirem falhas críticas identificadas nos testes E2E aplicáveis.

#### Pipeline Obrigatório

Toda alteração deve executar com sucesso:

1. ESLint
2. Testes Unitários
3. Testes de Integração
4. Testes E2E aplicáveis
5. Verificação de cobertura

#### Diretrizes para Agentes de IA

Agentes de IA devem:

* Criar ou atualizar os testes necessários juntamente com a implementação.
* Executar todos os testes aplicáveis antes de concluir uma tarefa.
* Corrigir falhas de lint, testes ou cobertura identificadas durante a execução.
* Considerar a tarefa concluída somente após a aprovação de todas as validações obrigatórias.
```

## Regra para agente de IA

- Incluir regras explícitas no AGENTS.md com base na especificação.
- Usar o exemplo a seguir como referência:

```
## Quality Gate

Nunca considere uma tarefa concluída sem:

* Atualizar ou criar os testes automatizados necessários.
* Executar lint, testes e cobertura.
* Corrigir todas as falhas encontradas.

Bloqueie a conclusão da tarefa se houver:

* Erros de lint.
* Testes falhando.
* Cobertura abaixo do mínimo exigido.

### Diretrizes de Teste

* Testes unitários devem ser utilizados apenas no backend para validar regras de negócio, serviços, casos de uso e componentes de forma isolada.
* Testes de integração devem ser utilizados apenas na API REST do backend para validar endpoints, persistência de dados, autenticação, autorização e integração entre componentes.
* Testes E2E devem validar os fluxos críticos da aplicação do ponto de vista do usuário, cobrindo a integração entre frontend, backend e demais serviços necessários.

Os testes devem contemplar, quando aplicável:

* Happy Path
* Failure Path
* Casos limite relevantes

Toda alteração de regra de negócio deve possuir testes automatizados compatíveis com a camada afetada.
```


## Habilidade para o agente de IA

- Crie uma skill de testes no projeto.
- Use o exemplo o arquivo quality-gate-SKILL.md, conforme exemplo abaixo:

``````
---
name: quality-gate
description: >
  Garante que toda implementação atenda aos critérios obrigatórios de qualidade antes de ser considerada concluída.
  Use esta skill sempre que estiver implementando qualquer funcionalidade, corrigindo bugs, refatorando código ou fazendo qualquer alteração que envolva regras de negócio.
  Também deve ser acionada quando o usuário pedir para "finalizar uma tarefa", "commitar", "criar PR", "revisar código" ou qualquer variação de "terminar" uma implementação.
  Esta skill é OBRIGATÓRIA e deve ser consultada em toda tarefa de desenvolvimento — nunca considere uma tarefa concluída sem executar o pipeline completo descrito aqui.
---

# Quality Gate

Esta skill define o pipeline obrigatório de qualidade que todo agente de IA deve seguir antes de considerar qualquer tarefa concluída.

> **Regra absoluta:** Uma tarefa está concluída **somente** quando todas as etapas do pipeline abaixo forem executadas com sucesso.

---

## Pipeline Obrigatório

Execute sempre nesta ordem:

```
1. ESLint          → zero erros permitidos
2. Testes Unitários    → todos aprovados
3. Testes de Integração → todos aprovados
4. Testes E2E (aplicáveis) → zero falhas críticas
5. Verificação de Cobertura → mínimos atingidos
```

### Comandos de referência

```bash
# Lint
npx eslint .

# Testes unitários
npx jest --testPathPattern="unit|spec" --coverage

# Testes de integração
npx jest --testPathPattern="integration" --coverage

# Testes E2E
npx playwright test

# Cobertura consolidada
npx jest --coverage --coverageReporters=text-summary
```

> Os comandos exatos podem variar por projeto. Consulte `package.json` para os scripts configurados (ex: `npm run test`, `npm run test:unit`, `npm run lint`).

---

## Critérios de Cobertura Mínima

| Camada   | Linhas | Branches |
| -------- | ------ | -------- |
| Backend  | 80%    | 80%      |
| Frontend | 70%    | 70%      |

Se a cobertura estiver abaixo do mínimo, **escreva mais testes** antes de concluir.

---

## Diretrizes de Teste por Camada

### Testes Unitários (Backend apenas)
- Validam regras de negócio, serviços, casos de uso e componentes **de forma isolada**
- Usam mocks para dependências externas (banco, APIs, etc.)
- **Não** devem ser criados no frontend

### Testes de Integração (API REST do Backend apenas)
- Validam endpoints, persistência de dados, autenticação, autorização
- Validam integração entre componentes do backend
- Usam banco de dados de teste real ou in-memory
- Ferramentas: Jest + Supertest

### Testes E2E (Fluxos críticos)
- Validam a aplicação do ponto de vista do usuário
- Cobrem a integração frontend ↔ backend ↔ serviços externos
- Ferramenta: Playwright
- Foco nos fluxos de negócio mais importantes

### O que todo teste deve cobrir (quando aplicável)
- ✅ Happy Path — fluxo principal funcionando
- ✅ Failure Path — erros esperados tratados corretamente
- ✅ Casos limite relevantes — bordas e valores extremos

---

## Quando Criar ou Atualizar Testes

| Situação                          | Ação obrigatória                              |
| --------------------------------- | --------------------------------------------- |
| Nova regra de negócio             | Criar testes unitários (backend)              |
| Novo endpoint REST                | Criar testes de integração                    |
| Novo fluxo crítico de usuário     | Criar/atualizar testes E2E                    |
| Alteração em regra de negócio     | Atualizar testes existentes da camada afetada |
| Correção de bug                   | Adicionar teste que reproduz o bug corrigido  |
| Refatoração                       | Garantir que os testes existentes continuem passando |

---

## Checklist de Conclusão

Antes de declarar uma tarefa como concluída, confirme:

- [ ] ESLint executado — **zero erros**
- [ ] Testes unitários criados/atualizados para a camada afetada
- [ ] Testes de integração criados/atualizados para APIs afetadas
- [ ] Testes E2E criados/atualizados para fluxos críticos impactados
- [ ] Todos os testes passando — **zero falhas**
- [ ] Cobertura de backend ≥ 80% linhas e branches
- [ ] Cobertura de frontend ≥ 70% linhas e branches
- [ ] Nenhuma falha crítica nos testes E2E aplicáveis

---

## Bloqueios — Não Conclua se:

- ❌ Existirem erros de lint
- ❌ Qualquer teste estiver falhando
- ❌ A cobertura estiver abaixo do mínimo exigido
- ❌ Houver falhas críticas nos testes E2E

**Corrija todos os problemas encontrados antes de finalizar.**

---

## Fluxo de Trabalho do Agente

```
implementar alteração
       ↓
criar/atualizar testes da camada afetada
       ↓
executar lint → corrigir erros → repetir até zero erros
       ↓
executar testes unitários → corrigir falhas → repetir até tudo passar
       ↓
executar testes de integração → corrigir falhas → repetir até tudo passar
       ↓
executar testes E2E (quando aplicável) → corrigir falhas críticas
       ↓
verificar cobertura → escrever mais testes se abaixo do mínimo
       ↓
✅ tarefa concluída
```

---

## Referência Rápida de Ferramentas

| Categoria   | Ferramenta       | Camada            |
| ----------- | ---------------- | ----------------- |
| Lint        | ESLint           | Todas             |
| Unitário    | Jest             | Backend           |
| Integração  | Jest + Supertest | Backend (API)     |
| E2E         | Playwright       | Full-stack        |
``````

- Lembre-se de renomear o arquivo para apenas SKILL.md ao colocá-lo no diretório .agents/skills/<nome da skill>



## Configuração solução de SDD

- Alinhe arquivo de config.yaml do OpenSpec as diretrizes.
- Avalie o conteúdo a seguir como exemplo:

```
schema: spec-driven

context: |
  Project Overview:
    - Monorepo structured with npm workspaces.
    - Directory Structure: apps/frontend/, apps/backend/, infra/, docs/

  Tech stack:
    Frontend: TypeScript, Next.js 16+, App Router, Vanilla CSS
    Backend: TypeScript, Node.js 24+, NestJS 11+, Prisma 7+
    Database: PostgreSQL 15+
    Observability: Grafana Cloud
    Identity: Clerk
    Development: Google Antigravity, npm Workspaces, Docker
    DevOps: Terraform, GitHub Actions

  Testing & Quality Guidelines:
    Estratégia de Testes (Pirâmide de Testes):
      - Testes unitários utilizando Jest (Serviços e regras de negócio)
      - Testes de integração utilizando Jest + Supertest (Controllers e APIs)
      - Testes end-to-end utilizando Playwright (Fluxos de usuário)
    Minimum Coverage:
      - Cobertura mínima de 80% para statements, branches, functions e lines (em toda a base de código e novas modificações)
    Rules:
      - Toda mudança deverá possuir testes compatíveis com sua natureza.
      - Serviços e regras de negócio: obrigatoriamente testes unitários.
      - Controllers e APIs: obrigatoriamente testes de integração.
      - Fluxos de usuário: obrigatoriamente testes Playwright.
      - Todos os testes devem cobrir Happy Path, Sad Path e Edge Cases.

    Testing Commands:
      - Unit Tests: `npm run test:unit` (runs Jest in workspace). Isolate functions/components, mock external limits.
      - Integration Tests: `npm run test:integration` (runs Jest+supertest). Validate multiple modules/services together.
      - E2E Tests: `npx playwright test`. Validate end-to-end user flows.
      - Frontend Linting: `npm run lint --workspace=frontend`

rules:
  proposal:
    - Ensure features align with docs/prd.md, docs/spec.md and docs/architecture.md
    - Verify that proposed architecture adheres to the NestJS modular patterns and Next.js App Router rules.
    - Next.js must remain only a presentation layer (no database, Prisma, or business logic access).
    - All business decisions and logic must be enforced on NestJS backend.
    - Do not use official Clerk SDK components (SignIn, SignUp, UserProfile, etc.) on frontend; implement custom UI.
    - Ensure all endpoint changes comply with OpenTelemetry standards.
  design:
    - Strictly use Design System CSS tokens from globals.css. No hardcoded colors.
  tasks:
    - Every business logic task must include Jest/Supertest tests.
    - Database modifications require a Prisma migration versioned change.
    - Ensure lint and tests pass before task completion.
    - Create or modify tests for any new or changed code.
    - Verify that new files/changes satisfy the testing pyramid and 80% coverage requirements (statements, branches, functions, and lines).
```

- Verifique se as principais diretrizes de testes estão contidas no arquivo.
- Inclua diretrizes específicas na seção tasks, para criação e/ou atualização de testes.
- Solicite apoio ao agente para realizar a sincronização.


## Ajustes no projeto

- Garanta que os principais scripts de qualidade sejam executados em todo repositório.
- Peça apoio do agente para permitir executar os seguintes comandos de forma a cobrir tanto o backend quanto o frontend:

```
npm run lint
npm run test:unit
npm run test:integration
```

## Mecanismos de revisão determinística

- Configure o pipeline para executar os comandos do ciclo de testes
- Configure a ferramenta de inspeção de código Sonar



