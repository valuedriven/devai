# Roteiro de Delivery

## Pré-requisitos

- Google Antigravity <https://antigravity.google> instalado localmente.
- Node.js <https://nodejs.org/> instalado localmente.
- Git <https://git-scm.com/> instalado localmente.
- Conta GitHub <https://github.com/>.
- Conta Vercel <https://vercel.com/>.
- Conta Supabase <https://www.supabase.com/>.
- Conta Clerk <https://clerk.com/>.

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

---

#### Configuração de skills

- Acesse o Antigravity.
- Selecione o painel Agent.
- Acione o comando "+", Start a New Conversation (repita esse procedimento em todo início de seção, pelo menos).
- Cole o texto a seguir no prompt, solicitando a instalação das skills:

```
No diretório padrão do Antigravity (.agent/skills) instale as skills dos repositórios e endereços listados abaixo.

Nota de Performance: Para os endereços com caminhos diretos de arquivos, utilize o modo de importação de conteúdo para evitar a varredura completa de diretórios, reduzindo o tempo de processamento.

1. Repositórios de Skills (GitHub):
https://github.com/google-labs-code/stitch-skills
https://github.com/vercel-labs/agent-skills
https://github.com/vercel-labs/next-skills
https://github.com/supabase/agent-skills
https://github.com/clerk/skills
https://playbooks.com/skills/markpitt/claude-skills/github-api


Manutenção do Ambiente
Remova, de forma local e global, todos os diretórios de agentes que não são utilizados nativamente pelo antigravity.

Diretórios para Exclusão:
.agents/
.cursor/
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

- No diretório raiz do projeto crie o arquivo .env.local (atente para o ponto no início do nome do arquivo)
- Crie ou atualize o arquivo .gitignore e inclua nele o seguinte conteúdo:
  
```
.env.local
```
- Acesse os endereços informados junto a cada credencia.
- Navegue em cada aplicação e obtenha os valores solicitados.

```
PROJECT_NAME=<nome do projeto>

# GITHUB
# https://github.com/settings/tokens/new
GITHUB_PERSONAL_ACCESS_TOKEN=

# STITCH
# https://stitch.withgoogle.com/settings
STITCH_API_KEY=

# VERCEL
# https://vercel.com/account/settings/tokens
VERCEL_API_TOKEN=

# SUPABASE
# https://supabase.com/dashboard/account/tokens
SUPABASE_ACCESS_TOKEN=
#NEXT_PUBLIC_SUPABASE_URL=(será preenchida posteriormente)
#NEXT_PUBLIC_SUPABASE_ANON_KEY=(será preenchida posteriormente)

# CLERK
# https://dashboard.clerk.com/apps/
# Criar uma aplicação e copiar as chaves de API
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

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

### 2.1.2 Criação do projeto web

- No painel Agent, selecione a opção Start a new conversation.
- Copie o conteúdo a seguir e proceda os seguintes ajustes antes de comandar a execução:
  - Troque o <nome do projeto> pelo nome do projeto criado no Stitch
  - Troque os nomes dos arquivos por referências aos objetos, usando o caracter "@".

```
# Criação de projeto web

## Objetivo

Criar um projeto **web frontend** seguindo estritamente as definições fornecidas.

## Diretrizes Obrigatórias

- Utilizar as skills:
  - nextjs
  - design-systems

- Seguir integralmente os documentos:
  - <@docs/spec_ui.md>
  - <@docs/spec_tech.md>
  - <@docs/design_system.md>

- Utilizar as imagens disponíveis no projeto Stitch:
  - <nome do projeto>

## Restrições

- Criar estrutura de monorepo preparada para futura integração com backend
- Armazenar todos os arquivos no diretório `/frontend`
- Armazenar todo o código-fonte no diretório `/frontend/src`
- Não criar projeto backend
- Não configurar integrações externas
- Executar inicialmente apenas localmente
```

- Execute o plano e monitore o progresso até a conclusão.
- Siga as instruções do agente para verificar o resultado.

#### Atualização de informações do projeto

- No painel Agent, selecione a opção Start a new conversation.
- Solicite a atualização do arquivo README.md:

```
Atualize o arquivo README.md utilizando as boas práticas recomendadas pelo GitHub
```

- Solicite a criação do arquivo AGENTS.md:

```
Crie o arquivo AGENTS.md para o projeto usando como contexto apenas as seguintes informações:
- documentos:
 - <@docs/prd.md>
 - <@docs/spec_ui.md>
 - <@docs/spec_tech.md>
- diretório <@frontend>.
Use referências relativas para os arquivos citados.
```

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
- Cas sejam encontrados erros, copie a mensagem de erro e cole no chat do agente para correção.

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

### 2.3.1 Deploy com Vercel

- No painel Agent, selecione a opção Start a new conversation.
- Solicite a criação do projeto Vercel (substitua <nome do time> pelo valor correspondente configurado no vercel):

```
Use a skill vercel (.agent/skills/vercel) para criar um projeto e fazer o deploy da aplicação. Utilize o time <nome do time>
```

- Caso tenha ocorrido algum erro, copie a mensagem de erro e cole no chat do agente para correção.
- Ao final do processo, acesse a aplicação por meio do navegador web (O endereço é disponibilizado no formato https://<projeto>.vercel.app/).


### 2.3.2 Configuração de segurança com Clerk

- No painel Agent, selecione a opção Start a new conversation.
- Solicite a criação de uma nova aplicação no Clerk (substitua <nome do projeto> pelo nome do projeto):

```
Use o mcp server clerk e a skill .agent/skills/clerk para criar uma aplicação com o nome <nome do projeto>
```

- Após a conclusão, navegue na aplicação localmente e verifique se tanto o botão Login quanto o Finalizar compra apontam para a página de login.
- Caso ocorra algum erro, copie a mensagem de erro e cole no chat do agente para correção.
- Faça o registro e o login de um usuário.


### 2.3.3 Configuração do banco de dados com Supabase

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