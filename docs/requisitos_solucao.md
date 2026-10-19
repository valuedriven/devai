# Requisitos da Solução

Este documento descreve **o que a solução precisa conter e atender**. É a referência de requisitos consumida pelos roteiros: a descoberta parte dele para produzir o `prd.md` e o `spec.md`; a entrega, a implantação e a evolução verificam o seu atendimento.

Os requisitos funcionais próprios de cada solução não estão aqui: eles nascem do problema escolhido e são registrados em `docs/prd.md` e `docs/spec.md`. Aqui ficam apenas os que valem para qualquer solução construída por este fluxo.

| Procuro saber… | Consulto |
| :---- | :---- |
| O que a solução precisa atender | Este documento |
| Que ferramentas existem e onde obtê-las | [Catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md) |
| Como fazer, com prompts e comandos | [Roteiro Geral](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_geral.md) e os roteiros que ele indexa |

---

## 1. Natureza da solução

A solução é uma **aplicação web completa**, com frontend e backend, mantida em repositório monolito (monorepo) e construída e evoluída com apoio de agentes de inteligência artificial em todas as etapas do ciclo de vida.

O domínio e o problema são próprios de cada solução, definidos em `docs/problem.md`. A escolha do domínio tem uma consequência técnica: não sendo possível avaliar criticamente o que o modelo produz sobre ele, não há como verificar o resultado, e os requisitos de verificação deste documento deixam de ter quem os aplique.

---

## 2. Artefatos esperados

| Artefato | Arquivo | Etapa |
| :---- | :---- | :---- |
| Definição do problema | `docs/problem.md` | Descoberta |
| Definição dos requisitos do produto, com roadmap | `docs/prd.md` | Descoberta |
| Especificação funcional | `docs/spec.md` | Descoberta |
| Arquitetura de software | `docs/architecture.md` | Descoberta |
| Modelos de contexto, contêineres, componentes, código e implantação | `docs/diagramas/` | Descoberta |
| Design system e protótipos | `docs/design.md`, `docs/prototypes/` | Descoberta |
| Configuração do agente | `apm.yml`, `AGENTS.md`, skills, servidores MCP, hooks, subagentes | Configuração do ambiente |
| Backlog de mudanças e propostas | `openspec/backlog.md`, `openspec/changes/` | Entrega |
| Repositório monolito com código-fonte e demais artefatos | Repositório | Entrega |
| Testes automatizados de unidade, integração e aceite | Junto ao código, conforme a estrutura declarada na arquitetura | Entrega |
| Política de revisão | `REVIEW.md` | Entrega |
| Pipeline de CI/CD | `.github/workflows/` | Entrega |
| Infraestrutura como código | `infra/` | Implantação |
| Solução implantada, com URL e credenciais de demonstração por perfil | — | Implantação |
| Faixas de controle da telemetria | `ops/faixas.yaml` | Evolução |
| Registro de uso de IA e indicadores do ciclo | `docs/ai-log.md` | Todas |

O `docs/ai-log.md` acompanha todo o fluxo e registra os prompts relevantes, os modelos e providers utilizados, o que funcionou, o que falhou, as imprecisões identificadas e os ajustes aplicados. É ele que torna reprodutível uma cadeia de decisões tomada com apoio de modelos probabilísticos.

---

## 3. Requisitos funcionais

**RF-A — Fluxos de negócio ponta a ponta.** A solução deve implementar pelo menos **dois fluxos de negócio ponta a ponta completos**, atendendo às necessidades dos públicos-alvo definidos.

Um fluxo ponta a ponta entrega valor a um público-alvo definido, do gatilho ao desfecho, sem depender de outro fluxo para fazer sentido. Em um comércio eletrônico, na visão do cliente, um fluxo completo inicia-se no carrinho de compras e encerra-se quando é feita a avaliação do produto recebido.

Não são computados como fluxos os recursos que provêm informações parciais ou de apoio, como cadastros de categorias, tipos e similares.

**RF-B — Funcionalidade de inteligência artificial.** A solução deve incorporar pelo menos uma funcionalidade baseada em inteligência artificial, integrada aos fluxos de negócio do RF-A.

Como qualquer requisito funcional, ela é detalhada na interação com o usuário: o comportamento esperado, os dados de entrada, o tratamento de falha e os critérios de aceite ficam em `docs/prd.md` e `docs/spec.md`. Recursos de natureza semelhante, como blockchain ou IoT, são aceitáveis como alternativa.

Os demais requisitos funcionais são definidos no `docs/prd.md` e no `docs/spec.md`, a partir do problema escolhido.

---

## 4. Requisitos não funcionais obrigatórios

**RNF-01 — Compatibilidade e responsividade.** A solução deve ser acessível exclusivamente por navegadores web modernos compatíveis com HTML5, CSS3 e ECMAScript 2020 ou superior, e deve apresentar layout responsivo, garantindo uso adequado em diferentes tamanhos de tela.

**RNF-02 — Segurança.** A solução deve garantir autenticação e autorização por meio de integração com serviços externos, assegurando controle de acesso por perfis de usuário, bem como confidencialidade e proteção de dados sensíveis em trânsito e em repouso.

**RNF-03 — Interoperabilidade.** A solução deve expor suas funcionalidades exclusivamente por meio de APIs RESTful, utilizando os protocolos HTTP/HTTPS.

**RNF-04 — Observabilidade e rastreabilidade.** A solução deve implementar mecanismos de observabilidade conforme padrões abertos, permitindo o registro, a correlação e a consulta de eventos relevantes de execução, de forma a viabilizar monitoramento, auditoria e diagnóstico de falhas. Os limiares que caracterizam desvio de comportamento devem estar declarados em arquivo versionado, com a ação correspondente a cada nível de severidade.

**RNF-05 — Manutenibilidade e testabilidade.** A solução deve possuir testes automatizados de unidade, integração e aceite, implementados com frameworks adotados no mercado, de modo a facilitar manutenção, evolução do código e detecção precoce de falhas. Os testes devem executar no pipeline, com relatório de cobertura.

**RNF-06 — Portabilidade e implantação.** A solução deve permitir implantação em diferentes ambientes computacionais, suportando escalabilidade e alta disponibilidade. Deve ser empacotada em contêineres compatíveis com o padrão OCI e possuir implantação automatizada por meio de infraestrutura como código, utilizando ferramentas de automação e permitindo a recriação completa dos ambientes.

**RNF-07 — Persistência.** A solução deve utilizar mecanismos de persistência baseados em banco de dados relacional e/ou NoSQL.

**RNF-08 — Governança de código e configuração.** A solução deve utilizar mecanismos formais para declaração, versionamento e isolamento de dependências. As configurações da aplicação devem ser externalizadas por meio de variáveis de ambiente ou serviços especializados de configuração. O código-fonte e os demais artefatos devem ser mantidos em sistema de controle de versões distribuído e acessível via internet.

**RNF-09 — Verificação antes da integração.** Toda alteração deve passar por revisão antes de ser integrada, governada por política versionada no repositório que declare o que a revisão procura e como classifica a severidade dos achados. A aprovação não pode ser emitida por quem produziu a alteração, e a restrição deve ser garantida por proteção de branch exigindo os status checks de teste e de inspeção estática.

**RNF-10 — Acesso à solução publicada.** A solução publicada deve estar acessível por URL, com credenciais de demonstração previamente cadastradas para cada perfil de usuário previsto, permitindo percorrer os fluxos do RF-A sem preparação adicional.

---

## 5. Stack tecnológica de referência

Os requisitos das seções 3 e 4 são declarados sem amarrar tecnologia. Esta seção é a **instanciação de referência**: uma stack que os atende por inteiro, com o papel de cada peça e o requisito que ela endereça.

Ela não substitui a arquitetura. O `docs/architecture.md` é que registra as decisões, as alternativas consideradas e a rastreabilidade — e é ele, com o `prd.md` e o `spec.md`, que dá contexto ao agente para propor as mudanças. A stack abaixo entra na arquitetura como restrição de partida, não como decisão já justificada.

### 5.1 Composição

| Camada | Tecnologia | Papel |
| :---- | :---- | :---- |
| Frontend | **Next.js 16+** | Interface web responsiva, renderização e roteamento |
| Backend | **NestJS 11+** | API REST, regras de negócio e integração com serviços externos |
| ORM | **Prisma 7+** | Acesso a dados, migrações e esquema versionado |
| Banco de dados | **PostgreSQL 15+** | Persistência relacional |
| Identidade | **Clerk** | Autenticação, autorização e perfis de usuário |
| Observabilidade | **Grafana Cloud** | Coleta, correlação e consulta de logs, métricas e traces |
| Testes | **ESLint**, **Jest**, **Supertest**, **Playwright** | Inspeção estática, unidade, integração e aceite |
| Integração e entrega | **GitHub Actions** | Pipeline de CI/CD, com proteção de branch |
| Infraestrutura como código | **Terraform** | Provisionamento e recriação de ambientes |
| Implantação — MVP | **Vercel** (aplicação) e **Supabase** (banco) | Plataformas gerenciadas, para validação rápida |
| Implantação — versão final | **AWS** | Contêineres OCI e ambiente descrito por código |

A descrição e o endereço de cada ferramenta de desenvolvimento estão no [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md); as desta tabela pertencem à solução, e não ao ambiente.

### 5.2 Qual peça endereça qual requisito

| Requisito | Peça da stack | Como endereça |
| :---- | :---- | :---- |
| RNF-01 — Compatibilidade e responsividade | Next.js | Aplicação web moderna, com layout responsivo |
| RNF-02 — Segurança | Clerk, NestJS | Autenticação e perfis no provedor de identidade; autorização e validação de entrada na API |
| RNF-03 — Interoperabilidade | NestJS | API REST sobre HTTP/HTTPS, com contrato declarado |
| RNF-04 — Observabilidade e rastreabilidade | Grafana Cloud | Destino da instrumentação por padrões abertos, com correlação por requisição e os limiares declarados em arquivo versionado |
| RNF-05 — Manutenibilidade e testabilidade | ESLint, Jest, Supertest, Playwright | Inspeção estática, testes de unidade, de integração e de aceite, executados no pipeline |
| RNF-06 — Portabilidade e implantação | Terraform, AWS, contêineres OCI | Ambiente descrito por código e recriável; empacotamento portável |
| RNF-07 — Persistência | PostgreSQL, Prisma | Banco relacional com esquema e migrações versionados |
| RNF-08 — Governança de código e configuração | Repositório Git, variáveis de ambiente | Dependências declaradas e travadas; configuração externalizada; artefatos versionados |
| RNF-09 — Verificação antes da integração | GitHub Actions | Status checks obrigatórios e proteção de branch |
| RNF-10 — Acesso à solução publicada | Vercel, Clerk | URL pública e credenciais de demonstração por perfil |

> O RNF-04 e o RNF-05 são endereçados **pela presença das peças correspondentes na stack**, e não por um procedimento próprio nos roteiros: o Grafana Cloud recebe a instrumentação, e a stack de testes executa a verificação. A forma de implementar cada um é decidida na arquitetura e detalhada nas mudanças do backlog.

> O RF-A e o RF-B são requisitos funcionais, e por isso não aparecem nesta tabela. Eles são detalhados na interação com o usuário, em `docs/prd.md` e `docs/spec.md`. A stack não os determina.

### 5.3 Implantação em duas etapas

O RNF-06 é atendido em duas etapas sucessivas, e essa separação é intencional.

| Etapa | Objetivo | Roteiro |
| :---- | :---- | :---- |
| **MVP** | Validar os fluxos de negócio ponta a ponta com rapidez | [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md) |
| **Versão final** | Atender integralmente à portabilidade, à implantação automatizada e à recriação completa de ambientes | [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md) |

| Camada | MVP | Versão final |
| :---- | :---- | :---- |
| Hospedagem da aplicação | Vercel | AWS, com contêineres OCI |
| Banco de dados | Supabase, com PostgreSQL gerenciado | AWS, com o serviço de banco relacional definido na análise de decisão arquitetural |
| Identidade | Clerk | Clerk |
| Observabilidade | Grafana Cloud | Grafana Cloud |
| Infraestrutura como código | Terraform, limitado à hospedagem | Terraform, cobrindo o ambiente completo |

Plataformas gerenciadas aceleram a validação porque removem decisões de infraestrutura. Esse é o seu valor e também o seu limite: removem decisões que, em algum momento, precisam poder ser tomadas. A **AWS é a referência desejada** para a versão final, e a migração acontece depois que o MVP estiver validado.

Três camadas não mudam entre as etapas: **identidade, observabilidade e o banco relacional** — este troca de hospedagem, não de tecnologia. O código da aplicação, em geral, também não muda: o que muda é onde ela executa e como o ambiente é criado.

### 5.4 Substituição de peças

A stack é referência, não imposição. Trocar uma peça é legítimo, desde que a substituta atenda ao mesmo requisito e a troca seja registrada como decisão arquitetural no `docs/architecture.md`, com a alternativa descartada e a razão.

Duas consequências práticas de qualquer troca:

* **A skill correspondente muda.** A seção 5.5 associa cada peça a uma skill; skill de uma tecnologia que o projeto não usa ocupa contexto e orienta para o lugar errado.
* **A tabela de rastreabilidade da seção 6 muda.** O requisito continua obrigatório, e a forma de verificar o atendimento passa a ser outra.

### 5.5 Skills de stack declaradas ao agente

A configuração do agente instala, pelo APM, as skills correspondentes à stack, de modo que o agente gere código aderente a cada tecnologia. As publicadas pelos próprios fornecedores:

| Pacote | O que é instalado | Peça da stack |
| :---- | :---- | :---- |
| `vercel/next.js` | Pacote completo | Next.js, Vercel |
| `prisma/skills` | Pacote completo | Prisma, PostgreSQL |
| `supabase/agent-skills` | Pacote completo | Supabase |
| `hashicorp/agent-skills` | Pacote completo | Terraform |
| `clerk/skills` | `clerk-setup`, `clerk` | Clerk |

Skills de arquitetura, qualidade e automação, não ligadas a um fornecedor da stack: `sickn33/antigravity-awesome-skills` (`backend-architect`, `nestjs-expert`, `docker-expert`, `github-actions-templates`), `addyosmani/agent-skills` (`frontend-ui-engineering`, `code-review-and-quality`, `ci-cd-and-automation`) e `mattpocock/skills` (`improve-codebase-architecture`).

Skills de teste e gate de qualidade, do projeto de referência: `valuedriven/devai` (`jest-unit-tests`, `supertest-integration-test`, `playwright-e2e-tests`, `quality-gate`).

> Trocar uma peça da stack implica trocar o pacote correspondente. Skill de uma tecnologia que o projeto não usa ocupa contexto e orienta para o lugar errado: conferida a lista instalada, remova pelo manifesto o que não servir.

Os comandos de instalação estão na seção 2.3 do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md).

---

## 6. Rastreabilidade

Cada requisito não funcional obrigatório deve ter, em `docs/architecture.md`, a decisão arquitetural que o atende e a forma de verificar o atendimento. A tabela é produzida na descoberta e revisada sempre que a arquitetura mudar.

| Requisito | Onde se verifica |
| :---- | :---- |
| RF-A | Testes de aceite e percurso dos fluxos na solução publicada |
| RF-B | Critérios de aceite do `spec.md`, verificados na interação com o usuário |
| RNF-01, RNF-03, RNF-07 | Arquitetura, testes de integração e contrato da API |
| RNF-02, RNF-08 | Inspeção estática, hooks de garantia e configuração do repositório |
| RNF-04 | Perguntas de verificação da observabilidade, no [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md), respondidas com o que o sistema emite |
| RNF-05 | Suíte de testes em execução no pipeline, nos três níveis |
| RNF-06 | Ambiente destruído e recriado pelo pipeline, no [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md) |
| RNF-09 | Proteção de branch com os status checks exigidos |
| RNF-10 | URL e credenciais em uso por quem não participou da construção |

> Os roteiros são agnósticos quanto à forma de implementação: eles conduzem o ciclo, não prescrevem o código. O contexto de que o agente precisa para propor cada mudança vem do `prd.md`, do `spec.md` e do `architecture.md` — produzidos na descoberta a partir deste documento. Requisito que não esteja refletido nesses três artefatos não chega ao backlog.
