# Roteiro de Configuração do Ambiente

Complemento do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md) para a atividade **Ambiente**, a primeira da fase de Entrega, executada depois do [Roteiro de Descoberta](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_discovery.md). Ele parte das ferramentas já instaladas conforme o [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md), e produz regras, skills, servidores MCP, hooks e subagentes implantados no agente escolhido.

Execute-o **antes** do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md), de que é pré-requisito.

| Seção | Resultado |
| :---- | :---- |
| 1 | Agente escolhido e em execução sobre o diretório do projeto |
| 2 | `.env` criado e `apm.yml` versionado, com a configuração implantada |
| 3 | Passos manuais do agente em uso executados |
| 4 | Ferramentas de contexto e custo integradas |
| 5 | Verificação do que foi implantado |

---

## 1. Agente

* Instale **um** dos dois agentes da seção 3 do catálogo de ferramentas.
* Abra o diretório raiz do projeto no agente.
* Inicie uma sessão nova para cada tarefa.

| Agente | Identificador nas CLIs | Nova sessão | Diretório de configuração |
| :---- | :---- | :---- | :---- |
| Antigravity | `antigravity` | Painel **Agent**, comando **+**, opção **Start a New Conversation** | `.agents/` |
| OpenCode | `opencode` | `/new` na área de prompt | `.opencode/` e `.agents/` |

Perfil de modelo por etapa do ciclo planejar/executar:

| Etapa do ciclo | Perfil de modelo |
| :---- | :---- |
| Planejamento | Maior capacidade de raciocínio, com modo *thinking* quando disponível e, se a ferramenta oferecer, agente sem permissão de edição |
| Execução | Mais rápido e barato |
| Revisão | Sessão nova, ou modelo diferente do que implementou |

### 1.1 OpenCode — conexão com o gateway

* Na área de prompt: `/connect`, provider `omniroute`, e a chave de API do gateway.
* Em seguida: `/models`, escolhendo um modelo do provider **OmniRoute**.
* Para versionar a conexão, declare o provider no `opencode.json`, no diretório raiz:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "omniroute": {
      "npm": "@omniroute/opencode-provider",
      "name": "OmniRoute",
      "options": {
        "baseURL": "http://localhost:20128/v1",
        "apiKey": "{env:OMNIROUTE_API_KEY}"
      }
    }
  }
}
```

* Acrescente ao `.env` do projeto, criado na seção 2.3:

```bash
# OmniRoute — painel em http://localhost:20128/ → API Key Manager → Create API key
OMNIROUTE_API_KEY=
```

> Mantenha **um único `$schema`** e um único objeto raiz. A seção 2 acrescenta as chaves `mcp`, `instructions` e `agents` a este mesmo arquivo; blocos repetidos ou aninhados produzem JSON inválido, e o agente não carrega a configuração.

---

## 2. Configuração implantada pelo APM

Regras, skills, servidores MCP, hooks e subagentes são escritos **uma vez**, em `.apm/`, e implantados nos diretórios de cada agente por um comando.

### 2.1 Diretório de autoria

```text
├── .apm
│   ├── instructions/<nome>.instructions.md   # regras
│   ├── skills/<nome>/SKILL.md                # skills
│   ├── agents/<nome>.agent.md                # subagentes
│   ├── prompts/<nome>.prompt.md              # comandos
│   └── hooks/<nome>.json                     # hooks
└── apm.yml                                   # manifesto
```

* Acrescente ao `.gitignore`:

```text
apm_modules/
```

### 2.2 Manifesto `apm.yml`

No diretório raiz do projeto:

```yaml
name: <nome-do-projeto>
version: 1.0.0

targets:
  - antigravity
  - opencode
```

| Campo | Regra |
| :---- | :---- |
| `name`, `version` | Obrigatórios |
| `targets` | Aceita `antigravity`, `opencode`, `agent-skills`, `claude`, `copilot`, `cursor`, `codex`, `gemini`, `grok-build`, `windsurf` e `kiro`. Valor desconhecido interrompe a leitura com erro |
| `dependencies` | Não é escrito à mão: os comandos da seção 2.3 o preenchem |

O manifesto nasce com três campos e cresce por comando. Servidores MCP e skills entram pelos comandos da seção 2.3, que **gravam no próprio manifesto** — ao final, `apm.yml` e `apm.lock.yaml` versionados descrevem a configuração inteira, sem que nenhuma dependência tenha sido digitada no arquivo.

> **Antes de instalar qualquer skill de terceiros, abra o `SKILL.md` e os scripts e leia.** Skills são instruções e código que entram no ambiente: podem conter instruções que o agente obedecerá e scripts que executarão com o acesso de quem os executa. Se não for possível ler, não instale.

### 2.3 Instalação

Toda instalação passa pelo APM. Nenhum servidor MCP e nenhuma skill se instala à parte: o que não estiver declarado no manifesto não é reproduzível em outra máquina.

**Credenciais, antes de instalar.** O `.env` nasce aqui, e não no Roteiro de Entrega, porque o `apm install` já o consome. No diretório raiz do projeto:

```bash
# Context7 — https://context7.com/dashboard → API Keys → Create API Key
CONTEXT7_API_KEY=
```

* Acrescente o `.env` ao `.gitignore` e crie um `.env.example` com as mesmas chaves, sem os valores.
* No ambiente open source, acrescente também a chave do gateway, conforme a seção 1.1.
* Preencha as chaves **antes** de instalar, ou o servidor MCP subirá sem credencial.

**Servidores MCP.** Os três são registrados por comando:

```bash
apm install --mcp context7   -- npx -y @upstash/context7-mcp --env API_KEY=${env.CONTEXT7_API_KEY}
apm install --mcp openspec   -- npx -y @fission-ai/openspec@latest
apm install --mcp playwright -- npx -y @playwright/mcp@latest
```

> A chave do Context7 entra por referência ao ambiente, e não pelo valor: o manifesto é versionado, e credencial escrita nele vaza no repositório.

**Skills da stack da solução.** Correspondem às tecnologias declaradas na seção 5 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md). Trocada uma tecnologia, troque a skill:

```bash
apm install hashicorp/agent-skills
apm install vercel/next.js
apm install prisma/skills
apm install supabase/agent-skills

apm install clerk/skills --skill clerk-setup
apm install clerk/skills --skill clerk
```

> Os quatro primeiros instalam o **pacote completo**: a seleção por `--skill` só se justifica quando o pacote traz skills de tecnologias que o projeto não usa. Conferida a lista com `apm list`, remova pelo manifesto o que não servir.

**Skills de arquitetura, qualidade e automação:**

```bash
apm install mattpocock/skills --skill improve-codebase-architecture

apm install addyosmani/agent-skills --skill frontend-ui-engineering
apm install addyosmani/agent-skills --skill code-review-and-quality
apm install addyosmani/agent-skills --skill ci-cd-and-automation

apm install sickn33/antigravity-awesome-skills --skill backend-architect
apm install sickn33/antigravity-awesome-skills --skill nestjs-expert
apm install sickn33/antigravity-awesome-skills --skill docker-expert
apm install sickn33/antigravity-awesome-skills --skill github-actions-templates
```

**Skills de teste e gate de qualidade**, do projeto de referência:

```bash
apm install valuedriven/devai --skill jest-unit-tests
apm install valuedriven/devai --skill supertest-integration-test
apm install valuedriven/devai --skill playwright-e2e-tests
apm install valuedriven/devai --skill quality-gate
```

**Implantação e verificação:**

```bash
apm install --dry-run      # mostra o que seria gravado, com as variáveis resolvidas
apm install                # grava nos diretórios do agente
apm audit                  # audita as dependências
apm list                   # lista o que foi implantado
```

* Versione o `apm.yml` e o `apm.lock.yaml` resultantes.

> Use `apm install --frozen` na integração contínua: ele falha se o manifesto e o arquivo de travamento divergirem, em vez de resolver versões novas em silêncio.

> Para buscar outras skills, registre um marketplace com `apm marketplace add github/awesome-copilot` e consulte os catálogos da seção 5 do catálogo de ferramentas.

### 2.4 Formato de cada primitivo

**Regra**, em `.apm/instructions/<nome>.instructions.md`:

```markdown
---
description: Convenções de teste do projeto
applyTo: "**/*.test.ts,**/*.spec.ts"
---
```

**Skill**, em `.apm/skills/<nome>/SKILL.md`, com `scripts/`, `references/` e `assets/` opcionais ao lado:

```markdown
---
name: quality-gate
description: Executa e interpreta o gate de qualidade antes de concluir uma mudança
---
```

O `name` coincide com o nome do diretório e usa apenas minúsculas, dígitos e hífens simples. A `description` declara **quando** usar a skill, não o que ela faz: é por ela que o agente decide carregá-la.

**Subagente**, em `.apm/agents/<nome>.agent.md`. O projeto declara três:

```markdown
---
name: revisor
description: Revisa o diff de uma mudança e produz achados, sem alterar arquivos
tools: [read, grep, glob]
---

Revise o diff da mudança segundo a política de revisão em REVIEW.md.

Para cada achado, informe arquivo e linha, severidade segundo a política, o que está
errado e o que a correção exigiria.

Não altere nenhum arquivo. Não execute comandos que gravem.

Não emita veredito de aprovação: a revisão produz achados, e aprovação não é achado.
```

| Subagente | Ferramentas | Para que serve |
| :---- | :---- | :---- |
| `revisor` | Somente leitura | Produz achados sobre o diff, sem poder alterá-lo |
| `executor-suite` | Leitura e execução da suíte | Roda os testes e relata apenas as falhas |
| `explorador` | Somente leitura | Levanta o contexto de um módulo, sem ocupar a sessão principal |

**Hook**, em `.apm/hooks/<nome>.json`. O projeto declara quatro, com a lógica de decisão em scripts versionados em `.apm/hooks/bin/`, compartilhados pelos dois agentes:

```json
{
  "bloquear-segredo-no-commit": {
    "PreToolUse": [
      {
        "matcher": "run_command|bash|shell",
        "hooks": [
          { "type": "command", "command": ".apm/hooks/bin/verifica-segredo.sh", "timeout": 30 }
        ]
      }
    ]
  }
}
```

| Hook | Momento |
| :---- | :---- |
| `bloquear-segredo-no-commit` | `PreToolUse`, antes do commit, sobre o diff |
| `formatar-ao-gravar` | `PostToolUse`, com `matcher` casando as ferramentas de gravação |
| `suite-antes-do-commit` | `PreToolUse`, antes do commit |
| `spec-sincronizada-antes-do-arquivamento` | `PreToolUse`, antes do arquivamento da mudança |

Cada script lê o JSON recebido em `stdin`, inspeciona o comando a executar e devolve em `stdout` o JSON que autoriza ou bloqueia a ação. Eventos disponíveis: `SessionStart`, `PreInvocation`, `PostInvocation`, `PreToolUse`, `PostToolUse` e `Stop`; apenas os dois de ferramenta aceitam `matcher`.

### 2.5 Onde cada primitivo é implantado

| Primitivo | Antigravity | OpenCode |
| :---- | :---- | :---- |
| Regras | `.agents/rules/` pelo APM | passo manual 3.1 |
| Skills | `.agents/skills/` pelo APM | `.agents/skills/` pelo APM |
| MCP | `.agents/mcp_config.json` pelo APM | bloco `mcp` do `opencode.json` pelo APM |
| Hooks | `.agents/hooks.json` pelo APM | passo manual 3.2 |
| Subagentes | passo manual 3.3 | `.opencode/agents/` pelo APM, com o ajuste 3.4 |
| Comandos | workflows do OpenSpec | `.opencode/commands/` pelo APM |

* Skills são o primitivo portável: os dois leem o mesmo diretório e o mesmo formato. O que puder ser skill, seja skill.
* Regras longas competem com o código pelo mesmo espaço de contexto. No Antigravity, cada arquivo de regra é truncado acima de 24.000 bytes, e as regras globais e sempre ativas dividem um orçamento de 20.000 tokens.

### 2.6 Inicialização por projeto

A instalação pelo APM registra os servidores MCP e as skills, mas dois deles ainda precisam de uma inicialização específica do projeto, feita uma vez e repetida apenas quando o agente em uso mudar.

**OpenSpec.** No diretório raiz do projeto, declarando os agentes que serão usados:

```bash
npx -y @fission-ai/openspec@latest init --tools antigravity,opencode
npx -y @fission-ai/openspec@latest view
```

> A CLI é invocada por `npx`, sem instalação global: é o mesmo pacote que o APM registrou como servidor MCP. Assim há uma única versão do OpenSpec no projeto, e ela é a declarada no `apm.yml`.

> Separe os nomes por vírgula **sem espaço**. Um espaço após a vírgula faz o shell tratar o segundo nome como argumento separado, e a inicialização falha. Declarar os dois de uma vez permite trocar de agente sem reinicializar.

O `init` cria a árvore `openspec/`, com `changes/`, `config.yaml` e `specs/`, e grava comandos e skills nos diretórios de cada agente:

| Agente | Skills do OpenSpec | Comandos e workflows |
| :---- | :---- | :---- |
| `antigravity` | `.agents/skills/` | `.agents/workflows/` |
| `opencode` | `.opencode/skills/` | `.opencode/commands/` |

* Caso tenha sido criada a pasta `.agent`, no singular, mova seu conteúdo para `.agents`.

**Convivência com os arquivos do projeto.** O comando `update` — executado após mudança de versão ou de perfil — **reescreve** os arquivos que o `init` gerou.

| Cuidado | Razão |
| :---- | :---- |
| Não edite os arquivos gerados pelo OpenSpec | O `update` os sobrescreve, e a edição se perde |
| Mantenha o que é do projeto fora dos diretórios gerados | Regras, hooks e subagentes nascem no diretório de autoria da seção 2.1, e não são tocados |
| Confira os diretórios após cada `update` | Para verificar que nada próprio foi removido |

O ajuste do `openspec/config.yaml` é feito pelo Roteiro de Entrega, depois da configuração do agente.

**Playwright.** O executor de testes do Playwright é dependência de desenvolvimento da aplicação, declarada na stack da solução, e sua instalação no projeto está no Roteiro de Entrega. O comando abaixo gera os prompts que o agente usa para planejar, gerar e corrigir testes de aceite, a partir do executor instalado.

* No diretório raiz do projeto:

```bash
npx playwright init-agents --loop=opencode
```

> O controle do navegador pelo agente vem do servidor MCP do Playwright, registrado pelo APM na seção 2.3. Este comando é outra coisa: gera arquivos de prompt a partir da versão do executor instalada.

* Como o executor ainda não existe nesta atividade, execute este comando **apenas depois** de instalar o executor de testes, no Roteiro de Entrega. Ele está listado aqui porque a geração de prompts é parte da configuração do agente, não da configuração da aplicação.

| Agente | Procedimento |
| :---- | :---- |
| OpenCode | Os arquivos ficam em `.opencode/prompts/` |
| Antigravity | Não há laço específico. **Mova** os arquivos para `.agents/prompts/` |

* Confirme os três prompts gerados: `playwright-test-planner`, `playwright-test-generator` e `playwright-test-healer`.
* Consulte os laços aceitos pela versão instalada com `npx playwright init-agents --help`.

> Regenere esses arquivos após cada atualização do Playwright: eles descrevem a API da versão instalada e envelhecem com ela.

---

## 3. Passos manuais por agente

Execute apenas os do agente em uso.

### 3.1 OpenCode — regras

```json
{
  "instructions": [".agents/rules/*.md"]
}
```

### 3.2 OpenCode — hooks

Hooks se registram em plugins. Crie `.opencode/plugins/garantias/index.ts`:

```typescript
import { Plugin } from "@opencode/plugin";

export default Plugin.define({
  id: "garantias-do-projeto",
  setup(ctx) {
    // delega aos mesmos scripts de .apm/hooks/bin/
    ctx.tool.hook("execute.before", async (input) => {});
    ctx.tool.hook("execute.after", async (input) => {});
  },
});
```

Domínios de hook: `ctx.session`, `ctx.permission`, `ctx.shell` e `ctx.tool`.

### 3.3 Antigravity — subagentes

Não há primitivo de subagente. O papel se obtém com uma sessão nova mais um arquivo em `.agents/rules/` de gatilho manual, invocado com `@revisor`:

```markdown
---
trigger: manual
description: Papel de revisor — produz achados sobre o diff, sem alterar arquivos
---
```

A restrição de escrita é garantida por um hook que bloqueia as ferramentas de gravação, mantido com `"enabled": false` no `.agents/hooks.json` e ativado durante as sessões de revisão.

### 3.4 OpenCode — permissões do subagente

Acrescente ao arquivo gerado em `.opencode/agents/<nome>.md`:

```markdown
---
mode: subagent
permissions:
  - action: read
    resource: "*"
    effect: allow
  - action: edit
    resource: "*"
    effect: deny
  - action: shell
    resource: "*"
    effect: deny
---
```

Em `permissions`, **a última regra que casa prevalece**: as amplas vêm primeiro e as exceções depois. Ações usadas: `shell`, `edit`, `read` e `subagent`.

### 3.5 Antigravity — recarga dos servidores MCP

Painel **Agent** → **Additional options** → **MCP Store** → **Manage MCP Servers** → **View raw config**. Confirme um **único bloco `mcpServers`** e acione **Refresh**.

---

## 4. Disciplina de uso do agente

Esta seção não instala nada: ela estabelece como operar o que a seção 2 implantou. Pode ficar para depois do esqueleto andante, na seção 6 do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md), quando já existir volume de uso suficiente para as diferenças aparecerem.

### 4.1 Inventário de recomendação e garantia

Uma skill é consultiva: orienta e pode ser ignorada. Um hook é determinístico: executa sempre e pode bloquear a ação. Daí a regra — **política que precisa valer sempre exige um hook por trás dela.**

* Abra o `AGENTS.md` e classifique cada regra ali declarada:

| Classificação | Critério | Onde fica |
| :---- | :---- | :---- |
| Recomendação aceitável | O desvio é visível na revisão e barato de corrigir | `AGENTS.md` ou skill |
| Exige garantia | O desvio é caro, silencioso ou irreversível | Hook, conforme a seção 2.4 |

* Registre a tabela em `docs/ai-log.md`.
* Os quatro hooks da seção 2.4 são o mínimo. Acrescente os que a classificação indicar.

### 4.2 Sessões paralelas

Duas sessões no mesmo diretório competem pelo índice do Git e produzem estados incoerentes. O isolamento é obtido com árvores de trabalho, uma por mudança em andamento.

```bash
git worktree add ../projeto-mudanca-a -b mudanca-a
git worktree list
git worktree remove ../projeto-mudanca-a
```

* Abra uma sessão do agente em cada diretório, com uma mudança por sessão.

> Limite o paralelismo ao que a revisão alcança. Três mudanças geradas em paralelo e revisadas por amostragem equivalem a uma mudança revisada, com o custo de três.

### 4.3 Experimento de harness

Execute uma vez, para observar o efeito da configuração sobre o resultado.

* Escolha uma tarefa do `tasks.md` de uma mudança ainda não implementada.
* Execute-a em duas configurações, variando **um** fator: dois modelos com o mesmo harness; agente de planejamento antes da execução versus execução direta; ou `AGENTS.md` completo versus mínimo.
* Compare resultado, aderência às convenções, tokens consumidos e número de intervenções.
* Registre a comparação em `docs/ai-log.md`.

---

## 5. Verificação

* [ ] Agente instalado, com o diretório do projeto aberto e modelo selecionado
* [ ] `.env` criado, com as chaves do agente e dos modelos, listado no `.gitignore`, e `.env.example` versionado
* [ ] `apm.yml` versionado, com `apm_modules/` no `.gitignore`
* [ ] `apm install` concluído e `apm audit` sem pendências
* [ ] Regras, skills, servidores MCP, hooks e subagentes presentes nos diretórios do agente em uso
* [ ] Passos manuais da seção 3 correspondentes ao agente em uso executados
* [ ] Context7 respondendo a uma consulta de documentação em sessão nova
* [ ] `openspec view` respondendo pela CLI invocada por `npx`, com `openspec/` criado e comandos/skills presentes nos diretórios do agente em uso
* [ ] Prompts de teste do Playwright gerados (`playwright-test-planner`, `playwright-test-generator`, `playwright-test-healer`) no diretório do agente em uso
* [ ] Quatro hooks ativos, com os scripts de decisão versionados em `.apm/hooks/bin/`
* [ ] Três subagentes disponíveis, com o revisor sem permissão de escrita
* [ ] Inventário de recomendação e garantia registrado em `docs/ai-log.md`
* [ ] Comparação de tokens antes e depois da seção 4 registrada em `docs/ai-log.md`

Concluída a configuração, inicie o [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md).
