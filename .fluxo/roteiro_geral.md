# Roteiro geral

Este repositório organiza o fluxo de desenvolvimento de uma solução de software conforme os requisitos definidos para o projeto, apoiada por agentes de inteligência artificial. Este documento é o ponto de entrada: apresenta o fluxo, as diretrizes gerais e os demais roteiros.

## Visão geral do fluxo

```mermaid
---
title: Visão geral do fluxo de desenvolvimento com IA
---
graph LR

    subgraph Discovery["Descoberta"]
        P[problem.md] --> PRD[prd.md]
        PRD --> S[spec.md]
        S --> A["architecture.md<br/>diagramas/"]
        A --> D["design.md<br/>prototypes/"]
    end

    subgraph Ambiente["Ambiente"]
        H[AGENTS.md, skills, MCP, hooks]
    end

    subgraph Delivery["Entrega"]
        B[backlog.md] --> C[changes]
        C --> I[Incremento testado]
        I --> L[Pipeline de CI/CD]
    end

    subgraph Deploy["Implantação"]
        N[IaC, recursos remotos, publicação]
    end

    subgraph Evolucao["Evolução"]
        O[Observabilidade, faixas, indicadores]
    end

    subgraph Migracao["Migração"]
        M[Contêineres OCI, ambiente completo]
    end

    D --> H
    H --> B
    L --> N
    N --> O
    O --> M
    O -. aprendizado .-> PRD
    O -. novas changes .-> B
```

## Roteiros

Os seis roteiros são executados **nesta ordem**. Cada um pressupõe o anterior concluído e verificado.

| # | Documento | Escopo |
| :---- | :---- | :---- |
| 1 | [Roteiro de Descoberta](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_discovery.md) | Da definição do problema ao desenho da interface |
| 2 | [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) | Agente instalado e configurado: regras, skills, MCP, hooks e subagentes |
| 3 | [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md) | Do backlog de mudanças ao pipeline de CI/CD com testes automatizados |
| 4 | [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md) | Provisionamento por código, recursos remotos, publicação e IaC no pipeline |
| 5 | [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md) | Observabilidade da solução e aspectos evolutivos do trabalho com agentes |
| 6 | [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md) | Versão final: contêineres OCI, ambiente completo por código e prova de reprodutibilidade |

Documentos de apoio, consultados a partir dos roteiros:

| Documento | Para que serve |
| :---- | :---- |
| [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md) | O que a solução precisa conter e atender, e a stack de referência |
| [Catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md) | O que cada ferramenta do ambiente faz, onde obter e como instalar |
| [Roteiros de plataforma](https://github.com/valuedriven/devai/tree/main/.fluxo/tarefas) | Passos próprios de cada plataforma, chamados pelos roteiros de implantação e de migração |

A configuração do agente é a mesma para os dois ambientes suportados, e está no Roteiro de Configuração do Ambiente. Quais ferramentas existem, o que cada uma faz e onde obtê-la estão no catálogo de ferramentas. As plataformas de cada etapa de implantação são declaradas nos requisitos da solução, e não aqui.

## Objetivos

* Clareza de escopo.
* Redução de ambiguidade.
* Consistência entre requisitos, design e implementação.
* Uso eficiente de modelos de IA como copilotos de desenvolvimento.

## Diretrizes gerais

* A saída de cada atividade é o contexto da atividade seguinte.
* Fornecer o contexto completo em um único prompt sempre que possível (one-shot prompting), em vez de distribuí-lo em várias mensagens.
* Usar documentos de exemplo já preenchidos nos prompts, referenciados por URL ou anexados, em vez de descrever a estrutura em palavras ou colar conteúdo.
* GitHub como fonte única de verdade em todo o fluxo.
* Markdown como língua franca entre pessoas e agentes.
* O que não está em arquivo no repositório não existe para o agente.
* Nenhuma mudança é concluída sem os testes correspondentes.

## Onde cada informação mora

A documentação é desacoplada em três camadas. Cada assunto tem um lugar só.

| Camada | Documento | Conteúdo |
| :---- | :---- | :---- |
| O que construir | Requisitos da solução | Requisitos funcionais e não funcionais, artefatos esperados e as plataformas de cada etapa de implantação |
| Como construir | Os seis roteiros, na ordem da tabela acima | Passo a passo, prompts, comandos e verificações |
| Com que ferramentas | Catálogo de ferramentas | O que cada ferramenta faz, onde obter e como instalar |
| Como configurar o agente | Roteiro de Configuração do Ambiente | MCP, skills, regras, hooks, subagentes e os passos próprios de cada agente |

Cada assunto tem um lugar só. Um passo que vale para qualquer agente fica no roteiro; um passo que muda conforme a ferramenta fica no roteiro de configuração do ambiente; o nome de uma plataforma ou de um agente fica no catálogo de ferramentas ou nos requisitos.

## Este repositório é um blueprint

Os documentos em `docs/` e a configuração deste repositório formam um **projeto de referência**: servem para mostrar a forma, a extensão e o nível de detalhe esperados de cada artefato, e são usados como exemplo nos prompts dos roteiros.

Cada pessoa que percorre o fluxo desenvolve um **projeto próprio**, com domínio próprio, problema próprio e requisitos funcionais próprios. O exemplo é referência de forma, nunca de conteúdo: reaproveitar o domínio deste repositório, que é um micro-commerce, descaracteriza o percurso.

## Documentos de exemplo

Os documentos do projeto de referência servem como exemplo preenchido de cada artefato. Os prompts dos roteiros os referenciam **por URL**: o modelo abre e lê o documento, sem que seja necessário colar o conteúdo.

* [problem.md](https://github.com/valuedriven/devai/blob/main/docs/problem.md)
* [prd.md](https://github.com/valuedriven/devai/blob/main/docs/prd.md)
* [spec.md](https://github.com/valuedriven/devai/blob/main/docs/spec.md)
* [architecture.md](https://github.com/valuedriven/devai/blob/main/docs/architecture.md)
* [design.md](https://github.com/valuedriven/devai/blob/main/docs/design.md)
* [diagramas/](https://github.com/valuedriven/devai/tree/main/docs/diagramas) — modelos de contexto, contêineres, componentes, código, implantação e pipeline
* [ada.md](https://github.com/valuedriven/devai/blob/main/docs/ada.md) — análise de decisão arquitetural, produzida no roteiro de migração
