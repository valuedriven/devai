# Roteiro de Implantação

Roteiro complementar ao [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md). Ele cobre a criação dos recursos remotos e a publicação do MVP em **plataformas gerenciadas**: Vercel para a hospedagem, Supabase para o banco e Clerk para a identidade.

Execute-o ao chegar na seção 9 do Roteiro de Entrega, em **Banco, identidade e hospedagem em ambiente remoto**, e retorne para a observabilidade, o pipeline e os indicadores.

> Esta é uma combinação de plataformas, não a única. Se a arquitetura do projeto escolheu outras, substitua os passos pelos equivalentes e mantenha o resultado: banco remoto com migrações aplicadas, identidade configurada para o domínio de produção, aplicação publicada e nenhuma credencial versionada. A migração para a versão final na AWS está no [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md).

---

## 1. Contas

* [Vercel](https://vercel.com/)
* [Supabase](https://www.supabase.com/)
* [Clerk](https://clerk.com/)

Certifique-se de estar autenticado nas três antes de prosseguir.

---

## 2. Credenciais no `.env`

O arquivo `.env` e sua entrada no `.gitignore` foram criados na seção 3 do Roteiro de Entrega. Acrescente a ele as credenciais destas plataformas, obtendo cada valor no endereço indicado:

```bash
# Vercel
# https://vercel.com/account/settings/tokens
# Seção Create token, comando Create
VERCEL_API_TOKEN=

# Supabase
# https://supabase.com/dashboard/account/tokens
# Seção Classic Tokens, comando Generate new token
SUPABASE_ACCESS_TOKEN=
# [deixar os itens a seguir em branco inicialmente]
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
DIRECT_URL=

# Clerk
# https://dashboard.clerk.com/apps/
# Seção Applications, comando Create application
# Selecionar a aplicação criada, menu Configure, seção API Keys, comando Quick copy
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
# Seção API Keys, item JWKS Public Key (usar aspas duplas para envolver o conteúdo)
CLERK_JWT_KEY=
```

* Replique as chaves, sem os valores, no `.env.example` versionado.
* Confirme que `.env` está no `.gitignore` antes de preencher qualquer valor.

---

## 3. Provisionamento da hospedagem com Terraform

A seção 6 do Roteiro de Entrega provisiona a hospedagem do frontend por código. Estes são os requisitos específicos da Vercel para aquele prompt:

```text
- Diretório infra/ com configuração Terraform para o provider da Vercel.
- Recurso de projeto da Vercel ligado ao repositório do GitHub.
- Variáveis de ambiente da aplicação declaradas como recursos, com os valores vindos
  de variáveis do Terraform, nunca escritos nos arquivos de configuração.
- Arquivo de variáveis de exemplo versionado, sem valores.
- Arquivo de estado e arquivos locais do Terraform declarados no .gitignore.
```

> O arquivo de estado contém dados sensíveis e não vai para o controle de versão. O comando `terraform destroy` remove recursos de verdade: o plano é lido antes de qualquer aplicação.

---

## 4. Banco de dados e identidade em ambiente remoto

Trate este item como uma mudança do OpenSpec, seguindo o ciclo da seção 7 do Roteiro de Entrega.

* Inicie uma nova sessão do agente.
* Execute:

```text
/opsx-propose infra-mvp-remoto

Contexto: @docs/architecture.md (visão de implantação), @AGENTS.md

Requisitos:
- Projeto criado no Supabase, com as migrações aplicadas a partir do esquema do projeto.
- Variáveis NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, DATABASE_URL e
  DIRECT_URL preenchidas no .env e documentadas no .env.example.
- Aplicação do Clerk configurada para o domínio de produção, com os perfis de usuário
  previstos na especificação.
- Nenhuma credencial versionada no repositório.
```

* Confirme que a aplicação local consegue conversar com o banco remoto antes de prosseguir.

> Não avance com o banco remoto respondendo pela metade. Publicar sobre um banco cuja migração falhou produz um erro de implantação que parece de hospedagem, e o diagnóstico custa mais do que a verificação.

---

## 5. Publicação do frontend

* Execute:

```text
/opsx-propose deploy-vercel

Contexto: @docs/architecture.md, @AGENTS.md

Requisitos:
- Projeto na Vercel vinculado ao repositório, com build do monorepo configurado.
- Variáveis de ambiente cadastradas no projeto da Vercel, separadas por ambiente.
- Backend publicado de forma acessível ao frontend, com a URL refletida em
  NEXT_PUBLIC_API_URL.
- Domínio de produção registrado no Clerk e nas origens permitidas (CORS) do backend.
```

* Verifique a aplicação publicada percorrendo os dois fluxos de negócio ponta a ponta no navegador.

---

## 6. Verificação da implantação

* [ ] Credenciais das três plataformas no `.env`, com as chaves replicadas no `.env.example`
* [ ] Nenhuma credencial versionada, nem no repositório nem no estado do Terraform
* [ ] Projeto do Supabase criado, com as migrações aplicadas
* [ ] Aplicação do Clerk configurada para o domínio de produção
* [ ] Projeto da Vercel vinculado ao repositório, com as variáveis separadas por ambiente
* [ ] `NEXT_PUBLIC_API_URL` apontando para o backend publicado
* [ ] Domínio de produção nas origens permitidas do backend
* [ ] Dois fluxos de negócio ponta a ponta percorríveis na aplicação publicada

Concluída a implantação, retome o Roteiro de Entrega na seção 9, em **Observabilidade**.
