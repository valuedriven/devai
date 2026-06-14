# Fluxo de Delivery

## 1.Visão geral do fluxo

Resultados:
- Scaffold
- Incremento de Produto
- Infraestrutura do projeto:
  - Vercel
  - Supabase
  - Clerk

Participantes:
- Designer UX
- Desenvolvedor

Ferramentas:
- Ambientes de desenvolvimento (Antigravity, Claude Code, Cursor, Codex, Opencode etc.)

---

## 2. Orientações gerais

### Pré-requisitos

- Google Antigravity <https://antigravity.google> instalado localmente.
- Opencode <https://opencode.ai/> instalado localmente (como alternativa/complemento ao Google Antigravity). 
- Node.js <https://nodejs.org/> instalado localmente.
- Git <https://git-scm.com/> instalado localmente.
- Docker e Docker Compose <https://docker.com> instalados localmente.
- Conta GitHub <https://github.com/>.
- Conta Vercel <https://vercel.com/>.
- Conta Supabase <https://www.supabase.com/>.
- Conta Clerk <https://clerk.com/>.
- Conta Context7 <https://context7.com/>.
- Openspec <https://openspec.dev/> instalado localmente.

Certifique-se de estar logado nessses serviços ao realizar o roteiro.

### Gerenciamento da janela de contexto

- Priorize a criação de novas conversa no Antigravity para cada tarefa. Para tanto, acesse o painel Agent, comando +, Start a New Conversation.

### Ciclo Planejar/Executar (Research/Plan/Implement)

- Priorize a estruturação das tarefas no ciclo Planejar/Executar:
  - Planejar: No campo Conversation mode, selecione a opção "Planning". Para o campo Model, priorize, sempre que disponíveis, modelos com maior capacidade de reasoning ou "thinking". Após o término do planejamento, abra e analise o Implementation plan criado.
  - Executar: No campo Conversation mode, selecione a opção "Fast" (execução). Para o campo Model, podem ser selecionados modelos mais rápidos ou simples.
   
### Ajuste nos prompts

- Para vários exemplos de prompts disponibilizados, atente para a necessidade de substituir os valores entre os símbolos "<" e ">" pelos valores específicos de seu projeto.
- Quando estiver editando um prompt, utilize o caracter "@" para referenciar recursos como arquivos, diretórios, rules e mcp servers.

---

## 3. Configuração do projeto

### Documentação geral do projeto

Certifique-se que a documentação geral do projeto esteja disponível em: <@docs>

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

Certifique-se que a documentação geral do projeto esteja disponível em: <@docs>


## 4 Configuração do Agente de IA

### Configuração de regras no arquivo AGENTS.md

- Crie uma nova sessão no agente.
- Informe o prompt a seguir:

```
Crie ou ajuste o AGENTS.md para incluir as seguintes informações:

- Comportamento geral. Use como referência as diretrizes de Andrej Karpathy disponíveis em <https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md>
- Stack tech resumida com base em <@docs/spech_tech.md>
- Estrutura do monorepo com base em <@docs/spech_tech.md>
- Comandos
   - Setup inicial
   - build
   - run
   - banco de dados
- Regras de qualidade e testes com base em <@docs/spech_tech.md>
- Regras de governança e autonomia no terminal
- Regras de aprendizado contínuo com reflexão e sugestão de atualização de regras ao final de cada mudança
- Referências de documentação do projeto na pasta <@docs>
- Busca atualizada de informações por meio do mcp serve do context7

Valide o AGENTS.md com as diretrizes disponíveis em <https://github.com/valuedriven/devai/tree/main/.fluxo/concepts/agents-md-guidelines.md>
```
- Verifique o resultado
- Peça ajuda a alguma IA de fronteira para validar o resultado.


- Ao final de cada sessão, pode ser interessante avaliar o nível de autonomia dos agentes na execução das tarefas. Use um prompt análogo ao seguinte:

```
Analise o histórico de conversações desta sessão e proponha ajustes no arquivo AGENTS.md, seção Governança e uso de terminal, de forma a aumentar a autonomia do agente na execução de tarefas como leitura e escrita de arquivos.
```

### Configuração de skills

Uma skill pode ser configurada de forma iterativa ao criar um prompt para o agente:
- Acesse o Antigravity.
- Selecione o painel Agent.
- Acione o comando "+", Start a New Conversation (repita esse procedimento em todo início de seção, pelo menos).
- Solicite a criação da skill com uma instrução similar a: "Crie uma skill com o seguinte conteúdo...".

Alternativamente, pode ser configurada forma manual, por meio da criação da seguinte estrutura no diretório raiz do projeto:

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

Skills para a stack do projeto

```
# Agents Skill Installation Prompt

## Objetivos

Instalar skills externas de repositórios específicos no diretório nativo padrão, garantindo compatibilidade e portabilidade entre agentes.

## Modo de Execução: 100% Autônomo

* O agente deve executar todo o fluxo (download, criação, movimentação e exclusão de arquivos/diretórios) de forma **totalmente autônoma**.
* **NÃO** pause a execução, **NÃO** solicite confirmação humana (no human-in-the-loop) e **NÃO** exiba prompts interativos.
* Adicione as flags necessárias (`-y`, `-f`, `--quiet`, etc.) a todos os comandos executados no terminal para garantir que eles não travem aguardando input do usuário.

## Portabilidade para outros agentes

* Utilize comandos de manipulação de arquivos e diretórios padrão POSIX ou as ferramentas de file system nativas do agente.
* Garanta que as permissões de leitura dos arquivos `SKILL.md` sejam preservadas para que o parser do OpenCode consiga indexá-los corretamente.
* A estrutura de diretórios deve ser agnóstica em relação ao sistema operacional base (Windows/Linux/macOS), utilizando caminhos relativos em todas as operações.

## Regras Críticas

1. Instalar todas as skills estritamente no diretório:
`.agents/skills/`
2. **NÃO** instalar ou manter skills em diretórios legados ou concorrentes, como:
`.agent/`
`.cursor/`
`.opencode/skills/` (use apenas `.agents/skills/` como fonte única de verdade)
3. Não modificar a estrutura interna dos repositórios de skills baixados.
4. Cada skill deve ser instalada como um subdiretório independente e **precisa** conter o seu arquivo original `SKILL.md` na raiz para ser reconhecida pelos runtimes do Antigravity e do OpenCode.

## Otimização de Performance (Ingestão)

Para endereços que apontam diretamente para arquivos ou subdiretórios específicos dentro de um repositório, utilize métodos de importação direta restrita (ex: `git sparse-checkout`, `gh repo download` ou requisições diretas via API).

* **Evite rigorosamente:** Clonagem completa (*full clone*) de repositórios inteiros.
* **Evite rigorosamente:** Varredura recursiva desnecessária no file system.

Objetivo: Reduzir o tempo de processamento, consumo de banda e otimizar a ingestão para o contexto do agente.

## Fontes das Skills

Instale as skills provenientes dos seguintes repositórios:

### Google Stitch

`[https://github.com/google-labs-code/stitch-skills](https://github.com/google-labs-code/stitch-skills)`

### Antigravity Community Skills

`[https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/frontend-design](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/frontend-design)`
`[https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/backend-architect/](https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/backend-architect/)`
`[https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/nestjs-expert](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/nestjs-expert)`
`[https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/docker-expert](https://github.com/sickn33/antigravity-awesome-skills/tree/main/skills/docker-expert)`
`[https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/github-actions-templates/](https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/github-actions-templates/)`

### Terraform Skill

`[https://github.com/hashicorp/agent-skills/tree/main/terraform/code-generation/skills/terraform-style-guide](https://github.com/hashicorp/agent-skills/tree/main/terraform/code-generation/skills/terraform-style-guide)`

### Vercel Skills

`[https://github.com/vercel-labs/next-skills/tree/main/skills/next-best-practices](https://github.com/vercel-labs/next-skills/tree/main/skills/next-best-practices)`
`[https://github.com/vercel-labs/next-skills/tree/main/skills/next-cache-components](https://github.com/vercel-labs/next-skills/tree/main/skills/next-cache-components)`
`[https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel](https://github.com/vercel-labs/agent-skills/tree/main/skills/deploy-to-vercel)`
`[https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices](https://github.com/vercel-labs/agent-skills/tree/main/skills/react-best-practices)`
`[https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines](https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines)`
`[https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns](https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns)`

### Prisma

`[https://github.com/prisma/skills/tree/main/prisma-database-setup](https://github.com/prisma/skills/tree/main/prisma-database-setup)`

### Supabase

`[https://github.com/supabase/agent-skills](https://github.com/supabase/agent-skills)`

### Clerk

`[https://github.com/clerk/skills/blob/main/skills/core/clerk-setup](https://github.com/clerk/skills/blob/main/skills/core/clerk-setup)`
`[https://github.com/clerk/skills/blob/main/skills/core/clerk](https://github.com/clerk/skills/blob/main/skills/core/clerk)`

## Procedimento de Instalação Autônoma

Para cada fonte listada acima, execute via script ou terminal integrado:

1. Extraia o nome da skill com base no último segmento da URL.
2. Crie um diretório isolado estritamente dentro de:
`.agents/skills/<skill-name>`
3. Importe apenas o conteúdo necessário da skill (download direto ou *sparse checkout*).
4. Garanta de forma mandatória que o `SKILL.md` e eventuais arquivos de suporte (como scripts de OpenCode compatíveis) aterrissem corretamente neste novo diretório de destino.

## Manutenção e Limpeza do Ambiente

Após a instalação bem-sucedida de todas as skills, purgue o ambiente de configurações externas através de deleção forçada (`rm -rf` ou equivalente do agente):

1. Remova diretórios de agentes que não são nativos ou estão obsoletos (nível local de workspace e global, se acessível).
2. Mantenha intacto apenas:
`.agents/`
3. Remova definitivamente quaisquer ocorrências de diretórios como `.agent/` e `.cursor/`.

## Resultado Esperado

O ambiente final deve possuir apenas um diretório central de configuração (`.agents/`), abrigando todas as skills instaladas como pastas independentes em `.agents/skills`. A estrutura deve estar higienizada e pronta para execução instantânea pelo Antigravity Agent Runtime e interoperável com o OpenCode.
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

### Configuração de MCP Servers

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
Use o mcp server do Stitch para listar os projetos
```

- Solicite listar informações sobre o Supabase no Context7:

```
Use o mcp server do Context7 para obter informações atualizadas sobre o Supabase
```

## 5. Criação de mudanças

As mudanças seguem o fluxo: Planejar -> Gerar -> Avaliar

### Configuração do Openspec


- Certifique-se de que o Openspec esteja instalado, conforme disponível em https://openspec.dev/.
- Inicialize o openspec no diretório do projeto. Para tanto, acesse o terminal e execute o comando:

```bash
openspec init
```

- Selecione as ferramentas desejadas para configuração do openspec (ex.: Antigravity).
- Como resultado, devem ser criadas ou atualizadas as seguintes estruturas de pastas:

```
├── .agents
│   ├── commands
│   ├── rules
│   ├── skills
│   └── workflows
├── openspec
│   ├── changes
│   ├── config.yaml
│   └── specs
```

- Caso tenha sido criada a pasta .agent (no singular), mova seu conteúdo para a pasta .agents

- Execute o seguinte comando (certifique-se de que o comando /opsx-explore seja selecionado ao clicar em "/". Faça o mesmo para o arquivo indicado, acionando "@"):

```
/opsx-explore personalize o arquivo config.yaml com informações sobre stack e diretrizes de testes e qualidade disponíveis no arquivo @docs/spec_tech.md
```

### Definição de roadmap de mudanças

Utilize a skill openspec-explore para criar as mudanças incrementais do projeto. 

- Inicie uma nova sessão do agente.
- Na janela do chat, digite o caracter "/" e selecione a skill "opsx-explore".
- Informe o conteúdo a seguir logo depois da skill (lembre-se de informar o nome do projeto stitch corretamente)

```
/opsx-explore Dimensione as mudanças necessárias para a implementação de uma aplicação web full stack de maneira incremental.

Utilize a documentação disponível nos arquivos @docs/prd.md @docs/spec_tech.md @docs/spec_ui.md e @docs/design_system.md.

Obtenha os protótipos das interfaces gráficas no projeto stitch <nome do projeto> por meio do mcp server correspondente.

Configure as mudanças de forma que nenhuma fique com tamanho, complexidade e/ou risco maior que médio.

Crie apenas o proposal.md de cada mudança.

Crie um arquivo roadmap.md com um resumo do planejamento.
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

- Solicite a criação de cada proposta de mudança conforme roadmap.
- Crie uma nova seção.
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

- Inicie uma nova sessão.
- Informe o seguinte prompt, informando a mudança desejada:

```bash
/opsx-apply <id da mudança>
```

- Acompanhe a execução do agente, analisando os resultados apresentados.
- Caso sejam encontrados erros ou recursos não implementados, corrija-os solicitando os ajustes necessários.


### Avaliação de resultados

- Inicie uma nova sessão.
- Execute o workflow para verificação da change aplicada:

```bash
/opsx-verify <id da mudança>
```

- Ao final do processo, será gerado um relatório de validação. Verifique se o relatório indica que a change foi aplicada corretamente.
- Caso contrário, corrija os problemas encontrados solicitando os ajustes necessários.


### Arquivamento de mudança

- Execute o workflow de arquivamento

```bash
/opsx-archive <id da mudança>
```

- Inicie uma nova sessão.
- Solicite a execução da aplicação.


Repita o ciclo /opsx-propose /opsx-apply /opsx-verify /opsx-archive para as demais changes.


### Criação de README.md

- Solicite ao agente a criação do arquivo README.md.

```
Crie o arquivo README.md para o repositório, seguindo as boas práticas recomendadas pelo GitHub disponíveis em: <https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes>
```

- Analise o arquivo gerado.

---

## 6. Verificação de mudanças



Fim do roteiro de delivery.
