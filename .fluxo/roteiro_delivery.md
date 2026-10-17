# Roteiro de Entrega

Este roteiro descreve o passo a passo da construção, da liberação e da evolução da solução. Ele parte dos artefatos produzidos no [Roteiro de Descoberta](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_discovery.md) e vai até a evolução do sistema em produção.

> O repositório [valuedriven/devai](https://github.com/valuedriven/devai) é um **blueprint**: serve de exemplo de forma para os artefatos e a configuração, e é citado nos prompts. O projeto é seu, com domínio próprio e requisitos funcionais próprios.

---

## 1. Visão geral do fluxo

**Resultados:**

* Agente de desenvolvimento configurado (`AGENTS.md`, skills, MCP servers, hooks, subagentes)
* Backlog de mudanças (`backlog.md`) e propostas de mudança
* Esqueleto andante com integração contínua
* Incrementos de produto com testes de unidade, integração e aceite
* Suíte de avaliação da funcionalidade de IA e política de revisão (`REVIEW.md`)
* Pipeline de CI/CD e MVP publicado, com indicadores do ciclo acompanhados
* Solução migrada para a versão final, em roteiro específico
* Faixas de controle (`ops/faixas.yaml`) ligando a telemetria ao agente
* Mudança evolutiva em sistema existente

**Ferramentas:**

* Agente de desenvolvimento: Google Antigravity (<https://antigravity.google>) no ambiente de referência, ou OpenCode (<https://opencode.ai/>) no ambiente open source. Outras alternativas: Claude Code, Cursor, Codex, DeepSeek Harness.
* Spec-driven development: OpenSpec (<https://openspec.dev/>). Alternativas: BMAD, Spec-kit, GSD.
* Automação de testes: Playwright (<https://playwright.dev/>).
* Avaliação da funcionalidade de IA: promptfoo (<https://promptfoo.dev/>). Alternativas: DeepEval, Inspect AI.
* Inspeção de código: SonarQube.
* Integração e entrega contínuas: GitHub Actions.
* Infraestrutura como código: Terraform, usado no roteiro de migração.

O roteiro é escrito de forma independente da ferramenta de agente. Os passos específicos de cada ambiente estão nos documentos de setup, indicados na seção 4.

---

## 2. Orientações gerais

Os comandos deste roteiro consideram tanto execuções via terminal quanto pela interface de chat do agente de IA. Fique atento ao contexto de cada execução.

### Estratégia de implantação em duas etapas

| Etapa | Objetivo | Plataformas | Onde é tratada |
| :---- | :---- | :---- | :---- |
| MVP | Validar os fluxos de negócio ponta a ponta com rapidez | Vercel, Supabase, Clerk | Seções 3 a 8 deste roteiro |
| Versão final | Atender integralmente aos requisitos de portabilidade e implantação | AWS, com contêineres OCI e Terraform | [Roteiro de migração](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/configuracao_aws.md), indicado na seção 11 |

A **AWS é a referência desejada** para a versão final, e a migração acontece em roteiro específico, depois que o MVP estiver validado.

A versão final não descarta a primeira: o Clerk continua como provedor de identidade e o código permanece o mesmo. O que muda é onde a aplicação executa e como o ambiente é criado.

### Pré-requisitos

Plataforma base, instalada antes de tudo:

* [Node.js e npm](https://nodejs.org/)
* [Git](https://git-scm.com/)
* [Docker e Docker Compose](https://docker.com)

As demais ferramentas do projeto — OpenSpec, Playwright e o catálogo de skills — são instaladas na seção 3. O agente de desenvolvimento e o acesso a modelos são configurados na seção 4. Para a migração à versão final, o roteiro específico lista seus próprios pré-requisitos, entre eles o Terraform e o gerenciador `uv`.

Contas:

* [GitHub](https://github.com/)
* [Vercel](https://vercel.com/)
* [Supabase](https://www.supabase.com/)
* [Clerk](https://clerk.com/)
* [Context7](https://context7.com/)
* AWS, para a versão final (criada no momento da migração)

Certifique-se de estar autenticado nesses serviços antes de executar o roteiro.

### Gerenciamento da janela de contexto

* Inicie uma sessão nova do agente para cada tarefa.
* Referencie arquivos e diretórios com o caractere `@` em vez de colar o conteúdo. O agente carrega o arquivo quando precisa.
* Em sessões longas, compacte o contexto ou reinicie a sessão.

### Ciclo planejar/executar

* Estruture as tarefas no ciclo planejar/executar.
* Para o planejamento, prefira modelos com maior capacidade de raciocínio e, quando a ferramenta oferecer, um modo de agente sem permissão de edição.
* Para a execução, modelos mais rápidos e baratos costumam bastar.
* Para a revisão, use uma sessão nova ou um modelo diferente daquele que implementou.

### Ajuste nos prompts

* Substitua os valores entre `<` e `>` pelos valores do seu projeto.
* Use `@` para referenciar arquivos, diretórios, regras e MCP servers.

---

## 3. Configuração do projeto

### Documentação geral do projeto

Certifique-se de que a documentação produzida na descoberta esteja disponível no repositório:

```text
├── docs
│   ├── architecture.md
│   ├── design.md
│   ├── prd.md
│   ├── problem.md
│   ├── spec.md
│   ├── diagramas/
│   ├── prototypes/
│   └── ai-log.md
```

A pasta `docs/prototypes/` é obrigatória: o agente não acessa a ferramenta de prototipação e trabalhará a partir desses arquivos.

### Ferramentas do projeto

Esta seção instala o que **não depende do agente escolhido**. Os mesmos comandos valem para os dois ambientes de desenvolvimento. A configuração específica de cada agente — servidores MCP, regras, hooks e a inicialização que exige indicar a ferramenta em uso — está nos documentos de setup, na seção 4.

#### OpenSpec

Ferramenta de spec-driven development usada a partir da seção 5.

* Instale conforme as orientações em <https://openspec.dev/>.
* Confirme a instalação:

```bash
openspec --version
```

> A inicialização no projeto, com `openspec init --tools <agente>`, é específica do agente e está no documento de setup correspondente.

#### Playwright

Ferramenta de automação de testes de aceite, usada a partir da seção 9.

* No diretório raiz do projeto:

```bash
npm init playwright@latest
```

* Confirme a instalação:

```bash
npx playwright --version
```

> A geração dos prompts de teste, com `npx playwright init-agents`, é específica do agente e está no documento de setup correspondente.

#### promptfoo

Executor de avaliações, usado a partir da seção 9 para verificar a funcionalidade de IA, cujo resultado não se compara por igualdade a um valor esperado.

* No diretório raiz do projeto:

```bash
npm install --save-dev promptfoo
```

* Confirme a instalação:

```bash
npx promptfoo --version
```

> A composição da suíte está na seção 9. Aqui apenas se instala a ferramenta.

#### Catálogo de skills

Skills são instruções específicas carregadas sob demanda pelo agente. Os comandos a seguir instalam o catálogo do projeto em `.agents/skills/`, diretório lido pelos dois ambientes.

> **Antes de instalar qualquer skill de terceiros, abra o `SKILL.md` e os scripts e leia.** Skills são instruções e código que entram no seu ambiente: podem conter instruções que o agente obedecerá e scripts que executarão com o seu acesso. Se não for possível ler, não instale.

* No terminal, a partir do diretório raiz do projeto:

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

* Verifique no diretório `.agents/skills/` se as skills foram instaladas.

Skills de testes e qualidade do projeto de referência:

* [Testes de unidade](https://github.com/valuedriven/devai/blob/main/.agents/skills/jest-unit-tests/SKILL.md)
* [Testes de integração](https://github.com/valuedriven/devai/blob/main/.agents/skills/supertest-integration-test/SKILL.md)
* [Testes end-to-end](https://github.com/valuedriven/devai/blob/main/.agents/skills/playwright-e2e-tests/SKILL.md)
* [Gate de qualidade](https://github.com/valuedriven/devai/blob/main/.agents/skills/quality-gate/SKILL.md)

Outras skills podem ser encontradas em marketplaces como <https://skillsmp.com/> e <https://skills.sh/>.

### Configuração de variáveis de ambiente

* No diretório raiz do projeto, crie o arquivo `.env` com o conteúdo a seguir.
* Acesse os endereços indicados junto a cada credencial e obtenha os valores solicitados.

```bash
PROJECT_NAME=<nome do projeto>
GLOBAL_PREFIX=api/v1

# Vercel
# https://vercel.com/account/settings/tokens
# Seção Create token, comando Create
VERCEL_API_TOKEN=

# Supabase
# https://supabase.com/dashboard/account/tokens
# Seção Classic Tokens, comando Generate new token
SUPABASE_ACCESS_TOKEN=
# [deixar os itens a seguir em branco inicialmente]
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
DIRECT_URL=

# Clerk
# https://dashboard.clerk.com/apps/
# Seção Applications, comando Create application
# Selecionar a aplicação criada, menu Configure, seção API Keys, comando Quick copy
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# Seção API Keys, item JWKS Public Key (usar aspas duplas para envolver o conteúdo)
CLERK_JWT_KEY=

# Aplicação
FRONTEND_PORT=3000
BACKEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

> O valor de `NEXT_PUBLIC_API_URL` precisa coincidir com `BACKEND_PORT` e `GLOBAL_PREFIX`. Divergências aqui produzem erros de integração difíceis de diagnosticar.

* Crie ou atualize o arquivo `.gitignore` e inclua nele:

```text
.env
```

* Crie também um arquivo `.env.example` com as mesmas chaves e sem os valores. Esse arquivo é versionado e documenta as variáveis necessárias.

> O setup do ambiente, na seção 4, acrescenta a este arquivo as variáveis do agente e dos modelos. Preencha-as lá.

### Criação do README.md

* Inicie uma nova sessão do agente.
* Execute o prompt a seguir.

```text
Crie o arquivo README.md para o repositório com base na documentação disponível em @docs.

Inclua as instruções de instalação, configuração de variáveis de ambiente, execução local
e execução dos testes.

Siga as boas práticas recomendadas pelo GitHub, disponíveis em
<https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes>
```

---

## 4. Preparação do agente de IA

### Setup do ambiente

Escolha um dos dois ambientes e execute o documento correspondente antes de prosseguir. Os dois levam ao mesmo resultado, e o restante deste roteiro funciona igual nos dois.

| Ambiente | Agente | Acesso a modelos | Documento |
| :---- | :---- | :---- | :---- |
| Referência | Google Antigravity | Modelos da própria ferramenta | [setup_environment.md](https://github.com/valuedriven/devai/blob/main/.fluxo/setup_environment.md) |
| Open source | OpenCode | Providers de modelos via OmniRoute | [setup_environment_opensource.md](https://github.com/valuedriven/devai/blob/main/.fluxo/setup_environment_opensource.md) |

Cada documento cobre o que é específico daquele agente: instalação, acesso aos modelos, registro de servidores MCP, descoberta de skills e regras, hooks de ciclo de vida e a inicialização do OpenSpec e dos agentes do Playwright para a ferramenta em uso. As ferramentas comuns aos dois ambientes já foram instaladas na seção 3.

Ao terminar o setup, retome aqui.

### Regras no arquivo AGENTS.md

* Inicie uma nova sessão do agente.
* Execute o prompt a seguir.

```text
Crie ou atualize o AGENTS.md com base na documentação do projeto (@docs), incluindo:

* Comportamento do agente
* Stack tecnológica
* Estrutura do monorepo
* Comandos principais (setup, banco, build, run e testes)
* Regras de qualidade, testes e logging
* Governança e autonomia no terminal
* Uso do Context7 MCP para consulta de documentação atualizada
* Referências da documentação do projeto
* Aprendizado contínuo com reflexão e sugestões de melhoria após cada mudança

Utilize como referência:

* https://github.com/valuedriven/devai/blob/main/.fluxo/concepts/agents-md-guidelines.md

Adapte as diretrizes ao contexto do projeto, preserve o conteúdo válido existente,
remova duplicações e valide o resultado conforme as recomendações de AGENTS.md.

Mantenha o arquivo curto: ele entra no contexto de toda sessão. Ele é um índice que
aponta para @docs, não um manual que repete a documentação.
```

* Verifique o resultado e peça a uma IA de fronteira que o valide.
* Arquivo de referência: [AGENTS.md do projeto de referência](https://github.com/valuedriven/devai/blob/main/AGENTS.md).

Ao final de sessões relevantes, avalie o nível de autonomia do agente:

```text
Analise o histórico desta sessão e o arquivo @docs/ai-log.md.

Identifique padrões de desvio: instruções que precisei repetir, convenções que não foram
seguidas, decisões tomadas sem consultar a documentação.

Para cada padrão, proponha:
- um guia (regra no AGENTS.md ou skill) que reduza a chance de o desvio acontecer; ou
- um sensor (teste, regra de lint, checagem) que detecte o desvio automaticamente.

Formato: tabela com as colunas
Desvio observado | Tipo de controle | Proposta | Onde implementar.

Não altere arquivos; apenas proponha.
```

## 5. Criação do backlog de mudanças

### Personalização do config.yaml

O OpenSpec foi inicializado no setup do ambiente, e os diretórios `openspec/` e os comandos do agente já devem existir. Resta ajustar o contexto do projeto que o OpenSpec injeta nos comandos.

* Em uma nova sessão do agente, execute:

```text
/opsx-explore

Personalize o arquivo config.yaml com base nas informações do projeto disponíveis em
@docs/prd.md @docs/spec.md @docs/architecture.md @docs/design.md @AGENTS.md,
em especial as diretrizes de testes e qualidade.
```

* Arquivo de referência: [config.yaml do projeto de referência](https://github.com/valuedriven/devai/blob/main/openspec/config.yaml).

#### O que declarar no contexto

O campo `context` do `openspec/config.yaml` é injetado nas instruções dos comandos. Declare nele os artefatos de verificação do projeto, para que as propostas de mudança já nasçam considerando-os:

```yaml
context: |
  Verificação obrigatória de toda mudança:
  - Testes nos níveis aplicáveis, conforme as skills de teste do projeto.
  - Avaliações em evals/promptfooconfig.yaml, quando a mudança toca a funcionalidade de IA.
  - Revisão segundo a política em REVIEW.md, com os achados que bloqueiam corrigidos.
  - Quality gate do SonarQube aprovado.
  Toda mudança que altere comportamento observável em produção revisa ops/faixas.yaml.
```

> Dois cuidados. Os arquivos que o OpenSpec **gera** — comandos, regras e workflows nos diretórios do agente — são reescritos por `openspec update`, executado após atualização da CLI ou mudança de perfil. Edições manuais nesses arquivos se perdem: as regras do projeto ficam no `AGENTS.md` e nos arquivos de regra próprios. E os subagentes declarados na seção 7.6 convivem com esses diretórios, mas não dentro deles — declare-os no local que o documento de setup indica para o seu ambiente.

### Definição do backlog de mudanças

* Inicie uma nova sessão do agente.
* Digite `/` e selecione o comando `opsx-explore`.
* Informe o conteúdo a seguir logo depois do comando.

```text
/opsx-explore

Dimensione as mudanças necessárias para a implementação de uma aplicação web full stack
de maneira incremental.

Utilize a documentação disponível em @docs/prd.md (em especial a seção de escopo e
roadmap), @docs/spec.md, @docs/architecture.md, @docs/diagramas/ e @docs/design.md.

Os protótipos das interfaces gráficas estão em @docs/prototypes/.

Configure as mudanças de forma que nenhuma fique com tamanho, complexidade e/ou risco
maior que médio.

Cada mudança deve ser uma fatia vertical: atravessa interface, API, regra de negócio e
persistência, entregando algo verificável.

Nomeie cada mudança pela capacidade que entrega, em kebab-case
(exemplos: setup-monorepo, auth-perfis, carrinho-adicionar-item).

As primeiras mudanças devem constituir um esqueleto andante executável:
estrutura do monorepo, configuração externalizada, autenticação e integração contínua
mínima (lint e build).

Crie apenas o proposal.md de cada mudança.

Crie um arquivo backlog.md com um resumo do planejamento.

Para cada mudança proposta, informe:
- Escopo funcional
- Dependências
- Riscos
- Execução de linter necessária
- Testes unitários necessários
- Testes de integração necessários
- Testes E2E necessários

Nenhuma mudança pode ser considerada concluída sem os testes correspondentes.
```

* Verifique se o agente leu corretamente os documentos e os protótipos.
* É esperado que tenha sido criada uma estrutura semelhante a:

```text
└── openspec
    ├── backlog.md
    └── changes
        ├── archive/
        ├── setup-monorepo/
        │   ├── .openspec.yaml
        │   └── proposal.md
        └── auth-perfis/
            ├── .openspec.yaml
            └── proposal.md
```

### Revisão do backlog

* Em uma nova sessão, execute o prompt a seguir.

```text
Atue como: revisor de planejamento incremental.

Contexto:
@docs/prd.md (seção de escopo e roadmap)
@openspec/backlog.md
@openspec/changes/
@docs/architecture.md

Critérios:
1. Cada horizonte do roadmap é coberto por ao menos uma mudança.
2. As primeiras mudanças formam um esqueleto andante executável.
3. Nenhuma mudança tem tamanho, complexidade ou risco maior que médio.
4. Dependências estão explícitas e não há ciclos.
5. Toda mudança prevê testes compatíveis com seu escopo.
6. Os dois fluxos de negócio ponta a ponta estão fatiados verticalmente.

Formato de saída: tabela com as colunas
Mudança | Problema | Critério | Severidade | Ajuste sugerido.
```

* Ajuste o backlog interagindo com o agente por meio do comando `/opsx-explore` ou editando diretamente os arquivos.

### Acompanhamento do progresso

A qualquer momento, verifique o progresso:

```bash
openspec view
```

Resultado esperado:

```text
 ● Draft Changes: x
  ● Active Changes: x in progress
  ● Completed Changes: x
  ● Task Progress: x/xx (x% complete)

Draft Changes
────────────────────────────────────────────────────────────
  ○ setup-monorepo
  ○ auth-perfis

Active Changes
────────────────────────────────────────────────────────────
  ◉ setup-monorepo     [░░░░░░░░░░░░░░░░░░░░] 0%

════════════════════════════════════════════════════════════

Use openspec list --changes or openspec list --specs for detailed view
```

---

## 6. Esqueleto andante, integração contínua e provisionamento

A primeira mudança do backlog é o **esqueleto andante**: a menor versão do sistema que atravessa todas as camadas e efetivamente executa — frontend chamando a API, API acessando o banco — sem funcionalidade de negócio relevante. Ela é implementada pelo ciclo descrito na seção 8.

Concluído o esqueleto, a automação entra **imediatamente**, e não ao final do percurso. A partir daqui, toda mudança do backlog é verificada por um pipeline e publicada em um ambiente provisionado por código.

### Critérios de conclusão do esqueleto

* [ ] Frontend, backend e banco em comunicação, ainda que com funcionalidade trivial
* [ ] Monorepo com fronteiras claras entre as partes da solução
* [ ] Configuração externalizada: nenhum valor de ambiente escrito no código
* [ ] `.env` fora do controle de versão, com `.env.example` versionado
* [ ] Aplicação executando localmente a partir do `README.md`

### Integração contínua mínima

A integração contínua entra junto com o esqueleto, e não depois dele. O arquivo abaixo serve de ponto de partida:

```yaml
name: ci
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '24'
      - run: npm ci
      - run: npm run lint
      - run: npm run build
```

> Fixe a versão das actions de terceiros. Uma action apontada para `@main` executa, a cada build, o que o autor publicou naquele dia.

### Provisionamento inicial com Terraform

O provisionamento por código começa aqui, com o recurso mais simples do MVP: a hospedagem do frontend. O objetivo desta etapa não é cobrir toda a infraestrutura, e sim instalar o hábito — a partir deste ponto, alterações de ambiente passam por commit e revisão, como qualquer outra mudança.

* Instale o Terraform, conforme <https://developer.hashicorp.com/terraform/install>.
* Crie o diretório `infra/` no repositório.
* Inicie uma nova sessão do agente e execute o prompt a seguir.

```text
/opsx-propose infra-vercel

Contexto: @docs/architecture.md, @AGENTS.md, @.env.example

Requisitos:
- Diretório infra/ com configuração Terraform para o provider da Vercel.
- Recurso de projeto da Vercel ligado ao repositório do GitHub.
- Variáveis de ambiente da aplicação declaradas como recursos, com os valores vindos
  de variáveis do Terraform, nunca escritos nos arquivos de configuração.
- Arquivo de variáveis de exemplo versionado, sem valores.
- Arquivo de estado e arquivos locais do Terraform declarados no .gitignore.
- README curto em infra/ com a sequência de comandos.
```

* Execute o ciclo, sempre lendo o plano antes de aplicar:

```bash
cd infra
terraform init
terraform plan
terraform apply
```

> O arquivo de estado contém dados sensíveis e não vai para o controle de versão. O comando `terraform destroy` remove recursos de verdade: o plano é lido antes de qualquer aplicação.

> **Atenção ao vocabulário:** *provider* no Terraform designa um plugin de infraestrutura. Não guarda relação com os *providers de modelos de IA* configurados no documento de configuração do agente.

### Verificação da etapa

* [ ] Esqueleto andante executando localmente
* [ ] Workflow de integração contínua executando a cada push
* [ ] `terraform plan` sem divergências após o `apply`
* [ ] Frontend publicado a partir do projeto provisionado
* [ ] Nenhum segredo no repositório nem no estado versionado

---

## 7. Turbinar o agente

As três ferramentas desta seção atacam o mesmo problema: a janela de contexto é finita e cobrada por token. Uma reduz o que **entra** no contexto, outra reduz o que **sai** do modelo, e a terceira torna o consumo **visível**. Nenhuma substitui o harness; elas o tornam mais barato de operar.

Esta seção é opcional em termos de funcionamento e recomendada em termos de custo. Execute-a depois que o esqueleto estiver de pé, quando já existir volume de uso suficiente para que a diferença apareça.

### 7.1 rtk — reduzir o que entra no contexto

O **rtk** é um proxy de linha de comando que filtra e comprime a saída dos comandos antes que ela chegue ao contexto do agente. Saídas longas de `git`, `npm test`, `docker` e afins passam a entrar resumidas.

* Instale conforme a plataforma:

```bash
# macOS e Linux, via Homebrew
brew install rtk

# Windows
winget install rtk-ai.rtk

# Alternativa para Linux e macOS
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh
```

> A instalação por script coloca o binário em `~/.local/bin`. Confirme que esse diretório está no `PATH`.

* Integre ao agente em uso:

```bash
# Antigravity
rtk init -g --agent antigravity

# OpenCode
rtk init -g --agent opencode
```

* Reinicie o agente e verifique:

```bash
rtk --version
rtk init --show
rtk gain
```

O comando `rtk gain` exibe o painel de economia acumulada. Registre o valor observado em `docs/ai-log.md` antes e depois da adoção.

> Existe outro pacote chamado `rtk` no registro do Cargo. Se `rtk gain` falhar, provavelmente foi instalado o pacote errado.

### 7.2 caveman — reduzir o que sai do modelo

O **caveman** encurta o texto que o agente produz, com ganho direto em tokens de saída. Tem duas partes independentes: uma *skill*, que impõe um estilo de resposta condensado, e um *proxy*, que reduz o conteúdo lido antes de cada chamada.

* Instale a skill no projeto:

```bash
npx skills add JuliusBrussee/caveman
```

* Para também usar o proxy:

```bash
npm install -g @caveman-ai/cli
caveman setup --install
```

* Controle a intensidade dentro da sessão do agente:

```text
/caveman lite
/caveman full
/caveman off
```

> A skill acrescenta as próprias regras ao contexto de cada turno, o que consome tokens de entrada. O ganho líquido aparece em sessões com respostas longas, e não em trocas curtas. Meça antes de concluir.

### 7.3 Observabilidade do agente

As duas ferramentas anteriores prometem economia; esta mede. O **ai-observer** é um backend local que recebe telemetria OpenTelemetry dos agentes de código e exibe tokens, custo, latência e sessões em um painel. Executa inteiramente na máquina, sem envio a serviço externo.

```bash
docker run -d \
  -p 8080:8080 \
  -p 4318:4318 \
  -v ai-observer-data:/app/data \
  --name ai-observer \
  tobilg/ai-observer:latest
```

* Acesse o painel em `http://localhost:8080`.
* Configure o agente para exportar telemetria ao endpoint OTLP `http://localhost:4318`, conforme a documentação da ferramenta em uso.

Esta é a mesma disciplina que a solução adota em produção, aplicada ao processo de construção: sem telemetria, o custo do agente permanece invisível, e não há como decidir onde reduzir contexto.

### 7.4 Comparação registrada

* Escolha uma mudança do backlog ainda não implementada.
* Execute-a antes e depois de ativar as ferramentas desta seção.
* Compare tokens de entrada, tokens de saída, tempo e número de intervenções necessárias.
* Registre a comparação em `docs/ai-log.md`.

### 7.5 Inventário de recomendação e garantia

Uma skill é consultiva: orienta a geração e pode ser ignorada. Um hook é determinístico: executa sempre e pode bloquear a ação. Daí a regra — **política que precisa valer sempre exige um hook por trás dela.**

* Abra o `AGENTS.md` e liste cada regra ali declarada.
* Para cada regra, classifique:

| Classificação | Critério | Onde fica |
| :---- | :---- | :---- |
| Recomendação aceitável | O desvio é visível na revisão e barato de corrigir | `AGENTS.md` ou skill |
| Exige garantia | O desvio é caro, silencioso ou irreversível | Hook, no documento de setup |

* Registre a tabela em `docs/ai-log.md`.
* Converta em hook, no mínimo, as quatro políticas a seguir:

| Política | Momento do hook |
| :---- | :---- |
| Nenhum segredo entra no repositório | Antes do commit, sobre o diff |
| Formatação e organização de importações aplicadas | Após edição de arquivo |
| Suíte de testes executada antes do commit | Antes do commit |
| Especificação sincronizada antes do arquivamento | Antes do arquivamento da mudança |

> O formato e os eventos de hook de cada ambiente estão nos documentos de setup. Esta subseção decide **o que** precisa de garantia; o documento de setup mostra **como** declará-la.

### 7.6 Modos de trabalho e paralelismo

Há dois modos de trabalhar com o agente, e eles não competem: cada um serve a um tipo de tarefa.

| | Condutor | Orquestrador |
| :---- | :---- | :---- |
| Ritmo | Tempo real, no editor | Assíncrono, por delegação |
| Indicado para | Lógica complexa, código desconhecido | Mudanças recortadas, com critério de aceite |
| Risco próprio | A pessoa torna-se o gargalo | Revisão superficial de um lote grande |

* Conduza as mudanças de arquitetura, de contrato e o esqueleto andante.
* Delegue as mudanças do backlog que já tenham critério de aceite declarado.

#### Sessões paralelas em árvores de trabalho

Duas sessões no mesmo diretório competem pelo índice do Git e produzem estados incoerentes. O isolamento é obtido com árvores de trabalho.

* A partir do diretório raiz do projeto, crie uma árvore por mudança em andamento:

```bash
git worktree add ../projeto-mudanca-a -b mudanca-a
git worktree add ../projeto-mudanca-b -b mudanca-b
```

* Abra uma sessão do agente em cada diretório, com uma mudança por sessão.
* Ao concluir, integre o ramo e remova a árvore:

```bash
git worktree remove ../projeto-mudanca-a
```

* Confira as árvores ativas:

```bash
git worktree list
```

> Limite o paralelismo ao que a revisão alcança. Três mudanças geradas em paralelo e revisadas por amostragem equivalem a uma mudança revisada, com o custo de três.

#### Subagentes para tarefas recorrentes

Tarefas que se repetem a cada mudança — revisar o diff, executar a suíte e relatar apenas as falhas, levantar o contexto de um módulo grande — ganham em declarar-se como subagentes: executam em contexto próprio, com ferramentas restritas ao necessário, e devolvem apenas o resultado.

* Declare, no mínimo, os três subagentes a seguir:

| Subagente | Ferramentas | Para que serve |
| :---- | :---- | :---- |
| Revisor | Somente leitura | Produz achados sobre o diff, sem poder alterá-lo |
| Executor de suíte | Leitura e execução | Roda testes e avaliações, relatando apenas falhas |
| Explorador | Somente leitura | Levanta o contexto de um módulo, sem ocupar a sessão principal |

> A restrição de ferramentas do revisor não é um detalhe: é ela que impede que o agente altere o código que está julgando. O formato de declaração de cada ambiente está nos documentos de setup.

### Experimento de harness

Execute este experimento uma vez, para observar o efeito da configuração do agente sobre o resultado.

* Escolha uma tarefa do `tasks.md` de uma mudança ainda não implementada.
* Execute-a em duas configurações diferentes, variando apenas um fator:
  * dois modelos diferentes, mesmo harness; ou
  * agente de planejamento antes da execução versus execução direta; ou
  * `AGENTS.md` completo versus `AGENTS.md` mínimo.
* Compare resultado, aderência às convenções, tokens consumidos e número de intervenções necessárias.
* Registre a comparação em `docs/ai-log.md`.

---

## 8. Ciclo de implementação das mudanças

O ciclo a seguir é executado para cada mudança do backlog, a começar pelo esqueleto andante da seção 6.

### Proposta de mudança

* Inicie uma nova sessão do agente.
* Execute:

```bash
/opsx-propose <id da mudança>
```

* É esperado que tenha sido criada uma estrutura semelhante a:

```text
└── openspec
    └── changes
        └── auth-perfis
            ├── design.md
            ├── proposal.md
            ├── specs
            │   └── <capacidade>
            │       └── spec.md
            └── tasks.md
```

* **Leia a proposta antes de aplicar.** É aqui que erros custam pouco para corrigir. Ajuste interagindo com o agente por meio de `/opsx-propose` ou editando diretamente os arquivos.

### Execução da mudança

* Inicie uma nova sessão do agente.
* Execute:

```bash
/opsx-apply <id da mudança>
```

* Acompanhe a execução e revise os diffs antes de aceitá-los.
* Caso sejam encontrados erros ou recursos não implementados, solicite os ajustes necessários.

### Verificação

* Inicie uma nova sessão do agente.
* Execute:

```bash
/opsx-verify <id da mudança>
```

* Ao final, será gerado um relatório de validação. Verifique se a mudança foi aplicada corretamente e corrija o que for necessário.

### Sincronização e arquivamento

* Para incluir a documentação criada na documentação persistente do projeto:

```bash
/opsx-sync
```

* Para encerrar a mudança:

```bash
/opsx-archive <id da mudança>
```

> Sincronizar e arquivar não é formalidade. As specs de capacidade em `openspec/specs/` descrevem o comportamento atual do sistema e serão o contexto do agente nas mudanças seguintes. Spec desatualizada engana tanto quem revisa quanto o agente.

---

## 9. Verificação e testes

### Verificação manual

Após cada mudança, execute o ciclo básico. Interaja com o agente para corrigir o que falhar.

```bash
npm run lint
npm run test
npm run build
npm run dev
```

Acesse os endereços da aplicação:

```text
http://localhost:3000   (frontend)
http://localhost:3001   (backend)
```

### Configuração do Playwright

* Acesse o terminal no diretório raiz do projeto.
* Inicialize o Playwright:

```bash
npm init playwright@latest
```

* Informe os seguintes valores:

```text
Do you want to use TypeScript or JavaScript? TypeScript
Where to put your end-to-end tests? apps/frontend/tests
Add a GitHub Actions workflow? yes
Install Playwright browsers? yes
Install Playwright operating system dependencies? yes
```

* Verifique a instalação:

```bash
npx playwright test
```

* Resultado esperado:

```text
Running 6 tests using 4 workers
  6 passed (4.1s)

To open last HTML report run:

  npx playwright show-report
```

* Remova o arquivo `apps/frontend/tests/example.spec.ts`.

> O servidor MCP do Playwright e os agentes de planejamento, geração e correção de testes foram configurados no setup do ambiente. Se o diretório de prompts do seu agente não contiver `playwright-test-planner.md`, `playwright-test-generator.md` e `playwright-test-healer.md`, volte ao documento de setup antes de prosseguir.

### Geração de testes com agentes

Antes desta seção, certifique-se de ter implementado pelo menos uma mudança com interface gráfica relevante, como login, catálogo de produtos, clientes ou pedidos.

#### Integração do Playwright com o Clerk

* Inicie uma nova sessão do agente.
* Execute:

```text
Efetue as configurações necessárias para a realização de testes do Playwright de forma
integrada ao Clerk, conforme @docs/architecture.md.

Configure o reaproveitamento de sessão autenticada: o login deve ser feito uma vez e o
estado reutilizado pelos demais testes.
```

#### Criação do plano de testes

> Nos prompts a seguir, substitua `<prompts do agente>` pelo diretório indicado no documento de configuração do agente adotado: `.agents/prompts` no ambiente de referência, `.opencode/prompts` no ambiente open source.

* Inicie uma nova sessão do agente.
* Execute o prompt a seguir, substituindo o caminho da especificação pelo correspondente no seu projeto.

```text
Use as orientações disponíveis em @<prompts do agente>/playwright-test-planner.md para criar
um plano de testes para o fluxo de login com Clerk.

Explore a especificação disponível em @openspec/specs/<capacidade>/spec.md.

Grave o plano no diretório specs/.
```

> Caso a especificação ainda não tenha sido sincronizada, ela pode ser encontrada em `openspec/changes/<id da mudança>/specs/` ou, se já arquivada, em `openspec/changes/archive/`.

* Verifique a criação do arquivo de planejamento em `specs/`.

#### Geração dos casos de teste

* Inicie uma nova sessão do agente.
* Execute o prompt a seguir, substituindo o nome do plano pelo criado no seu projeto.

```text
Use as orientações disponíveis em @<prompts do agente>/playwright-test-generator.md para
criar os testes do fluxo de login.

Explore o plano disponível em @specs/login-flow-test-plan.md e a documentação disponível
em @docs/spec.md.

Crie um único arquivo com toda a suíte de testes para o plano proposto, em
apps/frontend/tests/.
```

> Os planos de teste ficam em `specs/`; os casos de teste executáveis ficam em `apps/frontend/tests/`.

* Verifique a execução dos testes e o relatório gerado.

#### Revisão obrigatória dos testes gerados

Antes de aceitar os testes, percorra este checklist:

* [ ] O teste verifica o critério de aceite da especificação, não apenas que a página carregou
* [ ] As asserções são específicas (conteúdo, estado, status), não genéricas
* [ ] Não há espera fixa (`sleep`) nem timeout inflado para contornar instabilidade
* [ ] O teste falha quando o comportamento quebra

O último item se verifica na prática: quebre o código de propósito e confirme que a suíte fica vermelha. Se continuar verde, a suíte não serve.

#### Ajuste dos testes

Execute esta seção caso tenham ocorrido erros na execução.

* Inicie uma nova sessão do agente.
* Execute:

```text
Use as orientações disponíveis em @<prompts do agente>/playwright-test-healer.md para
ajustar os testes do fluxo de login criados em @apps/frontend/tests/login-flow.spec.ts.

Restrições:
- Não altere asserções existentes para fazer o teste passar.
- Se concluir que o teste está errado, pare e me explique, em vez de corrigi-lo.
- Ao final, liste o que mudou e por quê.
```

* Reexecute a suíte com acompanhamento visual:

```bash
npx playwright test --headed
```

* Verifique o relatório:

```bash
npx playwright show-report
```

> Revise o diff dos arquivos de teste, não só o do código. Um agente em ciclo de correção pode relaxar uma asserção, aumentar um timeout ou remover uma verificação: o resultado é um teste verde que não verifica nada.

O ciclo planejamento → geração → revisão → ajuste deve ser executado para cada nova mudança implementada.

### Inspeção de código

#### Servidor SonarQube

* Acesse o terminal e inicialize o servidor:

```bash
docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
```

* Alternativamente, configure o Sonar como serviço no `docker-compose.yaml`:

```yaml
  sonar:
    image: sonarqube:latest
    restart: unless-stopped
    environment:
      - SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true
    ports:
      - "9000:9000"
    volumes:
      - sonar_data:/opt/sonarqube/data
      - sonar_extensions:/opt/sonarqube/extensions
      - sonar_logs:/opt/sonarqube/logs
    networks:
      - app-network
```

* Acesse `http://localhost:9000`.
* Informe as credenciais iniciais (usuário `admin`, senha `admin`) e altere a senha.
* Em Projects, selecione "Create a local project", informe os dados e acione Next.
* Em "Set up new code for project", escolha "Follows the instance's defaults" e acione Create project.
* Na seção "Analysis Method", selecione Locally.
* Em "Provide a token", acione Generate e anote o token.
* Em "Run code analysis on your project", selecione "JS/TS & Web".

#### Scanner

* No diretório raiz, crie o arquivo `sonar-project.properties`:

```properties
# Informações do projeto
sonar.projectKey=<projectKey configurado>
sonar.projectName=<nome do projeto>
sonar.host.url=http://localhost:9000

# Fontes e testes
sonar.sources=apps/backend/src,apps/frontend/src
sonar.tests=apps/backend/src,apps/frontend/src,apps/frontend/tests

# Separação entre fontes e testes
sonar.test.inclusions=**/*.spec.ts,**/*.test.ts
sonar.exclusions=**/*.spec.ts,**/*.test.ts

# Relatórios de cobertura
sonar.javascript.lcov.reportPaths=apps/backend/coverage/lcov.info,apps/frontend/coverage/lcov.info
```

> Sem `sonar.exclusions`, o scanner indexa o mesmo arquivo como fonte e como teste e a análise falha.

* Execute a suíte de testes para coletar as métricas de cobertura.
* Instale o scanner:

```bash
npm install -g @sonar/scan
```

* Exporte o token anotado e execute o scanner:

```bash
export SONARQUBE_TOKEN=<token gerado no Sonar>
sonar -Dsonar.token=$SONARQUBE_TOKEN
```

* Acesse novamente `http://localhost:9000` e verifique os resultados.

> Cobertura alta com asserções fracas transmite falsa confiança. Leia os relatórios com ceticismo.

### Suíte de avaliação da funcionalidade de IA

O teste compara a saída a um resultado exato. A funcionalidade de IA não tem resultado exato, e por isso não se verifica por teste: verifica-se por avaliação, que aplica critérios a um conjunto de tarefas e pontua contra um limiar.

#### Composição da suíte

* Reúna de **vinte a cinquenta tarefas reais** da própria solução: solicitações que o sistema de fato recebe, com as entradas efetivamente usadas. Exemplo inventado avalia o exemplo, não o sistema.
* Crie o arquivo `evals/promptfooconfig.yaml`:

```yaml
description: Avaliação da funcionalidade de IA

prompts:
  - file://../apps/backend/src/ai/prompt.txt

providers:
  - id: openai:chat:gpt-4o-mini   # ajuste para o provider do projeto

defaultTest:
  threshold: 0.8
  assert:
    - type: is-json              # determinístico: a saída é JSON válido
    - type: cost
      threshold: 0.01            # determinístico: custo máximo por caso
    - type: latency
      threshold: 8000            # determinístico: limite em milissegundos

tests:
  - description: caso real 01
    vars:
      entrada: <texto da solicitação real>
    assert:
      - type: contains-all
        value: ["<campo obrigatório>", "<campo obrigatório>"]
      - type: llm-rubric
        value: A resposta atende à solicitação sem inventar dados ausentes na entrada
        weight: 2
      - type: javascript
        value: JSON.parse(output).confianca >= 0 && JSON.parse(output).confianca <= 1
        weight: 0                # métrica registrada, sem reprovar o caso
```

* Prefira o critério determinístico sempre que a verificação puder ser objetiva: formato, campo obrigatório, esquema, faixa de valor, custo e latência. O critério julgado por modelo é caro, lento e ele próprio probabilístico — reserve-o ao que não se expressa como regra.
* Declare o `threshold` explicitamente. Sem ele, toda asserção de peso não nulo precisa passar, e um único critério semântico reprova o caso inteiro.
* Use `weight: 0` para registrar uma métrica sem que ela interfira no veredito.

#### Execução

* Localmente, durante o desenvolvimento:

```bash
npx promptfoo eval -c evals/promptfooconfig.yaml
npx promptfoo view
```

* Dois regimes no pipeline, por razões de custo:

| Regime | Quando executa | Como |
| :---- | :---- | :---- |
| Respostas gravadas | Em cada alteração | Sem chamada ao modelo; verifica a lógica em torno da chamada |
| Modelo real | Em periodicidade própria | Com chamada ao modelo; detecta mudança de comportamento do provider |

* Acrescente o passo ao workflow de integração contínua:

```yaml
      - name: Avaliações da funcionalidade de IA
        run: npx promptfoo eval -c evals/promptfooconfig.yaml --no-cache
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

* Trate a queda da pontuação abaixo do limiar como **falha de build**, e não como aviso.
* Registre o resultado de cada execução em `docs/ai-log.md`: a avaliação isolada diz pouco; a série histórica diz se o sistema está melhorando ou piorando.

#### Avaliação de trajetória

A avaliação acima julga o resultado. Há um segundo eixo, que julga o caminho: as ferramentas chamadas, a ordem dos passos e eventuais verificações contornadas.

* Registre, em cada chamada da funcionalidade de IA, quais consultas e ferramentas foram acionadas.
* Acrescente asserções sobre esse registro:

| O que verificar | Como |
| :---- | :---- |
| A consulta à base ocorreu | Asserção `javascript` sobre o registro da chamada |
| A ordem respeitou as dependências | Asserção `javascript` sobre a sequência registrada |
| Nenhuma validação foi contornada | Asserção `contains-all` sobre as etapas obrigatórias |

> O caso que justifica este eixo: uma funcionalidade que deveria consultar a base pode responder corretamente sem ter consultado nada, por coincidência ou porque o conteúdo já estava no contexto. A avaliação de resultado aprova; só a de trajetória mostra que o acerto não era confiável.

#### A regra de crescimento

Todo incidente observado em uso torna-se um caso de avaliação, com o critério que a falha revelou. É a tarefa real mais valiosa que existe, porque já se sabe que o sistema erra nela.

### Política de revisão assistida

A revisão automática executa sobre toda alteração proposta, governada por um arquivo de política versionado. Sem a política escrita, cada revisão procura o que o prompt daquele momento sugeriu.

* Crie o arquivo `REVIEW.md` no diretório raiz:

```markdown
# Política de revisão

## O que a revisão procura
- Defeito de lógica e caso de borda não tratado
- Risco de segurança: credencial exposta, entrada não validada, consulta construída por concatenação
- Desvio das convenções declaradas no AGENTS.md
- Alteração de comportamento sem teste ou avaliação correspondente
- Enfraquecimento ou remoção de verificador existente

## Severidade
- Bloqueia a integração: segurança, perda de dado, remoção de verificador, segredo versionado
- Registra sem bloquear: estilo, nomeação, duplicação pequena, sugestão de simplificação

## O que a revisão não faz
- Não aprova a alteração: produz achados. Aprovação não é achado.
- Não altera esta política. Mudança de política é mudança de código, e passa por revisão.
```

* Invoque o subagente revisor declarado na seção 7.6 ao final de cada mudança, com a política como contexto:

```text
Revise o diff desta mudança segundo a política em @REVIEW.md.

Para cada achado, informe: arquivo e linha, severidade segundo a política, o que
está errado e o que a correção exigiria. Não altere nenhum arquivo. Não emita
veredito de aprovação.
```

* Corrija os achados que bloqueiam; registre em `docs/ai-log.md` os que apenas se registram, com a decisão tomada.

#### Separação de responsabilidades

Quem produz a mudança não é quem a aprova. Aplicado ao agente: ele atua até o portão, e não dispõe de caminho para atravessá-lo.

* O subagente revisor é declarado **somente com permissão de leitura**: não pode alterar o código que julga.
* O agente que implementou a mudança não a revisa na mesma sessão. Contexto novo percebe o que o autor não percebe.
* A aprovação é um ato humano explícito, executado sobre o diff e os achados, fora da sessão que gerou o código.
* A garantia é mecânica: a proteção de branch exige os status checks de teste, de avaliação e de quality gate.

> Enquanto a aprovação permanecer tecnicamente ao alcance de quem produziu a mudança, a separação é apenas uma intenção. Vale aqui a mesma distinção da seção 7.5: convenção é recomendação; proteção de branch é garantia.

---

## 10. Liberação do MVP

Esta seção coloca o MVP no ar nas plataformas gerenciadas, com pipeline de entrega e observabilidade. A migração para a versão final na AWS é tratada em roteiro específico, depois que o MVP estiver funcionando (seção 11).

Trate cada item a seguir como uma mudança do OpenSpec, seguindo o mesmo ciclo da seção 8.

### Banco de dados e identidade em ambiente remoto

* Inicie uma nova sessão do agente.
* Execute:

```text
/opsx-propose infra-mvp-remoto

Contexto: @docs/architecture.md (visão de implantação), @AGENTS.md

Requisitos:
- Projeto criado no Supabase, com as migrações aplicadas a partir do esquema do projeto.
- Variáveis NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL e
  DIRECT_URL preenchidas no .env e documentadas no .env.example.
- Aplicação do Clerk configurada para o domínio de produção, com os perfis de usuário
  previstos na especificação.
- Nenhuma credencial versionada no repositório.
```

* Confirme que a aplicação local consegue conversar com o banco remoto antes de prosseguir.

### Publicação do frontend

* Execute:

```text
/opsx-propose deploy-vercel

Contexto: @docs/architecture.md, @AGENTS.md

Requisitos:
- Projeto na Vercel vinculado ao repositório, com build do monorepo configurado.
- Variáveis de ambiente cadastradas no projeto da Vercel, separadas por ambiente.
- Backend publicado de forma acessível ao frontend, com a URL refletida em
  NEXT_PUBLIC_API_URL.
- Domínio de produção registrado no Clerk e nas origens permitidas (CORS) do backend.
```

* Verifique a aplicação publicada percorrendo os dois fluxos de negócio ponta a ponta no navegador.

### Observabilidade

* Execute:

```text
/opsx-propose observabilidade

Contexto: @docs/architecture.md, @AGENTS.md

Requisitos:
- Instrumentação com OpenTelemetry: logs, métricas e traces.
- Identificador de correlação atravessando a requisição, do frontend ao banco.
- Instrumentação específica do componente de inteligência artificial: modelo e provider
  utilizados, tokens de entrada e saída, latência, ocorrência de fallback e rejeição da
  resposta pela validação.
- Não registrar dados pessoais: prefira metadados e hashes a conteúdo de prompts e
  respostas.
```

Verifique a instrumentação tentando responder a estas três perguntas apenas com o que o sistema emite:

1. Um usuário relatou erro ao concluir o fluxo principal há dez minutos. O que aconteceu na requisição dele?
2. Qual a latência p95 do endpoint mais usado nas últimas vinte e quatro horas?
3. Quantos tokens a funcionalidade de IA consumiu hoje e houve fallback de provider?

Se alguma pergunta ficar sem resposta, a instrumentação está incompleta.

### Pipeline de entrega contínua

* Execute:

```text
/opsx-propose pipeline-cd

Contexto: @docs/architecture.md, @AGENTS.md, @.github/workflows/

Requisitos:
- Workflow de entrega disparado na branch principal.
- Etapas na ordem: lint, testes de unidade e integração, análise Sonar, build e publicação.
- Token do Sonar e demais valores sensíveis como secrets do repositório; nenhum valor
  sensível no arquivo do workflow.
- Ambiente (environment) com regra de proteção exigindo aprovação manual antes da
  publicação em produção.
- Testes de aceite executados contra o ambiente publicado.
```

* Configure a proteção da branch principal exigindo os status checks do workflow. Sem isso, o gate de qualidade é apenas uma sugestão.

### Métricas do ciclo

Com o pipeline em produção, o repositório e a integração contínua já produzem o suficiente para medir o próprio processo. Medir apenas o que já existe é a regra aqui: nenhuma instrumentação adicional.

* Crie em `docs/ai-log.md` uma tabela com os cinco indicadores e atualize-a ao encerrar cada mudança:

| Indicador | Onde se obtém |
| :---- | :---- |
| Mudanças integradas na primeira passagem | Histórico de pull requests |
| Tempo da proposta até a integração | Registro do OpenSpec e do Git |
| Ciclos de retrabalho por mudança | Contagem de reaberturas |
| Sucesso de primeira passagem no pipeline | Registros da integração contínua |
| Custo em tokens por mudança | Telemetria do agente, instalada na seção 7 |

* Comandos úteis para a coleta:

```bash
# tempo entre abertura e integração das últimas vinte solicitações
gh pr list --state merged --limit 20 --json number,createdAt,mergedAt

# execuções do pipeline e o respectivo veredito
gh run list --limit 20 --json displayTitle,conclusion,createdAt
```

* Restrinja o indicador de **sucesso de primeira passagem** às mudanças escritas pelo agente: é esse recorte que mede a qualidade do harness. Se o número cai, algum guia ou sensor está faltando — e a resposta está na seção 7.
* O **custo em tokens por mudança** é o denominador do ganho. Sem ele, a afirmação de que o agente acelerou o trabalho não tem com o que ser comparada.

> As quatro medidas consagradas de desempenho de entrega — frequência de implantação, tempo de espera até a produção, tempo de restauração e taxa de falha de alteração — pressupõem uma equipe e um histórico. O conjunto acima é a redução viável para um projeto individual, e preserva o essencial: rendimento e estabilidade medidos separadamente.

### Verificação do MVP

* [ ] Dois fluxos de negócio ponta a ponta percorríveis na aplicação publicada
* [ ] Funcionalidade de inteligência artificial operando e instrumentada
* [ ] Pipeline verde, com gate de qualidade e avaliações ativos
* [ ] URL e credenciais de acesso disponíveis
* [ ] As três perguntas de observabilidade respondidas com o que o sistema emite
* [ ] Tabela de indicadores do ciclo iniciada em `docs/ai-log.md`

---

## 11. Migração para a versão final

O MVP valida os fluxos de negócio, mas apoia-se em plataformas gerenciadas. Isso atende à entrega rápida e deixa em aberto a portabilidade, a implantação automatizada e a recriação completa de ambientes.

A **AWS é a referência desejada** para a versão final: contêineres compatíveis com o padrão OCI, infraestrutura descrita em Terraform e pipeline capaz de recriar o ambiente do zero.

> **Esta migração é feita em roteiro específico:** [Configuração para interação com AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/configuracao_aws.md). Execute-o somente depois que o MVP estiver funcionando e com os fluxos validados.

O que o roteiro de migração cobre:

| Etapa | Resultado |
| :---- | :---- |
| Configuração do ambiente AWS | Credenciais, MCP servers da AWS e skills de implantação configurados no agente |
| Análise de decisão arquitetural | `docs/ada.md`, comparando arquiteturas candidatas e definindo o plano de evolução incremental |
| Empacotamento | Dockerfiles com build em múltiplos estágios, imagem base versionada e `.dockerignore` |
| Infraestrutura como código | Descrição Terraform do ambiente, com estado remoto e variáveis para o que muda entre ambientes |
| Implantação | Pipeline estendido com build da imagem, `terraform plan` e `terraform apply`, autenticando por OIDC |
| Prova de reprodutibilidade | Ambiente destruído e recriado pelo pipeline, com registro do que exigiu intervenção manual |

Dois avisos que valem antes de começar:

> O arquivo de estado do Terraform contém dados sensíveis e não vai para o Git. O comando `terraform destroy` apaga recursos de verdade, então leia o plano antes de aplicar. Segredos vêm de variáveis, nunca escritos nos arquivos `.tf`.

> O termo *provider* no Terraform designa um plugin de infraestrutura. Não tem relação com os providers de modelos de IA configurados no setup do ambiente.

Ao final da migração, cada intervenção manual que tiver sido necessária é uma lacuna na infraestrutura como código. Transforme cada uma em uma nova mudança no backlog.

---

## 12. Evolução

### Faixas de controle e laço fechado

A telemetria da seção 10 informa. Falta ligá-la à ação: o monitoramento determinístico detecta a quebra de uma faixa e **só então** aciona o agente. A detecção não é delegada ao agente, que é caro como observador contínuo e, sendo probabilístico, pouco confiável como detector.

* Crie o arquivo `ops/faixas.yaml`, versionado no repositório:

```yaml
# Faixas de controle. Média e desvio padrão calculados sobre a janela declarada.
janela: 7d

faixas:
  - sinal: latencia_p95_api
    unidade: ms
    limiares:
      registrar: 1          # 1 desvio acima da média
      diagnosticar: 2
      propor: 3

  - sinal: taxa_erro_5xx
    unidade: proporcao
    limiares:
      registrar: 1
      diagnosticar: 2
      propor: 3

  - sinal: custo_tokens_por_requisicao
    unidade: usd
    limiares:
      registrar: 1
      diagnosticar: 2
      propor: 3

  - sinal: uso_caminho_alternativo
    unidade: proporcao
    limiares:
      registrar: 1
      diagnosticar: 2
      propor: 2

revisao_das_faixas: mensal
```

* Os três níveis de autonomia, acionados pela severidade do desvio:

| Nível | O que acontece | Quem executa |
| :---- | :---- | :---- |
| Registrar | O desvio é anotado; o agente não é acionado | Monitoramento |
| Diagnosticar | O agente investiga em modo somente leitura e descreve a causa provável | Subagente explorador, da seção 7.6 |
| Propor | O agente abre uma mudança, ou executa procedimento já aprovado | Agente principal |

* Prompt de diagnóstico, para o nível correspondente:

```text
A faixa de @ops/faixas.yaml foi rompida no sinal <sinal>, em <nível> desvios.

Contexto: @docs/architecture.md, @ops/faixas.yaml

Investigue em modo somente leitura: consulte a telemetria, identifique as requisições
afetadas pelo identificador de correlação e descreva a causa provável.

Não altere nenhum arquivo. Não abra mudança. Entregue: sinal, janela afetada,
requisições de exemplo, causa provável e o que confirmaria a hipótese.
```

* Revise as faixas na periodicidade declarada. Faixa calibrada sobre dados antigos deixa de alertar; faixa calculada durante um período de degradação passa a tratar a degradação como normal.
* O agente **propõe**; a liberação permanece no portão humano, pelas razões da seção 9. A separação de responsabilidades não se suspende porque o gatilho foi automático.

#### Onde o achado de produção vai

| Natureza do achado | Destino |
| :---- | :---- |
| Defeito que exige alteração de comportamento | Mudança no `backlog.md`, pelo ciclo da seção 8 |
| Falha de qualidade do componente de IA | Caso novo na suíte de avaliação da seção 9 |
| Falha idêntica pela segunda vez | Ajuste de harness, pela seção 7 |

> É aqui que o laço se fecha: o sinal que veio da produção reabre a especificação, e o que começou no `problem.md` retorna como entrada de uma nova iteração.

### Mudança evolutiva em sistema existente

Esta atividade testa a qualidade da documentação e do harness produzidos. O ganho vem de trabalhar sobre um sistema escrito por outra pessoa.

* Obtenha o repositório de outro projeto que siga este fluxo. Na falta dele, use o [projeto de referência](https://github.com/valuedriven/devai), cujo domínio é diferente do seu — o que preserva o essencial da verificação, que é depender só do que está escrito.
* Recrie o ambiente de desenvolvimento usando apenas o `README.md` e o setup documentado.
* Implemente uma pequena mudança evolutiva usando apenas `docs/`, `AGENTS.md`, `backlog.md` e `openspec/specs/`, sem consultar quem escreveu o sistema.
* Siga o ciclo completo: `/opsx-propose` → `/opsx-apply` → `/opsx-verify` → `/opsx-sync` → `/opsx-archive`.

Registre os atritos encontrados:

| Momento | Pergunta |
| :---- | :---- |
| Montagem do ambiente | Quanto tempo até rodar? O que faltou documentado? |
| Entendimento do domínio | O `problem.md` e o `prd.md` foram suficientes? |
| Localização do código | A arquitetura descrita corresponde ao que existe? |
| Comportamento atual | As specs de capacidade eram verdadeiras? |
| Uso do agente | O `AGENTS.md` deu contexto suficiente? |
| Testes | A suíte deu confiança para alterar? |

Em seguida, aplique a mesma leitura ao repositório próprio: cada atrito encontrado no projeto alheio provavelmente existe nele.

### Refatoração assistida

* Refatore em passos pequenos, com a suíte verde entre eles.
* Não aceite refatoração e mudança de comportamento no mesmo diff.
* Desconfie se a suíte precisou ser ajustada para a refatoração passar: nesse caso, o comportamento mudou.

### Síntese crítica

Ao final, acrescente a `docs/ai-log.md` uma seção respondendo, com base nos registros feitos ao longo do fluxo:

* Onde a IA acelerou de verdade? Sustente a resposta com os indicadores do ciclo, da seção 10.
* Onde ela custou tempo?
* Que tipo de erro ela cometeu com mais frequência?
* O que melhorou quando o harness melhorou? Compare o sucesso de primeira passagem antes e depois da seção 7.
* Quanto custou, em tokens e em escolhas de modelo e provider?
* Quais políticas precisaram de hook, e por que a recomendação não bastou?
* Quantos casos de avaliação nasceram de incidentes observados em uso?
* O que continuou sendo trabalho humano?

---

## Verificação final da entrega

* [ ] `AGENTS.md`, skills, MCP servers e subagentes configurados
* [ ] Inventário de recomendação e garantia feito, com os hooks correspondentes ativos
* [ ] `openspec/backlog.md` e propostas revisadas
* [ ] Esqueleto andante executando, com integração contínua verde
* [ ] Dois fluxos de negócio ponta a ponta implementados e testados nos três níveis
* [ ] Funcionalidade de inteligência artificial implementada, avaliada e instrumentada
* [ ] Suíte de avaliação versionada, com limiar declarado e em execução no pipeline
* [ ] `REVIEW.md` versionado e revisão assistida em uso ao final de cada mudança
* [ ] Pipeline de CI/CD com gate de qualidade, avaliações e proteção de branch
* [ ] Observabilidade respondendo às três perguntas de verificação
* [ ] `ops/faixas.yaml` versionado, com limiares e níveis de autonomia declarados
* [ ] MVP publicado, com URL e credenciais disponíveis
* [ ] Indicadores do ciclo registrados em `docs/ai-log.md`
* [ ] Specs de capacidade sincronizadas e mudanças arquivadas
* [ ] Migração para a AWS executada pelo roteiro específico, com contêineres OCI e Terraform versionados
* [ ] Mudança evolutiva implementada e atritos registrados
* [ ] `docs/ai-log.md` completo, com a síntese crítica
