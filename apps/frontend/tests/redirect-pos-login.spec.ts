// spec: openspec/changes/change-03-auth-security/test-plan.md
import { test, expect } from '@playwright/test';

test.describe('9. Fluxo de Redirecionamento Pós-Login', () => {

  test('9.1 Redirecionamento para URL original após login', async ({ page }) => {
    // Estado inicial: Não autenticado
    await page.context().clearCookies();

    // 1. Navegar diretamente para uma rota protegida
    await page.goto('/orders');
    // Limpar o localStorage que veio do storageState do playwright
    await page.evaluate(() => localStorage.clear());
    // Recarregar a página para aplicar a limpeza
    await page.reload();

    // 2. Aguardar redirecionamento para /login
    await expect(page).toHaveURL(/.*\/login\?redirect=.*orders/);

    // 3. Preencher credenciais CUSTOMER
    await page.getByLabel(/e-?mail/i).fill(process.env.CUSTOMER_EMAIL!);
    await page.getByLabel(/senha/i).fill(process.env.CUSTOMER_PASSWORD!);

    // 4. Clicar em "Entrar"
    await page.getByRole('button', { name: /entrar/i }).click();

    // Resultado esperado:
    // - Redirecionar para /orders (não para /)
    await expect(page).toHaveURL(/.*\/orders$/);

    // - Página de pedidos renderizada
    console.log('Current URL:', page.url());
    console.log('Page Content:', await page.content());
    await expect(page.getByRole('heading', { name: /Meus Pedidos/i })).toBeVisible();
  });

});
