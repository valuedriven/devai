# Diretrizes para Elaboração de um AGENTS.md Efetivo

O `AGENTS.md` não é uma documentação para humanos, mas sim **um conjunto de instruções operacionais carregado no contexto do agente durante o tempo de execução**. Um arquivo bem escrito atua como um "upgrade" do modelo de IA e pode reduzir bugs gerados pelo agente em 35% a 55%, enquanto um arquivo mal escrito pode prejudicar o desempenho do agente.

## 1. Exemplo de prompt para ajudar na criação e/ou validação do AGENTS.md

```bash
Crie ou ajuste o AGENTS.md para incluir as seguintes informações:

- Comportamento geral (com base nas diretrizes de Andrej Karpathy disponíveis em https://github.com/multica-ai/andrej-karpathy-skills/blob/main/CLAUDE.md>)
- Stack tech resumida (com base na especificação técnica do projeto)
- Estrutura do monorepo (com base na especificação técnica do projeto)
- Comandos
   - Setup inicial
   - build
   - run
   - banco de dados
- Regras de qualidade e testes (com base na especificação técnica do projeto)
- Regras de governança e autonomia no terminal
- Regras de aprendizado contínuo (feedback ao final de cada mudança)
- Referências de documentação do projeto (pasta @docs)
- Busca atualizada de informações por meio do mcp serve do context7

Valide o AGENTS.md com as diretrizes disponíveis em <https://github.com/valuedriven/devai/.fluxo/concepts/agents-md-guidelines.md>
```

---

## 2. Diretrizes

### Princípios de Ouro (O que funciona)

*   **Escreva políticas operacionais, não prosa:** O agente não precisa entender o *porquê* de uma regra arquitetural, ele precisa saber o *como* executá-la. Evite parágrafos descritivos e substitua-os por comandos executáveis eSnippets de código reais de 3 a 10 linhas.
*   **Mantenha o tamanho sob controle:** Limite o arquivo a no máximo **150 linhas** (ou menos de 32 KiB) e cada seção a menos de 50 linhas. Arquivos gigantes ou que referenciam dezenas de outros documentos causam a perda de foco do agente (conhecida como *overexploration*) e aumentam os custos de inferência sem ganhos de qualidade.
*   **Use a revelação progressiva e escopo de diretório:** Mantenha um `AGENTS.md` na raiz com regras gerais e crie arquivos `AGENTS.md` específicos dentro de subdiretórios ou pacotes. O agente sempre dará precedência ao arquivo mais próximo do diretório em que está trabalhando.
*   **Defina "Critérios de Conclusão" (Closure):** Agentes costumam reportar que terminaram uma tarefa sem verificá-la. Defina que o "feito" exige a execução de verificações específicas (ex: "só considere pronto quando o comando `pytest` retornar saída zero").

---

### Estrutura Prioritária Recomendada

A ordem das seções importa. Construa seu arquivo priorizando o que destrava a capacidade do agente de agir e verificar seu próprio trabalho:

1.  **Comandos Executáveis (Commands-First):** Forneça as invocações exatas. Não diga apenas "usamos pytest" ou "faça o lint". Escreva o comando exato que o agente deve usar: `ruff check . --fix --select E,W,F` ou `npm run build`.
2.  **Limites e Regras de Segurança (Boundaries):** Use um modelo de três camadas altamente eficaz:
    *   *Always do (Sempre faça):* Ações autônomas que não exigem confirmação.
    *   *Ask first (Pergunte primeiro):* Ações que exigem autorização do usuário antes da execução (ex: alterar esquemas de banco de dados).
    *   *Never do (Nunca faça):* Regras rígidas incontornáveis. Seja específico, como "Nunca exponha variáveis das colunas `user_email` ou `ssn`", em vez de um vago "não cometa erros".
3.  **Workflows Processuais:** Para tarefas complexas de rotina, crie listas numeradas com o passo a passo. Isso tira o agente da incerteza e o leva direto a soluções corretas.
4.  **Tabelas de Decisão:** Para resolver ambiguidades arquiteturais (ex: quando usar React Query vs Zustand), crie uma tabela de decisão simples que force a escolha correta antes do agente começar a escrever código.

---

### Diretrizes Específicas para Agentes de Dados

Quando seu agente precisa interagir com bancos de dados de produção, o `AGENTS.md` não deve depender da "memória" humana, que fica desatualizada rápido.
*   **Fontes de Dados Certificadas:** Liste apenas nomes de tabelas e versões de schemas oficiais.
*   **Restrições de PII:** Identifique explicitamente colunas com informações pessoais e sensíveis na seção *Never do*.
*   **Conecte a Catálogos de Dados:** Em vez de escrever essas seções manualmente, automatize o CI/CD para consultar APIs do catálogo de dados e auto-gerar esta seção do `AGENTS.md`, garantindo atualizações contínuas de governança.

---

### Anti-padrões: O que EVITAR a todo custo

*   **Gerar o arquivo inteiro com LLMs:** Usar IA para gerar as regras geralmente produz diretivas vagas, instruções genéricas que duplicam o conhecimento prévio da IA ("escreva código limpo") e pode reduzir ativamente a taxa de sucesso das tarefas em comparações com não ter nenhum contexto.
*   **Diretivas ambíguas:** Palavras como "com cuidado", "quando possível" ou "de forma elegante" não são processáveis pela IA. Elas leem isso como orientação humana genérica e ignoram.
*   **Prioridades contraditórias:** Se você pedir "código perfeito com testes completos", mas também "faça o mais rápido possível", a IA irá pular os testes. Numere suas prioridades para resolver conflitos (ex: "Prioridade 1: Testes passando. Prioridade 2: Rapidez").
*   **Listas de "Não faça" sem alternativas:** Se você listar 15 restrições no estilo "Não faça X" sem oferecer um caminho viável alternativo ("Use Y"), o agente entrará em paralisia e excesso de exploração, tentando validar cada aviso. Pareie todo aviso com uma ação concreta de alternativa.

---
