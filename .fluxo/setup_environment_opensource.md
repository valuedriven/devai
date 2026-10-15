# Setup do ambiente de desenvolvimento open source

Este documento configura o **agente de desenvolvimento** usado no Roteiro de Entrega em um ambiente inteiramente open source: providers de modelos, OmniRoute como gateway e OpenCode como agente.

É alternativa ao [Setup do ambiente de desenvolvimento](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/setup_environment.md), baseado no Google Antigravity. Os dois caminhos levam ao mesmo resultado; o restante do roteiro funciona igual nos dois.

Escopo deste documento: providers, gateway, agente, servidores MCP, skills, comandos do OpenSpec e agentes do Playwright. As demais ferramentas e contas estão nos pré-requisitos do Roteiro de Entrega.

---

## 1. Providers de modelos

Um **provider** é quem serve modelos por API, com chave, cota e preço próprios. Os provedores a seguir possuem camadas gratuitas; em alguns deles é necessário adquirir créditos, em outros não.

| Tipo | Característica | Opções |
| :---- | :---- | :---- |
| Fabricante com API própria | Serve os próprios modelos | [Alibaba Model Studio](https://modelstudio.alibabacloud.com/) |
| Plataforma de inferência | Hospeda modelos de terceiros, com foco em desempenho ou catálogo | [Groq](https://groq.com/), [NVIDIA](https://build.nvidia.com/), [Ollama Cloud](https://ollama.com/) |
| Agregador hospedado | Um endpoint e uma chave para modelos de vários fabricantes | [OpenRouter](https://openrouter.ai/), [AgentRouter](https://agentrouter.org/), [OpenCode Zen](https://opencode.ai/br/zen), [OpenCode Go](https://opencode.ai/br/go) |

* Crie contas em **pelo menos dois** providers e obtenha as chaves de acesso. Dois providers permitem que o gateway troque de um para outro quando a cota de um deles se esgota.

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

A partir da linha de comando, execute:

```bash
omniroute
```

### Configuração

* Acesse o painel em `http://localhost:20128/`.
* **Defina uma senha para o painel na primeira entrada**, em vez de manter a padrão. O painel guarda as chaves de todos os seus providers.
* No menu lateral, acesse **API Key Manager** e acione **Create API key**. Guarde o valor: é a chave do próprio gateway, distinta das chaves dos providers, e será usada pelo agente.
* No menu lateral, acesse **Providers** e configure as conexões com os providers criados na seção 1.
* No menu lateral, acesse **Compression Settings** e selecione **Stacked**.

> A compressão reduz o consumo de tokens em sessões longas, ao custo de alguma fidelidade do contexto. É um bom padrão para o projeto, mas registre no `docs/ai-log.md` quando um resultado inesperado ocorrer em sessão longa.

> O gateway pode trocar de modelo automaticamente ao encontrar uma cota esgotada. Isso é conveniente e tem um efeito colateral: a reprodutibilidade cai, porque a mesma solicitação pode ser respondida por modelos diferentes. Registre qual modelo respondeu quando o resultado importar.

### Variável de ambiente

Acrescente ao `.env` do projeto, criado no Roteiro de Entrega:

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

## 3. OpenCode

* Instale o OpenCode, conforme <https://opencode.ai/>.
* Instale o VS Code, conforme <https://code.visualstudio.com/>. Como alternativa, o OpenCode também pode ser instalado como extensão do Antigravity.
* No VS Code, menu lateral **Extensions**, busque por `opencode` e acione **Install**.
* Abra a extensão.

### Conexão com o gateway

* Na área de prompt, execute:

```text
/connect
```

* Na janela **Connect a provider**, informe `omniroute`.
* Informe a chave de API do OmniRoute obtida na seção 2.
* Na área de prompt, execute:

```text
/models
```

* Selecione o modelo de preferência, atentando para escolher modelos do provider **OmniRoute**.

Grupos de modelos que costumam funcionar bem para uso agêntico, priorizando as versões mais recentes e gratuitas: DeepSeek, Qwen, Kimi, GLM e MiniMax.

### Gerenciamento de sessões

Inicie uma sessão nova para cada tarefa, com o comando `/new`. Cada sessão carrega o contexto acumulado, e contexto irrelevante da tarefa anterior degrada o resultado da seguinte.

### Escolha de modelos por fase

* Para planejamento, use o agente `plan`, que não tem permissão de edição, com um modelo de maior capacidade de raciocínio.
* Para execução, modelos mais rápidos e baratos costumam bastar.
* Para revisão, use uma sessão nova ou um modelo diferente do que implementou.

---

## 4. Configuração do projeto para o agente

No diretório raiz do projeto, crie ou abra o arquivo `opencode.json`:

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
    }
  }
}
```

Três pontos de atenção:

* **Um único bloco `mcp`**, no nível raiz do arquivo, e um único `$schema`. Blocos aninhados produzem JSON inválido e o agente não carrega a configuração.
* A substituição de variáveis de ambiente usa a forma `{env:NOME_DA_VARIAVEL}`.
* Não configure servidor MCP da ferramenta de prototipação. Os protótipos foram exportados para `docs/prototypes/` na descoberta, e é de lá que o agente deve lê-los.

### Verificação

Em uma nova sessão do agente, execute:

```text
Use o Context7 para consultar a documentação atual do Next.js sobre App Router e
resuma as mudanças em relação ao Pages Router.
```

---

## 5. Skills

Skills são instruções específicas, carregadas sob demanda pelo agente. O OpenCode lê o diretório `.agents`.

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

## 6. Comandos do OpenSpec

O OpenSpec instala comandos e skills no diretório do agente. Esta etapa precisa ser executada antes da seção de criação do backlog, no Roteiro de Entrega.

* Certifique-se de que o OpenSpec esteja instalado, conforme <https://openspec.dev/>.
* Acesse o terminal no diretório raiz do projeto.
* Inicialize o OpenSpec:

```bash
openspec init --tools opencode
```

> Para inicializar mais de uma ferramenta, separe os nomes por vírgula **sem espaço**: `--tools opencode,antigravity`. Um espaço após a vírgula faz o shell tratar o segundo nome como argumento separado, e a inicialização falha.

* Como resultado, devem existir as seguintes estruturas:

```text
├── .opencode
│   ├── commands/
│   ├── rules/
│   ├── skills/
│   └── workflows/
├── openspec
│   ├── changes/
│   ├── config.yaml
│   └── specs/
```

### Verificação

```bash
openspec view
```

---

## 7. Agentes do Playwright

Esta etapa prepara o agente para planejar, gerar e corrigir testes de aceite. Ela pressupõe o Playwright instalado, conforme os pré-requisitos do Roteiro de Entrega.

* Acrescente o servidor MCP do Playwright ao `opencode.json`, mantendo o bloco `mcp` único:

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

> Use apenas esta forma de configuração. Não é necessário instalar o pacote globalmente.

* Inicialize os agentes do Playwright:

```bash
npx playwright init-agents --loop=opencode
```

* Verifique a criação dos arquivos:

```text
.opencode
└── prompts
    ├── playwright-test-generator.md
    ├── playwright-test-healer.md
    └── playwright-test-planner.md
```

---

## 8. Verificação final do ambiente

* [ ] Contas em pelo menos dois providers, com chaves obtidas
* [ ] OmniRoute em execução, com senha de painel definida e providers conectados
* [ ] `OMNIROUTE_API_KEY` e `CONTEXT7_API_KEY` no `.env`, com `.env` no `.gitignore`
* [ ] OpenCode conectado ao OmniRoute, com modelo selecionado
* [ ] `opencode.json` válido, com um único bloco `mcp`
* [ ] MCP do Context7 respondendo a uma consulta de documentação
* [ ] Skills instaladas em `.agents/skills/`, com os `SKILL.md` lidos antes da instalação
* [ ] `openspec view` executando sem erro
* [ ] Prompts do Playwright presentes em `.opencode/prompts/`

Concluído o setup, retome o Roteiro de Entrega na seção de criação do `AGENTS.md`.
