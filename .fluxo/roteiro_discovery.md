# Roteiro de Discovery

Pré-requisitos:
- Repositório criado no GitHub.

## 1.1 Definição do problema

Resultados:
- Definição do problema (problem.md)

Participantes:
- Gerente de produtos
- Cliente

Ferramentas:
- IA de uso geral (ChatGPT, Gemini, Claude, Kimi etc.)

Considerações:
 - Usar deepresearch para validar problema

--- 

### Atividades

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
- Definição do problema (problem.md) com a seguinte estrutura:

[Insira aqui o template disponível em https://github.com/valuedriven/devai/blob/main/.fluxo/templates/template.problem.md]
```

- Revise o documento e faça os devidos ajustes.
- Registre o resultado no arquivo docs/problem.md.

---

## 1.2 Refinamento

**Visão Geral**

Resultados:
- Definição do produto (prd.md)
- Especificação (spec.md)
- Arquitetura (architecture.md)

Participantes:
- Gerente de produtos
- Cliente
- Desenvolvedor
- Designer UX

Ferramentas:
- IA de uso geral (ChatGPT, Gemini, Claude, Kimi etc.)

Considerações:
- Solicitar IA para validar resultados

---

### Atividades

#### Definição do produto

- A partir da análise do problema, defina o produto a ser construido.
- Execute o seguinte prompt:

```
Atue como: Product Manager Sênior.

Objetivo: Ajude-me a criar o "Product Requirements Document" (PRD) para um novo produto de software.

Contexto:

[inclua aqui a descrição do problema]

Resultado esperado:
- Definição do PRD (prd.md) com a seguinte estrutura:

[Insira aqui o template disponível em https://github.com/valuedriven/devai/blob/main/.fluxo/templates/template.prd.md]
```

- Revise o documento e faça os devidos ajustes.
- Registre o resultado no arquivo docs/prd.md.

#### Especificação

- A partir da definição do produto, elabore uma especificação técnica
- Execute o seguinte prompt:

```
Atue como: Analista de requisitos

Objetivo: Ajude-me a criar a "Especificação Técnica do Produto" para um novo produto de software.

Contexto:

[inclua aqui a prd.md]

Resultado esperado:
- Definição da especificação (spec.md) com a seguinte estrutura:

[Insira aqui o template disponível em https://github.com/valuedriven/devai/blob/main/.fluxo/templates/template.spec.md]
```

- Revise o documento e faça os devidos ajustes.
- Registre o resultado no arquivo docs/spec.md.

#### Arquitetura

- A partir da definição do produto, elabore uma arquitetura do software
- Execute o seguinte prompt:

```
Atue como: Arquiteto de Software

Objetivo: Ajude-me a criar a "Arquitetura do Software" para um novo produto de software.

Contexto:

[inclua aqui a spec.md]

Resultado esperado:
- Definição da arquitetura (architecture.md) com a seguinte estrutura:

[Insira aqui o template disponível em https://github.com/valuedriven/devai/blob/main/.fluxo/templates/template.architecture.md]
```

- Revise o documento e faça os devidos ajustes.
- Registre o resultado no arquivo docs/architecture.md.


#### Revisão do refinamento

- Solicite a uma IA para revisar os documentos criados.
- Execute o seguinte prompt:

```
Revise os seguintes documentos:

<inclua aqui o arquivo prd.md>
<inclua aqui o arquivo spec.md>
<inclua aqui o arquivo architecture.md>
```

- Revise o relatório e faça os devidos ajustes nos documentos.
- Atualize os documentos com as revisões.
---

## 1.3 Desenho

**Visão geral**

Resultados:
- Protótipos
- Design system (design.md)

Participantes:
- Designer UX
- Desenvolvedor

Ferramentas:
- IA de uso geral (ChatGPT, Gemini, Claude, Kimi etc.)
- Ferramentas de prototipação (Stitch etc.)

Considerações:
- Solicitar IA para validar resultados

---

### Atividades


#### Definição de design system

- Utilize um arquivo de design system de sua preferência.
- Caso deseje, escolha dentre as opções disponíveis em https://getdesign.md/.
- Acesse o Stitch <https://stitch.withgoogle.com/>.
- Solicite a criação de um design system com base no arquivo disponível.
- Aguarde a conclusão.

#### Criação de protótipos

- Solicite a criação dos protótipos. Inclua os arquivos prd.md e spec.md como complemento ao prompt.
- Avalie os resultados gerados.

#### Exploração de recursos

- Selecione uma das imagens e explore o recurso Preview, New Tab.
- Selecione uma das imagens e explore o recurso Generate, Variations.
- Selecione todas as imagens e acesse o recurso Generate, Protótipos.
- Selecione o protótipo e o comando Interact.
- No menu superior, acione o comando Renomear projeto (ícone de lápis).
- Informe o nome do produto.

---
