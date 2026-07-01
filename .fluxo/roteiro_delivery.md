# Fluxo de Delivery

## 1.Visão geral do fluxo

Resultados:
- Roadmap de mudanças
- Propostas de mudança
- Planos de testes
- Casos de teste
- Incremento de Produto

Participantes:
- Designer UX
- Desenvolvedor

Ferramentas:
- Agentes de IA para desenvolvimento (Antigravity, Claude Code, Cursor, Codex, Opencode etc.)
- Ferramentas de Spec-Driven Development (Openspec, BMAD, Spec-kit, GSD etc.)
- Ferramentas para automação de testes de Spec-Driven Development (Playwright) 

---

## 2. Orientações gerais

Os comandos executados neste roteiro consideram tanto execuções via terminal quanto interface de chat do agente de IA. Fique atento a cada execução.

### Pré-requisitos

- Google Antigravity IDE <https://antigravity.google> instalado localmente.
- Node.js e npm <https://nodejs.org/> instalados localmentes.
- Git <https://git-scm.com/> instalado localmente.
- Docker e Docker Compose <https://docker.com> instalados localmente.
- Openspec <https://openspec.dev/> instalado localmente.
- Playwright <https://playwright.dev/> instalado localmente.
- Conta GitHub <https://github.com/>.
- Conta Vercel <https://vercel.com/>.
- Conta Supabase <https://www.supabase.com/>.
- Conta Clerk <https://clerk.com/>.
- Conta Context7 <https://context7.com/>.

Certifique-se de estar logado nessses serviços ao realizar o roteiro.

### Gerenciamento da janela de contexto

- Priorize a criação de novas conversa no Antigravity para cada tarefa. Para tanto, acesse o painel Agent, comando +, Start a New Conversation.

### Ciclo Planejar/Executar (Research/Plan/Implement)

- Priorize a estruturação das tarefas no ciclo Planejar/Executar.
- Para o planejamento, priorize, sempre que disponíveis, modelos com maior capacidade de reasoning ou "thinking". 
- Para execução podem ser selecionados modelos mais rápidos ou simples.
   
### Ajuste nos prompts

- Para vários exemplos de prompts disponibilizados, atente para a necessidade de substituir os valores entre os símbolos "<" e ">" pelos valores específicos de seu projeto.
- Quando estiver editando um prompt, utilize o caracter "@" para referenciar recursos como arquivos, diretórios, rules e mcp servers.

---

## 3. Configuração do projeto

### Documentação geral do projeto

- Certifique-se que a documentação geral do projeto esteja disponível no diretório específico, conforme orientações anteriores do fluxo de descoberta:

```
├── docs
│   ├── architecture.md
│   ├── design.md
│   ├── prd.md
│   ├── problem.md
│   ├── spec.md

```

### Configuração de variáveis de ambiente

- No diretório raiz do projeto crie arquivo .env com o conteúdo a seguir (os endereços correspondem aos locais onde os dados podem ser obtidos)
- Acesse os endereços informados junto a cada credencial
- Navegue em cada endereço e obtenha os valores solicitados

```
PROJECT_NAME=<nome do projeto>
GLOBAL_PREFIX=api/v1

# Context7
# https://context7.com/dashboard
# Seção API Keys, comando Create API Key
CONTEXT7_API_KEY=

# Stitch
# https://stitch.withgoogle.com/settings
# Seção Chave de API, comando Criar chave
STITCH_API_KEY=

# Vercel
# https://vercel.com/account/settings/tokens
# Seção Create token, comando Create
VERCEL_API_TOKEN=

# Supabase
# https://supabase.com/dashboard/account/tokens
# Seção Classic Tokens, comando Generate new token
SUPABASE_ACCESS_TOKEN=
# [deixar os itens a seguir em branco inicialmente]
NEXT_PUBLIC_SUPABASE_URL=[deixar em branco inicialmente]
NEXT_PUBLIC_SUPABASE_ANON_KEY=[deixar em branco inicialmente]
DATABASE_URL=[deixar em branco inicialmente]
DIRECT_URL=[deixar em branco inicialmente]

# Clerk
# https://dashboard.clerk.com/apps/
# Seção Applications, comando Create application
# Selecionar a aplicação criada, menu Configure, seção API Keys, comando Quick copy
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# Seção API Keys, item JWKS Public Key (usar aspas duplas para envolver conteúdo)
CLERK_JWT_KEY=

# Aplicação
FRONTEND_PORT=3000
BACKEND_PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3005/v1
```

- Crie ou atualize o arquivo .gitignore e inclua nele o seguinte conteúdo:
  
```
.env
```


### Criação de README.md

- Crie uma nova sessão do agente.
- Solicite ao agente a criação do arquivo README.md.

```
Crie o arquivo README.md para o repositório com base na documentação disponível em @docs.

Siga as boas práticas recomendadas pelo GitHub disponíveis em: <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes>
```


## 4 Configuração do Agente de IA

### Configuração de regras no arquivo AGENTS.md

- Crie uma nova sessão no agente.
- Informe o prompt a seguir:

```
Crie ou atualize o `AGENTS.md` com base na documentação do projeto (`docs/*`), incluindo:

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

* https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md
* https://github.com/valuedriven/devai/tree/main/.fluxo/concepts/agents-md-guidelines.md

Adapte as diretrizes ao contexto do projeto, preserve conteúdo válido existente, remova duplicações e valide o resultado conforme as recomendações de AGENTS.md.
```
- Verifique o resultado
- Peça ajuda a alguma IA de fronteira para validar o resultado.


- Ao final de cada sessão, pode ser interessante avaliar o nível de autonomia dos agentes na execução das tarefas. Use um prompt análogo ao seguinte:

```
Analise o histórico de conversações desta sessão e proponha ajustes no arquivo AGENTS.md, seção Governança e uso de terminal, de forma a aumentar a autonomia do agente na execução de tarefas como leitura e escrita de arquivos.
```

[AGENTS.md do projeto de referência](https://github.com/valuedriven/devai/blob/main/AGENTS.md)



### Configuração de skills

Os comandos a seguir, criarão a seguinte estrutura de diretórios:

```
.agents/
├── skills/
    <nome da skill>/
    ├── SKILL.md          # Required: metadata + instructions
    ├── scripts/          # Optional: executable code
    ├── references/       # Optional: documentation
    ├── assets/           # Optional: templates, resources
    └── ...               # Any additional files or directories
- 
```

- Acesse o terminal a partir do diretório raiz do projeto.
- Execute os comandos a seguir:

```
npx skills add https://github.com/hashicorp/agent-skills --yes --skill terraform-style-guide --agent universal 

npx skills add https://github.com/vercel/next.js/tree/canary/skills --yes --agent universal --skill next-best-practices next-cache-components deploy-to-vercel react-best-practices web-design-guidelines composition-patterns

npx skills add https://github.com/prisma/skills --yes --agent universal --skill prisma-database-setup

npx skills add https://github.com/supabase/agent-skills --yes --agent universal

npx skills add https://github.com/clerk/skills --yes --agent universal --skill clerk-setup clerk 

npx skills add https://github.com/mattpocock/skills --yes --agent universal --skill improve-codebase-architecture

npx skills add https://github.com/addyosmani/agent-skills --yes --agent universal --skill frontend-ui-engineering code-review-and-quality ci-cd-and-automation  

npx skills add https://github.com/sickn33/antigravity-awesome-skills --yes --agent universal --skill backend-architect nestjs-expert docker-expert github-actions-templates
```
- Verifique no diretório .agents se as skills foram instaladas.

Quando necessário, mais skills podem ser encontradas em marketplaces como: https://skillsmp.com/


Skills relacionadas aos testes no projeto de referência:

[Testes de unidade](https://github.com/valuedriven/devai/blob/main/.agents/skills/jest-unit-tests/SKILL.md)

[Testes de integração](https://github.com/valuedriven/devai/blob/main/.agents/skills/supertest-integration-test/SKILL.md)

[Testes e2e](https://github.com/valuedriven/devai/blob/main/.agents/skills/playwright-e2e-tests/SKILL.md)

[Gate qualidade](https://github.com/valuedriven/devai/blob/main/.agents/skills/quality-gate/SKILL.md)

---

### Configuração de MCP Servers

Configuração no Antigravity:

- Selecione o painel Agent.
- Selecione a opção Additional options (símbolo de três pontos "...").
- Na seção MCP Store, acione o comando Manage MCP Servers.
- No painel Manage MCP servers, acione o comando View raw config.
- Substitua o conteúdo existente pelo seguinte:
- Substitua o valor de cada chave pelo valor obtido no arquivo .env

```json
{
  "mcpServers": {
    "stitch": {
      "serverUrl": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "<STITCH_API_KEY>"
      }
    },
    "context7": {
      "serverUrl": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "<CONTEXT7_API_KEY>"
      }
    }
  }
}
```
- Salve o arquivo.
- No painel Manage MCP servers, acione o comando Refresh.

Teste de MCP Servers

- No painel Agent, selecione a opção Start a new conversation.
- Solicite listar os projetos disponíveis no Stitch:

```
Liste os projetos do Stitch
```

## 5. Criação de mudanças

### Configuração do Openspec

- Certifique-se de que o Openspec esteja instalado, conforme orientações disponíveis em https://openspec.dev/.
- Acesse o terminal no diretório raiz do projeto.
- Inicialize o Openspec, executando o comando a seguir:

```bash
openspec init --tools antigravity, opencode
```

- Certifique-se de que as skills e commands foram instaladas nos diretórios .agents (plural) e .opencode.
- Como resultado, devem ser criadas ou atualizadas as seguintes estruturas de pastas:

```
├── .agents
│   ├── commands/
│   ├── rules/
│   ├── skills/
│   └── workflows/
├── .opencode
│   ├── commands/
│   ├── rules/
│   ├── skills/
│   └── workflows/
├── openspec
│   ├── changes
│   ├── config.yaml
│   └── specs
```

- Caso tenha sido criada a pasta .agent (no singular), mova seu conteúdo para a pasta .agents

- Execute o seguinte comando (certifique-se de que o comando /opsx-explore seja selecionado ao clicar em "/". Faça o mesmo para o arquivo indicado, acionando "@"):

```
/opsx-explore 

Personalize o arquivo config.yaml com base nas informações do projeto disponíveis em:
@docs/prd.md @docs/spec.md @docs/design.md @docs/architecture.md (em especial as diretrizes de testes e qualidade)

```

[config.yaml do projeto de referência](https://github.com/valuedriven/devai/blob/main/openspec/config.yaml)


### Definição de roadmap de mudanças

- Inicie uma nova sessão do agente  . 
- Na janela do chat, digite o caracter "/" e selecione a skill "opsx-explore".
- Informe o conteúdo a seguir logo depois da skill (lembre-se de informar o nome do projeto stitch corretamente)

```
/opsx-explore

Dimensione as mudanças necessárias para a implementação de uma aplicação web full stack de maneira incremental.

Utilize a documentação disponível nos arquivos @docs/prd.md, @docs/spec.md e @docs/architecture.md.

Obtenha os protótipos das interfaces gráficas no projeto stitch <nome do projeto> por meio do mcp server correspondente.

Configure as mudanças de forma que nenhuma fique com tamanho, complexidade e/ou risco maior que médio.

Crie apenas o proposal.md de cada mudança.

Crie um arquivo roadmap.md com um resumo do planejamento.

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

- Verifique se o agente identificou corretamente o projeto no Stitch. Caso contrário, informe o nome correto e peça para atualizar o plano.
- Verifique se o agente identificou e leu corretamente os documentos do projeto.

- Analise os resultados apresentados. É esperado que tenha sido criada uma estrutura parecida com a seguir:

```
└── openspec
    ├── changes
    │   ├── archive
    │   ├── iteracao 1 ...
    │   │   │   |── .openspec.yaml
    │   │   ├── proposal.md
    │   ├── iteracao n ...
    │   │   │   |── .openspec.yaml
    │   │   ├── proposal.md
 ```

- Analise a proposta e outros detalhes. Proceda os ajustes interagindo com o agente por meio da skill /psx-explore ou editando diretamente os arquivos.
- Recomenda-se que a estrutura inicial do projeto e o mecanismo de autenticação estejam entre as primeiras entregas.

A cada etapa do fluxo de trabalho, pode ser verificado o progresso por meio do comando:

```bash
openspec view

```

- Deve aparecer as seguintes informações:

```
 ● Draft Changes: x
  ● Active Changes: x in progress
  ● Completed Changes: x
  ● Task Progress: x/xx (x% complete)

Draft Changes
────────────────────────────────────────────────────────────
  ○ iteracao-x ...
  ○ iteracao-y ...
  
Active Changes
────────────────────────────────────────────────────────────
  ◉ iteracao-z-xxx     [░░░░░░░░░░░░░░░░░░░░] 0%

════════════════════════════════════════════════════════════

Use openspec list --changes or openspec list --specs for detailed view
```

### Criação de propostas de mudanças

- Inicie uma nova sessão do agente.
- Informe o seguinte prompt, informando a mudança desejada:

```bash
/opsx-propose <id da mudança>
```

- Analise os resultados apresentados. É esperado que tenha sido criada uma estrutura parecida com a seguir:

```
└── openspec
    ├── changes
    │   ├── archive
    │   ├── iteracao1 ...
    │   │   ├── design.md
    │   │   ├── proposal.md
    │   │   ├── specs
    │   │   │   └── ...
    │   │   │   |   └── spec.md
    │   │   └── tasks.md
 ```

- Analise a proposta de mudança. Proceda os ajustes interagindo com o agente por meio da skill /psx-explore ou editando diretamente os arquivos.


### Execução de propostas de mudanças

- Inicie uma nova sessão do agente.
- Informe o seguinte prompt, informando a mudança desejada:

```bash
/opsx-apply <id da mudança>
```

- Acompanhe a execução do agente, analisando os resultados apresentados.
- Caso sejam encontrados erros ou recursos não implementados, corrija-os solicitando os ajustes necessários.


### Avaliação de resultados

- Inicie uma nova sessão do agente.
- Execute o workflow para verificação da change aplicada:

```bash
/opsx-verify <id da mudança>
```

- Ao final do processo, será gerado um relatório de validação. Verifique se o relatório indica que a change foi aplicada corretamente.
- Caso contrário, corrija os problemas encontrados solicitando os ajustes necessários.


### Arquivamento de mudança

- Caso deseje que a documentação criada seja incluída na documentação persistente do projeto, execute:

```bash
/opsx-sync
```

- Execute o workflow de arquivamento

```bash
/opsx-archive <id da mudança>
```

- Inicie uma nova sessão do agente.
- Solicite a execução da aplicação.

O ciclo /opsx-propose -> /opsx-apply -> /opsx-verify -> /opsx-archive deverá ser executado para cada mudança, posteriormente.

---

## 6. Verificação de mudanças

### Verificação manual

Após a implementação de cada mudança podem ser feitas verificações.

Um ciclo básico pode consistir na execução manual de comandos. Na execução de todos, interaja com o agente para eventuais correções.

- Acesse o terminal.
- No diretório raiz do projeto, execute os comandos seguir:

```bash
npm run lint
npm run test
npm run build
npm run dev
```

- Acesse os endpoints da aplicação:

```
http://localhost:3000 (frontend)

http://localhost:3001 (backend)
```

### Configuração do Playwright

- Certifique-se de que o Playwright esteja instalado, conforme orientações disponíveis em https://playwright.dev/.
- Acesse o terminal.
- Inicialize o Playwright, executando o comando a seguir no diretório raiz do projeto:

```bash
npm init playwright@latest
```

- Informe os seguintes valores:

```
Do you want to use TypeScript or JavaScript? TypeScript
Where to put your end-to-end tests? apps/frontend/tests
Add a GitHub Actions workflow? yes
Install Playwright browsers? yes
Install Playwright operating system dependencies? yes
```

- Verifique a instalação:

```bash
npx playwright test
```

- Verifique o resultado esperado:

```
Running 6 tests using 4 workers
  6 passed (4.1s)

To open last HTML report run:

  npx playwright show-report
```

- Remova o arquivo apps/frontend/tests/example.spec.ts.

- Instale o MCP server do Playwright, executando o comando a seguir no diretório raiz do projeto a partir do terminal:

```bash
npm install -g @playwright/mcp
```

- Inclua a configuração do MCP server:

```json
{
  "mcpServers": {
    "playwright": {
        "command": "npx",
        "args": [
            "-y",
            "@playwright/mcp@latest"
        ]
    }
  }
}
```

- Inicialize o agente do Playwright:

```bash
npx playwright init-agents --loop=opencode
```

O Playwright não possui configuração específica para o Antigravity.
Com isso, os arquivos criados na pasta .opencode devem ser copiados para a pasta .agents.

- Verifique a criação dos seguintes arquivos:

```
.opencode
└── prompts
    ├── playwright-test-generator.md
    ├── playwright-test-healer.md
    └── playwright-test-planner.md

```

### Geração de testes com agentes


Antes de executar esta seção, certifique-se de que tenha sido implementada pelo menos uma mudança que contenha alguma interface gráfica relevante como: login, catálogo de produtos, clientes e/ou pedidos.


#### Configuração do Playwright para testes com Clerk

- Crie uma nova seção do agente.
- Execute o seguinte prompt:

```
Efetue as configurações necessárias para a realização de testes do Playwright de forma integrada ao Clerk conforme @docs/architecture.md
```

#### Criação de plano de testes

Nesta seção será criado um plano de testes com base na especificação criada por meio do Openspec.

- Crie uma nova seção do agente.
- Execute o seguinte prompt. Substitua a especificação pelo nome correspondente em seu projeto:

```
Use as orientações disponíveis em <@.agents/prompts/playwright-test-planner.md> para criar um plano de testes para o fluxo de login com Clerk.

Explore a especificação disponível em <@openspec/specs/user-authentication.md>.

```

Caso a especificação não tenha sido sincronizada ela pode ser encontrada na pasta openspec/changes ou openspec/changes/archived, caso tenha sido arquivada.

- Verifique a criação do arquivo de planejamento. Por default, ele deve se encontrar no diretório specs.
- Caso tenha sido criada em outro local, mova-a para esse diretório.

No caso da execução realizada, o arquivo criado foi o specs/login-flow-test-plan.md.


#### Geração de casos de teste

- Crie uma nova seção do agente.
- Execute o seguinte prompt. Substitua o plano de testes com o arquivo criado em seu projeto:

```
Use as orientações disponíveis em <@.agents/prompts/playwright-test-generator.md> para criar os testes para o fluxo de login.

Explore o plano disponível em <@specs/login-flow-test-plan.md> e a documentação disponível em <@docs/spec.md>.

Crie um único arquivo com toda suíte de testes para o plano proposto.
```

- Verifique a criação do arquivo de casos de teste. Por default, ele deve se encontrar no diretório specs.
- Caso tenha sido criada em outro local, mova-a para esse diretório.
- Verifique a execução dos testes e respectivo relatório gerado.


#### Ajustes nos testes

Desenvolva esta seção caso tenham ocorrido erros na execução dos testes.

- Crie uma nova seção do agente.
- Execute o seguinte prompt. Substitua o plano de testes com o arquivo criado em seu projeto. Substitua os valores de usuário e senha pelas credenciais configuradas anteriormente.

```
Use as orientações disponíveis em <@.agents/prompts/playwright-test-healer.md> para ajustar os testes para o fluxo de login criados em <@apps/frontend/tests/login-flow.spec.ts>.
```

- Verifique a criação do arquivo de casos de teste. Por default, ele deve se encontrar no diretório specs.
- Caso tenha sido criada em outro local, mova-a para esse diretório.
- Acesse o terminal.
- Reexecute a suíte de testes com o recurso de acompanhamento visual:

```bash
npx playwright test --headed
```

- Verifique o relatório de execução de testes:

```bash
npx playwright show-report
```

Os procedimentos de planejamento -> geração -> ajustes devem ser realizados para cada nova mudança implementada.

---

### 7. Inspeção de código

- Acesse o terminal.
- Inicialize o servidor Sonar:

```bash
docker run -d --name sonarqube -e SONAR_ES_BOOTSTRAP_CHECKS_DISABLE=true -p 9000:9000 sonarqube:latest
```
- Acesse o navegador e informe o endereço:

```bash
localhost:9000
```

- Informe como credenciais: usuário = admin, senha = admin.
- Altere a senha conforme recomendado.
- Aguarde a navegação até a seção Projects, How do you want to create your project?
- Selecione a opção "Create a local project".
- Informe os dados solicitados.
- Na seção Set up new code for project, escolha a opção default.
- Acione o comando Create project.
- Para seção Analysis Method, selecione a opção Locally.
- Na seção Analyze your project, acione o comando Generate.
- Copie o token criado.
- Acione o comando Continue.
- Para a opção Run analysis on your project, selecione JS/TS & Web.
- Acione o terminal e execute o seguinte comando:

```
npm install -g @sonar/scan
```

- Acesse o termina e execute o comando:

```bash
npm install -g @sonar/scan
```

- Configure as seguintes variáveis de ambiente

```
SONARQUBE_TOKEN= <troque pelo token criado>
SONARQUBE_HOST=http://localhost:9000
SONARQUBE_PROJECT_KEY=<identificador do projeto>
```
- Execute o scaner:

```bash
sonar \
  -Dsonar.host.url=$SONARQUBE_HOST \
  -Dsonar.token=$SONARQUBE_TOKEN \
  -Dsonar.projectKey=$SONARQUBE_PROJECT_KEY
```

- Acesse novamente o navegador e informe o endereço:

```
localhost:9000
```

- Analise os resultados apresentados.

- Inclua o trecho a seguir nos servidores MCP do projeto:

```
"sonarqube": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-v",
        "${workspaceRoot}:/app/mcp-workspace",
        "-e",
        "SONAR_TOKEN=$SONARQUBE_TOKEN",
        "-e",
        "SONAR_HOST_URL=$SONARQUBE_HOST", 
        "SonarSource/sonarqube-mcp-server"
      ],
      "enabled": true
    }
```

- Abra uma nova seção do agente.
- Solicite a listagem dos achados:

```
Liste os problemas de qualidade identificados pelo sonar
```

---