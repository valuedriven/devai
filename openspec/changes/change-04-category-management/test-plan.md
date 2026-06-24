# Plano de Testes E2E — Fluxo de Login com Clerk

**Projeto:** Category Management (change-04)  
**Dependência:** Change-03 Auth & Security  
**Browser:** Chromium (Playwright)

---

## 1. Escopo e Objetivos

| Item | Descrição |
|------|-----------|
| **Objetivo** | Validar o fluxo de autenticação via Clerk BFF API |
| **Abrangência** | Login, logout, sessões, redirecionamentos, edge cases, performance |
| **Browser** | Chromium (Playwright) |
| **Ambiente** | `dev` (localhost:3000/3001) |

---

## 2. Configuração dos Testes

### 2.1 Pré-condições
- Servidores frontend (`localhost:3000`) e backend (`localhost:3001`) rodando
- Clerk configurado com provedor **Email + Password**
- Variáveis de ambiente em `.env`:
  - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
  - `CUSTOMER_EMAIL`, `CUSTOMER_PASSWORD`

### 2.2 Infraestrutura Existente
| Arquivo | Função |
|---------|--------|
| `auth.setup.ts` | Autentica ADMIN/CUSTOMER, persiste `storageState` |
| `server.setup.ts` | Verifica disponibilidade dos servidores |
| `playwright.config.ts` | Projeto chromium com setup dependencies |

---

## 3. Suite de Testes

### Suite 1: Login com Credenciais Válidas
| ID | Cenário | Prioridade | Tipo |
|----|---------|------------|------|
| 1.1 | Login ADMIN → redirect para `/` | Crítica | Happy Path |
| 1.2 | Login CUSTOMER → redirect para `/` | Crítica | Happy Path |
| 1.3 | Login estabelece sessão HttpOnly | Crítica | Happy Path |

### Suite 2: Login com Credenciais Inválidas
| ID | Cenário | Prioridade | Tipo |
|----|---------|------------|------|
| 2.1 | E-mail inexistente → erro displayed | Alta | Failure Path |
| 2.2 | Senha incorreta → erro displayed | Alta | Failure Path |
| 2.3 | E-mail mal formatado → validação HTML5 | Média | Edge Case |
| 2.4 | Campos vazios → validação nativa | Média | Edge Case |
| 2.5 | SQL Injection attempts → rejeitado | Alta | Security |

### Suite 3: Logout e Reautenticação
| ID | Cenário | Prioridade | Tipo |
|----|---------|------------|------|
| 3.1 | Logout limpa sessão e cookies | Crítica | Happy Path |
| 3.2 | Re-login após logout funciona | Crítica | Happy Path |
| 3.3 | Session invalidada após logout | Alta | Happy Path |

### Suite 4: Estado da Sessão
| ID | Cenário | Prioridade | Tipo |
|----|---------|------------|------|
| 4.1 | Sessão persiste entre páginas | Alta | Happy Path |
| 4.2 | Sessão persiste após reload | Alta | Happy Path |
| 4.3 | Usuário já logado → redirect para `/` | Média | Edge Case |
| 4.4 | Cookies HttpOnly configurados corretamente | Alta | Security |

### Suite 5: Redirecionamento Pós-Login
| ID | Cenário | Prioridade | Tipo |
|----|---------|------------|------|
| 5.1 | Rota protegida → login → redirect para URL original | Crítica | Happy Path |
| 5.2 | Admin route → login → redirect para `/admin` | Alta | Happy Path |
| 5.3 | Query param redirect malicioso → fallback para `/` | Baixa | Edge Case |
| 5.4 | Redirect com query string preserved | Média | Happy Path |

### Suite 6: Acesso Direto à API
| ID | Cenário | Prioridade | Tipo |
|----|---------|------------|------|
| 6.1 | GET /v1/auth/me autenticado → 200 OK | Alta | Happy Path |
| 6.2 | GET /v1/auth/me sem auth → 401 Unauthorized | Alta | Failure Path |
| 6.3 | POST /v1/auth/login válido → 200 OK | Alta | Happy Path |
| 6.4 | POST /v1/auth/login inválido → 401 Unauthorized | Alta | Failure Path |
| 6.5 | POST /v1/auth/logout autenticado → 204 No Content | Alta | Happy Path |
| 6.6 | POST /v1/auth/logout sem auth → 401 Unauthorized | Alta | Failure Path |

### Suite 7: Performance e Resiliência
| ID | Cenário | Prioridade | Tipo |
|----|---------|------------|------|
| 7.1 | Tempo de resposta login < 3s | Alta | Performance |
| 7.2 | Login em condições de rede lenta (3G) | Média | Performance |
| 7.3 | Timeout configurado corretamente | Alta | Security |

---

## 4. Casos de Teste Detalhados

### Caso 1.1: Login ADMIN com credenciais válidas
```
Pré-condição: Estado limpo (sem cookies/sessão)

Passos:
  1. page.context().clearCookies()
  2. await page.goto('/login')
  3. await page.getByLabel(/e-?mail/i).fill(ADMIN_EMAIL)
  4. await page.getByLabel(/senha/i).fill(ADMIN_PASSWORD)
  5. await page.getByRole('button', { name: /entrar/i }).click()
  6. await expect(page).toHaveURL('/')

Resultado esperado:
  ✅ URL: /
  ✅ Cookie HttpOnly presente
  ✅ [data-testid="user-dropdown-container"] visível
  ✅ Menu ADMIN no sidebar
```

### Caso 1.2: Login CUSTOMER com credenciais válidas
```
Pré-condição: Estado limpo (sem cookies/sessão)

Passos:
  1. page.context().clearCookies()
  2. await page.goto('/login')
  3. Preencher com CUSTOMER_EMAIL e CUSTOMER_PASSWORD
  4. Clicar em "Entrar"

Resultado esperado:
  ✅ Redirect para /
  ✅ user-dropdown-container visível
  ✅ Menu CUSTOMER no sidebar (sem itens admin)
```

### Caso 1.3: Login estabelece sessão HttpOnly
```
Pré-condição: Estado limpo

Passos:
  1. Realizar login com credenciais válidas
  2. Aguardar redirect completo
  3. Obter cookies: page.context().cookies()

Resultado esperado:
  ✅ Pelo menos um cookie de sessão presente
  ✅ httpOnly: true em cookies de sessão
  ✅ Cookies persistem após reload
```

### Caso 2.1: Login com e-mail inexistente
```
Pré-condição: Estado limpo

Passos:
  1. page.context().clearCookies()
  2. await page.goto('/login')
  3. Preencher email: "naoexiste@nonexistent12345.com"
  4. Preencher senha: "qualquer123"
  5. Clicar em "Entrar"

Resultado esperado:
  ✅ Permanece em /login
  ✅ [data-testid="login-error"] visível
  ✅ Sem redirect, sem cookies criados
```

### Caso 2.2: Login com senha incorreta
```
Pré-condição: Estado limpo

Passos:
  1. page.context().clearCookies()
  2. await page.goto('/login')
  3. Preencher com email válido e senha incorreta
  4. Clicar em "Entrar"

Resultado esperado:
  ✅ [data-testid="login-error"] visível
  ✅ Mensagem contém "credenciais" ou "senha" ou "inválido"
  ✅ Sem sessão criada
```

### Caso 2.3: Login com e-mail mal formatado
```
Pré-condição: Estado limpo

Passos:
  1. page.context().clearCookies()
  2. await page.goto('/login')
  3. Preencher email: "email-invalido"
  4. Clicar em "Entrar"

Resultado esperado:
  ✅ Validação HTML5 impede submissão
  ✅ Campo email marcado como invalid
  ✅ Permanece em /login
```

### Caso 2.4: Login com campos vazios
```
Pré-condição: Estado limpo

Passos:
  1. page.context().clearCookies()
  2. await page.goto('/login')
  3. Clicar em "Entrar" sem preencher

Resultado esperado:
  ✅ Validação nativa impede submissão
  ✅ Campos obrigatórios destacados
  ✅ Permanece em /login
```

### Caso 2.5: Tentativa de SQL Injection
```
Pré-condição: Estado limpo

Passos:
  1. Preencher email: "' OR '1'='1"
  2. Preencher senha: "'; DROP TABLE users;--"
  3. Submeter formulário

Resultado esperado:
  ✅ Input rejeitado ou sanitizado pelo backend
  ✅ Erro genérico exibido (sem stack trace)
  ✅ Sem comprometimento do sistema
  ✅ Sessão não criada
```

### Caso 3.1: Logout limpa sessão corretamente
```
Pré-condição: Sessão ADMIN ativa

Passos:
  1. Clicar no botão de logout (user-dropdown-menu)
  2. Aguardar processamento

Resultado esperado:
  ✅ Redirect para /
  ✅ user-dropdown-container NÃO visível
  ✅ Cookies de sessão removidos
  ✅ Tentar acessar /admin → redirect para /login
```

### Caso 3.2: Re-login após logout funciona
```
Pré-condição: Sessão anterior foi limpa via logout

Passos:
  1. Limpar cookies (confirmar estado não autenticado)
  2. Navegar para /login
  3. Realizar login com credenciais ADMIN

Resultado esperado:
  ✅ Login bem-sucedido
  ✅ Nova sessão criada
  ✅ Acesso a rotas protegidas restaurado
```

### Caso 3.3: Session invalidada após logout
```
Pré-condição: Logout recém executado

Passos:
  1. Tentar usar session token anterior (se preservado)
  2. Fazer request para endpoint autenticado

Resultado esperado:
  ✅ 401 Unauthorized retornado
  ✅ Sessão anterior completamente invalidada
```

### Caso 4.1: Sessão persiste entre páginas
```
Pré-condição: Sessão ADMIN ativa

Passos:
  1. Navegar para /
  2. Navegar para /products
  3. Navegar para /admin/categories

Resultado esperado:
  ✅ Sessão mantida em todas as páginas
  ✅ Não pede login novamente
  ✅ Cookies presentes em todas as requisições
```

### Caso 4.2: Sessão persiste após reload
```
Pré-condição: Sessão ativa

Passos:
  1. Navegar para /admin
  2. Recarregar página: page.reload()
  3. Verificar estado de autenticação

Resultado esperado:
  ✅ Sessão mantida após reload
  ✅ Não redireciona para /login
```

### Caso 4.3: Usuário já logado acessa /login
```
Pré-condição: Sessão ADMIN ativa

Passos:
  1. Navegar diretamente para /login

Resultado esperado:
  ✅ Redirect para /
  ✅ Não exibe formulário de login
```

### Caso 4.4: Cookies HttpOnly configurados corretamente
```
Pré-condição: Sessão ADMIN ativa

Passos:
  1. Realizar login
  2. Obter todos os cookies: page.context().cookies()
  3. Verificar propriedades de cada cookie

Resultado esperado:
  ✅ httpOnly: true em cookies de sessão
  ✅ secure: true (em produção/HTTPS)
  ✅ sameSite configurado (strict ou lax)
```

### Caso 5.1: Redirecionamento para URL original
```
Pré-condição: Estado limpo, usuário não autenticado

Passos:
  1. Limpar cookies e localStorage
  2. await page.goto('/orders')
  3. Aguardar redirect para /login
  4. Verificar URL contém redirect=orders
  5. Preencher credenciais CUSTOMER
  6. Clicar em "Entrar"

Resultado esperado:
  ✅ Redirect para /orders (não /)
  ✅ Heading "Meus Pedidos" visível
```

### Caso 5.2: Admin route com redirect
```
Pré-condição: Estado limpo

Passos:
  1. Navegar para /admin/products
  2. Verificar redirect para /login
  3. Fazer login com ADMIN
  4. Aguardar redirect

Resultado esperado:
  ✅ Redirect para /admin/products
  ✅ Página admin renderizada
```

### Caso 5.3: Redirect malicioso
```
Pré-condição: Estado limpo

Passos:
  1. Navegar para /login?redirect=http://malicious.com
  2. Fazer login com credenciais válidas

Resultado esperado:
  ✅ Redirect para / ou área protegida
  ✅ Não executa redirect para domínio externo
```

### Caso 5.4: Redirect com query string
```
Pré-condição: Estado limpo

Passos:
  1. Navegar para /login?redirect=/orders?filter=active
  2. Fazer login

Resultado esperado:
  ✅ Query string completa preservada
  ✅ Redirect para /orders?filter=active
```

### Caso 6.1: GET /v1/auth/me autenticado
```
Pré-condição: Sessão ativa

Passos:
  1. Fazer fetch para /api/v1/auth/me com cookie de sessão

Resultado esperado:
  ✅ Status: 200
  ✅ Body contém: id, email, firstName, lastName, roles
```

### Caso 6.2: GET /v1/auth/me sem autenticação
```
Pré-condição: Estado limpo

Passos:
  1. fetch('http://localhost:3001/api/v1/auth/me')

Resultado esperado:
  ✅ Status: 401 Unauthorized
  ✅ Sem exposição de dados sensíveis
```

### Caso 6.3: POST /v1/auth/login válido
```
Pré-condição: Estado limpo

Passos:
  1. POST para /api/v1/auth/login com credenciais válidas

Resultado esperado:
  ✅ Status: 200
  ✅ Cookie de sessão configurado
  ✅ Body com dados do usuário
```

### Caso 6.4: POST /v1/auth/login inválido
```
Pré-condição: Estado limpo

Passos:
  1. POST para /api/v1/auth/login com credenciais inválidas

Resultado esperado:
  ✅ Status: 401 Unauthorized
  ✅ Sem cookies de sessão criados
```

### Caso 6.5: POST /v1/auth/logout autenticado
```
Pré-condição: Sessão ativa

Passos:
  1. POST para /api/v1/auth/logout

Resultado esperado:
  ✅ Status: 204 No Content
  ✅ Cookie de sessão removido
```

### Caso 6.6: POST /v1/auth/logout sem auth
```
Pré-condição: Estado limpo

Passos:
  1. POST para /api/v1/auth/logout

Resultado esperado:
  ✅ Status: 401 Unauthorized
```

### Caso 7.1: Login completa em < 3s
```
Pré-condição: Estado limpo

Passos:
  1. const start = performance.now()
  2. await page.goto('/login')
  3. Preencher credenciais e submit
  4. await expect(page).toHaveURL('/')
  5. const duration = performance.now() - start

Resultado esperado:
  ✅ duration < 3000ms
```

### Caso 7.2: Login em rede lenta (3G)
```
Pré-condição: Estado limpo

Passos:
  1. Habilitar throttling "Slow 3G"
  2. Realizar login completo

Resultado esperado:
  ✅ Login completa (pode demorar mais)
  ✅ Loading state visível
  ✅ Timeout não excedido (30s)
```

### Caso 7.3: Timeout configurado corretamente
```
Pré-condição: Estado limpo

Passos:
  1. Desabilitar rede: page.route('**', route => route.abort())
  2. Tentar login
  3. Aguardar timeout

Resultado esperado:
  ✅ Timeout após período configurado
  ✅ Mensagem de erro amigável exibida
```

---

## 5. Estrutura dos Arquivos de Teste

```
apps/frontend/tests/
├── auth.setup.ts                    ✅ existente
├── server.setup.ts                  ✅ existente
├── login-flow.spec.ts               📝 atualizar (Suite 1, 2)
├── login-sessions.spec.ts           🆕 NOVO (Suite 3, 4)
├── login-redirects.spec.ts          🆕 NOVO (Suite 5)
├── login-api.spec.ts                🆕 NOVO (Suite 6)
├── login-performance.spec.ts        🆕 NOVO (Suite 7)
├── logout-flow.spec.ts              ✅ existente
├── rotas-protegidas.spec.ts         ✅ existente
└── category-management.spec.ts      ✅ existente
```

---

## 6. Spec Coverage

| Spec Requirement | Test Case(s) |
|-----------------|--------------|
| **auth-ui/spec.md** | |
| Render login form (1.1) | 1.1, 1.2, 2.x |
| Successful login redirect (1.2) | 1.1, 1.2, 5.1, 5.2 |
| Login error display (1.3) | 2.1, 2.2, 2.5 |
| Protected route access (2.x) | 5.1, 5.2 |
| Role-based route access (3.x) | 1.1, 1.2 |
| **auth-api/spec.md** | |
| Successful login (1.1) | 1.1, 1.2, 6.3 |
| Invalid credentials (1.2) | 2.1, 2.2, 6.4 |
| GET /me authenticated (3.1) | 6.1 |
| GET /me unauthenticated (3.2) | 6.2 |
| Logout (4.1, 4.2) | 3.1, 3.3, 6.5, 6.6 |

---

## 7. Critérios de Aceitação

- [ ] Suite 1 (Crítica): 100% passando
- [ ] Suite 6 (API): 100% passando
- [ ] Performance login < 3s
- [ ] Zero vulnerabilidades SQL Injection
- [ ] Cookies com flags HttpOnly/Secure
- [ ] Redirecionamento preserva URL original

---

## 8. Estimativa de Execução

| Fase | Testes | Duração |
|------|--------|---------|
| Setup | globalSetup + auth.setup | 2 min |
| Suite 1-2 | Login flow | 5 min |
| Suite 3-4 | Sessions | 5 min |
| Suite 5 | Redirects | 3 min |
| Suite 6 | API endpoints | 5 min |
| Suite 7 | Performance | 5 min |
| **Total** | ~28 test cases | ~25 min |