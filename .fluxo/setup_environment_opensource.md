# Configuração do agente — OpenCode

Este documento cobre **apenas a configuração específica do OpenCode** como agente de desenvolvimento, em um ambiente inteiramente open source: providers de modelos, OmniRoute como gateway, o próprio OpenCode, servidores MCP, skills, regras, plugins e hooks, subagentes, a inicialização das ferramentas que exigem indicar qual agente está em uso e o OpenDesign como ferramenta aberta de prototipação.

As ferramentas que não dependem do agente — Node.js, OpenSpec, Playwright, catálogo de skills do projeto, `.env` e `.gitignore` — são instaladas na seção **Ferramentas do projeto** do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md), que deve ser concluída antes deste documento.

Alternativa com modelos da própria ferramenta: [Configuração do agente — Google Antigravity](https://github.com/valuedriven/devai/blob/main/.fluxo/setup_environment.md). Os dois caminhos levam ao mesmo resultado, e o Roteiro de Entrega funciona igual nos dois.

---

## 1. Providers de modelos

Um **provider** serve modelos por API, com chave, cota e preço próprios. Os provedores a seguir possuem camadas gratuitas; em alguns é necessário adquirir créditos, em outros não.

| Tipo | Característica | Opções |
| :---- | :---- | :---- |
| Fabricante com API própria | Serve os próprios modelos | [Alibaba Model Studio](https://modelstudio.alibabacloud.com/) |
| Plataforma de inferência | Hospeda modelos de terceiros, com foco em desempenho ou catálogo | [Groq](https://groq.com/), [NVIDIA](https://build.nvidia.com/), [Ollama Cloud](https://ollama.com/) |
| Agregador hospedado | Um endpoint e uma chave para modelos de vários fabricantes | [OpenRouter](https://openrouter.ai/), [AgentRouter](https://agentrouter.org/), [OpenCode Zen](https://opencode.ai/br/zen), [OpenCode Go](https://opencode.ai/br/go) |

* Crie contas em **pelo menos dois** providers e obtenha as chaves de acesso. Dois providers permitem que o gateway troque de um para outro quando a cota de um se esgota.

Critérios úteis na escolha, além do preço:

* suporte a chamadas de ferramentas, sem o qual o modelo não serve para uso agêntico;
* tamanho da janela de contexto;
* latência;
* política de uso e retenção de dados;
* estabilidade da camada gratuita.

> Antes de enviar código e documentos do projeto, verifique o que o provider faz com o que recebe. Alguns planos gratuitos usam os dados enviados para treinamento.

---

## 2. OmniRoute

O OmniRoute é um gateway auto-hospedado: centraliza as chaves dos providers, expõe um endpoint único compatível com a API da OpenAI e troca de provider quando um deles atinge a cota.

### Instalação

Instale conforme as orientações em <https://github.com/diegosouzapw/OmniRoute>.

Usuários do Windows com dificuldade na instalação padrão via npm podem usar Docker:

```bash
docker run -d --name omniroute --restart unless-stopped --stop-timeout 40 \
  -p 20128:20128 -v omniroute-data:/app/data diegosouzapw/omniroute:latest
```

A partir da linha de comando:

```bash
omniroute
```

### Configuração

* Acesse o painel em `http://localhost:20128/`.
* **Defina uma senha para o painel na primeira entrada**, em vez de manter a padrão. O painel guarda as chaves de todos os seus providers.
* No menu lateral, acesse **API Key Manager** e acione **Create API key**. Guarde o valor: é a chave do próprio gateway, distinta das chaves dos providers, e será usada pelo agente.
* No menu lateral, acesse **Providers** e configure as conexões com os providers criados na seção 1.
* No menu lateral, acesse **Compression Settings** e selecione **Stacked**.

> A compressão reduz o consumo de tokens em sessões longas, ao custo de alguma fidelidade do contexto. É um bom padrão, mas registre em `docs/ai-log.md` quando um resultado inesperado ocorrer em sessão longa.

> O gateway pode trocar de modelo automaticamente ao encontrar uma cota esgotada. Isso é conveniente e reduz a reprodutibilidade, porque a mesma solicitação pode ser respondida por modelos diferentes. Registre qual modelo respondeu quando o resultado importar.

### Chaves no `.env`

O arquivo `.env` e sua entrada no `.gitignore` são criados na seção **Ferramentas do projeto** do Roteiro de Entrega. Acrescente a ele as variáveis consumidas por este ambiente:

```bash
# OmniRoute — gateway de modelos
# http://localhost:20128/ → API Key Manager → Create API key
OMNIROUTE_API_KEY=

# Context7 — documentação atualizada de bibliotecas
# https://context7.com/dashboard → API Keys → Create API Key
CONTEXT7_API_KEY=
```

Confirme que `.env` está listado no `.gitignore` antes de preencher qualquer valor.

---

## 3. Instalação do OpenCode

* Instale o OpenCode conforme <https://opencode.ai/>.
* Instale o VS Code conforme <https://code.visualstudio.com/>. Como alternativa, o OpenCode também pode ser instalado como extensão do Antigravity.
* No VS Code, menu lateral **Extensions**, busque por `opencode` e acione **Install**.
* Abra a extensão a partir do diretório raiz do projeto.

### Conexão com o gateway

* Na área de prompt:

```text
/connect
```

* Na janela **Connect a provider**, informe `omniroute`.
* Informe a chave de API do OmniRoute obtida na seção 2.
* Em seguida:

```text
/models
```

* Selecione o modelo de preferência, atentando para escolher modelos do provider **OmniRoute**.

Grupos de modelos que costumam funcionar bem para uso agêntico, priorizando as versões mais recentes e gratuitas: DeepSeek, Qwen, Kimi, GLM e MiniMax.

### Sessões e modelos

Inicie uma sessão nova para cada tarefa, com `/new`. Cada sessão carrega o contexto acumulado, e contexto irrelevante da tarefa anterior degrada o resultado da seguinte.

| Fase | Como operar |
| :---- | :---- |
| Planejamento | Agente `plan`, que não tem permissão de edição, com modelo de maior capacidade de raciocínio |
| Execução | Modelo mais rápido e barato |
| Revisão | Sessão nova, ou modelo diferente do que implementou |

---

## 4. Servidores MCP

O Model Context Protocol (MCP) dá ao agente acesso a dados e ferramentas externas. No OpenCode, a configuração fica no `opencode.json`, no diretório raiz do projeto.

### Como registrar um servidor MCP

Servidores remotos usam `"type": "remote"` com `url`; servidores locais usam `"type": "local"` com `command`. Dois servidores são usados ao longo do Roteiro de Entrega: o **Context7**, que fornece documentação atualizada das bibliotecas, e o **Playwright**, que permite ao agente operar o navegador ao planejar e corrigir testes de aceite.

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
  },
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "enabled": true,
      "headers": {
        "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}"
      }
    },
    "playwright": {
      "type": "local",
      "command": ["npx", "-y", "@playwright/mcp@latest"],
      "enabled": true
    }
  }
}
```

Três pontos de atenção:

* **Um único bloco `mcp`**, no nível raiz do arquivo, e um único `$schema`. Blocos aninhados produzem JSON inválido e o agente não carrega a configuração.
* A substituição de variáveis de ambiente usa a forma `{env:NOME_DA_VARIAVEL}`.
* Não configure servidor MCP da ferramenta de prototipação. Os protótipos são exportados para `docs/prototypes/` na descoberta, e é de lá que o agente deve lê-los.

### Verificação

Em uma sessão nova do agente:

```text
Use o Context7 para consultar a documentação atual do Next.js sobre App Router e
resuma as mudanças em relação ao Pages Router.
```

---

## 5. Skills

Skills são instruções específicas carregadas sob demanda. Cada skill é um diretório com um `SKILL.md`.

### Onde o OpenCode procura skills

| Caminho | Escopo |
| :---- | :---- |
| `.opencode/skills/<nome>/SKILL.md` | Projeto |
| `.agents/skills/<nome>/SKILL.md` | Projeto, formato compartilhado entre agentes |
| `.claude/skills/<nome>/SKILL.md` | Projeto, compatibilidade |
| `~/.config/opencode/skills/<nome>/SKILL.md` | Global |

O projeto usa `.agents/skills/`, que é lido pelos dois ambientes.

### Frontmatter obrigatório

```markdown
---
name: quality-gate
description: Executa e interpreta o gate de qualidade antes de concluir uma mudança
---
```

O `name` precisa coincidir com o nome do diretório e usar apenas minúsculas, dígitos e hífens simples. A `description` é obrigatória e é o que faz o agente decidir carregar a skill.

O catálogo de skills instalado no projeto está na seção **Ferramentas do projeto** do Roteiro de Entrega, porque independe do agente: os mesmos comandos servem aos dois ambientes.

---

## 6. Regras do projeto

| Caminho | Escopo |
| :---- | :---- |
| `AGENTS.md` na raiz do projeto | Aplica-se ao diretório e aos subdiretórios |
| `~/.config/opencode/AGENTS.md` | Global, para todas as sessões |
| Chave `instructions` no `opencode.json` | Arquivos ou padrões adicionais, combinados com o `AGENTS.md` |

A chave `instructions` aceita caminhos e padrões glob:

```json
{
  "instructions": [".agents/rules/*.md"]
}
```

O conteúdo do `AGENTS.md` do projeto é definido na seção **Preparação do agente** do Roteiro de Entrega.

Referência: [Rules — OpenCode](https://opencode.ai/docs/rules/).

---

## 7. Plugins e hooks

Plugins estendem o OpenCode e são o mecanismo pelo qual se registram hooks, que executam código em pontos definidos do ciclo do agente.

### Onde configurar

| Caminho | Comportamento |
| :---- | :---- |
| `.opencode/plugins/<nome>/index.ts` | Carregado automaticamente |
| Chave `plugins` no `opencode.json` | Pacotes publicados ou plugins em outros caminhos |

### Estrutura mínima

Um plugin exporta por padrão um objeto criado com `Plugin.define`, importado de `@opencode/plugin`, com um `id` e uma função `setup(ctx)`. Os hooks são registrados dentro de `setup` com `ctx.<domínio>.hook(nome, callback)`.

```typescript
import { Plugin } from "@opencode/plugin";

export default Plugin.define({
  id: "guarda-de-segredos",
  setup(ctx) {
    ctx.tool.hook("execute.before", async (input) => {
      // inspeciona a chamada antes de a ferramenta executar
    });
  },
});
```

### Hooks disponíveis

| Domínio | Hooks |
| :---- | :---- |
| `ctx.session.hook` | `prompt`, `context`, `compaction`, `generate`, `title`, `model.request`, `http.request`, `http.response`, `retry` |
| `ctx.permission.hook` | `evaluate` |
| `ctx.shell.hook` | `create.before` |
| `ctx.tool.hook` | `execute.before`, `execute.after` |

Vários plugins podem registrar o mesmo hook; eles executam na ordem em que os plugins foram carregados.

### Hooks exigidos pelo projeto

O Roteiro de Entrega, na seção 7.5, pede que quatro políticas tenham garantia em lugar de recomendação. Um único plugin basta para as três primeiras:

```typescript
import { Plugin } from "@opencode/plugin";

export default Plugin.define({
  id: "garantias-do-projeto",
  setup(ctx) {
    // garantia 1: nenhum segredo entra no repositório
    // garantia 3: a suíte executa antes do commit
    ctx.tool.hook("execute.before", async (input) => {
      // quando a chamada for um git commit, inspecionar o diff e executar a suíte;
      // negar a execução se o diff contiver padrão de credencial ou a suíte falhar
    });

    // garantia 2: formatação aplicada após cada edição
    ctx.tool.hook("execute.after", async (input) => {
      // quando a ferramenta tiver gravado arquivo, executar o formatador
    });
  },
});
```

A quarta garantia — especificação sincronizada antes do arquivamento — é verificada no mesmo `execute.before`, sobre a chamada do comando de arquivamento do OpenSpec.

> A lógica de decisão fica no plugin, versionado com o projeto. Uma regra escrita apenas no `AGENTS.md` é recomendação; o hook é o que a torna garantia.

Referência: [Plugins — OpenCode](https://opencode.ai/v2/docs/build/plugins).

---

## 8. Subagentes do projeto

O Roteiro de Entrega, na seção 7.6, pede três papéis com contexto e permissões próprios: **revisor**, **executor de suíte** e **explorador**. No OpenCode, cada um se declara como um agente em modo `subagent`, que executa em sessão filha.

### Onde declarar

| Caminho | Escopo |
| :---- | :---- |
| `.opencode/agents/<nome>.md` | Projeto; o nome do arquivo é o identificador do agente |
| `~/.config/opencode/agents/<nome>.md` | Global, válido para todos os projetos |
| Bloco `agents` no `opencode.json` | Equivalente, em formato JSON |

O *frontmatter* aceita os mesmos campos do bloco `agents`, e o corpo em markdown torna-se o `system` do agente.

### Os campos que importam

| Campo | Função |
| :---- | :---- |
| `mode` | `primary`, `subagent` ou `all`. O padrão de um agente próprio é `all` |
| `description` | Apresentada ao modelo no catálogo de subagentes; determina quando ele delega |
| `model` | `provider/modelo`, com sufixo `#variante` opcional. Omitido, herda o modelo da sessão-pai |
| `permissions` | Lista ordenada de regras com `action`, `resource` e `effect`: `allow`, `ask` ou `deny` |

> Em `permissions`, **a última regra que casa prevalece**. Portanto as regras amplas vêm primeiro e as exceções depois. As ações mais usadas são `shell`, `edit`, `read` e `subagent`.

### Revisor

É o subagente em que a restrição de ferramentas carrega o princípio: o revisor que pode editar o código não está revisando, está corrigindo — e perde-se a separação entre quem produz e quem julga.

Crie `.opencode/agents/revisor.md`:

```markdown
---
description: Revisa o diff de uma mudança e produz achados, sem alterar arquivos
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

Revise o diff da mudança segundo a política de revisão em REVIEW.md.

Para cada achado, informe arquivo e linha, severidade segundo a política, o que está
errado e o que a correção exigiria.

Não emita veredito de aprovação: a revisão produz achados, e aprovação não é achado.
```

### Executor de suíte

Crie `.opencode/agents/executor-suite.md`:

```markdown
---
description: Executa testes e avaliações e relata apenas as falhas
mode: subagent
permissions:
  - action: read
    resource: "*"
    effect: allow
  - action: shell
    resource: "*"
    effect: deny
  - action: shell
    resource: "npm test*"
    effect: allow
  - action: shell
    resource: "npx promptfoo eval*"
    effect: allow
  - action: edit
    resource: "*"
    effect: deny
---

Execute a suíte de testes e a suíte de avaliação.

Relate apenas as falhas: nome do caso, mensagem e o trecho relevante da saída.
Não reproduza a saída completa dos comandos.
```

> O relato enxuto não é só conveniência: a saída de comandos é o maior consumidor da janela de contexto. Confinada à sessão do subagente, ela não ocupa a sessão principal.

### Explorador

Crie `.opencode/agents/explorador.md`, em modo `subagent`, com permissão de leitura e negação de edição e de shell, cujo `system` instrui a levantar o contexto de um módulo e devolver um resumo estruturado.

Referência: [Agents — OpenCode](https://opencode.ai/v2/docs/agents).

---

## 9. Inicialização do OpenSpec para o OpenCode

O OpenSpec já foi instalado na seção **Ferramentas do projeto** do Roteiro de Entrega. Resta inicializá-lo indicando o agente em uso, o que instala comandos, regras e workflows no diretório que o OpenCode lê.

* No terminal, a partir do diretório raiz do projeto:

```bash
openspec init --tools opencode
```

> Para inicializar mais de uma ferramenta, separe os nomes por vírgula **sem espaço**: `--tools opencode,antigravity`. Um espaço após a vírgula faz o shell tratar o segundo nome como argumento separado, e a inicialização falha.

* Confirme a estrutura resultante:

```text
├── .opencode
│   ├── agents/
│   ├── commands/
│   ├── plugins/
│   ├── rules/
│   ├── skills/
│   └── workflows/
├── openspec
│   ├── changes/
│   ├── config.yaml
│   └── specs/
```

### Convivência com os arquivos do projeto

O `openspec init` grava em `.opencode/commands/`, `.opencode/rules/`, `.opencode/skills/` e `.opencode/workflows/`, segundo o perfil e o modo de entrega configurados, e o `openspec update` **reescreve** esses arquivos — operação executada após atualização da CLI ou mudança de perfil. Daí três cuidados:

| Cuidado | Razão |
| :---- | :---- |
| Não edite os arquivos gerados pelo OpenSpec | `openspec update` os sobrescreve, e a edição se perde |
| Mantenha os subagentes em `.opencode/agents/` e os plugins em `.opencode/plugins/` | Nenhum dos dois é gerado pelo OpenSpec, e ambos permanecem |
| Confira os diretórios próprios após cada `openspec update` | Para verificar que nada próprio foi removido |

O ajuste do `openspec/config.yaml` — inclusive a declaração dos artefatos de verificação do projeto no campo `context` — é feito na seção 5 do Roteiro de Entrega, depois desta configuração.

### Verificação

```bash
openspec view
```

---

## 10. Inicialização dos agentes do Playwright

O Playwright já foi instalado na seção **Ferramentas do projeto** do Roteiro de Entrega. Esta etapa gera os prompts que o agente usa para planejar, gerar e corrigir testes de aceite.

```bash
npx playwright init-agents --loop=opencode
```

* Confirme a estrutura resultante:

```text
.opencode
└── prompts
    ├── playwright-test-generator.md
    ├── playwright-test-healer.md
    └── playwright-test-planner.md
```

---

## 11. OpenDesign — prototipação aberta

O **OpenDesign** é a alternativa aberta à ferramenta de prototipação hospedada usada no Roteiro de Descoberta. É um aplicativo de desktop, licenciado sob Apache-2.0, em que se descrevem as telas e um agente de código escreve o protótipo em HTML dentro de uma pasta do projeto.

Esta seção integra o ambiente open source porque o OpenDesign pode operar com o agente já configurado nas seções anteriores, sem conta em serviço externo.

### Instalação

* Baixe o instalador em <https://open-design.ai/>.
* Requisitos: macOS 11 ou superior (Apple Silicon ou Intel), ou Windows 10/11 em 64 bits, como instalador ou pacote portátil.
* Não há binário para Linux publicado; a documentação indica execução a partir do código-fonte.

### Modos de operação

| Modo | Como funciona | Quando usar |
| :---- | :---- | :---- |
| Agente local | Usa um agente de código já instalado na máquina, com a própria assinatura | Opção coerente com este ambiente |
| Chave própria (BYOK) | Endpoint, chave e modelo informados na ferramenta | Quando não houver agente local |
| Hospedado | Conta no serviço, com créditos mensais | Fora do escopo do ambiente open source |

> Uma chave de API isolada gera telas, mas não edita arquivos do projeto. Para que o protótipo seja escrito na pasta do projeto, é necessário o modo de agente local.

### Uso no fluxo

* Aponte o projeto do OpenDesign para uma pasta do repositório, de preferência `docs/prototypes/`.
* Informe o design system escolhido e descreva as telas a partir dos fluxos da especificação.
* Avalie cada tela gerada contra um critério de aceite de `docs/spec.md`.

### Exportação

A ferramenta exporta HTML autocontido, PDF e PNG, além de permitir a entrega da pasta do projeto diretamente ao agente de código. Não há exportação para Figma.

> A exportação para o repositório é obrigatória no fluxo: na construção, o agente enxerga apenas os arquivos versionados. Protótipo que permanece dentro da ferramenta não existe para ele.

### Privacidade

A coleta de dados de uso é desativada em **Settings → Privacy**. Os projetos ficam como arquivos HTML e CSS em uma pasta local da máquina.

---

## 12. Verificação final

* [ ] Contas em pelo menos dois providers, com chaves obtidas
* [ ] OmniRoute em execução, com senha de painel definida e providers conectados
* [ ] `OMNIROUTE_API_KEY` e `CONTEXT7_API_KEY` no `.env`, com `.env` no `.gitignore`
* [ ] OpenCode conectado ao OmniRoute, com modelo selecionado
* [ ] `opencode.json` válido, com um único bloco `mcp` e um único `$schema`
* [ ] Context7 respondendo a uma consulta de documentação
* [ ] Skills visíveis em `.agents/skills/`
* [ ] `AGENTS.md` sendo lido pelo agente
* [ ] Plugin de garantias carregado, com os hooks de segredo, formatação e suíte ativos
* [ ] Três subagentes declarados em `.opencode/agents/`, com o revisor negando `edit` e `shell`
* [ ] `openspec view` executando sem erro
* [ ] Prompts do Playwright em `.opencode/prompts/`
* [ ] OpenDesign instalado e apontado para a pasta do projeto, caso seja a ferramenta de prototipação escolhida

Concluída a configuração, retome o Roteiro de Entrega na seção **Preparação do agente**.
