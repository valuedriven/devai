# Roteiro de Descoberta

Este roteiro descreve o passo a passo da descoberta do produto: da definição do problema ao desenho da interface. Ele produz os artefatos que o [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md) consome.

---

## Orientações gerais

### O projeto é seu; o repositório de referência é um blueprint

O repositório [valuedriven/devai](https://github.com/valuedriven/devai) traz um projeto completo, usado como **exemplo de forma**: mostra a estrutura, a extensão e o nível de detalhe esperados de cada artefato, e é citado diretamente nos prompts deste roteiro.

Ele não é o seu projeto. Você desenvolve uma solução própria, com domínio próprio, problema próprio e **requisitos funcionais próprios**. O domínio do exemplo é um micro-commerce: reaproveitá-lo descaracteriza o percurso, porque o valor está em decidir.

### Pré-requisitos

* Conta no GitHub, com repositório criado para o projeto.
* Acesso a pelo menos duas IAs de uso geral de fronteira (ChatGPT, Claude, Deepseek etc.) com recurso de pesquisa profunda (deep research) e capacidade de ler arquivos anexados e URLs.
* Acesso a ferramenta de prototipação (Google Stitch, OpenDesign etc.). Para maiores detalhes, verifique os roteiros para setup de ambiente [Antigraviy](https://github.com/valuedriven/devai/blob/main/.fluxo/setup_environment.md) ou [Opensource](https://github.com/valuedriven/devai/blob/main/.fluxo/setup_environment_opensource.md). 
* (Opcional) Documentação complementar com requisitos não funcionais ou outras definições.

### Como fornecer contexto aos prompts

**Nenhum prompt deste roteiro exige colar o conteúdo de um arquivo.** Há duas formas de fornecer contexto, e cada prompt indica qual usar:

| Forma | Quando usar | Como fazer |
| :---- | :---- | :---- |
| **Anexo** | Documentos do seu projeto e o documento de requisitos | Use o recurso de anexar arquivo da ferramenta de chat. Se a ferramenta não oferecer anexo e o seu repositório for público, informe a URL do arquivo. |
| **Link** | Documentos do repositório de referência, que são públicos | O prompt já traz a URL. O modelo abre e lê. |

> Confirme que o modelo de fato leu o que foi referenciado. Os prompts pedem que ele cite os títulos das seções do exemplo antes de produzir o resultado; se a citação não corresponder ao documento, ele não leu, e o resultado será inventado.

### Ajuste nos prompts

* Os prompts trazem valores entre os símbolos `<` e `>`. Substitua-os pelos valores do seu projeto antes de executar.
* O exemplo referenciado é referência de forma, não de conteúdo. Se o resultado vier parecido demais com o domínio do exemplo, peça ao modelo que refaça a partir do seu problema.

### Estrutura de arquivos ao final da descoberta

```text
├── docs
│   ├── problem.md
│   ├── prd.md
│   ├── spec.md
│   ├── architecture.md
│   ├── design.md
│   ├── diagramas/
│   ├── prototypes/
│   └── ai-log.md
```

### Registro de uso de IA

Mantenha o arquivo `docs/ai-log.md` ao longo de todo o fluxo. A cada atividade relevante, registre:

* o objetivo da interação;
* o modelo e o provider utilizados;
* o que funcionou e o que falhou;
* imprecisões ou invenções identificadas;
* o ajuste aplicado.

Esse registro é o que torna reprodutível uma cadeia de decisões tomada com apoio de modelos probabilísticos: sem ele, não há como saber qual modelo produziu qual artefato, nem por que uma decisão foi tomada.

---

## 1.1 Definição do problema

**Resultado:** `docs/problem.md`

**Ferramentas:** IA de uso geral com recurso de pesquisa profunda.

**Exemplo de forma:** <https://github.com/valuedriven/devai/blob/main/docs/problem.md>

### Atividades

#### Escolha do cenário

* Identifique um cenário em que haja um problema ou oportunidade a resolver.
* Prefira um domínio conhecido de perto. Sem esse conhecimento, não há como avaliar criticamente o que a IA produz.

#### Criação do problem.md

* Em uma IA de uso geral, execute o prompt a seguir.

```text
Prompt — Problem Statement

Papel: Atue como Product Manager Sênior, especialista em descoberta de produtos de software.

Objetivo: Elaborar uma sentença de problema clara, concisa e centrada na necessidade do usuário, para orientar o desenvolvimento posterior do produto apoiado por IA.

Entradas
- Público-alvo: <informar quem sente o problema>
- Atividades: <informar o que o público-alvo faz>
- Problemas/dores: <informar as dificuldades enfrentadas>
- Causas: <informar as causas dos problemas>
- Impactos: <informar os impactos gerados>
- Solução atual: <informar como o problema é tratado hoje>

Referência: Leia <https://github.com/valuedriven/devai/blob/main/docs/problem.md> antes de responder. Liste os títulos das seções encontrados para confirmar a leitura. Utilize o documento como referência de estrutura, estilo e nível de detalhe, sem reutilizar seu conteúdo.

Instruções:
- Elabore apenas a sentença que descreve o problema, sintetizando a dor e seu impacto no contexto do público-alvo.
- Não proponha soluções nem antecipe objetivos, funcionalidades, requisitos ou decisões técnicas.
- Não invente informações. Identifique suposições necessárias com `[SUPOSIÇÃO]`.
- Se a referência estiver inacessível ou faltarem informações essenciais, informe a limitação antes de prosseguir.

Saída: Apresente os títulos identificados na referência e, em seguida, o conteúdo de `problem.md`, em Markdown, contendo somente a sentença de problema. Respeite o leiaute do documento de referência.
```

* Confira se os títulos listados correspondem ao documento de exemplo. Se não corresponderem, o modelo não o leu: reexecute em uma ferramenta com acesso à web.
* Revise o documento e faça os devidos ajustes.
* Registre o resultado em `docs/problem.md`.

#### Validação do problema com pesquisa profunda

* Em uma IA de uso geral, acione o recurso de pesquisa profunda (deep research).
* **Anexe** o arquivo `docs/problem.md`.
* Execute o prompt a seguir.

```text
Pesquise e me diga se o problema descrito no arquivo anexo é documentado por fontes externas.

Para cada afirmação relevante, informe a fonte, a data e o grau de confiança.
Separe claramente o que é evidência encontrada do que é inferência sua.
Se não encontrar evidência, diga explicitamente que não encontrou.
```

* Abra pelo menos duas das fontes citadas e confirme que existem e que dizem o que foi afirmado. Links são um dos itens que os modelos mais inventam.
* Ajuste o `docs/problem.md` com o que a pesquisa revelou.
* Registre em `docs/ai-log.md` as fontes conferidas e eventuais invenções encontradas.

---

## 1.2 Definição do produto e especificação

**Resultados:** `docs/prd.md` e `docs/spec.md`

**Ferramentas:** IA de uso geral.

**Exemplos de forma:**

* <https://github.com/valuedriven/devai/blob/main/docs/prd.md>
* <https://github.com/valuedriven/devai/blob/main/docs/spec.md>

### Atividades

#### Criação do prd.md

* **Anexe** dois arquivos: `docs/problem.md` e a documentação complementar, caso existente.
* Execute o prompt a seguir.

```text
**Prompt — Criação do PRD**

**Papel:** Atue como Product Manager Sênior, especialista em descoberta e definição de produtos de software.

**Objetivo:** Criar o `prd.md`, definindo o produto, seus fluxos de negócio e o roadmap de evolução.

**Entradas:**
- `problem.md`: declaração do problema a resolver.
- (Opcional) Documentação complementar: requisitos não funcionais prévios e direcionamentos funcionais.

Leia integralmente os arquivos de entrada antes de elaborar o PRD. Em caso de conflito ou lacuna relevante, sinalize a questão em vez de inventar informações.

**Referência estrutural:** Abra e leia https://github.com/valuedriven/devai/blob/main/docs/prd.md. Antes do PRD, liste os títulos e subtítulos identificados. Utilize o exemplo como referência de estrutura, extensão e nível de detalhe, sem reutilizar seu conteúdo ou domínio de negócio. Se não conseguir acessá-lo, informe a limitação.

**Instruções:**
- Defina o produto e suas capacidades a partir do problema e dos documentos complementares fornecidos, respeitando todas as restrições obrigatórias.
- Estruture a seção de escopo como um **roadmap**, contemplando o MVP e as versões futuras. Para cada horizonte, informe: objetivo, fluxos de negócio contemplados, hipóteses a validar e itens fora do escopo.
- Não invente dados de mercado ou evidências. Identifique toda suposição necessária com `[SUPOSIÇÃO]`.
- Não introduza requisitos ou funcionalidades sem fundamento nas entradas. Diferencie requisitos obrigatórios de hipóteses ainda não validadas.
- Concentre-se nos requisitos e no comportamento esperado do produto, sem antecipar decisões detalhadas de implementação, que serão tratadas em `spec.md` e `architecture.md`.

**Resultado esperado:** Gere o arquivo `prd.md` em Markdown, preservando a estrutura e o nível de detalhe da referência. O arquivo deve conter somente o PRD, sem comentários sobre o processo de geração. Se o ambiente não permitir criar arquivos, apresente o conteúdo integral pronto para ser salvo como `prd.md`.

**Verificação final:** Confirme a aderência aos documentos de entrada, a coerência do roadmap e a identificação das suposições.
```

* Registre o resultado em `docs/prd.md`.

#### Criação do spec.md

A especificação é um bom momento para observar quanto a escolha do modelo muda o resultado, porque a tarefa é longa e estruturada o bastante para que as diferenças apareçam.

* Execute o prompt a seguir em cada um, sem alterar o texto entre as execuções.

```text
**Prompt — Criação do spec**

Atue como: Analista de requisitos.

Objetivo: criar a "Especificação Funcional" para um novo produto de software.

Contexto: os arquivos anexos.
- prd.md: o produto, incluindo a seção de escopo e roadmap.
- Documentação complementar.

Exemplo de forma: abra e leia o documento a seguir antes de responder.
https://github.com/valuedriven/devai/blob/main/docs/spec.md

Resultado esperado:
- Arquivo spec.md com a mesma estrutura, extensão e nível de detalhe do exemplo.
- O exemplo é referência de forma, não de conteúdo: não reaproveite o domínio dele.
- Todo requisito funcional deve ser rastreável a um item do PRD.
- Cada requisito funcional deve ter critérios de aceite verificáveis.
- Se algo no PRD estiver ambíguo, liste as ambiguidades ao final em vez de decidir sozinho.
- Antes do resultado, liste os títulos das seções do exemplo, para confirmar que o leu.
```

* Compare os resultados em quatro dimensões e registre a comparação em `docs/ai-log.md`:

| Dimensão | O que observar |
| :---- | :---- |
| Aderência à forma | Seguiu a estrutura do exemplo? |
| Qualidade | Rastreabilidade, critérios de aceite, ambiguidades identificadas |
| Custo | Tokens consumidos, quando a ferramenta informar |
| Tempo | Tempo até a resposta completa |

* Consolide a melhor versão, combinando trechos se fizer sentido, em `docs/spec.md`.

---

## 1.3 Arquitetura

**Resultado:** `docs/architecture.md`

**Exemplo de forma:** <https://github.com/valuedriven/devai/blob/main/docs/architecture.md>

### Atividades

#### Criação do architecture.md

* **Anexe** três arquivos: `docs/prd.md`, `docs/spec.md` e a documentação complementar.
* Execute o prompt a seguir.

```text
# Prompt — Criação da Arquitetura de Software

**Papel:** Atue como Arquiteto de Software Sênior, especializado em arquiteturas evolutivas, aplicações em nuvem e sistemas com inteligência artificial.

**Objetivo:** Criar o arquivo `architecture.md`, documentando a arquitetura técnica do produto e seu caminho de evolução do MVP até a versão final.

**Entradas:**
- `prd.md` e `spec.md`: definição do produto, escopo, fluxos de negócio e requisitos funcionais.
- Documentação complementar.

Leia integralmente os arquivos de entrada antes de definir a arquitetura. Preserve os requisitos e não introduza funcionalidades de negócio sem fundamento nos documentos.

**Restrições arquiteturais obrigatórias:**
- Organizar frontend e backend em um único repositório monorepo.
- Planejar duas etapas de implantação:
  1. **MVP**
  2. **Versão final**.

**Referência estrutural:** Abra e leia https://github.com/valuedriven/devai/blob/main/docs/architecture.md. Antes de elaborar a arquitetura, liste os títulos e subtítulos identificados. Utilize o documento como referência de estrutura, extensão e nível de detalhe, sem reutilizar seu conteúdo ou domínio. Se não conseguir acessá-lo, informe a limitação.

**Instruções:**
- Documente os componentes, suas responsabilidades, interfaces, dependências e principais interações.
- Inclua a visão de implantação do MVP e da versão final, além do caminho de migração entre as duas etapas.
- Inclua o modelo de dados, com entidades, atributos principais, relacionamentos e restrições relevantes, coerentes com os requisitos.
- Registre as principais decisões arquiteturais (ADRs), contendo contexto, decisão e consequências. Inclua alternativas relevantes quando necessário.
- Inclua uma tabela de rastreabilidade relacionando cada requisito não funcional obrigatório à decisão arquitetural que o atende e à forma de verificar seu atendimento.
- Justifique as principais escolhas tecnológicas e arquiteturais considerando os requisitos, as restrições e a evolução prevista.
- Identifique riscos, dependências externas, limitações e suposições relevantes com a marcação `[SUPOSIÇÃO]` quando aplicável.
- Não confunda decisões obrigatórias, impostas pelas entradas, com decisões propostas pelo arquiteto. Não invente requisitos para justificar escolhas técnicas.

**Resultado esperado:** Gere o arquivo `architecture.md` em Markdown, preservando a estrutura e o nível de detalhe da referência e acrescentando os elementos explicitamente exigidos neste prompt. Mantenha consistência entre componentes, modelo de dados, implantação, ADRs e requisitos não funcionais.

Se o ambiente não permitir criar arquivos, apresente o conteúdo integral pronto para ser salvo como `architecture.md`.

**Verificação final:** Confirme a cobertura dos requisitos, a viabilidade das duas etapas de implantação, o caminho de migração, a consistência do modelo de dados e a rastreabilidade dos requisitos não funcionais.
```

* Registre o resultado em `docs/architecture.md`.

#### Criação dos diagramas

Os modelos de contexto, contêineres, componentes, código e implantação ficam em arquivos separados, em `docs/diagramas/`, um por diagrama. Essa separação mantém o `architecture.md` legível e permite atualizar um diagrama isoladamente.

* **Anexe** dois arquivos: `docs/architecture.md` e `docs/spec.md`.
* Execute o prompt a seguir.

```text
Atue como: Arquiteto de Software.

Objetivo: criar os diagramas da arquitetura em Mermaid, usando a sintaxe C4 do Mermaid
(C4Context, C4Container, C4Component e C4Deployment).

Contexto: os arquivos anexos, architecture.md e spec.md.

Exemplos de forma: abra e leia os arquivos do diretório a seguir antes de responder.
https://github.com/valuedriven/devai/tree/main/docs/diagramas

Resultado esperado: um arquivo por diagrama, no diretório docs/diagramas/

- context.md              — diagrama de contexto
- conteiner.md            — diagrama de contêineres
- component_frontend.md   — componentes do frontend
- component_backend.md    — componentes do backend
- code_backend.md         — diagrama de código do backend
- deploy.md               — visão de implantação

Cada arquivo deve conter um título em nível 1 e um único bloco Mermaid.
```

* Confira a sintaxe dos diagramas: o modelo costuma gerar Mermaid que não renderiza. Abra cada arquivo no GitHub e verifique se o diagrama aparece.
* Acrescente ao `docs/architecture.md` uma seção que liste os diagramas e aponte para os arquivos.

#### Revisão de consistência da descoberta

* Inicie uma sessão nova, de preferência em um modelo diferente do que gerou os documentos.
* **Anexe** quatro arquivos: `docs/prd.md`, `docs/spec.md`, `docs/architecture.md` e a documentação complementar.
* Execute o prompt a seguir.

```text
Atue como: revisor técnico de requisitos e arquitetura.

Objetivo: identificar inconsistências entre os documentos da descoberta.

Contexto: os arquivos anexos.

Critérios:
1. Todo requisito funcional do PRD está detalhado na spec, e vice-versa.
2. O roadmap do PRD distribui os dois fluxos ponta a ponta e a funcionalidade de IA em
   horizontes coerentes.
3. Existem pelo menos dois fluxos de negócio ponta a ponta, sem contar cadastros de apoio.
4. Cada requisito não funcional obrigatório tem uma decisão arquitetural correspondente.
5. Todo componente da arquitetura atende a pelo menos um requisito.
6. Termos ambíguos, requisitos não testáveis ou decisões implícitas.

Formato de saída: tabela com as colunas
Documento | Trecho | Problema | Critério | Severidade (alta/média/baixa) | Correção sugerida.

Não reescreva os documentos; apenas aponte os problemas.
```

* Avalie cada apontamento em vez de aceitar o relatório inteiro. Aplique o que fizer sentido e registre em `docs/ai-log.md` os pontos de discordância e as razões.

---

## 1.4 Desenho

**Resultados:** `docs/design.md` e `docs/prototypes/`

**Ferramentas:** Stitch (<https://stitch.withgoogle.com/>), com OpenDesign (<https://open-design.ai/>) como alternativa open source.

**Exemplo de forma:** <https://github.com/valuedriven/devai/blob/main/docs/design.md>

### Atividades

#### Definição do design system

* Utilize um arquivo de design system de sua preferência. Se desejar, escolha dentre as opções disponíveis em <https://getdesign.md/>.
* Acesse a ferramenta de prototipação.
* Solicite a criação de um design system com base no arquivo escolhido.
* Aguarde a conclusão.

#### Criação de protótipos

* **Anexe** `docs/prd.md` e `docs/spec.md` ao prompt de criação dos protótipos.
* Solicite a criação dos protótipos das telas.
* Avalie os resultados gerados, confrontando cada tela com um critério de aceite da especificação.
* Explore os recursos da ferramenta: pré-visualização em nova aba, geração de variações, geração de protótipos a partir das telas selecionadas e o modo interativo.
* Refine as telas até que cubram os fluxos descritos na especificação.

#### Exportação obrigatória

* Exporte o design system para `docs/design.md`, usando o exemplo de forma como referência.
* Exporte as telas para `docs/prototypes/`, em HTML e imagens.
* Verifique se as telas exportadas cobrem os dois fluxos ponta a ponta, contemplam a funcionalidade de IA e atendem ao comportamento responsivo exigido pelo documento de requisitos.

---

## Verificação final da descoberta

Antes de passar para o Roteiro de Entrega, confirme:

* [ ] `docs/problem.md` validado com fontes externas conferidas
* [ ] `docs/prd.md` com seção de escopo funcionando como roadmap
* [ ] `docs/spec.md` com critérios de aceite verificáveis
* [ ] `docs/architecture.md` com ADRs, modelo de dados, visão de implantação em duas etapas e tabela de requisitos não funcionais
* [ ] `docs/diagramas/` com os modelos de contexto, contêineres, componentes, código e implantação, todos renderizando
* [ ] `docs/design.md` e `docs/prototypes/` exportados para o repositório
* [ ] `docs/ai-log.md` com os registros de cada atividade
* [ ] Relatório de revisão de consistência aplicado
* [ ] Comparação entre modelos registrada no `docs/ai-log.md`
