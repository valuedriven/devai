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


