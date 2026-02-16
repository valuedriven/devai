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

