# Setup ambiente Opensource AI


## Criação de contas em providers

Os provedores a seguir possue free tiers de modelos. Para alguns deles, é necessário adquirir créditos, para outros, não.

Crie contas em alguns dos providers abaixo e obtenha as chaves de acesso:
- Ollama Cloud: https://ollama.com/
- Openrouter: https://openrouter.ai/
- Agentrouter: https://agentrouter.org/
- Groq: https://groq.com/
- Opencode Zen: https://opencode.ai/br/zen
- Opencode Go: https://opencode.ai/br/go
- Alibaba: https://modelstudio.alibabacloud.com/
- Nvidia: https://build.nvidia.com/

---

## Configuração do Omniroute

Instale o Omniroute, conforme orientações disponíveis em:
https://github.com/diegosouzapw/OmniRoute

- Usuários do Windows com dificuldades na instalação padrão via npm, podem tentar a instalação via Docker: 
   
```bash
docker run -d --name omniroute --restart unless-stopped --stop-timeout 40 \
  -p 20128:20128 -v omniroute-data:/app/data diegosouzapw/omniroute:latest
```

- A partir da linha de comando, execute o Omniroute:

```bash
omniroute
```

- Acesse o dashboard:

```
http://localhost:20128/
```

- No menu lateral esquerdo, acesse a opção API Key Manager.
- Acione o comando Create API key.
- Copie o valor para um lugar seguro. Ela será usada para  configuração do Opencode.
- No menu lateral esquerdo, acesse a opção Providers.
- Configure as conexões com os providers definidos anteriormente.
- No menu lateral esquerdo, acesse a opção Compression Settings.
- Selecione a opção Stacked.

---

## Configuração do Opencode

- Instale o VSCode, conforme orientações disponíveis em: https://code.visualstudio.com/

(Alternativamente, o Opencode também pode ser instalado como extensão do Antigravity)

- Acesse o VSCode.
- No menu lateral esquerdo, selecione a opção Extensions.
- Na barra de busca, informe opencode.
- Acione o comando Install.
- Abra a extensão.
- Na área de prompt, acione o comando:

```
/connect
```

- Na janela Connect a provider, informe omniroute.
- Informe a API key do Omniroute obtida anteriormente.
- Na área de prompt, acione o comando:

```
/models
```

- Na lista apresentada, selecione seu modelo de preferência. Atente para selecionar modelos do provier Omniroute.
- Algumas sugestões de bons grupos de modelo disponíveis (priorize as versões mais recentes e gratuitas):
  - Deepseek;
  - Qwen;
  - MiniMax;
  - Kimi;
  - GLM;

---

## Configuração do agente

- Para configuração dos MCP servers no Opencode, crie ou abra o arquivo opencode.json no diretório raiz do projeto com o conteúdo a seguir:

```json
{
  "mcp": {
      "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "playwright-test": {
      "type": "local",
      "command": [
        "npx",
        "playwright",
        "run-test-mcp-server"
      ],
      "enabled": true
    },
    "stitch": {
      "type": "remote",
      "url": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "$STITCH_API_KEY"
      }
    },
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "enabled": true,
      "oauth": false,
      "headers": {
        "CONTEXT7_API_KEY": "$CONTEXT7_API_KEY"
      }
    }
  }
}
```

Certifique-se de que as variáveis de ambiente estejam corretamente configuradas no arquivo .env.


Para utilização de skills e outros recursos, o Opencode suporta as informações disponveis no diretório `.agents`

Pronto. Seu agente está configurado para uso.

---


