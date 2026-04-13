# Configuração para interação com AWS

## Pré-requisitos: Instalação do `uv`

Os servidores MCP da AWS são baseados em Python e requerem o gerenciador de pacotes `uv`. 

- Instale-o seguindo as instruções disponíveis em: <https://docs.astral.sh/uv/getting-started/installation/>.
- Execute o comando `uv --version` para verificar se a instalação foi bem sucedida.

## Configuração de variáveis de ambiente

Para interagir com a AWS, é necessário configurar as credenciais.
- Obtenha as credenciais a partir de uma sessão do AWS Learner Lab.
- Configure as variáveis de ambiente com as credenciais obtidas:


```bash
export AWS_ACCESS_KEY_ID=[colocar a chave de acesso]
export AWS_SECRET_ACCESS_KEY=[colocar a chave secreta]
export AWS_SESSION_TOKEN=[colocar o token de sessão]
export AWS_DEFAULT_REGION=[colocar a região]
```

- Inclua as variáveis também no arquivo .env, de forma que o agente consiga acessá-las.


## Configuração de MCP servers

Configure os MCP servers no seu cliente incluindo o seguinte conteúdo no arquivo de configuração do seu cliente.


```json
{
  "mcpServers": {
    "awsiac": {
      "command": "uvx",
      "args": [
        "awslabs.aws-iac-mcp-server"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    },
    "awsknowledge": {
      "serverUrl": "https://knowledge-mcp.global.api.aws"
    },
    "awspricing": {
      "command": "uvx",
      "args": [
        "awslabs.aws-pricing-mcp-server"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    }
  }
}
```

## Configuração de skills

- Criar o diretório "deploy-aws" em ".agent/skills/".
- Copiar o arquivo https://github.com/awslabs/agent-plugins/blob/main/plugins/deploy-on-aws/skills/deploy/SKILL.md para o diretório criado.
- Criar o diretório "references" em ".agent/skills/deploy-aws".
- Copiar os arquivos de https://github.com/awslabs/agent-plugins/tree/main/plugins/deploy-on-aws/skills/deploy/references para o diretório criado.



## Análise de decisão arquitetural

- Acesse o Google Antigravity.
- Acesse o painel Agent
- Acione a opção Start a new conversation.
- Priorize modelos com maior capacidade de processamento.
- Execute o seguinte comando:

```bash
# AWS Architecture Decision Prompt (ADP)

## Contexto

Você é um **Arquiteto de Cloud Sênior especializado em AWS e arquiteturas cloud-native**.

Sua tarefa é realizar uma **análise de decisão arquitetural (Architecture Decision Analysis)** para implantar uma aplicação full-stack na AWS.

A proposta deve considerar **restrições educacionais e de custo**, garantindo que a arquitetura seja **compatível com os serviços disponíveis no AWS Learner Labs**.

A resposta deve produzir **três cenários arquiteturais progressivos**, permitindo evolução incremental da infraestrutura.


------------------------------------------------------------------------

## Documentação de referência

- `docs/prod.md`
- `docs/spec_tech.md`
- `docs/spec_ui.md`

Resultado
- `docs/ada.md`

## Objetivo da Arquitetura

Projetar uma arquitetura AWS que:

-   suporte aplicações **containerizadas**
-   permita **evolução incremental**
-   minimize **complexidade operacional**
-   seja **compatível com Terraform**
-   utilize **boas práticas do AWS Well-Architected Framework**

------------------------------------------------------------------------

## Restrições Técnicas

A arquitetura proposta deve:

-   utilizar **serviços disponíveis em AWS Learner Labs**
-   suportar **containers Docker**
-   permitir **deploy automatizado**
-   utilizar **registry de imagens** em todos cenários de implementação
-   suportar **infraestrutura como código com Terraform**
-   operar inicialmente com **baixo tráfego**
-   ser adequada para **equipes pequenas**

------------------------------------------------------------------------

## Cenários Arquiteturais Esperados

Forneça **três cenários distintos**:

### 1 --- Arquitetura Básica (Low Cost / Minimal)

Objetivo:

-   menor custo possível
-   simplicidade operacional
-   deploy rápido
-   adequada para MVP ou ambiente educacional

------------------------------------------------------------------------

### 2 --- Arquitetura Intermediária (Production Ready)

Objetivo:

-   maior confiabilidade
-   separação clara de camadas
-   capacidade de escalar moderadamente
-   práticas recomendadas de cloud

------------------------------------------------------------------------

### 3 --- Arquitetura Avançada (Cloud Native)

Objetivo:

-   escalabilidade
-   alta disponibilidade
-   desacoplamento de serviços
-   arquitetura preparada para crescimento

------------------------------------------------------------------------

## Estrutura de Resposta Esperada

Para **cada cenário arquitetural**, apresente:

------------------------------------------------------------------------

### 1. Visão Geral da Arquitetura

Explique:

-   objetivos
-   princípios arquiteturais
-   trade-offs

------------------------------------------------------------------------

### 2. Diagrama Arquitetural (C4 - Container Level)

Descreva o fluxo de componentes:

Cliente\
→ CDN\
→ Load Balancer\
→ Compute Layer\
→ Database\
→ Observability

------------------------------------------------------------------------

### 3. Serviços AWS Utilizados

Exemplos possíveis:

-   EC2
-   ECS
-   ECR
-   S3
-   CloudFront
-   RDS PostgreSQL
-   Application Load Balancer
-   CloudWatch
-   IAM
-   VPC

Use apenas serviços normalmente disponíveis no Learner Labs.

------------------------------------------------------------------------

### 4. Fluxo de Deploy

Explique o pipeline completo:

1.  build de containers
2.  push para registry
3.  provisionamento da infraestrutura
4.  deploy da aplicação

Integração esperada:

GitHub Actions\
Terraform\
AWS

------------------------------------------------------------------------

### 5. Estrutura Recomendada de Terraform

Forneça uma estrutura de diretórios como exemplo:

| monorepo
|  infra/
|    modules/
|    network/\
|    compute/\
|    database/\
|    registry/
|    environments/
|     dev/\
|     prod/

------------------------------------------------------------------------

### 6. Estratégia de Observabilidade

Descreva:

-   logs
-   métricas
-   alertas

Utilizando:

CloudWatch ou integração externa.

------------------------------------------------------------------------

### 7. Estratégia de Segurança

Considere:

-   IAM
-   isolamento de rede
-   gerenciamento de segredos
-   proteção de endpoints

------------------------------------------------------------------------

### 8. Estimativa de Custos

Forneça uma **estimativa mensal aproximada** com base em:

-   baixo tráfego
-   uma região AWS
-   ambiente educacional

Inclua custos de:

-   computação
-   banco de dados
-   armazenamento
-   transferência de dados

------------------------------------------------------------------------

### 9. Vantagens e Trade-offs

Inclua:

-   complexidade operacional
-   custo
-   escalabilidade
-   facilidade de manutenção

------------------------------------------------------------------------

## Comparação Entre Arquiteturas

Forneça uma tabela comparando:

  Arquitetura   Custo   Complexidade   Escalabilidade   Operação
  ------------- ------- -------------- ---------------- ----------

------------------------------------------------------------------------

## Plano de Evolução Incremental

Explique como evoluir entre arquiteturas:

Arquitetura Básica\
→ Intermediária\
→ Avançada

Inclua:

-   mudanças de serviços
-   migração de banco de dados
-   mudanças de CI/CD
-   impactos operacionais

------------------------------------------------------------------------

## Regras de Projeto

Priorize:

-   simplicidade
-   baixo custo
-   serviços gerenciados
-   infraestrutura reproduzível

Evite:

-   serviços desnecessários
-   arquiteturas excessivamente complexas
-   dependências externas não essenciais
```

- Analise o documento gerado.
- Registre a decisão arquitetural no documento gerado.
- Crie um plano de implementação no documento gerado.


## Faça o deploy na AWS


- Acesse o Google Antigravity.
- Acesse o painel Agent
- Acione a opção Start a new conversation.
- Priorize modelos com maior capacidade de processamento.
- Execute o seguinte comando:

```bash
Crie os artefatos para uma primeira versão de migração para AWS, prioritariamente baseada no cenário 2.

Ajustes

## Serviços AWS a serem mantidos

| Serviço | Uso |
|---------|-----|
| **ECS Fargate** | Orquestração de containers sem gerenciar EC2 |
| **ECR** | Registry de imagens Docker |
| **Secrets Manager** | Gerenciamento seguro de credenciais |
| **CloudWatch** | Logs, métricas, alarmes e dashboards |
| **IAM** | Roles e policies granulares por serviço |
| **VPC** | Isolamento com subnets públicas, privadas e de dados |
| **ALB** | Load balancer com roteamento por path, health checks |
| **RDS PostgreSQL t3.small** | Banco relacional Single-AZ |

## Serviços AWS que não devem ser usados nesta primeira versão

| **CloudFront** | CDN para assets estáticos e cache de páginas |
| **Route 53** | DNS com health checks |
| **ACM** | Certificados SSL/TLS gerenciados (auto-renovação) |



## Resultado
- Scripts Terraform
- Ajustes no Github Actions

## Restrição

Use sempre a role `LabRole`. Não criar novas roles.
Garanta que o RDS provisionado tenha uma versão de banco compatível com as versões disponíveis na região.
Use o AWS S3 com backend para controle de versões habilitado para gerenciar o estado no Terraform.
Garanta que o bucket do S3 de backend seja criado antes da execução do Terraform.
Garanta que o bucket do S3 de backend seja criado na região padrão para os demais recursos.
```

- Avalie o plano resultante e solicite os ajustes necessários.
- Execute o plano.





