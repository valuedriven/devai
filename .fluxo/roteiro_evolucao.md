# Roteiro de Evolução

Este roteiro cobre o que vem **depois do MVP**: a migração para a versão final, o fechamento do laço entre a telemetria de produção e o agente, e a mudança evolutiva em sistema existente.

Ele parte do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md), que vai do backlog de mudanças ao MVP publicado e verificado. Execute-o somente depois de concluir a verificação final daquele roteiro.

> O ciclo de mudança, a política de revisão e as ferramentas continuam os mesmos. Este roteiro não introduz ferramenta nova além do Terraform, já instalado nos pré-requisitos do Roteiro de Entrega.

| Documento relacionado | Para que serve |
| :---- | :---- |
| [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md) | Do backlog ao MVP publicado |
| [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md) | Implantação do MVP nas plataformas gerenciadas |
| [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md) | Instalação e configuração do agente |

---

## 1. Estratégia de implantação em duas etapas

A solução é implantada em duas etapas, e a primeira não é descartada pela segunda.

| Etapa | Objetivo | Plataformas | Onde é tratada |
| :---- | :---- | :---- | :---- |
| MVP | Validar os fluxos de negócio ponta a ponta com rapidez | Plataformas gerenciadas: Vercel, Supabase e Clerk | [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md), com os passos de plataforma no [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md) |
| Versão final | Atender integralmente aos requisitos de portabilidade e implantação | AWS, com contêineres OCI e Terraform | Seção 2 deste roteiro |

A **AWS é a referência desejada** para a versão final, e a migração acontece depois que o MVP estiver validado.

A versão final não descarta a primeira: o provedor de identidade continua o mesmo e o código permanece o mesmo. O que muda é onde a aplicação executa e como o ambiente é criado.

> A ordem importa. Migrar antes de validar os fluxos troca um problema conhecido — a portabilidade pendente — por um desconhecido: não se sabe se o que foi migrado funciona, porque nunca funcionou.

---

## 2. Migração para a versão final

O MVP valida os fluxos de negócio, mas apoia-se em plataformas gerenciadas. Isso atende à entrega rápida e deixa em aberto a portabilidade, a implantação automatizada e a recriação completa de ambientes.

A **AWS é a referência desejada** para a versão final: contêineres compatíveis com o padrão OCI, infraestrutura descrita em Terraform e pipeline capaz de recriar o ambiente do zero.

> **Esta migração é feita em roteiro específico:** [Configuração para interação com AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/tarefas/configuracao_aws.md). Execute-o somente depois que o MVP estiver publicado e com os fluxos validados.

O que o roteiro de migração cobre:

| Etapa | Resultado |
| :---- | :---- |
| Configuração do ambiente AWS | Credenciais, MCP servers da AWS e skills de implantação configurados no agente |
| Análise de decisão arquitetural | `docs/ada.md`, comparando arquiteturas candidatas e definindo o plano de evolução incremental |
| Empacotamento | Dockerfiles com build em múltiplos estágios, imagem base versionada e `.dockerignore` |
| Infraestrutura como código | Descrição Terraform do ambiente, com estado remoto e variáveis para o que muda entre ambientes |
| Implantação | Pipeline estendido com build da imagem, `terraform plan` e `terraform apply`, autenticando por OIDC |
| Prova de reprodutibilidade | Ambiente destruído e recriado pelo pipeline, com registro do que exigiu intervenção manual |

Dois avisos que valem antes de começar:

> O arquivo de estado do Terraform contém dados sensíveis e não vai para o Git. O comando `terraform destroy` apaga recursos de verdade, então leia o plano antes de aplicar. Segredos vêm de variáveis, nunca escritos nos arquivos `.tf`.

> O termo *provider* no Terraform designa um plugin de infraestrutura. Não tem relação com os providers de modelos de IA configurados no Roteiro de Configuração do Ambiente.

Ao final da migração, cada intervenção manual que tiver sido necessária é uma lacuna na infraestrutura como código. Transforme cada uma em uma nova mudança no backlog, pelo ciclo da seção 7 do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md).

---

## 3. Faixas de controle e laço fechado

A telemetria instalada na seção 9 do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md) informa. Falta ligá-la à ação: o monitoramento determinístico detecta a quebra de uma faixa e **só então** aciona o agente. A detecção não é delegada ao agente, que é caro como observador contínuo e, sendo probabilístico, pouco confiável como detector.

* Crie o arquivo `ops/faixas.yaml`, versionado no repositório:

```yaml
# Faixas de controle. Média e desvio padrão calculados sobre a janela declarada.
janela: 7d

faixas:
  - sinal: latencia_p95_api
    unidade: ms
    limiares:
      registrar: 1          # 1 desvio acima da média
      diagnosticar: 2
      propor: 3

  - sinal: taxa_erro_5xx
    unidade: proporcao
    limiares:
      registrar: 1
      diagnosticar: 2
      propor: 3

  - sinal: custo_infraestrutura_por_requisicao
    unidade: usd
    limiares:
      registrar: 1
      diagnosticar: 2
      propor: 3

  - sinal: saturacao_recurso_critico
    unidade: proporcao
    limiares:
      registrar: 1
      diagnosticar: 2
      propor: 2

revisao_das_faixas: mensal
```

* Os três níveis de autonomia, acionados pela severidade do desvio:

| Nível | O que acontece | Quem executa |
| :---- | :---- | :---- |
| Registrar | O desvio é anotado; o agente não é acionado | Monitoramento |
| Diagnosticar | O agente investiga em modo somente leitura e descreve a causa provável | Subagente explorador, declarado no Roteiro de Configuração do Ambiente |
| Propor | O agente abre uma mudança, ou executa procedimento já aprovado | Agente principal |

* Prompt de diagnóstico, para o nível correspondente:

```text
A faixa de @ops/faixas.yaml foi rompida no sinal <sinal>, em <nível> desvios.

Contexto: @docs/architecture.md, @ops/faixas.yaml

Investigue em modo somente leitura: consulte a telemetria, identifique as requisições
afetadas pelo identificador de correlação e descreva a causa provável.

Não altere nenhum arquivo. Não abra mudança. Entregue: sinal, janela afetada,
requisições de exemplo, causa provável e o que confirmaria a hipótese.
```

* Revise as faixas na periodicidade declarada. Faixa calibrada sobre dados antigos deixa de alertar; faixa calculada durante um período de degradação passa a tratar a degradação como normal.
* O agente **propõe**; a liberação permanece no portão humano, pelas razões da seção 8 do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md). A separação de responsabilidades não se suspende porque o gatilho foi automático.

#### Onde o achado de produção vai

| Natureza do achado | Destino |
| :---- | :---- |
| Defeito que exige alteração de comportamento | Mudança no `backlog.md`, pelo ciclo da seção 7 do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md) |
| Lacuna de verificação revelada pelo achado | Caso novo na suíte de testes do nível correspondente |
| Falha idêntica pela segunda vez | Ajuste de harness, pelo Roteiro de Configuração do Ambiente |

> É aqui que o laço se fecha: o sinal que veio da produção reabre a especificação, e o que começou no `problem.md` retorna como entrada de uma nova iteração.

---

## 4. Mudança evolutiva em sistema existente

Esta atividade testa a qualidade da documentação e do harness produzidos. O ganho vem de trabalhar sobre um sistema escrito por outra pessoa.

* Obtenha o repositório de outro projeto que siga este fluxo. Na falta dele, use o [projeto de referência](https://github.com/valuedriven/devai), cujo domínio é diferente do seu — o que preserva o essencial da verificação, que é depender só do que está escrito.
* Recrie o ambiente de desenvolvimento usando apenas o `README.md` e o setup documentado.
* Implemente uma pequena mudança evolutiva usando apenas `docs/`, `AGENTS.md`, `backlog.md` e `openspec/specs/`, sem consultar quem escreveu o sistema.
* Siga o ciclo completo: `/opsx-propose` → `/opsx-apply` → `/opsx-verify` → `/opsx-sync` → `/opsx-archive`.

Registre os atritos encontrados:

| Momento | Pergunta |
| :---- | :---- |
| Montagem do ambiente | Quanto tempo até rodar? O que faltou documentado? |
| Entendimento do domínio | O `problem.md` e o `prd.md` foram suficientes? |
| Localização do código | A arquitetura descrita corresponde ao que existe? |
| Comportamento atual | As specs de capacidade eram verdadeiras? |
| Uso do agente | O `AGENTS.md` deu contexto suficiente? |
| Testes | A suíte deu confiança para alterar? |

Em seguida, aplique a mesma leitura ao repositório próprio: cada atrito encontrado no projeto alheio provavelmente existe nele.

---

## 5. Refatoração assistida

* Refatore em passos pequenos, com a suíte verde entre eles.
* Não aceite refatoração e mudança de comportamento no mesmo diff.
* Desconfie se a suíte precisou ser ajustada para a refatoração passar: nesse caso, o comportamento mudou.

---

## 6. Verificação final da evolução

* [ ] `docs/ada.md` versionado, com as arquiteturas candidatas comparadas
* [ ] Imagens OCI construídas em múltiplos estágios, com imagem base versionada
* [ ] Ambiente descrito em Terraform, com estado remoto e variáveis para o que muda entre ambientes
* [ ] Pipeline estendido com build da imagem, `terraform plan` e `terraform apply`, autenticando por OIDC
* [ ] Ambiente destruído e recriado pelo pipeline, com as intervenções manuais registradas
* [ ] Cada intervenção manual convertida em mudança no `backlog.md`
* [ ] `ops/faixas.yaml` versionado, com limiares e níveis de autonomia declarados
* [ ] Faixas revisadas na periodicidade declarada
* [ ] Mudança evolutiva implementada em sistema existente, com os atritos registrados
* [ ] Atritos aplicados também ao repositório próprio, como mudanças no `backlog.md`
