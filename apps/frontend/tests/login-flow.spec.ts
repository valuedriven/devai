// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('1. Fluxo de Login', () => {

  test.beforeEach(async ({ page }) => {
    // Clear cookies and local storage before each test
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('1.1 Login com credenciais válidas (ADMIN)', async ({ page }) => {
    // 2. Navegar para /login
    await page.goto('/login');

    // 3. Preencher campo "E-mail" com ADMIN_EMAIL
    await page.getByLabel(/e-?mail/i).fill(process.env.ADMIN_EMAIL!);

    // 4. Preencher campo "Senha" com ADMIN_PASSWORD
    await page.getByLabel(/senha/i).fill(process.env.ADMIN_PASSWORD!);

    // 5. Clicar no botão "Entrar"
    await page.getByRole('button', { name: /entrar/i }).click();

    // Resultado esperado:
    // - Redirecionar para /
    await expect(page).toHaveURL('/');
    
    // - user-dropdown-container visível
    await expect(page.getByTestId('user-dropdown-container')).toBeVisible();
    
    // - Nenhum erro exibido
    await expect(page.getByTestId('login-error')).toBeHidden();
  });

  test('1.2 Login com credenciais válidas (CUSTOMER)', async ({ page }) => {
    await page.context().clearCookies();

    // 3. Navegar para /login
    await page.goto('/login');

    // 4. Preencher e-mail e senha do CUSTOMER
    await page.getByLabel(/e-?mail/i).fill(process.env.CUSTOMER_EMAIL!);
    await page.getByLabel(/senha/i).fill(process.env.CUSTOMER_PASSWORD!);

    // 5. Clicar em "Entrar"
    await page.getByRole('button', { name: /entrar/i }).click();

    // Resultado esperado:
    // - Redirecionar para /
    await expect(page).toHaveURL('/');

    // - Menu lateral exibe apenas opções CUSTOMER
    // Check desktop sidebar
    const sidebar = page.locator('.sidebar-desktop');
    await expect(sidebar.getByText(/meus pedidos/i)).toBeVisible();
    // - Menu ADMIN não aparece
    await expect(sidebar.getByText(/administração/i)).toBeHidden();
    await expect(sidebar.getByText(/dashboard/i)).toBeHidden();
  });

  test('1.3 Login com e-mail inválido', async ({ page }) => {
    await page.context().clearCookies();

    // 2. Navegar para /login
    await page.goto('/login');

    // 3. Preencher "E-mail" com inexistente@email.com
    await page.getByLabel(/e-?mail/i).fill('inexistente@email.com');

    // 4. Preencher "Senha" com qualquer123
    await page.getByLabel(/senha/i).fill('qualquer123');

    // 5. Clicar em "Entrar"
    await page.getByRole('button', { name: /entrar/i }).click();

    // Resultado esperado:
    // - Permanecer em /login
    await expect(page).toHaveURL(/\/login/);
    
    // - Elemento [data-testid="login-error"] visível com mensagem de erro
    await expect(page.getByTestId('login-error')).toBeVisible();
    // Check if error is specifically about failure
    await expect(page.getByTestId('login-error')).toContainText(/falha|inválido|invalid/i);
  });

  test('1.4 Login com senha incorreta', async ({ page }) => {
    await page.context().clearCookies();

    // 2. Navegar para /login
    await page.goto('/login');

    // 3. Preencher "E-mail" com ADMIN_EMAIL
    await page.getByLabel(/e-?mail/i).fill(process.env.ADMIN_EMAIL!);

    // 4. Preencher "Senha" com senha_errada_123
    await page.getByLabel(/senha/i).fill('senha_errada_123');

    // 5. Clicar em "Entrar"
    await page.getByRole('button', { name: /entrar/i }).click();

    // Resultado esperado:
    // - Permanecer em /login
    await expect(page).toHaveURL(/\/login/);
    
    // - Elemento [data-testid="login-error"] visível
    await expect(page.getByTestId('login-error')).toBeVisible();
  });

  test('1.5 Login com campos vazios', async ({ page }) => {
    await page.context().clearCookies();

    // 1. Navegar para /login
    await page.goto('/login');

    // 2. Clicar em "Entrar" sem preencher campos
    await page.getByRole('button', { name: /entrar/i }).click();

    // Resultado esperado:
    // - Validação HTML5 impede submissão
    const emailInput = page.getByLabel(/e-?mail/i);
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isEmailInvalid).toBeTruthy();

    // - Permanecer em /login
    await expect(page).toHaveURL(/\/login/);
  });

  test('1.6 Login com e-mail mal formatado', async ({ page }) => {
    await page.context().clearCookies();

    // 1. Navegar para /login
    await page.goto('/login');

    // 2. Preencher "E-mail" com email-invalido
    await page.getByLabel(/e-?mail/i).fill('email-invalido');

    // 3. Preencher "Senha" com qualquer123
    await page.getByLabel(/senha/i).fill('qualquer123');

    // 4. Clicar em "Entrar"
    await page.getByRole('button', { name: /entrar/i }).click();

    // Resultado esperado:
    // - Validação HTML5 impede submissão
    const emailInput = page.getByLabel(/e-?mail/i);
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isEmailInvalid).toBeTruthy();

    // - Permanecer em /login
    await expect(page).toHaveURL(/\/login/);
  });

});
