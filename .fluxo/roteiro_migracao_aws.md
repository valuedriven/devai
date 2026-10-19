# Roteiro de Migração para a AWS

Sexta e última etapa do fluxo, executada depois do [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md). Ela leva a solução das plataformas gerenciadas do MVP para a **versão final na AWS**, atendendo integralmente ao RNF-06 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md).

| Escopo | Resultado |
| :---- | :---- |
| Entra | Ambiente AWS configurado, análise de decisão arquitetural, empacotamento OCI, infraestrutura descrita em Terraform, pipeline capaz de recriar o ambiente do zero |
| Não entra | Nada: esta é a última etapa do fluxo |

Execute-a somente depois que o MVP estiver publicado, com os fluxos validados e a observabilidade respondendo às perguntas de verificação.

---

## 1. Por que a segunda etapa de implantação existe

O MVP valida os fluxos de negócio, mas apoia-se em plataformas gerenciadas. Isso atende à entrega rápida e deixa em aberto a portabilidade, a implantação automatizada e a recriação completa de ambientes.

A **AWS é a referência desejada** para a versão final: contêineres compatíveis com o padrão OCI, infraestrutura descrita em Terraform e pipeline capaz de recriar o ambiente do zero.

Plataformas gerenciadas removem decisões de infraestrutura. Esse é o seu valor e também o seu limite: removem decisões que, em algum momento, precisam poder ser tomadas. Esta etapa é o momento de tomá-las.

Três camadas não mudam: identidade, observabilidade e a tecnologia do banco relacional — este troca de hospedagem, não de tecnologia. O código da aplicação, em geral, também não muda: o que muda é onde ela executa e como o ambiente é criado.

---

## 2. O que a migração cobre

| Etapa | Resultado |
| :---- | :---- |
| Configuração do ambiente AWS | Credenciais, servidores MCP da AWS e skills de implantação configurados no agente |
| Análise de decisão arquitetural | `docs/ada.md`, comparando arquiteturas candidatas e definindo o plano de evolução incremental |
| Empacotamento | Dockerfiles com build em múltiplos estágios, imagem base versionada e `.dockerignore` |
| Infraestrutura como código | Descrição Terraform do ambiente completo, com estado remoto e variáveis para o que muda entre ambientes |
| Implantação | Pipeline estendido com build da imagem, `terraform plan` e `terraform apply`, autenticando por OIDC |
| Prova de reprodutibilidade | Ambiente destruído e recriado pelo pipeline, com registro do que exigiu intervenção manual |

O passo a passo detalhado de cada etapa está em [Configuração para interação com AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/configuracao_aws.md).

Trate cada etapa como uma mudança do OpenSpec, seguindo o ciclo da seção 7 do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md).

---

## 3. Cuidados

> O arquivo de estado do Terraform contém dados sensíveis e não vai para o Git. O comando `terraform destroy` apaga recursos de verdade, então leia o plano antes de aplicar. Segredos vêm de variáveis, nunca escritos nos arquivos `.tf`.

> O termo *provider* no Terraform designa um plugin de infraestrutura. Não tem relação com os providers de modelos de IA configurados no [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md).

> A infraestrutura já está no pipeline desde o Roteiro de Implantação, mas cobrindo apenas a hospedagem. Aqui ela passa a cobrir o ambiente completo, e o `plan` na proposta de mudança deixa de ser conveniência para ser a única forma de saber o que um merge vai destruir.

---

## 4. A prova que encerra o fluxo

A migração não termina quando a aplicação sobe na AWS. Termina quando o ambiente é **destruído e recriado pelo pipeline**, sem intervenção manual.

* Execute a destruição e a recriação completa em ambiente de ensaio.
* Registre cada intervenção manual que tiver sido necessária.
* Cada intervenção registrada é uma lacuna na infraestrutura como código: transforme-a em uma nova mudança no backlog.

> Enquanto houver um passo que só uma pessoa sabe executar, a recriação do ambiente é uma intenção, não uma capacidade. É esse teste que distingue infraestrutura descrita de infraestrutura automatizada.

---

## 5. Verificação final da migração

* [ ] Ambiente AWS configurado, com credenciais e skills de implantação no agente
* [ ] `docs/ada.md` versionado, com as arquiteturas candidatas comparadas
* [ ] Imagens OCI construídas em múltiplos estágios, com imagem base versionada
* [ ] Ambiente completo descrito em Terraform, com estado remoto e variáveis por ambiente
* [ ] Pipeline com build da imagem, `plan` e `apply`, autenticando por OIDC
* [ ] Ambiente destruído e recriado pelo pipeline, com as intervenções manuais registradas
* [ ] Cada intervenção manual convertida em mudança no `backlog.md`
* [ ] Fluxos de negócio percorríveis na versão final, com a identidade preservada
* [ ] `docs/ai-log.md` com o registro da migração

Concluída a migração, a solução atende integralmente ao RNF-06 e o fluxo está encerrado.
