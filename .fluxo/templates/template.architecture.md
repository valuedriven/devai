# Arquitetura de Software

## Contexto Arquitetural

### Objetivo

Este documento define a arquitetura de software do produto **[NOME_DO_PRODUTO]**, estabelecendo diretrizes técnicas, restrições arquiteturais e requisitos não funcionais para implementação por equipes humanas e agentes de inteligência artificial.

### Escopo

A arquitetura contempla:

* [Frontend]
* [Backend]
* [Banco de Dados]
* [Infraestrutura]
* [Segurança]
* [Observabilidade]
* [Integrações Externas]

### Arquitetura de Referência

* Estilo arquitetural: [ESTILO_ARQUITETURAL]
* Comunicação: [PROTOCOLO_E_FORMATO]
* Infraestrutura: [MODELO_DE_IMPLANTACAO]
* Observabilidade: [PADRAO_DE_OBSERVABILIDADE]
* Segurança: [PADRAO_DE_IDENTIDADE_E_ACESSO]

### Stack Tecnológica

#### Frontend

* Linguagem: [LINGUAGEM]
* Framework: [FRAMEWORK]
* Roteamento: [ROTEAMENTO]
* Estilização: [ESTILIZACAO]
* Bibliotecas adicionais: [OPCIONAL]

#### Backend

* Linguagem: [LINGUAGEM]
* Runtime: [RUNTIME]
* Framework: [FRAMEWORK]
* ORM/ODM: [ORM]

#### Banco de Dados

* SGBD: [BANCO_DE_DADOS]
* Versão mínima: [VERSAO]

#### Observabilidade

* Plataforma: [PLATAFORMA]

#### Identidade

* Provedor: [IDENTITY_PROVIDER]

#### Desenvolvimento

* Ferramentas: [FERRAMENTAS_DE_DESENVOLVIMENTO]

#### DevOps

* CI/CD: [FERRAMENTAS_CICD]
* Infraestrutura como código: [FERRAMENTA_IAC]

### Estrutura do Repositório

```text
[ESTRUTURA_DO_REPOSITORIO]
```

---

## Adequação Funcional

### Fonte Única de Verdade

* [DEFINIR_CAMADA_RESPONSAVEL_PELAS_REGRAS_DE_NEGOCIO]
* [DEFINIR_FONTE_UNICA_DE_VERDADE]

### Política de Comunicação entre Camadas

Todas as operações de negócio devem ocorrer através de:

* [CAMADA_DE_INTEGRACAO]

É proibido:

* [ACESSO_DIRETO_A_CAMADAS_INTERNAS]
* [ACESSO_DIRETO_A_BANCO]
* [ACESSO_DIRETO_A_SERVICOS_ADMINISTRATIVOS]

### APIs e Versionamento

Base URL:

```text
[URL_BASE_API]
```

Estratégia de versionamento:

```text
[PADRAO_DE_VERSIONAMENTO]
```

### Endpoints Públicos

* [RECURSO_PUBLICO_1]
* [RECURSO_PUBLICO_2]

### Endpoints Protegidos

* [RECURSO_PROTEGIDO_1]
* [RECURSO_PROTEGIDO_2]

### Contrato de API

* APIs devem ser versionadas
* APIs devem possuir documentação OpenAPI
* Payloads devem utilizar formato [FORMATO]
* Paginação para coleções
* Filtros e ordenação quando aplicáveis
* Backend como fonte única de verdade
* Regras de negócio não devem existir no frontend

### Estratégia de Tenancy

#### MVP

* [ESTRATEGIA_MVP]

#### Evolução Futura

* [ESTRATEGIA_FUTURA]

---

## Eficiência de Desempenho

### Comunicação entre Componentes

* [PROTOCOLO]
* [FORMATO]
* [REQUISITOS_DE_SEGURANCA]

### Rate Limiting

* Usuário anônimo: [LIMITE]
* Usuário autenticado: [LIMITE]

### Transações e Persistência

* [ESTRATEGIA_TRANSACIONAL]

### Estratégias Futuras de Escalabilidade

* [ESCALABILIDADE_1]
* [ESCALABILIDADE_2]
* [ESCALABILIDADE_3]

---

## Compatibilidade

### Integração

* [PADRAO_DE_INTEGRACAO]

### Formatos de Comunicação

* [FORMATOS_SUPORTADOS]

### Versionamento

* [ESTRATEGIA_DE_VERSIONAMENTO]

### CORS

* [POLITICA_CORS]

### Portabilidade

* [REGRAS_DE_PORTABILIDADE]

---

## Usabilidade

### Diretrizes Frontend

* [DIRETRIZ_1]
* [DIRETRIZ_2]
* [DIRETRIZ_3]

### Experiência de Autenticação

* [ESTRATEGIA_DE_AUTENTICACAO]

### Consistência de Interfaces

Permissões para Server Actions, Controllers ou mecanismos equivalentes:

* [REGRAS_PERMITIDAS]

Restrições:

* [RESTRICAO_1]
* [RESTRICAO_2]
* [RESTRICAO_3]

---

## Confiabilidade

### Tratamento de Erros

Padrão adotado:

* [PADRAO_DE_ERRO]

Exemplo:

```json
{
  "type": "...",
  "title": "...",
  "status": 400,
  "detail": "...",
  "instance": "..."
}
```

### Auditoria

Operações auditadas:

* [CREATE]
* [UPDATE]
* [DELETE]

Campos obrigatórios:

* [CAMPO_1]
* [CAMPO_2]
* [CAMPO_3]

### Migrations

* [POLITICA_DE_MIGRATIONS]

É proibido:

* [ALTERACOES_MANUAIS]
* [ALTERACOES_SEM_MIGRATION]

### Testes Automatizados

Ferramentas:

* Lint: [FERRAMENTA]
* Unidade: [FERRAMENTA]
* Integração: [FERRAMENTA]
* E2E: [FERRAMENTA]

### Cobertura Mínima

Backend:

* Linhas: [PERCENTUAL]
* Branches: [PERCENTUAL]

Frontend:

* Linhas: [PERCENTUAL]
* Branches: [PERCENTUAL]

### Critérios de Teste

Toda alteração de regra de negócio deve cobrir:

* Happy Path
* Sad Path
* Edge Cases

---

## Segurança

### Princípios Gerais

* [PRINCIPIO_1]
* [PRINCIPIO_2]
* [PRINCIPIO_3]

### Gestão de Identidade

Responsabilidades do provedor:

* [LOGIN]
* [LOGOUT]
* [RECUPERACAO]
* [MFA]
* [SESSAO]

### Autenticação

#### Fluxo

Frontend:

* [RESPONSABILIDADE_FRONTEND]

Backend:

* [RESPONSABILIDADE_BACKEND]

Identity Provider:

* [RESPONSABILIDADE_IDP]

Fluxo:

```text
[FLUXO_DE_AUTENTICACAO]
```

### Autorização

* [MODELO_DE_AUTORIZACAO]
* [ESTRATEGIA_RBAC_OU_ABAC]

### Papéis e Permissões

#### PAPEL_1

Pode:

* [PERMISSAO]

#### PAPEL_2

Pode:

* [PERMISSAO]

### Restrições do Frontend

É proibida a utilização de:

* [SDKS_PROIBIDOS]
* [COMPONENTES_PROIBIDOS]

### Proteção Contra Ameaças

#### Transporte

* [REQUISITOS_TLS]

#### Headers

* [HEADER_1]
* [HEADER_2]
* [HEADER_3]

#### Injeção

* [POLITICA_ANTI_INJECTION]

#### Controle de Acesso

* [POLITICA_IDOR]

### Segurança de Dados

* [REGRAS_DE_ACESSO_A_DADOS]

### Segurança de APIs

* [REQUISITOS_DE_AUTENTICACAO]
* [REQUISITOS_DE_AUTORIZACAO]

---

## Manutenibilidade

### Organização de Código

* [PADRAO_DE_ORGANIZACAO]

### Convenções de Desenvolvimento

* [CONVENCAO_1]
* [CONVENCAO_2]
* [CONVENCAO_3]

### Variáveis de Ambiente

* [ESTRATEGIA_DE_CONFIGURACAO]

É proibido:

* [RESTRICAO_1]
* [RESTRICAO_2]

### Diretrizes para Agentes de IA

Antes de qualquer alteração:

* Ler documentação arquitetural
* Avaliar impacto técnico
* Avaliar impacto de segurança
* Avaliar impacto de observabilidade
* Avaliar impacto em testes

Ao finalizar:

* Executar lint
* Executar testes
* Atualizar documentação
* Informar artefatos modificados

### Restrições Arquiteturais

* [RESTRICAO_1]
* [RESTRICAO_2]
* [RESTRICAO_3]

---

## Portabilidade

### Containers

* [PADRAO_DE_CONTAINER]

### Banco de Dados

Ambiente local:

* [ESTRATEGIA_LOCAL]

Ambiente de produção:

* [ESTRATEGIA_PRODUCAO]

### Independência de Fornecedor

* [REGRAS_DE_PORTABILIDADE]

### Infraestrutura

* [ESTRATEGIA_IAC]

---

## Observabilidade

### OpenTelemetry

Instrumentar:

* [REQUISITO_1]
* [REQUISITO_2]

Propagar:

* trace_id
* span_id
* request_id

### Tracing Distribuído

* [ESTRATEGIA_DE_CORRELACAO]

### Logs Estruturados

É proibido:

```text
console.log()
```

Campos mínimos:

* timestamp
* level
* service
* trace_id
* [OUTROS_CAMPOS]

### Métricas

* [ESTRATEGIA_DE_METRICAS]

---

## Evolução Planejada

### Infraestrutura

* [EVOLUCAO_1]
* [EVOLUCAO_2]
* [EVOLUCAO_3]

### Armazenamento

* [EVOLUCAO_ARMAZENAMENTO]

### Pagamentos

* [EVOLUCAO_PAGAMENTOS]

### Comunicação

* [EVOLUCAO_COMUNICACAO]

### Plataformas

* [EVOLUCAO_PLATAFORMAS]

### Funcionalidades

* [FUNCIONALIDADE_FUTURA_1]
* [FUNCIONALIDADE_FUTURA_2]

---

## Limites de Implementação do MVP

É proibido implementar:

* [ITEM_FORA_DO_ESCOPO_1]
* [ITEM_FORA_DO_ESCOPO_2]
* [ITEM_FORA_DO_ESCOPO_3]

Esses elementos pertencem exclusivamente a versões futuras do produto.

