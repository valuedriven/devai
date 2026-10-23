# Roteiro de Entrega

Este roteiro cobre a fase **Entrega** inteira, com as suas quatro atividades: **Ambiente**, **Construção**, **Liberação** e **Evolução**. Ele parte dos artefatos produzidos na fase de Descoberta e vai do ambiente configurado até a solução publicada, observável e em evolução.

A atividade de Construção está descrita aqui, nas seções 3 a 9. As outras três têm roteiros complementares, chamados a partir deste no ponto em que entram:

| Atividade | Onde está o passo a passo |
| :---- | :---- |
| Ambiente | [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) |
| Construção | Seções 3 a 9 **deste roteiro** |
| Liberação | [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md) e, para a versão final, [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md) |
| Evolução | [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md) |

> O repositório [valuedriven/devai](https://github.com/valuedriven/devai) é um **blueprint**: serve de exemplo de forma para os artefatos e a configuração, e é citado nos prompts. O projeto é seu, com domínio próprio e requisitos funcionais próprios.

---

## 1. Visão geral do fluxo

**Resultados:**

* Backlog de mudanças (`backlog.md`) e propostas de mudança
* Esqueleto andante com integração contínua
* Incrementos de produto com testes de unidade, integração e aceite
* Testes de aceite gerados por agentes, revisados e executando
* Inspeção estática com quality gate aprovado
* Política de revisão assistida (`REVIEW.md`), aplicada ao final de cada mudança
* Pipeline de CI/CD com os testes automatizados, e proteção de branch exigindo seus status checks

**Ferramentas:** agente de desenvolvimento, OpenSpec, Playwright, SonarQube e GitHub Actions. A descrição e o endereço de cada uma estão no [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md); a stack da solução, nos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md).

**Escopo:** a fase de Entrega inteira. As seções 3 a 9 descrevem a atividade de Construção, do backlog de mudanças ao pipeline de CI/CD com os testes automatizados; as demais atividades são conduzidas pelos roteiros complementares, na ordem da tabela abaixo. Este roteiro é escrito de forma independente da ferramenta de agente e da plataforma de implantação; o que é específico de uma ou de outra fica nos complementos.

| Ordem | Atividade | Documento | O que faz |
| :---- | :---- | :---- | :---- |
| — | Descoberta | [Roteiro de Descoberta](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_discovery.md) | Fase anterior: produz o `docs/` de que a seção 3 parte |
| 1 | Ambiente | [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) | Complemento: agente configurado, com regras, skills, MCP, hooks e subagentes |
| **2** | **Construção** | **Seções 3 a 9 deste roteiro** | **Do backlog ao pipeline de CI/CD** |
| 3 | Liberação | [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md) | Complemento: provisionamento por código, recursos remotos, publicação e IaC no pipeline |
| 4 | Evolução | [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md) | Complemento: observabilidade e aspectos evolutivos do trabalho com agentes |
| 5 | Liberação | [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md) | Complemento: versão final, com ambiente completo por código |

A liberação ocupa dois lugares na ordem porque acontece em dois momentos: primeiro o MVP nas plataformas gerenciadas e, ao final, a versão final na AWS. A evolução fica entre os dois, já que a migração pressupõe a solução publicada e observável.

Documentos de apoio: o [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md), para o que cada ferramenta faz e como instalá-la, e os [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md), para o que a solução precisa atender.

---

## 2. Orientações gerais

Os comandos deste roteiro consideram tanto execuções via terminal quanto pela interface de chat do agente de IA. Fique atento ao contexto de cada execução.

### Pré-requisitos

Três condições antes de iniciar. Nenhuma delas é atendida por este roteiro.

| Pré-requisito | Onde é atendido |
| :---- | :---- |
| Repositório no GitHub, com a documentação da descoberta versionada em `docs/` | [Roteiro de Descoberta](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_discovery.md) |
| Ferramentas instaladas: Node.js, Git, Docker, OpenSpec e Playwright | [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md) |
| Agente de desenvolvimento instalado e configurado, com regras, skills, servidores MCP, hooks e subagentes implantados | [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) |

* Confirme que `docs/` contém `problem.md`, `prd.md`, `spec.md`, `architecture.md`, `design.md`, `diagramas/` e `prototypes/`. A seção 3 parte deles, e `prototypes/` é indispensável: o agente não acessa a ferramenta de prototipação.
* Confirme que o repositório está no GitHub, com integração contínua habilitada e permissão para proteger a branch principal. A seção 6 depende disso.
* Confirme que a verificação final do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) está completa, inclusive o `.env` com as chaves do agente e dos modelos.

As credenciais das plataformas de implantação pertencem à stack da solução, declarada nos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md); o [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md) indica onde obter cada valor.

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

> Este roteiro é agnóstico quanto à stack e à forma de implementação: ele conduz o ciclo, e não prescreve o código. A stack é declarada na seção 5 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md) e registrada como decisão em `docs/architecture.md`; é desses artefatos, com o `prd.md` e o `spec.md`, que o agente tira o contexto para propor cada mudança. Onde o roteiro mostra um comando ou um caminho concreto, ele vale para a stack de referência e é ajustado à do projeto.

### Ferramentas do projeto

As ferramentas já estão registradas pelo APM, conforme a seção 2 do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md), cuja seção 2.6 também cobre a inicialização do OpenSpec no projeto (árvore `openspec/`, comandos e skills nos diretórios de cada agente) e a geração dos prompts de teste do Playwright (`playwright-test-planner`, `playwright-test-generator` e `playwright-test-healer`). Esta seção trata apenas de indicar o agente em uso, exigido pelos dois.

| Agente | Identificador nas CLIs |
| :---- | :---- |
| Google Antigravity | `antigravity` |
| OpenCode | `opencode` |

> Grafias diferentes desses identificadores fazem o comando falhar ou, pior, serem ignoradas em silêncio.

O ajuste do `openspec/config.yaml` é feito na seção 5, depois da configuração do agente. O uso do OpenSpec no ciclo de mudanças está a partir da seção 5, e o uso dos prompts de teste do Playwright está na seção 8.

### Configuração de variáveis de ambiente

O arquivo `.env` e sua entrada no `.gitignore` foram criados no [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md), com as chaves do agente e dos modelos. Acrescente a ele as variáveis da aplicação.

O conjunto depende da stack declarada em `docs/architecture.md`. Para a stack de referência da seção 5 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md), ele é este:

```bash
PROJECT_NAME=<nome do projeto>
GLOBAL_PREFIX=api/v1

# Aplicação
FRONTEND_PORT=3000
BACKEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

> O prefixo `NEXT_PUBLIC_` é convenção do framework de frontend: ele marca a variável como legível pelo navegador. Com outro framework, o prefixo muda, e segredo nenhum recebe prefixo público.

> A URL da API precisa coincidir com a porta e o prefixo global do backend. Divergências aqui produzem erros de integração difíceis de diagnosticar.

* Acrescente as credenciais das plataformas declaradas na arquitetura. As da etapa de MVP estão no [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md), com o endereço de onde obter cada valor.

* Confirme que `.env` está listado no `.gitignore`.
* Mantenha o `.env.example` com as mesmas chaves e sem os valores. Esse arquivo é versionado e documenta as variáveis necessárias.

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

### Confirmação do ambiente

A configuração do agente é pré-requisito deste roteiro, conforme a seção 2. Antes de prosseguir, confirme em uma sessão nova do agente:

```text
Liste as skills disponíveis, os servidores MCP conectados e os subagentes declarados.
```

Se a resposta não trouxer os três conjuntos, volte ao [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md).

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

> Dois cuidados. Os arquivos que o OpenSpec **gera** — comandos, skills e workflows nos diretórios do agente — são reescritos pelo comando `update` do OpenSpec, executado após mudança de versão ou de perfil. Edições manuais nesses arquivos se perdem: o que é do projeto nasce no `AGENTS.md` e no diretório de autoria do Roteiro de Configuração do Ambiente. E os subagentes convivem com esses diretórios, mas não dentro deles.

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
npx -y @fission-ai/openspec@latest view
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

## 6. Esqueleto andante e integração contínua

A primeira mudança do backlog é o **esqueleto andante**: a menor versão do sistema que atravessa todas as camadas e efetivamente executa — frontend chamando a API, API acessando o banco — sem funcionalidade de negócio relevante. Ela é implementada pelo ciclo descrito na seção 7.

Concluído o esqueleto, a automação entra **imediatamente**, e não ao final do percurso. A partir daqui, toda mudança do backlog é verificada por um pipeline antes de ser integrada.

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

### Verificação da etapa

* [ ] Esqueleto andante executando localmente
* [ ] Workflow de integração contínua executando a cada push
* [ ] Nenhum segredo no repositório
* [ ] Versões das actions de terceiros fixadas

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

Após cada mudança, execute o ciclo básico com os comandos declarados no `README.md` e no `AGENTS.md` do projeto. Interaja com o agente para corrigir o que falhar.

| Etapa | O que verifica |
| :---- | :---- |
| Inspeção estática e formatação | Convenções e erros detectáveis sem executar |
| Testes | Comportamento, nos níveis que a mudança alcança |
| Build | Integridade da compilação e das dependências |
| Execução local | Fluxo percorrido na interface, do gatilho ao desfecho |

Na stack de referência, são `npm run lint`, `npm run test`, `npm run build` e `npm run dev`, com o frontend e o backend nas portas declaradas no `.env`.

### Configuração do executor de testes de aceite

O executor é dependência de desenvolvimento da aplicação, declarada na stack da seção 5 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md). Esta etapa o acrescenta ao projeto e cria a sua configuração.

* Acesse o terminal no diretório raiz do projeto.
* Acrescente o executor e o seu andaime ao projeto:

```bash
npm init playwright@latest
```

> Este comando não é instalação de ferramenta do ambiente: ele grava uma dependência de desenvolvimento no `package.json` do projeto, versionada como qualquer outra. O que o APM registra é o servidor MCP, que dá ao agente o controle do navegador.

* Informe os seguintes valores:

```text
Do you want to use TypeScript or JavaScript? TypeScript
Where to put your end-to-end tests? <diretório de testes de aceite do projeto>
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

* Remova o arquivo de exemplo `example.spec.ts` gerado no diretório de testes.

> Os agentes de planejamento, geração e correção de testes foram gerados na seção 2.6 do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md), e o servidor MCP do Playwright foi configurado na seção 2.3 do mesmo roteiro. Se o diretório de prompts do agente em uso não contiver `playwright-test-planner.md`, `playwright-test-generator.md` e `playwright-test-healer.md`, volte a essa seção antes de prosseguir.

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

> Nos prompts a seguir, substitua `<prompts do agente>` pelo diretório do agente em uso: `.agents/prompts` no Antigravity, `.opencode/prompts` no OpenCode.

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
<diretório de testes de aceite>/.
```

> Os planos de teste ficam em `specs/`; os casos de teste executáveis ficam no diretório de testes de aceite declarado na configuração do Playwright.

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
ajustar os testes do fluxo de login criados no diretório de testes de aceite.

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

# Fontes e testes — ajuste os caminhos à estrutura declarada em docs/architecture.md
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

## 9. Pipeline de CI/CD

Esta seção completa a automação: o pipeline que verifica cada mudança e a prepara para publicação, com os testes automatizados da seção 8 executando nele. Ela encerra o escopo deste roteiro.

Trate o item a seguir como uma mudança do OpenSpec, seguindo o mesmo ciclo da seção 7.

### Pipeline de entrega contínua

* Execute:

```text
/opsx-propose pipeline-cd

Contexto: @docs/architecture.md, @AGENTS.md, @.github/workflows/

Requisitos:
- Workflow de entrega disparado na branch principal.
- Etapas na ordem: lint, testes de unidade e integração, análise Sonar e build.
- Token do Sonar e demais valores sensíveis como secrets do repositório; nenhum valor
  sensível no arquivo do workflow.
- Ambiente (environment) declarado, com regra de proteção exigindo aprovação manual
  antes de qualquer etapa que altere produção.
- Etapa de publicação declarada, ainda sem destino: ele é configurado na implantação.
```

* Configure a proteção da branch principal exigindo os status checks do workflow. Sem isso, o gate de qualidade é apenas uma sugestão.

> O workflow fica pronto para publicar, mas ainda não publica: o destino, as credenciais da plataforma e as etapas de infraestrutura como código entram no [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md), a etapa seguinte. Os testes de aceite passam a executar contra o ambiente publicado a partir de lá.

## Verificação final da construção

* [ ] Agente configurado pelo Roteiro de Configuração do Ambiente, com regras, skills, MCP, hooks e subagentes implantados
* [ ] `openspec view` respondendo pela CLI invocada por `npx`, e prompts do Playwright no diretório do agente
* [ ] `openspec/backlog.md` e propostas revisadas
* [ ] Esqueleto andante executando localmente, com integração contínua verde
* [ ] Dois fluxos de negócio ponta a ponta implementados e testados nos três níveis
* [ ] Testes de aceite gerados, revisados e executando
* [ ] Quality gate do SonarQube aprovado, com a cobertura coletada
* [ ] `REVIEW.md` versionado e revisão assistida em uso ao final de cada mudança
* [ ] Pipeline de CI/CD executando lint, testes, análise estática e build
* [ ] Proteção da branch principal exigindo os status checks do workflow
* [ ] Specs de capacidade sincronizadas e mudanças arquivadas
* [ ] Registros de cada mudança em `docs/ai-log.md`

## Como seguir até o fim da fase

Concluída a construção, a fase de Entrega prossegue nos roteiros complementares, nesta ordem:

1. **Liberação** — [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md): provisionamento por código, recursos remotos, publicação do MVP e infraestrutura como código no pipeline.
2. **Evolução** — [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md): observabilidade, faixas de controle, indicadores do ciclo e a mudança evolutiva sobre o sistema em produção.
3. **Liberação, segundo momento** — [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md): a versão final, com o ambiente completo descrito em código e a prova de reprodutibilidade.

A fase termina quando a solução está publicada, observável e evoluída, e o ambiente pode ser recriado do zero a partir do repositório.
