# Roteiro de Configuração do Ambiente

Roteiro de configuração do agente de desenvolvimento. Ele parte das ferramentas já instaladas conforme o [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md), e produz regras, skills, servidores MCP, hooks e subagentes implantados no agente escolhido.

Execute-o entre as seções 3 e 4 do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md).

| Seção | Resultado |
| :---- | :---- |
| 1 | Agente escolhido e em execução sobre o diretório do projeto |
| 2 | `apm.yml` versionado e configuração implantada |
| 3 | Passos manuais do agente em uso executados |
| 4 | Ferramentas de contexto e custo integradas |

---

## 1. Agente

* Instale **um** dos três agentes da seção 2 do catálogo de ferramentas.
* Abra o diretório raiz do projeto no agente.
* Inicie uma sessão nova para cada tarefa.

| Agente | Identificador nas CLIs | Nova sessão | Diretório de configuração |
| :---- | :---- | :---- | :---- |
| Antigravity | `antigravity` | Painel **Agent**, comando **+**, opção **Start a New Conversation** | `.agents/` |
| OpenCode | `opencode` | `/new` na área de prompt | `.opencode/` e `.agents/` |
| DeepSeek Harness | `dsh` | Nova sessão do perfil em uso | `$DSH_HOME/profiles/<perfil>/` e `.agents/` |

Perfil de modelo por fase do ciclo planejar/executar:

| Fase | Perfil de modelo |
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

* Acrescente ao `.env` do projeto:

```bash
# OmniRoute — painel em http://localhost:20128/ → API Key Manager → Create API key
OMNIROUTE_API_KEY=
```

> Mantenha **um único `$schema`** e um único objeto raiz. A seção 2 acrescenta as chaves `mcp`, `instructions` e `agents` a este mesmo arquivo; blocos repetidos ou aninhados produzem JSON inválido, e o agente não carrega a configuração.

### 1.2 DeepSeek Harness — perfil

* Abra uma sessão, o que inicializa o perfil a partir dos modelos embarcados:

```bash
dsh web
```

* Inspecione a configuração efetiva do perfil:

```bash
dsh --profile web --dump-config
```

| Arquivo em `$DSH_HOME` | Conteúdo |
| :---- | :---- |
| `settings.yaml` | Rotas de provider e modelo padrão |
| `.credentials.yaml` | Chaves de acesso |
| `profiles/<perfil>/cordis.patch.yml` | Plugins do perfil: servidores MCP, hooks e subagentes |

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

```yaml
name: <nome-do-projeto>
version: 1.0.0

targets:
  - antigravity
  - opencode
  - agent-skills

dependencies:
  apm:
    # catálogo de skills da stack do projeto, conforme os Requisitos do Projeto
    - <dono>/<repositório>
    - git: https://github.com/<dono>/<repositório>.git
      path: skills
      skills: [<skill-a>, <skill-b>]

  mcp:
    - name: context7
      transport: http
      url: https://mcp.context7.com/mcp
      registry: false
      headers:
        CONTEXT7_API_KEY: ${CONTEXT7_API_KEY}
    - name: playwright
      transport: stdio
      command: npx
      args: ["-y", "@playwright/mcp@latest"]
      registry: false
```

| Campo | Regra |
| :---- | :---- |
| `name`, `version` | Obrigatórios |
| `targets` | Aceita `antigravity`, `opencode`, `agent-skills`, `claude`, `copilot`, `cursor`, `codex`, `gemini`, `grok-build`, `windsurf` e `kiro`. Valor desconhecido interrompe a leitura com erro |
| `agent-skills` | Implanta apenas skills, em `.agents/skills/`. É o alvo que atende o DeepSeek Harness, sem alvo próprio no APM |
| `dependencies.apm` | Cadeia `<dono>/<repositório>`, com `#<versão>` opcional, ou objeto com `git`, `path`, `ref` e `skills` |
| `dependencies.mcp` | `name` obrigatório; `transport` obrigatório quando `registry: false` |

As skills da stack do projeto são declaradas conforme a seção 6 dos [Requisitos do Projeto](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_do_projeto.md).

> **Antes de declarar qualquer dependência de terceiros, abra o `SKILL.md` e os scripts e leia.** Skills são instruções e código que entram no ambiente: podem conter instruções que o agente obedecerá e scripts que executarão com o acesso de quem os executa. Se não for possível ler, não declare.

### 2.3 Instalação

```bash
apm install --dry-run      # mostra o que seria gravado, com as variáveis resolvidas
apm install                # grava
apm audit                  # audita as dependências
apm list                   # lista o que foi implantado
```

Comandos que dispensam editar o manifesto à mão:

```bash
apm install <dono>/<repositório> --skill <nome>                      # uma skill de um pacote
apm install --mcp io.github.github/github-mcp-server --transport http # servidor do registro público
apm marketplace add github/awesome-copilot                            # registra um marketplace
```

> Use `apm install --frozen` na integração contínua: ele falha se o manifesto e o arquivo de travamento divergirem, em vez de resolver versões novas em silêncio.

> A chave do Context7 vem do `.env`, criado na seção 3 do Roteiro de Entrega. Crie o `.env` antes do `apm install`, ou o servidor subirá sem credencial.

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

**Hook**, em `.apm/hooks/<nome>.json`. O projeto declara quatro, com a lógica de decisão em scripts versionados em `.apm/hooks/bin/`, compartilhados pelos três agentes:

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

| Primitivo | Antigravity | OpenCode | DeepSeek Harness |
| :---- | :---- | :---- | :---- |
| Regras | `.agents/rules/` pelo APM | passo manual 3.1 | `AGENTS.md` |
| Skills | `.agents/skills/` pelo APM | `.agents/skills/` pelo APM | `.agents/skills/`, varrido sem configuração |
| MCP | `.agents/mcp_config.json` pelo APM | bloco `mcp` do `opencode.json` pelo APM | passo manual 3.2 |
| Hooks | `.agents/hooks.json` pelo APM | passo manual 3.3 | passo manual 3.4 |
| Subagentes | passo manual 3.5 | `.opencode/agents/` pelo APM, com o ajuste 3.6 | passo manual 3.7 |
| Comandos | workflows do OpenSpec | `.opencode/commands/` pelo APM | não há arquivos de comando |

* Skills são o primitivo portável: os três leem o mesmo diretório e o mesmo formato. O que puder ser skill, seja skill.
* Regras longas competem com o código pelo mesmo espaço de contexto. No Antigravity, cada arquivo de regra é truncado acima de 24.000 bytes, e as regras globais e sempre ativas dividem 20.000 tokens; no DeepSeek Harness, o `AGENTS.md` tem orçamento de 65.536 bytes.

---

## 3. Passos manuais por agente

Execute apenas os do agente em uso.

### 3.1 OpenCode — regras

```json
{
  "instructions": [".agents/rules/*.md"]
}
```

### 3.2 DeepSeek Harness — servidores MCP

No `cordis.patch.yml` do perfil. Nenhum servidor é habilitado por padrão.

```yaml
- insert:
    - id: mcp-context7
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: context7
        transport: streamable-http
        url: https://mcp.context7.com/mcp
        headers:
          CONTEXT7_API_KEY: !!js process.env.CONTEXT7_API_KEY
    - id: mcp-playwright
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: playwright
        transport: stdio
        command: npx
        args: ['-y', '@playwright/mcp@latest']
```

Transportes aceitos: `streamable-http` e `stdio`. As ferramentas aparecem sob o prefixo `mcp__<serverName>__<ferramenta>`.

### 3.3 OpenCode — hooks

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

### 3.4 DeepSeek Harness — hooks

A ponte executa o `hooks.json` já gerado para o Antigravity, com os mesmos scripts.

```bash
dsh plugin --profile web add @deepseek-ai/dsh-hooks-claude-code
```

### 3.5 Antigravity — subagentes

Não há primitivo de subagente. O papel se obtém com uma sessão nova mais um arquivo em `.agents/rules/` de gatilho manual, invocado com `@revisor`:

```markdown
---
trigger: manual
description: Papel de revisor — produz achados sobre o diff, sem alterar arquivos
---
```

A restrição de escrita é garantida por um hook que bloqueia as ferramentas de gravação, mantido com `"enabled": false` no `.agents/hooks.json` e ativado durante as sessões de revisão.

### 3.6 OpenCode — permissões do subagente

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

### 3.7 DeepSeek Harness — subagentes

```bash
dsh plugin --profile web add @deepseek-ai/dsh-subagent-claude-code
```

```yaml
- insert:
    - id: subagent-claude-code
      name: '@deepseek-ai/dsh-subagent-claude-code'
      config:
        permissionMode: plan
```

> Cada agente delegado inicia frio, sem herdar o contexto da sessão que o chamou. O que ele precisa saber tem de estar no `description`, no corpo do papel ou nos arquivos que ele mesmo abrir.

### 3.8 Antigravity — recarga dos servidores MCP

Painel **Agent** → **Additional options** → **MCP Store** → **Manage MCP Servers** → **View raw config**. Confirme um **único bloco `mcpServers`** e acione **Refresh**.

---

## 4. Contexto e custo

Integração das ferramentas da seção 9 do catálogo. Execute depois que o esqueleto andante estiver de pé, quando já existir volume de uso suficiente para a diferença aparecer.

### 4.1 rtk

```bash
rtk init -g --agent antigravity     # ou --agent opencode
rtk --version
rtk init --show
rtk gain
```

* Reinicie o agente após o `init`.
* Confira os agentes aceitos pela versão instalada com `rtk init --help`. Se o agente em uso não constar, o proxy ainda funciona a partir do terminal, sem integração automática.
* Registre o valor de `rtk gain` em `docs/ai-log.md` antes e depois da adoção.

### 4.2 caveman

* Declare a skill em `dependencies.apm` no `apm.yml` e instale:

```bash
apm install JuliusBrussee/caveman
caveman setup --install      # apenas se for usar também o proxy
```

* Intensidade, dentro da sessão: `/caveman lite`, `/caveman full`, `/caveman off`.

> A skill acrescenta as próprias regras ao contexto de cada turno, o que consome tokens de entrada. O ganho líquido aparece em sessões com respostas longas, e não em trocas curtas. Meça antes de concluir.

### 4.3 ai-observer

* Painel em `http://localhost:8080`.
* Configure o agente para exportar telemetria ao endpoint OTLP `http://localhost:4318`, conforme a documentação da ferramenta em uso.

### 4.4 Comparação registrada

* Escolha uma mudança do backlog ainda não implementada.
* Execute-a antes e depois de ativar as ferramentas desta seção.
* Compare tokens de entrada, tokens de saída, tempo e número de intervenções necessárias.
* Registre a comparação em `docs/ai-log.md`.

### 4.5 Inventário de recomendação e garantia

Uma skill é consultiva: orienta e pode ser ignorada. Um hook é determinístico: executa sempre e pode bloquear a ação. Daí a regra — **política que precisa valer sempre exige um hook por trás dela.**

* Abra o `AGENTS.md` e classifique cada regra ali declarada:

| Classificação | Critério | Onde fica |
| :---- | :---- | :---- |
| Recomendação aceitável | O desvio é visível na revisão e barato de corrigir | `AGENTS.md` ou skill |
| Exige garantia | O desvio é caro, silencioso ou irreversível | Hook, conforme a seção 2.4 |

* Registre a tabela em `docs/ai-log.md`.
* Os quatro hooks da seção 2.4 são o mínimo. Acrescente os que a classificação indicar.

### 4.6 Sessões paralelas

Duas sessões no mesmo diretório competem pelo índice do Git e produzem estados incoerentes. O isolamento é obtido com árvores de trabalho, uma por mudança em andamento.

```bash
git worktree add ../projeto-mudanca-a -b mudanca-a
git worktree list
git worktree remove ../projeto-mudanca-a
```

* Abra uma sessão do agente em cada diretório, com uma mudança por sessão.

> Limite o paralelismo ao que a revisão alcança. Três mudanças geradas em paralelo e revisadas por amostragem equivalem a uma mudança revisada, com o custo de três.

### 4.7 Experimento de harness

Execute uma vez, para observar o efeito da configuração sobre o resultado.

* Escolha uma tarefa do `tasks.md` de uma mudança ainda não implementada.
* Execute-a em duas configurações, variando **um** fator: dois modelos com o mesmo harness; agente de planejamento antes da execução versus execução direta; ou `AGENTS.md` completo versus mínimo.
* Compare resultado, aderência às convenções, tokens consumidos e número de intervenções.
* Registre a comparação em `docs/ai-log.md`.

---

## 5. Verificação

* [ ] Agente instalado, com o diretório do projeto aberto e modelo selecionado
* [ ] `apm.yml` versionado, com `apm_modules/` no `.gitignore`
* [ ] `apm install` concluído e `apm audit` sem pendências
* [ ] Regras, skills, servidores MCP, hooks e subagentes presentes nos diretórios do agente em uso
* [ ] Passos manuais da seção 3 correspondentes ao agente em uso executados
* [ ] Context7 respondendo a uma consulta de documentação em sessão nova
* [ ] Quatro hooks ativos, com os scripts de decisão versionados em `.apm/hooks/bin/`
* [ ] Três subagentes disponíveis, com o revisor sem permissão de escrita
* [ ] Inventário de recomendação e garantia registrado em `docs/ai-log.md`
* [ ] Comparação de tokens antes e depois da seção 4 registrada em `docs/ai-log.md`

Concluída a configuração, retome o [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md) na seção 4, **Preparação do agente de IA**.
