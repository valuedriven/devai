// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from './fixtures/baseTest';

test.describe('9. Fluxo de Redirecionamento Pós-Login', () => {

  test('9.1 Redirecionamento para URL original após login', async ({ page, loginPage }) => {
    // Estado inicial: Não autenticado
    await page.context().clearCookies();
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // 1. Navegar diretamente para uma rota protegida
    await page.goto('/orders');

    // 2. Aguardar redirecionamento para /login
    await expect(page).toHaveURL(/.*\/login\?redirect=.*orders/);
    await expect(loginPage.emailInput).toBeVisible();

    // 3. Preencher credenciais CUSTOMER e entrar
    await loginPage.login(
      process.env.CUSTOMER_EMAIL || 'jps012009@yahoo.com.br',
      process.env.CUSTOMER_PASSWORD || 'jps012009@yahoo.com.br'
    );

    // Resultado esperado:
    // - Redirecionar para /orders (não para /)
    await expect(page).toHaveURL(/^(?!.*login).*\/orders$/);

    // - Página de pedidos renderizada
    await expect(page.getByRole('heading', { name: /Meus Pedidos/i })).toBeVisible();
  });

});
