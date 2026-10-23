# Roteiro de Evolução

Complemento do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md) para a atividade **Evolução**, executada depois do [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md). Ela cobre a **observabilidade da solução** e os **aspectos evolutivos do trabalho com agentes**: o laço fechado entre a telemetria de produção e o agente, a medição do próprio ciclo e a evolução de sistema existente a partir da sua documentação.

| Escopo | Resultado |
| :---- | :---- |
| Entra | Instrumentação e perguntas de verificação, `ops/faixas.yaml`, indicadores do ciclo, mudança evolutiva e síntese crítica |
| Não entra | Migração para a AWS, que é a etapa final e está no [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md) |

A sequência pressupõe a solução publicada e o pipeline com infraestrutura como código, conforme o Roteiro de Implantação: sem produção no ar não há telemetria, e sem telemetria não há laço a fechar.

| Pré-requisito | Onde é atendido |
| :---- | :---- |
| Aplicação publicada, com os fluxos percorríveis | [Roteiro de Implantação](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_deploy.md), seções 4 e 5 |
| Pipeline com `plan` e `apply` automatizados | Roteiro de Implantação, seção 6 |
| Conta na plataforma de observabilidade, com credenciais de ingestão | Seção 1 deste roteiro |

> O ciclo de mudança, a política de revisão e as ferramentas continuam os mesmos. Trate cada item como uma mudança do OpenSpec, seguindo o ciclo da seção 7 do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md).

---

## 1. Observabilidade da solução

A instrumentação precisa de um destino. Antes do prompt:

* Crie conta na plataforma de observabilidade declarada em `docs/architecture.md` — na stack de referência da seção 5 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md), o Grafana Cloud.
* Obtenha as credenciais de ingestão e acrescente-as ao `.env`, e as chaves correspondentes ao `.env.example`.
* Cadastre-as também como secrets do repositório, para que o ambiente publicado exporte telemetria.

```bash
# Plataforma de observabilidade — endpoint de ingestão e credencial
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_EXPORTER_OTLP_HEADERS=
```

> Os nomes acima são os do padrão aberto de telemetria, aceitos pela maioria das plataformas. Confirme no painel da escolhida como ela espera receber o endpoint e a credencial.

* Execute:

```text
/opsx-propose observabilidade

Contexto: @docs/architecture.md, @AGENTS.md

Requisitos:
- Instrumentação por padrões abertos: logs, métricas e traces.
- Exportação para a plataforma de observabilidade declarada em docs/architecture.md.
- Identificador de correlação atravessando a requisição, do frontend ao banco.
- Métricas por endpoint: contagem, latência e taxa de erro.
- Limiares de desvio declarados em arquivo versionado, com a ação de cada severidade.
- Não registrar dados pessoais: prefira metadados e hashes a conteúdo de requisições
  e respostas.
```

> Qual plataforma recebe a instrumentação é decisão da arquitetura, não deste roteiro. O que este roteiro exige é que as três perguntas a seguir tenham resposta.

Verifique a instrumentação tentando responder a estas três perguntas apenas com o que o sistema emite:

1. Um usuário relatou erro ao concluir o fluxo principal há dez minutos. O que aconteceu na requisição dele?
2. Qual a latência p95 do endpoint mais usado nas últimas vinte e quatro horas?
3. Qual endpoint concentra os erros do dia, e em que proporção das requisições?

Se alguma pergunta ficar sem resposta, a instrumentação está incompleta.

---

## 2. Faixas de controle e laço fechado

A instrumentação da seção 1 informa. Falta ligá-la à ação: o monitoramento determinístico detecta a quebra de uma faixa e **só então** aciona o agente. A detecção não é delegada ao agente, que é caro como observador contínuo e, sendo probabilístico, pouco confiável como detector.

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

## 3. Métricas do ciclo

Com o pipeline em produção, o repositório e a integração contínua já produzem o suficiente para medir o próprio processo. Medir apenas o que já existe é a regra aqui: nenhuma instrumentação adicional.

* Crie em `docs/ai-log.md` uma tabela com os cinco indicadores e atualize-a ao encerrar cada mudança:

| Indicador | Onde se obtém |
| :---- | :---- |
| Mudanças integradas na primeira passagem | Histórico de pull requests |
| Tempo da proposta até a integração | Registro do OpenSpec e do Git |
| Ciclos de retrabalho por mudança | Contagem de reaberturas |
| Sucesso de primeira passagem no pipeline | Registros da integração contínua |
| Custo em tokens por mudança | Telemetria do agente, instalada pela seção 4 do Roteiro de Configuração do Ambiente |

* Comandos úteis para a coleta:

```bash
# tempo entre abertura e integração das últimas vinte solicitações
gh pr list --state merged --limit 20 --json number,createdAt,mergedAt

# execuções do pipeline e o respectivo veredito
gh run list --limit 20 --json displayTitle,conclusion,createdAt
```

* Restrinja o indicador de **sucesso de primeira passagem** às mudanças escritas pelo agente: é esse recorte que mede a qualidade do harness. Se o número cai, algum guia ou sensor está faltando — e a resposta está na seção 4 do Roteiro de Configuração do Ambiente, **Contexto e custo**.
* O **custo em tokens por mudança** é o denominador do ganho. Sem ele, a afirmação de que o agente acelerou o trabalho não tem com o que ser comparada.

> As quatro medidas consagradas de desempenho de entrega — frequência de implantação, tempo de espera até a produção, tempo de restauração e taxa de falha de alteração — pressupõem uma equipe e um histórico. O conjunto acima é a redução viável para um projeto individual, e preserva o essencial: rendimento e estabilidade medidos separadamente.

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

## 6. Síntese crítica

Ao final, acrescente a `docs/ai-log.md` uma seção respondendo, com base nos registros feitos ao longo do fluxo:

* Onde a IA acelerou de verdade? Sustente a resposta com os indicadores do ciclo, da seção 3.
* Onde ela custou tempo?
* Que tipo de erro ela cometeu com mais frequência?
* O que melhorou quando o harness melhorou? Compare o sucesso de primeira passagem antes e depois dos ajustes da seção 4 do Roteiro de Configuração do Ambiente.
* Quanto custou, em tokens e em escolhas de modelo e provider?
* Quais políticas precisaram de hook, e por que a recomendação não bastou?
* O que continuou sendo trabalho humano?

---
---

## 7. Verificação final da evolução

* [ ] Credenciais da plataforma de observabilidade no `.env` e nos secrets do repositório
* [ ] Instrumentação respondendo às três perguntas de verificação com o que o sistema emite
* [ ] `ops/faixas.yaml` versionado, com limiares e níveis de autonomia declarados
* [ ] Faixas revisadas na periodicidade declarada
* [ ] Prompt de diagnóstico em uso, com o agente investigando em modo somente leitura
* [ ] Tabela de indicadores do ciclo em `docs/ai-log.md`, atualizada ao encerrar cada mudança
* [ ] Mudança evolutiva implementada em sistema existente, com os atritos registrados
* [ ] Atritos aplicados também ao repositório próprio, como mudanças no `backlog.md`
* [ ] `docs/ai-log.md` completo, com a síntese crítica

Concluída a evolução, a etapa final é o [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md).
