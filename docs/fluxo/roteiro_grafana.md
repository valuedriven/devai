## 2.5 Configuração de observabilidade com Grafana Cloud

- Acesse o Grafana Cloud.
- Faça o login.
- No menu superior, canto superior direito, selecione o perfil do usuário.
- Selecione o item Account Preferences.
- Selecione o item Access Tokens.
- Acione o comando Generate new token.
- Copie o token criado.
- Selecione a organização configurada.
- Acione o comando Add Stack.
- Para Stack Identifier, informe o nome do projeto.
- Acione o comando Add Stack.
- Aguarde a configuração do stack.
- Na página Manage Stack: <projeto>, acione o comando Detais, no card Grafana.
- Na seção Instance Details, acione o link do campo Url (https://<projeto>.grafana.net)
- Na página Grafana, menu lateral esquerdo, selecione o Observability.
- No card Frontend, acione o comando Open.
- Na página Frontend Observability, acione o comando Create New.
- Para Application name, informe o nome do projeto.
- Para o tópico Domains, informe os domínios:
  - https://<projeto>.vercel.app
  - https://localhost:3000
- Acione o comando Next.
- Navegue até a seção Add Faro to your application.
- Copie o código fornecido para o campo Url.
- Acione o comando Continue (2x).
- Acione o comando Complete.

- Acesse o Antigravity.
- Edite o arquivo .env.local, preenchendo os seguintes valores:

```
#Grafana Faro
NEXT_PUBLIC_FARO_URL=<Faro URL>
NEXT_PUBLIC_FARO_APP_NAME=<projeto>
GRAFANA_URL=https://<stack>.grafana.net
GRAFANA_ACCESS_POLICY_TOKEN=

```
- Solicite a configuração do Grafana:

```
Configure o Grafana para realizar a observabilidade do frontend
```