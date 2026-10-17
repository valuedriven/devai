# Configuração do agente — Google Antigravity

Este documento cobre **apenas a configuração específica do Google Antigravity** como agente de desenvolvimento: instalação, sessões, servidores MCP, skills, regras, hooks, subagentes e a inicialização das ferramentas que exigem indicar qual agente está em uso.

As ferramentas que não dependem do agente — Node.js, OpenSpec, Playwright, catálogo de skills do projeto, `.env` e `.gitignore` — são instaladas na seção **Ferramentas do projeto** do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md), que deve ser concluída antes deste documento.

Alternativa inteiramente open source: [Configuração do agente — OpenCode](https://github.com/valuedriven/devai/blob/main/.fluxo/setup_environment_opensource.md). Os dois caminhos levam ao mesmo resultado, e o Roteiro de Entrega funciona igual nos dois.

---

## 1. Instalação

* Instale o Google Antigravity conforme as orientações em <https://antigravity.google>.
* Abra o diretório do projeto no Antigravity.
* Selecione o painel **Agent**.

---

## 2. Sessões e modelos

### Sessões

Inicie uma sessão nova para cada tarefa. No painel **Agent**, use o comando **+**, opção **Start a New Conversation**.

Cada sessão carrega o contexto acumulado, e contexto irrelevante da tarefa anterior degrada o resultado da seguinte.

### Seleção de modelo

O seletor de modelo fica no rodapé do painel **Agent**.

| Fase | Perfil de modelo |
| :---- | :---- |
| Planejamento | Maior capacidade de raciocínio, com modo *thinking* quando disponível |
| Execução | Mais rápido e barato |
| Revisão | Sessão nova, ou modelo diferente do que implementou |

---

## 3. Servidores MCP

O Model Context Protocol (MCP) dá ao agente acesso a dados e ferramentas externas. A configuração fica em um único arquivo JSON, gerenciado pelo painel.

### Como registrar um servidor MCP

* No painel **Agent**, selecione **Additional options** (ícone de três pontos).
* Na seção **MCP Store**, acione **Manage MCP Servers**.
* No painel **Manage MCP servers**, acione **View raw config**.
* Edite o arquivo mantendo **um único bloco `mcpServers`** e salve.
* De volta ao painel **Manage MCP servers**, acione **Refresh**.

### Configuração usada no projeto

Dois servidores são usados ao longo do Roteiro de Entrega: o **Context7**, que fornece documentação atualizada das bibliotecas e reduz respostas baseadas em versões antigas aprendidas no treinamento, e o **Playwright**, que permite ao agente operar o navegador ao planejar e corrigir testes de aceite.

```json
{
  "mcpServers": {
    "context7": {
      "serverUrl": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "<CONTEXT7_API_KEY>"
      }
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"]
    }
  }
}
```

Substitua `<CONTEXT7_API_KEY>` pela chave registrada no `.env` do projeto.

> Não configure servidor MCP da ferramenta de prototipação. Os protótipos são exportados para `docs/prototypes/` na descoberta, e é de lá que o agente deve lê-los.

### Verificação

Em uma sessão nova do agente:

```text
Use o Context7 para consultar a documentação atual do Next.js sobre App Router e
resuma as mudanças em relação ao Pages Router.
```

---

## 4. Skills

Skills são instruções específicas carregadas sob demanda. O Antigravity lê o diretório `.agents/skills/` do projeto:

```text
.agents/
└── skills/
    └── <nome-da-skill>/
        ├── SKILL.md          # obrigatório: metadados e instruções
        ├── scripts/          # opcional: código executável
        ├── references/       # opcional: documentação
        └── assets/           # opcional: modelos e recursos
```

O catálogo de skills instalado no projeto está na seção **Ferramentas do projeto** do Roteiro de Entrega, porque independe do agente: os mesmos comandos servem aos dois ambientes.

### Verificação

* Confirme que os diretórios existem em `.agents/skills/`.
* Em uma sessão nova, peça ao agente que liste as skills disponíveis.

---

## 5. Regras do projeto

Regras são instruções persistentes que o Antigravity injeta no contexto automaticamente, sem depender de o usuário mencioná-las.

### Onde o Antigravity procura regras

| Caminho | Comportamento |
| :---- | :---- |
| `AGENTS.md` na raiz do projeto | Sempre ativo no escopo do diretório; dispensa *frontmatter* |
| `.agents/AGENTS.md` | Equivalente ao anterior |
| `.agents/rules/*.md` | Exige *frontmatter* YAML com um `trigger` válido |
| `~/.gemini/AGENTS.md` | Global, válido para todos os projetos |

O conteúdo do `AGENTS.md` do projeto é definido na seção **Preparação do agente** do Roteiro de Entrega.

### Regras com gatilho

Arquivos em `.agents/rules/` precisam começar com *frontmatter*. Arquivos sem *frontmatter* ou com `trigger` não reconhecido são descartados em silêncio.

```markdown
---
trigger: glob
globs: "**/*.test.ts, **/*.spec.ts"
description: Convenções de teste do projeto
---

Conteúdo da regra.
```

| `trigger` | Quando o conteúdo entra no contexto |
| :---- | :---- |
| `always_on` | Em todo turno |
| `glob` | Quando o agente trabalha em arquivos que casam com `globs` (obrigatório) |
| `model_decision` | O agente lê a regra quando a tarefa corresponde à `description` (obrigatória) |
| `manual` | Apenas quando mencionada com `@` no chat |

> Cada arquivo de regra é truncado acima de 24.000 bytes, e as regras globais e `always_on` dividem um orçamento de 20.000 tokens. Regras longas competem com o código pelo mesmo espaço de contexto: prefira poucas e curtas.

Referência: [Rules — Antigravity](https://antigravity.google/docs/rules).

---

## 6. Hooks de ciclo de vida

Hooks executam comandos em pontos definidos do ciclo do agente. São úteis para aplicar verificações automáticas sem depender de o modelo lembrar de executá-las.

### Onde configurar

| Caminho | Escopo |
| :---- | :---- |
| `.agents/hooks.json` | Projeto |
| `~/.gemini/config/hooks.json` | Global |

### Formato

Cada chave de primeiro nível é o nome do hook e mapeia para os eventos disponíveis.

| Evento | Quando dispara | Aceita `matcher` |
| :---- | :---- | :---- |
| `SessionStart` | Uma vez, antes da primeira chamada ao modelo | Não |
| `PreInvocation` | Antes de cada chamada ao modelo | Não |
| `PostInvocation` | Após cada chamada ao modelo | Não |
| `PreToolUse` | Antes de uma ferramenta executar | Sim |
| `PostToolUse` | Após uma ferramenta concluir | Sim |
| `Stop` | Ao encerrar a execução | Não |

`PreToolUse` e `PostToolUse` recebem uma lista de objetos com `matcher`, uma expressão regular sobre o nome da ferramenta, e a lista `hooks`. Os demais recebem os manipuladores diretamente. Cada manipulador aceita `command` (obrigatório), `type` (apenas `"command"`) e `timeout` em segundos, cujo padrão é 30. A chave opcional `enabled` desativa o hook sem removê-lo.

Exemplo: formatar o código sempre que o agente gravar um arquivo.

```json
{
  "format-on-write": {
    "PostToolUse": [
      {
        "matcher": "write_file|edit_file",
        "hooks": [
          {
            "type": "command",
            "command": "npm run format",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

Hooks recebem JSON em `stdin` e devolvem JSON em `stdout`, com nomes de campo em *camelCase*.

### Hooks exigidos pelo projeto

O Roteiro de Entrega, na seção 7.5, pede que quatro políticas tenham garantia em lugar de recomendação. No Antigravity, são estes os hooks correspondentes:

```json
{
  "bloquear-segredo-no-commit": {
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          { "type": "command", "command": ".agents/hooks/verifica-segredo.sh", "timeout": 30 }
        ]
      }
    ]
  },
  "format-on-write": {
    "PostToolUse": [
      {
        "matcher": "write_file|edit_file",
        "hooks": [
          { "type": "command", "command": "npm run format", "timeout": 60 }
        ]
      }
    ]
  },
  "suite-antes-do-commit": {
    "PreToolUse": [
      {
        "matcher": "run_command",
        "hooks": [
          { "type": "command", "command": ".agents/hooks/suite-se-commit.sh", "timeout": 300 }
        ]
      }
    ]
  }
}
```

Os dois scripts leem o JSON recebido em `stdin`, verificam se o comando a executar é um `git commit` e, em caso afirmativo, inspecionam o diff ou executam a suíte, devolvendo em `stdout` o JSON que autoriza ou bloqueia a ação.

> A lógica de decisão fica nos scripts, e não no `hooks.json`: assim ela é versionada, testável e legível. Uma regra escrita apenas no `AGENTS.md` é recomendação; o hook é o que a torna garantia.

Referência: [Hooks — Antigravity](https://antigravity.google/docs/hooks).

---

## 7. Subagentes do projeto

O Roteiro de Entrega, na seção 7.6, pede três papéis com contexto e permissões próprios: **revisor**, **executor de suíte** e **explorador**. O essencial de cada um é a restrição de ferramentas — o revisor que pode editar o código não está revisando, está corrigindo, e perde-se a separação entre quem produz e quem julga.

No Antigravity, os três papéis são obtidos pela combinação de dois mecanismos já documentados acima: uma **sessão nova** por papel, que garante o contexto próprio, e um **arquivo de regra com `trigger: manual`**, que carrega as instruções do papel apenas quando invocado com `@`.

* Crie `.agents/rules/revisor.md`:

```markdown
---
trigger: manual
description: Papel de revisor — produz achados sobre o diff, sem alterar arquivos
---

Ao atuar neste papel:

- Leia o diff da mudança e a política de revisão em REVIEW.md.
- Para cada achado, informe arquivo e linha, severidade segundo a política, o que está
  errado e o que a correção exigiria.
- Não altere nenhum arquivo. Não execute comandos que gravem.
- Não emita veredito de aprovação: a revisão produz achados, e aprovação não é achado.
```

* Crie, da mesma forma, `.agents/rules/executor-suite.md` e `.agents/rules/explorador.md`, com as respectivas instruções.
* Invoque o papel em uma sessão nova, com `@revisor`.

### A garantia da restrição de leitura

A regra acima é uma recomendação: pede que o revisor não grave. A garantia vem de um hook que bloqueia as ferramentas de escrita durante a sessão de revisão.

```json
{
  "revisao-somente-leitura": {
    "PreToolUse": [
      {
        "matcher": "write_file|edit_file|run_command",
        "hooks": [
          { "type": "command", "command": ".agents/hooks/bloqueia-escrita.sh", "timeout": 30 }
        ]
      }
    ],
    "enabled": false
  }
}
```

O hook é mantido com `enabled: false` e ativado durante as sessões de revisão. O script devolve, em `stdout`, o JSON que nega a execução.

> É a mesma distinção da seção 7.5 do Roteiro de Entrega, aplicada aqui: a regra orienta o papel; o hook é o que impede o desvio.

---

## 8. Inicialização do OpenSpec para o Antigravity

O OpenSpec já foi instalado na seção **Ferramentas do projeto** do Roteiro de Entrega. Resta inicializá-lo indicando o agente em uso, o que instala comandos, regras e workflows no diretório que o Antigravity lê.

* No terminal, a partir do diretório raiz do projeto:

```bash
openspec init --tools antigravity
```

> Para inicializar mais de uma ferramenta, separe os nomes por vírgula **sem espaço**: `--tools antigravity,opencode`. Um espaço após a vírgula faz o shell tratar o segundo nome como argumento separado, e a inicialização falha.

* Confirme a estrutura resultante:

```text
├── .agents
│   ├── commands/
│   ├── rules/
│   ├── skills/
│   └── workflows/
├── openspec
│   ├── changes/
│   ├── config.yaml
│   └── specs/
```

> Caso tenha sido criada a pasta `.agent`, no singular, mova seu conteúdo para `.agents`.

### Convivência com os arquivos do projeto

O `openspec init` grava em `.agents/commands/`, `.agents/rules/`, `.agents/skills/` e `.agents/workflows/`, e o `openspec update` **reescreve** esses arquivos — operação executada após atualização da CLI ou mudança de perfil. Daí três cuidados:

| Cuidado | Razão |
| :---- | :---- |
| Não edite os arquivos gerados pelo OpenSpec | `openspec update` os sobrescreve, e a edição se perde |
| Mantenha as regras do projeto em arquivos próprios | `.agents/rules/revisor.md` e similares não são gerados, e permanecem |
| Confira `.agents/rules/` após cada `openspec update` | Para verificar que as regras próprias continuam presentes |

O ajuste do `openspec/config.yaml` — inclusive a declaração dos artefatos de verificação do projeto — é feito na seção 5 do Roteiro de Entrega, depois desta configuração.

### Verificação

```bash
openspec view
```

---

## 9. Inicialização dos agentes do Playwright

O Playwright já foi instalado na seção **Ferramentas do projeto** do Roteiro de Entrega. Esta etapa gera os prompts que o agente usa para planejar, gerar e corrigir testes de aceite.

```bash
npx playwright init-agents --loop=opencode
```

> O Playwright não possui, por enquanto, alvo específico para o Antigravity. Por isso a inicialização usa o alvo `opencode`, e os arquivos criados em `.opencode/prompts/` devem ser **movidos** para `.agents/prompts/`.

* Confirme a estrutura resultante:

```text
.agents
└── prompts
    ├── playwright-test-generator.md
    ├── playwright-test-healer.md
    └── playwright-test-planner.md
```

---

## 10. Verificação final

* [ ] Antigravity instalado, com o diretório do projeto aberto
* [ ] Modelo selecionado no painel **Agent**
* [ ] Bloco `mcpServers` único, com Context7 e Playwright
* [ ] Context7 respondendo a uma consulta de documentação
* [ ] Skills visíveis em `.agents/skills/`
* [ ] `AGENTS.md` sendo lido pelo agente
* [ ] Hooks de formatação, de segredo e de suíte declarados em `.agents/hooks.json`
* [ ] Regras dos três papéis em `.agents/rules/`, com `trigger: manual`
* [ ] `openspec view` executando sem erro
* [ ] Prompts do Playwright em `.agents/prompts/`

Concluída a configuração, retome o Roteiro de Entrega na seção **Preparação do agente**.
