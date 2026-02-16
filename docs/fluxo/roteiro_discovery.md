# Roteiro de Discovery

Pré-requisitos:
- Repositório criado no GitHub.

## 1.1 Definição do problema

- Identifique um cenário em que haja um problema ou oportunidade que você deseja resolver.
- Execute o seguinte prompt:

```
Atue como: Product Manager Sênior.

Objetivo: Ajude-me a criar a "Declaração de Problema" (Problem Statement) para um novo produto de software.

Contexto:
Cenário: [Insira o mercado, ex: Logística de última milha]
Persona: [Insira o usuário, ex: Motoboys autônomos]
A Dor: [Insira a dificuldade, ex: Dificuldade em comprovar entregas quando o app trava]
Impacto: [Insira a consequência, ex: Bloqueio na plataforma e perda de renda diária]
Solução Atual: [Insira o que fazem hoje, ex: Tiram prints da tela e mandam por e-mail para o suporte]

Resultado esperado:
- Definição do problema (problem_statement.md) com a seguinte estrutura:

# Declaração de Problema
## 1. Problema
[Descrição clara e concisa do problema]

## 2. Público-Alvo/Persona
[Descrição da persona que enfrenta o problema]

## 3. Objetivo
[Objetivo do produto]
```

- Revise o documento e faça os devidos ajustes.
- Registre o problema no arquivo docs/definicao_problema.md.

---

## 1.2 Refinamento

### Definição do produto

- A partir da análise do problema, defina o produto a ser construido.
- Execute o seguinte prompt:

```
Atue como: Product Manager Sênior.

Objetivo: Ajude-me a criar o "Product Requirements Document" (PRD) para um novo produto de software.

Contexto:

[inclua aqui a descrição do problema]

Resultado esperado:
- Definição do PRD (prd.md) com a seguinte estrutura:

# Definição de Requisitos do Produto (PRD)

## Descrição do produto

**Problema** [resuma o problema].

**Solução** [resuma a solução].

Para o **[público-alvo]** [ganhos para público-alvo].

Nossos Diferenciais:

- [listar diferenciais]

---

## Perfis de Usuário

[lista de usuários]

### [usuário 1]

- Problemas: [problemas do usuário 1]
- Objetivos: [objetivos do usuário 1]
- Dados demográficos: [dados demográficos do usuário 1]
- Motivações: [motivações do usuário 1]
- Frustrações: [frustrações do usuário 1]

---

## Principais Funcionalidades

[lista de funcionalidades]

### RFN-[número] [título da funcionalidade]

- [detalhes da funcionalidade]

Critérios de Aceitação:
- [critérios de aceitação]


---

## Requisitos Não Funcionais

[lista de requisitos não funcionais]


### RNF-[número] - [título do requisito]

[descrição do requisito]
---

## Métricas de Sucesso

[lista de métricas]

---

## Premissas e restrições

[lista de premissas e restrições]

## Escopo

[lista de entregas por versão, v1, v2 etc.]
```

- Revise o documento e faça os devidos ajustes.
- Registre o problema no arquivo docs/prd.md.

### Especificação técnica

- A partir da definição do produto, elabore uma especificação técnica
- Execute o seguinte prompt:

```
Atue como: Arquiteto de software

Objetivo: Ajude-me a criar a "Especificação Técnica do Produto" para um novo produto de software.

Contexto:

[inclua aqui a prd.md]

Resultado esperado:
- Definição da especificação técnica (spec_tech.md) com a seguinte estrutura:

# Especificação Técnica

## 1. Visão Geral Técnica

[objetivos do documento e público alvo]

---

## 2. Arquitetura de Referência

[decisões técnicas resumidas sobre Estilo arquitetural, Componentes principais, Serviço de observabilidade, Autenticação e autorização, Protocolos de Comunicação, Infraestrutura de deployment etc.]

---

## 3. Stack Tecnológica Recomendada

[identificação direta sobre tecnologias e respectivas versões para aspectos como frontend, 
backend, persistência, ORM, Integrações etc.]

---

### 4. Segurança

[detalhes de segurança como: Mecanismo de autenticação, Algoritmo, Access Token, Refresh token etc.]
---

### 5. Auditoria

[detalhes de auditoria]

---

## 6. APIs

[detalhes de APIs como Endpoint principal, Versionamento, Padrão de nomenclatura, Autenticação Endpoints públicos e protegidos etc.]

---

## 7. Tenancy

[detalhes de tenancy como Estratégia, Isolamento, Identificação, Migrações, Segurança etc.].

---

## 8. Diretrizes para Desenvolvimento Assistido por IA

[detalhes como a IA deve interpretar o documento].

--

## 9. Evolução Futura

[detalhes Evolução Futura].


```

- Revise o documento e faça os devidos ajustes.
- Registre o problema no arquivo docs/spec_tech.md.

### Especificação de UI

- A partir da definição do produto, elabore uma especificação de ui
- Execute o seguinte prompt:

```
Atue como: Designer de UX

Objetivo: Ajude-me a criar a "Especificação de UI" para um novo produto de software.

Contexto:

[inclua aqui a prd.md]

Resultado esperado:
- Definição da especificação de UI (spec_ui.md) com a seguinte estrutura:


# Especificação de UI

## Interfaces gráficas

[listagem das interfaces gráficas]

### INT-[identificador] - [título da interface gráfica]

- [tipo de contêiner (ex.: página, tabela, formulário etc.)]
- **Campos:** [lista de campos]
- **Botões:** [lista de botões]
- **Links:** [lista de links]
- **Considerações:** informações complementares relevantes

---

## Fluxo de Navegação

[listagem dos componentes visuais e fluxo de navegação]

---

---

## Diretrizes para IA

[detalhes de como a IA deve interpretar o documento].
```

- Revise o documento e faça os devidos ajustes.
- Registre o problema no arquivo docs/spec_ui.md.

### Revisão do refinamento

- Solicite a uma IA para revisar os documentos criados.
- Execute o seguinte prompt:

```
Revise os seguintes documentos:

<inclua aqui a prd.md>
<inclua aqui a spec_tech.md>
<inclua aqui a spec_ui.md>
```

- Revise o relatório e faça os devidos ajustes nos documentos.
- Atualize os documentos com as revisões.
---

## 1.3 Desenho

- Solicite a alguma IA para elaborar um prompt a ser usado na criação de protótipos:

```
Crie um arquivo markdown com um prompt para o papel de designer de UX que solicita a uma ferramenta de prototipagem como o Google Stitch criar templates de protótipos para um projeto.

Siga estritamente as informações providas pelos documentos:

<inclua aqui a prd.md>
<inclua aqui a spec_tech.md>
<inclua aqui a spec_ui.md>
```

- Acesse o Stitch <https://stitch.withgoogle.com/>.
- Selecione "Web" para o design.
- Selecione um modelo com melhor reasoning (ex.: 3.0 Pro).

- Informe o prompt criado anteriormente.
- Avalie os resultados gerados.
- Selecione uma das imagens e explore o recurso Preview, New Tab.
- Selecione uma das imagens e explore o recurso Generate, Variations.
- Selecione todas as imagens e acesse o recurso Generate, Protótipos.
- Selecione o protótipo e o comando Interact.
- No menu superior, acione o comando Renomear projeto (ícone de lápis).
- Informe o nome do produto.

---
