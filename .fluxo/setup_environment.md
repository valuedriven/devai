# Setup do ambiente de desenvolvimento

Este documento configura o **agente de desenvolvimento** usado no Roteiro de Entrega, no ambiente de referência da disciplina: o Google Antigravity.

Se você preferir um ambiente inteiramente open source, com providers de modelos, OmniRoute e OpenCode, siga o [Setup do ambiente open source](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/setup_environment_opensource.md) em lugar deste documento. Os dois caminhos levam ao mesmo resultado; o restante do roteiro funciona igual nos dois.

Escopo deste documento: instalação do agente, servidores MCP, skills, comandos do OpenSpec e agentes do Playwright. As demais ferramentas e contas estão nos pré-requisitos do Roteiro de Entrega.

---

## 1. Instalação do agente

* Instale o Google Antigravity, conforme as orientações em <https://antigravity.google>.
* Abra o projeto no Antigravity.
* Selecione o painel **Agent**.

### Gerenciamento de sessões

Inicie uma sessão nova para cada tarefa. No painel Agent, use o comando **+**, opção **Start a New Conversation**.

Esse hábito não é estético: cada sessão carrega o contexto acumulado, e contexto irrelevante da tarefa anterior degrada o resultado da seguinte.

### Escolha de modelos

* Para planejamento, prefira modelos com maior capacidade de raciocínio ou "thinking".
* Para execução, modelos mais rápidos e baratos costumam bastar.
* Para revisão, use uma sessão nova ou um modelo diferente do que implementou.

---

## 2. Variáveis de ambiente do agente

O arquivo `.env` do projeto é criado no Roteiro de Entrega. Acrescente a ele a variável consumida pelos servidores MCP configurados aqui:

```bash
# Context7 — documentação atualizada de bibliotecas
# https://context7.com/dashboard
# Seção API Keys, comando Create API Key
CONTEXT7_API_KEY=
```

Confirme que `.env` está listado no `.gitignore` antes de preencher qualquer valor.

---

## 3. Servidores MCP

O **Context7** fornece ao agente documentação atualizada das bibliotecas usadas no projeto, o que reduz respostas baseadas em versões antigas aprendidas no treinamento.

* No painel **Agent**, selecione **Additional options** (ícone de três pontos).
* Na seção **MCP Store**, acione **Manage MCP Servers**.
* No painel **Manage MCP servers**, acione **View raw config**.
* Substitua o conteúdo existente pelo seguinte, trocando o valor pela chave obtida:

```json
{
  "mcpServers": {
    "context7": {
      "serverUrl": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "<CONTEXT7_API_KEY>"
      }
    }
  }
}
```

* Salve o arquivo.
* No painel **Manage MCP servers**, acione **Refresh**.

### Verificação

Em uma nova sessão do agente, execute:

```text
Use o Context7 para consultar a documentação atual do Next.js sobre App Router e
resuma as mudanças em relação ao Pages Router.
```

> Não configure servidor MCP da ferramenta de prototipação. Os protótipos foram exportados para `docs/prototypes/` na descoberta, e é de lá que o agente deve lê-los.

---

## 4. Skills

Skills são instruções específicas, carregadas sob demanda pelo agente. Os comandos a seguir criam a estrutura:

```text
.agents/
├── skills/
    <nome da skill>/
    ├── SKILL.md          # obrigatório: metadados e instruções
    ├── scripts/          # opcional: código executável
    ├── references/       # opcional: documentação
    └── assets/           # opcional: templates e recursos
```

> **Antes de instalar qualquer skill de terceiros, abra o `SKILL.md` e os scripts e leia.** Skills são instruções e código que entram no seu ambiente: podem conter instruções que o agente obedecerá e scripts que executarão com o seu acesso. Se não for possível ler, não instale.

* Acesse o terminal a partir do diretório raiz do projeto.
* Execute os comandos a seguir.

```bash
npx skills add https://github.com/hashicorp/agent-skills --yes --agent universal --skill terraform-style-guide

npx skills add https://github.com/vercel/next.js/tree/canary/skills --yes --agent universal --skill next-best-practices next-cache-components deploy-to-vercel react-best-practices web-design-guidelines composition-patterns

npx skills add https://github.com/prisma/skills --yes --agent universal --skill prisma-database-setup

npx skills add https://github.com/supabase/agent-skills --yes --agent universal

npx skills add https://github.com/clerk/skills --yes --agent universal --skill clerk-setup clerk

npx skills add https://github.com/mattpocock/skills --yes --agent universal --skill improve-codebase-architecture

npx skills add https://github.com/addyosmani/agent-skills --yes --agent universal --skill frontend-ui-engineering code-review-and-quality ci-cd-and-automation

npx skills add https://github.com/sickn33/antigravity-awesome-skills --yes --agent universal --skill backend-architect nestjs-expert docker-expert github-actions-templates
```

* Verifique no diretório `.agents` se as skills foram instaladas.

Outras skills podem ser encontradas em marketplaces como <https://skillsmp.com/> e <https://skills.sh/>.

Skills de testes e qualidade do projeto de referência:

* [Testes de unidade](https://github.com/valuedriven/devai/blob/main/.agents/skills/jest-unit-tests/SKILL.md)
* [Testes de integração](https://github.com/valuedriven/devai/blob/main/.agents/skills/supertest-integration-test/SKILL.md)
* [Testes end-to-end](https://github.com/valuedriven/devai/blob/main/.agents/skills/playwright-e2e-tests/SKILL.md)
* [Gate de qualidade](https://github.com/valuedriven/devai/blob/main/.agents/skills/quality-gate/SKILL.md)

---

## 5. Comandos do OpenSpec

O OpenSpec instala comandos e skills no diretório do agente. Esta etapa precisa ser executada antes da seção de criação do backlog, no Roteiro de Entrega.

* Certifique-se de que o OpenSpec esteja instalado, conforme <https://openspec.dev/>.
* Acesse o terminal no diretório raiz do projeto.
* Inicialize o OpenSpec:

```bash
openspec init --tools antigravity
```

> Para inicializar mais de uma ferramenta, separe os nomes por vírgula **sem espaço**: `--tools antigravity,opencode`. Um espaço após a vírgula faz o shell tratar o segundo nome como argumento separado, e a inicialização falha.

* Como resultado, devem existir as seguintes estruturas:

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

### Verificação

```bash
openspec view
```

---

## 6. Agentes do Playwright

Esta etapa prepara o agente para planejar, gerar e corrigir testes de aceite. Ela pressupõe o Playwright instalado, conforme os pré-requisitos do Roteiro de Entrega.

* Acrescente o servidor MCP do Playwright à configuração do Antigravity, mantendo o bloco `mcpServers` único:

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

* Inicialize os agentes do Playwright:

```bash
npx playwright init-agents --loop=opencode
```

> O Playwright não possui, por enquanto, configuração específica para o Antigravity. Por isso a inicialização usa o alvo `opencode` e os arquivos criados em `.opencode/prompts/` devem ser copiados para `.agents/prompts/`.

* Verifique a criação dos arquivos:

```text
.agents
└── prompts
    ├── playwright-test-generator.md
    ├── playwright-test-healer.md
    └── playwright-test-planner.md
```

---

## 7. Verificação final do ambiente

* [ ] Antigravity instalado e projeto aberto
* [ ] `CONTEXT7_API_KEY` no `.env`, com `.env` no `.gitignore`
* [ ] MCP do Context7 respondendo a uma consulta de documentação
* [ ] Skills instaladas em `.agents/skills/`, com os `SKILL.md` lidos antes da instalação
* [ ] `openspec view` executando sem erro
* [ ] Prompts do Playwright presentes em `.agents/prompts/`

Concluído o setup, retome o Roteiro de Entrega na seção de criação do `AGENTS.md`.
