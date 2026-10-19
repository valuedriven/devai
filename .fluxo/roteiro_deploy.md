# Roteiro de Implantação

Quarta etapa do fluxo, executada depois do [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md). Ela cobre o **provisionamento por código**, a criação dos recursos remotos e a publicação do MVP nas plataformas gerenciadas declaradas na seção 5 dos [Requisitos da Solução](https://github.com/valuedriven/devai/blob/main/.fluxo/requisitos_solucao.md) — e termina com a infraestrutura como código integrada ao pipeline de CI/CD.

| Escopo | Resultado |
| :---- | :---- |
| Entra | Terraform no repositório, recursos remotos criados, aplicação publicada, pipeline estendido com `plan` e `apply` |
| Não entra | Observabilidade e indicadores do ciclo, que estão no [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md); migração para a AWS, no [Roteiro de Migração para a AWS](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_migracao_aws.md) |

A sequência pressupõe o pipeline da seção 9 do Roteiro de Entrega já configurado: é a ele que esta etapa acrescenta o destino de publicação e as etapas de infraestrutura.

> As plataformas aqui são as da stack de referência: Vercel para a hospedagem, Supabase para o banco e Clerk para a identidade. Escolhida outra combinação na arquitetura, substitua os passos pelos equivalentes e mantenha o resultado: ambiente provisionado por código, banco remoto com migrações aplicadas, identidade configurada para o domínio de produção, aplicação publicada e nenhuma credencial versionada.

---

## 1. Pré-requisitos

| Pré-requisito | Onde é atendido |
| :---- | :---- |
| Pipeline de CI/CD configurado, com os testes automatizados e a branch principal protegida | [Roteiro de Entrega](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_delivery.md), seção 9 |
| Terraform instalado | [catálogo de ferramentas](https://github.com/valuedriven/devai/blob/main/.fluxo/ferramentas.md) |

Contas nas plataformas da stack:

* [Vercel](https://vercel.com/)
* [Supabase](https://www.supabase.com/)
* [Clerk](https://clerk.com/)

Certifique-se de estar autenticado nas três antes de prosseguir.

---

## 2. Credenciais no `.env`

O arquivo `.env` e sua entrada no `.gitignore` foram criados na seção 2 do [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md), e a seção 3 do Roteiro de Entrega lhe acrescentou as variáveis da aplicação. Acrescente agora as credenciais das plataformas, obtendo cada valor no endereço indicado:

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

## 3. Provisionamento por código

O provisionamento começa pelo recurso mais simples: a hospedagem da aplicação. O objetivo não é cobrir toda a infraestrutura, e sim instalar o hábito — a partir daqui, alteração de ambiente passa por commit e revisão, como qualquer outra mudança.

Trate este item como uma mudança do OpenSpec, seguindo o ciclo da seção 7 do Roteiro de Entrega.

* Crie o diretório `infra/` no repositório.
* Inicie uma nova sessão do agente e execute:

```text
/opsx-propose infra-hospedagem

Contexto: @docs/architecture.md, @AGENTS.md, @.env.example

Requisitos:
- Diretório infra/ com configuração Terraform para o provider de hospedagem definido
  em docs/architecture.md.
- Recurso de projeto da plataforma ligado ao repositório do GitHub.
- Variáveis de ambiente da aplicação declaradas como recursos, com os valores vindos
  de variáveis do Terraform, nunca escritos nos arquivos de configuração.
- Arquivo de variáveis de exemplo versionado, sem valores.
- Arquivo de estado e arquivos locais do Terraform declarados no .gitignore.
- README curto em infra/ com a sequência de comandos.
```

* Execute o ciclo, sempre lendo o plano antes de aplicar:

```bash
cd infra
terraform init
terraform plan
terraform apply
```

> O arquivo de estado contém dados sensíveis e não vai para o controle de versão. O comando `terraform destroy` remove recursos de verdade: o plano é lido antes de qualquer aplicação.

> **Atenção ao vocabulário:** *provider* no Terraform designa um plugin de infraestrutura. Não guarda relação com os *providers de modelos de IA* configurados no [Roteiro de Configuração do Ambiente](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_environment.md).

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

## 5. Publicação da aplicação

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

## 6. Infraestrutura como código no pipeline

Até aqui o `terraform apply` foi executado à mão. Esta seção o move para o pipeline, de modo que alteração de ambiente siga o mesmo caminho de alteração de código: proposta, revisão, verificação e aplicação automática.

Trate este item como uma mudança do OpenSpec.

* Execute:

```text
/opsx-propose pipeline-iac

Contexto: @docs/architecture.md, @AGENTS.md, @.github/workflows/, @infra/

Requisitos:
- Estado do Terraform movido para backend remoto, com bloqueio de concorrência.
- Workflow de entrega estendido com as etapas de infraestrutura, na ordem:
  terraform fmt -check, terraform validate, terraform plan e terraform apply.
- O plano executa em toda proposta de mudança e tem o resultado publicado na própria
  proposta; o apply executa apenas na branch principal.
- O apply fica atrás do ambiente protegido declarado na seção 9 do Roteiro de Entrega,
  exigindo aprovação manual.
- Credenciais da plataforma como secrets do repositório, preferindo federação de
  identidade (OIDC) a chaves de longa duração.
- Etapa de publicação da aplicação apontada para o projeto provisionado.
- Testes de aceite executados contra o ambiente publicado, após a publicação.
```

* Abra uma proposta de mudança qualquer na infraestrutura e confirme que o plano aparece nela antes de qualquer aplicação.

> O `plan` na proposta é o que torna a revisão de infraestrutura possível: sem ele, aprova-se um diff de arquivos `.tf` sem saber que recursos serão criados, alterados ou destruídos. E `apply` sem aprovação manual transforma um merge distraído em alteração de produção.

> Segredo de plataforma em variável de workflow, e não em secret, vaza no log da execução. Federação de identidade elimina a chave de longa duração, que é o segredo mais difícil de rotacionar.

---

## 7. Verificação da implantação

* [ ] Credenciais das plataformas no `.env`, com as chaves replicadas no `.env.example`
* [ ] Nenhuma credencial versionada, nem no repositório nem no estado do Terraform
* [ ] Estado do Terraform em backend remoto, com bloqueio de concorrência
* [ ] `terraform plan` sem divergências após o `apply`
* [ ] Banco remoto criado, com as migrações aplicadas
* [ ] Identidade configurada para o domínio de produção
* [ ] Aplicação publicada, com as variáveis separadas por ambiente
* [ ] Domínio de produção nas origens permitidas do backend
* [ ] Dois fluxos de negócio ponta a ponta percorríveis na aplicação publicada
* [ ] Pipeline executando `plan` em cada proposta e `apply` apenas na branch principal, atrás de aprovação
* [ ] Testes de aceite executando contra o ambiente publicado

Concluída a implantação, a etapa seguinte é o [Roteiro de Evolução](https://github.com/valuedriven/devai/blob/main/.fluxo/roteiro_evolucao.md).
