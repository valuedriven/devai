# Configuração para interação com AWS

## Pré-requisitos: Instalação do `uv`

Os servidores MCP da AWS são baseados em Python e requerem o gerenciador de pacotes `uv`. Instale-o com o comando abaixo:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Após a instalação, reinicie o terminal ou execute `source $HOME/.cargo/env` para garantir que o comando `uv` esteja disponível.

## Configuração de variáveis de ambiente

Para interagir com a AWS, é necessário configurar as seguintes variáveis de ambiente:

```bash
export AWS_ACCESS_KEY_ID=[colocar a chave de acesso]
export AWS_SECRET_ACCESS_KEY=[colocar a chave secreta]
export AWS_SESSION_TOKEN=[colocar o token de sessão]
export AWS_DEFAULT_REGION=[colocar a região]
```

## Configuração de MCP servers

Configure os MCP servers no seu cliente (ex: Cursor ou Claude Desktop) usando os comandos abaixo. 


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



## Faça o deploy na AWS

- Execute o seguinte comando:
```bash
Faça o deploy do projeto na aws. Utilize apenas serviços disponíveis no AWS Learner Lab.
```
