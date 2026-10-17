# Roteiro de Entrega

Este roteiro descreve o passo a passo da construção, da liberação e da evolução da solução. Ele parte dos artefatos produzidos no [Roteiro de Descoberta](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_discovery.md) e vai até a evolução do sistema em produção.

> O repositório [valuedriven/devai](https://github.com/valuedriven/devai) é um **blueprint**: serve de exemplo de forma para os artefatos e a configuração, e é citado nos prompts. O projeto é seu, com domínio próprio e requisitos funcionais próprios.

---

## 1. Visão geral do fluxo

**Resultados:**

* Agente de desenvolvimento configurado, com `AGENTS.md` próprio do projeto
* Backlog de mudanças (`backlog.md`) e propostas de mudança
* Esqueleto andante com integração contínua
* Incrementos de produto com testes de unidade, integração e aceite
* Política de revisão assistida (`REVIEW.md`), aplicada ao final de cada mudança
* Pipeline de CI/CD e MVP publicado, com indicadores do ciclo acompanhados

**Ferramentas:** agente de desenvolvimento, OpenSpec, Playwright, SonarQube, GitHub Actions e Terraform. A descrição e o endereço de cada uma estão no [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md); a stack da solução, nos [Requisitos do Projeto](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_do_projeto.md).

**Escopo:** este roteiro vai do backlog de mudanças ao MVP publicado e verificado. Ele é escrito de forma independente da ferramenta de agente e da plataforma de implantação; o que é específico de uma ou de outra fica em documentos próprios.

| Documento complementar | Para que serve |
| :---- | :---- |
| [Catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md) | O que cada ferramenta faz, onde obter e como instalar |
| [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) | Regras, skills, MCP, hooks e subagentes implantados no agente escolhido, e ajustes de contexto e custo |
| [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md) | Passos de implantação nas plataformas gerenciadas: Vercel, Supabase e Clerk |
| [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md) | O que vem depois do MVP: migração para a versão final na AWS, laço fechado com a telemetria e mudança evolutiva |

---

## 2. Orientações gerais

Os comandos deste roteiro consideram tanto execuções via terminal quanto pela interface de chat do agente de IA. Fique atento ao contexto de cada execução.

### Pré-requisitos

Instale, conforme o [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md):

* a plataforma base — Node.js e npm, Git, Docker e Terraform;
* as ferramentas do projeto — OpenSpec e Playwright;
* um dos agentes de desenvolvimento.

Crie contas em:

* [GitHub](https://github.com/) — repositório, integração contínua e proteção de branch;
* [Context7](https://context7.com/) — servidor MCP de documentação atualizada.

As credenciais das plataformas de implantação pertencem à stack da solução e estão nos [Requisitos do Projeto](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_do_projeto.md); o roteiro de implantação indica onde obter cada valor.

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

Instale as ferramentas conforme o [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md). Esta seção trata apenas da **inicialização no projeto**, que exige indicar o agente em uso.

| Agente | Identificador nas CLIs |
| :---- | :---- |
| Google Antigravity | `antigravity` |
| OpenCode | `opencode` |
| DeepSeek Harness | `dsh` |

> Grafias diferentes desses identificadores fazem o comando falhar ou, pior, serem ignoradas em silêncio.

#### OpenSpec

Usado a partir da seção 5.

* No diretório raiz do projeto, declarando os agentes que serão usados:

```bash
openspec init --tools antigravity,opencode,dsh
openspec view
```

> Separe os nomes por vírgula **sem espaço**. Um espaço após a vírgula faz o shell tratar o segundo nome como argumento separado, e a inicialização falha. Declarar os três de uma vez permite trocar de agente sem reinicializar.

O `init` cria a árvore `openspec/`, com `changes/`, `config.yaml` e `specs/`, e grava comandos e skills nos diretórios de cada agente:

| Agente | Skills do OpenSpec | Comandos e workflows |
| :---- | :---- | :---- |
| `antigravity` | `.agents/skills/` | `.agents/workflows/` |
| `opencode` | `.opencode/skills/` | `.opencode/commands/` |
| `dsh` | `.dsh/skills/` | não há arquivos de comando |

* Caso tenha sido criada a pasta `.agent`, no singular, mova seu conteúdo para `.agents`.

**Convivência com os arquivos do projeto.** O `openspec update` — executado após atualização da CLI ou mudança de perfil — **reescreve** os arquivos que o `init` gerou.

| Cuidado | Razão |
| :---- | :---- |
| Não edite os arquivos gerados pelo OpenSpec | `openspec update` os sobrescreve, e a edição se perde |
| Mantenha o que é do projeto fora dos diretórios gerados | Regras, hooks e subagentes nascem no diretório de autoria do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md), e não são tocados |
| Confira os diretórios após cada `openspec update` | Para verificar que nada próprio foi removido |

O ajuste do `openspec/config.yaml` é feito na seção 5, depois da configuração do agente.

#### Playwright

Usado a partir da seção 8.

* No diretório raiz do projeto, gere os prompts que o agente usa para planejar, gerar e corrigir testes de aceite:

```bash
npx playwright init-agents --loop=opencode
```

| Agente | Procedimento |
| :---- | :---- |
| OpenCode | Os arquivos ficam em `.opencode/prompts/` |
| Antigravity | Não há laço específico. **Mova** os arquivos para `.agents/prompts/` |
| DeepSeek Harness | Não há laço específico. **Mova** os arquivos para `.agents/skills/`, um diretório por prompt, acrescentando o *frontmatter* de skill descrito no [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) |

* Confirme os três prompts gerados: `playwright-test-planner`, `playwright-test-generator` e `playwright-test-healer`.
* Consulte os laços aceitos pela versão instalada com `npx playwright init-agents --help`.

> Regenere esses arquivos após cada atualização do Playwright: eles descrevem a API da versão instalada e envelhecem com ela.

### Configuração de variáveis de ambiente

* No diretório raiz do projeto, crie o arquivo `.env` com o conteúdo a seguir.
* Acesse os endereços indicados junto a cada credencial e obtenha os valores solicitados.

```bash
PROJECT_NAME=<nome do projeto>
GLOBAL_PREFIX=api/v1

# Context7 — documentação atualizada de bibliotecas, consumida pelo servidor MCP
# https://context7.com/dashboard → API Keys → Create API Key
CONTEXT7_API_KEY=

# Aplicação
FRONTEND_PORT=3000
BACKEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

> O valor de `NEXT_PUBLIC_API_URL` precisa coincidir com `BACKEND_PORT` e `GLOBAL_PREFIX`. Divergências aqui produzem erros de integração difíceis de diagnosticar.

* Acrescente as credenciais das plataformas escolhidas na arquitetura do projeto. As das plataformas gerenciadas usadas no MVP estão no [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md), com o endereço de onde obter cada valor.

* Crie ou atualize o arquivo `.gitignore` e inclua nele:

```text
.env
```

* Crie também um arquivo `.env.example` com as mesmas chaves e sem os valores. Esse arquivo é versionado e documenta as variáveis necessárias.

> O Roteiro de Configuração do Ambiente, indicado na seção 4, acrescenta a este arquivo as variáveis do agente e dos modelos. Preencha-as lá.

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

Execute o [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) antes de prosseguir. Ele instala a configuração — regras, skills, servidores MCP, hooks e subagentes — no agente escolhido, em formato único para Antigravity, OpenCode e DeepSeek Harness.

Ao terminar, retome aqui.

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
  - Revisão segundo a política em REVIEW.md, com os achados que bloqueiam corrigidos.
  - Quality gate do SonarQube aprovado.
```

> Dois cuidados. Os arquivos que o OpenSpec **gera** — comandos, skills e workflows nos diretórios do agente — são reescritos por `openspec update`, executado após atualização da CLI ou mudança de perfil. Edições manuais nesses arquivos se perdem: o que é do projeto nasce no `AGENTS.md` e no diretório de autoria do Roteiro de Configuração do Ambiente. E os subagentes convivem com esses diretórios, mas não dentro deles.

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

A primeira mudança do backlog é o **esqueleto andante**: a menor versão do sistema que atravessa todas as camadas e efetivamente executa — frontend chamando a API, API acessando o banco — sem funcionalidade de negócio relevante. Ela é implementada pelo ciclo descrito na seção 7.

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
- Diretório infra/ com configuração Terraform para o provider de hospedagem definido
  em docs/architecture.md.
- Recurso de projeto da plataforma ligado ao repositório do GitHub.
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

> **Atenção ao vocabulário:** *provider* no Terraform designa um plugin de infraestrutura. Não guarda relação com os *providers de modelos de IA* configurados no Roteiro de Configuração do Ambiente.

### Verificação da etapa

* [ ] Esqueleto andante executando localmente
* [ ] Workflow de integração contínua executando a cada push
* [ ] `terraform plan` sem divergências após o `apply`
* [ ] Frontend publicado a partir do projeto provisionado
* [ ] Nenhum segredo no repositório nem no estado versionado

---

## 7. Ciclo de implementação das mudanças

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

## 8. Verificação e testes

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

> Os agentes de planejamento, geração e correção de testes foram gerados na seção 3, e o servidor MCP do Playwright foi configurado no Roteiro de Configuração do Ambiente. Se o diretório de prompts do agente em uso não contiver `playwright-test-planner.md`, `playwright-test-generator.md` e `playwright-test-healer.md`, volte à seção 3 antes de prosseguir.

### Geração de testes com agentes

Antes desta seção, certifique-se de ter implementado pelo menos uma mudança com interface gráfica relevante, como login, catálogo de produtos, clientes ou pedidos.

#### Integração do Playwright com o provedor de identidade

* Inicie uma nova sessão do agente.
* Execute:

```text
Efetue as configurações necessárias para a realização de testes do Playwright de forma
integrada ao provedor de identidade do projeto, conforme @docs/architecture.md.

Configure o reaproveitamento de sessão autenticada: o login deve ser feito uma vez e o
estado reutilizado pelos demais testes.
```

#### Criação do plano de testes

> Nos prompts a seguir, substitua `<prompts do agente>` pelo diretório do agente em uso: `.agents/prompts` no Antigravity, `.opencode/prompts` no OpenCode, `.agents/skills` no DeepSeek Harness.

* Inicie uma nova sessão do agente.
* Execute o prompt a seguir, substituindo o caminho da especificação pelo correspondente no seu projeto.

```text
Use as orientações disponíveis em @<prompts do agente>/playwright-test-planner.md para criar
um plano de testes para o fluxo de login.

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

### Política de revisão assistida

A revisão automática executa sobre toda alteração proposta, governada por um arquivo de política versionado. Sem a política escrita, cada revisão procura o que o prompt daquele momento sugeriu.

* Crie o arquivo `REVIEW.md` no diretório raiz:

```markdown
# Política de revisão

## O que a revisão procura
- Defeito de lógica e caso de borda não tratado
- Risco de segurança: credencial exposta, entrada não validada, consulta construída por concatenação
- Desvio das convenções declaradas no AGENTS.md
- Alteração de comportamento sem teste correspondente
- Enfraquecimento ou remoção de verificador existente

## Severidade
- Bloqueia a integração: segurança, perda de dado, remoção de verificador, segredo versionado
- Registra sem bloquear: estilo, nomeação, duplicação pequena, sugestão de simplificação

## O que a revisão não faz
- Não aprova a alteração: produz achados. Aprovação não é achado.
- Não altera esta política. Mudança de política é mudança de código, e passa por revisão.
```

* Invoque o subagente revisor, declarado no Roteiro de Configuração do Ambiente, ao final de cada mudança, com a política como contexto:

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
* A garantia é mecânica: a proteção de branch exige os status checks de teste e de quality gate.

> Enquanto a aprovação permanecer tecnicamente ao alcance de quem produziu a mudança, a separação é apenas uma intenção. Vale aqui a mesma distinção do inventário de recomendação e garantia, no Roteiro de Configuração do Ambiente: convenção é recomendação; proteção de branch é garantia.

---

## 9. Liberação do MVP

Esta seção coloca o MVP no ar, com pipeline de entrega e observabilidade. Ela encerra o escopo deste roteiro.

Trate cada item a seguir como uma mudança do OpenSpec, seguindo o mesmo ciclo da seção 7.

> Os passos de criação dos recursos nas plataformas gerenciadas — banco, identidade e hospedagem — estão no [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md). Execute-o ao chegar aqui e retorne para a observabilidade e o pipeline. O que vem depois do MVP está no [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md).

### Banco, identidade e hospedagem em ambiente remoto

Esta etapa cria os recursos remotos e publica a aplicação. Os passos dependem da plataforma escolhida na arquitetura do projeto e estão no [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md).

* Execute o roteiro complementar correspondente à plataforma do projeto.
* Confirme que a aplicação local conversa com o banco remoto antes de publicar.
* Verifique a aplicação publicada percorrendo os dois fluxos de negócio ponta a ponta no navegador.
* Retorne a este ponto para a observabilidade, o pipeline e os indicadores.

### Observabilidade

* Execute:

```text
/opsx-propose observabilidade

Contexto: @docs/architecture.md, @AGENTS.md

Requisitos:
- Instrumentação com OpenTelemetry: logs, métricas e traces.
- Identificador de correlação atravessando a requisição, do frontend ao banco.
- Métricas por endpoint: contagem, latência e taxa de erro.
- Não registrar dados pessoais: prefira metadados e hashes a conteúdo de requisições
  e respostas.
```

Verifique a instrumentação tentando responder a estas três perguntas apenas com o que o sistema emite:

1. Um usuário relatou erro ao concluir o fluxo principal há dez minutos. O que aconteceu na requisição dele?
2. Qual a latência p95 do endpoint mais usado nas últimas vinte e quatro horas?
3. Qual endpoint concentra os erros do dia, e em que proporção das requisições?

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
| Custo em tokens por mudança | Telemetria do agente, instalada pelo Roteiro de Configuração do Ambiente |

* Comandos úteis para a coleta:

```bash
# tempo entre abertura e integração das últimas vinte solicitações
gh pr list --state merged --limit 20 --json number,createdAt,mergedAt

# execuções do pipeline e o respectivo veredito
gh run list --limit 20 --json displayTitle,conclusion,createdAt
```

* Restrinja o indicador de **sucesso de primeira passagem** às mudanças escritas pelo agente: é esse recorte que mede a qualidade do harness. Se o número cai, algum guia ou sensor está faltando — e a resposta está na seção 4 do Roteiro de Configuração do Ambiente, **Contexto e custo**.
* O **custo em tokens por mudança** é o denominador do ganho. Sem ele, a afirmação de que o agente acelerou o trabalho não tem com o que ser comparada.

> As quatro medidas consagradas de desempenho de entrega — frequência de implantação, tempo de espera até a produção, tempo de restauração e taxa de falha de alteração — pressupõem uma equipe e um histórico. O conjunto acima é a redução viável para um projeto individual, e preserva o essencial: rendimento e estabilidade medidos separadamente.

### Verificação do MVP

* [ ] Dois fluxos de negócio ponta a ponta percorríveis na aplicação publicada
* [ ] Pipeline verde, com gate de qualidade ativo
* [ ] URL e credenciais de acesso disponíveis
* [ ] As três perguntas de observabilidade respondidas com o que o sistema emite
* [ ] Tabela de indicadores do ciclo iniciada em `docs/ai-log.md`

---

## 10. Síntese crítica

Ao final, acrescente a `docs/ai-log.md` uma seção respondendo, com base nos registros feitos ao longo do fluxo:

* Onde a IA acelerou de verdade? Sustente a resposta com os indicadores do ciclo, da seção 9.
* Onde ela custou tempo?
* Que tipo de erro ela cometeu com mais frequência?
* O que melhorou quando o harness melhorou? Compare o sucesso de primeira passagem antes e depois dos ajustes da seção 4 do Roteiro de Configuração do Ambiente.
* Quanto custou, em tokens e em escolhas de modelo e provider?
* Quais políticas precisaram de hook, e por que a recomendação não bastou?
* O que continuou sendo trabalho humano?

---

## Verificação final da entrega

* [ ] Agente configurado pelo Roteiro de Configuração do Ambiente, com regras, skills, MCP, hooks e subagentes implantados
* [ ] `openspec view` executando sem erro, e prompts do Playwright no diretório do agente
* [ ] `openspec/backlog.md` e propostas revisadas
* [ ] Esqueleto andante executando, com integração contínua verde
* [ ] `terraform plan` sem divergências após o `apply`
* [ ] Dois fluxos de negócio ponta a ponta implementados e testados nos três níveis
* [ ] `REVIEW.md` versionado e revisão assistida em uso ao final de cada mudança
* [ ] Pipeline de CI/CD com gate de qualidade e proteção de branch
* [ ] Observabilidade respondendo às três perguntas de verificação
* [ ] MVP publicado, com URL e credenciais disponíveis
* [ ] Indicadores do ciclo registrados em `docs/ai-log.md`
* [ ] Specs de capacidade sincronizadas e mudanças arquivadas
* [ ] `docs/ai-log.md` completo, com a síntese crítica

Concluída a entrega do MVP, o que vem depois está no [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md).
