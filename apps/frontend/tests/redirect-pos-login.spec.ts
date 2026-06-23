// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('9. Fluxo de Redirecionamento Pós-Login', () => {

  test('9.1 Redirecionamento para URL original após login', async ({ page }) => {
    // Estado inicial: Não autenticado
    await page.context().clearCookies();

    // 1. Navegar para /orders (rota protegida)
    await page.goto('/orders');

    // 2. Aguardar redirecionamento para /login
    await expect(page).toHaveURL(/.*\/login\?redirect=.*orders/);

    // 3. Preencher credenciais ADMIN
    await page.getByLabel('E-mail').fill(process.env.ADMIN_EMAIL!);
    await page.getByLabel('Senha', { exact: true }).fill(process.env.ADMIN_PASSWORD!);

    // 4. Clicar em "Entrar"
    await page.getByRole('button', { name: 'Entrar' }).click();

    // Resultado esperado:
    // - Redirecionar para /orders (não para /)
    await expect(page).toHaveURL(/\/orders/);

    // - Página de pedidos renderizada
    await expect(page.getByRole('heading', { name: /Meus Pedidos/i })).toBeVisible();
  });

});
