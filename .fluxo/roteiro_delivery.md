# Roteiro de Entrega

Este roteiro descreve o passo a passo da construção, da liberação e da evolução da solução. Os conceitos por trás de cada atividade estão no material de aula das Unidades 2 e 3; os requisitos que a solução precisa atender estão no documento Requisitos do Projeto.

As atividades são individuais e podem ser executadas no seu próprio ritmo, sem necessidade de encontros ao vivo.

> O repositório [valuedriven/devai](https://github.com/valuedriven/devai) é um **blueprint**: serve de exemplo de forma para os artefatos e a configuração, e é citado nos prompts. O projeto é seu, com domínio próprio e requisitos funcionais próprios.

---

## 1. Visão geral do fluxo

**Resultados:**

* Agente de desenvolvimento configurado (`AGENTS.md`, skills, MCP servers)
* Backlog de mudanças (`backlog.md`) e propostas de mudança
* Esqueleto andante com integração contínua
* Incrementos de produto com testes de unidade, integração e aceite
* Pipeline de CI/CD e MVP publicado
* Solução migrada para a versão final, em roteiro específico
* Mudança evolutiva em sistema existente

**Ferramentas:**

* Agente de desenvolvimento: Google Antigravity (<https://antigravity.google>) no ambiente de referência, ou OpenCode (<https://opencode.ai/>) no ambiente open source. Outras alternativas: Claude Code, Cursor, Codex, DeepSeek Harness.
* Spec-driven development: OpenSpec (<https://openspec.dev/>). Alternativas: BMAD, Spec-kit, GSD.
* Automação de testes: Playwright (<https://playwright.dev/>).
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
| Versão final | Atender integralmente aos requisitos de portabilidade e implantação | AWS, com contêineres OCI e Terraform | [Roteiro de migração](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/configuracao_aws.md), indicado na seção 9 |

A **AWS é a referência desejada** para a versão final, e a migração acontece em roteiro específico, depois que o MVP estiver validado.

A versão final não descarta a primeira: o Clerk continua como provedor de identidade e o código permanece o mesmo. O que muda é onde a aplicação executa e como o ambiente é criado.

### Pré-requisitos

Ferramentas instaladas localmente:

* [Node.js e npm](https://nodejs.org/)
* [Git](https://git-scm.com/)
* [Docker e Docker Compose](https://docker.com)
* [OpenSpec](https://openspec.dev/)
* [Playwright](https://playwright.dev/)

O agente de desenvolvimento e o acesso a modelos são instalados no setup do ambiente, na seção 4. Para a migração à versão final, o roteiro específico lista seus próprios pré-requisitos, entre eles o Terraform e o gerenciador `uv`.

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
| Referência | Google Antigravity | Modelos da própria ferramenta | [setup_environment.md](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/setup_environment.md) |
| Open source | OpenCode | Providers de modelos via OmniRoute | [setup_environment_opensource.md](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/setup_environment_opensource.md) |

Cada documento cobre a instalação do agente, o acesso aos modelos, os servidores MCP, as skills, os comandos do OpenSpec e os agentes do Playwright, além das variáveis de ambiente correspondentes.

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

## 6. Ciclo de implementação das mudanças

O ciclo a seguir é executado para cada mudança do backlog, começando pelas do esqueleto andante.

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

> Sincronizar e arquivar não é formalidade. As specs de capacidade em `openspec/specs/` descrevem o comportamento atual do sistema e serão o contexto do agente nas mudanças seguintes. Spec desatualizada engana tanto você quanto o agente.

### Integração contínua mínima

Entre as mudanças do esqueleto andante, inclua a configuração da integração contínua. O arquivo abaixo serve de ponto de partida:

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

### Experimento de harness

Execute este experimento uma vez, durante as mudanças do esqueleto, para observar o efeito da configuração do agente sobre o resultado.

* Escolha uma tarefa do `tasks.md` de uma mudança ainda não implementada.
* Execute-a em duas configurações diferentes, variando apenas um fator:
  * dois modelos diferentes, mesmo harness; ou
  * agente de planejamento antes da execução versus execução direta; ou
  * `AGENTS.md` completo versus `AGENTS.md` mínimo.
* Compare resultado, aderência às convenções, tokens consumidos e número de intervenções necessárias.
* Registre a comparação em `docs/ai-log.md`.

---

## 7. Verificação e testes

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

> Nos prompts a seguir, substitua `<prompts do agente>` pelo diretório indicado no documento de setup que você seguiu: `.agents/prompts` no ambiente de referência, `.opencode/prompts` no ambiente open source.

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

---

## 8. Liberação do MVP

Esta seção coloca o MVP no ar nas plataformas gerenciadas, com pipeline de entrega e observabilidade. A migração para a versão final na AWS é tratada em roteiro específico, depois que o MVP estiver funcionando (seção 9).

Trate cada item a seguir como uma mudança do OpenSpec, seguindo o mesmo ciclo da seção 6.

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

### Verificação do MVP

* [ ] Dois fluxos de negócio ponta a ponta percorríveis na aplicação publicada
* [ ] Funcionalidade de inteligência artificial operando e instrumentada
* [ ] Pipeline verde, com gate de qualidade ativo
* [ ] URL e credenciais de acesso disponíveis
* [ ] As três perguntas de observabilidade respondidas com o que o sistema emite

---

## 9. Migração para a versão final

O MVP valida os fluxos de negócio, mas apoia-se em plataformas gerenciadas. Isso atende à entrega rápida e deixa em aberto a portabilidade, a implantação automatizada e a recriação completa de ambientes exigidas pelos Requisitos do Projeto.

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

## 10. Evolução


### Mudança evolutiva em sistema existente

Esta atividade testa a qualidade da documentação e do harness que você produziu. O ganho vem de trabalhar sobre um sistema que você não escreveu.

* Obtenha o repositório de outro projeto que siga este fluxo. Como o trabalho é individual, a alternativa é usar o [projeto de referência](https://github.com/valuedriven/devai), cujo domínio é diferente do seu — o que preserva o essencial do exercício, que é depender só do que está escrito.
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

Em seguida, aplique a mesma leitura ao seu próprio repositório: cada atrito que você sentiu no projeto alheio provavelmente existe no seu.

### Refatoração assistida

* Refatore em passos pequenos, com a suíte verde entre eles.
* Não aceite refatoração e mudança de comportamento no mesmo diff.
* Desconfie se a suíte precisou ser ajustada para a refatoração passar: nesse caso, o comportamento mudou.

### Síntese crítica

Ao final, acrescente a `docs/ai-log.md` uma seção respondendo, com base nos registros feitos ao longo do fluxo:

* Onde a IA acelerou de verdade?
* Onde ela custou tempo?
* Que tipo de erro ela cometeu com mais frequência?
* O que melhorou quando o harness melhorou?
* Quanto custou, em tokens e em escolhas de modelo e provider?
* O que continuou sendo trabalho humano?

---

## Verificação final da entrega

* [ ] `AGENTS.md`, skills e MCP servers configurados
* [ ] `openspec/backlog.md` e propostas revisadas
* [ ] Esqueleto andante executando, com integração contínua verde
* [ ] Dois fluxos de negócio ponta a ponta implementados e testados nos três níveis
* [ ] Funcionalidade de inteligência artificial implementada, testada e instrumentada
* [ ] Pipeline de CI/CD com gate de qualidade e proteção de branch
* [ ] Observabilidade respondendo às três perguntas de verificação
* [ ] MVP publicado, com URL e credenciais disponíveis
* [ ] Specs de capacidade sincronizadas e mudanças arquivadas
* [ ] Migração para a AWS executada pelo roteiro específico, com contêineres OCI e Terraform versionados
* [ ] Mudança evolutiva implementada e atritos registrados
* [ ] `docs/ai-log.md` completo, com a síntese crítica