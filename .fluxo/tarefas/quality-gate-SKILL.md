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
