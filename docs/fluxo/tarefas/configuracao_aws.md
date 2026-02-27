# Configuração para interação com AWS

## Configuração de variáveis de ambiente

Para interagir com a AWS, é necessário configurar as seguintes variáveis de ambiente:

```bash
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export AWS_DEFAULT_REGION=us-east-1
```

## Configuração de MCP servers

Configurar MCP servers para interagir com a AWS.

```json
{
  "mcpServers": {
    "awsiac": {
      "command": "npx",
      "args": [
        "-y",
        "awslabs.aws-iac-mcp-server@latest"
      ]
    },
    "awsknowledge": {
      "serverUrl": "https://knowledge-mcp.global.api.aws"
    },
    "awspricing": {
      "command": "npx",
      "disabled": false,
      "args": [
        "-y",
        "awslabs.aws-pricing-mcp-server@latest"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      }
    }
  }
}
```

- Testar a configuração
  
## Configuração de skills

- Criar o diretório "deploy-aws" em ".agent/skills/".
- Copiar o arquivo https://github.com/awslabs/agent-plugins/blob/main/plugins/deploy-on-aws/skills/deploy/SKILL.md para o diretório criado.
- Criar o diretório "references" em ".agent/skills/deploy-aws".
- Copiar os arquivos de https://github.com/awslabs/agent-plugins/tree/main/plugins/deploy-on-aws/skills/deploy/references para o diretório criado.

## Test

