# Roteiro de Delivery

## Pré-requisitos

- Google Antigravity <https://antigravity.google> instalado localmente.
- Node.js <https://nodejs.org/> instalado localmente.
- Git <https://git-scm.com/> instalado localmente.
- Docker e Docker Compose <https://docker.com> instalados localmente.
- Conta GitHub <https://github.com/>.
- Conta Vercel <https://vercel.com/>.
- Conta Supabase <https://www.supabase.com/>.
- Conta Clerk <https://clerk.com/>.
- Conta Context7 <https://context7.com/>.

Certifique-se de estar logado nessses serviços ao realizar o roteiro.

## Orientações gerais

### Gerenciamento da janela de contexto

- Priorize a criação de novas conversa no Antigravity para cada tarefa. Para tanto, acesse o painel Agent, comando +, Start a New Conversation.

### Ciclo Planejar/Executar (Research/Plan/Implement)

- Priorize a estruturação das tarefas no ciclo Planejar/Executar:
  - Planejar: No campo Conversation mode, selecione a opção "Planning". Para o campo Model, priorize, sempre que disponíveis, modelos com maior capacidade de reasoning ou "thinking". Após o término do planejamento, abra e analise o Implementation plan criado.
  - Executar: No campo Conversation mode, selecione a opção "Fast" (execução). Para o campo Model, podem ser selecionados modelos mais rápidos ou simples.
   
### Ajuste nos prompts

- Para vários exemplos de prompts disponibilizados, atente para a necessidade de substituir os valores entre os símbolos "<" e ">" pelos valores específicos de seu projeto.
- Quando estiver editando um prompt, utilize o caracter "@" para referenciar recursos como arquivos, diretórios, rules e mcp servers.


## 2.1 Desenvolvimento

**Visão geral**

Resultados:
- Scaffold
- Incremento de Produto

Participantes:
- Designer UX
- Desenvolvedor

Ferramentas:
- Ambientes de desenvolvimento (Google Antigravity, Claude Code, etc.)

---

### 2.1.1 Preparação do Antigravity

#### Configuração de rules

- Acesse o Antigravity.
- Selecione o painel Agent.
- Selecione os três pontos (...).
- Selecione a opção "Customizations".
- Na seção Rule, acione o comando +Workspace.
- Para Enter rule name, informe "terminal-execution" (sem aspas).
- Pressione enter.
- Para Activation Mode, mantenha a opção Always On.
- Para Content, cole o conteúdo a seguir:
   
```
# Rule: Terminal Governance — Engineering Constitution

## Persona
Atue como Engenheiro Sênior de Plataforma com mentalidade DevSecOps.
Princípio norte: **Automação máxima com risco mínimo controlado.**

---

## 1. Classificação Obrigatória

Antes de qualquer comando, classifique:

- `[EXPLORAÇÃO]` → leitura / sem alteração de estado  
- `[BUILD]` → instalação / build / setup  
- `[CRÍTICO]` → remoção / sobrescrita / alteração irreversível  

Sempre exiba a categoria antes da execução.

---

## 2. Automação por Padrão

Execute automaticamente (sem confirmação):

- Setup e configurações
- Instalação de ferramentas/skills
- Configuração de MCPs
- Comandos de exploração seguros (`ls`, `cat`, `grep`, etc.)

---

## 3. Validações Obrigatórias

Antes de comandos operacionais:

- Use `npm` como padrão (salvo lockfile diferente).
- Verifique Docker antes de usá-lo.
- Use `--dry-run` quando disponível em migrações/deleções.

Se a validação falhar, interrompa e informe.

---

## 4. Política para Ações Críticas

Para `[CRÍTICO]`:

1. Explique impacto exato.
2. Solicite confirmação explícita.

Para deleções massivas (`rm -rf`, curingas amplos):
- Exigir confirmação dupla.
- Nunca executar sem consentimento claro.

---

## 5. Tratamento de Erros

Se exit code ≠ 0:

1. Analise o erro.
2. Explique a causa provável.
3. Proponha correção.
4. Só então sugira reexecução.

Reexecução automática é proibida.

---

## Resultado Esperado

Agente eficiente por padrão.  
Rigoroso sob risco.  
Transparente sempre.
```

- Salve o conteúdo, pressionando Ctrl+S, simultaneamente.
- No painel Agent, acione o comando Back to agent.
- Verifique no diretório .agents se a rule foi configurada.

- Crie uma nova rule para ser executada sempre e com o seguinte conteúdo:

```
Sempre use o mcp server Context7 quando precisar de documentação de bibliotecas/APIs para geração de código, setups e demais configurações necessárias.
```

---

#### Configuração de skills

- Acesse o Antigravity.
- Selecione o painel Agent.
- Acione o comando "+", Start a New Conversation (repita esse procedimento em todo início de seção, pelo menos).
- Cole o texto a seguir no prompt, solicitando a instalação das skills:

```
# Antigravity Skill Installation Prompt


## Objetivos

Instalar skills externas no diretório padrão do Antigravity.


## Regras críticas

Instalar todas as skills apenas em:

`.agent/skills`

NÃO instalar skills em:
`.agents/`
`.cursor/`

Não modificar a estrutura interna dos repositórios de skills.

Cada skill deve ser instalada como subdiretório independente dentro de:
`.agent/skills`

## Otimização de performance

Para endereços que apontam diretamente para arquivos ou subdiretórios específicos, utilize importação direta de conteúdo.

Evite:
- clonagem completa de repositórios
- varredura recursiva desnecessária

Objetivo: reduzir tempo de processamento e ingestão

## Fontes das skills

Instale as skills provenientes dos seguintes repositórios:

### Vercel Skills

`https://github.com/vercel-labs/next-skills/tree/main/skills/next-best-practices`
`https://github.com/vercel-labs/next-skills/tree/main/skills/next-cache-components`
`https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel`
`https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices`
`https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines`
`https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns`

### Prisma

`https://github.com/prisma/skills/tree/main/prisma-database-setup`

### Google Stitch

`https://github.com/google-labs-code/stitch-skills`

### Supabase

`https://github.com/supabase/agent-skills`

### Clerk

`https://github.com/clerk/skills`

### Antigravity Community Skills

`https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/frontend-design`
`https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/backend-architect/`
`https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/nestjs-expert`
`https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/docker-expert`
`https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/github-actions-templates/`


## Procedimento de instalação

Para cada fonte listada:
- Localizar o diretório da skill.
- Importar apenas o conteúdo necessário da skill.
- Criar um diretório dentro de:

`.agent/skills/<skill-name>`

Copiar os arquivos da skill para o diretório correspondente.

Estrutura final esperada:

.agent
 └── skills
      ├── next-best-practices
      ├── next-cache-components
      ├── deploy-to-vercel
      ├── react-best-practices
      ├── web-design-guidelines
      ├── composition-patterns
      ├── prisma-database-setup
      ├── stitch-skills
      ├── frontend-design
      ├── backend-architect
      ├── nestjs-expert
      ├── docker-expert
      └── github-actions-templates

## Manutenção do ambiente

Após a instalação das skills:
- Remover diretórios de agentes que não são nativos do Antigravity.
- Remoção deve ocorrer em:
  - nível local
  - nível global

Manter apenas:

`.agent/`

Remover quaisquer diretórios como:
`.agents/`
`.cursor/`

ou outros diretórios de agentes externos.

## Resultado esperado

O ambiente final deve possuir:
- apenas um diretório de agentes
- todas as skills instaladas em:
`.agent/skills`

Estrutura limpa e otimizada para execução do Antigravity Agent Runtime.
```

- Ao lado do item implementation_plan.md, acione o comando Open.
- Na seção de prompt, alterne da opção "Planning" para "Fast" (execução).
- Repita esse procedimento sempre que for executar um plano.
- No painel Implementation Plan, acione o comando Proceed.
- Interaja com o agente, provendo as entradas solicitadas.
- Ao lado do item walkthrough.md, acione o comando Open.
- Analise o conteúdo do arquivo.
- Analise também o conteúdo do arquivo Task.
- Verifique no diretório .agents se as skills foram instaladas.

---

#### Configuração de MCP Servers

**Obtenção de credenciais**

- No diretório raiz do projeto crie uma cópiado arquivo .env.example com o nome .env
- Edite o arquivo .env
- Acesse os endereços informados junto a cada credencial.
- Navegue em cada aplicação e obtenha os valores solicitados.

```
PROJECT_NAME=<nome do projeto>

# GitHub
# https://github.com/settings/tokens/new
GITHUB_PERSONAL_ACCESS_TOKEN=

# Stitch
# https://stitch.withgoogle.com/settings
STITCH_API_KEY=

# Vercel
# https://vercel.com/account/settings/tokens
VERCEL_API_TOKEN=

# Supabase
# https://supabase.com/dashboard/account/tokens
SUPABASE_ACCESS_TOKEN=
#NEXT_PUBLIC_SUPABASE_URL=(será preenchida posteriormente)
#NEXT_PUBLIC_SUPABASE_ANON_KEY=(será preenchida posteriormente)

# Clerk
# https://dashboard.clerk.com/apps/
# Criar uma aplicação e copiar as chaves de API
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Context7
# https://context7.com/dashboard
CONTEXT7_API_KEY=

#Backend para Frontend
NEXT_PUBLIC_API_URL=

#Portas
FRONTEND_PORT=
BACKEND_PORT=

```

- Crie ou atualize o arquivo .gitignore e inclua nele o seguinte conteúdo:
  
```
.env.local
```


**Configuração dos MCP servers**

- Selecione o painel Agent.
- Selecione a opção Additional options (símbolo de três pontos "...").
- Na seção MCP Store, acione o comando Manage MCP Servers.
- No painel Manage MCP servers, acione o comando View raw config.
- Substitua o conteúdo existente pelo seguinte:
- Substitua o valor de cada chave pelo valor obtido no arquivo .env.local

```json
{
  "mcpServers": {
    "stitch": {
      "serverUrl": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "<STITCH_API_KEY>"
      }
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<GITHUB_PERSONAL_ACCESS_TOKEN>"
      }
    },    
    "vercel": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://mcp.vercel.com"
      ],
      "env": {
        "VERCEL_API_TOKEN": "<VERCEL_API_TOKEN>"
      }
    },    
    "supabase-mcp-server": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--access-token",
        "<SUPABASE_ACCESS_TOKEN>"
      ],
      "env": {}
    },
    "clerk": {
      "command": "npx",
      "args": [
        "-y",
        "@clerk/clerk-mcp"
      ],
      "env": {
        "CLERK_SECRET_KEY": "<CLERK_SECRET_KEY>"
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

#### Teste de MCP Servers

- Solicite listar os projetos disponíveis no Stitch:

```
Use o mcp server do Stitch para listar os projetos
```

- Solicite listar as organizações do Supabase:

```
Use o mcp server do Supabase para listar as organizações e projetos
```

- Solicite listar os times e projetos do Vercel:

```
Use o mcp server do Vercel para listar os times e projetos
```

### 2.1.2 Criação do projeto

- No painel Agent, selecione a opção Start a new conversation.
- Copie o conteúdo a seguir e proceda os seguintes ajustes antes de comandar a execução:
- Troque o <projeto stitch> pelo nome do projeto criado no Stitch.
- Priorize a escolha do modo Planning.
- Priorize a escolha de modelos com maior capacidade de reasoning.
  
```
# Criação de projeto full stack

## System prompt

Você é um arquiteto de software sênior especializado em geração de scaffolds para projetos full stack assistidos por IA.

Seu papel é gerar a arquitetura inicial mínima de um projeto, garantindo que ele seja:
- modular
- previsível
- facilmente evolutivo
- compatível com desenvolvimento incremental orientado por IA

Priorize sempre:
- arquitetura modular
- separação clara de responsabilidades
- estrutura de diretórios previsível
- baixo acoplamento
- simplicidade estrutural
- extensibilidade futura
- Nunca implemente funcionalidades fora do escopo solicitado.

## Objetivo

Gerar o scaffold inicial de um projeto web full stack organizado como monorepo, preparado para evolução incremental assistida por IA.

O scaffold deve incluir apenas:
- estrutura de diretórios
- configuração mínima
- integração básica entre frontend e backend
- Não implementar funcionalidades além do necessário para validar a integração.

---

## Estrutura do Monorepo

Gerar a seguinte estrutura:

`
monorepo
│
├─ apps
│  ├─ frontend
│     ├─ Dockerfile
│  │  └─ src
│  │     ├─ app
│  │     ├─ components
│  │     └─ lib
│  │
│  └─ backend
│     ├─ Dockerfile
│     └─ src
│        ├─ database
│        └─ modules
│
├─ docs
│
├─ infra
│
├─ .env
└─ docker-compose.yml
└─ package.json
`
Regras:
- frontend e backend devem ser aplicações independentes
- comunicação deve ocorrer exclusivamente via API
- utilizar organização feature-based
- manter separação clara entre camadas
- evitar dependências cruzadas entre apps
---

## Configuração de Ambiente

Deve existir apenas um arquivo .env na raiz do monorepo.

Esse arquivo será utilizado por:
- frontend
- backend
- docker-compose

## Fonte de Verdade do Projeto

A implementação deve seguir **estritamente** os seguintes documentos:

`docs/prd.md`
`docs/spec_tech.md`
`docs/spec_ui.md`
`docs/design_system.md`

Os documentos definem:
- requisitos funcionais
- arquitetura técnica
- especificação de interface
- design system

## Recursos de Projeto

O projeto possui imagens e protótipos disponíveis no Stitch:

`<projeto stitch>`

Utilizar as skills disponíveis em:

`.agent/skills`

Utilizar documentação atualizada por meio do mcp server do Context7.
---

## Artefatos Docker

### Dockerfiles das Aplicações

Cada aplicação do monorepo deve possuir seu próprio Dockerfile:
- apps/frontend/Dockerfile
- apps/backend/Dockerfile

Regras para Dockerfiles:
- Todos os Dockerfiles devem seguir as mesmas diretrizes:
- Imagem base: utilizar node:lts-alpine
- utilizar multi-stage build
- instalar dependências com npm ci
- separar etapas de dependências, build e runtime
- diretório de trabalho deve ser /app
- expor porta configurável via variável PORT
- iniciar aplicação com npm start ou node

Boas práticas:
- copiar apenas arquivos necessários para o build
- evitar copiar todo o repositório
- gerar imagem final mínima
- otimizar cache de build

Os Dockerfiles devem ser compatíveis com monorepos:
- o contexto de build é a raiz do repositório
- caminhos devem considerar a estrutura apps/
- evitar caminhos relativos frágeis

### Docker Compose

Criar serviços mínimos:
- db
- backend
- frontend

Objetivo do docker-compose:
- permitir execução local completa do sistema
- permitir comunicação entre os serviços

## Restrições

Não:
- criar módulos adicionais
- criar páginas adicionais
- implementar autenticação
- integrar serviços externos
- configurar infraestrutura de cloud
- adicionar bibliotecas não especificadas
- gerar funcionalidades além do scaffold mínimo

## Regra de Minimalismo

Gerar apenas o mínimo necessário para permitir evolução incremental do projeto.

Se uma funcionalidade não for necessária para:
- estruturar o projeto
- validar a integração frontend-backend
- então não deve ser implementada.

## Regra de Saída

A resposta deve conter apenas um plano de implementação contendo:
- estrutura de diretórios
- arquivos essenciais do scaffold
- código mínimo necessário

Não incluir:
- explicações
- comentários desnecessários
- documentação extensa


```

- Revise o plano de implementação proposto.
- Solicite ao agente que faça os eventuais ajustes.
- Solicite a execução do plano.


## 2.2 Testes

Resultados:
- Produto testado

Participantes:
- Desenvolvedor
- Designer UX

Ferramentas:
- Ambientes de desenvolvimento.

---

- Acesse a aplicação por meio do navegador web (padrão: <http://localhost:3000>).
- Navegue pela aplicação para verificar as páginas criadas.
- Caso sejam encontrados erros ou funcionalidades não implementadas, copie a tela e mensagem com o comportamento atual e descreva o comportamento esperado.
- Cole as informações no agent e solicite os ajustes.

---

## 2.3 Liberação

Resultados:
- Produto implantado

Participantes:
- Desenvolvedor
- Designer UX

Ferramentas:
- Ambientes de desenvolvimento.
- Infraestrutura de deployment (Vercel).

-  Faça o commit das modificações locais e o push para o repositório remoto no GitHub.

### 2.3.1 Criação dos projetos no Vercel

- No painel Agent, selecione a opção Start a new conversation.
- Solicite a criação dos projetos Vercel (substitua <nome do time> pelo valor correspondente configurado no vercel):

```
# Criação de projetos Vercel

## Contexto

Você é um agente de engenharia de software especializado em automação de infraestrutura e integração com Vercel.

Objetivo:
Criar os projetos backend e frontend no Vercel para um monorepo existente.

## Regras:
- Utilize as skills disponíveis em :
`.agent/skills/`

Crie dois projetos distintos no Vercel:
- backend
- frontend

Os projetos devem ser criados no seguinte time da Vercel:
`<nome do time>`

Configure cada projeto apontando para os respectivos diretórios do monorepo:
Projeto	-> Diretório
backend	-> apps/backend
frontend -> apps/frontend

Importante:
- Não executar deploy
- Não rodar build
- Não publicar a aplicação

O objetivo desta tarefa é somente registrar os projetos no Vercel.

##  Resultado Esperado:
- Projeto backend criado no Vercel
- Projeto frontend criado no Vercel
- Ambos associados ao time informado
- Nenhum deploy executado

```

- Caso tenha ocorrido algum erro, copie a mensagem de erro e cole no chat do agente para correção.


### 2.3.2 Configuração do pipeline CI/CD

- No painel Agent, selecione a opção Start a new conversation.
- Solicite a criação do pipeline incluindo o deploy Vercel.

```
# Role
Atue como um Engenheiro de DevOps sênior e Arquiteto de Software, especializado em Ecossistemas JavaScript e Automação de Infraestrutura.

# Objetivo
Crie um arquivo de workflow do GitHub Actions (`.github/workflows/deploy.yml`) para um projeto **Next.js** que automatize o ciclo de vida de integração e entrega contínua (CI/CD).

# Contexto Técnico

Utilize:
- skill do Github em `.agent/skills`
- mcp server do github.
- especificação técnica disponível em `docs/spec_tech.md`

# Etapas do Workflow
1. **Trigger:** O workflow deve ser acionado em cada `push` na branch `main` e em todos os `pull_requests`.
2. **Setup:** Utilizar a versão LTS do Node.js e configurar o cache de dependências para acelerar execuções futuras.
3. **Qualidade:** Executar passos de `lint` e `test` (unitários/integração). O pipeline deve ser interrompido se houver falhas.
4. **Build & Deploy:** realizar o **Production Deploy** na Vercel.
5. **Segurança:** Utilizar as Secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`.

# Resultado Esperado
- Código YAML completo e comentado.
- Instruções passo a passo de onde configurar as Secrets no repositório do GitHub.
- Sugestão de como adicionar uma notificação de status ao final do processo.
```

- Acesse o diretório .github/workflows do repositório no GitHub.
- Verifique o arquivo deploy.yml com o conteúdo gerado pelo Antigravity.
- Verifique se o arquivo foi criado com sucesso.
- Obtenha as secrets do vercel:
  - VERCEL_TOKEN no endereço: <https://vercel.com/account/settings/tokens>
  - VERCEL_ORG_ID no endereço: <https://vercel.com/[team]/~/settings>, [team] é o nome da sua equipe.
  - VERCEL_PROJECT_ID no endereço: <https://vercel.com/[team]/[project]/settings>, campo Project ID.
- Configure as secrets no repositório do GitHub, no endereço: <https://github.com/[usuário]/[projeto]/settings/secrets/actions>.
- Verifique se as secrets foram configuradas com sucesso.
- Ao final do processo, acesse a aplicação por meio do navegador web (O endereço é disponibilizado no formato https://<projeto>.vercel.app/).


### 2.3.3 Configuração de segurança com Clerk

- No painel Agent, selecione a opção Start a new conversation.
- Solicite a criação de uma nova aplicação no Clerk (substitua <nome do projeto> pelo nome do projeto):

```
Use o mcp server clerk e a skill .agent/skills/clerk para criar uma aplicação com o nome <nome do projeto>
```

- Após a conclusão, navegue na aplicação localmente e verifique se tanto o botão Login quanto o Finalizar compra apontam para a página de login.
- Caso ocorra algum erro, copie a mensagem de erro e cole no chat do agente para correção.
- Faça o registro e o login de um usuário.


### 2.3.4 Configuração do banco de dados com Supabase

- No painel Agent, selecione a opção Start a new conversation.
- Solicite a criação do projeto Vercel (substitua <nome do projeto> pelo nome do projeto e <nome da organização> pelo valor correspondente configurado no supabase):

```
Use o mcp server supabase e skill .agent/skills/supabase para criar um projeto de banco de dados com o nome <nome do projeto> e as respectivas tabelas na organização <nome da organização>. Inclua alguns dados para permitir o teste da aplicação. Remova os dados simulados.
```

- Caso tenha ocorrido algum erro, copie a mensagem de erro e cole no chat do agente para correção.
- Verifique se a aplicação está funcionando corretamente.
- Atualize o projeto no Vercel com as variáveis de ambiente do Supabase e Clerk
- Faça o deploy do projeto no Vercel
- Verifique se a aplicação está funcionando corretamente.

---

Fim do roteiro de delivery.