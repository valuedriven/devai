# Tarefas

## Criação de repositório:

- Acesse o GitHub.
- Acione o comando "New".
- Na página Create a new repository, preencha o campo Repository name.
- Para o campo Add README, selecione On.
- Acione o comando Create repository.
- Na página do projeto, acione o comando "Code".
- Copie o endereço do projeto.

## Instalação de skills

- A instalação de skills consiste, em geral, apenas em copiar o arquivo SKILL.md e complementos para o diretório .agent/skills/.
- Uma alternativa é utilizar o comando "Instale a skill disponível em <url>" no chat do agente.

## Configuração de MCP Server

- A configuração de MCP Server consiste em editar o arquivo .gemini/antigravity/mcp_config.json e adicionar as configurações necessárias.
- Uma alternativa é utilizar o comando "Instale o mcp server para o serviço <serviço>" no chat do agente. 

#### Configuração de autenticação com o Clerk

- Acesse o site do Clerk <https://clerk.com/>.
- No menu principal, selecione a seção Applications.
- Acione o comando New Application.
- Para o campo Application name, informe o nome do projeto.
- Acione o comando Create application.
- Na página Overview, navegue até o item Set your Clerk API keys.
- Copie o conteúdo das chaves disponibilizado.
- Retorne ao Antigravity.
- Crie um arquivo .env.local no repositório do projeto.
- Coloque as informações de credenciais no arquivo .env.local.  
- Solicite ao agente a configuração do clerk no projeto:

#### Obtenção das credenciais do usuário

- Faça o login no Supabase <https://supabase.com/>.
- No menu superior, canto superior direito, selecione o perfil do usuário.
- Selecione o item Account Preferences.
- Selecione o item Access Tokens.
- Acione o comando Generate new token.
- Copie o token criado.




### 2.4 Configuração de segurança com Clerk

#### Configuração de autenticação

- Acesse o site do Clerk <https://clerk.com/>.
- No menu principal, selecione a seção Applications.
- Acione o comando New Application.
- Para o campo Application name, informe o nome do projeto.
- Acione o comando Create application.
- Na página Overview, navegue até o item Set your Clerk API keys.
- Copie o conteúdo das chaves disponibilizado.
- Retorne ao Antigravity.
- Crie um arquivo .env.local no repositório do projeto.
- Coloque as informações de credenciais no arquivo .env.local.  
- Solicite ao agente a configuração do clerk no projeto:

```
Use a skill específica do Clerk para configurar a autenticação no projeto
```

- Verifique o plano de implementação e faça a aprovação.
- Após a conclusão, navegue na aplicação verifique se tanto o botão Login quanto o Finalizar compra apontam para a página de login.
- Caso ocorra algum erro, copie a mensagem de erro e cole no chat do agente para correção.
- Faça o registro e o login de um usuário.
- Acesse o Clerk.
- Selecione a aplicação.
- Selecione a opção Users.
- Verifique o usuário cadastrado no projeto.
- Faça o commit das modificações locais e o push para o repositório remoto no GitHub.


#### Configuração do Vercel para integração com Clerk

- Acesse a Vercel.
- Selecione o projeto.
- Selecione a opção Settings.
- Selecione a opção Environment variables.
- Adicione as variáveis de ambiente do Clerk.
- Acione o comando Redeploy.
- Acione o comando View Deployment.
- Acesse a aplicação publicada e faça o login.


#### Configuração de autorização

Ajustes na imlementação:
- Solicite ao agente a configuração do controle das páginas protegidas do administrador:

```
Configure o controle das páginas protegidas do administrador no projeto de forma que as páginas sensíveis sejam vistas apenas por um usuário administrador logado
```

- Verifique o plano de implementação e faça a aprovação.

Ajustes na configuração do Clerk:
- Acesse o projeto no Clerk.
- Selecione a aplicação.
- Selecione a opção Configure.
- Selecione a opção Sessions.
- Na página Sessions, selecione a opção Customize session token.
- Para o campo Claims, informe o valor a seguir:

```json
{
    "metadata": "{{user.public_metadata}}"
}
```
- Salve as alterações.
- Selecione a opção Users.
- Selecine o usuário cadastrado.
- Navegue até a seção Metadata.
- Para o item Public, acione o comando Edit.
- Inclua a seguinte informação:

```json
{
    "role": "admin"
}
```

- Salve as alterações.
- Faça um novo login na aplicação e verifique se as páginas protegidas do administrador sejam vistas apenas por um usuário administrador logado.
- Faça o commit das modificações locais e o push para o repositório remoto no GitHub.
- Verifique se o deploy foi realizado com sucesso e se as alterações foram aplicadas na solução implantada.


#### Sincronização entre usuário e cliente

- Selecione o painel Agent.
- Abra uma nova conversa.
- Solicite que seja configurada a sincronização entre o usuário autenticado no Clerk e cliente no Supabase:

```
Ajuste a aplicação de forma que, caso um usuário logado não esteja cadastrado, seja criado um registro na tabela de customers, para permitir efetivar a compra.
```
- Retorne a aplicação, faça cadastro como usuário comum faça uma nova compra.
- Verifique se o cliente foi criado no Supabase.
- Faça o commit das modificações locais e o push para o repositório remoto no GitHub.
- Verifique a aplicação publicada.



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