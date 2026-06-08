---
trigger: manual
---

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