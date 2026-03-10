# GitHub Actions

## Criação de pipeline de deploy

### Configuração de skill

- No painel Agent do Antigravity, abra uma nova conversa.
- Informe o seguinte prompt para configurar skill:

```
Configure no diretório .agent/skills a skill github-api conforme definido em https://playbooks.com/skills/markpitt/claude-skills/github-api. 

Configurações obrigatórias:
- Base URL: https://api.github.com
- Auth: Use meu Token de Acesso Pessoal configurado nas chaves de API do sistema.
- Escopo: Repositórios públicos e privados, Issues e Gerenciamento de Conteúdo.

Instrução de Comportamento: 
Você deve agir como um Software Architect. Sempre que eu solicitar uma análise de repositório, use a skill para buscar o README.md e a estrutura de diretórios antes de responder. Se eu pedir para criar uma issue, use os parâmetros de 'title' e 'body' baseados no contexto da nossa conversa atual.
```


### Configuração de rule

- No painel Agent do Antigravity, acione o comando More options (três pontos).
- Selecione a opção Customizations.
- Selecione a aba Rules, comando +Workspace.
- No campo Enter rule name, informe "automacao-infraestrutura" e acione Enter.
- No campo Content, informe o texto a seguir:

```
# 📜 Regras de Configuração (Rules) para Automação de Infraestrutura

Este documento define as diretrizes obrigatórias para a geração de workflows de CI/CD, garantindo segurança, performance e padronização em projetos de software.

---

### 🛡️ 1. Segurança e Governança
* **Secret Management:** É estritamente proibido incluir chaves de API, tokens ou credenciais diretamente no código YAML. Utilize sempre a sintaxe `${{ secrets.NOME_DA_SECRET }}`.
* **Princípio do Privilégio Mínimo:** Todo workflow gerado deve incluir o bloco `permissions:` configurado apenas com as permissões estritamente necessárias (ex: `contents: read`).
* **Security Scanning:** Sempre sugerir ou incluir um passo de análise de vulnerabilidades (como `npm audit` ou `snyk`) antes da etapa de build.

### ⚡ 2. Performance e Otimização
* **Mandatory Caching:** Workflows para ecossistemas Node.js/Next.js devem obrigatoriamente utilizar estratégias de cache para `node_modules` e para o diretório `.next/cache`.
* **Dependency Pinning:** Proibido o uso de tags genéricas como `@latest` ou `@master`. Utilize sempre versões semânticas específicas (ex: `actions/checkout@v4`) para garantir a estabilidade do pipeline.
* **Conditional Execution:** Configurar `if:` statements para evitar que deploys de produção sejam executados em branches de desenvolvimento ou pull requests.

### 📝 3. Padronização e Legibilidade
* **Nomenclatura Descritiva:** Cada `step` (passo) do workflow deve possuir um atributo `name:` claro e em português, descrevendo a ação realizada.
* **Estrutura Modular:** Organizar o YAML em `jobs` distintos (ex: `lint`, `test`, `build`, `deploy`) para facilitar a visualização de falhas no dashboard do GitHub.
* **Fail-Fast Strategy:** Configurar o workflow para interromper imediatamente (`fail-fast: true`) caso qualquer etapa crítica de qualidade (lint ou testes) apresente erro.

---

### 🚀 Exemplo de Conformidade (Snippet)


```yaml
jobs:
  check-quality:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout do Repositório
        uses: actions/checkout@v4
      
      - name: Instalação do Node.js com Cache
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Instalar Dependências
        run: npm ci

      - name: Executar Linter
        run: npm run lint
```


### Prompt para criação do pipeline

- No painel Agent do Antigravity, abra uma nova conversa.
- Informe o seguinte prompt para a criação do pipeline de deploy:

```
# Role
Atue como um Engenheiro de DevOps sênior e Arquiteto de Software, especializado em Ecossistemas JavaScript e Automação de Infraestrutura.

Utilize:
- rule @github-uses.md,
- skill .agent/skills/github-api
- mcp server do github.

# Objetivo
Crie um arquivo de workflow do GitHub Actions (`.github/workflows/deploy.yml`) para um projeto **Next.js** que automatize o ciclo de vida de integração e entrega contínua (CI/CD).

# Contexto Técnico
- **Framework:** Next.js (versão mais recente).
- **Gerenciador de Pacotes:** [npm / yarn / pnpm] - *Escolha o de sua preferência*.
- **Destino de Deploy:** Vercel.

# Etapas do Workflow
1. **Trigger:** O workflow deve ser acionado em cada `push` na branch `main` e em todos os `pull_requests`.
2. **Setup:** Utilizar a versão LTS do Node.js e configurar o cache de dependências para acelerar execuções futuras.
3. **Qualidade:** Executar passos de `lint` e `test` (unitários/integração). O pipeline deve ser interrompido se houver falhas.
4. **Build & Deploy:** - Se for um `pull_request`, realizar um **Preview Deploy** na Vercel.
   - Se for um `push` na `main`, realizar o **Production Deploy**.
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


## Verificação da execução do pipeline

- No painel do GitHub, acesse o repositório do projeto.
- Clique na aba Actions.
- Verifique se o workflow deploy.yml foi criado com sucesso.
- Verifique se o workflow foi executado com sucesso.