# Plano de Testes E2E — Autenticação com Clerk

## Configuração dos Testes

### Pré-condições Globais

- Ambiente `dev` rodando (backend em `localhost:3001`, frontend em `localhost:3000`)
- Variáveis de ambiente configuradas: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Clerk Dashboard com provedor **Email + Password** habilitado
- `@clerk/testing` instalado como dependência de desenvolvimento

### Setup Inicial (Global)

Usar `clerkSetup()` em `global.setup.ts` para gerar o Testing Token no início da suíte. Persistir estado autenticado via `storageState` para testes que não exigem limpeza de sessão.

### Boas Práticas

- Chamar `setupClerkTestingToken({ page })` **antes** de navegar para páginas de auth em cada teste com estado limpo
- Usar `storageState` com sessão ADMIN pré-autenticada para testes que não testam login
- Usar `test.use({ storageState: { cookies: [], origins: [] } })` para testes que exigem estado não autenticado
- Não usar chaves de produção — apenas `pk_test_*` e `sk_test_*`

---

## 1. Fluxo de Login

### 1.1 Login com credenciais válidas (ADMIN)

**Estado inicial:** Não autenticado

**Passos:**
1. Chamar `setupClerkTestingToken({ page })`
2. Navegar para `/login`
3. Preencher campo "E-mail" com `ADMIN_EMAIL`
4. Preencher campo "Senha" com `ADMIN_PASSWORD`
5. Clicar no botão "Entrar"

**Resultado esperado:**
- Redirecionar para `/` (página inicial)
- `user-dropdown-container` visível
- Nenhum erro exibido

**Critério de sucesso:** URL muda para `/` e dropdown do usuário aparece.

---

### 1.2 Login com credenciais válidas (CUSTOMER)

**Estado inicial:** Não autenticado

**Passos:**
1. Chamar `setupClerkTestingToken({ page })`
2. Criar ou usar usuário CUSTOMER existente via API (`POST /api/v1/auth/register`)
3. Navegar para `/login`
4. Preencher e-mail e senha do CUSTOMER
5. Clicar em "Entrar"

**Resultado esperado:**
- Redirecionar para `/`
- Menu lateral exibe apenas opções CUSTOMER (Meus Pedidos, Perfil)
- Menu ADMIN **não** aparece

**Critério de sucesso:** Login bem-sucedido com menu restrito ao papel CUSTOMER.

---

### 1.3 Login com e-mail inválido

**Estado inicial:** Não autenticado

**Passos:**
1. Chamar `setupClerkTestingToken({ page })`
2. Navegar para `/login`
3. Preencher "E-mail" com `inexistente@email.com`
4. Preencher "Senha" com `qualquer123`
5. Clicar em "Entrar"

**Resultado esperado:**
- Permanecer em `/login`
- Elemento `[data-testid="login-error"]` visível com mensagem de erro
- Nenhum cookie de sessão criado

**Critério de sucesso:** Erro exibido sem redirecionamento.

---

### 1.4 Login com senha incorreta

**Estado inicial:** Não autenticado

**Passos:**
1. Chamar `setupClerkTestingToken({ page })`
2. Navegar para `/login`
3. Preencher "E-mail" com `ADMIN_EMAIL`
4. Preencher "Senha" com `senha_errada_123`
5. Clicar em "Entrar"

**Resultado esperado:**
- Permanecer em `/login`
- Elemento `[data-testid="login-error"]` visível
- Nenhum cookie de sessão criado

**Critério de sucesso:** Erro exibido sem redirecionamento.

---

### 1.5 Login com campos vazios

**Estado inicial:** Não autenticado

**Passos:**
1. Navegar para `/login`
2. Clicar em "Entrar" sem preencher campos

**Resultado esperado:**
- Validação HTML5 impede submissão ou exibe erro de campo obrigatório
- Permanecer em `/login`
- `[data-testid="login-error"]` visível (se backend retornar erro de validação)

**Critério de sucesso:** Formulário rejeita submissão vazia.

---

### 1.6 Login com e-mail mal formatado

**Estado inicial:** Não autenticado

**Passos:**
1. Navegar para `/login`
2. Preencher "E-mail" com `email-invalido`
3. Preencher "Senha" com `qualquer123`
4. Clicar em "Entrar"

**Resultado esperado:**
- Validação de formato de e-mail (frontend ou backend) rejeita
- Permanecer em `/login`

**Critério de sucesso:** E-mail inválido rejeitado.

---

## 2. Fluxo de Registro

### 2.1 Registro bem-sucedido

**Estado inicial:** Não autenticado

**Passos:**
1. Chamar `setupClerkTestingToken({ page })`
2. Gerar e-mail único (`test-{timestamp}-{rand}@devai-test.com`)
3. Navegar para `/register`
4. Preencher "E-mail" com e-mail gerado
5. Preencher "Senha" com senha válida (mín. 8 caracteres, maiúscula, número)
6. Preencher "Confirmar Senha" com mesma senha
7. Preencher "Nome" com "Test"
8. Preencher "Sobrenome" com "User"
9. Clicar em "Cadastrar"

**Resultado esperado:**
- Redirecionar para `/`
- `user-dropdown-container` visível
- Usuário autenticado com papel `CUSTOMER` (padrão)

**Critério de sucesso:** Registro cria conta e autentica automaticamente.

---

### 2.2 Registro com e-mail duplicado

**Estado inicial:** Não autenticado

**Passos:**
1. Chamar `setupClerkTestingToken({ page })`
2. Navegar para `/register`
3. Preencher com e-mail já cadastrado (`ADMIN_EMAIL`)
4. Preencher senha e confirmação
5. Preencher nome/sobrenome
6. Clicar em "Cadastrar"

**Resultado esperado:**
- Permanecer em `/register`
- Mensagem de erro exibida (e-mail já cadastrado)
- Código HTTP 409 retornado pelo backend

**Critério de sucesso:** E-mail duplicado rejeitado.

---

### 2.3 Registro com senha fraca

**Estado inicial:** Não autenticado

**Passos:**
1. Chamar `setupClerkTestingToken({ page })`
2. Navegar para `/register`
3. Preencher com e-mail válido e senha `123`
4. Preencher confirmação e nome/sobrenome
5. Clicar em "Cadastrar"

**Resultado esperado:**
- Permanecer em `/register`
- Mensagem de erro sobre política de senha
- Código HTTP 422 retornado pelo backend

**Critério de sucesso:** Senha fraca rejeitada.

---

### 2.4 Registro com senhas divergentes

**Estado inicial:** Não autenticado

**Passos:**
1. Navegar para `/register`
2. Preencher todos os campos
3. Preencher "Senha" com `Senha123!` e "Confirmar Senha" com `OutraSenha456@`
4. Clicar em "Cadastrar"

**Resultado esperado:**
- Permanecer em `/register`
- Mensagem de erro "As senhas não coincidem" exibida
- Requisição **não** é enviada ao backend

**Critério de sucesso:** Validação frontend impede senhas diferentes.

---

## 3. Fluxo de Logout

### 3.1 Logout bem-sucedido

**Estado inicial:** Autenticado (usar `storageState` do global setup)

**Passos:**
1. Navegar para `/`
2. Clicar no botão "Sair da Loja" no sidebar
3. Aguardar navegação
4. Recarregar a página

**Resultado esperado:**
- Sessão encerrada
- Link de login visível na navegação
- `user-dropdown-container` não visível
- Cookie de sessão removido
- Backend revoga sessão no Clerk

**Critério de sucesso:** Logout limpa sessão frontend e backend.

---

### 3.2 Logout sem sessão ativa

**Estado inicial:** Não autenticado

**Passos:**
1. Navegar para `/`
2. Verificar que botão de logout não está visível

**Resultado esperado:**
- Botão "Sair da Loja" ausente
- Link para `/login` visível

**Critério de sucesso:** Usuário não autenticado não vê opção de logout.

---

## 4. Rotas Protegidas

### 4.1 Acesso a rota protegida sem autenticação

**Estado inicial:** Não autenticado

**Passos:**
1. Navegar diretamente para `/orders`
2. Aguardar carregamento

**Resultado esperado:**
- Redirecionar para `/login`
- URL original preservada para redirect pós-login

**Critério de sucesso:** Rota protegida redireciona para login.

---

### 4.2 Acesso a rota admin sem autenticação

**Estado inicial:** Não autenticado

**Passos:**
1. Navegar diretamente para `/admin`
2. Aguardar carregamento

**Resultado esperado:**
- Redirecionar para `/login`

**Critério de sucesso:** Rota admin redireciona não autenticados para login.

---

### 4.3 Acesso a rota admin com papel CUSTOMER

**Estado inicial:** Autenticado como CUSTOMER

**Passos:**
1. Realizar login como usuário CUSTOMER
2. Navegar para `/admin/products`

**Resultado esperado:**
- Página 403 Forbidden exibida
- **Não** redireciona para login (usuário já está autenticado)
- Mensagem de acesso negado visível

**Critério de sucesso:** CUSTOMER barrado em rota ADMIN com 403.

---

### 4.4 Acesso a rota admin com papel ADMIN

**Estado inicial:** Autenticado como ADMIN (`storageState` do global setup)

**Passos:**
1. Navegar para `/admin/products`
2. Aguardar carregamento

**Resultado esperado:**
- Página admin renderizada normalmente
- Sidebar com opções ADMIN visíveis

**Critério de sucesso:** ADMIN acessa rota admin sem restrições.

---

### 4.5 Acesso a rota de pedidos autenticado

**Estado inicial:** Autenticado como CUSTOMER

**Passos:**
1. Realizar login como CUSTOMER
2. Navegar para `/orders`
3. Aguardar carregamento

**Resultado esperado:**
- Página de pedidos renderizada
- Lista de pedidos (vazia ou com dados) exibida

**Critério de sucesso:** Rota protegida acessível após autenticação.

---

## 5. Visibilidade Baseada em Papel (UI)

### 5.1 Menu ADMIN visível para ADMIN

**Estado inicial:** Autenticado como ADMIN (`storageState`)

**Passos:**
1. Navegar para `/`
2. Verificar sidebar

**Resultado esperado:**
- Itens visíveis: Produtos, Categorias, Clientes, Pedidos, Dashboard
- Links apontam para `/admin/*`

**Critério de sucesso:** Menu ADMIN completo visível.

---

### 5.2 Menu ADMIN oculto para CUSTOMER

**Estado inicial:** Autenticado como CUSTOMER

**Passos:**
1. Realizar login como CUSTOMER
2. Verificar sidebar

**Resultado esperado:**
- Itens CUSTOMER visíveis: Meus Pedidos, Perfil
- Itens ADMIN **não** visíveis
- Link de admin ausente

**Critério de sucesso:** CUSTOMER não vê opções ADMIN.

---

### 5.3 Menu não autenticado

**Estado inicial:** Não autenticado

**Passos:**
1. Navegar para `/`
2. Verificar navegação

**Resultado esperado:**
- Link para login visível
- Itens ADMIN ausentes
- Itens CUSTOMER ausentes
- Vitrine/loja visível

**Critério de sucesso:** Usuário não autenticado vê apenas navegação pública.

---

## 6. Endpoint `GET /v1/auth/me`

### 6.1 Perfil do usuário autenticado

**Estado inicial:** Autenticado

**Passos:**
1. Fazer requisição `GET /api/v1/auth/me` com cookie de sessão

**Resultado esperado:**
- Status 200
- Body contém: `id`, `email`, `firstName`, `lastName`, `roles`, `imageUrl`

**Critério de sucesso:** Perfil retornado com todos os campos.

---

### 6.2 Perfil sem autenticação

**Estado inicial:** Não autenticado

**Passos:**
1. Fazer requisição `GET /api/v1/auth/me` sem cookie

**Resultado esperado:**
- Status 401

**Critério de sucesso:** Requisição não autenticada rejeitada.

---

## 7. Validação de Token (Backend)

### 7.1 Token expirado

**Estado inicial:** Não autenticado

**Passos:**
1. Gerar JWT expirado manualmente
2. Fazer requisição para endpoint protegido com `Authorization: Bearer <token_expirado>`

**Resultado esperado:**
- Status 401
- Mensagem: "Token expirado" ou similar

**Critério de sucesso:** Token expirado rejeitado.

---

### 7.2 Token inválido/mal formatado

**Estado inicial:** Não autenticado

**Passos:**
1. Fazer requisição para endpoint protegido com `Authorization: Bearer token_invalido`

**Resultado esperado:**
- Status 401
- Requisição não processada

**Critério de sucesso:** Token inválido rejeitado.

---

### 7.3 Token ausente

**Estado inicial:** Não autenticado

**Passos:**
1. Fazer requisição para endpoint protegido sem header `Authorization`

**Resultado esperado:**
- Status 401

**Critério de sucesso:** Ausência de token rejeitada.

---

## 8. Endpoints Públicos

### 8.1 Acesso público a catálogo

**Estado inicial:** Não autenticado

**Passos:**
1. Fazer requisição `GET /api/v1/products`

**Resultado esperado:**
- Status 200
- Lista de produtos retornada

**Critério de sucesso:** Catálogo acessível sem autenticação.

---

### 8.2 Acesso público com token válido

**Estado inicial:** Autenticado

**Passos:**
1. Fazer requisição `GET /api/v1/products` com token válido

**Resultado esperado:**
- Status 200
- Lista de produtos retornada (sem restrição adicional)

**Critério de sucesso:** Catálogo acessível mesmo autenticado.

---

## 9. Fluxo de Redirecionamento Pós-Login

### 9.1 Redirecionamento para URL original após login

**Estado inicial:** Não autenticado

**Passos:**
1. Navegar para `/orders` (rota protegida)
2. Aguardar redirecionamento para `/login`
3. Preencher credenciais ADMIN
4. Clicar em "Entrar"

**Resultado esperado:**
- Redirecionar para `/orders` (não para `/`)
- Página de pedidos renderizada

**Critério de sucesso:** Usuário retorna à rota original após login.

---

## 10. Regressão — Outros Fluxos

### 10.1 Fluxo completo: adicionar ao carrinho → login → confirmar pedido

**Estado inicial:** Não autenticado

**Passos:**
1. Chamar `setupClerkTestingToken({ page })`
2. Navegar para `/`
3. Clicar "Adicionar ao Carrinho" no primeiro produto
4. Clicar no ícone do carrinho
5. Clicar "Faça login para confirmar"
6. Preencher credenciais ADMIN
7. Clicar "Entrar"
8. Verificar badge do carrinho com valor "1"
9. Clicar "Confirmar Pedido"
10. Clicar "Ver Meus Pedidos"
11. Clicar "Ver Detalhes" no primeiro pedido

**Resultado esperado:**
- Carrinho persiste após login
- Pedido criado com sucesso
- Detalhes do pedido visíveis

**Critério de sucesso:** Fluxo completo funciona — carrinho sobrevive ao login.

---

## 11. Sessões Múltiplas

### 11.1 Login em aba diferente

**Estado inicial:** Não autenticado

**Passos:**
1. Abrir duas abas com `/login`
2. Fazer login na primeira aba
3. Recarregar a segunda aba

**Resultado esperado:**
- Segunda aba também autenticada (cookie compartilhado)
- `user-dropdown-container` visível em ambas

**Critério de sucesso:** Sessão compartilhada entre abas.

---

## Resumo dos Cenários

| # | Cenário | Tipo | Prioridade |
|---|---------|------|------------|
| 1.1 | Login ADMIN válido | Happy Path | Crítica |
| 1.2 | Login CUSTOMER válido | Happy Path | Alta |
| 1.3 | E-mail inválido | Failure Path | Alta |
| 1.4 | Senha incorreta | Failure Path | Alta |
| 1.5 | Campos vazios | Failure Path | Média |
| 1.6 | E-mail mal formatado | Failure Path | Média |
| 2.1 | Registro bem-sucedido | Happy Path | Alta |
| 2.2 | E-mail duplicado | Failure Path | Alta |
| 2.3 | Senha fraca | Failure Path | Média |
| 2.4 | Senhas divergentes | Failure Path | Média |
| 3.1 | Logout bem-sucedido | Happy Path | Crítica |
| 3.2 | Logout sem sessão | Edge Case | Média |
| 4.1 | Rota protegida sem auth | Failure Path | Crítica |
| 4.2 | Rota admin sem auth | Failure Path | Crítica |
| 4.3 | Rota admin como CUSTOMER | Failure Path | Alta |
| 4.4 | Rota admin como ADMIN | Happy Path | Alta |
| 4.5 | Rota protegida autenticado | Happy Path | Alta |
| 5.1 | Menu ADMIN visível | Happy Path | Alta |
| 5.2 | Menu ADMIN oculto CUSTOMER | Happy Path | Alta |
| 5.3 | Menu não autenticado | Happy Path | Baixa |
| 6.1 | GET /me autenticado | Happy Path | Alta |
| 6.2 | GET /me sem auth | Failure Path | Alta |
| 7.1 | Token expirado | Failure Path | Alta |
| 7.2 | Token inválido | Failure Path | Alta |
| 7.3 | Token ausente | Failure Path | Alta |
| 8.1 | Catálogo público | Happy Path | Alta |
| 8.2 | Catálogo com token | Happy Path | Baixa |
| 9.1 | Redirect pós-login | Happy Path | Alta |
| 10.1 | Fluxo completo carrinho | Happy Path | Crítica |
| 11.1 | Sessão múltiplas abas | Edge Case | Baixa |
