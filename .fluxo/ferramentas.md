# Ferramentas do ambiente de desenvolvimento

Catálogo das ferramentas citadas nos roteiros, agrupadas por categoria: o que cada uma faz e onde obtê-la.

| Categoria | Seção |
| :---- | :---- |
| Plataforma base | 1 |
| IA de uso geral | 2 |
| Agente de desenvolvimento | 3 |
| Acesso a modelos | 4 |
| Configuração do agente | 5 |
| Spec-driven development | 6 |
| Testes e qualidade | 7 |
| Integração, entrega e infraestrutura | 8 |
| Prototipação | 9 |

Duas regras valem para todo o catálogo:

* **Só a plataforma base e o APM são instalados fora do APM.** Servidores MCP e skills entram pelo manifesto `apm.yml` e pelos comandos `apm install`, reunidos na seção 2 do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md). Instalação avulsa produz divergência entre o que está declarado e o que está na máquina.
* **A stack da solução não está aqui** — frameworks, banco, plataformas de hospedagem e executores de teste. Ela é declarada na seção 5 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md) e registrada como decisão em `docs/architecture.md`.

---

## 1. Plataforma base

| Ferramenta | O que faz | Endereço |
| :---- | :---- | :---- |
| Node.js e npm | Runtime e gerenciador de pacotes exigidos pelas CLIs dos roteiros | <https://nodejs.org/> |
| Git | Controle de versão e árvores de trabalho para sessões paralelas | <https://git-scm.com/> |
| Docker e Docker Compose | Execução local dos serviços de apoio e dos contêineres do projeto | <https://docker.com/> |

---

## 2. IA de uso geral

Ferramentas de chat de uso geral, empregadas no Roteiro de Descoberta. É necessário acesso a **pelo menos duas, de fornecedores diferentes**, para a comparação de modelos prevista naquele roteiro.

Requisitos de uso: recurso de pesquisa profunda (*deep research*), leitura de arquivos anexados e leitura de URLs.

| Ferramenta | Endereço |
| :---- | :---- |
| ChatGPT | <https://chatgpt.com/> |
| Claude | <https://claude.ai/> |
| Gemini | <https://gemini.google.com/> |
| DeepSeek | <https://chat.deepseek.com/> |
| Kimi | <https://www.kimi.com/> |

> O roteiro pede que o modelo cite os títulos das seções do documento de referência antes de produzir o resultado. Ferramenta sem acesso à web não consegue fazê-lo, e o resultado vem inventado.

---

## 3. Agente de desenvolvimento

Escolha **um**. Os dois aceitam a mesma configuração, descrita no [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md).

| Ferramenta | O que faz | Identificador nas CLIs | Endereço |
| :---- | :---- | :---- | :---- |
| Google Antigravity | Agente de desenvolvimento com modelos da própria ferramenta | `antigravity` | <https://antigravity.google/> |
| OpenCode | Agente de desenvolvimento open source, com providers de modelos próprios | `opencode` | <https://opencode.ai/> |

Outras alternativas conhecidas: Claude Code, Cursor, Codex, Gemini CLI.

| Editor | O que faz | Endereço |
| :---- | :---- | :---- |
| VS Code | Editor que hospeda a extensão do OpenCode | <https://code.visualstudio.com/> |

---

## 4. Acesso a modelos

### Gateway

| Ferramenta | O que faz | Endereço |
| :---- | :---- | :---- |
| OmniRoute | Gateway auto-hospedado: centraliza as chaves dos providers, expõe um endpoint compatível com a API da OpenAI e troca de provider quando a cota de um se esgota | <https://github.com/diegosouzapw/OmniRoute> |

Alternativa de instalação em contêiner, para quem tiver dificuldade com o pacote npm:

```bash
docker run -d --name omniroute --restart unless-stopped --stop-timeout 40 \
  -p 20128:20128 -v omniroute-data:/app/data diegosouzapw/omniroute:latest
```

### Providers

Crie contas em **pelo menos dois**: o gateway troca de um para outro quando a cota se esgota.

| Tipo | Característica | Opções |
| :---- | :---- | :---- |
| Fabricante com API própria | Serve os próprios modelos | [Alibaba Model Studio](https://modelstudio.alibabacloud.com/) |
| Plataforma de inferência | Hospeda modelos de terceiros, com foco em desempenho ou catálogo | [Groq](https://groq.com/), [NVIDIA](https://build.nvidia.com/), [Ollama Cloud](https://ollama.com/) |
| Agregador hospedado | Um endpoint e uma chave para modelos de vários fabricantes | [OpenRouter](https://openrouter.ai/), [AgentRouter](https://agentrouter.org/), [OpenCode Zen](https://opencode.ai/br/zen), [OpenCode Go](https://opencode.ai/br/go) |

Critérios de escolha, além do preço: suporte a chamadas de ferramentas, sem o qual o modelo não serve para uso agêntico; tamanho da janela de contexto; latência; política de uso e retenção de dados; estabilidade da camada gratuita.

> Antes de enviar código e documentos do projeto, verifique o que o provider faz com o que recebe. Alguns planos gratuitos usam os dados enviados para treinamento.

Grupos de modelos que costumam funcionar bem para uso agêntico, priorizando as versões mais recentes e gratuitas: DeepSeek, Qwen, Kimi, GLM e MiniMax.

---

## 5. Configuração do agente

É a única ferramenta instalada fora do próprio APM, porque é ela que instala as demais.

| Ferramenta | O que faz | Endereço |
| :---- | :---- | :---- |
| APM — Agent Package Manager | Trata a configuração do agente como dependência versionada: um manifesto declara regras, skills, servidores MCP, hooks e subagentes, e um comando os implanta nos diretórios de cada ferramenta | <https://github.com/microsoft/apm> |

```bash
brew install apm                                              # macOS e Linux
pip install apm-cli                                           # qualquer sistema com Python
winget install --id Microsoft.APM --exact --source winget      # Windows
```

| Servidor MCP | Endereço |
| :---- | :---- |
| Context7 | <https://context7.com/> |
| OpenSpec | <https://openspec.dev/> |
| Playwright MCP | <https://github.com/microsoft/playwright-mcp> |

| Catálogo de skills | Endereço |
| :---- | :---- |
| skillsmp.com | <https://skillsmp.com/> |
| skills.sh | <https://skills.sh/> |
| awesome-copilot | <https://github.com/github/awesome-copilot> |

> Os três servidores MCP e as skills do projeto são registrados pelos comandos da seção 2.3 do Roteiro de Configuração do Ambiente, que gravam no `apm.yml`. Nenhum deles se instala à parte, e nenhum é declarado no manifesto à mão.

---

## 6. Spec-driven development

| Ferramenta | O que faz | Endereço |
| :---- | :---- | :---- |
| OpenSpec | Mantém especificações de capacidade e propostas de mudança versionadas, e instala comandos de ciclo nos diretórios do agente | <https://openspec.dev/> |

Alternativas conhecidas: BMAD, Spec-kit, GSD.

> Registrado como servidor MCP pelo APM, conforme a seção 2 do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md), cuja seção 2.6 também cobre a inicialização no projeto. O uso no fluxo — `config.yaml`, backlog e ciclo de mudança — está no [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md).

---

## 7. Testes e qualidade

| Ferramenta | O que faz | Endereço |
| :---- | :---- | :---- |
| Playwright | Automação de navegador para testes de aceite, com agentes de planejamento, geração e correção de testes | <https://playwright.dev/> |
| SonarQube | Inspeção estática de código, com gate de qualidade | <https://www.sonarsource.com/products/sonarqube/> |

> O Playwright entra de duas formas, e elas não se confundem. O **servidor MCP** dá ao agente o controle do navegador e é registrado pelo APM, conforme a seção 2 do Roteiro de Configuração do Ambiente. O **executor de testes** é dependência de desenvolvimento da aplicação e pertence à stack da solução, junto com os executores de unidade e de integração e o verificador de estilo, declarados na seção 5 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md).

> A geração dos prompts de teste está na seção 2.6 do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md). O uso do Playwright no fluxo — plano de testes, geração e ajuste dos casos — está no [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md).

As skills de teste e de gate de qualidade do projeto de referência são instaladas pelo APM, e estão listadas na seção 2 do Roteiro de Configuração do Ambiente.

---

## 8. Integração, entrega e infraestrutura

| Ferramenta | O que faz | Endereço |
| :---- | :---- | :---- |
| GitHub | Repositório, proteção de branch e ambientes com aprovação | <https://github.com/> |
| GitHub Actions | Integração e entrega contínuas | <https://docs.github.com/actions> |
| Terraform | Infraestrutura como código, com estado e plano de alteração | <https://developer.hashicorp.com/terraform/install> |

> *Provider* no Terraform designa um plugin de infraestrutura. Não guarda relação com os providers de modelos da seção 4.

---

## 9. Prototipação

| Ferramenta | O que faz | Endereço |
| :---- | :---- | :---- |
| Stitch | Prototipação hospedada de telas, usada no Roteiro de Descoberta | <https://stitch.withgoogle.com/> |
| OpenDesign | Alternativa aberta, em aplicativo de desktop: as telas são descritas e um agente de código escreve o protótipo em HTML numa pasta do projeto | <https://open-design.ai/> |

| Catálogo | O que faz | Endereço |
| :---- | :---- | :---- |
| getdesign.md | Reúne arquivos de design system prontos, em Markdown, para servir de base ao protótipo | <https://getdesign.md/> |

Configuração do OpenDesign, quando for a ferramenta escolhida:

| Item | Como fica |
| :---- | :---- |
| Modo de execução | **Agente local**, selecionado na tela inicial, com o agente da seção 3 já instalado e autenticado. O modo de chave própria gera telas, mas não edita arquivos do projeto |
| Pasta do projeto | Uma pasta do repositório, de preferência `docs/prototypes/` |
| Design system | Um dos sistemas open source do catálogo, ou um criado a partir de um site, de um repositório ou de um arquivo do Figma |
| Privacidade | Coleta de dados de uso desativada em **Settings → Privacy** |
| Exportação | HTML autocontido, PDF e PNG; decks também em PowerPoint editável. Não há exportação para Figma |

* Requisitos: macOS 11 ou superior, ou Windows 10/11 em 64 bits. Não há binário publicado para Linux.

> A exportação para o repositório é obrigatória no fluxo: na construção, o agente enxerga apenas os arquivos versionados. Protótipo que permanece dentro da ferramenta não existe para ele.
